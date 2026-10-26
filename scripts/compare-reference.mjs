// Read-only comparison: fetch stream lists and check hashes. Never resolve play URLs.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ReleaseIndex} from '../src/index.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {TorBox,selectFile} from '../src/torbox.mjs';
import {parseRequest} from '../src/catalog.mjs';
import {normaliseTitle,parseFile} from '../vendor/aiostreams-parser.mjs';

export const cases=[
  ['movie','tt6263850','Deadpool & Wolverine'],['movie','tt9376612','Shang-Chi'],
  ['movie','tt10872600','Spider-Man: No Way Home'],['movie','tt3315342','Logan'],
  ['series','tt5753856:1:2','Dark S1E2'],['series','tt0944947:1:1','Game of Thrones S1E1'],
  ['series','tt3498252:1:1','Inferno Cop E1'],['series','tt11680468:1:1','Great Pretender E1'],
];

export function streamHashes(stream){
  const found=new Set();
  function scan(value,depth=0){
    if(depth>6||value===null)return;
    if(typeof value==='string'&&/^[a-f0-9]{40}$/i.test(value))found.add(value.toLowerCase());
    else if(Array.isArray(value))value.forEach(x=>scan(x,depth+1));
    else if(typeof value==='object')for(const [key,item] of Object.entries(value))if(!/key|token|password|secret/i.test(key))scan(item,depth+1);
  }
  scan(stream.infoHash);
  const url=stream.url||'';
  for(const match of url.matchAll(/(?<![a-f0-9])[a-f0-9]{40}(?![a-f0-9])/gi))found.add(match[0].toLowerCase());
  try{
    for(const part of new URL(url).pathname.split('/')){
      try{scan(JSON.parse(Buffer.from(part.split('.')[0],'base64url').toString('utf8')));}catch{}
    }
  }catch{}
  return [...found];
}

export async function compareCase({engine,referenceManifest,type,id,label}){
  const request=await engine.catalog.resolve(parseRequest(type,id));
  const metadata=await engine.catalog.metadata(request);
  const endpoint=referenceManifest.replace(/manifest\.json(?:\?.*)?$/,`stream/${type}/${encodeURIComponent(id)}.json`);
  const [response,direct]=await Promise.all([
    fetch(endpoint,{signal:AbortSignal.timeout(55000),redirect:'error'}).then(async r=>{if(!r.ok)throw new Error('Reference unavailable');return r.json();}),
    engine.search(type,id,'https://comparison.invalid/config'),
  ]);
  const reference=(response.streams||[]).filter(s=>s.url&&s.behaviorHints?.filename);
  const available=await engine.torbox.checkCached(reference.flatMap(streamHashes),{fresh:true});
  const directHashes=new Set(direct.streams.flatMap(streamHashes));
  const fileKey=(name,size)=>`${normaliseTitle(name)}:${size}`;
  const directFiles=new Set(direct.streams.map(s=>fileKey(s.behaviorHints.filename,s.behaviorHints.videoSize)));
  const absoluteEpisode=request.anime?Object.entries(metadata.seasonEpisodes||{}).filter(([s])=>Number(s)<request.season).reduce((sum,[,count])=>sum+count,request.episode):undefined;
  let valid=0,covered=0;const missing=[],unverified=[],mismatched=[];
  for(const stream of reference){
    const filename=stream.behaviorHints.filename,size=Number(stream.behaviorHints.videoSize)||0;
    const hashes=streamHashes(stream).filter(hash=>available.has(hash));
    if(!hashes.length){unverified.push({filename,size});continue;}
    const matches=hashes.filter(hash=>{
      const file=selectFile(available.get(hash).files,{...request,title:metadata.title,folderName:available.get(hash).name,absoluteEpisode,parse:parseFile});
      if(!file)return false;
      const name=(file.short_name||file.name).split(/[\\/]/).pop();
      // Compare the actual selected episode/movie, never the size of a whole pack.
      return name===filename || size&&Number(file.size)===size;
    });
    if(!matches.length){mismatched.push({filename,size});continue;}
    valid++;
    if(matches.some(hash=>directHashes.has(hash)||available.get(hash).files.some(file=>directFiles.has(fileKey((file.short_name||file.name).split(/[\\/]/).pop(),file.size))))){covered++;continue;}
    missing.push({filename,size,hashes:matches,indexed:matches.some(hash=>!!engine.index.db.prepare('SELECT 1 FROM media_releases WHERE media=? AND hash=?').get(request.key,hash))});
  }
  const result={label,type,id,reference:reference.length,valid,covered,missing,unverified,mismatched,direct:direct.streams.length,metrics:direct.metrics,top:direct.streams.slice(0,5).map(s=>({filename:s.behaviorHints.filename,size:s.behaviorHints.videoSize}))};
  console.log(JSON.stringify(result));return result;
}

async function main(){
  const args=process.argv.slice(2),option=name=>args[args.indexOf(name)+1];
  if(!args.includes('--runtime'))throw new Error('Usage: node scripts/compare-reference.mjs --runtime <private runtime JSON> [--case <IMDb ID>] [--output <sanitized JSON>]');
  const runtime=JSON.parse(readFileSync(resolve(option('--runtime')),'utf8'));
  const credentials=JSON.parse(readFileSync(runtime.aiostreamsConfig,'utf8'));
  const apiKey=credentials.services.find(x=>x.id==='torbox')?.credentials?.apiKey;
  const index=new ReleaseIndex(),libraryIndex=new ReleaseIndex();
  const engine=new DirectEngine({index,libraryIndex,torbox:new TorBox({apiKey}),userData:JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8')),signingKey:'read-only-comparison',tmdbKey:credentials.tmdbApiKey});
  const results=[];
  try{
    for(const [type,id,label] of cases.filter(x=>!args.includes('--case')||x[1]===option('--case'))){
      try{results.push(await compareCase({engine,referenceManifest:runtime.fallbackManifest,type,id,label}));}
      catch{const result={label,type,id,error:'Comparison unavailable'};results.push(result);console.log(JSON.stringify(result));}
    }
    if(args.includes('--output'))writeFileSync(resolve(option('--output')),JSON.stringify({at:new Date().toISOString(),results},null,2));
  }finally{index.close();libraryIndex.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(()=>{console.error('Comparison failed; no private URLs or credentials were logged.');process.exitCode=1;});
