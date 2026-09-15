import {STREET,hasSideStreet,isJunction} from './street-layout.js';
import * as T from '../assets/three.module.js';
import {Geometry as G,M} from './engine.js';
import {cityKit} from './city-assets.js';
import {segmentSpec} from './segments.js';
const defs=[
 {id:'center',sky:'#aacbd7',night:'#18283f',sun:'#ffe3bd',ground:'#82968b',buildings:[0,1,6,10],landmark:'clocktower'},
 {id:'residential',sky:'#d6c5aa',night:'#27394b',sun:'#ffd19b',ground:'#7d926b',buildings:[2,3,7,8],landmark:'fountain'},
 {id:'industrial',sky:'#9db8c4',night:'#1b2c3b',sun:'#dce2c6',ground:'#596f75',buildings:[4,12,13,14],landmark:'crane'},
 {id:'metro',sky:'#b7cfce',night:'#1a3443',sun:'#d5eff0',ground:'#727f7e',buildings:[9,1,6,0],landmark:'station'},
 {id:'coast',sky:'#b9dde5',night:'#183d52',sun:'#fff0c7',ground:'#9daa80',buildings:[2,5,7,0],landmark:'lighthouse'},
 {id:'neon',sky:'#202b47',night:'#101b35',sun:'#98bbeb',ground:'#464966',buildings:[5,6,10,11],landmark:'neon-tower'}
];
function road(theme,rail=false){const g=new G().box(0,-.16,-10,10,.32,20,theme===2?'#646c70':'#46535c');for(const x of (rail?[7.25]:[-7.25,7.25]))g.box(x,.025,-10,4.5,.3,20,theme===1?'#b8ab91':'#a9b6b1');for(const x of[-4.4,4.4])g.box(x,.009,-10,.06,.015,20,'#d5c593');for(let z=-2;z>-20;z-=5)for(const x of[-1.4,1.4])g.box(x,.015,z,.07,.018,2,'#dddac0');return g;}
export function createDistrictWorld(renderer){
 const kit=cityKit(renderer),draw=kit.draw,roads=Array.from({length:4},(_,i)=>renderer.mesh(road(i))),railRoads=Array.from({length:4},(_,i)=>renderer.mesh(road(i,true))),cross=renderer.mesh(new G().box(0,-.11,-10,100,.20,12,'#4b5c65'));
 const sideGeometry=new G().box(0,-.12,-10,STREET.width,.24,20,'#46535c');for(let z=-2;z>-20;z-=5)sideGeometry.box(0,.012,z,.08,.015,2,'#bcc3b6');for(const x of [-3.3,3.3])sideGeometry.box(x,.012,-10,.07,.015,20,'#c9c9b4');const sideRoad=renderer.mesh(sideGeometry);
 const markings=new G();for(let x=-4;x<4.4;x+=.85)markings.box(x,.02,-5,.45,.02,2.3,'#d9dfcd');const crossing=renderer.mesh(markings);
 const water=renderer.mesh(new G().box(0,-.65,0,120,.08,20,'#4a91a7')),sand=renderer.mesh(new G().box(0,-.20,0,15,.08,20,'#d8c599'));
 const rails=new G().box(-8,.05,-10,3.2,.3,20,'#465359');for(const x of [-8.75,-7.25])rails.box(x,.36,-10,.10,.13,20,'#bbc8c4');for(let z=0;z>-20;z-=1.4)rails.box(-8,.24,z,2.2,.1,.2,'#5b625c');const track=renderer.mesh(rails);
 const viaduct=renderer.mesh(new G().box(-8,5.0,-10,3.4,.45,20,'#859799').box(-10.2,2.5,-4,.7,5,.8,'#8e9a96'));
 const promenade=renderer.mesh(new G().box(9,-.025,-10,6,.14,20,'#b7b09a')),line=renderer.mesh(new G().box(0,0,0,.025,.025,20,'#8fa2a6')),pier=renderer.mesh(new G().box(24,.1,-9,30,.22,4,'#958c77'));
 const dock=renderer.mesh(new G().box(-15,-.12,-10,20,.22,20,'#8b9389'));
 const steam=renderer.mesh(new G().sphere(0,0,0,1,.8,1,'#ccd3d0',6,4));steam.material=new T.MeshBasicMaterial({color:'#ccd3d0',transparent:true,opacity:.16,depthWrite:false});steam.castShadow=false;
 function smoke(x,y,z,t,low){for(let i=0;i<(low?2:4);i++){const rise=(t*.75+i*1.3)%5;renderer.draw(steam,M.transform(x+rise*.12,y+rise*.7,z+rise*.05,0,0,0,.45+rise*.15));}}
 function drawSegment(id,v,z,s,time=0,quality=false){
  s=s||{...segmentSpec(-z),district:id,variant:v};const d=defs.find(d=>d.id===id)||defs[0],kind=s.type,variant=s.variant,landmarkCenter=s.landmark&&((Math.floor(s.route/20)%50+50)%50)===40;
  renderer.draw((id==='metro'||id==='industrial'?railRoads:roads)[s.theme%4],M.transform(0,0,z));for(const side of [-1,1])if(hasSideStreet(id,side))renderer.draw(sideRoad,M.transform(side*STREET.center,0,z));
  if(isJunction(s)){renderer.draw(cross,M.transform(0,0,z));renderer.draw(crossing,M.transform(0,0,z));draw('traffic-light',-5.8,0,z-4);draw('traffic-light',5.8,0,z-18,Math.PI);if(id==='metro'||id==='industrial')renderer.draw(track,M.transform(0,0,z));if(id==='metro'){renderer.draw(viaduct,M.transform(0,0,z));renderer.draw(track,M.transform(0,5,z));}return;}
  const open=kind==='plaza'||kind==='park'||kind==='rest'||s.landmark,offset=kind==='bend-left'?-3:kind==='narrow'?-1.5:0;
  for(const side of[-1,1]){
   if(id==='coast'&&side===1)continue;
   if(!open&&!(id==='industrial'&&side<0)){const building=d.buildings[(variant+(side>0?1:0)+s.template)%4];draw('building-'+building,side*(STREET.building+offset),0,z-9,side<0?Math.PI/2:-Math.PI/2,.83+variant*.08);if(id==='industrial'&&building===13){const scale=.83+variant*.08;smoke(28+offset,12.4*scale,z-9,time,quality);}}
   if(!quality&&kind!=='narrow'&&!(id==='industrial'&&side<0))draw('building-'+d.buildings[(variant+2)%4],side*(42+variant*2),0,z-12,side*Math.PI/2,1.15+((s.id||0)%3)*.2);
   if((open||s.template%3===0)&&!['industrial','metro','neon'].includes(id)){draw('tree-'+((variant+Number(side>0))%4),side*8,0,z-6,variant*.8);draw('bench',side*7,.15,z-13,side*Math.PI/2);draw('pedestrian',side*6.8,.15,z-8+Math.sin(time*.3+s.id)*1.5,side*Math.PI/2);}
   draw('lamp',side*6.2,0,z-2,side>0?0:Math.PI);if(variant===1)draw('bin',side*(hasSideStreet(id,side)?6.7:5.8),.15,z-17);if(variant===3)draw('sign',side*(hasSideStreet(id,side)?6.7:5.8),0,z-16,side<0?0:Math.PI);
  }
  if(kind==='market'&&id!=='industrial'){draw('kiosk',7,.1,z-8,-Math.PI/2);draw('umbrella',id==='metro'?21:-8,.1,z-10);draw('bicycle',id==='metro'?7:-6.8,.12,z-14,.4);}
  if(id==='residential'){if(variant%2)draw('laundry',-8.4,5.1,z-9,Math.PI/2,1,0,Math.sin(time*1.1)*.025);if(variant===2)draw('garage',-7.8,0,z-10,Math.PI/2);draw('tree-'+variant,-8,0,z-15);if(open){draw('swing',22,.1,z-10);draw('tree-'+((variant+2)%4),25,0,z-4);draw('bicycle',7,.15,z-5);}if(variant===2){draw('fence',7,.15,z-6,Math.PI/2);draw('bin',8,.15,z-14);}}
  if(id==='industrial'){
   renderer.draw(dock,M.transform(0,0,z));renderer.draw(water,M.transform(-82,0,z-10));
   renderer.draw(track,M.transform(0,0,z));
   draw('container',19,0,z-12);if(variant%2){draw('container',21.6,0,z-12);draw('container',20.3,2.65,z-12);}
   if(s.template%3===0){draw('crane',-18,0,z-10);draw('hook',-10+Math.sin(time*.45)*2,15,z-10);draw('container',-10+Math.sin(time*.45)*2,6+Math.sin(time*.6)*.4,z-10,0,.8);}
   if(variant===0){draw('tank',18,0,z-12);draw('pipe',7,0,z-3);draw('forklift',-18.5,0,z-13+Math.sin(time)*.9,Math.PI/2);}
   draw('fence',-5.8,.1,z-9,Math.PI/2);if(landmarkCenter)draw('boat',-30,-.4,z-30,Math.PI/2,2);
  }
  if(id==='metro'){
   renderer.draw(track,M.transform(0,0,z));renderer.draw(viaduct,M.transform(0,0,z));renderer.draw(track,M.transform(0,5,z));
   if(kind==='station'||s.landmark){draw('station',-12.2,0,z-10);draw('stairs',-12,.3,z+1,Math.PI);draw('pedestrian',-10,.4,z-8);draw('pedestrian',-11,.4,z-13);}renderer.draw(line,M.transform(-8,5.2,z-10));
  }
  if(id==='coast'){
   renderer.draw(promenade,M.transform(0,0,z));renderer.draw(sand,M.transform(19,0,z-10));renderer.draw(water,M.transform(85,0,z-10));
   for(const q of [-3,-12]){draw('tree-'+(4+variant%2),8,0,z+q,variant);draw('fence',11,.05,z+q,Math.PI/2);}
   if(variant%2){draw('umbrella',16,-.12,z-8);draw('kiosk',8,.1,z-16,Math.PI);}
   if(landmarkCenter){const opening=Math.max(0,Math.min(1,(z+150)/100))*.72;draw('bridge-leaf',15,.2,z-9,0,1,0,opening);draw('bridge-leaf',39,.2,z-9,Math.PI,1,0,opening);draw('boat',36,-.3+Math.sin(time)*.06,z-15,.3);}if(!quality)draw('bird',18+Math.sin(time*.5+s.id)*4,9,z-9,time*.1);
  }
  if(id==='neon'){draw('billboard-'+((Math.floor(time/6)+variant)%3),-8,6+variant,z-6,Math.PI/2,1+variant*.12);draw('billboard-'+((Math.floor(time/6)+variant+1)%3),8,9,z-15,-Math.PI/2,1.4);draw(variant%2?'neon-strip-cyan':'neon-strip-pink',-7.8,.3,z-8);draw(variant%2?'neon-strip-pink':'neon-strip-cyan',7.8,.3,z-14);if(variant===1)draw('holo-volt',-8,5,z-9,time*.35,1.2);draw('pedestrian',6.8,.15,z-6);renderer.draw(line,M.transform(-5,7,z-10));renderer.draw(line,M.transform(5,8,z-10));}
  if(kind==='tunnel')draw(id==='coast'?'coastal-canopy':id==='industrial'?'warehouse-gate':'tunnel',0,0,z-10);
  if(kind==='bridge')for(const x of[-5.1,5.1])for(const dz of [-3,-7,-11,-15])draw('fence',x,.2,z+dz,Math.PI/2);
  if(landmarkCenter){draw(d.landmark,id==='coast'?32:id==='industrial'?-20:24,0,z-10,0,id==='residential'?1.7:1);if(id==='center')draw('arch',0,0,z-14);}
 }
 function horizon(distance,time,district){const d=defs.find(x=>x.id===district)||defs[0];for(let i=0;i<14;i++)if(!((district==='coast'&&i>7)||(district==='industrial'&&i<6)))draw('building-'+d.buildings[i%4],(i%2?-1:1)*(32+Math.floor(i/2)*13),0,-285-(i%3)*15,0,1.5+(i%4)*.5);if(distance%1000<450||distance%1000>930)draw(d.landmark,24,0,-225+(distance%1000)*.025,0,2);if(district==='coast')draw('boat',48,-.3,-125,Math.PI/2,1.7);if(district==='industrial'){draw('crane',-35,0,-160,0,1.7);draw('boat',-40,-.4,-130,Math.PI/2,2.4);}}
 return {kit,road:roads[0],catalog:defs,drawSegment,horizon,dispose(){for(const m of [...roads,...railRoads])renderer.free(m);}};
}
