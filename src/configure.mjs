export const configureScript=`
const form=document.querySelector('form'),status=document.querySelector('#status');
const output=document.querySelector('#result'),manifest=document.querySelector('#manifest');
const submit=document.querySelector('#generate');
form.addEventListener('submit',async event=>{
  event.preventDefault();submit.disabled=true;output.hidden=true;manifest.value='';status.textContent='Checking your key…';
  try{
    const response=await fetch('/api/configure',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({apiKey:form.elements.apiKey.value.trim(),tmdbKey:form.elements.tmdbKey.value.trim()})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error?.message||'Could not create your link. Try again.');
    form.reset();manifest.value=data.manifestUrl;output.hidden=false;status.textContent='Your private link is ready.';
    document.querySelector('#install').href=data.manifestUrl.replace(/^https?:/, 'stremio:');
    manifest.focus();manifest.select();
  }catch(error){status.textContent=error.message||'Could not connect. Try again.';}
  finally{submit.disabled=false;}
});
document.querySelector('#copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(manifest.value);status.textContent='Copied. Paste this URL into Nuvio’s addon URL field.';}
  catch{manifest.focus();manifest.select();status.textContent='Select and copy the link, then paste it into Nuvio.';}
});
`;

export const configureHTML=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#0c1013"><link rel="icon" type="image/svg+xml" href="/logo.svg"><link rel="alternate icon" type="image/png" sizes="512x512" href="/logo.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><title>TorBox Direct · Configure</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100svh;background:#0c1013;color:#e9edef;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;display:grid;place-items:center;padding:48px 20px;background-image:radial-gradient(ellipse at 15% 0%,#18322b 0,transparent 55%)}main{width:100%;max-width:620px}.eyebrow{color:#86d6b4;letter-spacing:.18em;font-size:12px;text-transform:uppercase;font-weight:700}h1{font-size:clamp(36px,7vw,52px);letter-spacing:-.045em;line-height:1.1;margin:16px 0}p{color:#a8b2b9;margin:14px 0}.tags{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 30px}.tags span{border:1px solid #35433e;border-radius:100px;color:#c4d6cb;padding:4px 12px;font-size:12px}form,.result{background:#141b20;border:1px solid #2b373e;border-radius:20px;padding:28px}label{display:block;font-size:14px;font-weight:600;margin-bottom:9px}input{width:100%;min-width:0;border:1px solid #3b4a52;border-radius:10px;background:#0d1317;color:#ecf2ef;padding:14px;font:inherit}input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid #85e3b8;outline-offset:3px}small{display:block;color:#a8b2b9;font-size:12px;margin:8px 0 24px}a{color:#a0e6c4}button,.install{display:inline-block;border:0;border-radius:10px;padding:13px 18px;background:#94e3bd;color:#10271c;font:600 14px/1.4 system-ui;cursor:pointer;text-align:center;text-decoration:none}button:disabled{opacity:.55;cursor:wait}#generate{width:100%;margin-top:24px}details{margin-top:4px}summary{font-size:13px;color:#b5c6bd;cursor:pointer}details label{margin-top:18px}.result{margin-top:20px}.result p{font-size:13px}.result h2{font-size:20px;letter-spacing:-.02em;margin:0 0 18px}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.install{background:transparent;color:#b5c9c0;border:1px solid #46574e}#manifest{font:12px/1.6 ui-monospace,monospace}#status{min-height:26px;font-size:14px;color:#c1e5d2;margin:16px 0}.privacy{font-size:12px;max-width:550px}footer{margin-top:32px;font-size:12px;color:#789087}footer a{color:inherit}[hidden]{display:none!important}@media(max-width:440px){body{padding:32px 16px}form,.result{padding:22px}.actions>*{width:100%}}
</style></head><body><main>
<img src="/logo.png" alt="TorBox Direct" width="76" height="76" style="display:block;margin-bottom:24px;border-radius:18px"><div class="eyebrow">Nuvio & Stremio addon</div><h1>TorBox Direct</h1><p>Your cached streams. Your own TorBox account.</p>
<div class="tags"><span>Cached only</span><span>4K · Dolby Vision · IMAX preferred</span><span>Your stream card style</span></div>
<form autocomplete="off"><label for="apiKey">TorBox API key</label><input id="apiKey" name="apiKey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" minlength="16" maxlength="256" required placeholder="Enter your own API key"><small>Find it in your <a href="https://torbox.app/settings" target="_blank" rel="noreferrer">TorBox settings</a>.</small>
<details><summary>Optional: TMDB key for additional ID mapping coverage</summary><label for="tmdbKey">TMDB API key</label><input id="tmdbKey" name="tmdbKey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" minlength="16" maxlength="256"><small>Public ID mapping works without this; your key can improve coverage for unmapped TMDB IDs.</small></details>
<button id="generate" type="submit">Generate private manifest URL</button></form>
<div id="status" role="status" aria-live="polite"></div>
<section id="result" class="result" hidden><h2>Add to Nuvio</h2><label for="manifest">Private manifest URL</label><input id="manifest" readonly autocomplete="off" spellcheck="false"><div class="actions"><button id="copy" type="button">Copy manifest URL</button><a id="install" class="install">Install in Stremio</a></div><p>Paste the copied URL into Nuvio’s addon URL field. <strong>Treat this link like your TorBox API key.</strong> TorBox’s own download links contain your API key, so anyone who has this link can play through your account and read the key from a playback redirect.</p></section>
<p class="privacy">This page starts empty. Your key is checked with TorBox once, then encrypted into your private link. The server does not store it in any database or file, and this page does not keep it in your browser. The server decrypts your link only while answering your own requests, so you are trusting whoever runs this instance, as with any hosted addon. If a link leaks, regenerate your TorBox API key: every old link stops working.</p>
<footer>Release metadata index → direct TorBox cache checks → TorBox playback. <a href="/source.zip">Source · AGPL-3.0</a></footer>
</main><script src="/configure.js" defer></script></body></html>`;
