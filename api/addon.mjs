import {createHostedHandler} from '../src/hosted.mjs';

// The deployment contains an encryption secret, never a default TorBox account.
const handler=createHostedHandler();
export default handler;
