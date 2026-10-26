import {matchesTitle} from './discovery.mjs';
// Public release metadata only. TorBox keys are never sent to this host.
export class MetadataSeed {
  constructor(index,{fetchImpl=fetch,baseUrl='https://zileanfortheweebs.midnightignite.me'}={}) {
    this.index=index;this.fetch=fetchImpl;this.baseUrl=baseUrl;this.inflight=new Map();
  }
  async candidates(request,metadata) {
    const key=`seed:v5:${request.key}`;
    const state=this.index.getMetadata(key);
    if (state && Date.now()-state.cachedAt<(state.count?86400000:60000)) return {rows:this.index.search(request.key,metadata.title,-1),source:'local-index'};
    if (this.inflight.has(key)) return this.inflight.get(key);
    const task=this.load(request,metadata,key).finally(()=>this.inflight.delete(key));this.inflight.set(key,task);return task;
  }
  async load(request,metadata,key) {
    const resolutions=['2160p','1440p','1080p','720p'];
    const rows=[];
    // ID tags are absent on many valid releases. Search by title independently
    // for every resolution, even when the ID search already returned plenty.
    const queries=[...resolutions,null].flatMap(resolution=>[{resolution,byTitle:false},{resolution,byTitle:true}]);
    queries.push(...(metadata.aliases||[]).map(title=>({resolution:null,byTitle:true,title})));
    const pages=await Promise.allSettled(queries.map(async ({resolution,byTitle,title})=>{
        const url=new URL('/dmm/filtered',this.baseUrl);
        url.searchParams.set(byTitle?'Query':'ImdbId',byTitle?(title||metadata.title).replace(/&/g,' and '):metadata.imdb);
        if(resolution){url.searchParams.set('Resolution',resolution);
          if (request.season!==undefined) url.searchParams.set('Season',request.season);
          if (request.episode!==undefined) url.searchParams.set('Episode',request.episode);
        }
        const response=await this.fetch(url,{signal:AbortSignal.timeout(6500)});
        if (!response.ok) throw Object.assign(new Error('Release metadata seed unavailable'),{code:'INDEX_UNAVAILABLE',status:503});
        const items=await response.json();
        if (!Array.isArray(items)) throw Object.assign(new Error('Release metadata seed returned invalid data'),{code:'INDEX_INVALID',status:503});
        return items.filter(x=>/^[a-f0-9]{40}$/i.test(x.info_hash||'') && x.raw_title &&
          (x.imdb_id===metadata.imdb||byTitle&&(!x.imdb_id||x.imdb_id===metadata.imdb)&&matchesTitle(x.raw_title,metadata,request)))
          .map(x=>({hash:x.info_hash.toLowerCase(),title:x.raw_title,size:Number(x.size)||0,media:[request.key],mediaTrusted:x.imdb_id===metadata.imdb}));
      }));rows.push(...pages.filter(x=>x.status==='fulfilled').flatMap(x=>x.value));
    if(!rows.length&&pages.every(x=>x.status==='rejected'))throw Object.assign(new Error('Release index unavailable'),{code:'INDEX_UNAVAILABLE',status:503});
    const unique=[...new Map(rows.map(x=>[x.hash,x])).values()];
    this.index.import(unique,'zilean-metadata-seed');
    this.index.setMetadata(key,{count:unique.length});
    return {rows:unique,source:'metadata-seed'};
  }
}
