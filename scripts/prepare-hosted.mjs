// Builds deployment/source.zip, the AGPL-3.0 corresponding source served at /source.zip.
// It is exactly the committed tree (git archive), so commit before deploying.
// No account data is involved: the hosted service only knows TORBOX_DIRECT_SECRET and
// each user's TorBox key lives encrypted inside their own install link.
import {execFileSync} from 'node:child_process';
import {mkdirSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const dirty=execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim();
if(dirty)throw new Error('Commit your changes first: /source.zip must match the deployed code.');
mkdirSync(resolve(root,'deployment'),{recursive:true});
rmSync(resolve(root,'deployment/source.zip'),{force:true});
execFileSync('git',['archive','--format=zip','-o','deployment/source.zip','HEAD'],{cwd:root});
const commit=execFileSync('git',['rev-parse','--short','HEAD'],{cwd:root,encoding:'utf8'}).trim();
console.log(JSON.stringify({sourceArchive:'deployment/source.zip',commit}));
