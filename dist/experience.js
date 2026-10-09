import { SoundScore } from './sound.js';

const DURATION = 104;
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
const words = ['word', 'word-echo', 'word-slice'].map(id => document.getElementById(id));
const film = document.getElementById('film');
const videos = ['eye-film', 'scream-film', 'apparition-film'].map(id => document.getElementById(id));
const shutter = document.getElementById('shutter');
const afterimage = document.getElementById('afterimage');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const score = new SoundScore();
const state = {time:0, paused:motion.matches, ended:false, frame:0, last:0, x:.5, y:.5, tx:.5, ty:.5, pressure:0, held:false, pointerId:null, phase:-1, wordIndex:-1, activeVideo:-1, lost:false, width:1, height:1};
let renderer;
let soundPending = false;
const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));
const smooth = (lo, hi, v) => { const n=clamp((v-lo)/(hi-lo)); return n*n*(3-2*n); };
const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float phase;
uniform float pressure;
#define PI 3.14159265
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec3 palette(float k){
  k=fract(k)*5.;
  vec3 a=vec3(1.,.443,.808),b=vec3(.875,1.,0.),c=vec3(0.,1.,1.),d=vec3(.859,.745,.965),e=vec3(.47,.05,.92);
  if(k<1.)return mix(a,b,k);
  if(k<2.)return mix(b,c,k-1.);
  if(k<3.)return mix(c,d,k-2.);
  if(k<4.)return mix(d,e,k-3.);
  return mix(e,a,k-4.);
}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);
  vec2 mouse=(pointer-.5)*vec2(resolution.x/resolution.y,1.);
  float t=time;
  float section=floor(t/7.5);
  float local=exp(-length(p-mouse)*4.);
  p+=(p-mouse)*local*(.15+pressure*.9);
  float wave=sin(t*1.6+length(p)*3.);
  p=rotate(sin(t*.17)*.6+pressure*.7)*p;
  float radius=length(p);
  float angle=atan(p.y,p.x);
  vec3 color=vec3(.018,.002,.03);
  // The shared 1.25 Hz pulse is deliberately bounded; no rapid full-frame strobe.
  float pulse=pow(.5+.5*sin(t*PI*2.*1.25),4.);
  float variant=mod(section,4.);
  vec2 q=p;
  for(int i=0;i<3;i++){
    float f=float(i)+1.;
    q+=sin(q.yx*(3.+f*2.)+vec2(t*.5,-t*.37)+f)*(.16/f);
  }
  float liquid=sin(q.x*8.+t*.31)+cos(q.y*9.-t*.24)+sin((q.x+q.y)*6.);
  vec3 base=palette(liquid*.15+t*.037+angle*.08);
  float edge=pow(.5+.5*sin(liquid*9.+radius*8.),18.);
  color+=base*(.06+edge*.75);
  if(phase<.5){
    float density=mix(6.,11.,.5+.5*sin(t*.12));
    vec2 grid=q*density;
    vec2 id=floor(grid);
    vec2 cell=fract(grid)-.5;
    float seed=hash(id+section*.173);
    float size=.11+.16*(.5+.5*sin(t*1.1+seed*13.));
    float shape;
    if(variant<1.)shape=length(cell)-size;
    else if(variant<2.)shape=max(abs(cell.x),abs(cell.y))-size;
    else if(variant<3.)shape=abs(cell.x)+abs(cell.y)-size*1.3;
    else shape=abs(length(cell)-size)-.032;
    float core=1.-smoothstep(-.02,.035,shape);
    float glow=exp(-max(shape,0.)*15.)*.34;
    float select=step(.52,seed);
    vec3 hue=palette(seed+section*.16+t*.021);
    float gain=.24+select*pulse*.88;
    color+=hue*(core+glow)*gain;
    float ring=abs(sin(radius*(21.+sin(t*.2)*7.)-t*1.8+sin(angle*5.)*.7));
    color+=palette(radius*.8-t*.045)*pow(1.-ring,18.)*.55;
  }else if(phase<1.5){
    float blades=abs(sin(angle*(7.+mod(section,5.))+radius*9.-t*.7));
    float arc=pow(.5+.5*sin(radius*62.-t*2.+sin(angle*3.)*2.),20.);
    color+=palette(angle/PI+t*.03)*pow(blades,18.)*(.45+pulse*.25);
    color+=palette(radius+t*.05+.3)*arc*.65;
    color*=.74;
  }else if(phase<2.5){
    float bars=pow(.5+.5*sin(q.x*26.+sin(q.y*7.+t)*3.),18.);
    color+=palette(q.y*.6+t*.04)*bars*.38;
    color*=.55;
  }else if(phase<3.5){
    float fold=abs(mod(angle+PI/6.,PI/3.)-PI/6.);
    vec2 k=vec2(cos(fold),sin(fold))*radius;
    float folds=sin(k.x*31.-t*1.4)*sin(k.y*47.+t*.6);
    float rays=pow(.5+.5*sin(angle*39.+radius*14.-t),20.);
    color+=palette(folds*.25+radius*.9+t*.1)*(pow(abs(folds),4.)*.9+rays*.55);
    color+=palette(angle*.6-t*.07)*edge*(.4+pulse*.45);
  }else{
    color*=1.-smoothstep(98.,102.,t);
  }
  float halo=exp(-abs(radius-.23-pressure*.1)*22.);
  color+=palette(t*.03+.55)*halo*pressure*.5;
  float scan=.97+.03*sin(gl_FragCoord.y*1.9);
  color*=scan;
  color=1.-exp(-color*1.35);
  gl_FragColor=vec4(color,1.);
}`;

function makeRenderer(){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl)return makeFallback();
  const shaders=[];
  for(const [kind,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
    const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
    shaders.push(shader);
  }
  const program=gl.createProgram();shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);shaders.forEach(s=>gl.deleteShader(s));
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const u=Object.fromEntries(['resolution','pointer','time','phase','pressure'].map(n=>[n,gl.getUniformLocation(program,n)]));
  scene.dataset.renderer='webgl';
  return {resize(){gl.viewport(0,0,canvas.width,canvas.height);},draw(){
    gl.uniform2f(u.resolution,canvas.width,canvas.height);gl.uniform2f(u.pointer,state.x,1-state.y);
    gl.uniform1f(u.time,state.time);gl.uniform1f(u.phase,state.phase);gl.uniform1f(u.pressure,state.pressure);gl.drawArrays(gl.TRIANGLES,0,6);
  }};
}
function makeFallback(){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return {resize(){},draw(){}};
  scene.dataset.renderer='canvas';
  const colors=['#FF71CE','#DFFF00','#00FFFF','#dbbef6','#760dea'];
  return {resize(){},draw(){
    const w=canvas.width,h=canvas.height,t=state.time;
    ctx.fillStyle='#050008';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='screen';
    const pulse=Math.pow(.5+.5*Math.sin(t*Math.PI*2*1.25),4);
    for(let i=0;i<66;i++){
      const x=(.5+.43*Math.sin(i*12.32+t*.11))*w;
      const y=(.5+.44*Math.sin(i*4.74-t*.18))*h;
      const r=(14+Math.sin(i*3.2+t)*7)*w/900;
      ctx.globalAlpha=.23+(i%3===0?pulse*.65:0);
      ctx.fillStyle=colors[i%5];ctx.strokeStyle=colors[(i+2)%5];ctx.lineWidth=2;
      ctx.beginPath();
      if(Math.floor(t/7.5)%2)ctx.rect(x-r,y-r,r*2,r*2);else ctx.arc(x,y,r,0,Math.PI*2);
      if(i%2)ctx.fill();else ctx.stroke();
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
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
  let local,period,wordSet;
  if(t>=24&&t<46){local=t-24;period=3.1;wordSet=['NO','PRO','HIBI','DO','prohibir','NO','PROHIBIDO'];}
  else if(t>=78&&t<98){local=t-78;period=2.7;wordSet=['PROHIBIR','NO','PROHIBIDO','prohibir','NO','PRO','HIBIR','NO'];}
  else{typeStage.style.opacity='0';return;}
  const index=Math.floor(local/period),part=(local%period)/period;
  const entry=smooth(0,.14,part)*(1-smooth(.77,1,part));
  if(state.wordIndex!==index+state.phase*100){
    state.wordIndex=index+state.phase*100;
    words.forEach(w=>w.textContent=wordSet[index%wordSet.length]);
    typeStage.className='type-stage '+['','serif','mono','outline','vertical','serif','outline'][index%7];
  }
  const twist=Math.sin(local*.63)*15;
  const sx=1+Math.sin(local*.91)*.28+state.pressure*.5;
  const sy=.8+Math.sin(local*.44)*.55+state.pressure*.7;
  const x=(state.x-.5)*45+Math.sin(local*.36)*13;
  const y=Math.cos(local*.57)*8;
  words[0].style.transform=`translate(calc(-50% + ${x}vw),calc(-50% + ${y}vh)) rotate(${twist}deg) scale(${sx},${sy})`;
  words[1].style.transform=`translate(calc(-50% + ${x+Math.sin(local)*7}vw),calc(-50% + ${y+3}vh)) rotate(${-twist*.6}deg) scale(${sx*1.07},${sy*.94})`;
  words[2].style.transform=`translate(calc(-50% + ${x-12}vw),calc(-50% + ${y}vh)) rotate(${twist}deg) scale(${sx},${sy})`;
  typeStage.style.opacity=String(entry*.96);
}
function render(){
  const t=state.time;
  const phase=t<24?0:t<46?1:t<78?2:t<98?3:4;
  if(state.phase!==phase){state.phase=phase;scene.dataset.phase=String(phase);}
  scene.dataset.elapsed=t.toFixed(2);
  if(!state.lost)renderer.draw();
  typography(t);
  let filmIndex=-1,filmOpacity=0,mode=0;
  if(t>=46&&t<78){
    const local=t-46;
    const shot=Math.floor(local/4);
    filmIndex=[0,0,1,1,2,2,1,0][shot];
    mode=[0,1,0,3,2,2,3,0][shot];
    const part=(local%4)/4;
    filmOpacity=smooth(0,.12,part)*(1-smooth(.81,1,part))*.88;
  }else if(t>=78&&t<95){
    const part=(t-78)%6;
    filmIndex=[1,0,2][Math.floor((t-78)/6)%3];mode=3;
    filmOpacity=smooth(.6,1.1,part)*(1-smooth(3.1,3.9,part))*.48;
  }
  setVideo(filmIndex);
  film.className=`film mode-${mode}`;
  film.style.opacity=String(filmOpacity);
  film.style.transform=`translate(${Math.sin(t*.8)*2}%,${Math.cos(t*.51)*2}%) rotate(${Math.sin(t*.37)*4}deg) scale(${1+state.pressure*.18})`;
  shutter.style.opacity=String(t>=98?smooth(98,101,t)*.98:0);
  afterimage.style.opacity=String(smooth(100,104,t));
  progress.style.transform=`scaleX(${t/DURATION})`;
  notice.classList.toggle('dismissed',t>8);
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
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.lost=true;setPaused(true);});
canvas.addEventListener('webglcontextrestored',()=>{state.lost=false;initialize();});
function initialize(){
  try{renderer=makeRenderer();}catch(error){console.warn('No se pudo iniciar WebGL:',error.message);renderer={resize(){},draw(){}};}
  resize();setPaused(state.paused,false);
}
initialize();
