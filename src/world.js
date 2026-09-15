import{createReflections}from'./reflections.js';
import{Geometry as G,M}from'./engine.js';
import{createPowerModels}from'./power-models.js';
import{createDistrictWorld}from'./district-world.js';import{Traffic}from'./traffic.js';
export function createWorld(r){
 const world={districtWorld:createDistrictWorld(r)};world.traffic=new Traffic(world.districtWorld.kit);world.reflections=createReflections(r);
 let skyline=new G();for(let i=0;i<14;i++){const x=(i-7)*7,h=8+(i*13)%25;skyline.box(x,h/2,-133,5,h,9,'#8a8c87');}world.skyline=r.mesh(skyline);
 const obs={};
 obs.barrier=r.mesh(new G().box(0,.55,0,2.15,1.1,.5,'#e09643').box(0,.7,.26,2.14,.16,.04,'#f4e6b8').box(0,.27,.26,2.14,.16,.04,'#413f37').box(-.88,.4,0,.15,.9,.7,'#3a4145').box(.88,.4,0,.15,.9,.7,'#3a4145'));
 // The overhead opening is deliberately 2.26 m high, leaving a clear reaction window.
 obs.overhead=r.mesh(new G().box(-1.03,1.9,0,.14,3.8,.2,'#e3b258').box(1.03,1.9,0,.14,3.8,.2,'#e3b258').box(0,3.03,0,2.2,1.54,.55,'#305c62').box(0,2.32,.29,2.15,.16,.06,'#f1c665').box(0,3,.29,1.5,.12,.05,'#96d8c3'));
 let container=new G().box(0,1.4,0,2.1,2.8,2.8,'#487c76');for(let i=-.8;i<1;i+=.3)container.box(i,1.4,1.43,.06,2.5,.05,'#6d9a89');container.box(0,2.72,0,2.2,.14,2.9,'#a6bb99');obs.container=r.mesh(container);
 let bus=new G().box(0,1.6,0,2.2,2.9,6.8,'#cda87b').box(0,2.14,3.43,1.85,1.1,.05,'#263e4b').box(0,2.97,3.44,1.6,.35,.07,'#162d35').box(0,.65,3.44,2.15,.2,.08,'#544f48');for(let side of[-1,1]){bus.box(side*.83,1,3.46,.38,.22,.09,'#fff1b7');for(let z of[-2.2,2.2])bus.sphere(side*1.08,.5,z,.18,.48,.48,'#202931',12,8);for(let z=-2.5;z<2.7;z+=1.3)bus.box(side*1.11,2.15,z,.04,1,1.08,'#304b57');}obs.bus=r.mesh(bus);world.obstacles=obs;world.busSign=r.label('EXPRESO A LUNA');
 world.luna=r.mesh(new G().box(0,0,0,.76,.48,.13,'#d277bb').box(0,0,.076,.68,.40,.015,'#ffe5f7').segment([-.33,.19,.1],[0,-.02,.1],.018,'#995784').segment([0,-.02,.1],[.33,.19,.1],.018,'#995784'));
 world.coin=r.mesh(new G().torus(0,0,0,.28,.07,'#ffd26b','z',12).cylinder(0,0,0,.055,.33,'#ffdd84'));
 world.charge=r.mesh(new G().box(0,0,0,.5,.78,.4,'#bbf754').box(0,.44,0,.22,.1,.22,'#e9ffb9').box(0,0,.21,.09,.4,.015,'#284b40').box(0,0,.22,.3,.09,.015,'#284b40'));
 world.powers=createPowerModels(r);
 world.shield=r.mesh(new G().torus(0,1.4,0,1.5,.025,'#84ddf5','y',32).torus(0,1.4,0,1.5,.018,'#84ddf5','x',32).torus(0,1.4,0,1.5,.018,'#84ddf5','z',32));world.trail=r.mesh(new G().box(0,.13,2,.22,.035,5,'#c8ff56'));world.spark=r.mesh(new G().sphere(0,0,0,.055,.055,.055,'#c4efff',6,4));
 let rain=new G();for(let i=0;i<130;i++){let x=Math.sin(i*75)*9,y=((i*31)%90)/10,z=-((i*19)%65);rain.segment([x,y,z],[x-.12,y-.65,z+.2],.011,'#b0c4cf');}world.rain=r.mesh(rain);return world;
}
