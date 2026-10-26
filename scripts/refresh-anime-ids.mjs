// Metadata crosswalk only. No torrent sources, magnets, hashes, or user data.
import {writeFileSync} from 'node:fs';
const source='https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json';
const response=await fetch(source,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error('Metadata crosswalk unavailable');
const data=await response.json();
if(!Array.isArray(data))throw new Error('Invalid metadata crosswalk');
const rows=data.filter(row=>row.imdb_id?.some(id=>/^tt\d+$/.test(id))).map(row=>({
  mal:row.mal_id,kitsu:row.kitsu_id,anilist:row.anilist_id,anidb:row.anidb_id,
  imdb:row.imdb_id.filter(id=>/^tt\d+$/.test(id)),movie:row.type==='MOVIE',
  season:row.season?.tvdb,offset:row.episode_offset?.tvdb||0,
}));
writeFileSync(new URL('../deployment/anime-ids.json',import.meta.url),JSON.stringify(rows));
writeFileSync(new URL('../deployment/anime-ids-source.json',import.meta.url),JSON.stringify({source,retrievedAt:new Date().toISOString(),description:'Factual anime catalog ID crosswalk from Fribb/anime-lists. No torrent data.'},null,2));
console.log(JSON.stringify({metadataMappings:rows.length}));
