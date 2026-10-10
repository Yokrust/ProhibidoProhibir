// Full-screen chromatic cuts, inspired by the supplied 29.97 fps RGB reference.
// Palette luminance is normalized; this deliberately does not reproduce its
// full-brightness RGB strobe. Geometry shares a narrow luminance envelope.
export const CUT_RATE = 30;
const luminance = rgb => rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
const encode = value => Math.round(255*(value<=.0031308?12.92*value:1.055*value**(1/2.4)-.055));
const hex = rgb => '#'+rgb.map(value=>encode(value).toString(16).padStart(2,'0')).join('');
const balanced = rgb => {const gain=.14/luminance(rgb);return hex(rgb.map(value=>value*gain));};
export const FIELD_COLORS = Object.freeze([
  [.52,.09,.13], [.05,.11,.65], [.08,.18,.12],
  [.32,.095,.38], [.30,.13,.055], [.08,.17,.26], [.14,.14,.14],
].map(balanced));
export const FIGURE_COLORS = Object.freeze([hex([.095,.095,.095]),hex([.18,.18,.18])]);
const order = [0,2,1,0,2,1,3,1,4,0,5,1,6,0,2,1,4,3];
export function lightFrameAt(time){
  const tick=Math.floor(Math.max(0,time)*CUT_RATE);
  const beat=Math.floor(tick/3);
  return {
    tick,
    ground: FIELD_COLORS[order[tick%order.length]],
    figure: tick%6<3 ? beat%5 : -1,
    ink: FIGURE_COLORS[beat%2],
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
