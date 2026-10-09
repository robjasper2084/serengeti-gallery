import {createCinemaTeaser} from './cinema-teaser.js';
import {createPassport} from './passport.js';
import {createCloudPassport} from './cloud-passport.js';
import {attachHTMLCinema} from './html-cinema.js';
import {createJazzLegacy} from './jazz-legacy.js';
import {appendArtworkCode} from './artwork-codes.js';
import {linkedArtworkIndex} from './artwork-links.js';
import {readSaved,writeSaved,restoreDiscoveries} from './visitor-settings.js';
import {checkHeadset,selectVRFilm} from './vr-entry.js';
import '@phosphor-icons/web/light';
import './style.css';
import './mobile.css';
import './gallery-hud.css';
import './chess.css';
import './together.css';
import './first-visit.css';
import './arrival-bubbles.css';
import './visit-polish.css';
import './lobby-layout.css';
import {attachLazyChess} from './lazy-chess.js';
import {attachGalleryAudio} from './gallery-audio.js';
import {attachTogether} from './together.js';
import {attachFirstVisit} from './first-visit.js';
import {attachGalleryHUD} from './gallery-hud.js';
import {attachResponsiveGallery} from './responsive-gallery.js';
import {attachArrivalInteractions} from './arrival-interactions.js';
import {createPortraitWelcome} from './portrait-welcome.js';
import museumWorks from './museum-collection.json';
import submittedWorks from './gallery-submissions.json';
import lifeAndLightWorks from './life-and-light.json';
import {attachLifeAndLight,exhibitionBanner} from './life-and-light.js';
const $=s=>document.querySelector(s);
$('#app').innerHTML=`<canvas id="world" aria-label="Interactive Serengeti Gallery. Use W A S D or arrow keys to walk, drag to look, or choose the movement controls."></canvas><div id="shade"></div>
<div id="arrival"><img id="atrium-image" src="/serengeti-gallery/assets/atrium-cinematic.webp" width="1536" height="1024" fetchpriority="high" decoding="async" alt="A monumental portrait, a lush tree, and a warmly lit cinema inside Serengeti Gallery’s Detroit atrium."><div id="portrait-stage" aria-hidden="true"><video id="portrait-welcome" muted playsinline preload="none"></video></div><button class="scene-hotspot portrait-hotspot" id="portrait-info" aria-label="Discover the living portrait"><span>Discover the portrait</span></button><button class="scene-hotspot cinema-hotspot" id="watch" aria-label="Visit the cinema"><span>Enter the cinema</span></button></div>
<header><button class="brand" id="home" aria-label="Serengeti Gallery home"><strong>SERENGETI GALLERY</strong><small>DETROIT</small></button><nav aria-label="Main navigation"><button id="explore-nav" class="active">Gallery</button><button id="cinema-nav">Cinema</button><button id="collection-nav">Collection</button></nav><div class="header-tools"><button id="vr" class="outline">Enter VR <i class="ph-light ph-goggles" aria-hidden="true"></i></button><button class="icon-button" id="search-nav" aria-label="Search the collection"><i class="ph-light ph-magnifying-glass" aria-hidden="true"></i></button><button class="icon-button" id="menu-nav" aria-label="Open menu" aria-expanded="false"><i class="ph-light ph-list" aria-hidden="true"></i></button></div></header>
<main class="hero"><h1>The Living Portrait</h1><p class="arrival-description">Explore art, watch films, and meet friends. Make yourself at home.</p><button id="portrait-next" class="round-button" aria-label="Read the portrait story"><i class="ph-light ph-caret-right" aria-hidden="true"></i></button><button class="primary" id="discover-story">Enter gallery</button></main>
<div id="progress">THE LIVING PORTRAIT &nbsp; <span id="visited">0 / 54 works discovered</span></div><div id="hint">Drag joystick to move · Swipe the room to look · WASD / Shift / Space on keyboard</div><div id="mobile-nav" role="group" aria-label="Walk and look controls"><button id="turn-left" aria-label="Look left"><i class="ph-light ph-arrow-counter-clockwise" aria-hidden="true"></i></button><button id="forward" aria-label="Move forward"><i class="ph-light ph-arrow-up" aria-hidden="true"></i></button><button id="backward" aria-label="Move backward"><i class="ph-light ph-arrow-down" aria-hidden="true"></i></button><button id="turn-right" aria-label="Look right"><i class="ph-light ph-arrow-clockwise" aria-hidden="true"></i></button></div>
<div class="visit-actions"><button id="walk-now" class="primary">Walk with the curator <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i></button><button id="run-control" class="room" aria-pressed="false">Run</button><button id="jump-control" class="room">Jump</button><button id="teleport-control" class="room">Teleport</button><button id="play-piano" class="room">Jazz piano</button><button id="play-chess" class="room">Play chess</button><button id="camera-control" class="room" aria-label="Switch character or first-person view"><i class="ph-light ph-person-simple-walk" aria-hidden="true"></i><span>Camera view</span></button></div><div class="rooms"><button class="room selected" data-room="0"><span>01</span>Atrium</button><button class="room" data-room="1"><span>02</span>Collection</button><button class="room" data-room="2"><span>03</span>Cinema</button><button class="room" data-room="3"><span>04</span>Life &amp; Light</button></div>
<button id="welcome-control" class="welcome-control" aria-label="Pause the portrait welcome" aria-pressed="true"><i class="ph-light ph-pause" aria-hidden="true"></i><span>Pause welcome</span></button><div class="bottom"><button id="map-nav"><i class="ph-light ph-map-trifold" aria-hidden="true"></i><span>Map</span></button><button class="sound" id="sound"><i class="ph-light ph-speaker-high" aria-hidden="true"></i><span>Sound Off</span></button></div>
<aside id="menu" class="menu-panel hidden" aria-label="Gallery menu"><div class="caption">YOUR VISIT</div><button id="enter">Explore in 3D <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i></button><button id="view-nav">Change camera view <i class="ph-light ph-person-simple-walk" aria-hidden="true"></i></button><button id="story-nav">Our story <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i></button><button id="account-nav">Sign in</button><button id="signup-nav">Create an account</button><button id="settings-nav">Display & accessibility</button><button id="cart-nav">Collection bag <span id="cart-count">0</span></button><p>Art. Music. People. Ideas.<br>Detroit. Forever.</p></aside>
<div id="cinema-screen"><div id="screen-surface"></div></div>
<aside class="theater-controls hidden" id="cinema" aria-label="Jazz club screenings"><div class="caption">SERENGETI / AFTER DARK</div><h2 id="screening-title">Jazz-Off Detroit</h2><p class="muted" id="film-state" role="status">Preparing the screen…</p><div class="screening-actions"><button id="play-film" aria-label="Play screening"><i class="ph-light ph-play" aria-hidden="true"></i></button><button id="pause-film" aria-label="Pause screening"><i class="ph-light ph-pause" aria-hidden="true"></i></button><button id="restart-film" aria-label="Restart screening"><i class="ph-light ph-arrow-counter-clockwise" aria-hidden="true"></i></button></div><details><summary>Screenings & streams</summary><button id="watch-jazz">Jazz-Off Detroit ↗</button><button id="watch-trailer">Detroit After Dark · Trailer ↗</button><button id="watch-gallery-film">Gallery film ↗</button><form id="screening-form"><label for="screening-url">Movie or stream link</label><input id="screening-url" type="url" required placeholder="https://…"><button type="submit">Watch on the screen</button></form><p class="muted">YouTube videos and live links, MP4 movies, or HLS streams.</p><a id="screening-link" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=4euNaGauB5k">Open on YouTube ↗</a></details></aside>
<dialog id="modal" aria-label="Gallery details"><button class="close icon-button" aria-label="Close dialog"><i class="ph-light ph-x" aria-hidden="true"></i></button><div id="modal-content"></div></dialog><div class="toast hidden" role="status" id="toast"></div><div class="loading hidden" id="loading">Serengeti Gallery<small>PREPARING YOUR ARRIVAL</small></div>`;

