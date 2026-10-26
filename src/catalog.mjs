import {readFileSync} from 'node:fs';

let animeRows;
export function parseRequest(type, id) {
  if (!['movie','series','anime'].includes(type)) throw Object.assign(new Error('Unsupported media type'),{code:'UNSUPPORTED_ID',status:400});
  const anime=id.match(/^(mal|kitsu|anilist|anidb):(\d+)(?::(\d+))?(?::(\d+))?$/);
  if(anime){
    if(type==='series'&&anime[3]===undefined)throw Object.assign(new Error('An episode is required'),{code:'UNSUPPORTED_ID',status:400});
    return {type,id:`${anime[1]}:${anime[2]}`,anime:true,season:anime[4]===undefined?undefined:Number(anime[3]),episode:anime[4]===undefined?(anime[3]===undefined?undefined:Number(anime[3])):Number(anime[4]),key:`${type}:${id}`};
  }
  const match=id.match(/^(tt\d+|tmdb:\d+)(?::(\d+):(\d+))?$/);
  if (!match || (type==='series' && match[2]===undefined)) throw Object.assign(new Error('An IMDb/TMDB ID and, for series, season/episode are required'),{code:'UNSUPPORTED_ID',status:400});
  return { type:type==='anime'?(match[2]===undefined?'movie':'series'):type,id:match[1],season:match[2]===undefined?undefined:Number(match[2]),episode:match[3]===undefined?undefined:Number(match[3]),key:`${type}:${id}` };
}

export class Catalog {
  constructor(index,{fetchImpl=fetch,tmdbKey}={}) { this.index=index;this.fetch=fetchImpl;this.tmdbKey=tmdbKey;this.inflight=new Map(); }
  async resolve(request) {
    if(!request.anime)return request;
    // This bundled crosswalk contains metadata IDs only, no torrents or hashes.
    const rows=animeRows??=JSON.parse(readFileSync(new URL('../deployment/anime-ids.json',import.meta.url),'utf8'));
    const [prefix,id]=request.id.split(':');
    const matches=rows.filter(row=>String(row[prefix])===id);
    if(matches.length!==1||matches[0].imdb.length!==1)throw Object.assign(new Error('No unambiguous IMDb mapping for this anime'),{code:'ID_NOT_MAPPED',status:404});
    const row=matches[0],type=row.movie?'movie':'series';
    if(type==='series'&&request.episode===undefined)throw Object.assign(new Error('An episode is required'),{code:'UNSUPPORTED_ID',status:400});
    // Anime catalog IDs represent one season/cour; offset converts its local episode.
    if(request.season!==undefined&&request.season!==1)throw Object.assign(new Error('Use the catalog ID for the requested anime season'),{code:'UNSUPPORTED_ID',status:400});
    const season=type==='series'?row.season:undefined,episode=type==='series'?request.episode+row.offset:undefined;
    if(type==='series'&&!Number.isInteger(season))throw Object.assign(new Error('Anime season mapping unavailable'),{code:'ID_NOT_MAPPED',status:404});
    return {type,id:row.imdb[0],season,episode,key:`${type}:${row.imdb[0]}${type==='series'?`:${season}:${episode}`:''}`};
  }
  async metadata(request) {
    const key=`catalog:${request.type}:${request.id}`;
    const cached=this.index.getMetadata(key);
    if (cached && Date.now()-cached.cachedAt<7*86400000) return cached;
    if (this.inflight.has(key)) return this.inflight.get(key);
    const task=this.load(request).then(meta=>{this.index.setMetadata(key,meta);return meta;}).finally(()=>this.inflight.delete(key));
    this.inflight.set(key,task);return task;
  }
  async load(request) {
    let imdb=request.id;
    if (imdb.startsWith('tmdb:')) {
      if (!this.tmdbKey) throw Object.assign(new Error('TMDB ID mapping requires the metadata key from your config'),{code:'METADATA_KEY_REQUIRED',status:400});
      const url=new URL(`https://api.themoviedb.org/3/${request.type==='series'?'tv':'movie'}/${imdb.slice(5)}/external_ids`);
      url.searchParams.set('api_key',this.tmdbKey);
      const r=await this.fetch(url,{signal:AbortSignal.timeout(12000)});
      const d=await r.json();imdb=d.imdb_id;
      if (!r.ok || !/^tt\d+$/.test(imdb||'')) throw Object.assign(new Error('No IMDb mapping for this catalog item'),{code:'ID_NOT_MAPPED',status:404});
    }
    const r=await this.fetch(`https://v3-cinemeta.strem.io/meta/${request.type}/${imdb}.json`,{signal:AbortSignal.timeout(12000)});
    const {meta}=await r.json();
    if (!r.ok || !meta?.name) throw Object.assign(new Error('Catalog metadata unavailable'),{code:'METADATA_UNAVAILABLE',status:502});
    return {imdb,title:meta.name,year:Number(String(meta.releaseInfo||meta.year||'').slice(0,4))||undefined,originalLanguage:meta.language||undefined,runtime:meta.runtime};
  }
}
