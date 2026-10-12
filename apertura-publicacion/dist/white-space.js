import {LiquidFlow,drawLiquid} from './liquid-flow.js';

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const settle=(value,target,dt,speed)=>value+(target-value)*(1-Math.exp(-dt*speed));

/** Pressure leaves an accumulating trace; its delayed flow has a finite charge. */
export class WhitePressure {
  constructor(){this.reset();}
  reset(){
    this.age=0;this.held=0;this.pressed=false;this.tension=0;
    this.dragX=0;this.dragY=0;this.pullX=0;this.pullY=0;
    this.ink=0;this.reservoir=0;this.damage=0;this.marks=0;
    this.liquid=new LiquidFlow();
    this.biasX=0;this.biasY=0;this.interacted=false;this.reduced=false;
  }
  press(){this.pressed=true;this.held=0;this.dragX=0;this.dragY=0;}
  move(x,y){if(this.pressed){this.dragX=x;this.dragY=y;}}
  target(){
    const distance=Math.hypot(this.dragX,this.dragY);
    return clamp((this.reduced?.4:(1-Math.exp(-this.held/3))*.72)+clamp(distance/240)*.22,0,.94);
  }
  deposit(amount){
    this.ink=Math.min(.96,1-(1-this.ink)*Math.exp(-amount));
    this.liquid.add(amount*3900,this.biasX);
  }
  release(record=true){
    if(!this.pressed)return;
    const strength=Math.max(this.tension,this.target());
    if(record&&strength>.12){
      this.marks++;this.interacted=true;
      if(this.reduced){
        this.biasX=clamp(this.dragX*.12,-26,26);this.biasY=clamp(this.dragY*.08,-14,22);
        this.deposit(.22+strength*.4);this.liquid.settle();this.reservoir=0;
      }
      else this.reservoir=clamp(this.reservoir+.18*strength,0,1.4);
      this.damage=Math.max(this.damage,clamp(.1+this.ink*.72+strength*.17,0,.92));
    }
    if(!record)this.reservoir=0;
    this.pressed=false;this.held=0;this.dragX=0;this.dragY=0;
  }
  step(dt){
    // Fixed small steps keep adhesion and deposition stable at different frame rates.
    const steps=Math.max(1,Math.ceil(dt*90)),part=dt/steps;
    for(let i=0;i<steps;i++)this.advance(part);
  }
  advance(dt){
    this.age+=dt;
    if(this.pressed)this.held+=dt;
    const target=this.pressed?this.target():0;
    this.tension=this.reduced?target:settle(this.tension,target,dt,this.pressed?1.15:1.05);
    this.pullX=this.reduced?clamp(this.dragX*.04,-12,12):settle(this.pullX,clamp(this.dragX*.04,-12,12),dt,3.5);
    this.pullY=this.reduced?clamp(this.dragY*.04,-9,9):settle(this.pullY,clamp(this.dragY*.04,-9,9),dt,3.5);
    if(this.reduced){this.reservoir=0;return;}
    if(this.pressed&&this.held>.45){
      this.reservoir=clamp(this.reservoir+dt*(.3+this.tension*.34),0,1.4);
      this.biasX=settle(this.biasX,clamp(this.dragX*.12,-26,26),dt,1.2);
      this.biasY=settle(this.biasY,clamp(this.dragY*.08,-14,22),dt,1.2);
      this.deposit(dt*(.1+this.tension*.13));
    }else if(!this.pressed&&this.reservoir>0){
      this.deposit(dt*.085*(.35+Math.min(1,this.reservoir)));
      this.reservoir=Math.max(0,this.reservoir-dt*.16);
    }
    this.liquid.step(dt);
    this.damage=Math.max(this.damage,this.ink*.84);
  }
}