const portraitWelcome=createPortraitWelcome();
const artworks=[
 {id:'archive',title:'The Living Portrait',subtitle:'Featured portrait · Bill Foster reference',image:'/serengeti-gallery/assets/bill-foster.png',physical:450,digital:45,description:'A journey through time, culture and creativity. An encounter with presence, memory, and the stories we carry. This portrait anchors the gallery; its illuminated halo grows as you discover the 3D space.',note:'Supplied reference image. Exhibition title and prices are prototype proposals; authorship and sale rights await gallery confirmation.'},
 {id:'rhythm',title:'Motor City / Golden Hour',subtitle:'Generative study · Serengeti Studio',image:'/serengeti-gallery/assets/rhythm.svg',physical:280,digital:28,description:'Industrial repetition becomes a landscape of warmth. A study in Detroit rhythm, weathered copper, and the late light of the savanna.',note:'Original procedural concept artwork created for this prototype. Proposed editions and prices.'},
 {id:'grass',title:'Where the Wild Returns',subtitle:'Generative study · Serengeti Studio',image:'/serengeti-gallery/assets/grass.svg',physical:320,digital:32,description:'Organic forms move through architectural silence. Ochre, ink, and olive trace a meeting between the built world and the living one.',note:'Original procedural concept artwork created for this prototype. Proposed editions and prices.'}
];
artworks.push(...museumWorks);
for(const work of submittedWorks)artworks[work.slot]=work;
// No reference or prototype study is offered for sale before owner approval.
for(const work of artworks){work.displayOnly=true;}
artworks.push(...lifeAndLightWorks);
artworks[0].subtitle='Supplied portrait · exhibition reference';
artworks[0].note='Supplied reference for this prototype. No sale or biography is implied.';
const passportStorage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
let passport=createPassport(passportStorage,artworks.map(a=>a.id)),cloudPassport=null,accountId=null;
async function accountChanged(user,client){
 if(accountId===(user?.id??null))return;
 const guest=accountId===null?passport.snapshot():null;accountId=user?.id??null;
 passport=createPassport(passportStorage,artworks.map(a=>a.id),accountId?`serengeti-passport-v1-${accountId}`:'serengeti-passport-v1');cloudPassport=accountId?createCloudPassport(client,accountId):null;
 if(!cloudPassport)return;const service=cloudPassport;
 try{const [remote,progress]=await Promise.all([service.list(),service.listProgress()]);if(service!==cloudPassport)return;passport.merge(remote);for(const p of progress){if(p.kind==='room')passport.visit(p.item_id);if(p.kind==='chapter')passport.chapter(p.item_id);}for(const id of guest?.saved||[])await service.save(id);if(service!==cloudPassport)return;passport.merge(guest?.saved||[]);for(const r of guest?.rooms||[]){passport.visit(r);await service.progress('room',r);}for(const c of guest?.chapters||[]){passport.chapter(c);await service.progress('chapter',c);}try{localStorage.removeItem('serengeti-passport-v1');}catch{}toast('Your saved artworks are connected to your account.');}catch{toast('Cloud saves are unavailable. Your bookmarks remain on this browser.');}
}
const catalogWorks=artworks.map((a,i)=>({a,i})).sort((a,b)=>Number(b.a.slot!==undefined)-Number(a.a.slot!==undefined));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bag=[];try{const saved=JSON.parse(localStorage.getItem('serengeti-bag')||'[]');bag=Array.isArray(saved)?saved.filter(x=>artworks.some(a=>a.id===x.id&&!a.displayOnly)&&['physical','digital'].includes(x.format)).slice(0,12):[];}catch{}
const encounters=new Set(restoreDiscoveries(readSaved("serengeti-discoveries",[]),artworks.length));$("#visited").textContent=`${encounters.size} / ${artworks.length} works discovered`;let returnFocus=null;
function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.add('hidden'),4500);}
function updateBag(){try{localStorage.setItem('serengeti-bag',JSON.stringify(bag));}catch{/* Browsers may block storage; the current bag still works. */}$('#cart-count').textContent=bag.length;}updateBag();
function modal(html){returnFocus=document.activeElement;$('#modal-content').innerHTML=html;world.stop();$('#menu').classList.add('hidden');$('#menu-nav').setAttribute('aria-expanded','false');if(!$('#modal').open)$('#modal').showModal();}
function close(){$('#home-film')?.pause();$('#modal').close();if(returnFocus?.isConnected&&!returnFocus.closest('[hidden],.hidden'))returnFocus.focus();else if(document.body.classList.contains('exploring'))$('#world').focus();runtime?.resume();}
$('.close').onclick=close;$('#modal').addEventListener('close',()=>{$('#home-film')?.pause();runtime?.resume();});$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))close();});
function showArt(i){const a=artworks[i];encounters.add(i);writeSaved("serengeti-discoveries",[...encounters]);$('#visited').textContent=`${encounters.size} / ${artworks.length} works discovered`;
 modal(`<div class="modal-grid"><img class="modal-art" src="${a.image}" alt="${escape(a.title)}"><div class="modal-copy"><div class="caption">THE COLLECTION / ${String(i+1).padStart(2,'0')}</div><h2>${escape(a.title)}</h2><div class="caption">${escape(a.subtitle)}</div><p>${escape(a.description)}</p>${a.displayOnly?(a.source?`<a href="${escape(a.source)}" target="_blank" rel="noopener">View museum record ↗</a>`:`<div class="caption">ON VIEW AT SERENGETI</div>`):`<label for="format" class="caption">CHOOSE YOUR EDITION</label><select id="format"><option value="physical">Physical print — $${a.physical}</option><option value="digital">Digital edition — $${a.digital}</option></select><button class="primary" id="add">Add to collection bag +</button>`}<p class="muted">${escape(a.note)}</p><button id="walk-gallery" class="outline-small">Walk through the gallery ↗</button></div></div>`);
 $('#walk-gallery').onclick=()=>{close();world.go(a.group?3:i<3?0:1);};
 appendArtworkCode(a);
 if(a.group){
  const back=document.createElement('button');back.className='outline-small';back.textContent='← Detroit, Life & Light';back.onclick=()=>exhibition.open();$('#walk-gallery').after(back);
  if(a.featured){const print=document.createElement('button');print.className='outline-small';print.textContent='Preview print sizes & prices';print.onclick=()=>exhibition.print(a.id);back.after(print);}
 }
 if(Number.isFinite(a.physical)&&Number.isFinite(a.digital)){
  const pricing=document.createElement('section');pricing.className='artwork-pricing';pricing.setAttribute('aria-label','Edition prices');
  pricing.innerHTML=`<div class="caption">EDITION PRICES</div><div><span>Physical print</span><strong>$${a.physical}</strong></div><div><span>Digital edition</span><strong>$${a.digital}</strong></div><small>Preview prices · checkout coming soon</small>`;
  document.querySelector('.modal-copy > p').after(pricing);
 }
 const save=document.createElement('button');save.className='outline-small';save.id='save-art';save.textContent=passport.has(a.id)?'Saved artwork ♥':'Save artwork ♡';save.setAttribute('aria-pressed',String(passport.has(a.id)));$('#walk-gallery').before(save);save.onclick=async()=>{const result=passport.toggle(a.id);save.textContent=result.saved?'Saved artwork ♥':'Save artwork ♡';save.setAttribute('aria-pressed',String(result.saved));toast(result.persisted?(result.saved?'Saved to your passport.':'Removed from saved artworks.'):'Saved for this visit. Browser storage is unavailable.');if(cloudPassport)try{await(result.saved?cloudPassport.save(a.id):cloudPassport.remove(a.id));}catch{toast('Saved locally; cloud sync could not finish.');}};
 if($('#add'))$('#add').onclick=()=>{const format=$('#format').value;if(bag.some(x=>x.id===a.id&&x.format===format)){toast('This edition is already in your bag.');return;}bag.push({id:a.id,format});updateBag();$('#add').textContent='Added to collection';toast('Added to your collection bag');};
}
function cards(list){return list.map(({a,i})=>`<button data-art="${i}"><img loading="lazy" src="${a.image}" alt="${escape(a.title)}"><h3>${escape(a.title)}</h3>${Number.isFinite(a.digital)?`<p class="artwork-card-price">Digital $${a.digital} · Print $${a.physical}</p>`:''}<small>${a.displayOnly?'Explore artwork':'Discover editions'} ↗</small></button>`).join('');}
function wireCards(){document.querySelectorAll('[data-art]').forEach(b=>b.onclick=()=>showArt(Number(b.dataset.art)));}
function collection(search=false){modal(`<div class="list-panel"><div class="caption">${artworks.length} WORKS · A WORLD OF PERSPECTIVES</div><h2 class="panel-title">The collection</h2>${exhibitionBanner()}${search?'<label class="search-field"><i class="ph-light ph-magnifying-glass" aria-hidden="true"></i><input id="collection-search" placeholder="Search by title or artist" aria-label="Search artworks"></label>':''}<p class="search-count" id="search-count">${artworks.length} works on view · Detroit, Life & Light now open</p><div class="catalog" id="catalog">${cards(catalogWorks)}</div></div>`);wireCards();exhibition.wire();if(search){$('#collection-search').focus();$('#collection-search').oninput=e=>{const q=e.target.value.toLowerCase();const list=catalogWorks.filter(({a})=>(a.title+' '+a.subtitle).toLowerCase().includes(q));$('#catalog').innerHTML=cards(list);$('#search-count').textContent=`${list.length} ${list.length===1?"work":"works"} found`;wireCards();};}}
function map(){modal(`<div class="list-panel"><div class="caption">FIND YOUR WAY</div><h2 class="panel-title">Explore Serengeti</h2><p>Drag the joystick to walk and swipe the room to look on your phone or tablet. Use WASD on a keyboard. Run with Shift, jump with Space, or use the Run and Jump buttons. Choose a destination below to teleport.</p><div class="map-destinations">${[['Atrium','The living portrait, chess table & gathering space','tree'],['Exhibition halls','The established collection · 33 works','image'],['Cinema','Jazz-club screenings, films & streams','film-strip'],['Life & Light','21 supplied works · photography & abstract art','sun']].map(([name,desc,icon],i)=>`<button data-destination="${i}"><i class="ph-light ph-${icon}" aria-hidden="true"></i><span><strong>${name}</strong><small>${desc}</small></span></button>`).join('')}</div></div>`);document.querySelectorAll('[data-destination]').forEach(b=>b.onclick=()=>{close();world.go(Number(b.dataset.destination));});}
function showPassport(){const p=passport.snapshot();modal(`<div class="list-panel"><div class="caption">YOUR GALLERY PASSPORT</div><h2>Keep what moves you</h2><p>${encounters.size} artworks discovered · ${p.saved.length} saved · ${p.rooms.length} of 3 rooms visited</p><p class="muted">Saved artworks are bookmarks, not purchases. ${accountId?'Account saves sync when connected; unsynced changes stay on this browser.':'Guest progress stays on this browser.'}</p><div class="passport-rooms">${['atrium','collection','cinema'].map(r=>`<span>${p.rooms.includes(r)?'✓':'○'} ${r}</span>`).join('')}</div><h3>Saved artworks</h3>${p.saved.length?`<div class="catalog">${cards(catalogWorks.filter(({a})=>p.saved.includes(a.id)))}</div>`:'<p>Open any artwork and choose Save artwork to begin.</p>'}<button class="primary" id="passport-browse">Browse art</button></div>`);wireCards();$('#passport-browse').onclick=()=>collection();}
function guidedTour(){modal('<div class="list-panel"><div class="caption">AN OPTIONAL FIRST VISIT</div><h2>Find your own rhythm</h2><p>Start with the portrait, save a work that catches your eye, then settle into a cinema chair. Every stop is optional.</p><div class="map-destinations"><button id="tour-portrait">01 · Discover the Living Portrait</button><button id="tour-collection">02 · Browse and save artworks</button><button id="tour-cinema">03 · Enter the jazz cinema</button></div><p class="muted">No timer, account or purchase is required.</p></div>');$('#tour-portrait').onclick=()=>showArt(0);$('#tour-collection').onclick=()=>collection();$('#tour-cinema').onclick=()=>{close();world.go(2);};}
function story(){jazzLegacy.open('history');}
function cart(){modal(`<div class="list-panel"><div class="caption">YOUR PRIVATE COLLECTION</div><h2 class="panel-title">Collection bag</h2>${bag.length?bag.map((x,i)=>{const a=artworks.find(a=>a.id===x.id);return `<div class="cart-item"><span>${escape(a.title)}<br><small>${x.format} · $${a[x.format]}</small></span><button data-remove="${i}">Remove</button></div>`;}).join(''):'<p>Your collection begins with an encounter. Explore the works and choose an edition.</p>'}<div class="spec"><span>Total</span><span>$${bag.reduce((s,x)=>s+artworks.find(a=>a.id===x.id)[x.format],0)}</span></div><button class="primary" id="checkout" ${bag.length?'':'disabled'}>Continue to checkout ↗</button><p class="muted" id="checkout-status">Preview catalog. Checkout requires approved editions and secure payment credentials.</p></div>`);document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{bag.splice(Number(b.dataset.remove),1);updateBag();cart();});$('#checkout').onclick=async()=>{const b=$('#checkout');b.disabled=true;if(import.meta.env.VITE_STATIC_HOST==='true'){$('#checkout-status').textContent='Online checkout is not available yet. No payment has been taken.';return;}try{const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:bag})});const d=await r.json();if(!r.ok)throw Error(d.error||'Checkout unavailable');location.assign(d.url);}catch(e){$('#checkout-status').textContent=e.message;b.disabled=false;}};}
let runtime=null, runtimePromise=null,visitIntent=0;
function recordProgress(kind,id){if(!id)return;if(kind==='room')passport.visit(id);else passport.chapter(id);if(cloudPassport)cloudPassport.progress(kind,id).catch(()=>toast('Progress saved locally; cloud sync could not finish.'));}
function onRoom(n){recordProgress('room',['atrium','collection','cinema','collection'][n]);document.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.room)===n));document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));$(n===2?'#cinema-nav':n===3?'#collection-nav':'#explore-nav').classList.add('active');}
async function getWorld(){
 if(runtime)return runtime;
 if(!runtimePromise){const started=performance.now();$('#loading').classList.remove('hidden');runtimePromise=import('./unity-world.js').then(async({createUnityGallery})=>{runtime=await createUnityGallery({artworks,onArt:showArt,toast,chess,onRoom,onProgress:p=>{$('#loading small').textContent=`LOADING 3D GALLERY · ${Math.round(p*100)}%`;$('#gallery-load-progress').value=p;}});$('#world').dataset.startupMs=String(Math.round(performance.now()-started));return runtime;}).catch(e=>{console.error('Gallery startup failed:',e);runtimePromise=null;$('#loading').classList.add('hidden');toast('3D could not start. You can still browse art, watch films, and play chess.');throw e;});}
 return runtimePromise;
}
function visit(action){const intent=++visitIntent;chess.leave();return getWorld().then(w=>{if(intent!==visitIntent)return;action(w);tutorial.first();}).catch(()=>{});}
const world={go:n=>visit(w=>w.go(n)),arrive:()=>visit(w=>w.arrive()),home:()=>{++visitIntent;$('#loading').classList.add('hidden');chess.leave();runtime?.home();$('#menu').classList.add('hidden');$('#menu-nav').setAttribute('aria-expanded','false');onRoom(-1);},stop:()=>runtime?.stop(),view:()=>runtime?runtime.view():toast('Enter the gallery to change the camera view.'),enterVR:()=>prepareVR()};
const exhibition=attachLifeAndLight({modal,close,showArt,artworks,world});
const chess=attachLazyChess({onOnline:()=>together.open(),onOpen:()=>{if($('#modal').open)close();world.stop();},onClose:()=>runtime?.resume()},{onLoading:toast});
const together=attachTogether({chess,pause:()=>world.stop(),resume:()=>runtime?.resume(),toast});
const tutorial=attachFirstVisit({modal,close,onFinish:()=>document.body.classList.contains('at-entrance')?runtime?.walk():runtime?.resume()});
$('#loading').innerHTML='<strong>Enter Serengeti</strong><small>PREPARING THE 3D GALLERY</small><progress id="gallery-load-progress" max="1" value="0" aria-label="3D gallery loading"></progress><p>The first 3D visit downloads about 61 MB. Browse art or play chess without loading 3D.</p><button id="load-low">Use low detail</button><button id="load-browse">Browse art instead</button>';
$('#load-low').onclick=()=>{writeSaved('serengeti-quality','low');window.dispatchEvent(new CustomEvent('serengeti-quality',{detail:'low'}));$('#lobby-quality').value='low';$('#load-low').textContent='Low detail selected';};
$('#load-browse').onclick=()=>{world.home();collection();};
const lobbyOptions=document.createElement('div');lobbyOptions.className='lobby-options';lobbyOptions.innerHTML='<label for="lobby-quality">3D detail <select id="lobby-quality"><option value="auto">Automatic</option><option value="low">Low · save battery</option><option value="balanced">Balanced</option><option value="high">High</option></select></label>';
$('.hero').append(lobbyOptions);$('#lobby-quality').value=readSaved('serengeti-quality','auto');$('#lobby-quality').onchange=e=>{writeSaved('serengeti-quality',e.target.value);window.dispatchEvent(new CustomEvent('serengeti-quality',{detail:e.target.value}));};
const jazzLegacy=createJazzLegacy({modal,showArt});
$('#collection-nav').onclick=()=>collection();$('#search-nav').onclick=()=>collection(true);$('#cart-nav').onclick=cart;$('#map-nav').onclick=map;$('#story-nav').onclick=story;$('#portrait-info').onclick=()=>jazzLegacy.open('portrait');$('#discover-story').onclick=()=>world.arrive();$('#portrait-next').onclick=()=>jazzLegacy.open('portrait');$('#home').onclick=$('#explore-nav').onclick=()=>world.home();$('#enter').onclick=()=>world.arrive();$('#watch').onclick=$('#cinema-nav').onclick=()=>world.go(2);$('#view-nav').onclick=()=>{$('#menu').classList.add('hidden');$('#menu-nav').setAttribute('aria-expanded','false');world.view();};$('#vr').onclick=()=>world.enterVR();
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>world.go(Number(b.dataset.room)));
$('#menu-nav').onclick=()=>{const hidden=$('#menu').classList.toggle('hidden');$('#menu-nav').setAttribute('aria-expanded',String(!hidden));hidden?runtime?.resume():world.stop();};
for(const [id,text,action] of [['browse-nav','Browse artworks',()=>collection()],['passport-nav','My passport & saved art',showPassport],['tour-nav','Take a guided tour',guidedTour]]){const button=document.createElement('button');button.id=id;button.textContent=text;button.onclick=action;$('#account-nav').before(button);}
window.addEventListener('serengeti-portrait-complete',()=>recordProgress('chapter','welcome'));
const htmlCinema=attachHTMLCinema({modal});
const galleryAudio=attachGalleryAudio();

