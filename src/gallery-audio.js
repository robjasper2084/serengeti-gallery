import {GalleryAudioState} from './gallery-audio-state.js';

export function attachGalleryAudio(){
 const state=new GalleryAudioState();
 const tracks={'portrait-welcome':'portrait','cinema-teaser':'trailer','home-film':'film','club-movie':'cinema'};
 const names={portrait:'Portrait welcome',trailer:'Cinema trailer',film:'Film',cinema:'Cinema',piano:'Jazz piano',ambience:'Gallery jazz'};
 const button=document.querySelector('#sound');
 button.setAttribute('data-gallery-sound','');
 button.innerHTML='<i class="ph-light ph-speaker-slash" aria-hidden="true"></i><span class="sound-copy"><strong>Enable sound</strong><small>Sound is muted</small></span>';
 let context=null,timer=null,beat=0;
 function stopJazz(){clearInterval(timer);timer=null;context?.suspend().catch(()=>{});}
 function startJazz(){
  if(timer||!state.allows('ambience'))return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  context??=new Audio();context.resume().catch(()=>{});
  const chords=[[146.83,174.61,220,261.63],[130.81,164.81,196,246.94],[110,146.83,174.61,220],[123.47,155.56,196,233.08]];
  const phrase=()=>chords[beat++%chords.length].forEach((frequency,i)=>{const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+i*.09;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.025,at+.04);gain.gain.exponentialRampToValueAtTime(.001,at+2.7);oscillator.connect(gain).connect(context.destination);oscillator.start(at);oscillator.stop(at+2.8);});
  phrase();timer=setInterval(phrase,2400);
 }
 function chooseSource(){
  if(document.body.classList.contains('piano-active'))return 'piano';
  if(document.body.classList.contains('cinema-active'))return 'cinema';
  for(const id of ['home-film','cinema-teaser']){const media=document.getElementById(id);if(media&&!media.paused&&!media.ended)return tracks[id];}
  return 'ambience';
 }
 function sync(){
  if(!state.source&&state.enabled)state.claim(chooseSource());
  button.dataset.enabled=String(state.enabled);button.dataset.source=state.source||'';
  for(const [id,source]of Object.entries(tracks)){const media=document.getElementById(id);if(media)media.muted=!state.allows(source);}
  if(state.allows('ambience'))startJazz();else stopJazz();
  for(const control of document.querySelectorAll('[data-gallery-sound]')){
   const label=state.enabled?'Mute sound':'Enable sound';
   control.setAttribute('aria-label',label);control.setAttribute('aria-pressed',String(state.enabled));
   const title=control.querySelector('strong');if(title)title.textContent=label;else control.textContent=label;
   const icon=control.querySelector('i');if(icon)icon.className=`ph-light ${state.enabled?'ph-speaker-high':'ph-speaker-slash'}`;
   const detail=control.querySelector('small');if(detail)detail.textContent=!state.enabled?'Sound is muted':state.suspended?'Paused while away':names[state.source]||'Sound enabled';
  }
  // Unity's cinema and piano adapters receive the same preference and source.
  window.dispatchEvent(new CustomEvent('serengeti-sound',{detail:state.enabled&&!state.suspended}));
 }
 function request(enabled,source){state.setEnabled(enabled);if(source)state.claim(source);sync();}
 document.addEventListener('click',event=>{if(event.target.closest('[data-gallery-sound]'))request(!state.enabled,state.source||chooseSource());});
 window.addEventListener('serengeti-audio-request',event=>{const detail=event.detail;request(typeof detail==='object'?detail.enabled:detail,typeof detail==='object'?detail.source:null);});
 window.addEventListener('serengeti-portrait-play',()=>{state.claim('portrait');sync();});
 window.addEventListener('serengeti-teaser-play',()=>{state.claim('trailer');sync();});
 document.addEventListener('play',event=>{const source=tracks[event.target.id];if(!source)return;if(source==='film'||source==='cinema'||!event.target.muted)state.claim(source);sync();},true);
 document.addEventListener('volumechange',event=>{const source=tracks[event.target.id];if(!source)return;if(!event.target.muted&&!state.allows(source))request(true,source);},true);
 for(const event of ['pause','ended'])document.addEventListener(event,event=>{const source=tracks[event.target.id];if(source){state.release(source);sync();}},true);
 window.addEventListener('serengeti-room',event=>{state.claim(event.detail===2?'cinema':chooseSource());sync();});
 window.addEventListener('serengeti-piano',event=>{if(event.detail==='focus'){state.claim('piano');sync();}if(event.detail==='leave'){state.release('piano');sync();}});
 document.addEventListener('visibilitychange',()=>{state.suspended=document.hidden;sync();});
 // Newly opened lightweight film and piano panels reuse the same mute setting.
 new MutationObserver(sync).observe(document.querySelector('#modal-content'),{childList:true});
 sync();return {sync};
}
