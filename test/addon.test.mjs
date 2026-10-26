import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {once} from 'node:events';
import {TorBox} from '../src/torbox.mjs';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {addonServer} from '../src/server.mjs';

test('HTTP addon uses metadata plus TorBox only and warm requests do no upstream work',async()=>{
 const hash='b'.repeat(40),file={id:7,name:'Example.2026.IMAX.2160p.BluRay.REMUX.DV.HDR.mkv',short_name:'Example.2026.IMAX.2160p.BluRay.REMUX.DV.HDR.mkv',size:85005579251};
 const calls=[];
 const fetchImpl=async(url,options={})=>{
  const u=new URL(url);calls.push({host:u.hostname,path:u.pathname,method:options.method||'GET'});
  let data;
  if(u.hostname==='v3-cinemeta.strem.io')data={meta:{name:'Example',releaseInfo:'2026'}};
  else if(u.hostname==='zileanfortheweebs.midnightignite.me'){
   assert.ok(!options.headers?.Authorization,'no TorBox credential reaches metadata seed');
   data=u.searchParams.get('Resolution')==='2160p'?[{info_hash:hash,raw_title:file.name,imdb_id:'tt123',size:file.size}]:[];
  }else if(u.pathname.endsWith('/checkcached'))data={success:true,data:{[hash]:{hash,name:file.name,size:file.size,files:[file]}}};
  else if(u.pathname.endsWith('/mylist'))data={success:true,data:[{id:11,hash,name:file.name,size:file.size,files:[file]}]};
  else if(u.pathname.endsWith('/requestdl'))data={success:true,data:'https://nexus-test.neur.tb-cdn.st/test-video.mkv'};
  else throw new Error('Unexpected upstream route');
  return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
 };
 const index=new ReleaseIndex();const prefs=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8'));
 const engine=new DirectEngine({index,torbox:new TorBox({apiKey:'fixture-only-key',fetchImpl}),userData:prefs,signingKey:'fixture-signing-key',fetchImpl});
 const server=addonServer(engine,{accessToken:'test-access',baseUrl:'http://127.0.0.1:1',fallbackManifest:'https://must-not-be-called.invalid/manifest.json'});server.listen(0,'127.0.0.1');await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}/test-access`;
 try{
  const bad=await fetch(base.replace('test-access','wrong')+'/manifest.json');assert.equal(bad.status,404);
  const blocked=await fetch(base+'/fallback/stream/movie/tt123.json');assert.equal(blocked.status,400);assert.equal(calls.length,0,'fallback must refuse IMDb requests before any upstream call');
  const a=await fetch(base+'/stream/movie/tt123.json');const body=await a.json();assert.equal(a.status,200);assert.equal(body.streams[0].name,'𝟜𝕂 𝔻𝕍  ·  𝕀𝕄𝔸𝕏');
  const count=calls.length;await fetch(base+'/stream/movie/tt123.json');assert.equal(calls.length,count);
  assert.ok(calls.every(c=>['api.torbox.app','v3-cinemeta.strem.io','zileanfortheweebs.midnightignite.me'].includes(c.host)));
  const token=body.streams[0].url.split('/play/')[1];const r=await fetch(base+'/play/'+token,{redirect:'manual'});assert.equal(r.status,307);assert.match(r.headers.get('location'),/^https:\/\/nexus-test/);assert.ok(!calls.some(c=>c.path.includes('createtorrent')));
 }finally{server.close();await once(server,'close');index.close();}
});