async function prepareVR(){
 const capability=await checkHeadset();if(!capability.supported){modal('<div class="list-panel"><h2>Open Serengeti in your headset</h2><p>'+escape(capability.message)+'</p><p>VR covers the gallery and native cinema. YouTube embeds remain available in the standard browser player.</p></div>');return;}
 try{const w=await getWorld();const selected=selectVRFilm(document.querySelector('#club-movie')?.currentSrc,new URL('/serengeti-gallery/assets/serengeti-loop.mp4',location.origin).href);
 modal('<div class="list-panel"><h2>Ready for headset VR</h2><p>Use the left stick to move, the right stick to snap turn, and the trigger to select artwork or room controls. The in-headset menu includes Gallery, Cinema, and Life & Light.</p><p>'+(selected.fallback?'The VR cinema will use the gallery’s short ambient film. YouTube cannot be shown on this native VR screen. Select a direct MP4 or WebM in the cinema for a different film.':'The selected direct video is ready for the native cinema screen.')+'</p><button class="primary" id="start-headset">Enter headset VR</button><p id="vr-status" role="status"></p></div>');
 document.querySelector('#start-headset').onclick=()=>{close();w.enterVR(selected.url);};
 }catch{toast('VR could not prepare. The collection remains available.');}
}

document.querySelector("#teleport-control").onclick=map;

