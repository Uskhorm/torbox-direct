import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {TorBox} from './torbox.mjs';
import {ReleaseIndex} from './index.mjs';
import {DirectEngine} from './engine.mjs';
import {configurationCipher,ConfigurationError} from './configuration.mjs';
import {configureHTML,configureScript} from './configure.mjs';

// Multi-account hosting, ElfHosted style: the page starts blank, each visitor brings
// their own TorBox key, and the key only ever lives inside that visitor's encrypted
// install link. The server keeps an encryption secret and nothing account-specific.

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const MAX_ENGINES=64;
const MAX_BODY=8192;
const TOKEN=/^v1\.[A-Za-z0-9_-]{50,1600}$/;
const SECURITY_HEADERS={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
const PAGE_CSP="default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";

export function manifest(config) {
  return {
    id:'app.vercel.torbox-direct',version:'0.2.0',name:'TorBox Direct',
    description:'Cached streams from your own TorBox account: release index → TorBox cache check → TorBox playback.',
    resources:[{name:'stream',types:['movie','series'],idPrefixes:config?.tmdbKey?['tt','tmdb:']:['tt']}],
    types:['movie','series'],catalogs:[],
    behaviorHints:{configurable:true,configurationRequired:!config},
  };
}

function loadPreferences() {
  return JSON.parse(readFileSync(join(ROOT,'deployment/preferences.json'),'utf8'));
}

function sharedIndex() {
  // Public release metadata only, shared between accounts. Never account data.
  try {return new ReleaseIndex(join(tmpdir(),'torbox-direct','releases.sqlite'));}
  catch {return new ReleaseIndex();}
}

async function readJson(req) {
  // Vercel's Node runtime pre-parses JSON bodies; a plain Node server leaves the stream.
  if(req.body!==undefined&&req.body!==null) {
    if(typeof req.body==='object'&&!Buffer.isBuffer(req.body))return req.body;
    if(String(req.body).length>MAX_BODY)throw new ConfigurationError('REQUEST_TOO_LARGE','Request too large.',413);
    return JSON.parse(String(req.body));
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
  let cipher,index,preferences;
  const engines=new Map();
  const ready=()=>{
    cipher??=configurationCipher(secret);
    index??=sharedIndex();
    preferences??=userData||loadPreferences();
  };
  const engineFor=(token,config)=>{
    const id=createHash('sha256').update(token).digest('base64url');
    let engine=engines.get(id);
    if(engine){engines.delete(id);engines.set(id,engine);return engine;}
    engine=new DirectEngine({
      index,libraryIndex:new ReleaseIndex(),
      torbox:new TorBox({apiKey:config.apiKey,fetchImpl}),
      userData:preferences,signingKey:cipher.signingKey(token),tmdbKey:config.tmdbKey,fetchImpl,
    });
    engines.set(id,engine);
    if(engines.size>MAX_ENGINES)engines.delete(engines.keys().next().value);
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
      const addonHeaders={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'};
      if(req.method==='OPTIONS'){res.writeHead(204,{...SECURITY_HEADERS,...addonHeaders,'Access-Control-Allow-Methods':'GET, HEAD, POST, OPTIONS'});res.end();return;}

      if(path==='/'&&req.method!=='POST'){res.writeHead(302,{...SECURITY_HEADERS,Location:'/configure'});res.end();return;}
      if(path==='/configure'&&req.method!=='POST')return send(200,configureHTML,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':PAGE_CSP,'X-Frame-Options':'DENY'});
      if(path==='/configure.js')return send(200,configureScript,{'Content-Type':'text/javascript; charset=utf-8'});
      if(path==='/health')return send(200,{ok:true});
      if(path==='/manifest.json')return send(200,manifest(null),addonHeaders);
      if(path==='/source.zip') {
        const file=join(ROOT,'deployment/source.zip');
        if(!existsSync(file))return send(404,{error:{code:'NOT_FOUND'}});
        res.writeHead(200,{...SECURITY_HEADERS,'Content-Type':'application/zip','Content-Disposition':'attachment; filename="torbox-direct-source.zip"'});
        res.end(req.method==='HEAD'?undefined:readFileSync(file));return;
      }

      if((path==='/api/configure'||path==='/configure')&&req.method==='POST') {
        ready();
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
      if(rest==='manifest.json')return send(200,manifest(config),addonHeaders);
      const engine=engineFor(token,config);
      const stream=rest.match(/^stream\/(movie|series)\/([^/]+)\.json$/);
      if(stream) {
        try {
          const result=await engine.search(stream[1],decodeURIComponent(stream[2]),`${baseUrl(req)}/${token}`);
          console.log(JSON.stringify({event:'search',type:stream[1],...result.metrics}));
          return send(200,{streams:result.streams},{...addonHeaders,'Server-Timing':`total;dur=${result.metrics.totalMs}, torbox;dur=${result.metrics.torboxMs}`});
        } catch(error) {
          console.log(JSON.stringify({event:'search-error',code:error.code||'INTERNAL_ERROR'}));
          // An unsupported ID is a normal "no streams" answer, not an addon failure.
          if(error.code==='UNSUPPORTED_ID')return send(200,{streams:[]},addonHeaders);
          return send(error.status||502,{streams:[],error:{code:error.code||'REQUEST_FAILED',message:error.code?error.message:'Request failed'}},addonHeaders);
        }
      }
      const play=rest.match(/^play\/([A-Za-z0-9_.-]+)$/);
      if(play&&(req.method==='GET'||req.method==='HEAD')) {
        const target=await engine.playback(play[1]);
        console.log(JSON.stringify({event:'playback'}));
        res.writeHead(307,{...SECURITY_HEADERS,...addonHeaders,Location:target.url});res.end();return;
      }
      return send(404,{error:{code:'NOT_FOUND'}},addonHeaders);
    } catch(error) {
      const status=error.status||(error instanceof ConfigurationError?400:502);
      if(!(error instanceof ConfigurationError))console.log(JSON.stringify({event:'error',code:error.code||'INTERNAL_ERROR'}));
      return send(status,{error:{code:error.code||'REQUEST_FAILED',message:error.code?error.message:'Request failed'}},{'Access-Control-Allow-Origin':'*'});
    }
  };
}
