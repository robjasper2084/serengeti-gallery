import {projectiveTransform} from './projective-transform.js';

// Inside corners of the cinema screen in the 1536 x 1024 arrival photograph.
const corners=[[1249,416],[1441,385],[1441,548],[1249,569]];
export function createCinemaTeaser({enterCinema}){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const stage=document.createElement('div');stage.id='cinema-teaser-stage';stage.setAttribute('aria-hidden','true');
 const video=document.createElement('video');video.id='cinema-teaser';video.playsInline=true;video.muted=true;video.defaultMuted=true;video.autoplay=true;video.loop=true;video.preload='auto';video.style.transform=projectiveTransform(1280,720,corners);stage.append(video);arrival.append(stage);
 const panel=document.createElement('section');panel.id='cinema-teaser-controls';panel.setAttribute('aria-label','Cinema trailer');
 panel.innerHTML='<div class="caption">NOW PREVIEWING · 15 SECONDS</div><h2>Detroit After Dark</h2><div class="teaser-actions"><button id="teaser-play" aria-pressed="false">▶ Play trailer</button><button id="teaser-mute" aria-label="Turn trailer sound on" aria-pressed="false">Sound off</button></div><button id="teaser-enter">Enter cinema ↗</button><p id="teaser-status" role="status">Art. Jazz. Detroit.</p>';
 arrival.append(panel);
 const play=panel.querySelector('#teaser-play'),mute=panel.querySelector('#teaser-mute'),status=panel.querySelector('#teaser-status');
 let requested=true;
 const visible=()=>!document.hidden&&!document.body.classList.contains('exploring')&&!document.querySelector('#modal').open;
 function fit(){const {width,height}=arrival.getBoundingClientRect(),scale=Math.max(width/1536,height/1024);const [px,py]=getComputedStyle(image).objectPosition.split(' ').map(n=>parseFloat(n)/100);stage.style.transform=`translate(${(width-1536*scale)*px}px,${(height-1024*scale)*py}px) scale(${scale})`;panel.classList.toggle('compact-preview',width<700);}
 new ResizeObserver(fit).observe(arrival);image.addEventListener('load',fit);fit();
 function label(){const action=video.paused?'Play trailer':'Pause trailer';play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',action);play.title=action;play.setAttribute('aria-pressed',String(!video.paused));mute.textContent=video.muted?'Sound off':'Sound on';mute.setAttribute('aria-pressed',String(!video.muted));mute.setAttribute('aria-label',video.muted?'Turn trailer sound on':'Mute trailer');}
 function pause(){requested=false;video.pause();label();}
 async function start(){
  requested=true;if(!video.getAttribute('src'))video.src='/serengeti-gallery/assets/detroit-after-dark-web.mp4';if(video.ended)video.currentTime=0;
  if(!video.muted)window.dispatchEvent(new CustomEvent('serengeti-teaser-play'));
  try{await video.play();}catch{status.textContent='Tap Play trailer to try again.';requested=false;label();}
 }
 play.onclick=()=>{if(video.paused){video.muted=false;start();}else pause();};
 mute.onclick=()=>{video.muted=!video.muted;if(!video.muted)window.dispatchEvent(new CustomEvent('serengeti-teaser-play'));label();};
 panel.querySelector('#teaser-enter').onclick=()=>{video.pause();enterCinema();};
 panel.querySelector('#teaser-enter').textContent='Enter ↗';
 panel.querySelector('#teaser-enter').setAttribute('aria-label','Enter cinema');
 label();
 video.addEventListener('loadeddata',()=>stage.classList.add('ready'));
 video.addEventListener('playing',()=>{status.textContent='Original instrumental jazz · Higgsfield';label();});
 video.addEventListener('pause',label);video.addEventListener('ended',()=>{requested=false;status.textContent='Step inside for films, streams & jazz.';label();});
 video.addEventListener('error',()=>{stage.classList.remove('ready');status.textContent='Trailer unavailable. You can still enter the cinema.';pause();});
 const sync=()=>{if(!visible())video.pause();else if(requested&&video.paused)start();};
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});new MutationObserver(sync).observe(document.querySelector('#modal'),{attributes:true,attributeFilter:['open']});document.addEventListener('visibilitychange',sync);
 document.querySelector('#portrait-welcome').addEventListener('play',()=>{video.muted=true;label();});
 window.addEventListener('serengeti-sound',e=>{if(!e.detail){video.muted=true;label();}});
 sync();
 return {pause};
}
