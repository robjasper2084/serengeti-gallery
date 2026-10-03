import {createArrivalBubbleTimers} from './arrival-bubbles.js';
import {readSaved} from './visitor-settings.js';

export function attachArrivalInteractions({enterGallery}){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const entrance=document.createElement('button');entrance.id='arrival-enter';entrance.className='scene-hotspot entrance-hotspot';entrance.setAttribute('aria-label','Walk into the gallery');entrance.innerHTML='<span>Enter gallery ↗</span>';entrance.onclick=enterGallery;arrival.append(entrance);
 const portrait=document.querySelector('#portrait-info'),cinema=document.querySelector('#watch');
 portrait.querySelector('span').textContent='Meet the portrait ↗';
 cinema.querySelector('span').textContent='Enter cinema ↗';
 // Anchor hit areas to the actual cover-cropped photograph at every screen size.
 const areas=[[portrait,[160,145,315,500]],[entrance,[510,330,370,330]],[cinema,[1110,280,335,405]]];
 const hero=document.querySelector('.hero'),portraitLabel=portrait.querySelector('span');
 function fit(){const w=arrival.clientWidth,h=arrival.clientHeight,s=Math.max(w/1536,h/1024);const [px,py]=getComputedStyle(image).objectPosition.split(' ').map(v=>parseFloat(v)/100);const ox=(w-1536*s)*px,oy=(h-1024*s)*py;for(const [button,[x,y,width,height]]of areas){Object.assign(button.style,{left:`${ox+x*s}px`,top:`${oy+y*s}px`,width:`${width*s}px`,height:`${height*s}px`,right:'auto'});}
  // Keep the portrait action above the intro card on shorter desktop screens.
  portraitLabel.style.bottom='12px';
  if(hero&&getComputedStyle(portrait).display!=='none'){
   const card=hero.getBoundingClientRect(),label=portraitLabel.getBoundingClientRect(),frame=portrait.getBoundingClientRect();
   if(label.left<card.right&&label.right>card.left&&label.bottom>card.top-12&&label.top<card.bottom){
    portraitLabel.style.bottom=`${Math.min(frame.height-label.height,Math.max(12,frame.bottom-card.top+12))}px`;
   }
  }
 }
 const observer=new ResizeObserver(fit);observer.observe(arrival);if(hero)observer.observe(hero);image.addEventListener('load',fit);fit();
 const quick=document.createElement('nav');quick.id='arrival-quick';quick.setAttribute('aria-label','Explore the scene');
 const bubbles=[];
 for(const [text,target,delay]of [['Portrait',portrait,15000],['Enter gallery',entrance,0],['Cinema',cinema,16000]]){
  const b=document.createElement('button');b.textContent=text;b.onclick=()=>target.click();quick.append(b);
  if(delay){target.classList.add('delayed-bubble');b.classList.add('delayed-bubble');bubbles.push({delay,reveal:()=>{target.classList.add('bubble-ready');b.classList.add('bubble-ready');}});}
 }
 arrival.append(quick);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const updateMotion=()=>{const still=readSaved('serengeti-reduced-motion',motion.matches)===true;for(const target of [portrait,cinema,...quick.querySelectorAll('.delayed-bubble')])target.classList.toggle('bubble-still',still);};
 updateMotion();motion.addEventListener('change',updateMotion);window.addEventListener('serengeti-motion',updateMotion);
 const modal=document.querySelector('#modal'),loading=document.querySelector('#loading');
 const timers=createArrivalBubbleTimers(bubbles,{isVisible:()=>!document.hidden&&!document.body.classList.contains('exploring')&&!modal?.open&&(!loading||loading.classList.contains('hidden'))});
 document.addEventListener('visibilitychange',timers.sync);
 const visibilityObserver=new MutationObserver(timers.sync);
 visibilityObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 if(modal)visibilityObserver.observe(modal,{attributes:true,attributeFilter:['open']});
 if(loading)visibilityObserver.observe(loading,{attributes:true,attributeFilter:['class']});
}
