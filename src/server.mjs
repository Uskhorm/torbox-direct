import {createServer} from 'node:http';

export function addonServer(engine,{accessToken,baseUrl,fallbackManifest}) {
  const prefix='/'+accessToken;
  let fallbackCache;
  return createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith(prefix+'/')) {res.writeHead(404);res.end();return;}
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Cache-Control','no-store');
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
    const path=url.pathname.slice(prefix.length);
    const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
    try {
      if(path==='/manifest.json'){
        console.log(JSON.stringify({event:'manifest',kind:'direct',at:new Date().toISOString()}));
        return json(200,{id:'local.nuvio.torbox-direct',version:'0.1.0',name:'TorBox Direct',description:'Local release index with direct TorBox cached streams',resources:[{name:'stream',types:['movie','series'],idPrefixes:['tt','tmdb:']}],types:['movie','series'],catalogs:[],behaviorHints:{configurable:false}});
      }
      if(path==='/health')return json(200,{ok:true,index:engine.index.stats(),mode:'local-index-direct-torbox'});
      if(path.startsWith('/fallback/')&&fallbackManifest) {
        const relative=path.slice('/fallback/'.length);
        if(!/^(manifest\.json|(?:catalog|meta|stream|subtitles)\/[^/]+\/.+\.json)$/.test(relative)||relative.includes('..'))return json(404,{error:'NOT_FOUND'});
        if(relative.startsWith('stream/')){
          const requestedId=decodeURIComponent(relative.split('/')[2].replace(/\.json$/,''));
          if(requestedId.startsWith('tt')||requestedId.startsWith('tmdb:'))return json(400,{error:'USE_TORBOX_DIRECT'});
        }
        if(relative==='manifest.json'&&fallbackCache&&Date.now()-fallbackCache.at<300000)return json(200,fallbackCache.value);
        const upstream=await fetch(fallbackManifest.replace(/manifest\.json$/,relative),{signal:AbortSignal.timeout(40000)});
        if(!upstream.ok)return json(502,{error:'FALLBACK_UNAVAILABLE'});
        const data=await upstream.json();
        if(relative==='manifest.json') {
          console.log(JSON.stringify({event:'manifest',kind:'fallback',at:new Date().toISOString()}));
          data.id+='.other-ids';data.name='AIOStreams · Other IDs';
          const original=(data.resources||[]).find(r=>r==='stream'||r.name==='stream');
          const otherPrefixes=(typeof original==='object'?original.idPrefixes:data.idPrefixes)||['mal:','kitsu:','anidb:','aiostreams:library:'];
          const prefixes=otherPrefixes.filter(p=>p!=='tt'&&!p.startsWith('tmdb'));
          data.resources=(data.resources||[]).map(r=>(r==='stream'||r.name==='stream')?{name:'stream',types:(typeof r==='object'?r.types:data.types)||['movie','series','anime','library'],idPrefixes:prefixes.length?prefixes:['mal:','kitsu:','anidb:','aiostreams:library:']}:r);
          fallbackCache={at:Date.now(),value:data};
        }
        return json(200,data);
      }
      const match=path.match(/^\/stream\/(movie|series)\/(.+)\.json$/);
      if(match) {
        const result=await engine.search(match[1],decodeURIComponent(match[2]),baseUrl+prefix);
        res.setHeader('Server-Timing',`total;dur=${result.metrics.totalMs}, index;dur=${result.metrics.indexMs}, torbox;dur=${result.metrics.torboxMs}`);
        res.setHeader('X-TorBox-Direct-Cache',result.metrics.cache);
        console.log(JSON.stringify({event:'search',type:match[1],...result.metrics}));
        return json(200,{streams:result.streams});
      }
      if(path.startsWith('/play/')) {
        const target=await engine.playback(path.slice(6));
        console.log(JSON.stringify({event:'playback',torrentId:target.torrentId,fileId:target.fileId}));
        res.writeHead(307,{Location:target.url});res.end();return;
      }
      json(404,{error:'NOT_FOUND'});
    } catch(error) {
      console.log(JSON.stringify({event:'error',code:error.code||'INTERNAL_ERROR'}));
      json(error.status||502,{streams:[],error:{code:error.code||'REQUEST_FAILED',message:error.code?error.message:'Request failed; see the local service log'}});
    }
  });
}
