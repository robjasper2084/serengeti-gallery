import {readSaved,writeSaved} from './visitor-settings.js';

export function defaultWebsiteView({width,height,userAgent='',touchPoints=0}){
 const tablet=/iPad/i.test(userAgent)||(/Macintosh/i.test(userAgent)&&touchPoints>1)||(/Android/i.test(userAgent)&&!/Mobile/i.test(userAgent));
 return tablet||Math.min(width,height)>=600?'desktop':'mobile';
}

export function attachWebsiteView(){
 const key='serengeti-website-view';
 let choice=readSaved(key,null);
 if(!['desktop','mobile'].includes(choice))choice=null;
 const control=document.createElement('label');
 control.className='website-view-control';
 control.innerHTML='<span>Website view</span><select id="website-view" aria-label="Website view"><option value="desktop">Desktop view</option><option value="mobile">Mobile view</option></select>';
 document.querySelector('#menu .caption').after(control);
 const select=control.querySelector('select');
 function apply(){
  const mode=choice||defaultWebsiteView({width:innerWidth,height:innerHeight,userAgent:navigator.userAgent,touchPoints:navigator.maxTouchPoints});
  document.body.dataset.siteView=mode;
  document.body.dataset.lobbyLayout=mode==='desktop'
   ? (innerWidth>1100&&innerWidth>innerHeight&&!navigator.maxTouchPoints?'wide':'desktop')
   : (innerWidth>innerHeight&&innerHeight<600?'mobile-landscape':'mobile');
  const scale=Math.min(1,innerWidth/960);
  document.body.style.setProperty('--desktop-view-scale',scale);
  document.body.style.setProperty('--desktop-view-height',`${innerHeight/scale}px`);
  select.value=mode;
 }
 select.addEventListener('change',()=>{choice=select.value;writeSaved(key,choice);apply();});
 window.addEventListener('resize',apply);
 apply();
}
