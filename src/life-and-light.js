import works from './life-and-light.json';
import {printEditions,printCheckout} from './print-editions.js';
import './life-and-light.css';

export const exhibitionGroups=[
 {id:'light',name:'Detroit & Light',description:'Water, sky, and the city after dark.'},
 {id:'people',name:'People & Roots',description:'Small moments of care, presence, and connection.'},
 {id:'companions',name:'Companions & Places',description:'Shared paths through the natural world.'},
 {id:'abstract',name:'Abstract Energy',description:'Color, gesture, and movement.'}
];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const featured=works.filter(w=>w.featured);
export const exhibitionBanner=()=>`<button class="exhibition-banner" data-exhibition><img src="${works[4].image}" width="720" height="478" alt="Winter river light over Detroit"><span><small>NEW EXHIBITION · 21 WORKS</small><strong>Detroit, Life & Light</strong><span>Photography by eyefilmlife, with two gallery submissions. Explore the exhibition ↗</span></span></button>`;

export function attachLifeAndLight({modal,close,showArt,artworks,world}){
 const byId=new Map(artworks.map((a,i)=>[a.id,i]));
 const card=w=>`<button class="exhibition-card" data-exhibition-art="${byId.get(w.id)}"><span class="exhibition-image"><img src="${w.image}" width="${w.width}" height="${w.height}" loading="lazy" alt="${esc(w.description)}"></span><span class="exhibition-card-copy"><strong>${esc(w.title)}</strong><small>${esc(w.credit)}</small><span>View artwork ↗</span></span></button>`;
 let checkoutConfiguration=null;
 function bind(){
  document.querySelectorAll('[data-exhibition-art]').forEach(b=>b.onclick=()=>showArt(Number(b.dataset.exhibitionArt)));
  document.querySelectorAll('[data-print-work]').forEach(b=>b.onclick=()=>print(b.dataset.printWork));
 }
 function open(){
  modal(`<section class="exhibition"><div class="caption">EYEFILMLIFE / A SERENGETI EXHIBITION</div><h2>Detroit, Life & Light</h2><p class="exhibition-intro">21 works. Changing light, shared moments, and companions along the way.</p><div class="exhibition-actions"><button class="primary" id="exhibition-walk">Walk the 3D exhibition ↗</button><button class="outline-small" id="exhibition-prints">Print editions</button><a class="outline-small" href="/serengeti-gallery/assets/exhibitions/life-and-light/credits.json" download="life-and-light-credits.json">Save credits ↓</a></div><p class="exhibition-credit">eyefilmlife & gallery submissions · Original credits preserved</p><div class="exhibition-filter" role="group" aria-label="Exhibition themes"><button data-theme="all" aria-pressed="true">All 21</button>${exhibitionGroups.map(g=>`<button data-theme="${g.id}" aria-pressed="false">${g.name}</button>`).join('')}</div><label class="exhibition-search">Find an artwork<input id="exhibition-search" type="search" placeholder="Search titles, themes, or credits"></label><p class="exhibition-result" id="exhibition-result" role="status">21 works on view</p><div id="exhibition-works"></div><footer class="exhibition-footer"><details><summary>About the exhibition & image credits</summary><p>© eyefilmlife where credited in the supplied files. Original files and embedded copyright marks are preserved. No AI generation or alterations were used for this exhibition. Titles are descriptive gallery labels. The Night Rider and Yellow Current artist credits await confirmation.</p></details></footer></section>`);
  let theme='all';const input=document.querySelector('#exhibition-search');
  function render(){
   const query=input.value.trim().toLowerCase();let count=0;
   document.querySelector('#exhibition-works').innerHTML=exhibitionGroups.filter(g=>theme==='all'||theme===g.id).map(g=>{
    const list=works.filter(w=>w.group===g.id&&`${w.title} ${w.description} ${w.credit} ${g.name}`.toLowerCase().includes(query));count+=list.length;
    return list.length?`<section class="exhibition-group"><div class="exhibition-group-heading"><h3>${g.name}</h3><p>${g.description}</p></div><div class="exhibition-grid">${list.map(card).join('')}</div></section>`:'';
   }).join('')||'<p class="exhibition-empty">No matching artwork. Try another title or choose All 21.</p>';
   document.querySelector('#exhibition-result').textContent=`${count} ${count===1?'work':'works'} on view`;bind();
  }
  document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;document.querySelectorAll('[data-theme]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));render();});
  input.oninput=render;
  document.querySelector('#exhibition-walk').onclick=()=>{close();world.go(3);};
  document.querySelector('#exhibition-prints').onclick=prints;render();
 }
 function prints(){
  modal(`<section class="exhibition"><div class="caption">THE FIRST SIX / PRINT EDITIONS</div><h2>Art for your walls</h2><p class="exhibition-intro">Six featured works, with planned editions from $25. Print orders will open after the original files, print proofs, and fulfillment are ready.</p><button class="outline-small" id="prints-back">← Back to the exhibition</button><div class="exhibition-grid print-grid">${featured.map(w=>`<article class="print-card"><div class="exhibition-image"><img src="${w.image}" width="${w.width}" height="${w.height}" loading="lazy" alt="${esc(w.description)}"></div><div class="exhibition-card-copy"><h3>${esc(w.title)}</h3><small>${esc(w.credit)}</small><span class="print-state">Print edition in preparation</span><button class="outline-small" data-print-work="${w.id}">Preview sizes & prices</button></div></article>`).join('')}</div><p class="exhibition-credit">Prices are in USD before shipping and any applicable tax. Prints preserve the composition; paper sizes may include borders. Signed and framed editions are planned at $300 and $375. No payment is accepted while an edition is in preparation.</p></section>`);
  document.querySelector('#prints-back').onclick=open;bind();
 }
 async function print(id){
  const work=featured.find(w=>w.id===id);if(!work)return;
  modal(`<section class="exhibition print-detail"><div class="caption">PRINT EDITION / PREVIEW</div><h2>${esc(work.title)}</h2><div class="print-detail-grid"><img class="print-preview" src="${work.image}" width="${work.width}" height="${work.height}" alt="${esc(work.description)}"><div><p>${esc(work.credit)}</p><label for="print-edition">Choose a planned edition</label><select id="print-edition">${printEditions.map(e=>`<option value="${e.id}">${e.label} — $${e.price}</option>`).join('')}</select><strong class="print-price" id="print-price">$25</strong><p class="muted">USD · shipping and any applicable tax shown at checkout when orders open.</p><button class="primary" id="print-checkout" disabled>Edition in preparation</button><p id="print-availability" class="print-availability" role="status">Original file approval, a print proof, and fulfillment are needed before ordering.</p><p class="exhibition-credit">Web reference: ${work.width} × ${work.height} pixels. This supplied preview is displayed unchanged; larger physical prints require a suitable original master. ${work.credit.includes('pending')?'Artist credit and sale provenance also need confirmation.':''}</p><button class="outline-small" id="print-view-art">View & save artwork</button><button class="outline-small" id="print-back">← All print editions</button></div></div></section>`);
  const select=document.querySelector('#print-edition'),button=document.querySelector('#print-checkout'),status=document.querySelector('#print-availability');
  function sync(){
   if(!select.isConnected)return;const edition=printEditions.find(e=>e.id===select.value);document.querySelector('#print-price').textContent=`$${edition.price}`;
   const link=printCheckout(id,edition.id,checkoutConfiguration,featured.map(w=>w.id));button.disabled=!link;button.textContent=link?'Order securely with Stripe ↗':'Edition in preparation';
   status.textContent=link?'Review your edition, shipping, and total in Stripe before paying.':'Original file approval, a print proof, and fulfillment are needed before ordering.';
   button.onclick=()=>{if(link)location.assign(link);};
  }
  select.onchange=sync;document.querySelector('#print-back').onclick=prints;document.querySelector('#print-view-art').onclick=()=>showArt(byId.get(id));sync();
  if(!checkoutConfiguration)try{const response=await fetch('/serengeti-gallery/print-checkout.json',{cache:'no-store'});if(response.ok)checkoutConfiguration=await response.json();}catch{/* A failed readiness check leaves ordering closed. */}sync();
 }
 function wire(){document.querySelectorAll('[data-exhibition]').forEach(b=>b.onclick=open);}
 const menuButton=document.createElement('button');menuButton.id='life-light-nav';menuButton.textContent='Detroit, Life & Light · new exhibition';menuButton.onclick=open;document.querySelector('#account-nav').before(menuButton);
 const printButton=document.createElement('button');printButton.id='print-editions-nav';printButton.textContent='Print editions';printButton.onclick=prints;menuButton.after(printButton);
 return {open,prints,print,wire};
}
