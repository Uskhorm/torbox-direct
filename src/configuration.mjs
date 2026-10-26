import {createCipheriv,createDecipheriv,createHmac,randomBytes} from 'node:crypto';

export class ConfigurationError extends Error {
  constructor(code,message,status=400){super(message);this.code=code;this.status=status;}
}

export function validateConfiguration(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ConfigurationError('INVALID_CONFIGURATION','Enter your TorBox API key.');
  const credential=(value,required)=>{
    if(value===undefined||value===''){
      if(required)throw new ConfigurationError('API_KEY_REQUIRED','Enter your TorBox API key.');
      return undefined;
    }
    if(typeof value!=='string'||!/^[\x21-\x7e]{16,256}$/.test(value.trim()))throw new ConfigurationError('INVALID_API_KEY','Check the API key and try again.');
    return value.trim();
  };
  return {apiKey:credential(input.apiKey,true),tmdbKey:credential(input.tmdbKey,false)};
}

export function configurationCipher(secret) {
  if(typeof secret!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(secret)||Buffer.from(secret,'base64url').length!==32)throw new ConfigurationError('CONFIGURATION_UNAVAILABLE','Configuration is temporarily unavailable.',503);
  const key=Buffer.from(secret,'base64url');
  return {
    seal(input){
      const config=validateConfiguration(input);
      const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
      cipher.setAAD(Buffer.from('torbox-direct:configuration:v1'));
      const encrypted=Buffer.concat([cipher.update(JSON.stringify(config)),cipher.final()]);
      return 'v1.'+Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');
    },
    open(token){
      try{
        if(typeof token!=='string'||!/^v1\.[A-Za-z0-9_-]{50,1600}$/.test(token))throw new Error();
        const bytes=Buffer.from(token.slice(3),'base64url');
        if(bytes.toString('base64url')!==token.slice(3))throw new Error();
        const cipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));
        cipher.setAAD(Buffer.from('torbox-direct:configuration:v1'));
        cipher.setAuthTag(bytes.subarray(12,28));
        return validateConfiguration(JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString('utf8')));
      }catch{throw new ConfigurationError('INVALID_CONFIGURATION_LINK','This configuration link is invalid.',404);}
    },
    // One id per TorBox account, so re-generating links cannot fan one account out
    // into many engines; play links stay valid across that account's own links only.
    accountId:config=>createHmac('sha256',key).update('account\0'+config.apiKey+'\0'+(config.tmdbKey||'')).digest('base64url'),
    signingKey:accountId=>createHmac('sha256',key).update('playback\0'+accountId).digest('base64url'),
  };
}
