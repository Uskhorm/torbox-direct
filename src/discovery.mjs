import {parseTorrentTitle} from '@viren070/parse-torrent-title';
import {memoizeParser} from './cache.mjs';
import {normaliseTitle} from '../vendor/aiostreams-parser.mjs';
const parsePublicTitle=memoizeParser(parseTorrentTitle,{maxEntries:4096,maxWeight:2*1024*1024});

export const normalizeTitle=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export const canonicalTitle=value=>normaliseTitle(String(value||''));
export function matchesTitle(raw,metadata,request){
  const parsed=parsePublicTitle(raw);
  if(![metadata.title,...metadata.aliases||[]].some(title=>canonicalTitle(parsed.title)===canonicalTitle(title)))return false;
  if(parsed.year&&metadata.year&&(request.type==='movie'||request.season===1)&&Number(parsed.year)!==metadata.year)return false;
  if(request.season!==undefined&&parsed.seasons?.length&&!parsed.seasons.includes(request.season))return false;
  return true;
}

// Independent raw hash database. Never sends account credentials or resolves video.
export class HashDiscovery {
  constructor(index,{fetchImpl=fetch}={}){this.index=index;this.fetch=fetchImpl;this.inflight=new Map();}
  async candidates(request,metadata){
    const key='hash-index:v5:'+request.key;
    const cached=this.index.getMetadata(key);
    if(cached&&Date.now()-cached.cachedAt<(cached.count?3600000:60000))return {count:cached.count,source:'hash-index-cache'};
    if(this.inflight.has(key))return this.inflight.get(key);
    const task=this.load(request,metadata,key).finally(()=>this.inflight.delete(key));this.inflight.set(key,task);return task;
  }
  async load(request,metadata,key){
    const queries=[metadata.title,...(request.type==='movie'?[metadata.title+' IMAX',metadata.title+' 2160p']:[`${metadata.title} S${String(request.season).padStart(2,'0')}E${String(request.episode).padStart(2,'0')}`])];
    const knaben=queries.map(async query=>{
      const url=new URL('https://api.knaben.org/v2/search');
      for(const [name,value] of Object.entries({q:query,c:request.type==='movie'?'3000000':'2000000,6000000',s:'300',o:'seeders',dead:''}))url.searchParams.set(name,value);
      const response=await this.fetch(url,{signal:AbortSignal.timeout(6500),redirect:'error'});
      if(!response.ok)throw new Error('Hash index unavailable');
      const data=await response.json();if(!Array.isArray(data.hits))throw new Error('Invalid hash index response');
      return data.hits.filter(row=>/^[a-f0-9]{40}$/i.test(row.hash||'')&&row.title&&matchesTitle(row.title,metadata,request)).map(row=>({hash:row.hash.toLowerCase(),title:row.title,size:Number(row.bytes)||0,media:[request.key],mediaTrusted:false}));
    });
    const torz=(async()=>{
      const rows=[];
      // This is the public raw metadata index, not its Stremio addon or store API.
      // No credentials, playback URLs, or debrid resolution go through this host.
      {
        const url=new URL('https://stremthru.13377001.xyz/v0/torznab/api');
        // The upstream API explicitly skips slicing when limit=0. Fetch the
        // complete ID result once; fixed page caps hid high-quality releases.
        // A show-level query also finds complete packs missing episode mappings.
        const params={t:request.type==='movie'?'movie':'tvsearch',imdbid:metadata.imdb.slice(2),o:'json',limit:'0'};
        for(const [name,value] of Object.entries(params))url.searchParams.set(name,value);
        const response=await this.fetch(url,{signal:AbortSignal.timeout(6500),redirect:'error'});
        if(!response.ok)throw new Error('Metadata index unavailable');
        const data=await response.json(),items=data.channel?.items;
        if(!Array.isArray(items))throw new Error('Invalid metadata index response');
        for(const item of items){
          const attrs=Object.fromEntries((item.attr||[]).map(x=>[x['@attributes']?.name,x['@attributes']?.value]));
          const hash=attrs.infohash||item.guid;
          const id=String(attrs.imdb||'').replace(/^tt/,'');
          if(!/^[a-f0-9]{40}$/i.test(hash||'')||!item.title)continue;
          const trusted=id===metadata.imdb.slice(2);
          if(id&&!trusted||!trusted&&!matchesTitle(item.title,metadata,request))continue;
          rows.push({hash:hash.toLowerCase(),title:item.title,size:Number(attrs.size)||0,media:[request.key],mediaTrusted:trusted});
        }
      }
      return rows;
    })();
    const responses=await Promise.allSettled([...knaben,torz]);
    const rows=[...new Map(responses.filter(x=>x.status==='fulfilled').flatMap(x=>x.value).map(row=>[row.hash,row])).values()];
    if(responses.every(x=>x.status==='rejected'))throw Object.assign(new Error('Independent hash index unavailable'),{code:'HASH_INDEX_UNAVAILABLE',status:503});
    this.index.import(rows,'independent-hash-indexes');this.index.setMetadata(key,{count:rows.length});
    return {count:rows.length,source:'hash-index'};
  }
}
