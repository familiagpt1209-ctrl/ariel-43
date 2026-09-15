export class Telemetry {
 constructor(){this.frames=new Float32Array(36000);this.reset();}
 reset(){this.count=0;this.totalMs=0;this.worstMs=0;this.webglErrors=0;this.memory=[];this.nextSample=0;}
 record(ms,renderer,run,segments,traffic){
  if(!Number.isFinite(ms)||ms<=0)return;this.frames[this.count%this.frames.length]=ms;this.count++;this.totalMs+=ms;this.worstMs=Math.max(this.worstMs,ms);
  if(run.time>=this.nextSample){this.nextSample=run.time+10;const info=renderer.webgl.info;this.memory.push({time:run.time,geometries:info.memory.geometries,textures:info.memory.textures,heap:performance.memory?.usedJSHeapSize??null,objects:run.objects.length,traffic:traffic.active,recycles:segments.recycled,calls:info.render.calls,triangles:info.render.triangles});if(this.memory.length>90)this.memory.shift();const error=renderer.webgl.getContext().getError();if(error!==0)this.webglErrors++;}
 }
 report(){const sorted=Array.from(this.frames.slice(0,Math.min(this.count,this.frames.length))).sort((a,b)=>a-b);return {frames:this.count,fpsMean:this.count?this.count*1000/this.totalMs:0,fpsMinimum:this.worstMs?1000/this.worstMs:0,frameMsMean:this.count?this.totalMs/this.count:0,frameMsWorst:this.worstMs,p95FrameMs:sorted[Math.floor(sorted.length*.95)]??0,webglErrors:this.webglErrors,memory:this.memory};}
}
