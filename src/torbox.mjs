import {parseTorrentTitle} from '@viren070/parse-torrent-title';
import {BoundedCache} from './cache.mjs';
import {normaliseTitle} from '../vendor/aiostreams-parser.mjs';
const HASH = /^[a-f0-9]{40}$/i;

export class TorBoxError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class TorBox {
  constructor({ apiKey, fetchImpl = fetch, baseUrl = 'https://api.torbox.app/v1/api' }) {
    if (!apiKey) throw new Error('A TorBox API key is required');
    this.apiKey = apiKey;
    this.fetch = fetchImpl;
    this.baseUrl = baseUrl;
    this.owned = null;
    this.ownedAt = 0;
    this.inflight = new Map();
    this.availability=new BoundedCache({maxEntries:2048,maxWeight:3*1024*1024});
    this.negativeAvailability=new BoundedCache({maxEntries:8192,maxWeight:512*1024});
    this.availabilityPending=new Map();
  }

  async request(path, { method = 'GET', body, query = {}, timeoutMs = 30000 } = {}) {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
    let response;
    try {
      response = await this.fetch(url, {
        method,
        headers: { Authorization: `Bearer ${this.apiKey}`, 'User-Agent': 'TorBoxDirect/0.4', ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'error',
      });
    } catch {
      throw new TorBoxError('TORBOX_UNREACHABLE', 'TorBox could not be reached');
    }
    let data;
    try { data = await response.json(); } catch {
      throw new TorBoxError('TORBOX_INVALID_RESPONSE', 'TorBox returned a non-JSON response');
    }
    if (!response.ok || data.success !== true) {
      const code = typeof data.error === 'string' && /^[A-Z0-9_]+$/.test(data.error) ? data.error : 'TORBOX_ERROR';
      throw new TorBoxError(code, `TorBox rejected the request (${code})`, response.status === 429 ? 429 : 502);
    }
    return data.data;
  }

  async account() { return this.request('/user/me', { query: { settings: false } }); }

  async checkCached(hashes,{fresh=false}={}) {
    hashes = [...new Set(hashes.map(h => String(h).toLowerCase()))];
    if (hashes.some(h => !HASH.test(h))) throw new TorBoxError('BAD_HASH', 'Invalid torrent hash', 400);
    const found=new Map(),missing=[],waiting=[];
    for(const hash of hashes){
      const hit=fresh?undefined:this.availability.get(hash)??this.negativeAvailability.get(hash);
      if(hit!==undefined){if(hit)found.set(hash,hit);continue;}
      const pending=fresh?undefined:this.availabilityPending.get(hash);
      if(pending)waiting.push({hash,pending});else missing.push(hash);
    }
    if(missing.length){
      const batch=this._requestCached(missing).then(({found,checked})=>{
        for(const hash of checked){
          const item=found.get(hash)||null;
          const weight=item?512+(item.files||[]).reduce((sum,file)=>sum+256+2*((file.name||'').length+(file.short_name||'').length),0):64;
          if(item){this.availability.set(hash,item,{ttl:45000,weight});this.negativeAvailability.delete(hash);}
          else{this.availability.delete(hash);this.negativeAvailability.set(hash,null,{ttl:8000,weight});}
        }
        return found;
      });
      for(const hash of missing){
        const pending=batch.then(result=>result.get(hash));
        if(!fresh){
          this.availabilityPending.set(hash,pending);
          const clear=()=>{if(this.availabilityPending.get(hash)===pending)this.availabilityPending.delete(hash);};
          pending.then(clear,clear);
        }
        waiting.push({hash,pending});
      }
    }
    const results=await Promise.allSettled(waiting.map(async({hash,pending})=>({hash,item:await pending})));
    let failure,succeeded=hashes.length-waiting.length;
    for(const result of results){
      if(result.status==='fulfilled'){succeeded++;if(result.value.item)found.set(result.value.hash,result.value.item);}
      else{if(['BAD_TOKEN','AUTH_ERROR','NO_AUTH'].includes(result.reason.code))throw result.reason;failure=result.reason;}
    }
    if(failure&&!succeeded)throw failure;
    return found;
  }

  async _requestCached(hashes) {
    const found = new Map();
    const checked=new Set();
    // TorBox's POST endpoint supports large hash arrays. Batch size is a
    // transport boundary, never a candidate cap; every hash is checked.
    const batchSize=4096;
    const chunks=[];for(let offset=0;offset<hashes.length;offset+=batchSize)chunks.push(hashes.slice(offset,offset+batchSize));
    let succeeded=0,failure;
    for(let offset=0;offset<chunks.length;offset+=2){
      const results=await Promise.allSettled(chunks.slice(offset,offset+2).map(async chunk=>({chunk,data:await this.request('/torrents/checkcached',{method:'POST',body:{hashes:chunk},query:{format:'object',list_files:true},timeoutMs:12000})})));
      for(const result of results){
        if(result.status==='rejected'){
          if(['BAD_TOKEN','AUTH_ERROR','NO_AUTH'].includes(result.reason.code))throw result.reason;
          failure=result.reason;continue;
        }
        succeeded++;const {chunk,data}=result.value;for(const hash of chunk)checked.add(hash);
        const requested=new Set(chunk);
        for (const [key, item] of Object.entries(data || {})) {
          const hash = (item?.hash || key).toLowerCase();
          if (requested.has(hash) && item && typeof item === 'object' && Array.isArray(item.files) && item.files.length) found.set(hash, item);
        }
      }
    }
    if(failure&&!succeeded)throw failure;
    return {found,checked};
  }

  async listOwned({ fresh = false } = {}) {
    if (!fresh && this.owned && Date.now() - this.ownedAt < 60000) return this.owned;
    const items = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await this.request('/torrents/mylist', { query: { limit: 1000, offset, bypass_cache: fresh } });
      if (!Array.isArray(page)) throw new TorBoxError('TORBOX_INVALID_LIST', 'TorBox returned an invalid account list');
      items.push(...page);
      if (page.length < 1000) break;
    }
    this.owned = items;
    this.ownedAt = Date.now();
    return items;
  }

