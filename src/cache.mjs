// Instance-local weighted LRU. Account data uses separate cache instances.
export class BoundedCache {
  constructor({maxEntries=1024,maxWeight=1024*1024,now=Date.now}={}){
    this.maxEntries=maxEntries;this.maxWeight=maxWeight;this.now=now;this.entries=new Map();this.weight=0;
  }
  get(key){
    const entry=this.entries.get(key);if(!entry)return undefined;
    if(entry.until&&entry.until<=this.now()){this.delete(key);return undefined;}
    this.entries.delete(key);this.entries.set(key,entry);return entry.value;
  }
  set(key,value,{ttl=0,weight=1}={}){
    this.delete(key);weight=Math.max(1,weight);
    if(weight>this.maxWeight)return;
    this.entries.set(key,{value,weight,until:ttl?this.now()+ttl:0});this.weight+=weight;
    while(this.entries.size>this.maxEntries||this.weight>this.maxWeight)this.delete(this.entries.keys().next().value);
  }
  delete(key){const entry=this.entries.get(key);if(entry){this.weight-=entry.weight;this.entries.delete(key);}}
  get size(){return this.entries.size;}
}

export function memoizeParser(parse,{maxEntries=2048,maxWeight=768*1024}={}){
  const cache=new BoundedCache({maxEntries,maxWeight});
  return value=>{
    const key=String(value||'');const hit=cache.get(key);if(hit)return hit;
    const result=parse(key);cache.set(key,result,{weight:512+key.length*4});return result;
  };
}
