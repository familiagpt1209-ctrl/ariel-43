// Shared by the warning display, vehicle animation and collision tests.
export function obstacleReach(o){return o.type==='bus'?(o.length?o.length/2+.85:4.3):o.type==='container'?2.2:1.05;}
const heights={car:1.45,taxi:1.5,van:2.15,bus:3.05,police:1.55,ambulance:2.4,motorbike:1.3,truck:2.8,train:3.25};
export function obstacleHeight(o){return o.type==='bus'?(heights[o.vehicleKind]??3.08):({barrier:1.12,container:2.82,overhead:3.8}[o.type]??0);}
export function mergeOffset(o){if(o.vehicleKind!=='bus'||!o.merge)return 0;const u=Math.max(0,Math.min(1,(o.z-55)/55));return (o.lane===0?-1:1 )*.9*u*u*(3-2*u);}
export function trafficAdvice(run,relevantOnly=false){
 let nearest=null,eta=Infinity;for(const o of run.objects){if(o.type!=='bus'||o.hit||(relevantOnly&&o.lane!==run.lane&&o.vehicleKind!=='train'))continue;const lead=(o.z-obstacleReach(o))/(run.speed+(o.approachSpeed||0));if(lead>0&&lead<4.5&&lead<eta){nearest=o;eta=lead;}}
 if(!nearest)return null;
 let mask=0;for(const o of run.objects){if(o.hit||!['bus','container','barrier','overhead'].includes(o.type))continue;const predicted=o.z-(run.speed+(o.approachSpeed||0))*eta;if(Math.abs(predicted)<obstacleReach(o)+run.speed*.65)mask|=1<<o.lane;}
 let safe=-1,best=99;for(let lane=0;lane<3;lane++)if(!(mask&(1<<lane))&&Math.abs(lane-run.lane)<best){safe=lane;best=Math.abs(lane-run.lane);}
 return {kind:nearest.vehicleKind==='train'?'train':nearest.merge?'merging-bus':'traffic',eta,lane:nearest.lane,safeLane:safe};
}
