import {createHmac,timingSafeEqual} from 'node:crypto';
import {parseRequest,Catalog} from './catalog.mjs';
import {MetadataSeed} from './seed.mjs';
import {selectFile,TorBoxError} from './torbox.mjs';
import {parsedStream,filterAndSort,formatter} from './format.mjs';

export class DirectEngine {
  // libraryIndex holds this account's own TorBox items. Hosted mode gives every
  // configuration its own, so one account's library never reaches another's results.
  constructor({index,libraryIndex=index,torbox,userData,signingKey,fetchImpl=fetch,tmdbKey}) {
    this.index=index;this.libraryIndex=libraryIndex;this.torbox=torbox;this.userData=userData;this.signingKey=signingKey;
    this.catalog=new Catalog(index,{fetchImpl,tmdbKey});this.seed=new MetadataSeed(index,{fetchImpl});
    this.cache=new Map();this.inflight=new Map();
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
    const request=parseRequest(type,id);const key=request.key+'\0'+publicBase;
    const previous=this.cache.get(key);
    if(previous&&Date.now()-previous.at<20000) return {...previous.value,metrics:{...previous.value.metrics,totalMs:0,cache:'response'}};
    if(this.inflight.has(key)) return this.inflight.get(key);
    const pending=this._search(request,publicBase).then(value=>{
      this.cache.set(key,{at:Date.now(),value});
      if(this.cache.size>128)this.cache.delete(this.cache.keys().next().value);
      return value;
    }).finally(()=>this.inflight.delete(key));
    this.inflight.set(key,pending);return pending;
  }
  async _search(request,publicBase) {
    const start=performance.now();
    request=await this.catalog.resolve(request);
    const metadataPending=this.catalog.metadata(request);
    const seedPending=request.id.startsWith('tt')?this.seed.candidates(request,{imdb:request.id,title:''}):metadataPending.then(meta=>this.seed.candidates(request,meta));
    const [metadata,seed,library]=await Promise.allSettled([metadataPending,seedPending,this.refreshLibrary()]);
    if(metadata.status==='rejected')throw metadata.reason;
    const meta=metadata.value;
    const catalogMs=performance.now()-start;
    let then=performance.now();
    let rows=this.index.search(request.key,meta.title);
    if(this.libraryIndex!==this.index)rows=[...new Map([...rows,...this.libraryIndex.search(request.key,meta.title)].map(row=>[row.hash,row])).values()];
    if(!rows.length&&seed.status==='rejected')throw seed.reason;
    const source=seed.status==='fulfilled'?seed.value.source:'existing-index';const indexMs=performance.now()-then;
    then=performance.now();const cached=await this.torbox.checkCached(rows.map(x=>x.hash));const torboxMs=performance.now()-then;
    const matched=[];
    for(const release of rows) {
      const item=cached.get(release.hash);if(!item)continue;
      const file=selectFile(item.files,{...request,title:meta.title});if(!file)continue;
      const stream=parsedStream(release,item,file,request);
      stream.library=this.ownedHashes?.has(release.hash)||false;
      matched.push(stream);
    }
    const ranked=filterAndSort(matched,this.userData,meta,request);
    // Deduplicate the actual selected file, preserving distinct remuxes/editions.
    const seen=new Set();
    const unique=ranked.filter(s=>{const key=`${s.filename}:${s.size}`;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,60);
    const fmt=formatter(this.userData,meta);
    const streams=await Promise.all(unique.map(async s=>{
      const rendered=await fmt.format(s);
      const token=this.sign({h:s._release.hash,f:s._file.id,n:s._file.short_name||s._file.name,s:s._file.size,exp:Date.now()+24*3600000});
      return {...rendered,url:publicBase+'/play/'+token,behaviorHints:{filename:s.filename,videoSize:s.size,folderSize:s.folderSize,service:'torbox',cached:true,bingeGroup:`torbox-direct|${s.parsedFile.resolution}|${s.parsedFile.quality}`}};
    }));
    const value={streams,metrics:{totalMs:Math.round(performance.now()-start),catalogMs:Math.round(catalogMs),indexMs:Math.round(indexMs),torboxMs:Math.round(torboxMs),cache:source,candidates:rows.length,cached:cached.size,matched:matched.length,returned:streams.length}};
    return value;
  }
  async refreshLibrary() {
    if(this.libraryAt&&Date.now()-this.libraryAt<60000)return;
    if(this.libraryPending)return this.libraryPending;
    this.libraryPending=this.torbox.listOwned().then(items=>{
      this.ownedHashes=new Set(items.map(x=>x.hash?.toLowerCase()).filter(Boolean));
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
