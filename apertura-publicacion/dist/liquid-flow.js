const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// Local surface coordinates. Pores have different adhesion and receive unequal
// amounts; the trail is deposited as the meniscus moves, never scaled afterward.
const pores=[
  {x:-5,share:.44,pin:106,drag:1,phase:.4},
  {x:27,share:.27,pin:91,drag:1.3,phase:2.1},
  {x:-38,share:.19,pin:79,drag:1.6,phase:4.3},
  {x:53,share:.07,pin:64,drag:1.8,phase:1.4},
  {x:-59,share:.03,pin:48,drag:2,phase:3.5}
];

export class LiquidFlow {
  constructor(){
    this.volume=0;this.revision=0;
    this.rills=pores.map(pore=>({...pore,anchor:pore.x,x:pore.x,y:5,
      head:0,root:0,film:0,velocity:0,bias:0,parent:null,trail:[]}));
  }
  get moving(){return this.rills.some(r=>r.parent!==null?r.head>.02:r.y<276&&(r.head>r.pin+.1||r.velocity>.05));}
  add(amount,bias=0){
    const accepted=Math.min(Math.max(0,amount),Math.max(0,18000-this.volume));
    if(!accepted)return;
    this.volume+=accepted;
    for(const r of this.rills){
      const portion=accepted*r.share;
      if(r.head===0&&r.root===0){r.anchor=r.x=r.x+bias*.22;}
      r.root+=portion*.12;
      r.head+=portion*.88;
      r.bias=bias*.32;
    }
    this.revision++;
  }
  receiver(r){while(r.parent!==null)r=this.rills[r.parent];return r;}
  wetPoint(r,y){
    if(!r.trail.length||y<r.trail[0].y||y>r.y)return null;
    let low=0,high=r.trail.length-1;
    while(low<high){const mid=Math.ceil((low+high)/2);if(r.trail[mid].y>y)high=mid-1;else low=mid;}
    return r.trail[low];
  }
  step(dt){
    let changed=false;
    for(const r of this.rills){
      if(r.parent!==null){
        const transferred=r.head<.02?r.head:r.head*(1-Math.exp(-dt*1.7));
        r.head-=transferred;this.receiver(r).head+=transferred;
        if(transferred>.0001)changed=true;
        continue;
      }
      if(!r.head||r.y>=276)continue;
      const weight=Math.max(0,r.head-r.pin);
      const resistance=r.drag*(1+.16*Math.sin(r.y*.047+r.phase));
      const speed=clamp(Math.sqrt(weight)*1.26/resistance,0,24);
      r.velocity+=(speed-r.velocity)*(1-Math.exp(-dt*3));
      const travel=Math.min(r.velocity*dt,276-r.y);
      if(travel<.0001){if(weight<.1)r.velocity=0;continue;}
      const radius=clamp(Math.sqrt(r.head/Math.PI)*.5,.7,10);
      const deposited=Math.min(weight,travel*radius*2);
      r.head-=deposited;r.film+=deposited;
      r.y+=travel;
      // A slight, fixed variation of the surface guides the new front only.
      let course=r.anchor+r.bias*(1-Math.exp(-r.y/70))+
        1.6*Math.sin(r.y*.028+r.phase)+.65*Math.sin(r.y*.071+r.phase);
      let guide=null,nearest=42;
      for(let index=0;index<this.rills.length;index++){
        const candidate=this.rills[index];
        if(candidate===r||r.y<38||candidate.y<r.y+12)continue;
        const point=this.wetPoint(candidate,r.y);
        if(!point)continue;
        const distance=Math.abs(point.x-r.x);
        if(distance<nearest){nearest=distance;guide={point,index};}
      }
      if(guide)course+=(guide.point.x-course)*.78;
      r.x+=(course-r.x)*(1-Math.exp(-travel*.08));
      const point={x:r.x,y:r.y,radius:Math.max(.35,deposited/(travel*2))};
      const last=r.trail.at(-1);
      if(!last||point.y-last.y>=1.4)r.trail.push(point);
      const contact=radius*.7;
      if(guide&&Math.abs(r.x-guide.point.x)<contact+guide.point.radius*.8){
        r.trail.push({x:r.x,y:r.y,radius:Math.max(radius,guide.point.radius)});
        r.parent=guide.index;
        r.velocity=0;changed=true;
      }
      // Keep old coordinates and width intact, including during another gesture.
      if(travel>.002)changed=true;
      if(r.y>=276)r.velocity=0;
    }
    if(changed)this.revision++;
  }
  settle(){
    for(let i=0;i<5400&&this.moving;i++)this.step(1/90);
  }
}

