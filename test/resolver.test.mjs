import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {HashDiscovery} from '../src/discovery.mjs';
import {selectFile} from '../src/torbox.mjs';
const prefs=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8'));

test('a movie inside an account collection is discoverable without being in the public index',async()=>{
 const hash='d'.repeat(40),index=new ReleaseIndex(),libraryIndex=new ReleaseIndex();
 const requested={id:13,name:'Collection/Example (2026)/Example (2026) {edition-IMAX} [IMAX Enhanced][WEBDL-2160p][DV HDR10][HEVC]-SiC.mkv',size:21498194564};
 const unrelated={id:23,name:'Collection/Other Film (2026)/Other.Film.2026.2160p.mkv',size:43611856468};
 const files=[requested,unrelated];
 const engine=new DirectEngine({index,libraryIndex,userData:prefs,signingKey:'fixture',torbox:{listOwned:async()=>[{hash,name:'Movie Universe Collection',size:100000000000,files}],checkCached:async hashes=>new Map(hashes.map(h=>[h,{hash:h,size:100000000000,files}]))},fetchImpl:async url=>new Response(JSON.stringify(new URL(url).hostname==='v3-cinemeta.strem.io'?{meta:{name:'Example',releaseInfo:'2026'}}:new URL(url).hostname==='api.knaben.org'?{hits:[]}:[]))});
 try{
  const result=await engine.search('movie','tt123','https://fixture.invalid/config');
  assert.equal(result.streams.length,1);assert.equal(result.streams[0].behaviorHints.videoSize,requested.size);
  assert.ok(result.streams[0].behaviorHints.filename.startsWith('Example (2026)'));
  const payload=JSON.parse(Buffer.from(result.streams[0].url.split('/play/')[1].split('.')[0],'base64url'));
  assert.equal(payload.f,13,'the larger unrelated movie is never selected');
 }finally{index.close();libraryIndex.close();}
});

test('bare anime episode numbers select the requested episode without largest-file guessing',()=>{
 const files=[{id:1,name:'[Group] Inferno Cop - 01 [1080p][ABC12345].mkv',size:165407111},{id:2,name:'[Group] Inferno Cop - 02 [1080p][DEF12345].mkv',size:200000000}];
 assert.equal(selectFile(files,{season:1,episode:1,anime:true,absoluteEpisode:1,folderName:'Inferno Cop 01-13'}).id,1);
 assert.equal(selectFile(files,{season:1,episode:3,anime:true,absoluteEpisode:3}),null);
 assert.equal(selectFile(files,{season:1,episode:1,anime:false}),null);
 assert.equal(selectFile(files,{season:1,episode:1,anime:true,absoluteEpisode:1,folderName:'Inferno Cop S02'}),null);
});

test('independent discovery validates titles and keeps unverified title matches separate from authoritative IDs',async()=>{
 const index=new ReleaseIndex(),hash='e'.repeat(40),calls=[];
 const discovery=new HashDiscovery(index,{fetchImpl:async(url,options)=>{
  calls.push(new URL(url).hostname);assert.equal(options.headers?.Authorization,undefined);
  return new Response(JSON.stringify({hits:[{hash,title:'Example.2026.IMAX.2160p.WEB-DL',bytes:100},{hash:'f'.repeat(40),title:'Example.Other.Film.2026.2160p.WEB-DL',bytes:200}]}));
 }});
 try{
  const request={type:'movie',key:'movie:tt123'};await discovery.candidates(request,{title:'Example',year:2026});
  const rows=index.search(request.key,'Example',1500,{titleFallback:false});
  assert.equal(rows.length,1);assert.equal(rows[0].hash,hash);assert.equal(rows[0].mediaMatched,0);
  assert.ok(calls.every(host=>['api.knaben.org','stremthru.13377001.xyz'].includes(host)));
  const before=calls.length;await discovery.candidates(request,{title:'Example',year:2026});assert.equal(calls.length,before);
 }finally{index.close();}
});
