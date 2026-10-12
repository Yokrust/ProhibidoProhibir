import { typeActAt } from './sequence.js';

const clamp = value => Math.max(0, Math.min(1, value));
const progress = (time, start, duration) => clamp((time-start)/duration);
const faces = {
  serif: {family:'"Times New Roman", Times, serif', weight:700, style:'italic'},
  sans: {family:'"Arial Black", Arial, Helvetica, sans-serif', weight:900, style:'normal'},
  mono: {family:'"Courier New", Courier, monospace', weight:700, style:'normal'},
};

// Coordinates belong to a printed composition. The letters never drift,
// stretch or explode; only the censor's ink moves across the impression.
function composition(id, portrait){
  if(id==='question')return portrait?[
    ['¿QUIÉN', 'serif', .035, .10, .93, .20],
    ['DECIDE', 'sans', .025, .32, .95, .18],
    ['QUÉ SE', 'mono', .04, .55, .90, .13],
    ['CALLA?', 'mono', .04, .71, .91, .14],
  ]:[
    ['¿QUIÉN', 'serif', .04, .065, .74, .27],
    ['DECIDE', 'sans', .025, .34, .95, .34],
    ['QUÉ SE CALLA?', 'mono', .04, .745, .92, .15],
  ];
  if(id==='silence')return portrait?[
    ['EL', 'serif', .035, .075, .43, .15],
    ['SILENCIO', 'sans', .025, .255, .95, .18],
    ['SE', 'serif', .04, .49, .38, .14],
    ['FABRICA.', 'sans', .025, .695, .95, .17],
  ]:[
    ['EL SILENCIO', 'sans', .025, .10, .95, .25],
    ['SE', 'serif', .04, .415, .28, .18],
    ['FABRICA.', 'sans', .025, .66, .95, .27],
  ];
  // On a narrow screen the last poster is printed sideways, at its full size.
  return [
    ['PROHIBIDO', 'sans', .025, .10, .95, .34],
    ['PROHIBIR', 'sans', .025, .555, .95, .34],
  ];
}

export class TypeIntervention {
  constructor(stage){
    this.stage=stage;
    this.canvas=document.createElement('canvas');
    this.canvas.className='type-print';
    stage.appendChild(this.canvas);
    this.ctx=this.canvas.getContext('2d');
    this.print=document.createElement('canvas');
    this.printCtx=this.print.getContext('2d');
    this.key='';
    this.lines=[];
  }
  prepare(act,width,height,ratio){
    const portrait=width<height*.8;
    const sideways=portrait&&act.id==='refusal';
    this.width=sideways?height:width;
    this.height=sideways?width:height;
    this.ratio=ratio;
    this.canvas.width=this.print.width=Math.round(this.width*ratio);
    this.canvas.height=this.print.height=Math.round(this.height*ratio);
    this.canvas.style.width=`${this.width}px`;
    this.canvas.style.height=`${this.height}px`;
    this.canvas.style.transform=sideways?`translateX(${width}px) rotate(90deg)`:'none';
    const ctx=this.printCtx;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.fillStyle=act.ink;
    ctx.textBaseline='alphabetic';
    this.lines=composition(act.id,portrait).map(([text,face,x,y,w,h])=>{
      const font=faces[face];
      const fontAt=size=>`${font.style} ${font.weight} ${size}px ${font.family}`;
      ctx.font=fontAt(100);
      const metrics=ctx.measureText(text);
      const span=metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight;
      const rise=metrics.actualBoundingBoxAscent;
      const fall=metrics.actualBoundingBoxDescent;
      const size=Math.min(this.width*w/span,this.height*h/(rise+fall))*100;
      ctx.font=fontAt(size);
      const fitted=ctx.measureText(text);
      const left=this.width*x+fitted.actualBoundingBoxLeft;
      const top=this.height*y;
      ctx.fillText(text,left,top+fitted.actualBoundingBoxAscent);
      return {x:this.width*x,y:top,w:fitted.actualBoundingBoxLeft+fitted.actualBoundingBoxRight,h:fitted.actualBoundingBoxAscent+fitted.actualBoundingBoxDescent};
    });
    // Fixed pinholes in the ink: no animated noise or digital glitch.
    ctx.globalCompositeOperation='destination-out';
    let seed=1973;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<1500;i++){
      const x=random()*this.width,y=random()*this.height;
      ctx.globalAlpha=.25+random()*.5;
      ctx.fillRect(x,y,.35+random()*1.1,.4+random()*1.6);
    }
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
    this.key=`${act.id}:${width}:${height}:${ratio}`;
    this.stage.dataset.composition=act.id;
    this.stage.dataset.orientation=sideways?'sideways':'upright';
  }
  band(line,amount,color,from=.0,to=1,offset=0){
    if(amount<=0)return;
    const ctx=this.ctx;
    const x=line.x-4,y=line.y+line.h*from-3+offset;
    const width=(line.w+8)*amount,height=line.h*(to-from)+6;
    ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(x,y);
    // The same rough edge is used on every frame. No flicker in the type.
    for(let i=0;i<=24;i++)ctx.lineTo(x+width*i/24,y+Math.sin(i*9.1)*1.2);
    ctx.lineTo(x+width,y+height);
    for(let i=24;i>=0;i--)ctx.lineTo(x+width*i/24,y+height+Math.sin(i*7.3)*1.7);
    ctx.closePath();ctx.fill();
  }
  draw(t,width,height,ratio){
    const act=typeActAt(t);
    this.stage.style.opacity=act?'1':'0';
    if(!act)return null;
    if(this.key!==`${act.id}:${width}:${height}:${ratio}`)this.prepare(act,width,height,ratio);
    const local=t-act.start,ctx=this.ctx;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.drawImage(this.print,0,0);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    if(act.id==='question'){
      // Remove the decision-maker first; leave the question hanging.
      this.band(this.lines[1],progress(local,2.65,.55),act.background,.12,.78);
      for(let i=2;i<this.lines.length;i++)this.band(this.lines[i],progress(local,3.45,.6),act.background);
    }else if(act.id==='silence'){
      const target=this.lines.length===4?this.lines[1]:this.lines[0];
      this.band(target,progress(local,2.9,.24),act.ink,-.035,1.035);
      this.band(this.lines.at(-1),progress(local,3.7,.25),act.ink,.24,.82);
    }else{
      // A single red cancellation, then removal of the prohibition itself.
      const line=this.lines[0];
      this.band(line,progress(local,1.65,.45),'#ff0000',.46,.52);
      this.band(line,progress(local,3.35,.6),act.background,-.04,1.04);
    }
    // Each poster ends with a hard cut and a short, deliberate silence.
    if(local>=4.65)ctx.clearRect(0,0,this.width,this.height);
    return act;
  }
}
