// Live check of the hosted addon with a real TorBox key, without printing the key,
// the generated install link or any playback URL.
// usage: node scripts/verify-hosted.mjs <aiostreams-config-with-keys.json> [baseUrl]
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const config=JSON.parse(readFileSync(process.argv[2],'utf8'));
const apiKey=config.services.find(s=>s.id==='torbox').credentials.apiKey;
const base=(process.argv[3]||'https://nuvio-torbox-direct.vercel.app').replace(/\/+$/,'');
const timed=async(url,init)=>{const t=performance.now();const r=await fetch(url,init);return {r,ms:Math.round(performance.now()-t)};};
const out=[];const note=(...a)=>{const line=a.join(' ');out.push(line);console.log(line);};

for(const path of ['/configure','/manifest.json','/health','/source.zip']) {
  const {r,ms}=await timed(base+path);const body=Buffer.from(await r.arrayBuffer());
  note(`GET ${path} -> ${r.status} ${ms}ms ${r.headers.get('content-type')} ${body.length}B`);
  if(path==='/configure')note(`  key field empty: ${!/value=/.test((body.toString().match(/<input id="apiKey"[^>]*>/)||[''])[0])}`);
  if(path==='/manifest.json')note(`  configurationRequired: ${JSON.parse(body).behaviorHints.configurationRequired}`);
}
{
  const {r,ms}=await timed(base+'/api/configure',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey:'not-a-real-torbox-key-000000'})});
  note(`POST /api/configure (bad key) -> ${r.status} ${ms}ms ${(await r.json()).error?.code}`);
}
const {r:cr,ms:cms}=await timed(base+'/api/configure',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey,tmdbKey:config.tmdbApiKey})});
const created=await cr.json();
note(`POST /api/configure (real key) -> ${cr.status} ${cms}ms link issued: ${Boolean(created.manifestUrl)} plain key in link: ${String(created.manifestUrl).includes(apiKey)}`);
if(!created.manifestUrl)process.exit(1);
mkdirSync(resolve(root,'data'),{recursive:true});
writeFileSync(resolve(root,'data/hosted-install-url.private.txt'),created.manifestUrl);
const link=created.manifestUrl.replace(/\/manifest\.json$/,'');
const m=await timed(created.manifestUrl);const manifest=await m.r.json();
note(`GET <link>/manifest.json -> ${m.r.status} ${m.ms}ms configurationRequired=${manifest.behaviorHints.configurationRequired} prefixes=${manifest.resources[0].idPrefixes}`);

const owned=new Set();
{
  const r=await fetch('https://api.torbox.app/v1/api/torrents/mylist?limit=1000',{headers:{Authorization:`Bearer ${apiKey}`}});
  for(const t of (await r.json()).data||[])owned.add(String(t.hash).toLowerCase());
  note(`account library items: ${owned.size}`);
}
const results={};
for(const id of ['movie/tt12042730','movie/tt12042730','series/tt0944947:1:1','series/tt5753856:1:2','movie/tt29623480','movie/tt0111161']) {
  const {r,ms}=await timed(`${link}/stream/${id}.json`);const body=await r.json();
  const streams=body.streams||[];
  const inLibrary=streams.filter(s=>{try{return owned.has(JSON.parse(Buffer.from(s.url.split('/play/')[1].split('.')[0],'base64url')).h);}catch{return false;}});
  results[id]=streams;
  note(`GET stream/${id} -> ${r.status} ${ms}ms streams=${streams.length} fromYourLibrary=${inLibrary.length}${body.error?' error='+body.error.code:''}`);
  for(const s of streams.slice(0,3))note(`    ${s.name.replace(/\n/g,' ')} | ${String(s.description).replace(/\n/g,' ').slice(0,110)}`);
}
// Play only releases already in the account, so verification never adds anything.
let played=0;
for(const id of ['movie/tt12042730','series/tt0944947:1:1','series/tt5753856:1:2']) {
  const pick=(results[id]||[]).find(s=>{try{return owned.has(JSON.parse(Buffer.from(s.url.split('/play/')[1].split('.')[0],'base64url')).h);}catch{return false;}});
  if(!pick){note(`play ${id}: no library-owned stream listed, skipped`);continue;}
  const {r,ms}=await timed(pick.url,{redirect:'manual'});
  const location=r.headers.get('location')||'';
  let cdn='none',bytes=0,type='';
  if(location){const t=performance.now();const c=await fetch(location,{headers:{Range:'bytes=0-1048575'}});bytes=(await c.arrayBuffer()).byteLength;type=c.headers.get('content-type');cdn=`${new URL(location).hostname.replace(/^[^.]+\./,'*.')} ${c.status} ${Math.round(performance.now()-t)}ms`;}
  note(`play ${id} -> ${r.status} ${ms}ms cdn=${cdn} ${type} ${bytes}B`);played++;
}
writeFileSync(resolve(root,'data/hosted-verification.json'),JSON.stringify({base,at:new Date().toISOString(),lines:out},null,2));
