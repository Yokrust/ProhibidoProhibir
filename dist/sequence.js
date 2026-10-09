export const DURATION = 112;
export const TYPE_START = 26;
export const FILM_START = 62;
export const EMPTY_START = 104;

// Deliberately separated single pulses; each onset is at least 1.45 s apart.
export const PULSES = Object.freeze([0,1.45,2.95,4.55,6.05,7.6,9.1,10.6,12.2,13.7,15.2,16.8,18.3,19.8,21.4,23,24.7]);
export const PULSE_WIDTH = 0.17;
export const PULSE_COLORS = Object.freeze(['#ffffff','#081238','#ffffff','#9d1115','#081238','#ffffff','#9d1115']);
export const SHOTS = Object.freeze([
  {start:62,end:68.6,video:0,layout:'shot-eye'},
  {start:71,end:77.3,video:1,layout:'shot-mouth'},
  {start:80,end:86.8,video:2,layout:'shot-figure'},
  {start:89,end:92.8,video:0,layout:'shot-strip'},
  {start:95,end:98.7,video:2,layout:'shot-small'},
  {start:100,end:103.3,video:1,layout:'shot-last'},
]);
export function phaseAt(t){return t<TYPE_START?0:t<FILM_START?1:t<EMPTY_START?2:3;}
export function pulseAt(t){
  const index=PULSES.findLastIndex(start=>start<=t);
  const age=index<0?Infinity:t-PULSES[index];
  return {index,age,lit:age<PULSE_WIDTH,color:PULSE_COLORS[Math.max(0,index)%PULSE_COLORS.length]};
}
export function shotAt(t){return SHOTS.find(shot=>t>=shot.start&&t<shot.end)||null;}
