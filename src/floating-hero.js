import {readSaved,writeSaved} from './visitor-settings.js';

export function attachFloatingHero(){
 const hero=document.querySelector('.hero'),app=document.querySelector('#app');
 if(!hero)return;
 const key='serengeti-lobby-card-position',motion=matchMedia('(prefers-reduced-motion: reduce)');
 const bar=document.createElement('div');bar.className='hero-float-bar';
 bar.innerHTML='<button class="hero-move" aria-label="Move homepage card. Drag or use arrow keys. Home resets its position." title="Drag to move · arrow keys to move · Home to reset"><i class="ph-light ph-dots-six" aria-hidden="true"></i><span>Move</span></button><button class="hero-reset" aria-label="Reset homepage card position" hidden><i class="ph-light ph-arrow-counter-clockwise" aria-hidden="true"></i><span>Reset</span></button>';
 hero.prepend(bar);hero.classList.add('hero-movable');
 const handle=bar.querySelector('.hero-move'),resetButton=bar.querySelector('.hero-reset');
 let drag=null,position=null,fade=0,floatWidth=0;
 const scale=()=>app.getBoundingClientRect().width/app.offsetWidth||1;
 function limits(){
  const rect=hero.getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect(),footer=document.querySelector('.bottom').getBoundingClientRect();
  const left=12,top=header.bottom+12;
  return {left,top,right:Math.max(left,innerWidth-rect.width-12),bottom:Math.max(top,Math.min(innerHeight-12,footer.top-12)-rect.height)};
 }
 function place(x,y){
  const b=limits(),s=scale();x=Math.max(b.left,Math.min(b.right,x));y=Math.max(b.top,Math.min(b.bottom,y));
  hero.style.setProperty('--float-left',`${x/s}px`);hero.style.setProperty('--float-top',`${y/s}px`);
  position={x:b.right>b.left?(x-b.left)/(b.right-b.left):0,y:b.bottom>b.top?(y-b.top)/(b.bottom-b.top):0};
 }
 function float(){
  if(hero.classList.contains('hero-floating'))return;
  const rect=hero.getBoundingClientRect(),s=scale();floatWidth=Math.min(rect.width,innerWidth<600?310:rect.width,innerWidth-24)/s;
  hero.style.setProperty('--float-width',`${floatWidth}px`);hero.classList.add('hero-floating');resetButton.hidden=false;place(rect.left,rect.top);
 }
 function glow(dx=0,dy=0){
  clearTimeout(fade);
  if(hero.classList.contains('float-still'))return;
  hero.classList.add('is-moving');hero.style.setProperty('--float-glow','.95');
  if(dx||dy)hero.style.setProperty('--aura-angle',`${Math.atan2(dy,dx)*180/Math.PI}deg`);
 }
 function settle(){
  hero.style.setProperty('--float-glow','0');clearTimeout(fade);fade=setTimeout(()=>hero.classList.remove('is-moving'),700);
 }
 function stop(event,cancel=false){
  if(!drag||event&&event.pointerId!==drag.id)return;
  const prior=drag;drag=null;
  if(hero.hasPointerCapture(prior.id))hero.releasePointerCapture(prior.id);
  hero.classList.remove('is-dragging');settle();
  if(cancel&&prior.moved)place(prior.rect.left,prior.rect.top);
  if(prior.moved)writeSaved(key,position);
 }
 hero.addEventListener('pointerdown',event=>{
  if(event.button!==0||drag||document.body.classList.contains('exploring'))return;
  if(!event.target.closest('.hero-move,h1'))return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,rect:hero.getBoundingClientRect(),moved:false,lastX:event.clientX,lastY:event.clientY};
  hero.setPointerCapture(event.pointerId);event.preventDefault();handle.focus({preventScroll:true});
 });
 hero.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<4)return;
  if(!drag.moved){float();drag.moved=true;hero.classList.add('is-dragging');}
  place(drag.rect.left+dx,drag.rect.top+dy);glow(event.clientX-drag.lastX,event.clientY-drag.lastY);drag.lastX=event.clientX;drag.lastY=event.clientY;
 });
 hero.addEventListener('pointerup',event=>stop(event));hero.addEventListener('pointercancel',event=>stop(event,true));hero.addEventListener('lostpointercapture',event=>stop(event));
 function reset(){
  stop(null);position=null;floatWidth=0;writeSaved(key,null);settle();hero.classList.remove('hero-floating');resetButton.hidden=true;
  for(const property of ['--float-left','--float-top','--float-width'])hero.style.removeProperty(property);
  handle.focus({preventScroll:true});
 }
 resetButton.onclick=reset;
 handle.addEventListener('keydown',event=>{
  if(event.key==='Home'){event.preventDefault();event.stopPropagation();reset();return;}
  if(event.key==='Escape'&&drag){event.preventDefault();stop(null,true);return;}
  const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!delta)return;
  event.preventDefault();event.stopPropagation();float();const rect=hero.getBoundingClientRect(),step=event.shiftKey?50:20;
  place(rect.left+delta[0]*step,rect.top+delta[1]*step);writeSaved(key,position);glow(...delta);fade=setTimeout(settle,180);
 });
 function fit(){
  stop(null,true);if(!position)return;
  const saved={...position},s=scale();hero.style.setProperty('--float-width',`${Math.min(floatWidth*s,innerWidth<600?310:innerWidth-24,innerWidth-24)/s}px`);
  const b=limits();place(b.left+saved.x*(b.right-b.left),b.top+saved.y*(b.bottom-b.top));
 }
 window.addEventListener('resize',fit);new ResizeObserver(()=>{if(position&&!drag){const r=hero.getBoundingClientRect();place(r.left,r.top);}}).observe(hero);
 new MutationObserver(()=>{if(document.body.classList.contains('exploring'))stop(null);else fit();}).observe(document.body,{attributes:true,attributeFilter:['class','data-lobby-layout']});
 function motionChanged(){hero.classList.toggle('float-still',readSaved('serengeti-reduced-motion',motion.matches)===true);if(hero.classList.contains('float-still'))settle();}
 motionChanged();motion.addEventListener('change',motionChanged);window.addEventListener('serengeti-motion',motionChanged);
 const saved=readSaved(key,null);if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&saved.x>=0&&saved.x<=1&&saved.y>=0&&saved.y<=1)requestAnimationFrame(()=>{float();position=saved;fit();});
}