  async ensureOwned(hash) {
    if (!HASH.test(hash)) throw new TorBoxError('BAD_HASH', 'Invalid torrent hash', 400);
    hash = hash.toLowerCase();
    if (this.inflight.has(hash)) return this.inflight.get(hash);
    const pending = this._ensureOwned(hash).finally(() => this.inflight.delete(hash));
    this.inflight.set(hash, pending);
    return pending;
  }

  async _ensureOwned(hash) {
    // Recheck at playback time. A stale positive search result must never start a download.
    if (!(await this.checkCached([hash],{fresh:true})).has(hash)) throw new TorBoxError('NO_LONGER_CACHED', 'This release is no longer cached on TorBox', 409);
    const existing = (await this.listOwned()).find(t => t.hash?.toLowerCase() === hash);
    if (existing) return existing;
    const form = new FormData();
    form.set('magnet', `magnet:?xt=urn:btih:${hash}`);
    form.set('add_only_if_cached', 'true');
    form.set('seed', '3');
    form.set('allow_zip', 'false');
    let result;
    try {result = await this.request('/torrents/createtorrent', { method: 'POST', body: form });}
    catch(error){
      if(error.code!=='DUPLICATE_ITEM')throw error;
      const appeared=(await this.listOwned({fresh:true})).find(t=>t.hash?.toLowerCase()===hash);
      if(!appeared)throw error;
      return appeared;
    }
    const id = result?.torrent_id;
    if (!Number.isInteger(id)) throw new TorBoxError('TORBOX_INVALID_ITEM', 'TorBox did not return an account item ID');
    const item = await this.request('/torrents/mylist', { query: { id, bypass_cache: true } });
    if (item?.hash?.toLowerCase() !== hash) throw new TorBoxError('TORBOX_ITEM_MISMATCH', 'TorBox returned a different account item');
    this.owned = null;
    return item;
  }

  async playback(hash, chosenFile) {
    const item = await this.ensureOwned(hash);
    const file = (item.files || []).find(f => (f.short_name || f.name) === (chosenFile.short_name || chosenFile.name) && Number(f.size) === Number(chosenFile.size));
    if (!file || !Number.isInteger(file.id)) throw new TorBoxError('FILE_NOT_FOUND', 'The selected file is no longer in this TorBox item', 409);
    const link = await this.request('/torrents/requestdl', { query: { token: this.apiKey, torrent_id: item.id, file_id: file.id, redirect: false } });
    let url;
    try { url = new URL(link); } catch { throw new TorBoxError('BAD_PLAYBACK_LINK', 'TorBox returned an invalid playback link'); }
    if (url.protocol !== 'https:' || !/(^|\.)tb-cdn\.(st|app)$/.test(url.hostname)) throw new TorBoxError('BAD_PLAYBACK_LINK', 'TorBox returned an unexpected playback host');
    return { url: url.href, torrentId: item.id, fileId: file.id };
  }
}

export function selectFile(files, { season, episode, title, anime, absoluteEpisode, folderName,parse=parseTorrentTitle } = {}) {
  const videos = files.filter(f => Number.isInteger(f.id) && /\.(mkv|mp4|m4v|avi|webm|mov|m2ts|ts)$/i.test(f.name || '') && !/(?:^|[ /\\._-])(sample|trailer|featurette)(?:[ /\\._-]|$)/i.test(f.name));
  if (season !== undefined && episode !== undefined) {
    const matched = videos.filter(f => {
      const name = f.name || '';
      const explicit = [...name.matchAll(/S(\d{1,2})E(\d{1,3})(?!\d)/gi)];
      if (explicit.length) return explicit.some(m => Number(m[1]) === season && Number(m[2]) === episode);
      const alternate = name.match(/(?:^|[^\d])(\d{1,2})x(\d{2,3})(?!\d)/i);
      if(alternate)return Number(alternate[1])===season&&Number(alternate[2])===episode;
      if(!anime||!Number.isInteger(absoluteEpisode))return false;
      const parsed=parse((f.short_name||name).split(/[\\/]/).pop());
      const folder=parse(folderName||'');
      if(folder.seasons?.length&&!folder.seasons.includes(season))return false;
      const target=folder.seasons?.length?episode:absoluteEpisode;
      return !parsed.seasons?.length&&parsed.episodes?.length===1&&parsed.episodes[0]===target;
    });
    return matched.sort((a,b) => b.size - a.size)[0] || null;
  }
  if(videos.length>1&&title){
    const specific=videos.filter(f=>normaliseTitle(parse(f.short_name||f.name.split(/[\\/]/).pop()).title||'')===normaliseTitle(title));
    return specific.sort((a,b)=>b.size-a.size)[0]||null;
  }
  return videos.sort((a,b) => b.size - a.size)[0] || null;
}
