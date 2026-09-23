import {readSaved,qualityProfile} from './visitor-settings.js';
import {attachPiano} from './piano.js';
import {attachChess} from './chess-game.js';
import {createCinemaPlayer} from './cinema-player.js';
export async function createUnityGallery({artworks,onArt,onRoom,toast}) {
 const profile=qualityProfile(readSaved('serengeti-quality','auto'),matchMedia('(pointer: coarse)').matches);
 const canvas=document.querySelector('#world');canvas.tabIndex=0;
 const response=await fetch('/serengeti-gallery/unity/build-manifest.json');if(!response.ok)throw Error('Unity build is not available');
 const manifest=await response.json();
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=manifest.loaderUrl;script.onload=resolve;script.onerror=()=>reject(Error('Unity loader failed'));document.head.appendChild(script);});
 const instance=await window.createUnityInstance(canvas,{...manifest.config,companyName:'Serengeti Gallery',productName:'Serengeti Gallery',productVersion:'1.1',matchWebGLToCanvasSize:true,devicePixelRatio:Math.min(devicePixelRatio,profile.ratio)},progress=>{document.querySelector('#loading small').textContent=`LOADING UNITY GALLERY · ${Math.round(progress*100)}%`;});
 instance.SendMessage('Playable portrait visitor','SetQuality',profile.mode);
 instance.SendMessage('Playable portrait visitor','SetCatalog',JSON.stringify({items:artworks.map((a,index)=>({index,title:a.title,artist:a.subtitle,description:a.description,note:a.note}))}));
 window.addEventListener('serengeti-quality',e=>{const p=qualityProfile(e.detail,matchMedia('(pointer: coarse)').matches);instance.Module.devicePixelRatio=Math.min(devicePixelRatio,p.ratio);instance.SendMessage('Playable portrait visitor','SetQuality',p.mode);});
 window.addEventListener('serengeti-vr-art',e=>{const index=Number(e.detail);const saved=readSaved('serengeti-discoveries',[]);const visits=new Set(Array.isArray(saved)?saved:[]);visits.add(index);try{localStorage.setItem('serengeti-discoveries',JSON.stringify([...visits]));}catch{}window.dispatchEvent(new CustomEvent('serengeti-discovered',{detail:index}));});
 attachChess(instance);
 const piano=attachPiano(instance);
 const cinema=createCinemaPlayer();
 window.addEventListener('serengeti-xr',e=>{document.body.classList.toggle('xr-active',e.detail===true);document.querySelector('#world').dataset.xr=e.detail?'immersive-vr':'desktop';if(e.detail)cinema.leave();else if(room===2)cinema.enter();});
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
   if(n!==0)piano.leave();
   room=n;document.body.classList.toggle('cinema-active',n===2);
   if(n===2){cinema.enter();cinema.setSound(document.querySelector('#sound span').textContent==='Sound On');}else cinema.leave();
   window.dispatchEvent(new CustomEvent('serengeti-room',{detail:n}));
  }
  onRoom(n);
 }
 function enterScene(){
  instance.SendMessage('Gallery jazz piano','SetAvailable','1');
  document.body.classList.add('exploring');document.querySelector('#arrival').inert=true;document.querySelector('.hero').inert=true;
  document.querySelector('#menu').classList.add('hidden');document.querySelector('#menu-nav').setAttribute('aria-expanded','false');
  canvas.focus();resume();
 }
 function home(){
  instance.SendMessage('Gallery jazz piano','SetAvailable','0');
  piano.leave();
  instance.SendMessage("Gallery chess","Leave");
  updateRoom(-1);send('ShowHome');send('SetPaused','1');
  document.body.classList.remove('exploring','at-entrance');document.querySelector('#arrival').inert=false;document.querySelector('.hero').inert=false;
  canvas.dataset.mode='home';
 }
 function arrive(){
  enterScene();document.body.classList.add('at-entrance');send('ShowHome');updateRoom(0);canvas.dataset.mode='entrance';
 }
 function walk(){send('BeginVisit');canvas.focus();resume();}
 function go(n){
  piano.leave();
  instance.SendMessage("Gallery chess","Leave");
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
 document.querySelector('#play-piano').onclick=()=>{go(0);instance.SendMessage('Gallery jazz piano','Choose','focus');};
 document.querySelector('#play-chess').onclick=()=>{go(0);instance.SendMessage('Gallery chess','Choose','focus');};
 document.querySelector('#run-control').onclick=e=>{const b=e.currentTarget;const on=b.getAttribute('aria-pressed')!=='true';canvas.focus();resume();send('SetRun',on?'1':'0');b.setAttribute('aria-pressed',String(on));b.textContent=on?'Walk':'Run';};
 window.addEventListener('blur',()=>{send('SetRun','0');const b=document.querySelector('#run-control');b.setAttribute('aria-pressed','false');b.textContent='Run';});
 document.querySelector('#jump-control').onclick=()=>{canvas.focus();resume();send('Jump');};
 document.querySelector('#walk-now').onclick=walk;
 document.querySelector('#camera-control').onclick=()=>{send('ChangeView');canvas.focus();resume();};
 home();return {go,home,arrive,walk,view:()=>{send('ChangeView');canvas.focus();resume();},stop:()=>send('SetPaused','1'),resume,enterVR:(url)=>{if(!instance.Module?.WebXR?.toggleVR){toast('The headset runtime did not initialize. Refresh and retry.');return;}if(!document.body.classList.contains('exploring'))go(0);instance.SendMessage('Playable portrait visitor','SetFilm',url);instance.Module.WebXR.toggleVR();setTimeout(()=>{if(!document.body.classList.contains('xr-active'))toast('If VR did not open, allow the headset session and press Enter VR again.');},8000);}};
}
