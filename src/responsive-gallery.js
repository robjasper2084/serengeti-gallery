// Reuse the real gallery controls; desktop keeps its original composition.
export function attachResponsiveGallery() {
 const app=document.querySelector('#app');
 const arrival=document.createElement('section');arrival.id='responsive-arrival';arrival.setAttribute('aria-label','Gallery arrival');arrival.tabIndex=0;
 app.append(arrival);
 for(const selector of ['#arrival','.hero','#arrival-quick','#portrait-controls','#welcome-caption','#cinema-teaser-stage','#cinema-teaser-controls']){
  const element=document.querySelector(selector);if(element)arrival.append(element);
 }
 const trailer=document.querySelector('#cinema-teaser');
 trailer.poster=document.querySelector('#atrium-image').src;
 const cinemaEnter=document.querySelector('#teaser-enter');
 cinemaEnter.innerHTML='<span class="compact-label">Enter ↗</span><span class="touch-label">Enter cinema ↗</span>';

 const vr=document.createElement('button');vr.id='touch-vr';vr.textContent='Headset VR';
 vr.onclick=()=>document.querySelector('#vr').click();document.querySelector('#settings-nav').before(vr);
 const more=document.createElement('button');more.id='visit-more';more.className='room';more.textContent='More';
 more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','play-piano play-chess');
 more.onclick=()=>{const open=document.body.classList.toggle('visit-tools-open');more.setAttribute('aria-expanded',String(open));};
 document.querySelector('#camera-control').after(more);

 const panel=document.querySelector('#cinema');
 const screenings=document.createElement('button');screenings.id='cinema-controls-toggle';screenings.className='room';screenings.textContent='Screening controls';
 screenings.setAttribute('aria-controls','cinema');screenings.setAttribute('aria-expanded','false');
 screenings.onclick=()=>{const open=panel.classList.toggle('touch-panel-open');document.body.classList.toggle('cinema-controls-open',open);screenings.setAttribute('aria-expanded',String(open));screenings.textContent=open?'Close screening controls':'Screening controls';};
 app.append(screenings);
 window.addEventListener('serengeti-room',()=>{
  panel.classList.remove('touch-panel-open');document.body.classList.remove('cinema-controls-open','visit-tools-open');
  screenings.setAttribute('aria-expanded','false');screenings.textContent='Screening controls';more.setAttribute('aria-expanded','false');
 });

 // VisualViewport also follows the on-screen keyboard in iOS Safari.
 const viewport=()=>{
  const height=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);
  document.documentElement.style.setProperty('--gallery-usable-height',`${Math.round(height)}px`);
 };
 viewport();window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);
}
