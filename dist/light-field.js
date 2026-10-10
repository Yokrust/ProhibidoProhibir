// Dense local cuts over a continuously occupied, low-luminance field.
// High-contrast fragments cover at most 3.4% of a frame, excluding full pulses.
export const CUT_RATE = 16;
const grounds = ['#4b0c16','#102751','#30233e','#421b29'];
const panels = ['#752c39','#294972','#693543','#3c425a'];
const inks = ['#ffffff','#9d1115','#b8b9c5','#ffffff','#263d75','#9d1115'];
const fract = value => value-Math.floor(value);
const random = (tick,salt) => fract(Math.sin(tick*127.1+salt*311.7)*43758.5453);
export function lightFrameAt(time){
  const tick=Math.floor(Math.max(0,time)*CUT_RATE);
  const horizontal=tick%3!==1;
  return {
    tick,
    ground: grounds[tick%grounds.length],
    panel: panels[(tick+1)%panels.length],
    planes: Array.from({length:5},(_,i)=>({
      x:random(tick,i)*.8,y:random(tick,i+5)*.8,
      w:.15+random(tick,i+10)*.55,h:.1+random(tick,i+15)*.6,
    })),
    fragments: [
      horizontal?{x:0,y:random(tick,23)*.984,w:1,h:.016}:{x:random(tick,23)*.984,y:0,w:.016,h:1},
      horizontal?{x:random(tick,24)*.986,y:0,w:.014,h:1}:{x:0,y:random(tick,24)*.986,w:1,h:.014},
      {x:random(tick,25)*.84,y:random(tick,26)*.975,w:.16,h:.025},
    ].map((rect,i)=>({...rect,color:inks[(tick+i)%inks.length]})),
  };
}
export function drawLightField(ctx,width,height,time,pulse){
  const frame=lightFrameAt(time);
  ctx.fillStyle=pulse.lit?pulse.color:frame.ground;
  ctx.fillRect(0,0,width,height);
  if(pulse.lit)return;
  ctx.fillStyle=frame.panel;
  for(const r of frame.planes)ctx.fillRect(r.x*width,r.y*height,r.w*width,r.h*height);
  for(const r of frame.fragments){
    ctx.fillStyle=r.color;
    ctx.fillRect(r.x*width,r.y*height,r.w*width,r.h*height);
  }
}
