// Self-hosting entry point (VPS, Docker, home server). Vercel uses api/addon.mjs instead.
// Requires TORBOX_DIRECT_SECRET: 32 random bytes as base64url, e.g.
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
import {createServer} from 'node:http';
import {createHostedHandler} from './hosted.mjs';

const port=Number(process.env.PORT)||7000;
const host=process.env.HOST||'0.0.0.0';
createServer(createHostedHandler()).listen(port,host,()=>console.log(JSON.stringify({event:'listening',host,port})));
