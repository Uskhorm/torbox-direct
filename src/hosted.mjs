import {existsSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {TorBox} from './torbox.mjs';
import {ReleaseIndex} from './index.mjs';
import {DirectEngine,publicSources} from './engine.mjs';
import {configurationCipher,ConfigurationError} from './configuration.mjs';
import {configureHTML,configureScript} from './configure.mjs';

// Multi-account hosting, ElfHosted style: the page starts blank, each visitor brings
// their own TorBox key, and the key only ever lives inside that visitor's encrypted
// install link. The server keeps an encryption secret and nothing account-specific.

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const MAX_ENGINES=64;
const MAX_BODY=8192;
const CONFIGURE_LIMIT=10,CONFIGURE_WINDOW_MS=10*60000;
const TOKEN=/^v1\.[A-Za-z0-9_-]{50,1600}$/;
const SECURITY_HEADERS={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
const PAGE_CSP="default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";

export function manifest(config,baseUrl) {
  return {
    id:'app.vercel.torbox-direct',version:'0.4.0',name:'TorBox Direct',
    description:'Direct TorBox cache checks and playback, with your 4K, Dolby Vision and IMAX stream style. Discovery uses an ID-to-hash release index.',
    logo:baseUrl+'/logo.png',
    resources:[{name:'stream',types:['movie','series','anime'],idPrefixes:['tt','tmdb:','mal:','kitsu:','anilist:','anidb:']}],
    types:['movie','series','anime'],catalogs:[],
    behaviorHints:{configurable:true,configurationRequired:!config},
  };
}

function loadPreferences() {
  return JSON.parse(readFileSync(join(ROOT,'deployment/preferences.json'),'utf8'));
}

function sharedIndex() {
  // Public release metadata only, shared between accounts. Never account data.
  try {return new ReleaseIndex(join(tmpdir(),'torbox-direct','public-releases-v2.sqlite'));}
  catch {return new ReleaseIndex();}
}

async function readJson(req) {
  const tooLarge=()=>new ConfigurationError('REQUEST_TOO_LARGE','Request too large.',413);
  if(!/^application\/json\b/i.test(String(req.headers['content-type']||'')))throw new ConfigurationError('UNSUPPORTED_MEDIA_TYPE','Send the form as JSON.',415);
  if(Number(req.headers['content-length'])>MAX_BODY)throw tooLarge();
  // Vercel's Node runtime pre-parses JSON bodies; a plain Node server leaves the stream.
  if(req.body!==undefined&&req.body!==null) {
    const raw=typeof req.body==='object'&&!Buffer.isBuffer(req.body)?JSON.stringify(req.body):String(req.body);
    if(Buffer.byteLength(raw)>MAX_BODY)throw tooLarge();
    return typeof req.body==='object'&&!Buffer.isBuffer(req.body)?req.body:JSON.parse(raw);
  }
  const chunks=[];let size=0;
  for await(const chunk of req) {
    size+=chunk.length;
    if(size>MAX_BODY)throw new ConfigurationError('REQUEST_TOO_LARGE','Request too large.',413);
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}

export function createHostedHandler({secret=process.env.TORBOX_DIRECT_SECRET,publicBaseUrl=process.env.PUBLIC_BASE_URL,fetchImpl=fetch,userData}={}) {
  let cipher,index,preferences,sources;
  const engines=new Map();
  const ready=()=>{
    cipher??=configurationCipher(secret);
    index??=sharedIndex();
    sources??=publicSources(index,{fetchImpl});
    preferences??=userData||loadPreferences();
  };
  // Best-effort per-instance throttle for link generation (each attempt calls TorBox).
  const attempts=new Map();
  const throttled=req=>{
    const ip=String(req.headers['x-real-ip']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'').split(',')[0].trim();
    const now=Date.now(),window=attempts.get(ip)?.filter(t=>now-t<CONFIGURE_WINDOW_MS)||[];
    const limited=window.length>=CONFIGURE_LIMIT;
    if(!limited)window.push(now);attempts.set(ip,window);
    if(attempts.size>10000)attempts.delete(attempts.keys().next().value);
    return limited;
  };
  const engineFor=config=>{
    const id=cipher.accountId(config);
    let engine=engines.get(id);
    if(engine){engines.delete(id);engines.set(id,engine);return engine;}
    if(engines.size>=MAX_ENGINES){
      const idle=[...engines].find(([,entry])=>!entry.activeRequests);
      if(!idle)throw new ConfigurationError('ADDON_BUSY','Try again in a moment.',503);
      engines.delete(idle[0]);idle[1].libraryIndex.close();
    }
    engine=new DirectEngine({
      index,libraryIndex:new ReleaseIndex(),
      torbox:new TorBox({apiKey:config.apiKey,fetchImpl}),
      userData:preferences,signingKey:cipher.signingKey(id),tmdbKey:config.tmdbKey,fetchImpl,sources,
    });
    engines.set(id,engine);
    return engine;
  };
  const baseUrl=req=>{
    if(publicBaseUrl)return publicBaseUrl.replace(/\/+$/,'');
    const proto=String(req.headers['x-forwarded-proto']||(req.socket?.encrypted?'https':'http')).split(',')[0].trim();
    const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
    if(!/^[A-Za-z0-9.-]+(:\d{1,5})?$/.test(host)||!/^https?$/.test(proto))throw new ConfigurationError('BAD_HOST','Unknown host.',400);
    return `${proto}://${host}`;
  };

  return async function handler(req,res) {
    const send=(status,body,headers={})=>{
      if(res.headersSent){res.end();return;}
      const isText=typeof body==='string';
      res.writeHead(status,{...SECURITY_HEADERS,'Content-Type':isText?'text/plain; charset=utf-8':'application/json; charset=utf-8',...headers});
      res.end(req.method==='HEAD'?undefined:(isText?body:JSON.stringify(body)));
    };
    try {
      let url=new URL(req.url,'http://placeholder.invalid');
      // vercel.json rewrites every path to /api/addon?__route=<path>.
      const route=url.searchParams.get('__route');
      if(route!==null)url=new URL('/'+route.replace(/^\/+/,''),'http://placeholder.invalid');
      const path=url.pathname;
      const addonHeaders={'Access-Control-Allow-Origin':'*'};
      if(req.method==='OPTIONS'){res.writeHead(204,{...SECURITY_HEADERS,...addonHeaders,'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS'});res.end();return;}
      if(req.method==='POST'&&path!=='/api/configure'&&path!=='/configure')return send(405,{error:{code:'METHOD_NOT_ALLOWED'}});
      if(!['GET','HEAD','POST'].includes(req.method))return send(405,{error:{code:'METHOD_NOT_ALLOWED'}});

      if(path==='/'&&req.method!=='POST'){res.writeHead(302,{...SECURITY_HEADERS,Location:'/configure'});res.end();return;}
      if(path==='/configure'&&req.method!=='POST')return send(200,configureHTML,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':PAGE_CSP,'X-Frame-Options':'DENY'});
      if(path==='/configure.js')return send(200,configureScript,{'Content-Type':'text/javascript; charset=utf-8'});
      if(path==='/health')return send(200,{ok:true});
      if(path==='/manifest.json')return send(200,manifest(null,baseUrl(req)),addonHeaders);
      if(['/logo.png','/logo.svg','/favicon.ico','/apple-touch-icon.png'].includes(path)){
        const type=path.endsWith('.ico')?'image/x-icon':path.endsWith('.png')?'image/png':'image/svg+xml';
        res.writeHead(200,{...SECURITY_HEADERS,...addonHeaders,'Content-Type':type,'Cache-Control':'public, max-age=86400'});
        res.end(req.method==='HEAD'?undefined:readFileSync(join(ROOT,'deployment',path.slice(1))));return;
      }
      if(path==='/source.zip') {
        const file=join(ROOT,'deployment/source.zip');
        if(!existsSync(file))return send(404,{error:{code:'NOT_FOUND'}});
        res.writeHead(200,{...SECURITY_HEADERS,'Content-Type':'application/zip','Content-Disposition':'attachment; filename="torbox-direct-source.zip"'});
        res.end(req.method==='HEAD'?undefined:readFileSync(file));return;
      }

      if((path==='/api/configure'||path==='/configure')&&req.method==='POST') {
        if(req.headers.origin&&req.headers.origin!==baseUrl(req))return send(403,{error:{code:'INVALID_ORIGIN',message:'Open the configure page to create your link.'}});
        ready();
        if(throttled(req))throw new ConfigurationError('TOO_MANY_ATTEMPTS','Too many attempts. Wait a few minutes and try again.',429);
        let input;
        try{input=await readJson(req);}catch(error){if(error instanceof ConfigurationError)throw error;throw new ConfigurationError('INVALID_REQUEST','Could not read the form. Try again.');}
        const token=cipher.seal(input);
        const config=cipher.open(token);
        // Prove the key works before handing out a link. The key is not logged or kept.
        try{await new TorBox({apiKey:config.apiKey,fetchImpl}).account();}
        catch(error){
          if(error.code==='TORBOX_UNREACHABLE'||error.code==='TORBOX_INVALID_RESPONSE')throw new ConfigurationError('TORBOX_UNAVAILABLE','TorBox is not answering right now. Try again shortly.',503);
          throw new ConfigurationError('TORBOX_REJECTED_KEY','TorBox did not accept this API key. Check it and try again.');
        }
        console.log(JSON.stringify({event:'configured'}));
        return send(200,{manifestUrl:`${baseUrl(req)}/${token}/manifest.json`});
      }

      const match=path.match(/^\/([^/]+)\/(.+)$/);
      if(!match||!TOKEN.test(match[1]))return send(404,{error:{code:'NOT_FOUND'}},addonHeaders);
      ready();
      const [,token,rest]=match;
      const config=cipher.open(token);
      if(rest==='configure'){res.writeHead(302,{...SECURITY_HEADERS,Location:'/configure'});res.end();return;}
      if(rest==='manifest.json')return send(200,manifest(config,baseUrl(req)),addonHeaders);
      const stream=rest.match(/^stream\/(movie|series|anime)\/([^/]+)\.json$/);
      if(stream) {
        const engine=engineFor(config);engine.activeRequests=(engine.activeRequests||0)+1;
        try {
          const result=await engine.search(stream[1],decodeURIComponent(stream[2]),`${baseUrl(req)}/${token}`);
          console.log(JSON.stringify({event:'search',type:stream[1],...result.metrics}));
          return send(200,{streams:result.streams},{...addonHeaders,'Server-Timing':`total;dur=${result.metrics.totalMs}, torbox;dur=${result.metrics.torboxMs}`});
        } catch(error) {
          console.log(JSON.stringify({event:'search-error',code:error.code||'INTERNAL_ERROR'}));
          // An unsupported ID is a normal "no streams" answer, not an addon failure.
          if(error.code==='UNSUPPORTED_ID')return send(200,{streams:[]},addonHeaders);
          return send(error.status||502,{streams:[],error:{code:error.code||'REQUEST_FAILED',message:error.code?error.message:'Request failed'}},addonHeaders);
        }finally{engine.activeRequests--;}
      }
      const play=rest.match(/^play\/([A-Za-z0-9_.-]+)$/);
      if(play&&(req.method==='GET'||req.method==='HEAD')) {
        const engine=engineFor(config);engine.activeRequests=(engine.activeRequests||0)+1;
        try{
          // A player probe must not mutate the account or create a download link.
          if(req.method==='HEAD'){engine.verify(play[1]);res.writeHead(204,{...SECURITY_HEADERS,...addonHeaders});res.end();return;}
          const target=await engine.playback(play[1]);
          console.log(JSON.stringify({event:'playback'}));
          res.writeHead(307,{...SECURITY_HEADERS,...addonHeaders,Location:target.url});res.end();return;
        }finally{engine.activeRequests--;}
      }
      return send(404,{error:{code:'NOT_FOUND'}},addonHeaders);
    } catch(error) {
      const status=error.status||(error instanceof ConfigurationError?400:502);
      if(!(error instanceof ConfigurationError))console.log(JSON.stringify({event:'error',code:error.code||'INTERNAL_ERROR'}));
      return send(status,{error:{code:error.code||'REQUEST_FAILED',message:error.code?error.message:'Request failed'}},{'Access-Control-Allow-Origin':'*'});
    }
  };
}
