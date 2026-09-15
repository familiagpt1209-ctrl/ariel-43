// Optional district challenge. The pursuer never owns a collision volume:
// failing the coin objective loses its bonus, never an otherwise safe run.
export class Chase {
 constructor(){this.reset();}
 reset(){this.active=false;this.phase='idle';this.elapsed=0;this.remaining=0;this.collected=0;this.target=12;this.startCoins=0;this.side=-1;this.x=-6;this.z=18;this.won=false;this.rewarded=false;this.phaseTime=0;}
 start(coins,chapter){this.reset();this.active=true;this.phase='warning';this.remaining=14;this.startCoins=coins;this.side=-1;this.x=-11.5;}
 update(dt,coins){
  if(!this.active)return false;
  this.elapsed+=dt;this.phaseTime+=dt;this.collected=Math.min(this.target,Math.max(0,coins-this.startCoins));
  let award=false;
  if(this.phase==='warning'||this.phase==='pursuit'){
   this.remaining=Math.max(0,14-this.elapsed);
   if(this.phase==='warning'&&this.elapsed>=2){this.phase='pursuit';this.phaseTime=0;}
   if(this.collected>=this.target){this.won=true;this.phase='escape';this.phaseTime=0;if(!this.rewarded){award=true;this.rewarded=true;}}
   else if(this.remaining<=0){this.phase='passed';this.phaseTime=0;}
  }
  // Coins increase the visible gap. Exponential smoothing is frame independent.
  const goal=this.phase==='escape'?34:this.phase==='passed'?-38:this.phase==='warning'?-12:-26+this.collected*.65;
  this.z+=(goal-this.z)*(1-Math.exp(-dt*1.5));
  if((this.phase==='escape'||this.phase==='passed')&&this.phaseTime>=3)this.active=false;
  return award;
 }
}
