import {projectiveTransform} from './projective-transform.js';
import {readSaved} from './visitor-settings.js';
import {LivingPortraitController} from './living-portrait-controller.js';
import {fitArrivalPhoto} from './arrival-photo-layout.js';
// Inside corners of the gold frame in the 1536 x 1024 atrium photograph.
const corners = [[176,100],[468,177],[460,619],[164,632]];
export function createPortraitWelcome() {
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const stage=document.querySelector('#portrait-stage'),video=document.querySelector('#portrait-welcome');
 const control=document.querySelector('#welcome-control'),modal=document.querySelector('#modal'),loading=document.querySelector('#loading');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>readSaved('serengeti-reduced-motion',motion.matches)===true;
 let requested=false,failed=false,sound=false,narrating=false,finished=false,userPaused=false,started=false,completed=false,delay=null;
 const controller=new LivingPortraitController();controller.transition('invite');
 video.style.transform=projectiveTransform(360,475,corners);
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=false;

 const controls=document.createElement('div');controls.id='portrait-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Living portrait controls');
 control.before(controls);
 const movement=document.createElement('button');movement.id='portrait-motion-control';movement.className='portrait-motion-control';
 movement.innerHTML='<i class="ph-light ph-pause" aria-hidden="true"></i><span>Pause portrait</span>';
 controls.append(movement,control);
 const caption=document.createElement('div');caption.id='welcome-caption';arrival.append(caption);
 let captions=readSaved('serengeti-captions',true)!==false;
 let inView=typeof IntersectionObserver==='undefined';
 const visible=()=>inView&&!document.body.classList.contains('exploring')&&!modal.open&&!document.hidden&&loading.classList.contains('hidden');
 const updateCaption=()=>{caption.textContent=captions&&narrating&&!video.muted&&!video.paused&&!video.ended&&visible()?(video.currentTime<5.54?'Welcome to Serengeti Gallery, here in Detroit.':'Explore the art, enjoy the cinema, and make yourself at home.'):'';};
 function label() {
  const playing=requested&&!video.paused&&visible();
  movement.querySelector('span').textContent=playing?'Pause portrait':completed?'Replay portrait':'Play portrait';
  movement.querySelector('i').className=`ph-light ${playing?'ph-pause':'ph-play'}`;
  movement.setAttribute('aria-label',playing?'Pause portrait motion':completed?'Replay portrait motion':'Play portrait motion');
  movement.setAttribute('aria-pressed',String(playing));
  const action=narrating?(playing?'Pause welcome':'Resume welcome'):finished?'Replay welcome':'Hear welcome';
  control.querySelector('span').textContent=action;
  control.querySelector('i').className=`ph-light ${narrating&&playing?'ph-pause':'ph-speaker-high'}`;
  control.setAttribute('aria-label',narrating?(playing?'Pause the portrait welcome':'Resume the portrait welcome'):finished?'Replay the portrait welcome':'Play the portrait welcome with sound');
  control.setAttribute('aria-pressed',String(narrating&&playing));
  updateCaption();
 }
 function fit() {
  const {scale,x,y}=fitArrivalPhoto(arrival.clientWidth,arrival.clientHeight,getComputedStyle(image));
  stage.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 }
 new ResizeObserver(fit).observe(arrival);image.addEventListener('load',fit);fit();
 function cancelDelay(){if(delay!==null){clearTimeout(delay);delay=null;}}
 function sync() {
  if(failed)return;
  if(!visible()||reduced()||userPaused||started||completed)cancelDelay();
  else if(delay===null){
   delay=setTimeout(()=>{delay=null;if(!visible()||reduced()||userPaused||started||completed)return;started=true;requested=true;sync();},3000);
  }
  if(visible()&&requested){
   if(!video.getAttribute('src')){video.src='/serengeti-gallery/assets/portrait-welcome.mp4';video.load();}
   if(video.paused)video.play().catch(()=>{requested=false;userPaused=true;label();});
  }else video.pause();
  label();
 }
 movement.onclick=()=>{
  cancelDelay();
  requested=video.paused;userPaused=!requested;
  if(requested){started=true;if(completed||video.ended){video.currentTime=0;completed=false;}}
  if(requested&&narrating)controller.transition('play');
  if(!requested&&narrating)controller.transition('pause');
  sync();
 };
 control.onclick=()=>{
  cancelDelay();
  if(narrating&&!video.paused){requested=false;userPaused=true;controller.transition('pause');sync();return;}
  if(!narrating){video.currentTime=0;finished=false;completed=false;}
  narrating=true;sound=true;requested=true;userPaused=false;started=true;video.loop=false;video.muted=false;
  controller.transition('play');
  window.dispatchEvent(new CustomEvent('serengeti-audio-request',{detail:true}));
  window.dispatchEvent(new CustomEvent('serengeti-portrait-play'));
  sync();
 };
 video.addEventListener('loadeddata',()=>{stage.classList.add('ready');sync();});
 video.addEventListener('ended',()=>{
  if(narrating){finished=true;controller.transition('complete');window.dispatchEvent(new CustomEvent('serengeti-portrait-complete'));}
  narrating=false;video.muted=true;video.loop=false;requested=false;completed=true;
  sync();
 });
 video.addEventListener('error',()=>{cancelDelay();failed=true;stage.classList.remove('ready');controls.hidden=true;});
 for(const event of ['play','pause','timeupdate','volumechange'])video.addEventListener(event,label);
 const updateMotion=()=>{if(!narrating){requested=!reduced()&&started&&!completed&&!userPaused;sync();}};
 motion.addEventListener('change',updateMotion);window.addEventListener('serengeti-motion',updateMotion);
 window.addEventListener('serengeti-captions',e=>{captions=e.detail;updateCaption();});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['open']});
 new MutationObserver(sync).observe(loading,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);
 // Avoid decoding the portrait while a phone visitor scrolls further down.
 if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting);sync();}).observe(arrival);
 sync();
 return {
  pause(){cancelDelay();requested=false;userPaused=true;controller.transition('pause');video.pause();label();},
  setSound(enabled){sound=enabled;if(!sound){narrating=false;video.loop=false;}video.muted=!sound||!narrating;video.volume=1;label();}
 };
}