export class WhiteSpace {
  constructor(stage,onChange=()=>{}){
    this.stage=stage;this.target=stage.querySelector('.white-touch');
    this.hint=stage.querySelector('.white-instruction');
    this.signature=stage.querySelector('.white-signature');
    this.canvas=stage.querySelector('canvas');this.ctx=this.canvas.getContext('2d');
    this.model=new WhitePressure();this.active=false;this.pointer=null;this.key=null;
    this.onChange=onChange;this.bind();
  }
  activate(reduced=false){
    this.cancel();this.model.reset();this.model.reduced=reduced;
    if(reduced)this.model.age=8;
    this.active=true;this.drawKey='';this.stage.hidden=false;this.stage.dataset.input='pointer';this.target.disabled=!reduced;
    this.draw();
  }
  deactivate(){this.cancel();this.active=false;this.stage.hidden=true;}
  cancel(){
    const pointer=this.pointer;this.pointer=null;this.key=null;
    this.model.release(false);
    if(pointer!==null&&this.target.hasPointerCapture(pointer))this.target.releasePointerCapture(pointer);
  }
  bind(){
    this.target.addEventListener('pointerdown',event=>{
      if(!this.active||this.target.disabled||!event.isPrimary||event.button!==0||this.model.pressed)return;
      this.stage.dataset.input='pointer';
      event.preventDefault();this.target.focus({preventScroll:true});
      this.pointer=event.pointerId;this.origin={x:event.clientX,y:event.clientY};
      this.target.setPointerCapture(event.pointerId);this.model.press();this.onChange();
    });
    this.target.addEventListener('pointermove',event=>{
      if(event.pointerId!==this.pointer)return;
      this.model.move(event.clientX-this.origin.x,event.clientY-this.origin.y);this.onChange();
    });
    this.target.addEventListener('pointerup',event=>{
      if(event.pointerId!==this.pointer)return;
      this.model.release();const pointer=this.pointer;this.pointer=null;
      if(this.target.hasPointerCapture(pointer))this.target.releasePointerCapture(pointer);
      this.onChange();
    });
    for(const name of ['pointercancel','lostpointercapture'])this.target.addEventListener(name,()=>{this.cancel();this.onChange();});
    this.target.addEventListener('keydown',event=>{
      if(!this.active||!['Space','Enter'].includes(event.code))return;
      this.stage.dataset.input='keyboard';
      event.preventDefault();if(event.repeat||this.model.pressed)return;
      this.key=event.code;this.model.press();this.onChange();
    });
    this.target.addEventListener('keyup',event=>{
      if(event.code!==this.key)return;
      event.preventDefault();this.key=null;this.model.release();this.onChange();
    });
    this.target.addEventListener('blur',()=>{if(this.key!==null){this.cancel();this.onChange();}});
    document.addEventListener('keydown',event=>{
      if(this.active&&event.code==='Tab')this.stage.dataset.input='keyboard';
    });
    // Assistive activation may dispatch a click without pointer/key events.
    this.target.addEventListener('click',event=>{
      if(event.detail!==0||!this.active||this.model.pressed)return;
      this.model.press();this.model.step(1.8);this.model.release();this.onChange();
    });
  }
  resize(width,height,ratio){
    this.width=width;this.height=height;this.ratio=ratio;this.drawKey='';
    this.canvas.width=Math.round(width*ratio);this.canvas.height=Math.round(height*ratio);
    // Generous margins on every side, including the touch target.
    this.center={x:width*.64,y:height*.43};
    this.target.style.left=`${this.center.x}px`;this.target.style.top=`${this.center.y}px`;
    this.target.style.width=`${Math.min(156,width*.24+24)}px`;
    this.hint.style.left=`${this.center.x}px`;this.hint.style.top=`${this.center.y+30}px`;
    if(this.active)this.draw();
  }
  update(dt){if(!this.active)return;this.model.step(dt);this.draw();}
  draw(){
    if(!this.width)return;
    const {model:m,ctx,center:c}=this;
    const ready=m.reduced||m.age>=2.8;
    const hint=ready&&m.age>=6&&!m.interacted&&!m.pressed;
    const opacity=m.reduced?'1':clamp((m.age-7)/2).toFixed(3);
    const flowing=!m.reduced&&((m.pressed&&m.held>.45)||m.reservoir>0||m.liquid.moving);
    const key=[ready,hint,opacity,m.pressed,flowing,m.tension.toFixed(3),m.pullX.toFixed(2),m.pullY.toFixed(2),m.ink.toFixed(3),m.damage.toFixed(3),m.liquid.revision,m.marks].join(':');
    if(key===this.drawKey)return;
    this.drawKey=key;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.setTransform(this.ratio,0,0,this.ratio,0,0);
    this.target.disabled=!ready;
    this.stage.dataset.pressed=String(m.pressed);this.stage.dataset.tension=m.tension.toFixed(3);
    this.stage.dataset.marks=String(m.marks);this.stage.dataset.ink=m.ink.toFixed(3);
    this.stage.dataset.damage=m.damage.toFixed(3);this.stage.dataset.flowing=String(flowing);
    this.stage.dataset.front=m.liquid.rills[0].y.toFixed(2);
    this.target.setAttribute('aria-pressed',String(m.pressed));
    this.hint.hidden=!hint;
    this.signature.style.opacity=opacity;
    if(!ready)return;
    const half=Math.min(68,this.width*.12)+m.damage*Math.min(24,this.width*.04)+m.tension*Math.min(84,this.width*.11);
    const gap=3+m.damage*6+m.tension*m.tension*23;
    if(m.ink>.001)drawLiquid(ctx,m.liquid,c,this.width,this.height);
    // The opening survives release. Its edges stay fixed rather than flickering.
    ctx.fillStyle='#000000';ctx.beginPath();ctx.moveTo(c.x-half,c.y-1);
    ctx.bezierCurveTo(c.x-half*.72,c.y-2,c.x-half*.36,c.y-gap*.82,c.x-half*.14+m.pullX,c.y-gap*.67+m.pullY);
    ctx.lineTo(c.x+half*.04+m.pullX,c.y-gap*.98+m.pullY);
    ctx.bezierCurveTo(c.x+half*.34,c.y-gap*.55,c.x+half*.72,c.y-1,c.x+half,c.y+.4);
    ctx.bezierCurveTo(c.x+half*.6,c.y+gap*.36,c.x+half*.3,c.y+gap*.85+m.pullY,c.x+half*.1+m.pullX,c.y+gap*.6);
    ctx.lineTo(c.x-half*.07+m.pullX,c.y+gap*.91+m.pullY);
    ctx.bezierCurveTo(c.x-half*.35,c.y+gap*.65,c.x-half*.77,c.y+1,c.x-half,c.y-1);
    ctx.closePath();ctx.fill();
  }
}
