import {districtAt} from './district-plan.js';
export const EVENT_TYPES={center:'bus-merge',residential:'garden-run',industrial:'dropped-cargo',metro:'express-train',coast:'opening-pier',neon:'police-pass'};
export const PHASE_NAMES={intro:'Primeros pasos',build:'Avenida',challenge:'Tráfico intenso',rest:'Tramo despejado',event:'Evento de distrito',recovery:'Recupera el ritmo'};
function hash(seed,n){let h=2166136261;for(const c of seed+':'+n)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function routeProfile(distance,seed='volt'){
 const at=Math.max(0,distance),chapter=Math.floor(at/1000),local=at-chapter*1000,district=districtAt(at,seed);
 const phase=at<120?'intro':local<140?'build':local<600?'challenge':local<740?'rest':local<860?'event':'recovery';
 return {chapter,local,district,phase,event:EVENT_TYPES[district],eventAt:chapter*1000+800,eventLane:hash(seed,chapter)%2?0:2,difficulty:Math.min(4,Math.floor(at/1800)),ambientVariant:hash(seed,Math.floor(at/400))%4};
}
export function rowPattern(profile,index,randomValue){
 if(profile.phase==='intro')return 'weave';
 if(profile.phase==='rest'||profile.phase==='recovery')return 'rest';
 if(profile.phase==='build')return ['weave','rest','weave','jump'][index%4];
 const pattern=['weave','jump','weave','duck','risk','rest'][index%6];
 return index%6===2&&randomValue>.5?'rest':pattern;
}
