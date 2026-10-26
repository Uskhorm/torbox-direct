import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {Catalog,parseRequest} from '../src/catalog.mjs';
import {configurationCipher} from '../src/configuration.mjs';
import {DirectEngine} from '../src/engine.mjs';
import {ReleaseIndex} from '../src/index.mjs';

test('private configuration is randomized authenticated encryption and account signing is isolated',()=>{
  const cipher=configurationCipher(randomBytes(32).toString('base64url'));
  const a={apiKey:'account-a-fixture-123456789'},b={apiKey:'account-b-fixture-123456789'};
  const one=cipher.seal(a),two=cipher.seal(a);assert.notEqual(one,two);assert.deepEqual(cipher.open(one),{...a,tmdbKey:undefined});
  assert.equal(cipher.accountId(cipher.open(one)),cipher.accountId(cipher.open(two)));
  assert.notEqual(cipher.signingKey(cipher.accountId(a)),cipher.signingKey(cipher.accountId(b)));
  const raw=Buffer.from(one.slice(3),'base64url');assert.ok(!raw.includes(Buffer.from(a.apiKey)));raw[14]^=1;
  assert.throws(()=>cipher.open('v1.'+raw.toString('base64url')),{code:'INVALID_CONFIGURATION_LINK'});
});

test('anime ID conversion maps the exact cour episode without anime torrent scrapers',async()=>{
  const catalog=new Catalog({}, {fetchImpl:()=>{throw new Error('no network needed for metadata crosswalk');}});
  const film=await catalog.resolve(parseRequest('movie','mal:164'));assert.equal(film.id,'tt0119698');assert.equal(film.type,'movie');
  const bebop=await catalog.resolve(parseRequest('series','kitsu:1:7'));assert.equal(bebop.id,'tt0213338');assert.equal(bebop.season,1);assert.equal(bebop.episode,7);
  const cour=await catalog.resolve(parseRequest('series','mal:38524:1'));assert.equal(cour.id,'tt2560140');assert.equal(cour.season,3);assert.equal(cour.episode,13);
  await assert.rejects(()=>catalog.resolve(parseRequest('series','kitsu:9999999999:1')),{code:'ID_NOT_MAPPED'});
  await assert.rejects(()=>catalog.resolve(parseRequest('series','mal:38524:2:1')),{code:'UNSUPPORTED_ID'});
});

test('a release-index outage does not discard cached releases already known in the account',async()=>{
  const index=new ReleaseIndex(),libraryIndex=new ReleaseIndex(),hash='a'.repeat(40);
  const file={id:1,name:'Example.2026.2160p.BluRay.REMUX.mkv',size:10000};
  const userData=JSON.parse(readFileSync(new URL('../deployment/preferences.json',import.meta.url),'utf8'));
  const engine=new DirectEngine({index,libraryIndex,userData,signingKey:'fixture',torbox:{listOwned:async()=>[{hash,name:file.name,size:10000}],checkCached:async hashes=>{assert.ok(hashes.includes(hash));return new Map([[hash,{hash,size:10000,files:[file]}]]);}},fetchImpl:async url=>{
    if(new URL(url).hostname==='v3-cinemeta.strem.io')return new Response(JSON.stringify({meta:{name:'Example',releaseInfo:'2026'}}));
    return new Response('{}',{status:503});
  }});
  try{const result=await engine.search('movie','tt123','https://fixture.example/private');assert.equal(result.streams.length,1);assert.equal(result.metrics.cache,'existing-index');}
  finally{index.close();libraryIndex.close();}
});
