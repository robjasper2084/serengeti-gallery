import {createCinemaPlayer} from './cinema-player.js';
export async function createUnityGallery({onArt,onRoom,toast}) {
 const canvas=document.querySelector('#world');canvas.tabIndex=0;
 const response=await fetch('/serengeti-gallery/unity/build-manifest.json');if(!response.ok)throw Error('Unity build is not available');
 const manifest=await response.json();
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=manifest.loaderUrl;script.onload=resolve;script.onerror=()=>reject(Error('Unity loader failed'));document.head.appendChild(script);});
 const instance=await window.createUnityInstance(canvas,{...manifest.config,companyName:'Serengeti Gallery',productName:'Serengeti Gallery',productVersion:'1.1',matchWebGLToCanvasSize:true,devicePixelRatio:Math.min(devicePixelRatio,1.5)},progress=>{document.querySelector('#loading small').textContent=`LOADING UNITY GALLERY · ${Math.round(progress*100)}%`;});
 const cinema=createCinemaPlayer();
 const send=(method,value='')=>instance.SendMessage('Playable portrait visitor',method,String(value));
 let room=-1;
 const blocked=()=>document.querySelector('#modal').open||!document.querySelector('#menu').classList.contains('hidden');
 const resume=()=>send('SetPaused',document.body.classList.contains('exploring')&&!blocked()?'0':'1');
 document.body.classList.add('unity-ready');document.querySelector('#loading').classList.add('hidden');
 canvas.dataset.renderer='Unity WebGL';canvas.dataset.artworks='33';canvas.dataset.character='Circuit Suit curator';
 window.addEventListener('serengeti-art',e=>onArt(Number(e.detail)));
 window.addEventListener('serengeti-sound',e=>cinema.setSound(e.detail));
 window.addEventListener('serengeti-motion',e=>send('SetMotion',e.detail?'0':'1'));
 send('SetMotion',matchMedia('(prefers-reduced-motion: reduce)').matches?'0':'1');
 function updateRoom(n){
  if(room!==n){
   room=n;document.body.classList.toggle('cinema-active',n===2);
   if(n===2){cinema.enter();cinema.setSound(document.querySelector('#sound span').textContent==='Sound On');}else cinema.leave();
   window.dispatchEvent(new CustomEvent('serengeti-room',{detail:n}));
  }
  onRoom(n);
 }
 function enterScene(){
  document.body.classList.add('exploring');document.querySelector('#arrival').inert=true;document.querySelector('.hero').inert=true;
  document.querySelector('#menu').classList.add('hidden');document.querySelector('#menu-nav').setAttribute('aria-expanded','false');
  canvas.focus();resume();
 }
 function home(){
  updateRoom(-1);send('ShowHome');send('SetPaused','1');
  document.body.classList.remove('exploring','at-entrance');document.querySelector('#arrival').inert=false;document.querySelector('.hero').inert=false;
  canvas.dataset.mode='home';
 }
 function arrive(){
  enterScene();document.body.classList.add('at-entrance');send('ShowHome');updateRoom(0);canvas.dataset.mode='entrance';
 }
 function walk(){send('BeginVisit');canvas.focus();resume();}
 function go(n){
  enterScene();document.body.classList.remove('at-entrance');send('EnterRoom',n);updateRoom(n);canvas.dataset.mode='walk';
 }
 window.addEventListener('serengeti-visit-started',()=>{document.body.classList.remove('at-entrance');canvas.dataset.mode='walk';});
 window.addEventListener('serengeti-native-room',e=>{
  if(!document.body.classList.contains('exploring'))return;
  updateRoom(Number(e.detail));
  if(Number(e.detail)===2){document.body.classList.remove('at-entrance');canvas.dataset.mode='walk';}
 });
 canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('focus',resume);canvas.addEventListener('blur',()=>send('SetPaused','1'));
 canvas.addEventListener('pointerdown',()=>{canvas.focus();resume();});
 document.addEventListener('visibilitychange',()=>document.hidden?send('SetPaused','1'):resume());
 for(const [id,value] of [['forward','1'],['backward','-1']]){
  const b=document.querySelector('#'+id);
  b.onpointerdown=e=>{e.preventDefault();canvas.focus();resume();send('SetForward',value);b.setPointerCapture(e.pointerId);};
  b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>send('SetForward','0');
  b.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();resume();send('SetForward',value);}};
  b.onkeyup=()=>send('SetForward','0');
 }
 for(const [id,value] of [['turn-left','-15'],['turn-right','15']])document.querySelector('#'+id).onclick=()=>{send('Turn',value);canvas.focus();resume();};
 document.querySelector('#walk-now').onclick=walk;
 document.querySelector('#camera-control').onclick=()=>{send('ChangeView');canvas.focus();resume();};
 home();return {go,home,arrive,walk,view:()=>{send('ChangeView');canvas.focus();resume();},stop:()=>send('SetPaused','1'),resume,enterVR:()=>toast('This Unity build supports desktop 3D. Headset VR is not configured yet.')};
}
