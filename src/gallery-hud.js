// Keep the Unity controls and their handlers; group them into an easy play HUD.
export function attachGalleryHUD({modal,pause,resume,onHelp}){
 const $=selector=>document.querySelector(selector);
 $('#explore-nav').textContent='Lobby';$('#explore-nav').setAttribute('aria-label','Back to lobby');$('#home').setAttribute('aria-label','Back to the gallery lobby');
 $('#walk-now').innerHTML='Start exploring <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i>';
 $('#camera-control').innerHTML='<i class="ph-light ph-camera" aria-hidden="true"></i><span>View</span>';
 $('#camera-control').setAttribute('aria-label','Change camera view');
 $('#run-control').setAttribute('aria-label','Run or walk');$('#jump-control').setAttribute('aria-label','Jump');
 const more=$('#visit-more');more.innerHTML='<i class="ph-light ph-squares-four" aria-hidden="true"></i><span>Activities</span>';
 more.setAttribute('aria-controls','gallery-activities');
 const progress=$('#progress'),discovered=$('#visited');
 progress.replaceChildren();const roomName=document.createElement('strong');roomName.id='hud-room';roomName.textContent='Welcome!';
 progress.append(roomName,discovered);
 $('#hint').innerHTML='<span>Move with the stick / WASD</span><span>Drag the room to look 360°</span>';
 $('.visit-actions').setAttribute('role','group');$('.visit-actions').setAttribute('aria-label','Play controls');
 $('.rooms').setAttribute('role','navigation');$('.rooms').setAttribute('aria-label','Choose a place');
 const panel=document.createElement('aside');panel.id='gallery-activities';panel.hidden=true;
 panel.setAttribute('aria-label','Gallery activities');
 panel.innerHTML='<div class="activities-heading"><div><small>CHOOSE SOMETHING FUN</small><h2>Let’s explore</h2></div><button id="activities-close" aria-label="Close activities">✕</button></div><div class="activities-grid"></div>';
 const grid=panel.querySelector('.activities-grid');
 for(const [id,icon,label]of [['teleport-control','map-trifold','Choose a place'],['play-piano','piano-keys','Play piano'],['play-chess','crown','Play chess']]){
  const button=$('#'+id);button.innerHTML=`<i class="ph-light ph-${icon}" aria-hidden="true"></i><span>${label}</span>`;grid.append(button);
 }
 const help=document.createElement('button');help.id='gallery-help';help.innerHTML='<i class="ph-light ph-question" aria-hidden="true"></i><span>How to play</span>';grid.append(help);
 const back=document.createElement('button');back.id='gallery-back';back.innerHTML='<i class="ph-light ph-house" aria-hidden="true"></i><span>Back to lobby</span>';grid.append(back);
 document.body.append(panel);
 function close(focus=false){panel.hidden=true;if(document.body.classList.contains('activities-open'))document.body.classList.remove('activities-open');more.setAttribute('aria-expanded','false');if(focus){more.focus();resume();}}
 more.onclick=()=>{
  const opening=panel.hidden;
  if(opening){panel.hidden=false;document.body.classList.add('activities-open');more.setAttribute('aria-expanded','true');pause();panel.querySelector('#activities-close').focus();}
  else close(true);
 };
 panel.querySelector('#activities-close').onclick=()=>close(true);
 grid.addEventListener('click',event=>{if(event.target.closest('button'))close();},true);
 help.onclick=()=>modal(`<div class="list-panel play-help"><div class="caption">YOU’RE IN CONTROL</div><h2>Let’s play!</h2><div class="help-steps"><div><b>1</b><span><strong>Move</strong>Drag the round stick. On a keyboard, use W A S D or the arrow keys.</span></div><div><b>2</b><span><strong>Look around</strong>Drag the room. Press View to switch cameras.</span></div><div><b>3</b><span><strong>Try something</strong>Tap a picture to learn about it. Open Activities to play piano or chess.</span></div></div><p>Run goes faster. Jump makes a little hop. Tap a place at the top to travel there. Press Lobby to come back.</p><button class="primary" id="help-ready">Got it — let’s go!</button></div>`);
 if(onHelp)help.onclick=onHelp;
 else help.addEventListener('click',()=>{document.querySelector('#help-ready').onclick=()=>document.querySelector('#modal .close').click();});
 back.onclick=()=>$('#home').click();
 // Direct shortcuts stay on the play HUD; the Activities drawer keeps its options.
 for(const [id,target,icon,label]of [['hud-play-chess','play-chess','crown','Play chess'],['hud-play-piano','play-piano','piano-keys','Jazz piano']]){
  const button=document.createElement('button');button.id=id;button.className='room activity-shortcut';
  button.setAttribute('aria-label',label);
  button.innerHTML=`<i class="ph-light ph-${icon}" aria-hidden="true"></i><span>${label}</span>`;
  button.onclick=()=>{close();$('#'+target).click();};$('.visit-actions').append(button);
 }
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true);}});
 window.addEventListener('serengeti-room',event=>{roomName.textContent=['Atrium','Art gallery','Cinema','Life & Light'][event.detail]||'Welcome!';document.querySelectorAll('.rooms [data-room]').forEach(button=>button.setAttribute('aria-current',Number(button.dataset.room)===event.detail?'location':'false'));close();});
 new MutationObserver(()=>{if(!document.body.classList.contains('exploring'))close();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 $('#menu-nav').addEventListener('click',()=>close());
}
