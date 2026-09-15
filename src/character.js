import * as T from '../assets/three.module.js';
import {GLTFLoader} from '../assets/GLTFLoader.js';
import {SHOP} from './config.js';
import {AnimationController} from './model-adapter.js';
let avatarAsset,assetQuality;
export async function loadCharacter(onProgress){
 const low=innerWidth<761||matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||4)<=4;
 assetQuality=low?'low':'high';const response=await fetch('./assets/ariel-fused-'+assetQuality+'.glb');if(!response.ok)throw Error('No se pudo cargar el cuerpo y la cabeza de Ariel.');
 const length=Number(response.headers.get('content-length')),reader=response.body.getReader(),chunks=[];let received=0;
 for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.length;onProgress(length?received/length:0,received);}
 const buffer=new Uint8Array(received);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}
 avatarAsset=(await new GLTFLoader().parseAsync(buffer.buffer,'./assets/')).scene;
 avatarAsset.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;for(const m of [].concat(o.material))if(m.map)m.map.anisotropy=2;}});
 const names=new Set();avatarAsset.traverse(o=>names.add(o.name));for(const n of ['ArielBodyOriginal','ArielHeadOriginal','Head','Hips'])if(![...names].some(x=>x===n||x.startsWith(n+'_')))throw Error('El avatar no cumple el contrato: falta '+n);
}
function cloneAvatar(source){const result=source.clone(true),map=new Map();function pair(a,b){map.set(a,b);for(let i=0;i<a.children.length;i++)pair(a.children[i],b.children[i]);}pair(source,result);source.traverse(o=>{if(o.isSkinnedMesh){const clone=map.get(o);clone.skeleton=o.skeleton.clone();clone.skeleton.bones=o.skeleton.bones.map(b=>map.get(b));clone.bindMatrix.copy(o.bindMatrix);clone.bind(clone.skeleton,clone.bindMatrix);}});return result;}
export function createAriel(renderer,equipped){
 const root=new T.Group();root.name='CharacterRoot';root.matrixAutoUpdate=false;renderer.scene.add(root);
 const avatar=cloneAvatar(avatarAsset);avatar.rotation.y=Math.PI;root.add(avatar);const bones={},rest={},materials=[],geometries=[];avatar.updateMatrixWorld(true);
 avatar.traverse(o=>{if(o.isBone){bones[o.name]=o;rest[o.name]={position:o.position.clone(),quaternion:o.quaternion.clone(),world:o.getWorldPosition(new T.Vector3()),worldQuaternion:o.getWorldQuaternion(new T.Quaternion())};}});
 const names=Object.keys(bones),fsm=new AnimationController();
 const mat=color=>{const m=new T.MeshStandardMaterial({color,roughness:.8,metalness:0});materials.push(m);return m;};
 const dark=mat('#242b34'),metal=mat(SHOP.find(x=>x.id===equipped.body)?.color||'#242831'),led=mat(SHOP.find(x=>x.id===equipped.led)?.color||'#c6ff4a');led.emissive=led.color.clone();led.emissiveIntensity=.7;
 const boxGeo=new T.BoxGeometry(1,1,1),limbGeo=new T.CylinderGeometry(1,1,1,12);geometries.push(boxGeo,limbGeo);
 const mesh=(parent,g,m,pos,scale)=>{const o=new T.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const scooter=new T.Group();root.add(scooter);mesh(scooter,boxGeo,metal,[0,.29,0],[.5,.12,1.75]);mesh(scooter,boxGeo,dark,[0,.365,0],[.43,.025,1.5]);
 function bar(a,b,r,m){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(scooter,limbGeo,m,a,[r,v.length(),r]);o.position.addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
 bar([0,.30,-.80],[0,1.7,-.78],.055,metal);bar([-.45,1.7,-.78],[.45,1.7,-.78],.055,dark);bar([0,.5,-.82],[0,1.55,-.9],.018,led);
 const wheels=[],tire=new T.TorusGeometry(.22,.055,8,24),rim=new T.TorusGeometry(.18,.014,6,24);geometries.push(tire,rim);
 for(const z of [-.81,.81]){const w=new T.Group();w.position.set(0,.25,z);w.rotation.y=Math.PI/2;scooter.add(w);mesh(w,tire,dark,[0,0,0],[1,1,1]);mesh(w,rim,led,[0,0,.052],[1,1,1]);mesh(w,rim,led,[0,0,-.052],[1,1,1]);wheels.push(w);}
 const drone=new T.Group();root.add(drone);mesh(drone,boxGeo,mat('#8079b5'),[0,0,.16],[.36,.4,.22]);for(const x of [-.43,.43])mesh(drone,rim,led,[x,.2,.23],[1.3,1.3,1.3]).rotation.x=Math.PI/2;

 const jointEuler=new T.Euler();
 const axisY=new T.Vector3(0,1,0),axisX=new T.Vector3(1,0,0),rootQ=new T.Quaternion(),parentQ=new T.Quaternion(),desiredQ=new T.Quaternion(),rotationQ=new T.Quaternion(),scaleV=new T.Vector3(),worldV=new T.Vector3();
 const targets={},errors={},grips={},soles={};
 for(const [prefix,side] of [['Left',-1],['Right',1]]){
  const grip=new T.Object3D();grip.name=prefix+'Grip';grip.position.set(0,.078,0);bones[prefix+'Hand'].add(grip);grips[prefix]=grip;
  const foot=new T.Object3D();foot.name=prefix+'Sole';foot.position.set(0,-.148,0).applyQuaternion(rest[prefix+'Foot'].worldQuaternion.clone().invert());bones[prefix+'Foot'].add(foot);soles[prefix]=foot;
 }
 const chains=[];
 for(const [prefix,side] of [['Left',-1],['Right',1]])for(const kind of ['Arm','Leg']){
  const upper=prefix+'Upper'+kind,lower=prefix+'Lower'+kind,end=prefix+(kind==='Arm'?'Hand':'Foot');
  targets[end]=[0,0,0];chains.push({prefix,side,kind,upper,lower,end,endAngle:0,desiredAngle:0,localTarget:new T.Vector3(),l1:rest[upper].world.distanceTo(rest[lower].world),l2:rest[lower].world.distanceTo(rest[end].world),a:new T.Vector3(),target:new T.Vector3(),smooth:new T.Vector3(),dir:new T.Vector3(),pole:new T.Vector3(),mid:new T.Vector3(),bindAxis:new T.Vector3(),endAxis:new T.Vector3(),bindQ:new T.Quaternion(),deltaQ:new T.Quaternion(),initialized:false});
 }
 function local(v,x,y,z){return root.localToWorld(v.set(x,y,z));}
 function orient(name,x=0,z=0){const b=bones[name];b.parent.getWorldQuaternion(parentQ);rotationQ.setFromEuler(jointEuler.set(x,0,z));desiredQ.copy(rootQ).multiply(rotationQ).multiply(rest[name].worldQuaternion);b.quaternion.copy(parentQ.invert()).multiply(desiredQ);b.updateWorldMatrix(false,true);}
 function aim(c,name,start,end){const b=bones[name];b.parent.getWorldQuaternion(parentQ);c.bindQ.copy(rootQ).multiply(rest[name].worldQuaternion);c.bindAxis.copy(axisY).applyQuaternion(c.bindQ);c.endAxis.copy(end).sub(start).normalize();c.deltaQ.setFromUnitVectors(c.bindAxis,c.endAxis);b.quaternion.copy(parentQ.invert()).multiply(c.deltaQ).multiply(c.bindQ);b.updateWorldMatrix(false,true);}
 function solve(c,dt){
  bones[c.upper].getWorldPosition(c.a);const scale=Math.abs(root.getWorldScale(scaleV).x),l1=c.l1*scale,l2=c.l2*scale;
  c.localTarget.copy(c.target);root.worldToLocal(c.localTarget);if(!c.initialized||c.exactContact){c.smooth.copy(c.localTarget);c.initialized=true;}else c.smooth.lerp(c.localTarget,1-Math.exp(-dt*22));c.target.copy(c.smooth);root.localToWorld(c.target);c.endAngle+=(c.desiredAngle-c.endAngle)*(1-Math.exp(-dt*18));
  c.dir.copy(c.target).sub(c.a);const original=c.dir.length(),dist=T.MathUtils.clamp(original,Math.abs(l1-l2)+.002,l1+l2-.002);c.dir.normalize();c.target.copy(c.a).addScaledVector(c.dir,dist);
  const along=(l1*l1-l2*l2+dist*dist)/(2*dist),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  c.pole.set(c.kind==='Arm'?c.side*.3:0,c.kind==='Arm'?-.8:0,c.kind==='Arm'?.3:-1).transformDirection(root.matrixWorld);c.pole.addScaledVector(c.dir,-c.pole.dot(c.dir));if(c.pole.lengthSq()<1e-6)c.pole.set(1,0,0);c.pole.normalize();c.mid.copy(c.a).addScaledVector(c.dir,along).addScaledVector(c.pole,height);
  aim(c,c.upper,c.a,c.mid);aim(c,c.lower,c.mid,c.target);orient(c.end,c.kind==='Arm'?c.endAngle:0);bones[c.end].getWorldPosition(worldV);errors[c.end]=worldV.distanceTo(c.target);worldV.copy(c.target);root.worldToLocal(worldV);worldV.toArray(targets[c.end]);
 }
 let lastTime=null,rideBlend=0,hipDrop=0;const hip=new T.Vector3();
 return {root,bones,targets,errors,grips,soles,fsm,quality:assetQuality,avatar,draw(matrix,state,t){
  root.matrix.fromArray(matrix);root.matrixWorldNeedsUpdate=true;root.updateMatrixWorld(true);root.getWorldQuaternion(rootQ);
  const dt=lastTime===null?1/60:Math.min(.1,Math.max(0,t-lastTime));lastTime=t;const updateDt=dt,pose=fsm.update(state,updateDt);
  const riding=state.scooter>0||state.scooter===undefined,fly=pose==='Fly',slide=pose==='Slide',run=(pose==='Run'||pose==='Turn')&&!riding,jump=['Jump','JumpPreparation','Trick'].includes(pose),hit=pose==='Hit';
  rideBlend+=(Number(riding)-rideBlend)*(1-Math.exp(-updateDt*12));scooter.visible=riding;
  const phase=t*(8+Math.min(41,state.speed||15)*.10),bob=run?Math.cos(phase*2)*.025:0,compress=pose==='Land'?.075:pose==='JumpPreparation'?.10:0;
  hipDrop+=((slide?.53:hit?.24:run?.11:(!riding&&!jump&&!fly)?.025:0)+compress-hipDrop)*(1-Math.exp(-updateDt*22));
  for(const name of names){bones[name].position.copy(rest[name].position);bones[name].quaternion.copy(rest[name].quaternion);}root.updateMatrixWorld(true);
  const hips=bones.Hips;local(hip,rest.Hips.world.x,rest.Hips.world.y+rideBlend*.08-hipDrop+bob,rest.Hips.world.z+(slide?.08:0)-rideBlend*.045);hips.position.copy(hips.parent.worldToLocal(hip));hips.updateWorldMatrix(false,true);
  const lean=slide?.55:hit?.48:riding?.25:run?.10:fly?.14:0;
  orient('Spine',-lean*.45);orient('Chest',-lean,run?Math.sin(phase)*.018:0);orient('Neck',-lean*.30);orient('Head',hit?.2:0);
  for(const c of chains){
   const side=c.side,s=Math.sin(phase)*side,hipY=rest.Hips.world.y+rideBlend*.08-hipDrop;
   if(c.kind==='Arm'){
    c.desiredAngle=riding?1.2:pose==='Idle'?0:run?.4:slide?.35:.6;
    if(pose==='Idle'&&!riding)local(c.target,rest[c.end].world.x,rest[c.end].world.y-hipDrop,rest[c.end].world.z);
    else if(riding){worldV.set(0,.078,0).applyQuaternion(rest[c.end].worldQuaternion).applyAxisAngle(axisX,1.2);local(c.target,side*.43-worldV.x,1.7-worldV.y,-.78-worldV.z);}
    else if(fly)local(c.target,side*.48,hipY+.4,-.20);
    else if(hit)local(c.target,side*.40,hipY+.25,-.30);
    else if(slide)local(c.target,side*.38,hipY+.10,-.38);
    else local(c.target,side*.37,hipY+.10+(run?Math.max(0,-s)*.12:0),-.08+(run?s*.28:0));
   }else{
    if(riding)local(c.target,side*.135,.525,side<0?.24:-.24);
    else if(slide)local(c.target,side*.2,.148,side<0?-.16:.22);
    else if(jump||fly)local(c.target,side*.18,.30,side<0?-.15:.20);
    else local(c.target,side*.17,.148+(run?Math.max(0,s)*.24:0),run?s*.33:0);
   }
   c.exactContact=c.kind==='Leg'&&run&&fsm.transition>=1;solve(c,updateDt);
  }
  drone.position.set(0,hipYForDrone(),.2);drone.visible=fly;for(const w of wheels)w.rotation.z=-(state.wheelAngle||0);root.updateMatrixWorld(true);
  function hipYForDrone(){return rest.Hips.world.y+rideBlend*.08-hipDrop+.45;}
 },dispose(){renderer.scene.remove(root);for(const g of geometries)g.dispose();for(const m of materials)m.dispose();const disposed=new Set();avatar.traverse(o=>{if(o.isSkinnedMesh&&!disposed.has(o.skeleton)){o.skeleton.dispose();disposed.add(o.skeleton);}});}};
}

