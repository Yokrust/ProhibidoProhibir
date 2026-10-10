// Intense full-field colors use 200 ms steps. Faster detail stays within a
// narrow luminance range of the current color, rather than adding more flashes.
export const CUT_RATE = 30;
export const COLOR_RATE = 5;
export const FIELD_COLORS = Object.freeze([
  '#e51b2b', // Vermilion red.
  '#002fa7', // Digital approximation of International Klein Blue.
  '#7800d9', // Violet.
  '#ffd500', // Yellow.
  '#ff5a00', // Orange.
  '#000000',
  '#ffffff',
]);
const decode = color => color.slice(1).match(/../g).map(part=>{
  const value=parseInt(part,16)/255;
  return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
});
const encode = value => Math.round(255*(value<=.0031308?12.92*value:1.055*value**(1/2.4)-.055));
const shift = (color,amount) => '#'+decode(color).map(value=>encode(Math.max(0,Math.min(1,value+amount))).toString(16).padStart(2,'0')).join('');
const order = [0,1,0,2,1,0,5,1,0,3,1,2,0,1,6,0,1,4];
const offsets = [0,.008,-.005,.005,-.008,0];
// Cache all tonal variants; no color conversion is needed in the draw loop.
const tones = FIELD_COLORS.map(color=>offsets.map(amount=>shift(color,amount)));
const inks = FIELD_COLORS.map(color=>[shift(color,-.025),shift(color,.025)]);
export function lightFrameAt(time){
  const tick=Math.floor(Math.max(0,time)*CUT_RATE);
  const colorStep=Math.floor(tick/(CUT_RATE/COLOR_RATE));
  const colorIndex=order[colorStep%order.length];
  const punctuation=colorIndex>=5;
  const beat=Math.floor(tick/3);
  return {
    tick,
    colorStep,
    colorIndex,
    ground: punctuation?FIELD_COLORS[colorIndex]:tones[colorIndex][tick%offsets.length],
    figure: !punctuation&&tick%6<3 ? beat%5 : -1,
    ink: inks[colorIndex][beat%2],
    x: [.5,.23,.78,.5,.65][beat%5],
    y: [.5,.64,.35,.5,.7][beat%5],
    angle: (beat%4)*Math.PI/4,
  };
}
export function drawLightField(ctx,width,height,time){
  const f=lightFrameAt(time);
  ctx.fillStyle=f.ground;
  ctx.fillRect(0,0,width,height);
  if(f.figure<0)return;
  const size=Math.min(width,height);
  ctx.save();ctx.translate(width*f.x,height*f.y);ctx.rotate(f.angle);
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
