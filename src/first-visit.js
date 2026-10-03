import {readSaved,writeSaved} from './visitor-settings.js';
export function attachFirstVisit({modal,close,onFinish=()=>{}}){
 const steps=[
  ['Move','Drag the round stick to walk. On a keyboard, use W A S D or the arrow keys.','ph-person-simple-walk'],
  ['Look around','Drag across the room to look. The View button switches cameras.','ph-hand-swipe-right'],
  ['Tap artwork','Tap a picture to discover its story. Activities has chess and piano. Lobby brings you home.','ph-image']
 ];
 let step=0;
 function finish(){writeSaved('serengeti-first-visit-v1',true);close();onFinish();}
 function draw(){const [title,text,icon]=steps[step];modal(`<div class="list-panel first-visit"><div class="caption">A QUICK HELLO · ${step+1} OF 3</div><i class="ph-light ${icon}" aria-hidden="true"></i><h2>${title}</h2><p>${text}</p><div class="tutorial-actions"><button id="tutorial-skip">Skip tutorial</button><button id="tutorial-next" class="primary">${step===2?'Start exploring':'Next'}</button></div></div>`);document.querySelector('#tutorial-skip').onclick=finish;document.querySelector('#tutorial-next').onclick=()=>{if(step===2)finish();else{step++;draw();}};}
 function open(){step=0;draw();}
 return {open,first(){if(!readSaved('serengeti-first-visit-v1',false))open();}};
}
