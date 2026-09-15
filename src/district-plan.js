// District order is based on route distance, never on render rate or recycled slot.
export const DISTRICT_LENGTH=1000;
export const DISTRICT_IDS=['center','residential','industrial','metro','coast','neon'];
export const DISTRICT_NAMES={center:'Centro',residential:'Jardines',industrial:'Puerto industrial',metro:'Metro elevado',coast:'Paseo marítimo',neon:'Distrito neón'};
function hash(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
const orderCache=new Map();
function shuffled(cycle,seed){let h=hash(seed+':'+cycle),order=[...DISTRICT_IDS];for(let i=order.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;}
export function districtOrder(cycle,seed='volt'){
 if(cycle===0)return DISTRICT_IDS;
 const key=seed+':'+cycle;if(orderCache.has(key))return orderCache.get(key);
 const order=shuffled(cycle,seed);
 // Adjacent cycles cannot repeat their boundary district.
 const previous=cycle===1?'neon':shuffled(cycle-1,seed).at(-1);
 if(order[0]===previous)[order[0],order[1]]=[order[1],order[0]];
 if(orderCache.size>32)orderCache.delete(orderCache.keys().next().value);orderCache.set(key,order);return order;
}
export function districtAt(distance,seed='volt'){const index=Math.floor(Math.max(0,distance)/DISTRICT_LENGTH);return districtOrder(Math.floor(index/6),seed)[index%6];}
export function districtState(distance,seed='volt'){const d=Math.max(0,distance),remaining=DISTRICT_LENGTH-d%DISTRICT_LENGTH;return{id:districtAt(d,seed),next:districtAt(d+remaining+.01,seed),remaining,blend:Math.max(0,Math.min(1,(150-remaining)/150))};}
