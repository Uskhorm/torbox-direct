import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ReleaseIndex} from '../src/index.mjs';
if(!process.argv[2])throw new Error('Usage: node scripts/import.mjs <release-metadata.json>');
const d=JSON.parse(readFileSync(process.argv[2],'utf8'));
const rows=Array.isArray(d)?d:d.torrents;
if(!Array.isArray(rows))throw new Error('Expected a release list or an object with torrents[]');
const index=new ReleaseIndex(resolve(import.meta.dirname,'../data/releases.sqlite'));
try{const added=index.import(rows.map(x=>({hash:x.hash||x.info_hash,title:x.title||x.filename||x.raw_title,size:x.size||x.bytes,media:x.media||[]})),'manual-import');console.log(JSON.stringify({imported:added,...index.stats()}));}finally{index.close();}
