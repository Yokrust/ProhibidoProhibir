export const DURATION = 34;
export const TYPE_START = 9;
export const FILM_START = 18;
export const EMPTY_START = 32;
export const WHITE_START = 15;
export const WORD_DURATION = .75;

const corners = ['corner-tl','corner-br','corner-tr','corner-bl'];
const images = [1,0,2,1,2,0,1,0,2,1,0,2,0,1];
export const SHOTS = Object.freeze(images.map((video,i)=>Object.freeze({
  start: FILM_START+i*1.025,
  end: FILM_START+i*1.025+[.28,.42,.62][i%3],
  video,
  layout: corners[i%4],
})));
export function phaseAt(t){return t<TYPE_START?0:t<FILM_START?1:t<EMPTY_START?2:3;}
export function shotAt(t){return SHOTS.find(shot=>t>=shot.start&&t<shot.end)||null;}
