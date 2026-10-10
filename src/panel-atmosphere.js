import {readSaved} from './visitor-settings.js';

// The modal's own atmosphere keeps moving while the lobby is paused behind it.
export function attachPanelAtmosphere(){
 const modal=document.querySelector('#modal');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{
  modal.dataset.atmosphere=readSaved('serengeti-reduced-motion',motion.matches)===true?'still':document.hidden?'paused':'moving';
 };
 motion.addEventListener('change',sync);
 window.addEventListener('serengeti-motion',sync);
 document.addEventListener('visibilitychange',sync);
 sync();
}
