// Only scenery BEHIND the runner is dissolved; physics and the road stay intact.
export const CLEARANCE={start:.5,end:1.8,innerWidth:4.6,outerWidth:5.2,floor:.4,ceiling:4.5};
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function sceneryVisibility(x,y,z,enabled=true){
 return !enabled||y<=CLEARANCE.floor||y>=CLEARANCE.ceiling?1:1-smooth(CLEARANCE.start,CLEARANCE.end,z)*(1-smooth(CLEARANCE.innerWidth,CLEARANCE.outerWidth,Math.abs(x)));
}
export function installClearance(shader,uniform){
 shader.uniforms.arielClearance=uniform;
 shader.vertexShader='varying vec3 arielScenePosition;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('mvPosition = modelViewMatrix * mvPosition;','arielScenePosition = (modelMatrix * mvPosition).xyz;\n mvPosition = modelViewMatrix * mvPosition;');
 shader.fragmentShader=`uniform float arielClearance; varying vec3 arielScenePosition;\n`+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('void main() {',`void main() {
  float behind = smoothstep(${CLEARANCE.start}, ${CLEARANCE.end}, arielScenePosition.z);
  float corridor = 1.0-smoothstep(${CLEARANCE.innerWidth}, ${CLEARANCE.outerWidth}, abs(arielScenePosition.x));
  float cutaway = arielClearance * behind * corridor * step(${CLEARANCE.floor}, arielScenePosition.y) * (1.0-step(${CLEARANCE.ceiling}, arielScenePosition.y));
  float grain = fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
  if(cutaway > grain) discard;
 `);
}
