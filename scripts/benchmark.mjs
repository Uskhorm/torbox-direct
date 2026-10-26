// Deterministic network fixture. No accounts, keys or live content required.
import {performance} from 'node:perf_hooks';
import {readFileSync} from 'node:fs';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {TorBox} from '../src/torbox.mjs';
const index=new ReleaseIndex(),libraryIndex=new ReleaseIndex(),calls=[];
const hashes=Array.from({length:3000},(_,i)=>(i+1).toString(16).padStart(40,'0'));
const cached=hashes.slice(-80);
const fetchImpl=async(url,options={})=>{
 const u=new URL(url);calls.push(u.pathname);await new Promise(r=>setTimeout(r,15));
 if(u.hostname==='api.torbox.app'){
  if(u.pathname.endsWith('/mylist'))return new Response(JSON.stringify({success:true,data:[]}));
  if(!u.pathname.endsWith('/checkcached'))throw new Error('Benchmark must not request playback');
  const requested=JSON.parse(options.body).hashes;
  return new Response(JSON.stringify({success:true,data:Object.fromEntries(cached.filter(h=>requested.includes(h)).map((h,i)=>[h,{hash:h,files:[1,2].map(episode=>({id:episode,name:`Example.S01E0${episode}.2160p.BluRay.REMUX.DV-G${i}.mkv`,size:1000000000+i}))}]))}));
 }
 return new Response(JSON.stringify({meta:{name:'Example',releaseInfo:'2026'}}));
};
const sources={seed:{candidates:async request=>{index.import(hashes.map(hash=>({hash,title:'Example.S01.2160p.BluRay.REMUX.DV',media:[request.key]})),'benchmark');return {source:'fixture'};}},discovery:{candidates:async()=>({source:'fixture'})}};
const engine=new DirectEngine({index,libraryIndex,torbox:new TorBox({apiKey:'benchmark-fixture',fetchImpl}),userData:JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url))),signingKey:'fixture',sources,fetchImpl});
const results=[];
try{
 for(const [name,id] of [['cold','tt123:1:1'],['nextEpisode','tt123:1:2'],['repeat','tt123:1:2']]){
  const before=calls.length,start=performance.now(),result=await engine.search('series',id,'https://benchmark.invalid/config');
  results.push({name,ms:Math.round((performance.now()-start)*100)/100,streams:result.streams.length,upstreamCalls:calls.length-before,torboxCalls:calls.slice(before).filter(x=>x.includes('/torrents/')).length});
 }
 console.log(JSON.stringify({fixture:'3000 candidate hashes, 80 cached two-episode packs, 15ms simulated upstream',results},null,2));
 if(results.some(x=>x.streams!==80)||results[1].torboxCalls||results[2].upstreamCalls)process.exitCode=1;
}finally{index.close();libraryIndex.close();}
