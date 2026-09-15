// State transitions are independent of render frequency. Anatomical targets are
// solved against measured rest bone lengths, never by stretching a bone.
export const ANIMATIONS=['Idle','Run','Ride','JumpPreparation','Jump','Land','Slide','Trick','Hit','Fly','Turn','Recovery'];
export const STATE_RULES={Idle:[0,0,.25],Run:[1,0,.18],Ride:[2,0,.24],Turn:[3,.12,.16],Recovery:[4,.4,.28],Land:[5,.22,.12],JumpPreparation:[6,.07,.07],Jump:[7,.9,.13],Slide:[8,1.1,.13],Trick:[9,.65,.16],Fly:[10,0,.3],Hit:[11,.55,.1]};
export function animationState(s){return s.pose&&ANIMATIONS.includes(s.pose)?s.pose:s.over?'Hit':s.flight>.1||s.powers?.drone?'Fly':s.trick>0?'Trick':s.jumpPrep>0?'JumpPreparation':s.jump>0?'Jump':s.slide>0?'Slide':s.landing>0?'Land':s.scooterGrace>.1?'Recovery':Math.abs((s.lane-1)*2.8-s.x)>.5?'Turn':s.scooter>0?'Ride':s.speed>0?'Run':'Idle';}
export class AnimationController {
 constructor(){this.current='Idle';this.previous='Idle';this.elapsed=0;this.transition=1;this.entries=0;}
 update(s,dt){const desired=animationState(s);if(desired!==this.current){this.previous=this.current;this.current=desired;this.elapsed=0;this.transition=0;this.entries++;}this.elapsed+=dt;this.transition=Math.min(1,this.transition+dt/STATE_RULES[this.current][2]);return this.current;}
 get priority(){return STATE_RULES[this.current][0];}
}