function side(ctx,points,direction){
  const first=points[0];ctx.lineTo(first.x+first.radius*direction,first.y);
  for(let i=1;i<points.length;i++){
    const previous=points[i-1],point=points[i];
    ctx.quadraticCurveTo(previous.x+previous.radius*direction,previous.y,
      (previous.x+previous.radius*direction+point.x+point.radius*direction)/2,
      (previous.y+point.y)/2);
  }
  const last=points.at(-1);ctx.lineTo(last.x+last.radius*direction,last.y);
}

export function drawLiquid(ctx,flow,center,width,height){
  const scaleX=Math.min(1,width*.12/68);
  const scaleY=Math.min(1,height*.37/310);
  ctx.save();ctx.translate(center.x,center.y);ctx.scale(scaleX,scaleY);
  for(const r of flow.rills){
    if(!r.head&&!r.root)continue;
    const radius=Math.min(18,Math.sqrt(r.head/Math.PI)*.57);
    const neck=Math.min(10,Math.sqrt(r.head/Math.PI)*.5);
    if(r.trail.length){
      const points=[{x:r.anchor,y:2,radius:Math.min(7,1+Math.sqrt(r.root)*.2)},...r.trail];
      if(r.parent===null)points.push({x:r.x,y:r.y,radius:neck});
      // A thin translucent edge reads as a wet film against the white surface.
      for(const fringe of [true,false]){
        const outline=fringe?points.map(p=>({...p,radius:p.radius+.55})):points;
        ctx.fillStyle=fringe?'rgba(170,0,9,.15)':'#ec1d25';ctx.beginPath();
        ctx.moveTo(outline[0].x-outline[0].radius,outline[0].y);
        side(ctx,outline,-1);side(ctx,[...outline].reverse(),1);ctx.closePath();ctx.fill();
      }
      if(r.parent!==null){
        const contact=r.trail.at(-1);
        ctx.fillStyle='#ec1d25';ctx.beginPath();
        ctx.ellipse(contact.x,contact.y,contact.radius,contact.radius*.82,0,0,Math.PI*2);ctx.fill();
      }
    }
    // Weight gathers in a rounded meniscus; viscosity leaves a narrower neck.
    const stretch=1+Math.min(.5,r.velocity*.021);
    if(r.head){
      const wet=ctx.createRadialGradient(r.x-radius*.3,r.y-radius*.2,radius*.04,r.x,r.y+radius*.22,radius*1.22);
      wet.addColorStop(0,'#fc353b');wet.addColorStop(.55,'#ec1d25');wet.addColorStop(1,'#a6020c');
      ctx.fillStyle=wet;ctx.beginPath();
      ctx.moveTo(r.x-neck,r.y-radius*stretch*.72);
      ctx.bezierCurveTo(r.x-radius*.79,r.y-radius*.42,r.x-radius*1.03,r.y+radius*.42,r.x-radius*.57,r.y+radius*stretch*.83);
      ctx.bezierCurveTo(r.x-radius*.25,r.y+radius*stretch*1.07,r.x+radius*.51,r.y+radius*stretch*.99,r.x+radius*.79,r.y+radius*stretch*.56);
      ctx.bezierCurveTo(r.x+radius*1.04,r.y+radius*.03,r.x+radius*.68,r.y-radius*.46,r.x+neck,r.y-radius*stretch*.72);
      ctx.closePath();ctx.fill();
    }
    // The wet edge grows locally around each pore instead of forming a red banner.
    const edge=Math.min(18,1+Math.sqrt(r.root)*.43);
    ctx.fillStyle='#d5060f';
    ctx.beginPath();ctx.ellipse(r.anchor,3,edge,Math.min(8,edge*.4),.07*Math.sin(r.phase),0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.17)';ctx.beginPath();
    ctx.ellipse(r.anchor,2,edge*.8,Math.min(3,edge*.15),0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
