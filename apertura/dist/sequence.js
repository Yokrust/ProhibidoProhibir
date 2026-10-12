export const INTRO_DURATION = 24;
export const TYPE_START = 9;
export const WHITE_START = INTRO_DURATION;

// A single interruption, then names and negative space. The first 9 s are unchanged.
export const TYPE_ACTS = Object.freeze([
  Object.freeze({start:9, end:10.2, id:'silence', background:'#ffffff', text:''}),
  Object.freeze({start:10.2, end:10.85, id:'appearance', background:'#ffffff', text:'Prohibido Prohibir!'}),
  Object.freeze({start:10.85, end:12.2, id:'absence', background:'#ffffff', text:''}),
  Object.freeze({start:12.2, end:15.4, id:'name', background:'#ffffff', text:'Prohibido Prohibir!'}),
  Object.freeze({start:15.4, end:18.1, id:'broyer', background:'#ffffff', text:'Colaborador: Broyer du Noir.'}),
  Object.freeze({start:18.1, end:20.8, id:'societe', background:'#ffffff', text:'Colaborador: La Societe Depressive.'}),
  Object.freeze({start:20.8, end:22.25, id:'trace', background:'#ffffff', text:''}),
  Object.freeze({start:22.25, end:24, id:'empty', background:'#ffffff', text:''}),
]);
export function typeActAt(t){return TYPE_ACTS.find(act=>t>=act.start&&t<act.end)||null;}
export function phaseAt(t){return t<TYPE_START?0:t<WHITE_START?1:2;}
