// Rebuild the AIOStreams v2.37 parser/sorter from the included AGPL sources.
// The sorter has no awaits; remove its redundant async modifier so the existing
// synchronous adapter can call the upstream algorithm without a Promise wrapper.
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
await build({absWorkingDir:root,entryPoints:['scripts/vendor-entry/parser.ts'],outfile:'vendor/aiostreams-parser.mjs',bundle:true,platform:'node',format:'esm',target:'node24',external:['@viren070/parse-torrent-title'],plugins:[{name:'sync-sorter',setup(builder){
  builder.onLoad({filter:/[\\/]streams[\\/]sorter\.ts$/},args=>{
    const source=readFileSync(args.path,'utf8');
    if(/\bawait\b/.test(source))throw new Error('The upstream sorter is now asynchronous; update the adapter.');
    return {contents:source.replace('public async sort(','public sort('),loader:'ts'};
  });
}}]});
console.log('Built vendor/aiostreams-parser.mjs from the included AIOStreams source');
