import * as T from '../assets/three.module.js';
import {GLTFLoader} from '../assets/GLTFLoader.js';
let source,manifest;
export async function loadCity(onProgress=()=>{}){
 const [gltf,meta]=await Promise.all([new GLTFLoader().loadAsync('./assets/city-kit.glb',e=>onProgress(e.total?e.loaded/e.total:0)),fetch('./assets/city-kit.json').then(r=>{if(!r.ok)throw Error('No se encontró el catálogo de ciudad');return r.json();})]);
 source=gltf.scene;manifest=meta;source.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();if(o.material.map)o.material.map.anisotropy=2;}});
}
export function cityKit(renderer){
 if(!source)throw Error('Los modelos de ciudad aún no están preparados');
 const assets={};source.traverse(o=>{if(o.isMesh){const m={geometry:o.geometry,material:o.material,castShadow:!o.material.transparent,pool:[],used:0,count:o.geometry.attributes.position.count};m.prewarmInstances=o.name==='wheel'?256:1;renderer.meshes.add(m);assets[o.name]=m;}});
 const warm=new T.Matrix4().makeTranslation(0,0,-1000).elements;for(const a of Object.values(assets))renderer.draw(a,warm);
 const matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),q=new T.Quaternion(),euler=new T.Euler();
 function draw(name,x,y,z,ry=0,s=1,rx=0,rz=0){const asset=assets[name];if(!asset)return;position.set(x,y,z);scale.set(s,s,s);euler.set(rx,ry,rz);q.setFromEuler(euler);matrix.compose(position,q,scale);renderer.draw(asset,matrix.elements);}
 return {assets,manifest,draw,renderer};
}
