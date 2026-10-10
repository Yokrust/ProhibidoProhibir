import { drawLightField } from './light-field.js';
import { SoundScore } from './sound.js';
import { DURATION, TYPE_START, FILM_START, WHITE_START, WORD_DURATION, phaseAt, shotAt } from './sequence.js';

const scene = document.getElementById('experience');
const canvas = document.getElementById('light-sea');
const pauseButton = document.getElementById('pause');
const soundButton = document.getElementById('sound');
const soundLabel = document.getElementById('sound-label');
const continueButton = document.getElementById('continue');
const replayButton = document.getElementById('replay');
const status = document.getElementById('status');
const notice = document.getElementById('notice');
const progress = document.getElementById('progress-fill');
const typeStage = document.getElementById('type-stage');
const strips = Array.from({length:11},(_,i)=>{
  const strip=document.createElement('span');
  strip.className='word-strip';
  // Interlocking jagged edges retain one word until the strips pull apart.
  const top=i/11*100, bottom=(i+1)/11*100;
  strip.style.clipPath=`polygon(0 ${top}%,18% ${top+1.1}%,39% ${top-.6}%,61% ${top+.7}%,83% ${top-1}%,100% ${top}%,100% ${bottom}%,83% ${bottom-1}%,61% ${bottom+.7}%,39% ${bottom-.6}%,18% ${bottom+1.1}%,0 ${bottom}%)`;
  typeStage.appendChild(strip);
  return strip;
});
const film = document.getElementById('film');
const videos = ['eye-film', 'scream-film', 'apparition-film'].map(id => document.getElementById(id));
const afterimage = document.getElementById('afterimage');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const score = new SoundScore();
const state = {time:0, paused:motion.matches, ended:false, frame:0, last:0, x:.5, y:.5, tx:.5, ty:.5, pressure:0, held:false, pointerId:null, phase:-1, wordIndex:-1, activeVideo:-1, lost:false, width:1, height:1};
let renderer;
let soundPending = false;
const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));
const smooth = (lo, hi, v) => { const n=clamp((v-lo)/(hi-lo)); return n*n*(3-2*n); };
function makeRenderer(){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Canvas no disponible');
  scene.dataset.renderer='canvas';
  return {resize(){},draw(){
    const w=canvas.width,h=canvas.height,t=state.time;
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(t<TYPE_START){
      drawLightField(ctx,w,h,t);
    }else if(t<FILM_START){
      const index=Math.floor((t-TYPE_START)/3);
      ctx.fillStyle=index===0?'#000000':index===1?'#081238':'#ffffff';
      ctx.fillRect(0,0,w,h);
    }else{
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
    }
  }};
}
function resize(){
  state.width=scene.clientWidth;state.height=scene.clientHeight;
  const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1500000/(state.width*state.height)));
  canvas.width=Math.max(1,Math.round(state.width*ratio));canvas.height=Math.max(1,Math.round(state.height*ratio));
  renderer.resize();render();
}
function setVideo(index){
  if(state.activeVideo===index)return;
  state.activeVideo=index;
  videos.forEach((video,i)=>{
    video.classList.toggle('active',i===index);
    if(i===index&&!state.paused){video.play().catch(()=>{});}else video.pause();
  });
}
function typography(t){
  if(t<TYPE_START||t>=FILM_START){typeStage.style.opacity='0';return;}
  const local=t-TYPE_START;
  const index=Math.floor(local/WORD_DURATION), part=(local%WORD_DURATION)/WORD_DURATION;
  const text=['PROHIBIDO','NO','prohibir','PROHIBIR'][index%4];
  if(state.wordIndex!==index){
    state.wordIndex=index;
    strips.forEach(strip=>strip.textContent=text);
    typeStage.className='type-stage '+['narrow','serif','mono',''][index%4];
  }
  const tension=smooth(.08,.72,part);
  const tear=tension*tension;
  const visibility=part<.94?1:0;
  typeStage.style.color=t<WHITE_START?'#ffffff':'#000000';
  typeStage.style.opacity=String(visibility);
  strips.forEach((strip,i)=>{
    const direction=i%2===0?-1:1;
    const rip=(.2+Math.abs(i-5)/5)*tear;
    const x=direction*rip*(72+state.pressure*30)+(state.x-.5)*tension*10;
    const y=(i-5)*tear*2.8;
    const stretch=1+tension*(.8+(i%3)*.55)+state.pressure*.45;
    const height=1+Math.sin(i*2.1)*tear*.5;
    const skew=direction*tension*(i%3+1)*11;
    strip.style.transform=`translate(calc(-50% + ${x}vw),calc(-50% + ${y}vh)) skewX(${skew}deg) scale(${stretch},${height})`;
  });
}
function render(){
  const t=state.time;
  const phase=phaseAt(t);
  if(state.phase!==phase){state.phase=phase;scene.dataset.phase=String(phase);}
  scene.dataset.elapsed=t.toFixed(2);
  scene.classList.toggle('white-field',t>=WHITE_START);
  if(!state.lost)renderer.draw();
  typography(t);
  const shot=shotAt(t);
  setVideo(shot?shot.video:-1);
  film.className='film '+(shot?shot.layout:'');
  // Each apparition stays fixed in its corner, then cuts straight to white.
  film.style.opacity=shot?'1':'0';
  afterimage.style.opacity=String(smooth(DURATION-1,DURATION,t));
  progress.style.transform=`scaleX(${t/DURATION})`;
  notice.classList.toggle('dismissed',t>3);
  score.update(t,state.pressure);
}
function frame(now){
  state.frame=0;
  if(state.paused||state.ended||state.lost||document.hidden)return;
  const dt=state.last?Math.min((now-state.last)/1000,.08):1/60;
  state.last=now;state.time=Math.min(DURATION,state.time+dt);
  const lerp=1-Math.exp(-dt*5);
  state.x+=(state.tx-state.x)*lerp;state.y+=(state.ty-state.y)*lerp;
  state.pressure+=((state.held?1:0)-state.pressure)*(1-Math.exp(-dt*3.5));
  render();
  if(state.time>=DURATION){finish();return;}
  schedule();
}
function schedule(){if(!state.frame&&!state.paused&&!state.ended&&!state.lost&&!document.hidden)state.frame=requestAnimationFrame(frame);}
function setPaused(paused,announce=true){
  if(state.ended)return;
  state.paused=paused;state.held=false;state.pointerId=null;state.last=0;
  scene.classList.toggle('paused',paused);
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.setAttribute('aria-label',paused?'Reanudar la experiencia':'Pausar la experiencia');
  pauseButton.title=paused?'Reanudar · Escape':'Pausar · Escape';
  continueButton.hidden=!paused;
  score.setPlaying(!paused);
  if(paused){cancelAnimationFrame(state.frame);state.frame=0;videos.forEach(v=>v.pause());}
  else{const v=videos[state.activeVideo];if(v)v.play().catch(()=>{});schedule();}
  if(announce)status.textContent=paused?'Experiencia pausada.':'Experiencia en movimiento.';
}
function finish(){
  state.ended=true;state.held=false;scene.classList.add('ended');replayButton.hidden=false;
  score.setPlaying(false);setVideo(-1);status.textContent='Fin de la apertura. Puedes repetirla.';
}
function restart(){
  state.time=0;state.phase=-1;state.wordIndex=-1;state.ended=false;state.last=0;state.pressure=0;
  scene.classList.remove('ended');replayButton.hidden=true;score.restart();
  render();setPaused(false);status.textContent='La apertura vuelve a empezar.';
}
pauseButton.addEventListener('click',()=>setPaused(!state.paused));
continueButton.addEventListener('click',()=>setPaused(false));
replayButton.addEventListener('click',restart);
soundButton.addEventListener('click',async()=>{
  if(soundPending)return;
  soundPending=true;
  try{
    if(score.enabled){score.disable();scene.classList.remove('sound-enabled');soundButton.setAttribute('aria-pressed','false');soundButton.setAttribute('aria-label','Activar sonido');soundLabel.textContent='Sonido';status.textContent='Sonido desactivado.';}
    else{
      const enabled=await score.enable(state.time,!state.paused&&!state.ended);
      if(enabled){scene.classList.add('sound-enabled');soundButton.setAttribute('aria-pressed','true');soundButton.setAttribute('aria-label','Silenciar sonido');soundLabel.textContent='Silenciar';status.textContent='Sonido activado.';}
      else status.textContent='Este navegador no admite el sonido de la experiencia.';
    }
  }catch{status.textContent='No se pudo activar el sonido. Puedes volver a intentarlo.';}
  finally{soundPending=false;}
});
function move(event){
  if(state.paused||state.ended)return;
  const r=scene.getBoundingClientRect();state.tx=clamp((event.clientX-r.left)/r.width);state.ty=clamp((event.clientY-r.top)/r.height);
}
scene.addEventListener('pointermove',move,{passive:true});
scene.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button')||state.paused||state.ended||state.pointerId!==null)return;
  move(event);state.pointerId=event.pointerId;state.held=true;scene.setPointerCapture(event.pointerId);
});
function release(event){if(event.pointerId===state.pointerId){state.held=false;state.pointerId=null;}}
scene.addEventListener('pointerup',release);scene.addEventListener('pointercancel',release);scene.addEventListener('lostpointercapture',release);
document.addEventListener('keydown',event=>{
  if(event.code==='Escape'&&!event.repeat){event.preventDefault();setPaused(!state.paused);}
  if(event.code==='Space'&&!event.target.closest('button')){event.preventDefault();if(!state.paused)state.held=true;}
});
document.addEventListener('keyup',event=>{if(event.code==='Space')state.held=false;});
window.addEventListener('blur',()=>{state.held=false;state.pointerId=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
motion.addEventListener('change',event=>{if(event.matches)setPaused(true);});
window.addEventListener('resize',resize,{passive:true});
function initialize(){
  try{renderer=makeRenderer();}catch(error){console.warn('No se pudo iniciar el campo de luz:',error.message);renderer={resize(){},draw(){}};}
  resize();setPaused(state.paused,false);
}
initialize();
