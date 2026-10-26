import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createHostedHandler} from '../src/hosted.mjs';

const KEY_A='fixture-user-a-key-0123456789';
const KEY_B='fixture-user-b-key-9876543210';
const BAD_KEY='fixture-rejected-key-000000';
const shared='b'.repeat(40),ownedByA='c'.repeat(40);
const file={id:7,name:'Example.2026.IMAX.2160p.BluRay.REMUX.DV.HDR.mkv',short_name:'Example.2026.IMAX.2160p.BluRay.REMUX.DV.HDR.mkv',size:85005579251};
const fileA={id:9,name:'Example 2026 2160p WEB-DL DV HDR10+ DDP5.1 Atmos.mkv',short_name:'Example 2026 2160p WEB-DL DV HDR10+ DDP5.1 Atmos.mkv',size:30005579251};

function upstream(calls) {
  return async(url,options={})=>{
    const u=new URL(url),auth=options.headers?.Authorization;
    calls.push({host:u.hostname,path:u.pathname,auth,method:options.method||'GET',query:u.search});
    const ok=data=>new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});
    if(u.hostname==='v3-cinemeta.strem.io')return new Response(JSON.stringify({meta:{name:'Example',releaseInfo:'2026'}}));
    if(u.hostname==='zileanfortheweebs.midnightignite.me') {
      assert.equal(auth,undefined,'no TorBox credential reaches the metadata seed');
      return new Response(JSON.stringify(u.searchParams.get('Resolution')==='2160p'?[{info_hash:shared,raw_title:file.name,imdb_id:'tt123',size:file.size}]:[]));
    }
    if(u.hostname!=='api.torbox.app')throw new Error('Unexpected upstream '+u.hostname);
    if(auth===`Bearer ${BAD_KEY}`)return new Response(JSON.stringify({success:false,error:'BAD_TOKEN',detail:'bad'}),{status:403});
    if(u.pathname.endsWith('/user/me'))return ok({plan:1});
    if(u.pathname.endsWith('/checkcached'))return ok({[shared]:{hash:shared,name:file.name,size:file.size,files:[file]},[ownedByA]:{hash:ownedByA,name:fileA.name,size:fileA.size,files:[fileA]}});
    if(u.pathname.endsWith('/mylist')) {
      const mine=auth===`Bearer ${KEY_A}`?[{id:12,hash:ownedByA,name:fileA.name,size:fileA.size,files:[fileA]}]:[];
      return ok(u.searchParams.get('id')?mine[0]:[...mine,{id:11,hash:shared,name:file.name,size:file.size,files:[file]}]);
    }
    if(u.pathname.endsWith('/requestdl'))return ok('https://nexus-test.neur.tb-cdn.st/test-video.mkv');
    throw new Error('Unexpected TorBox route '+u.pathname);
  };
}

test('hosted addon: blank page, per-account encrypted links, isolated libraries, no stored key',async()=>{
  const calls=[];
  const userData=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8'));
  const logs=[];const log=console.log;console.log=(...a)=>logs.push(a.join(' '));
  const server=createServer(createHostedHandler({secret:randomBytes(32).toString('base64url'),fetchImpl:upstream(calls),userData}));
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  const configure=async apiKey=>fetch(base+'/api/configure',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey})});
  try {
    const page=await fetch(base+'/configure');const html=await page.text();
    assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
    assert.ok(!/value=/.test(html.match(/<input id="apiKey"[^>]*>/)[0]),'API key field starts empty');

    const blank=await (await fetch(base+'/manifest.json')).json();
    assert.equal(blank.behaviorHints.configurationRequired,true);

    const rejected=await configure(BAD_KEY);assert.equal(rejected.status,400);
    assert.equal((await rejected.json()).error.code,'TORBOX_REJECTED_KEY');

    const linkA=(await (await configure(KEY_A)).json()).manifestUrl;
    const linkB=(await (await configure(KEY_B)).json()).manifestUrl;
    for(const link of [linkA,linkB]) {
      assert.match(link,/^http:\/\/127\.0\.0\.1:\d+\/v1\.[A-Za-z0-9_-]+\/manifest\.json$/);
      assert.ok(!link.includes(KEY_A)&&!link.includes(KEY_B),'link never carries the plain key');
    }
    const baseA=linkA.replace(/\/manifest\.json$/,''),baseB=linkB.replace(/\/manifest\.json$/,'');

    const manifestA=await (await fetch(linkA)).json();
    assert.equal(manifestA.behaviorHints.configurationRequired,false);assert.deepEqual(manifestA.resources[0].idPrefixes,['tt']);
    const tampered=baseA.slice(0,-4)+(baseA.endsWith('AAAA')?'BBBB':'AAAA');
    assert.equal((await fetch(tampered+'/manifest.json')).status,404);

    const streamsA=(await (await fetch(baseA+'/stream/movie/tt123.json')).json()).streams;
    const streamsB=(await (await fetch(baseB+'/stream/movie/tt123.json')).json()).streams;
    assert.equal(streamsA.length,2,'account A sees the public release and its own library item');
    assert.equal(streamsB.length,1,'account B never sees account A\'s library');
    assert.ok(streamsA.every(s=>s.url.startsWith(baseA+'/play/')));

    const torboxAuth=new Set(calls.filter(c=>c.host==='api.torbox.app').map(c=>c.auth));
    assert.deepEqual([...torboxAuth].sort(),[`Bearer ${BAD_KEY}`,`Bearer ${KEY_A}`,`Bearer ${KEY_B}`].sort());

    const tokenA=streamsA[0].url.split('/play/')[1];
    const played=await fetch(baseA+'/play/'+tokenA,{redirect:'manual'});
    assert.equal(played.status,307);assert.match(played.headers.get('location'),/^https:\/\/nexus-test\.neur\.tb-cdn\.st\//);
    assert.equal((await fetch(baseB+'/play/'+tokenA,{redirect:'manual'})).status,403,'a play link only works under its own account');
    assert.ok(!calls.some(c=>c.path.includes('createtorrent')),'library and owned items never trigger an add');

    const unsupported=await fetch(baseA+'/stream/series/kitsu:1:1.json');
    assert.equal(unsupported.status,200);assert.deepEqual((await unsupported.json()).streams,[]);

    const logged=logs.join('\n');
    for(const secret of [KEY_A,KEY_B,BAD_KEY,baseA.split('/').pop(),baseB.split('/').pop()])assert.ok(!logged.includes(secret),'logs never contain keys or links');
  } finally {console.log=log;server.close();await once(server,'close');}
});
