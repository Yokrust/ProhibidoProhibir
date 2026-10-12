export const INTRO_DURATION = 24;
export const TYPE_START = 9;
export const WHITE_START = INTRO_DURATION;

// Three held impressions, rather than a loop of interchangeable words.
export const TYPE_ACTS = Object.freeze([
  Object.freeze({start:9, end:14, id:'question', background:'#000000', ink:'#ffffff', text:'¿Quién decide qué se calla?'}),
  Object.freeze({start:14, end:19, id:'silence', background:'#ffffff', ink:'#000000', text:'El silencio se fabrica.'}),
  Object.freeze({start:19, end:24, id:'refusal', background:'#000000', ink:'#ffffff', text:'Prohibido prohibir.'}),
]);
export function typeActAt(t){return TYPE_ACTS.find(act=>t>=act.start&&t<act.end)||null;}

export function phaseAt(t){return t<TYPE_START?0:t<WHITE_START?1:2;}
