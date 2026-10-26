import {parseFile,sortNative,normaliseTitle} from '../vendor/aiostreams-parser.mjs';
import {createFormatter} from '../vendor/aiostreams-formatter.mjs';


export function parseRelease(value){
  const parsed=parseFile(value);
  // A title (Shang-Chi) or a Cyrillic release-group name does not identify the
  // audio language. Parse language labels from the attributes after the title.
  let attributes=String(value);
  if(parsed.title){
    const words=parsed.title.match(/[\p{L}\p{N}&]+/gu)||[];
    const pattern=words.map(word=>/^(?:and|&)$/i.test(word)?'(?:and|&)':word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[\\s._:-]+');
    if(pattern)attributes=attributes.replace(new RegExp(pattern,'iu'),' ');
  }
  if(parsed.releaseGroup)attributes=attributes.replace(parsed.releaseGroup,' ');
  attributes=attributes.replace(/[^\p{Script=Latin}\p{N}\p{P}\p{Z}]/gu,' ');
  const languageFile=parseFile('Media '+attributes);
  const countedLanguages=[];
  if(/(?:^|[ ._-])\d+xEng(?:[ ._-]|$)/i.test(attributes))countedLanguages.push('English');
  if(/(?:^|[ ._-])\d+xRus(?:[ ._-]|$)/i.test(attributes))countedLanguages.push('Russian');
  return {...parsed,languages:[...new Set([...(languageFile.languages||[]),...countedLanguages])]};
}

export function parsedStream(release,cached,file,request,parse=parseRelease) {
  const folder=parse(release.title);
  const filename=file.short_name||file.name.split(/[\\/]/).pop();
  const parsed=parse(filename),fullName=release.title+' '+filename;
  const visualTags=[...new Set([...(folder.visualTags||[]),...(parsed.visualTags||[])])];
  if (/\bIMAX\b/i.test(fullName)&&!visualTags.includes('IMAX'))visualTags.push('IMAX');
  if(/\b3D\b|\b(?:FULL|HALF)[ ._-]*SBS\b/i.test(fullName)&&!visualTags.includes('3D'))visualTags.push('3D');
  if(/\bupscal(?:ed|e|ing)\b/i.test(fullName.replace(/\bIMAX[ ._-]+Enhanced\b/gi,'IMAX'))&&!visualTags.includes('Upscaled'))visualTags.push('Upscaled');
  if(/\bAI[ ._-]*(?:upscal|enhanc|remaster)/i.test(fullName)&&!visualTags.includes('AI'))visualTags.push('AI');
  const languages=[...new Set([...(parsed.languages||[]),...(folder.languages||[])])];
  return {
    id:`${release.hash}:${file.id}`,type:'debrid',filename,folderName:release.title,size:Number(file.size),folderSize:Number(cached.size)||release.size,
    library:false,service:{id:'torbox',cached:true},addon:{name:'TorBox Direct',preset:{type:'custom'},manifest:{id:'local.torbox.direct'}},torrent:{infoHash:release.hash},
    parsedFile:{...folder,...parsed,title:parsed.title||folder.title,year:parsed.year||folder.year,resolution:parsed.resolution||folder.resolution||'Unknown',quality:parsed.quality||folder.quality||'Unknown',visualTags,audioTags:parsed.audioTags?.length?parsed.audioTags:folder.audioTags||[],audioChannels:parsed.audioChannels?.length?parsed.audioChannels:folder.audioChannels||[],languages:languages.length?languages:['Unknown'],releaseGroup:parsed.releaseGroup||folder.releaseGroup,encode:parsed.encode||folder.encode,seasons:request.season===undefined?[]:[request.season],episodes:request.episode===undefined?[]:[request.episode],editions:[...new Set([...(folder.editions||[]),...(parsed.editions||[])])] },
    _release:release,_cached:cached,_file:file,_titles:[folder.title,parsed.title].filter(Boolean),
  };
}

export function filterAndSort(streams,userData,metadata,request) {
  const normalize=s=>String(s).normalize('NFKC').replace(/&/g,' and ').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const titleWords=normalize(metadata.title).split(' ');
  streams=streams.filter(s=>{
    const p=s.parsedFile;const combined=normalize(s.folderName+' '+s.filename);
    if(!s._release.mediaMatched){
      if(userData.titleMatching?.enabled&&userData.titleMatching.mode==='exact'){
        const title=normalize(metadata.title);
        const latin=s=>normalize(s.replace(/[^\p{Script=Latin}\p{N}\s]/gu,' '));
        if(!s._titles.some(t=>[metadata.title,...metadata.aliases||[]].some(expected=>normaliseTitle(t)===normaliseTitle(expected))||(latin(metadata.title)===title&&latin(t)===title)))return false;
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
    if(p.languages.includes(metadata.originalLanguage)&&!p.languages.includes('Original'))p.languages=[...p.languages,'Original'];
    if (required.length && !p.languages.some(l=>required.includes(l))) return false;
    return true;
  });
  for(const stream of streams)stream.keywordMatched=(userData.preferredKeywords||[]).some(keyword=>(stream.folderName+' '+stream.filename).toLowerCase().includes(keyword.toLowerCase()));
  return sortNative(streams,{...userData,sortCriteria:{global:[],cached:[],uncached:[],...userData.sortCriteria}},{type:request.type,isAnime:!!(request.anime||metadata.anime)});
}

export function formatter(userData,metadata) {return createFormatter({userData,addonName:userData.addonName,originalLanguage:metadata.originalLanguage,year:metadata.year,primaryTitle:metadata.title});}
