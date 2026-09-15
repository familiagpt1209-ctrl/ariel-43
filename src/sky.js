import * as T from '../assets/three.module.js';
export function createSky(scene){
 const texture=new T.TextureLoader().load('./assets/sky-field.png');texture.wrapS=T.RepeatWrapping;texture.generateMipmaps=true;
 const uniforms={clouds:{value:texture},horizon:{value:new T.Color('#c1d8de')},zenith:{value:new T.Color('#5086ab')},night:{value:0},rain:{value:0},time:{value:0}};
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:`varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
  uniform sampler2D clouds;uniform vec3 horizon;uniform vec3 zenith;uniform float night;uniform float rain;uniform float time;varying vec3 skyDirection;
  void main(){
   vec3 d=normalize(skyDirection);float altitude=max(0.0,d.y);vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(clamp(d.y,-1.0,1.0))/3.14159265+.5);
   vec3 field=texture2D(clouds,uv+vec2(time*.0012,0.0)).rgb;vec3 color=mix(horizon,zenith,pow(altitude,.55));
   float cover=smoothstep(.45-rain*.2,.76-rain*.1,field.r)*smoothstep(.015,.18,altitude);vec3 cloudColor=mix(vec3(.92,.91,.86),vec3(.14,.19,.29),night);cloudColor=mix(cloudColor,horizon*.88,rain*.65);color=mix(color,cloudColor,cover*(.7+rain*.2));
   float disc=dot(d,normalize(vec3(-.55,.32,-.7)));float sun=smoothstep(.9991,.9997,disc)*(1.0-rain)*(1.0-cover);color+=mix(vec3(1.5,1.14,.62),vec3(.5,.61,.72),night)*sun;
   color+=vec3(field.b)*night*.6*smoothstep(.15,.5,altitude)*(1.0-cover)*(1.0-rain);
   gl_FragColor=vec4(color,1.0);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const mesh=new T.Mesh(new T.SphereGeometry(410,32,16),material);mesh.name='LayeredSky';mesh.renderOrder=-1000;mesh.frustumCulled=false;scene.add(mesh);
 return {mesh,update(camera,color,night,rain,time){mesh.position.copy(camera.position);uniforms.horizon.value.copy(color);uniforms.zenith.value.copy(color).multiplyScalar(.58-night*.18);uniforms.night.value=night;uniforms.rain.value=rain;uniforms.time.value=time;},dispose(){scene.remove(mesh);mesh.geometry.dispose();material.dispose();texture.dispose();}};
}
