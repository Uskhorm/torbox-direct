// Metadata crosswalk only. No torrent sources, magnets, hashes, or user data.
import {writeFileSync} from 'node:fs';
const source='https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json';
const response=await fetch(source,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error('Metadata crosswalk unavailable');
const data=await response.json();
if(!Array.isArray(data))throw new Error('Invalid metadata crosswalk');
const kitsuSource='https://raw.githubusercontent.com/TheBeastLT/stremio-kitsu-anime/master/static/data/imdb_mapping.json';
const kitsuResponse=await fetch(kitsuSource,{signal:AbortSignal.timeout(30000)});
if(!kitsuResponse.ok)throw new Error('Supplementary metadata crosswalk unavailable');
const kitsuRows=await kitsuResponse.json(),kitsu=new Map(kitsuRows.map(row=>[row.kitsu_id,row]));
const rows=data.map(row=>{const supplement=kitsu.get(row.kitsu_id);return {
  mal:row.mal_id,kitsu:row.kitsu_id,anilist:row.anilist_id,anidb:row.anidb_id,
  imdb:(row.imdb_id?.length?row.imdb_id:[supplement?.imdb_id]).filter(id=>/^tt\d+$/.test(id||'')),movie:row.type==='MOVIE',
  season:row.season?.tvdb??supplement?.fromSeason,offset:row.episode_offset?.tvdb??((supplement?.fromEpisode||1)-1),title:supplement?.title,
};}).filter(row=>row.imdb.length);
writeFileSync(new URL('../deployment/anime-ids.json',import.meta.url),JSON.stringify(rows));
writeFileSync(new URL('../deployment/anime-ids-source.json',import.meta.url),JSON.stringify({source,kitsuSource,retrievedAt:new Date().toISOString(),description:'Factual anime catalog ID crosswalk. No torrent data.'},null,2));
console.log(JSON.stringify({metadataMappings:rows.length}));
