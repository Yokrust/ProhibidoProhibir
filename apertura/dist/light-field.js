// Hand-selected chromatic colors, with no gray geometry or automatic palette
// normalization. Full-intensity red, orange, black and white remain accents.
export const CUT_RATE = 30;
export const COLOR_RATE = 30;
export const ACCENT_WIDTH = 2/30;
export const ACCENTS = Object.freeze([
  '#e51b2b','#002fa7','#ff5a00','#ffffff','#e51b2b',
  '#000000','#ff5a00','#ffffff','#e51b2b',
].map((color,index)=>Object.freeze({start:index,end:index+ACCENT_WIDTH,color})));
export const FIELD_COLORS = Object.freeze([
  '#bf1d62', // Crimson.
  '#002fa7', // Digital IKB, used directly without remapping.
  '#7700d4', // Violet.
  '#995300', // Deep amber, paired with pure-orange accents.
  '#0046d5', // Cobalt.
  '#5f00ed', // Electric violet.
]);
const order = [0,1,2,0,1,4,2,1,3,0,5,1];
export function lightFrameAt(time){
  const tick=Math.floor(Math.max(0,time)*CUT_RATE);
  const beat=Math.floor(tick/2);
  const colorIndex=order[tick%order.length];
  const accent=ACCENTS.find(cut=>time>=cut.start&&time<cut.end);
  return {
    tick,
    accent: Boolean(accent),
    ground: accent?accent.color:FIELD_COLORS[colorIndex],
    figure: !accent&&tick%4<3 ? beat%5 : -1,
    ink: FIELD_COLORS[(colorIndex+3+beat%2)%FIELD_COLORS.length],
    x: [.5,.15,.88,.4,.7][beat%5],
    y: [.5,.7,.22,.5,.8][beat%5],
    angle: (beat%4)*Math.PI/4,
    scale: [.8,1.45,1,1.75][beat%4],
  };
}
export function drawLightField(ctx,width,height,time){
  const f=lightFrameAt(time);
  ctx.fillStyle=f.ground;
  ctx.fillRect(0,0,width,height);
  if(f.figure<0)return;
  const size=Math.min(width,height);
  ctx.save();ctx.translate(width*f.x,height*f.y);ctx.rotate(f.angle);ctx.scale(f.scale,f.scale);
  ctx.fillStyle=f.ink;ctx.strokeStyle=f.ink;ctx.lineWidth=size*.09;
  if(f.figure===0){
    ctx.beginPath();ctx.arc(0,0,size*.37,0,Math.PI*2);ctx.stroke();
  }else if(f.figure===1){
    ctx.beginPath();ctx.moveTo(0,-size*.6);ctx.lineTo(size*.54,size*.4);ctx.lineTo(-size*.54,size*.4);ctx.closePath();ctx.fill();
  }else if(f.figure===2){
    ctx.fillRect(-size*.12,-height,size*.24,height*2);
    ctx.fillRect(-width,-size*.12,width*2,size*.24);
  }else if(f.figure===3){
    ctx.beginPath();ctx.ellipse(0,0,size*.65,size*.16,0,0,Math.PI*2);ctx.stroke();
  }else{
    ctx.fillRect(-size*.32,-size*.32,size*.64,size*.64);
  }
  ctx.restore();
}
