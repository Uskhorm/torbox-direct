import {createHmac,timingSafeEqual} from 'node:crypto';
import {parseRequest,Catalog} from './catalog.mjs';
import {MetadataSeed} from './seed.mjs';
import {selectFile,TorBoxError} from './torbox.mjs';
import {parsedStream,filterAndSort,formatter,parseRelease} from './format.mjs';
import {HashDiscovery,normalizeTitle} from './discovery.mjs';
import {BoundedCache,memoizeParser} from './cache.mjs';
import {parseTorrentTitle} from '@viren070/parse-torrent-title';

export function publicSources(index,{fetchImpl=fetch}={}){
  return {seed:new MetadataSeed(index,{fetchImpl}),discovery:new HashDiscovery(index,{fetchImpl})};
}

function bindResult(result,publicBase){
  return {...result,streams:result.streams.map(stream=>({...stream,url:publicBase+'/play/'+stream.url.split('/play/')[1]}))};
}

export class DirectEngine {
  // libraryIndex holds this account's own TorBox items. Hosted mode gives every
  // configuration its own, so one account's library never reaches another's results.
  constructor({index,libraryIndex=index,torbox,userData,signingKey,fetchImpl=fetch,tmdbKey,sources}) {
    this.index=index;this.libraryIndex=libraryIndex;this.torbox=torbox;this.userData=userData;this.signingKey=signingKey;
    this.catalog=new Catalog(index,{fetchImpl,tmdbKey});
    this.seed=sources?.seed||new MetadataSeed(index,{fetchImpl});
    this.discovery=sources?.discovery||new HashDiscovery(index,{fetchImpl});
    this.cache=new BoundedCache({maxEntries:128,maxWeight:2*1024*1024});this.inflight=new Map();
    this.parseTitle=memoizeParser(parseRelease);
    this.parseCandidate=memoizeParser(parseTorrentTitle,{maxEntries:8192,maxWeight:2*1024*1024});
  }
  sign(payload) {
    const data=Buffer.from(JSON.stringify(payload)).toString('base64url');
    return data+'.'+createHmac('sha256',this.signingKey).update(data).digest('base64url');
  }
  verify(token) {
    const [data,signature,...rest]=token.split('.');
    if(!data||!signature||rest.length) throw new TorBoxError('INVALID_LINK','Invalid playback link',403);
    const expected=createHmac('sha256',this.signingKey).update(data).digest();
    const actual=Buffer.from(signature,'base64url');
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected)) throw new TorBoxError('INVALID_LINK','Invalid playback link',403);
    let payload;
    try{payload=JSON.parse(Buffer.from(data,'base64url'));}catch{throw new TorBoxError('INVALID_LINK','Invalid playback link',403);}
    if(payload.exp<Date.now()) throw new TorBoxError('EXPIRED_LINK','Reopen the stream list for a fresh link',410);
    return payload;
  }
  async search(type,id,publicBase) {
    const request=await this.catalog.resolve(parseRequest(type,id));const key=request.key;
    const previous=this.cache.get(key);
    if(previous)return bindResult({...previous,metrics:{...previous.metrics,totalMs:0,cache:'response'}},publicBase);
    if(this.inflight.has(key))return bindResult(await this.inflight.get(key),publicBase);
    const pending=this._search(request,publicBase).then(value=>{
      const weight=value.streams.reduce((sum,stream)=>sum+512+2*((stream.url||'').length+(stream.name||'').length+(stream.description||'').length+(stream.behaviorHints.filename||'').length),512);
      this.cache.set(key,value,{ttl:value.streams.length?45000:5000,weight});
      return value;
    }).finally(()=>this.inflight.delete(key));
    this.inflight.set(key,pending);return bindResult(await pending,publicBase);
  }
  async _search(request,publicBase) {
    const start=performance.now();
    const metadataPending=this.catalog.metadata(request);
    const seedPending=metadataPending.then(meta=>this.seed.candidates(request,meta));
    const discoveryPending=metadataPending.then(meta=>this.discovery.candidates(request,meta));
    const [metadata,seed,library,discovery]=await Promise.allSettled([metadataPending,seedPending,this.refreshLibrary(),discoveryPending]);
    if(metadata.status==='rejected')throw metadata.reason;
    const meta=metadata.value;
    request.anime||=meta.anime;
    const catalogMs=performance.now()-start;
    let then=performance.now();
    let rows=this.index.search(request.key,meta.title,-1,{titleFallback:this.libraryIndex===this.index});
    if(this.libraryIndex!==this.index)rows=[...new Map([...this.libraryIndex.search(request.key,meta.title,-1),...rows].map(row=>[row.hash,row])).values()];
    const candidates=new Map(rows.map(row=>[row.hash,row]));
    const titleWords=normalizeTitle(meta.title).split(' ');
    for(const item of this.libraryFiles||[]){
      if(!titleWords.every(word=>item.words.has(word)))continue;
      const prior=candidates.get(item.hash);
      candidates.set(item.hash,{...prior,hash:item.hash,title:item.title,size:item.size,source:'torbox-library-files',mediaMatched:prior?.mediaMatched||false});
    }
    rows=[...candidates.values()].filter(row=>{
      if(request.season===undefined||this.ownedHashes?.has(row.hash))return true;
      const parsed=this.parseCandidate(row.title);
      if(parsed.seasons?.length&&!parsed.seasons.includes(request.season))return false;
      if(parsed.seasons?.length&&parsed.episodes?.length&&!parsed.episodes.includes(request.episode))return false;
      return true;
    });
    if(!rows.length&&seed.status==='rejected'&&discovery.status==='rejected')throw seed.reason;
    const source=seed.status==='fulfilled'?seed.value.source:'existing-index';const indexMs=performance.now()-then;
    then=performance.now();const cached=await this.torbox.checkCached(rows.map(x=>x.hash));const torboxMs=performance.now()-then;
    const matched=[];
    const previousSeasons=Object.entries(meta.seasonEpisodes||{}).filter(([season])=>Number(season)<request.season);
    const absoluteEpisode=request.anime&&(request.season===1||previousSeasons.length===request.season-1)?previousSeasons.reduce((sum,[,count])=>sum+count,request.episode):undefined;
    for(const release of rows) {
      const item=cached.get(release.hash);if(!item)continue;
      const file=selectFile(item.files,{...request,title:meta.title,folderName:release.title,absoluteEpisode,parse:this.parseTitle});if(!file)continue;
      const stream=parsedStream(release,item,file,request,this.parseTitle);
      stream.library=this.ownedHashes?.has(release.hash)||false;
      matched.push(stream);
    }
    const ranked=filterAndSort(matched,this.userData,meta,request);
    // Deduplicate the actual selected file, preserving distinct remuxes/editions.
    const seen=new Set();
    const unique=ranked.filter(s=>{const key=`${s.filename}:${s.size}`;if(seen.has(key))return false;seen.add(key);return true;});
    const fmt=formatter(this.userData,meta);
    const streams=await Promise.all(unique.map(async s=>{
      const rendered=await fmt.format(s);
      const token=this.sign({h:s._release.hash,f:s._file.id,n:s._file.short_name||s._file.name,s:s._file.size,exp:Date.now()+24*3600000});
      return {...rendered,url:publicBase+'/play/'+token,behaviorHints:{filename:s.filename,videoSize:s.size,folderSize:s.folderSize,service:'torbox',cached:true,notWebReady:!/^.*\.mp4$/i.test(s.filename)||/hevc|h\.?265|av1/i.test(s.parsedFile.encode||'')||s.parsedFile.visualTags.some(t=>/DV|HDR/.test(t)),bingeGroup:`torbox-direct|${s.parsedFile.resolution}|${s.parsedFile.quality}`}};
    }));
    const value={streams,metrics:{totalMs:Math.round(performance.now()-start),catalogMs:Math.round(catalogMs),indexMs:Math.round(indexMs),torboxMs:Math.round(torboxMs),cache:source,hashIndex:discovery.status==='fulfilled'?discovery.value.source:'unavailable',candidates:rows.length,cached:cached.size,matched:matched.length,returned:streams.length}};
    return value;
  }
  async refreshLibrary() {
    if(this.libraryAt&&Date.now()-this.libraryAt<60000)return;
    if(this.libraryPending)return this.libraryPending;
    this.libraryPending=this.torbox.listOwned().then(items=>{
      this.ownedHashes=new Set(items.map(x=>x.hash?.toLowerCase()).filter(Boolean));
      this.libraryFiles=items.flatMap(item=>(item.files||[]).filter(file=>/\.(mkv|mp4|m4v|avi|webm|mov|m2ts|ts)$/i.test(file.name||'')&&!/(?:^|[ /\\._-])(sample|trailer|featurette)(?:[ /\\._-]|$)/i.test(file.name)).map(file=>{
        const title=(file.short_name||file.name).split(/[\\/]/).pop();
        return {hash:String(item.hash||'').toLowerCase(),title,size:item.size,words:new Set(normalizeTitle(title).split(' '))};
      })).filter(item=>/^[a-f0-9]{40}$/i.test(item.hash||''));
      this.libraryIndex.import(items.filter(x=>x.hash&&x.name).map(x=>({hash:x.hash,title:x.name,size:x.size})),'torbox-library');
      this.libraryAt=Date.now();
    }).finally(()=>this.libraryPending=null);
    return this.libraryPending;
  }
  async playback(token) {
    const p=this.verify(token);
    return this.torbox.playback(p.h,{id:p.f,short_name:p.n,size:p.s});
  }
}
