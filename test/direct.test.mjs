import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TorBox,selectFile} from '../src/torbox.mjs';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {parseRequest} from '../src/catalog.mjs';
import {parsedStream,filterAndSort,formatter} from '../src/format.mjs';
const hash='a'.repeat(40);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const prefs=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8'));

test('a failed cache check is not accepted just because HTTP is 200',async()=>{
 const api=new TorBox({apiKey:'test-key',fetchImpl:async()=>json({success:false,error:'BAD_TOKEN'})});
 await assert.rejects(()=>api.checkCached([hash]),{code:'BAD_TOKEN'});
});
test('uncached release never triggers account creation',async()=>{
 const calls=[];const api=new TorBox({apiKey:'test-key',fetchImpl:async(url)=>{calls.push(new URL(url).pathname);return json({success:true,data:{}});}});
 await assert.rejects(()=>api.ensureOwned(hash),{code:'NO_LONGER_CACHED'});assert.equal(calls.length,1);
});
test('a new cached release can only be added with add_only_if_cached',async()=>{
 let form;
 const file={id:4,name:'Movie.mkv',short_name:'Movie.mkv',size:4000};
 const api=new TorBox({apiKey:'test-key',fetchImpl:async(url,options)=>{
  const u=new URL(url);
  if(u.pathname.endsWith('checkcached'))return json({success:true,data:{[hash]:{hash,files:[file]}}});
  if(u.pathname.endsWith('createtorrent')){form=options.body;return json({success:true,data:{torrent_id:77}});}
  return json({success:true,data:u.searchParams.has('id')?{id:77,hash,files:[file]}:[]});
 }});
 await api.ensureOwned(hash);assert.equal(form.get('add_only_if_cached'),'true');assert.equal(form.get('allow_zip'),'false');
});
test('series selection uses the requested episode, not the largest file',()=>{
 const files=[{id:0,name:'Show.S01E01.mkv',size:9000},{id:7,name:'Show.S01E02.mkv',size:2000},{id:9,name:'Show.S02E02.mkv',size:9999}];
 assert.equal(selectFile(files,{season:1,episode:2}).id,7);assert.equal(selectFile(files,{season:3,episode:2}),null);
});
test('movie collections cannot silently select the largest unrelated movie',()=>{
 const files=[{id:1,name:'Dunkirk.2017.mkv',size:8000},{id:2,name:'Interstellar.2014.mkv',size:6000}];
 assert.equal(selectFile(files,{title:'Interstellar'}).id,2);assert.equal(selectFile(files,{title:'Inception'}),null);
});
test('persistent index retains exact ID mappings and accepts title punctuation safely',()=>{
 const index=new ReleaseIndex();try{index.import([{hash,title:"Director's Film 2160p",size:1,media:['movie:tt123']}],'test');assert.equal(index.search('movie:tt123','unrelated')[0].hash,hash);assert.deepEqual(index.search('movie:tt456',"' OR 1=1 --"),[]);}finally{index.close();}
});
test('reuses actual AIO custom formatter for the current 4K DV IMAX card',async()=>{
 const release={hash,title:'Project.Hail.Mary.2026.IMAX.2160p.UHD.BluRay.REMUX.DV.HDR.TrueHD.Atmos.7.1.HEVC',size:85005579251};
 const stream=parsedStream(release,{size:release.size},{id:0,name:release.title+'.mkv',size:release.size},{type:'movie'});
 const actual=await formatter(prefs,{title:'Project Hail Mary',year:2026}).format(stream);
 assert.equal(actual.name,'𝟜𝕂 𝔻𝕍  ·  𝕀𝕄𝔸𝕏');assert.match(actual.description,/TB ✓  ·  ◈ 𝟖𝟓.𝟎𝟏 ɢʙ/);
});
test('SDR is not mislabelled as HDR',()=>{
 const r={hash,title:'Dark.S01E02.1080p.WEB-DL.SDR',size:100};const s=parsedStream(r,{size:100},{id:0,name:r.title+'.mkv',size:100},{season:1,episode:2});assert.ok(!s.parsedFile.visualTags.includes('HDR'));
});
test('catalog ID parser does not accept a malformed episode',()=>{assert.throws(()=>parseRequest('series','tt123:undefined:1'));assert.equal(parseRequest('series','tt123:1:2').episode,2);});
test('signed playback tokens reject edits and expiry',()=>{
 const engine=new DirectEngine({index:{},torbox:{},userData:prefs,signingKey:'test-signing-key'});
 const token=engine.sign({h:hash,exp:Date.now()+10000});assert.equal(engine.verify(token).h,hash);assert.throws(()=>engine.verify('x'+token),{code:'INVALID_LINK'});assert.throws(()=>engine.verify(engine.sign({exp:1})),{code:'EXPIRED_LINK'});
});
test('current preferences rank IMAX and DV ahead of ordinary 4K',()=>{
 const release=title=>({hash,title,size:100});const make=title=>parsedStream(release(title),{size:100},{id:0,name:title+'.mkv',size:100},{type:'movie'});
 const rows=[make('Example.2026.2160p.BluRay.REMUX'),make('Example.2026.IMAX.2160p.BluRay.REMUX.DV.HDR')];
 const ordered=filterAndSort(rows,prefs,{title:'Example',year:2026},{type:'movie'});assert.match(ordered[0].folderName,/IMAX/);
});
