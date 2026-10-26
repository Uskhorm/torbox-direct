import test from 'node:test';
import assert from 'node:assert/strict';
import {TorBox} from '../src/torbox.mjs';
import {BoundedCache} from '../src/cache.mjs';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {MetadataSeed} from '../src/seed.mjs';
import {parseRelease,parsedStream,filterAndSort} from '../src/format.mjs';
import {readFileSync} from 'node:fs';
const prefs=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url)));
const hash=n=>n.toString(16).padStart(40,'0');
const file={id:1,name:'Example.2026.2160p.BluRay.REMUX.DV.mkv',size:61000000000};

test('overlapping hash checks coalesce, negatives expire quickly, playback always rechecks',async()=>{
  const calls=[];let release;const barrier=new Promise(r=>release=r);let cached=true,now=0;
  const tb=new TorBox({apiKey:'fixture',fetchImpl:async(url,options)=>{
    assert.ok(new URL(url).pathname.endsWith('checkcached'),'no account mutations');
    const hashes=JSON.parse(options.body).hashes;calls.push(hashes);await barrier;
    return new Response(JSON.stringify({success:true,data:Object.fromEntries(hashes.filter(h=>cached&&h===hash(1)).map(h=>[h,{hash:h,files:[file]}]))}));
  }});
  tb.availability.now=tb.negativeAvailability.now=()=>now;
  const first=tb.checkCached([hash(1),hash(2)]),second=tb.checkCached([hash(1),hash(2),hash(3)]);release();
  await Promise.all([first,second]);
  assert.deepEqual(calls.flat().sort(),[hash(1),hash(2),hash(3)].sort());
  await tb.checkCached([hash(1),hash(2)]);assert.equal(calls.length,2);
  now=8001;await tb.checkCached([hash(1),hash(2)]);assert.deepEqual(calls.at(-1),[hash(2)]);
  cached=false;await assert.rejects(tb.ensureOwned(hash(1)),{code:'NO_LONGER_CACHED'});
  assert.deepEqual(calls.at(-1),[hash(1)],'fresh playback ignores a positive search cache');
});

test('weighted LRU evicts old entries and separates expiration from falsy values',()=>{
 let now=0;const cache=new BoundedCache({maxEntries:3,maxWeight:6,now:()=>now});
 cache.set('a',null,{weight:2,ttl:10});cache.set('b',false,{weight:2});cache.set('c',3,{weight:2});
 assert.equal(cache.get('a'),null);cache.set('d',4,{weight:2});assert.equal(cache.get('b'),undefined);
 now=11;assert.equal(cache.get('a'),undefined);assert.equal(cache.weight,4);
});

test('a best release beyond candidate 2500 is checked and more than 60 distinct files survive',async()=>{
 const index=new ReleaseIndex(),libraryIndex=new ReleaseIndex();const checked=[];
 index.import(Array.from({length:2601},(_,n)=>({hash:hash(n+1),title:`Example.2026.2160p.BluRay.REMUX.DV-G${n}`,size:1000,media:['movie:tt123']})),'fixture');
 const engine=new DirectEngine({index,libraryIndex,userData:prefs,signingKey:'fixture',sources:{seed:{candidates:async()=>({source:'fixture'})},discovery:{candidates:async()=>({source:'fixture'})}},torbox:{listOwned:async()=>[],checkCached:async hashes=>{checked.push(...hashes);return new Map(hashes.filter((_,i)=>i<70||i===2600).map((h,i)=>[h,{hash:h,files:[{...file,name:`Example.2026.2160p.BluRay.REMUX.DV-G${i}.mkv`,size:file.size+i}]}]));}},fetchImpl:async()=>new Response(JSON.stringify({meta:{name:'Example',releaseInfo:'2026'}}))});
 try{
   const result=await engine.search('movie','tt123','https://fixture.invalid/one');
   assert.equal(checked.length,2601);assert.equal(result.streams.length,71);
   const cached=await engine.search('movie','tt123','https://fixture.invalid/two');
   assert.equal(checked.length,2601);assert.ok(cached.streams.every(s=>s.url.startsWith('https://fixture.invalid/two/play/')));
 }finally{index.close();libraryIndex.close();}
});

test('title search runs even when IMDb search is populated and finds untagged high quality releases',async()=>{
 const index=new ReleaseIndex(),requests=[];const seed=new MetadataSeed(index,{fetchImpl:async url=>{
  const u=new URL(url);requests.push(u);
  const tagged=Array.from({length:15},(_,n)=>({info_hash:hash(n+1),raw_title:'Example.2026.1080p.WEB-DL',imdb_id:'tt123',size:3000}));
  const untagged=[{info_hash:hash(100),raw_title:'Example.2026.2160p.BluRay.REMUX.DV',imdb_id:null,size:61000}];
  return new Response(JSON.stringify(u.searchParams.has('ImdbId')?tagged:untagged));
 }});
 try{await seed.candidates({type:'movie',key:'movie:tt123'},{title:'Example',year:2026,imdb:'tt123'});
  assert.ok(index.search('movie:tt123','Example',-1,{titleFallback:false}).some(x=>x.hash===hash(100)));
  assert.ok(requests.some(u=>u.searchParams.has('Query')&&u.searchParams.get('Resolution')==='2160p'));
 }finally{index.close();}
});

test('title words and non-Latin release groups do not invent audio languages',()=>{
 assert.deepEqual(parseRelease('Shang.Chi.and.the.Legend.of.the.Ten.Rings.2021.2160p.WEB-DL-DVSUX.mkv').languages,[]);
 assert.deepEqual(parseRelease('Example.2026.2160p.UHD.BDREMUX.HDR.DV.HEVC-Нечипорук.mkv').languages,[]);
 assert.ok(parseRelease('Example.2026.1080p.4xRus.Ukr.2xEng.HDCLUB.mkv').languages.includes('English'));
 const f={id:1,name:'Example.S01E02.1080p.Ukr.Ger.mkv',size:10};
 const stream=parsedStream({hash:hash(1),title:f.name,mediaMatched:true},{},f,{season:1,episode:2});
 assert.equal(filterAndSort([stream],prefs,{title:'Example',originalLanguage:'German'},{type:'series',season:1,episode:2}).length,1);
});
