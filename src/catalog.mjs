import {readFileSync} from 'node:fs';

let animeRows;
let animeById,animeImdb;
function animeMappings(){
  if(animeById)return;
  animeRows=JSON.parse(readFileSync(new URL('../deployment/anime-ids.json',import.meta.url),'utf8'));
  animeById=new Map();animeImdb=new Set();
  for(const row of animeRows){
    for(const imdb of row.imdb)animeImdb.add(imdb);
    for(const prefix of ['mal','kitsu','anilist','anidb'])if(row[prefix]!=null){
      const key=`${prefix}:${row[prefix]}`;const matches=animeById.get(key)||[];matches.push(row);animeById.set(key,matches);
    }
  }
}
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
    // This bundled crosswalk contains metadata IDs only, no torrents or hashes.
    animeMappings();
    if(!request.anime)return {...request,anime:animeImdb.has(request.id)};
    const matches=animeById.get(request.id)||[];
    if(matches.length!==1||matches[0].imdb.length!==1)throw Object.assign(new Error('No unambiguous IMDb mapping for this anime'),{code:'ID_NOT_MAPPED',status:404});
    const row=matches[0],type=row.movie?'movie':'series';
    if(type==='series'&&request.episode===undefined)throw Object.assign(new Error('An episode is required'),{code:'UNSUPPORTED_ID',status:400});
    // Anime catalog IDs represent one season/cour; offset converts its local episode.
    if(request.season!==undefined&&request.season!==1)throw Object.assign(new Error('Use the catalog ID for the requested anime season'),{code:'UNSUPPORTED_ID',status:400});
    const season=type==='series'?row.season:undefined,episode=type==='series'?request.episode+row.offset:undefined;
    if(type==='series'&&!Number.isInteger(season))throw Object.assign(new Error('Anime season mapping unavailable'),{code:'ID_NOT_MAPPED',status:404});
    return {type,id:row.imdb[0],season,episode,anime:true,key:`${type}:${row.imdb[0]}${type==='series'?`:${season}:${episode}`:''}`};
  }
  async metadata(request) {
    const key=`catalog:v4:${this.tmdbKey?'enriched':'basic'}:${request.type}:${request.id}`;
    const cached=this.index.getMetadata(key);
    if (cached && Date.now()-cached.cachedAt<7*86400000) return cached;
    if (this.inflight.has(key)) return this.inflight.get(key);
    const task=this.load(request).then(meta=>{this.index.setMetadata(key,meta);return meta;}).finally(()=>this.inflight.delete(key));
    this.inflight.set(key,task);return task;
  }
  async load(request) {
    let imdb=request.id;
    if (imdb.startsWith('tmdb:')) {
      const cached=this.index.getMetadata(`id-map:${request.type}:${imdb}`);
      if(cached?.imdb)imdb=cached.imdb;
      else if(this.tmdbKey){
        const url=new URL(`https://api.themoviedb.org/3/${request.type==='series'?'tv':'movie'}/${imdb.slice(5)}/external_ids`);
        url.searchParams.set('api_key',this.tmdbKey);
        const r=await this.fetch(url,{signal:AbortSignal.timeout(8000)});
        const d=await r.json();imdb=d.imdb_id;
        if(!r.ok)imdb=null;
      }else{
        const url=new URL('https://query.wikidata.org/sparql');
        const property=request.type==='series'?'P4983':'P4947';
        url.searchParams.set('format','json');url.searchParams.set('query',`SELECT DISTINCT ?imdb WHERE { ?item wdt:${property} "${imdb.slice(5)}"; wdt:P345 ?imdb. } LIMIT 2`);
        const r=await this.fetch(url,{headers:{Accept:'application/sparql-results+json','User-Agent':'TorBoxDirect/0.4 (+https://nuvio-torbox-direct.vercel.app)'},signal:AbortSignal.timeout(8000),redirect:'error'});
        const d=await r.json();const ids=[...new Set((d.results?.bindings||[]).map(x=>x.imdb?.value).filter(x=>/^tt\d+$/.test(x||'')))];
        imdb=r.ok&&ids.length===1?ids[0]:null;
      }
      if(!/^tt\d+$/.test(imdb||''))throw Object.assign(new Error('No unambiguous IMDb mapping for this catalog item; an optional TMDB key may improve coverage'),{code:'ID_NOT_MAPPED',status:404});
      this.index.setMetadata(`id-map:${request.type}:${request.id}`,{imdb});
    }
    const r=await this.fetch(`https://v3-cinemeta.strem.io/meta/${request.type}/${imdb}.json`,{signal:AbortSignal.timeout(12000)});
    const {meta}=await r.json();
    if (!r.ok || !meta?.name) throw Object.assign(new Error('Catalog metadata unavailable'),{code:'METADATA_UNAVAILABLE',status:502});
    const seasonEpisodes={};
    for(const video of meta.videos||[])if(video.season>0&&video.episode>0)seasonEpisodes[video.season]=Math.max(seasonEpisodes[video.season]||0,video.episode);
    if(meta.moviedb_id&&/^\d+$/.test(String(meta.moviedb_id)))this.index.setMetadata(`id-map:${request.type}:tmdb:${meta.moviedb_id}`,{imdb});
    let originalLanguage=meta.language||undefined,aliases=[];
    if(this.tmdbKey&&meta.moviedb_id){
      try{
        const url=new URL(`https://api.themoviedb.org/3/${request.type==='series'?'tv':'movie'}/${meta.moviedb_id}`);
        url.searchParams.set('api_key',this.tmdbKey);url.searchParams.set('append_to_response','alternative_titles');
        const response=await this.fetch(url,{signal:AbortSignal.timeout(2500),redirect:'error'});
        const data=response.ok?await response.json():{};
        if(data.original_language)originalLanguage=new Intl.DisplayNames(['en'],{type:'language'}).of(data.original_language);
        const alternatives=data.alternative_titles?.titles||data.alternative_titles?.results||[];
        aliases=[data.original_title||data.original_name,...alternatives.filter(x=>['RU','BR','PT','JP','FR','DE','ES','IT','TR'].includes(x.iso_3166_1)).map(x=>x.title)];
        aliases=[...new Set(aliases.filter(x=>x&&x.toLowerCase()!==meta.name.toLowerCase()))];
      }catch{}
    }
    return {imdb,title:meta.name,aliases,year:Number(String(meta.releaseInfo||meta.year||'').slice(0,4))||undefined,originalLanguage,runtime:meta.runtime,seasonEpisodes,anime:animeImdb?.has(imdb)||false};
  }
}
