import * as T from '../assets/three.module.js';
import {Reflector} from '../assets/Reflector.js';
// One shared capture surface: sea, docks, or wet neon street. No recursive mirrors.
export function createReflections(renderer){
 const shader={...Reflector.ReflectorShader,uniforms:{...Reflector.ReflectorShader.uniforms,arielDistance:{value:0},surfaceZ:{value:-150},widthScale:{value:1},time:{value:0},strength:{value:.75},water:{value:1}}};
 shader.vertexShader=`uniform float arielDistance;uniform float surfaceZ;uniform float widthScale;
 float cityPath(float d){return 9.0*sin(d/120.0)+4.0*sin(d/70.0);}
 `+shader.vertexShader.replace('vUv = textureMatrix * vec4( position, 1.0 );',`vec3 bent=position;float wz=surfaceZ-position.y;float tangent=.075*cos(arielDistance/120.0)+(4.0/70.0)*cos(arielDistance/70.0);bent.x+=(cityPath(arielDistance-wz)-cityPath(arielDistance)+wz*tangent)/widthScale;vUv = textureMatrix * vec4(bent,1.0);`).replace('modelViewMatrix * vec4( position, 1.0 )','modelViewMatrix * vec4(bent,1.0)');
 shader.fragmentShader=`uniform float time;uniform float strength;uniform float water;
 `+shader.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec4 uv=vUv;uv.x+=sin(uv.y/max(.01,uv.w)*91.0+time*.8)*.0012*uv.w*water;vec4 base=texture2DProj(tDiffuse,uv);`).replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4(blendOverlay(base.rgb,color),strength)');
 const mesh=new Reflector(new T.PlaneGeometry(120,360,1,40),{textureWidth:512,textureHeight:512,multisample:0,color:'#8ba6ae',clipBias:.003,shader});mesh.name='WaterAndRainReflection';mesh.rotation.x=-Math.PI/2;mesh.position.set(85,-.605,-150);mesh.frustumCulled=false;mesh.material.transparent=true;mesh.material.depthWrite=false;renderer.scene.add(mesh);
 let frame=0,captured=false,captures=0;const capture=mesh.onBeforeRender;
 mesh.onBeforeRender=function(...args){if(!captured||frame%2===0){capture.apply(this,args);captured=true;captures++;}};
 const restored=()=>{captured=false;};renderer.canvas.addEventListener('webglcontextrestored',restored);
 return {mesh,get captures(){return captures;},update(district,night,rain,time,distance,low){frame++;const water=district==='coast'||district==='industrial';mesh.visible=!low&&(water||(district==='neon'&&rain>.15));if(!mesh.visible)return;
  const scale=water?1:1/12;mesh.scale.x=scale;mesh.position.x=water?(district==='coast'?85:-82):0;mesh.position.y=water?-.605:.021;
  const u=mesh.material.uniforms;u.widthScale.value=scale;u.arielDistance.value=distance;u.time.value=time;u.water.value=water?1:0;u.strength.value=water?.72:rain*.27;u.color.value.set(water?'#83a4ad':'#8497af');
 },dispose(){renderer.canvas.removeEventListener('webglcontextrestored',restored);renderer.scene.remove(mesh);mesh.geometry.dispose();mesh.dispose();}};
}
