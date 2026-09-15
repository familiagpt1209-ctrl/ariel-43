import{Chase}from'./chase.js';
import{routeProfile,rowPattern}from'./route-director.js';
import{districtAt}from'./district-plan.js';
import{freshCareer,levelOf}from'./progression.js';
import{CONFIG,POWERS,SHOP}from'./config.js';
import{obstacleReach,obstacleHeight}from'./traffic-safety.js';
export const freshSave=()=>({career:freshCareer(),name:'Ariel',coins:0,best:0,scores:[],owned:['lime','carbon','original'],equipped:{led:'lime',body:'carbon',skin:'original'},settings:{sound:true,haptic:true,sensitivity:1,quality:'auto',motion:true,touchButtons:null},daily:{date:'',distance:0,coins:0,powers:0,claimed:[]}});
export function readSave(storage=localStorage){try{let s=JSON.parse(storage.getItem('ariel-volt-v1'));if(!s)return freshSave();let f=freshSave();return{...f,...s,career:{...freshCareer(),...s.career,claimed:Array.isArray(s.career?.claimed)?s.career.claimed:[]},owned:Array.isArray(s.owned)?s.owned:f.owned,scores:Array.isArray(s.scores)?s.scores:[],equipped:{...f.equipped,...s.equipped},settings:{...f.settings,...s.settings},daily:{...f.daily,...s.daily}};}catch{return freshSave();}}
export function refreshDaily(save){let d=new Date(),date=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;if(save.daily.date!==date)save.daily={date,distance:0,coins:0,powers:0,claimed:[]};}
export const MISSIONS=[{id:'distance',name:'De punta a punta',label:'Recorre 1.500 m',target:1500,reward:120},{id:'coins',name:'Calderilla eléctrica',label:'Recoge 60 monedas',target:60,reward:100},{id:'powers',name:'Dale corriente',label:'Usa 5 potenciadores',target:5,reward:80}];
export function purchase(save,id){let item=SHOP.find(x=>x.id===id);if(!item||(!save.owned.includes(id)&&item.level&&levelOf(save.career?.xp||0)<item.level))return false;if(!save.owned.includes(id)){if(save.coins<item.price)return false;save.coins-=item.price;save.owned.push(id);}save.equipped[item.kind]=id;return true;}
// 120 Hz simulation with swept collision volumes, independent of rendering.
export class Run {
 constructor(random=Math.random){this.random=random;this._reserve=Array.from({length:256},()=>({}));this._free=[];this.chase=new Chase();this.reset();}
 reset(variant='free',routeSeed='volt'){this.chase.reset();this._free.length=0;for(const o of this._reserve)this._free.push(o);this.event=null;this.nextEvent=800;this.lastEventChapter=-1;this.routeEvents=0;this.poolPeak=0;Object.assign(this,{variant,routeSeed,nextLuna:750,lunaMessages:0,combo:0,bestCombo:0,comboTimer:0,clears:0,jumpClears:0,slideClears:0,nearMisses:0,rowIndex:0,cue:'',cueTime:0,crashReason:'',finished:false,trainingStep:0,trainingCooldown:0,scooter:0,scooterUses:0,scooterGrace:0,time:0,distance:0,score:0,coins:0,battery:100,speed:CONFIG.startSpeed,lane:1,x:0,jump:0,jumpPrep:0,slide:0,crouch:0,trick:0,tricks:0,trickBoost:0,lastJump:-99,powerUses:0,powers:{},objects:[],nextRow:45,nextPower:70,nextId:1,over:false,rain:false,wet:0,events:[],flight:0,flightExit:0,landing:0,queuedSlide:false,wheelAngle:0,lastSafe:1});}
 emit(type,data={}){this.events.push({type,...data});}
 move(direction){if(this.over)return;const old=this.lane;this.lane=Math.max(0,Math.min(2,this.lane+direction));if(old!==this.lane&&(this.jump>0||this.jumpPrep>0)&&this.time-this.lastJump<=CONFIG.trickWindow&&!this.trick&&!this.didTrick){this.trick=.65;this.didTrick=true;this.trickBoost=1.5;this.tricks++;this.score+=CONFIG.trickPoints;this.skill('trick',0);this.emit('trick');}}
 up(){if(this.over||this.jump>0||this.jumpPrep>0||this.flight>.05||this.powers.drone)return;this.jumpPrep=.07;this.slide=0;this.lastJump=this.time;this.didTrick=false;this.emit('jump');}
 down(){if(this.over||this.powers.drone||this.flight>.05)return;if(this.jump>0||this.jumpPrep>0){this.queuedSlide=true;return;}this.slide=CONFIG.slideDuration;this.emit('slide');}
 ride(){if(this.over||this.scooter>0||this.battery<100)return false;this.scooter=12;this.scooterUses++;this.battery=0;this.emit('scooter');return true;}
 get height(){return this.flight+(this.jump>0?Math.sin((1-this.jump/CONFIG.jumpDuration)*Math.PI)*CONFIG.jumpHeight:0);}
 activate(key){if(!POWERS[key])return;this.powers[key]=CONFIG.powerDuration;this.powerUses++;if(key==='turbo')this.battery=Math.min(100,this.battery+45);if(key==='drone'){this.jump=this.jumpPrep=this.slide=0;this.queuedSlide=false;this.flightExit=0;}this.score+=50;this.emit('power',{key});}
 add(type,lane,z,key,y){const o=this._free.pop();if(!o)throw Error('Límite de objetos de ruta superado');Object.assign(o,{id:this.nextId++,type,district:districtAt(this.distance+z,this.routeSeed),lane,z,key,y:y??(type==='coin'?1.15:type==='charge'?1.25:1.6),hit:false,passed:false,minDx:99,required:null,value:1,avoided:null,vehicleKind:null,length:0,approachSpeed:0,warned:false,merge:false,visual:null,eventKind:null,dropAge:0});this.objects.push(o);this.poolPeak=Math.max(this.poolPeak,this.objects.length);return o;}
 get multiplier(){return Math.min(4,1+Math.floor(this.combo/3));}
 skill(kind,points){this.combo++;this.comboTimer=5;this.bestCombo=Math.max(this.bestCombo,this.combo);const bonus=points*this.multiplier*(this.powers.overclock?2:1);this.score+=bonus;if(kind==='jump'){this.jumpClears++;this.clears++;}if(kind==='slide'){this.slideClears++;this.clears++;}if(kind==='near')this.nearMisses++;this.emit('skill',{kind,points:bonus,combo:this.combo,multiplier:this.multiplier});}
 spawn(){if(this.variant==='tutorial')return;
 while(this.nextRow<180){
 let z=this.nextRow;const profile=routeProfile(this.distance+z,this.routeSeed);const eventRow=profile.local>=740&&profile.local<930&&profile.chapter>this.lastEventChapter;if(eventRow){z=Math.max(profile.eventAt-this.distance,Math.max(130,this.speed*4.5+25));this.nextRow=z;}const safe=Math.max(0,Math.min(2,this.lastSafe+Math.floor(this.random()*3)-1));this.lastSafe=safe;
 // Authored rhythm: weave, compulsory jump, recovery, duck, rewarded risk.
 let pattern=rowPattern(profile,this.rowIndex,this.random());this.rowIndex++;if(eventRow){this.spawnEventRow(profile,z);this.nextRow+=Math.max(80,this.speed*2.0);continue;}
 if(pattern==='jump'||pattern==='duck'){
  for(let lane=0;lane<3;lane++){const o=this.add(pattern==='jump'?'barrier':'overhead',lane,z);o.required=pattern;}
  for(let lane=0;lane<3;lane++)for(let j=-1;j<=1;j++){const o=this.add('coin',lane,z+j*2,undefined,pattern==='jump'?3.1:1.15);o.value=2;}
 }else if(pattern!=='rest'){
  const blocked=[0,1,2].filter(l=>l!==safe);if(this.distance<120)blocked.pop();
  for(const lane of blocked){const district=districtAt(this.distance+z,this.routeSeed),n=this.random(),industrial=district==='industrial';const o=this.add(pattern==='risk'?'barrier':n<.23?'barrier':n<.4?'overhead':n<(industrial?.65:.54)?'container':'bus',lane,z);if(o.type==='bus'){const kinds=industrial?['truck','van','truck']:['car','taxi','van','bus','police','ambulance','motorbike'];o.vehicleKind=kinds[Math.floor(this.random()*kinds.length)];o.length={car:4.1,taxi:4.4,van:5.1,bus:6.8,police:4.45,ambulance:5.6,motorbike:2.2,truck:6.8}[o.vehicleKind];if(district==='metro'&&z>120&&this.rowIndex%3===0&&!this.objects.some(v=>v.vehicleKind==='train'&&Math.abs(v.z-z)<.01)){o.vehicleKind='train';o.length=43;this.nextRow+=64;}o.approachSpeed=o.vehicleKind==='train'?3:0;o.merge=o.vehicleKind==='bus'&&this.distance>400&&lane!==1;}if(pattern==='risk')for(let j=-1;j<=1;j++){const o=this.add('coin',lane,z+j*2,undefined,3.1);o.value=3;}}
  for(let j=0;j<5;j++)this.add('coin',safe,z+8+j*2.5);
 }else {for(let j=0;j<8;j++)this.add('coin',safe,z+j*2.3);this.add('charge',safe,z+22);if(this.distance+z>=this.nextLuna){this.add('luna',safe,z+12,undefined,1.45);this.nextLuna=this.distance+z+1200;}}
 const train=this.objects.find(o=>o.vehicleKind==='train'&&Math.abs(o.z-z)<.01);if(train){let kept=0;for(const o of this.objects){if(o!==train&&Math.abs(o.z-z)<.01&&['bus','container','barrier','overhead'].includes(o.type))this._free.push(o);else this.objects[kept++]=o;}this.objects.length=kept;}
 // At maximum turbo the next action still has >1.5 seconds of recovery.
 this.nextRow+=Math.max(66,this.speed*1.65)+this.random()*8;
 }
 while(this.nextPower<180){const keys=Object.keys(POWERS),z=this.nextPower;let lane=this.lastSafe;const occupied=new Set(this.objects.filter(o=>['bus','container','barrier','overhead'].includes(o.type)&&Math.abs(o.z-z)<10).map(o=>o.lane));if(occupied.size<3){if(occupied.has(lane))lane=[0,1,2].find(l=>!occupied.has(l));this.add('power',lane,z,keys[Math.floor(this.random()*keys.length)]);}this.nextPower+=110+this.random()*45;}
 }
 spawnEventRow(profile,z){
  this.lastEventChapter=profile.chapter;this.routeEvents++;this.lastSafe=1;
  const lane=profile.eventLane,kind=profile.event;
  if(['bus-merge','dropped-cargo','express-train','police-pass'].includes(kind)){
   const o=this.add('bus',lane,z);o.eventKind=kind;o.vehicleKind={'bus-merge':'bus','dropped-cargo':'truck','express-train':'train','police-pass':'police'}[kind];o.length=kind==='express-train'?43:kind==='police-pass'?4.45:6.8;o.merge=kind==='bus-merge';o.approachSpeed=kind==='express-train'?3:kind==='dropped-cargo'?2:0;
   if(kind==='dropped-cargo'){const cargo=this.add('barrier',lane,z+4);cargo.visual='cargo';cargo.eventKind=kind;cargo.y=2.2;cargo.approachSpeed=2;}
   if(kind==='express-train')this.nextRow+=64;
  }else if(kind==='garden-run')for(const side of [0,2]){const o=this.add('barrier',side,z);o.eventKind=kind;}
  for(let i=0;i<9;i++)this.add('coin',1,z+i*2.5);
  this.add('charge',1,z+25);
 }
 update(dt){if(this.over||!Number.isFinite(dt)||dt<=0)return;let remaining=Math.min(dt,.25);while(remaining>1e-7&&!this.over){const step=Math.min(1/120,remaining);this.step(step);remaining-=step;}}
 step(dt){
 const prevX=this.x,prevH=this.height,prevJump=this.jump;
 this.time+=dt;this.comboTimer=Math.max(0,this.comboTimer-dt);if(!this.comboTimer)this.combo=0;this.trainingCooldown=Math.max(0,this.trainingCooldown-dt);if(this.variant==='daily'&&this.time>=90){this.finished=this.over=true;this.crashReason='¡Reto de 90 segundos completado!';this.emit('complete');return;}this.landing=Math.max(0,this.landing-dt);
 for(const k of ['jump','slide','trick','trickBoost'])this[k]=Math.max(0,this[k]-dt);
 if(this.jumpPrep>0){this.jumpPrep=Math.max(0,this.jumpPrep-dt);if(!this.jumpPrep)this.jump=CONFIG.jumpDuration;}
 if(prevJump>0&&!this.jump){this.landing=.22;if(this.queuedSlide){this.queuedSlide=false;this.slide=CONFIG.slideDuration;}this.emit('land');}
 for(const k of Object.keys(this.powers)){this.powers[k]-=dt;if(this.powers[k]<=0){delete this.powers[k];if(k==='drone')this.flightExit=1.5;}}
 // Descent is delayed over a solid obstacle; never drop the rider inside a bus.
 const blockedLanding=this.objects.some(o=>!o.hit&&['bus','container','overhead','barrier'].includes(o.type)&&Math.abs((o.lane-1)*CONFIG.laneWidth-this.x)<1.5&&o.z>-obstacleReach(o)-1&&o.z<obstacleReach(o)+9);
 if(this.powers.drone)this.flight=Math.min(5,this.flight+dt*8);
 else if(this.flight>0){this.flightExit=Math.max(0,this.flightExit-dt);if(!blockedLanding){this.flight=Math.max(0,this.flight-dt*4);if(!this.flight){this.landing=.25;this.scooterGrace=Math.max(this.scooterGrace,.55);this.emit('land');}}}
 this.crouch+=(Number(this.slide>0)-this.crouch)*(1-Math.exp(-dt*32));
 if(this.distance>=this.nextEvent){const d=districtAt(this.distance,this.routeSeed),types={center:['police','Plaza del reloj · tráfico urbano'],residential:['park','Jardines · zona de descanso'],industrial:['crane','Grúa en movimiento · puerto'],metro:['station','Estación Ariel · tren en aproximación'],coast:['landmark','Faro del sur · paseo marítimo'],neon:['chase','Persecución · reúne 12 monedas para escapar']};this.event={type:types[d][0],remaining:d==='neon'?17:10,district:d};if(d==='neon')this.chase.start(this.coins,Math.floor(this.distance/1000));this.nextEvent+=1000;this.emit('city-event',{message:types[d][1]});}if(this.event){this.event.remaining-=dt;if(this.event.remaining<=0)this.event=null;}this.rain=this.distance%CONFIG.rainEvery>CONFIG.rainEvery-CONFIG.rainLength;this.wet+=(Number(this.rain)-this.wet)*(1-Math.exp(-dt*1.5));
 const wasRiding=this.scooter>0;this.scooter=Math.max(0,this.scooter-dt);this.scooterGrace=Math.max(0,this.scooterGrace-dt);if(wasRiding&&!this.scooter){this.scooterGrace=.65;this.emit('scooter-end');}if(!this.scooter)this.battery=Math.min(100,this.battery+dt*3.34);const base=this.variant==='tutorial'?10:Math.min(CONFIG.maxSpeed,CONFIG.startSpeed+this.time*CONFIG.acceleration);
 this.speed=this.powers.turbo?CONFIG.maxSpeed*1.25:Math.min(base+(this.scooter>0?3:0),CONFIG.maxSpeed)+(this.trickBoost>0?4:0);
 const travel=this.speed*dt;this.distance+=travel;this.nextRow-=travel;this.nextPower-=travel;this.wheelAngle=(this.wheelAngle+travel/.25)%(Math.PI*2);this.score+=travel*(this.powers.overclock?2:1);
 this.x+=(CONFIG.laneWidth*(this.lane-1)-this.x)*(1-Math.exp(-dt*(14-5*this.wet)));
 for(const o of this.objects){if(o.visual==='cargo'&&o.z<120){o.approachSpeed=0;o.dropAge+=dt;o.y=Math.max(0,2.2-4.9*o.dropAge*o.dropAge);}const oldZ=o.z;o.z-=travel+(o.approachSpeed||0)*dt;if(o.hit)continue;const cx=(o.lane-1)*CONFIG.laneWidth,dx=Math.min(Math.abs(cx-this.x),Math.abs(cx-prevX));const reach=obstacleReach(o);const near=o.z<reach&&oldZ>-reach;
 if(near)o.minDx=Math.min(o.minDx,dx);if(!o.passed&&o.z<-reach&&['barrier','overhead','bus','container'].includes(o.type)){o.passed=true;if(o.avoided&&!this.powers.drone&&this.flight<.1)this.skill(o.avoided,80);else if(o.minDx>1.40&&o.minDx<1.95&&this.flight<.1)this.skill('near',50);}
 const pickupHeight=Math.abs(o.y-(this.height+1.15))<.85;
 if(o.type==='coin'){const magnet=this.powers.magnet&&o.z<15&&oldZ>-2&&Math.abs(o.y-this.height-1.15)<7;if(magnet||(near&&dx<.8&&pickupHeight)){o.hit=true;this.coins+=o.value||1;this.score+=CONFIG.coinPoints*(o.value||1)*this.multiplier*(this.powers.overclock?2:1);if(this.combo)this.comboTimer=Math.max(this.comboTimer,2);this.emit('coin',{lane:o.lane});}continue;}
 if(o.type==='luna'){if(near&&dx<.8&&pickupHeight){o.hit=true;this.lunaMessages++;this.score+=250;this.emit('luna',{points:250,index:this.lunaMessages});}continue;}
 if(o.type==='power'||o.type==='charge'){if(near&&dx<.8&&pickupHeight){o.hit=true;if(o.type==='power')this.activate(o.key);else{this.battery=Math.min(100,this.battery+25);this.emit('charge');}}continue;}
 if(!near||dx>1.40||this.powers.drone||this.flight>.05)continue;
 const bottom=Math.min(prevH,this.height)-.025,top=Math.max(prevH,this.height)+2.71-this.crouch*.603;
 const obstacleTop=obstacleHeight(o);const obstacleBottom=o.type==='overhead'?2.26:0;
 if(!(bottom<obstacleTop&&top>obstacleBottom)&&this.flight<.1){if(o.type==='barrier'&&this.jump>0)o.avoided='jump';if(o.type==='overhead'&&this.crouch>.9)o.avoided='slide';}
 if(bottom<obstacleTop&&top>obstacleBottom){o.hit=true;if(this.scooterGrace>0){continue;}if(this.powers.shield){delete this.powers.shield;this.combo=this.comboTimer=0;this.emit('shield-break');}else if(this.scooter>0){this.scooter=0;this.scooterGrace=1.2;this.combo=this.comboTimer=0;this.emit('scooter-break');}else if(this.variant==='tutorial'){this.emit('retry');}else{this.over=true;this.crashReason={barrier:'Barrera: salta un poco antes.',overhead:'Pórtico: agáchate antes de llegar.',bus:'Autobús: cambia de carril.',container:'Contenedor: cambia de carril.'}[o.type];this.emit('crash');break;}}
 }
 if(!this.over&&this.chase.update(dt,this.coins)){this.score+=300;this.emit('chase-win',{points:300});}
 let count=0,next=null,eta=Infinity;for(const o of this.objects){if(o.z>-(o.length/2+12)&&!o.hit){this.objects[count++]=o;const front=o.z-(o.length?o.length/2:0),lead=front/(this.speed+(o.approachSpeed||0));if((o.required||o.type==='bus')&&lead>0&&lead<4&&lead<eta){next=o;eta=lead;}if(o.type==='bus'&&!o.warned&&lead>0&&lead<4.5){o.warned=true;this.emit('warning',{kind:o.vehicleKind,message:o.vehicleKind==='train'?'Tren en aproximación · cambia de carril':o.merge?'Autobús incorporándose · cambia de carril':'Vehículo delante · busca un carril libre'});}}else this._free.push(o);}this.objects.length=count;this.spawn();this.cue=next?(next.required||(next.vehicleKind==='train'?'train':'traffic')):'';this.cueTime=next?eta:0;
 }
}

