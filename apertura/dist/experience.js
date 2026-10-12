import { drawLightField } from './light-field.js';
import { SoundScore } from './sound.js';
import { TypeIntervention } from './typography.js';
import { WhiteSpace } from './white-space.js';
import { INTRO_DURATION, TYPE_START, WHITE_START, phaseAt, typeActAt } from './sequence.js';

const scene=document.getElementById('experience');
const canvas=document.getElementById('light-sea');
const entry=document.getElementById('entry');
const enterButton=document.getElementById('enter');
const entryNote=document.getElementById('entry-note');
const entryError=document.getElementById('entry-error');
const status=document.getElementById('status');
const typeStage=document.getElementById('type-stage');
const typeIntervention=new TypeIntervention(typeStage);
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const score=new SoundScore();
const state={time:0,mode:'entry',frame:0,last:0,phase:-1,typeAct:'',width:1,height:1,starting:false,startToken:0};
const white=new WhiteSpace(document.getElementById('white-space'),()=>{
  if(state.mode==='white'){white.update(0);schedule();}
});
let renderer;
const active=()=>state.mode==='running'||state.mode==='white';
function makeRenderer(){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Canvas no disponible');
  scene.dataset.renderer='canvas';
  return {resize(){},draw(){
    const w=canvas.width,h=canvas.height,t=state.time;
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(state.mode==='entry')ctx.fillStyle='#000000';
    else if(t<TYPE_START){drawLightField(ctx,w,h,t);return;}
    else if(t<WHITE_START)ctx.fillStyle=typeActAt(t).background;
    else ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,w,h);
  }};
}
function resize(){
  state.width=scene.clientWidth;state.height=scene.clientHeight;
  const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1500000/(state.width*state.height)));
  canvas.width=Math.max(1,Math.round(state.width*ratio));canvas.height=Math.max(1,Math.round(state.height*ratio));
  white.resize(state.width,state.height,canvas.width/state.width);
  renderer.resize();render();
}
function render(){
  const t=state.time;
  scene.dataset.mode=state.mode;scene.dataset.elapsed=t.toFixed(2);
  scene.dataset.sound=score.enabled&&score.playing?'playing':'off';
  scene.classList.toggle('running',state.mode==='running');
  scene.classList.toggle('white-field',state.mode==='white');
  renderer.draw();
  if(state.mode==='entry'){
    scene.dataset.phase='entry';typeStage.style.opacity='0';return;
  }
  const phase=phaseAt(t);
  if(state.phase!==phase){state.phase=phase;scene.dataset.phase=String(phase);}
  const act=typeIntervention.draw(t,state.width,state.height,canvas.width/state.width);
  if(act&&state.typeAct!==act.id){state.typeAct=act.id;status.textContent=act.text;}
  if(state.mode==='running')score.update(t);
}
function openWhite(reduced=false){
  state.mode='white';state.time=INTRO_DURATION;score.disable();
  score.context?.suspend().catch(()=>{});
  white.activate(reduced);render();
  status.textContent='Campo blanco interactivo. Mantén pulsada la incisión, o usa Tab y mantén Espacio o Intro. Al soltar, la huella roja sigue extendiéndose y permanece. Con movimiento reducido, la huella cambia únicamente al intervenir. Escape vuelve a la entrada.';
  schedule();
}
function frame(now){
  state.frame=0;
  if(!active()||document.hidden)return;
  const dt=state.last?Math.min((now-state.last)/1000,.08):1/60;
  state.last=now;
  if(state.mode==='running'){
    state.time=Math.min(INTRO_DURATION,state.time+dt);
    if(state.time>=INTRO_DURATION){openWhite(motion.matches);return;}
    render();
  }else white.update(dt);
  schedule();
}
function schedule(){
  if(!state.frame&&active()&&!document.hidden)state.frame=requestAnimationFrame(frame);
}
function entryCopy(){
  enterButton.textContent=motion.matches?'Ver sin animación':'Entrar';
  entryNote.textContent=motion.matches?'Movimiento reducido activado.':'Luces rápidas y sonido. Esc para salir.';
}
function stopToEntry(message='Experiencia detenida.',focus=true){
  state.startToken++;state.starting=false;state.mode='entry';state.last=0;
  cancelAnimationFrame(state.frame);state.frame=0;score.disable();white.deactivate();
  entry.hidden=false;enterButton.disabled=false;entryError.hidden=true;
  entryCopy();render();status.textContent=message;
  if(focus&&!document.hidden)enterButton.focus({preventScroll:true});
}
async function enter(){
  if(state.starting||active())return;
  if(motion.matches){
    entry.hidden=true;state.last=0;state.phase=-1;
    openWhite(true);scene.focus({preventScroll:true});return;
  }
  const token=++state.startToken;
  state.starting=true;enterButton.disabled=true;entryError.hidden=true;
  try{
    // Web Audio is activated by this explicit entry gesture.
    const enabled=await score.enable(0,false,()=>token===state.startToken&&!document.hidden);
    if(token!==state.startToken)return;
    if(document.hidden){stopToEntry('Experiencia detenida.',false);return;}
    if(!enabled||score.context?.state!=='running')throw new Error('Audio unavailable');
    state.time=0;state.phase=-1;state.typeAct='';state.last=0;state.mode='running';
    score.restart();score.setPlaying(true);entry.hidden=true;
    scene.focus({preventScroll:true});render();schedule();
    status.textContent='Experiencia iniciada con sonido.';
  }catch{
    if(token!==state.startToken)return;
    score.disable();entryError.textContent='No se pudo activar el sonido. Pulsa Entrar para intentarlo de nuevo.';
    entryError.hidden=false;
  }finally{
    if(token===state.startToken){state.starting=false;enterButton.disabled=false;}
  }
}
enterButton.addEventListener('click',enter);
document.addEventListener('keydown',event=>{
  if(event.code==='Escape'&&!event.repeat&&(state.mode!=='entry'||state.starting)){
    event.preventDefault();stopToEntry();
  }
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&(active()||state.starting))stopToEntry('Experiencia detenida al cambiar de pestaña.',false);
});
window.addEventListener('pagehide',()=>stopToEntry('Experiencia detenida.',false));
motion.addEventListener('change',()=>{
  if(motion.matches&&(state.mode==='running'||state.starting))stopToEntry('Movimiento reducido activado.');
  else if(state.mode==='white'){
    white.cancel();white.model.reduced=motion.matches;
    if(motion.matches)white.model.age=Math.max(8,white.model.age);
    white.update(0);
  }else entryCopy();
});
window.addEventListener('resize',resize,{passive:true});
function initialize(){
  try{renderer=makeRenderer();}catch(error){console.warn('No se pudo iniciar el campo de luz:',error.message);renderer={resize(){},draw(){}};}
  entryCopy();resize();
}
initialize();
