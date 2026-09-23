import {projectiveTransform} from './projective-transform.js';
import {readSaved} from './visitor-settings.js';
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
 let delayPassed=false;
 let requested=!reducedMotion.matches,finished=false,ready=false,failed=false,sound=false;
 video.style.transform=projectiveTransform(360,475,corners);
 video.muted=true;
 const caption=document.createElement('div');caption.id='welcome-caption';arrival.append(caption);
 let captions=readSaved('serengeti-captions',true)!==false;
 const updateCaption=()=>{caption.textContent=captions&&!video.paused&&!video.ended&&visible()?(video.currentTime<5.54?'Welcome to Serengeti Gallery, here in Detroit.':'Explore the art, enjoy the cinema, and make yourself at home.'):'';};
 for(const event of ['timeupdate','play','pause','ended'])video.addEventListener(event,updateCaption);
 window.addEventListener('serengeti-captions',e=>{captions=e.detail;updateCaption();});

 function fit() {
  const {width,height}=arrival.getBoundingClientRect();
  const scale=Math.max(width/1536,height/1024);
  const [px,py]=getComputedStyle(image).objectPosition.split(' ').map(n=>parseFloat(n)/100);
  stage.style.transform=`translate(${(width-1536*scale)*px}px,${(height-1024*scale)*py}px) scale(${scale})`;
 }
 new ResizeObserver(fit).observe(arrival);image.addEventListener('load',fit);fit();
 const visible=()=>!document.body.classList.contains('exploring')&&!modal.open&&!document.hidden&&loading.classList.contains('hidden');
 function label() {
  const playing=delayPassed&&requested&&!finished&&visible();
  control.querySelector('span').textContent=!sound?(finished?'Replay with sound':'Hear welcome'):finished?'Replay welcome':playing?'Pause welcome':'Play welcome';
  control.querySelector('i').className=`ph-light ${playing?'ph-pause':'ph-play'}`;
  control.setAttribute('aria-label',!sound?'Play the portrait welcome with sound':finished?'Replay the portrait welcome':playing?'Pause the portrait welcome':'Play the portrait welcome');
  control.setAttribute('aria-pressed',String(playing&&sound));
 }
 function start() {
  if(!video.getAttribute('src')){video.src='/serengeti-gallery/assets/portrait-welcome.mp4';video.load();}
  video.play().catch(()=>{requested=false;label();});
 }
 function sync() {
  if(failed)return;
  if(delayPassed&&visible()&&requested&&!finished) start();else video.pause();
  label();
 }
 video.addEventListener('loadeddata',()=>{ready=true;stage.classList.add('ready');sync();});
 video.addEventListener('ended',()=>{finished=true;label();});
 video.addEventListener('error',()=>{failed=true;stage.classList.remove('ready');control.hidden=true;});
 const welcomeTimer=setTimeout(()=>{delayPassed=true;sync();},5000);
 control.onclick=()=>{
  if(!sound){document.querySelector('#sound').click();return;}
  if(!delayPassed){clearTimeout(welcomeTimer);delayPassed=true;requested=false;}
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
   sound=enabled;video.muted=!sound;video.volume=1;
   if(enabled&&visible()) {clearTimeout(welcomeTimer);delayPassed=true;if(ready)video.currentTime=0;finished=false;requested=true;sync();}else label();
  }
 };
}

