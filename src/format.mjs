import {parseTorrentTitle} from '@viren070/parse-torrent-title';
import {createFormatter} from '../vendor/aiostreams-formatter.mjs';

const resolutionNames={'4k':'2160p','2k':'1440p'};
const languageNames={en:'English',eng:'English',english:'English',de:'German',german:'German',fr:'French',french:'French',ja:'Japanese',japanese:'Japanese',ru:'Russian',russian:'Russian',multi:'Multi','dual audio':'Dual Audio',dubbed:'Dubbed'};

export function parsedStream(release,cached,file,request) {
  const folder=parseTorrentTitle(release.title);
  const filename=file.short_name||file.name.split(/[\\/]/).pop();
  const parsed=parseTorrentTitle(filename);
  const hdr=[...new Set([...(folder.hdr||[]),...(parsed.hdr||[])])];
  const visualTags=[];
  if (hdr.some(x=>/dv|dolby.?vision/i.test(x))) visualTags.push(hdr.some(x=>/^hdr/i.test(x))?'HDR+DV':'DV');
  for (const tag of hdr) if (/^HDR(?:10\+?)?$/i.test(tag)) visualTags.push(tag.toUpperCase());
  if (/\bIMAX\b/i.test(release.title+' '+filename)) visualTags.push('IMAX');
  const fullName=release.title+' '+filename;
  if(folder.threeD||parsed.threeD||/\b3D\b|\b(?:FULL|HALF)[ ._-]*SBS\b/i.test(fullName))visualTags.push('3D');
  // IMAX Enhanced is a distribution format, not evidence of an AI upscale.
  if(/\bupscal(?:ed|e|ing)\b/i.test(fullName.replace(/\bIMAX[ ._-]+Enhanced\b/gi,'IMAX')))visualTags.push('Upscaled');
  if(/\bAI[ ._-]*(?:upscal|enhanc|remaster)/i.test(fullName))visualTags.push('AI');
  const languages=[...new Set([...(parsed.languages||[]),...(folder.languages||[])].map(x=>languageNames[String(x).toLowerCase()]||x))];
  return {
    id:`${release.hash}:${file.id}`,type:'debrid',filename,folderName:release.title,size:Number(file.size),folderSize:Number(cached.size)||release.size,
    library:false,service:{id:'torbox',cached:true},addon:{name:'TorBox Direct',preset:{type:'custom'},manifest:{id:'local.torbox.direct'}},torrent:{infoHash:release.hash},
    parsedFile:{title:parsed.title||folder.title,year:parsed.year||folder.year,resolution:resolutionNames[parsed.resolution||folder.resolution]||parsed.resolution||folder.resolution||'Unknown',quality:parsed.quality||folder.quality||'Unknown',visualTags:[...new Set(visualTags)],audioTags:parsed.audio||folder.audio||[],audioChannels:parsed.channels||folder.channels||[],languages:languages.length?languages:['Unknown'],releaseGroup:(parsed.group||folder.group||'').length>1?(parsed.group||folder.group):undefined,encode:parsed.codec||folder.codec,seasons:request.season===undefined?[]:[request.season],episodes:request.episode===undefined?[]:[request.episode],editions:[...new Set([...(folder.editions||[]),...(parsed.editions||[])])] },
    _release:release,_cached:cached,_file:file,_titles:[folder.title,parsed.title].filter(Boolean),
  };
}

function rank(value,preferences) { const i=preferences?.indexOf(value)??-1;return i<0?999:i; }
export function filterAndSort(streams,userData,metadata,request) {
  const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const titleWords=normalize(metadata.title).split(' ');
  streams=streams.filter(s=>{
    const p=s.parsedFile;const combined=normalize(s.folderName+' '+s.filename);
    if(!s._release.mediaMatched){
      if(userData.titleMatching?.enabled&&userData.titleMatching.mode==='exact'){
        const title=normalize(metadata.title);
        const latin=s=>normalize(s.replace(/[^\p{Script=Latin}\p{N}\s]/gu,' '));
        if(!s._titles.some(t=>normalize(t)===title||(latin(metadata.title)===title&&latin(t)===title)))return false;
      }else if(!titleWords.every(w=>combined.split(' ').includes(w)))return false;
      if((request.type==='movie'||request.season===1)&&userData.yearMatching?.enabled&&metadata.year&&p.year&&Number(p.year)!==metadata.year)return false;
    }
    if (userData.excludedQualities?.includes(p.quality) || userData.excludedResolutions?.includes(p.resolution)) return false;
    if (userData.excludedKeywords?.some(k=>combined.split(' ').includes(k.toLowerCase()))) return false;
    if (userData.excludedVisualTags?.some(t=>p.visualTags.includes(t))) return false;
    if (userData.requiredResolutions?.length && !userData.requiredResolutions.includes(p.resolution)) return false;
    if (userData.requiredQualities?.length && !userData.requiredQualities.includes(p.quality)) return false;
    if (userData.requiredVisualTags?.length && !userData.requiredVisualTags.some(t=>p.visualTags.includes(t))) return false;
    const required=userData.requiredLanguages||[];
    if (required.length && !p.languages.some(l=>required.includes(l)||(required.includes('Original')&&l===metadata.originalLanguage))) return false;
    return true;
  });
  const keys=userData.sortCriteria?.cached||[];
  return streams.sort((a,b)=>{
    for (const {key,direction} of keys) {
      let av=0,bv=0;
      if (key==='keyword') {av=(userData.preferredKeywords||[]).filter(k=>(a.folderName+' '+a.filename).toLowerCase().includes(k.toLowerCase())).length;bv=(userData.preferredKeywords||[]).filter(k=>(b.folderName+' '+b.filename).toLowerCase().includes(k.toLowerCase())).length;}
      else if (key==='resolution'||key==='quality'||key==='language') {const field=key==='resolution'?'preferredResolutions':key==='quality'?'preferredQualities':'preferredLanguages';av=-Math.min(...(key==='language'?a.parsedFile.languages:[a.parsedFile[key]]).map(v=>rank(v,userData[field])));bv=-Math.min(...(key==='language'?b.parsedFile.languages:[b.parsedFile[key]]).map(v=>rank(v,userData[field])));}
      else if (key==='visualTag') {av=-Math.min(999,...a.parsedFile.visualTags.map(v=>rank(v,userData.preferredVisualTags)));bv=-Math.min(999,...b.parsedFile.visualTags.map(v=>rank(v,userData.preferredVisualTags)));}
      else if (key==='size') {av=a.size;bv=b.size;}
      else continue;
      if (av!==bv) return direction==='asc'?av-bv:bv-av;
    }
    return a.id.localeCompare(b.id);
  });
}

export function formatter(userData,metadata) {return createFormatter({userData,addonName:userData.addonName,originalLanguage:metadata.originalLanguage,year:metadata.year,primaryTitle:metadata.title});}