$('#settings-nav').onclick=()=>{modal(`<div class="list-panel"><h2>Make yourself comfortable</h2><label for="quality-choice">3D quality</label><select id="quality-choice"><option value="auto">Automatic (lighter on touch devices)</option><option value="low">Low — save battery</option><option value="balanced">Balanced</option><option value="high">High — sharper detail</option></select><p>Applies immediately. Lower settings reduce shadows and rendering resolution.</p><label><input id="reduce-motion" type="checkbox"> Reduce automatic motion</label><p>Keep the portrait and trailer still until you press Play.</p><label><input id="welcome-captions" type="checkbox"> Show welcome captions</label><p>Your discoveries and chess game are saved on this browser when storage is available.</p><button id="reset-discoveries" class="outline-small">Reset discoveries</button></div>`);$('#quality-choice').value=readSaved('serengeti-quality','auto');$('#quality-choice').onchange=e=>{writeSaved('serengeti-quality',e.target.value);window.dispatchEvent(new CustomEvent('serengeti-quality',{detail:e.target.value}));};$('#reduce-motion').checked=readSaved('serengeti-reduced-motion',matchMedia('(prefers-reduced-motion: reduce)').matches);$('#reduce-motion').onchange=e=>{writeSaved('serengeti-reduced-motion',e.target.checked);window.dispatchEvent(new CustomEvent('serengeti-motion',{detail:e.target.checked}));};$('#welcome-captions').checked=readSaved('serengeti-captions',true)!==false;$('#welcome-captions').onchange=e=>{writeSaved('serengeti-captions',e.target.checked);window.dispatchEvent(new CustomEvent('serengeti-captions',{detail:e.target.checked}));};$('#reset-discoveries').onclick=()=>{encounters.clear();writeSaved('serengeti-discoveries',[]);$('#visited').textContent=`0 / ${artworks.length} works discovered`;toast('Discoveries reset.');};};

