// Public release metadata only. TorBox keys are never sent to this host.
export class MetadataSeed {
  constructor(index,{fetchImpl=fetch,baseUrl='https://zileanfortheweebs.midnightignite.me'}={}) {
    this.index=index;this.fetch=fetchImpl;this.baseUrl=baseUrl;this.inflight=new Map();
  }
  async candidates(request,metadata) {
    const key=`seed:${request.key}`;
    const state=this.index.getMetadata(key);
    if (state && Date.now()-state.cachedAt<86400000) return {rows:this.index.search(request.key,metadata.title),source:'local-index'};
    if (this.inflight.has(key)) return this.inflight.get(key);
    const task=this.load(request,metadata).finally(()=>this.inflight.delete(key));this.inflight.set(key,task);return task;
  }
  async load(request,metadata) {
    const resolutions=['2160p','1440p','1080p','720p'];
    const rows=[];
    // Two public seed requests at once; no unbounded crawling or bulk exports.
    for (let i=0;i<resolutions.length;i+=2) {
      const pages=await Promise.all(resolutions.slice(i,i+2).map(async resolution=>{
        const url=new URL('/dmm/filtered',this.baseUrl);
        url.searchParams.set('ImdbId',metadata.imdb);url.searchParams.set('Resolution',resolution);
        if (request.season!==undefined) url.searchParams.set('Season',request.season);
        if (request.episode!==undefined) url.searchParams.set('Episode',request.episode);
        const response=await this.fetch(url,{signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw Object.assign(new Error('Release metadata seed unavailable'),{code:'INDEX_UNAVAILABLE',status:503});
        const items=await response.json();
        if (!Array.isArray(items)) throw Object.assign(new Error('Release metadata seed returned invalid data'),{code:'INDEX_INVALID',status:503});
        return items.filter(x=>x.imdb_id===metadata.imdb && /^[a-f0-9]{40}$/i.test(x.info_hash||'') && x.raw_title).map(x=>({hash:x.info_hash.toLowerCase(),title:x.raw_title,size:Number(x.size)||0,media:[request.key]}));
      }));rows.push(...pages.flat());
    }
    const unique=[...new Map(rows.map(x=>[x.hash,x])).values()];
    this.index.import(unique,'zilean-metadata-seed');
    this.index.setMetadata(`seed:${request.key}`,{count:unique.length});
    return {rows:unique,source:'metadata-seed'};
  }
}
