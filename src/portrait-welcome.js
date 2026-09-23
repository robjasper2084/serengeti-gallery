import {projectiveTransform} from './projective-transform.js';
// Fit the moving painting to the four inside corners of the existing gold frame.
// Coordinates are measured in the 1536 × 1024 atrium photograph.
const corners = [[176,100],[468,177],[460,619],[164,632]];
export function createPortraitWelcome() {
 const arrival=document.querySelector('#arrival');
 const image=document.querySelector('#atrium-image');
 const stage=document.querySelector('#portrait-stage');
 const video=document.querySelector('#portrait-welcome');
 const control=document.querySelector('#welcome-control');
 const modal=document.querySelector('#modal');
 const loading=document.querySelector('#loading');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let requested=!reducedMotion.matches,finished=false,ready=false,failed=false,sound=false;
 video.style.transform=projectiveTransform(360,475,corners);
 video.muted=true;

 function fit() {
  const {width,height}=arrival.getBoundingClientRect();
  const scale=Math.max(width/1536,height/1024);
  const [px,py]=getComputedStyle(image).objectPosition.split(' ').map(n=>parseFloat(n)/100);
  stage.style.transform=`translate(${(width-1536*scale)*px}px,${(height-1024*scale)*py}px) scale(${scale})`;
 }
 new ResizeObserver(fit).observe(arrival);image.addEventListener('load',fit);fit();
 const visible=()=>!document.body.classList.contains('exploring')&&!modal.open&&!document.hidden&&loading.classList.contains('hidden');
 function label() {
  const playing=requested&&!finished&&visible();
  control.querySelector('span').textContent=finished?'Replay welcome':playing?'Pause welcome':'Play welcome';
  control.querySelector('i').className=`ph-light ${playing?'ph-pause':'ph-play'}`;
  control.setAttribute('aria-label',finished?'Replay the portrait welcome':playing?'Pause the portrait welcome':'Play the portrait welcome');
  control.setAttribute('aria-pressed',String(playing));
 }
 function start() {
  if(!video.getAttribute('src')){video.src='/serengeti-gallery/assets/portrait-welcome.mp4';video.load();}
  video.play().catch(()=>{requested=false;label();});
 }
 function sync() {
  if(failed)return;
  if(visible()&&requested&&!finished) start();else video.pause();
  label();
 }
 video.addEventListener('loadeddata',()=>{ready=true;stage.classList.add('ready');sync();});
 video.addEventListener('ended',()=>{finished=true;label();});
 video.addEventListener('error',()=>{failed=true;stage.classList.remove('ready');control.hidden=true;});
 control.onclick=()=>{
  if(finished){video.currentTime=0;finished=false;requested=true;}else requested=!requested;
  sync();
 };
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['open']});
 new MutationObserver(sync).observe(loading,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);
 reducedMotion.addEventListener('change',e=>{if(e.matches){requested=false;sync();}});
 sync();
 return {
  setSound(enabled){
   sound=enabled;video.muted=!sound;
   if(enabled&&visible()) {if(ready)video.currentTime=0;finished=false;requested=true;sync();}
  }
 };
}

