export const LEVELS=[0,250,650,1300,2300,3700,5500,8000,11500,16000];
export const TITLES=['Aprendiz','En marcha','Piloto urbano','Ritmo eléctrico','Especialista','As del asfalto','Alto voltaje','Leyenda urbana','Imparable','Leyenda VOLT'];
export const levelOf=xp=>{let i=0;while(i<LEVELS.length-1&&xp>=LEVELS[i+1])i++;return i+1;};
export const ACHIEVEMENTS=[
 {id:'first',name:'Primera vuelta',description:'Termina tu primera partida',field:'runs',target:1,reward:50},
 {id:'jumps',name:'Por los aires',description:'Supera 15 barreras saltando',field:'jumps',target:15,reward:150},
 {id:'slides',name:'Perfil bajo',description:'Supera 15 pórticos agachado',field:'slides',target:15,reward:150},
 {id:'tricks',name:'Giro maestro',description:'Realiza 30 trucos',field:'tricks',target:30,reward:200},
 {id:'combo',name:'Sin perder el ritmo',description:'Encadena 8 acciones',field:'bestCombo',target:8,reward:250},
 {id:'distance',name:'Conozco la ciudad',description:'Acumula 20 km',field:'distance',target:20000,reward:400},
 {id:'near',name:'Por los pelos',description:'Esquiva 20 obstáculos por poco',field:'nearMisses',target:20,reward:180}
];
export const freshCareer=()=>({xp:0,runs:0,distance:0,jumps:0,slides:0,tricks:0,nearMisses:0,bestCombo:0,claimed:[],tutorialDone:false,dailyBest:{date:'',score:0}});
export function completeRun(save,run){
 const c=save.career,previous=levelOf(c.xp);if(run.variant==='tutorial')return {xp:0,previous,level:previous,awards:[]};
 const xp=Math.floor(run.distance/12)+run.tricks*25+(run.clears||0)*12;
 c.xp+=xp;c.runs++;c.distance+=Math.floor(run.distance);c.jumps+=run.jumpClears||0;c.slides+=run.slideClears||0;c.tricks+=run.tricks;c.nearMisses+=run.nearMisses||0;c.bestCombo=Math.max(c.bestCombo,run.bestCombo||0);
 const awards=ACHIEVEMENTS.filter(a=>c[a.field]>=a.target&&!c.claimed.includes(a.id));for(const a of awards){c.claimed.push(a.id);save.coins+=a.reward;}
 if(run.variant==='daily'){const date=localDate();if(c.dailyBest.date!==date)c.dailyBest={date,score:0};c.dailyBest.score=Math.max(c.dailyBest.score,Math.floor(run.score));}
 return {xp,previous,level:levelOf(c.xp),awards};
}
export function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function seededRandom(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export const TRAINING=[
 {text:'Cambia al carril izquierdo',hint:'← / A o desliza a la izquierda',action:'left'},
 {text:'Ahora vuelve a la derecha',hint:'→ / D o desliza a la derecha',action:'right'},
 {text:'Prueba el salto',hint:'↑ / Espacio o desliza hacia arriba',action:'up'},
 {text:'Prueba a deslizarte',hint:'↓ / S o desliza hacia abajo',action:'down'},
 {text:'Salta y gira para hacer un truco',hint:'↑ y después → antes de medio segundo',action:'trick'},
 {text:'Invoca el patinete con la barra llena',hint:'Doble toque, botón VOLT o tecla E',action:'ride'}
];
