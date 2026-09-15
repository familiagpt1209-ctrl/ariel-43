import {STREET,hasSideStreet,junctionAt,isJunction,trafficZ,supportedSpan} from './street-layout.js';
import {districtAt} from './district-plan.js';
import {Geometry as G,M} from './engine.js';
import {mergeOffset} from './traffic-safety.js';
import * as T from '../assets/three.module.js';
const streetSupport=[d=>hasSideStreet(d,-1),d=>hasSideStreet(d,1)],railSupport=d=>d==='metro'||d==='industrial',metroSupport=d=>d==='metro';
const types=['car','taxi','van','bus','truck','motorbike','police','ambulance'];
export class Traffic {
 constructor(kit){this.kit=kit;this.active=0;this.trainPositions=[0,0];this.slots=Array.from({length:20},(_,i)=>({id:i,kind:types[Math.floor(i/2)%8],phase:Math.floor(i/2)*32}));this.lamps={};for(const [key,color] of [['white','#fff2ba'],['red','#ff3422'],['blue','#398dff'],['amber','#ffad20']]){this.lamps[key]=kit.renderer.mesh(new G().box(0,0,0,.24,.12,.075,color));this.lamps[key].material=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.3});kit.renderer.draw(this.lamps[key],M.transform(0,-100,0),2);}}
 lamp(key,x,y,z,angle=0,s=1){this.kit.renderer.draw(this.lamps[key],M.transform(x,y,z,angle,0,0,s),2);}
 vehicle(kind,x,y,z,angle,t,speed=8,signal=false){
  const draw=this.kit.draw,s=this.kit.manifest.vehicles[kind]||this.kit.manifest.vehicles.car;draw('vehicle-'+kind,x,y+Math.sin(t*7+z)*.015,z,angle);const ca=Math.cos(angle),sa=Math.sin(angle),r=s.radius;
  for(const side of [-1,1]){if(s.wheels===2&&side===1)continue;for(const axle of [-s.axle,s.axle]){const wx=s.wheels===2?0:side*s.width*.48;draw('wheel',x+wx*ca+axle*sa,y+r,z-wx*sa+axle*ca,angle,r,-t*speed/r);}
   const lx=s.wheels===2?0:side*s.width*.35,f=-s.length*.5-.045,b=s.length*.5+.045;this.lamp('white',x+lx*ca+f*sa,y+.7,z-lx*sa+f*ca,angle);this.lamp(signal&&Math.sin(t*9)>0?'amber':'red',x+lx*ca+b*sa,y+.68,z-lx*sa+b*ca,angle,speed===0?1.2:1);
  }if(kind==='police'||kind==='ambulance')this.lamp(Math.sin(t*11)>0?'red':'blue',x,y+s.height+.08,z,angle,2);
 }
 train(x,y,z,t,angle=0,cars=3){const d=this.kit.draw,ca=Math.cos(angle),sa=Math.sin(angle);for(let i=0;i<cars;i++){const dz=i*14.5,cx=x+sa*dz,cz=z+ca*dz;d('train-car',cx,y,cz,angle);for(const axle of[-4.8,4.8])for(const side of[-1,1])d('wheel',cx+side*.92*ca+axle*sa,y+.38,cz-side*.92*sa+axle*ca,angle,.3,-t*10);if(i===0)for(const side of[-1,1])this.lamp('white',cx+side*.72*ca-7.04*sa,y+1.1,cz-side*.72*sa-7.04*ca,angle,1.8);}}
 draw(distance,t,segments,low=false,chase=null){this.active=0;const district=districtAt(distance,segments.seed),limit=low?10:20;for(let i=0;i<limit;i++){const o=this.slots[i],side=i%2?1:-1,parked=i%3===0,z=trafficZ(distance,t,o.phase,side,parked),id=districtAt(distance-z,segments.seed);if(z>18||z<-310||!hasSideStreet(id,side))continue;const half=(this.kit.manifest.vehicles[o.kind].length/2)+.1;if(!supportedSpan(distance,z,-half,half,segments.seed,districtAt,streetSupport[side>0?1:0]))continue;if(parked&&junctionAt(segments,z,5))continue;if(!parked&&side<0&&(id==='neon'||chase?.active))continue;this.vehicle(o.kind,side*(parked?STREET.parking:STREET.moving),0,z,side>0?Math.PI:0,t,parked?0:8);this.active++;}
  // Branch traffic stays outside the through carriageways; intersections have no props.
  for(const s of segments.items)if(isJunction(s)&&s.z<-48&&s.z>-160)for(const side of [-1,1]){const x=side*(21+(t*6+s.route*.13)%24);this.vehicle(s.variant%2?'taxi':'car',x,0,s.z-10,-side*Math.PI/2,t,6);}
  if(chase?.active){const portrait=this.kit.renderer.camera.aspect<.75;const z=chase.z-(portrait?10:0);if(supportedSpan(distance,z,-3,3,segments.seed,districtAt,streetSupport[0])){this.vehicle('police',-STREET.moving,0,z,0,t,18,true);this.active++;}}
  if(district==='metro'||district==='industrial'){const phase=t%34,u=Math.max(0,Math.min(1,(phase-4)/30)),z=55-310*(.5-.5*Math.cos(u*Math.PI));this.trainPositions[0]=z;if(supportedSpan(distance,z,-7.1,36.1,segments.seed,districtAt,railSupport)){this.train(-8,.35,z,t);this.active+=3;}if(district==='metro'){const elevated=40-((t*18+80)%360);this.trainPositions[1]=elevated;if(supportedSpan(distance,elevated,-7.1,36.1,segments.seed,districtAt,metroSupport)){this.train(-8,5.35,elevated,t);this.active+=3;}}}
 }
 obstacle(o,t){if(o.visual==='cargo'){this.kit.draw('cargo-crate',(o.lane-1)*2.8,o.y||0,-o.z,Math.min(o.dropAge||0,.7)*.12);return true;}if(o.type!=='bus')return false;const laneX=(o.lane-1)*2.8,x=laneX+mergeOffset(o),z=-o.z;if(o.vehicleKind==='train'){this.train(x,0,z+(o.length||43)/2-7,t,Math.PI,3);if(o.z>30&&o.z<180)for(const side of[-1,1])this.lamp(Math.sin(t*8+side)>0?'red':'amber',laneX+side*1.25,2.3,z+o.length/2+3,0,2);}else this.vehicle(o.vehicleKind||'bus',x,0,z,Math.PI,t,o.approachSpeed||0,o.merge);return true;}
}
