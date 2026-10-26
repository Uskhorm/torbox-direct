// Copies stream preferences (filters, sorting, formatter) from an AIOStreams config export
// into deployment/preferences.json, the default profile for every install link.
// Credentials and service settings are never copied.
// usage: node scripts/import-preferences.mjs <aiostreams-config-export.json>
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

if(!process.argv[2])throw new Error('Usage: node scripts/import-preferences.mjs <aiostreams-config-export.json>');
const exported=JSON.parse(readFileSync(process.argv[2],'utf8'));
const allow=/^(preferred|required|excluded|included|synced|ranked)|^(sortCriteria|deduplicator|formatter|addonName|titleMatching|yearMatching|seasonEpisodeMatching|digitalReleaseFilter|size|enableSeadex|regexOverrides|selOverrides)$/;
const deny=/api_?key|token|password|secret|credential|uuid|url$/i;
const preferences=Object.fromEntries(Object.entries(exported).filter(([key])=>allow.test(key)&&(!deny.test(key)||/^synced.*Urls$/.test(key))));
const out=resolve(import.meta.dirname,'../deployment/preferences.json');
writeFileSync(out,JSON.stringify(preferences,null,2)+'\n');
console.log(JSON.stringify({written:'deployment/preferences.json',keys:Object.keys(preferences).length}));