window.addEventListener('serengeti-discovered',e=>{const i=Number(e.detail);if(Number.isInteger(i)&&i>=0&&i<artworks.length){encounters.add(i);writeSaved('serengeti-discoveries',[...encounters]);$('#visited').textContent=`${encounters.size} / ${artworks.length} works discovered`;}});

// Guest arrivals do not download the account client until it is needed.
let accountPromise=null;
function loadAccounts(){
 accountPromise??=import('./auth.js').then(({attachAccounts})=>attachAccounts({modal,close,toast,onUser:accountChanged})).catch(()=>{accountPromise=null;toast('Accounts could not load. Please try again.');return null;});
 return accountPromise;
}
for(const id of ['account-nav','signup-nav'])$('#'+id).onclick=async()=>{if(await loadAccounts())$('#'+id).click();};
$('#menu-nav').addEventListener('click',()=>loadAccounts());
let savedAccount=false;try{for(let i=0;i<localStorage.length;i++)if(/^sb-.+-auth-token$/.test(localStorage.key(i)))savedAccount=true;}catch{}
if(savedAccount||/[#&](access_token|error|type)=|[?&]code=/.test(location.href))loadAccounts();

function openCinema(){
 if(document.body.classList.contains('exploring')){world.go(2);return;}
 modal('<div class="list-panel"><div class="caption">YOUR CINEMA VISIT</div><h2>How would you like to watch?</h2><p>Watch a film right away, or walk into the 3D cinema with the curator.</p><div class="map-destinations"><button id="cinema-watch-now"><i class="ph-light ph-play" aria-hidden="true"></i><span><strong>Watch a film</strong><small>Quick to open · no 3D download</small></span></button><button id="cinema-explore"><i class="ph-light ph-person-simple-walk" aria-hidden="true"></i><span><strong>Enter the 3D cinema</strong><small>Choose a chair and explore</small></span></button></div></div>');
 $('#cinema-watch-now').onclick=()=>htmlCinema.open();$('#cinema-explore').onclick=()=>{close();world.go(2);};
}
$('#watch').onclick=$('#cinema-nav').onclick=openCinema;
createCinemaTeaser({enterCinema:openCinema});
// Build the responsive layout before observers begin preview playback.
attachArrivalInteractions({enterGallery:()=>world.arrive()});
attachResponsiveGallery();
attachGalleryHUD({modal,pause:()=>world.stop(),resume:()=>runtime?.resume(),onHelp:()=>tutorial.open()});
galleryAudio.sync();

const linkedArtwork=linkedArtworkIndex(location.search,artworks);
if(linkedArtwork>=0)showArt(linkedArtwork);
else if(location.hash==='#life-and-light')exhibition.open();
else if(new URLSearchParams(location.search).has('artwork'))toast('This artwork link was not found. Browse the collection to find a piece.');
