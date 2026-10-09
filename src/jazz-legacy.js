import './jazz-legacy.css';
import {readSaved} from './visitor-settings.js';

const chapterStyle={portrait:['user-circle','Meet the founder'],history:['buildings','Explore the journey'],community:['users-three','See the impact'],honors:['medal','Celebrate the legacy']};
function animateLegacyBackground(section,motion){
 const video=section.querySelector('video'),toggle=section.querySelector('.legacy-motion'),dialog=section.closest('dialog');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=motion.paused??(Boolean(readSaved('serengeti-reduced-motion',preference.matches))||Boolean(navigator.connection?.saveData));
 const events=new AbortController();
 function sync(){
  motion.paused=paused;
  toggle.textContent=paused?'Play background':'Pause background';toggle.setAttribute('aria-pressed',String(!paused));
  section.classList.toggle('legacy-still',paused);
  if(paused||document.hidden||!dialog.open){video.pause();return;}
  if(!video.getAttribute('src'))video.src=`${import.meta.env.BASE_URL}assets/jazz-legacy/ambient.mp4`;
  video.play().catch(()=>{if(!section.isConnected||!dialog.open||document.hidden)return;paused=true;motion.paused=true;toggle.textContent='Play background';toggle.setAttribute('aria-pressed','false');section.classList.add('legacy-still');});
 }
 toggle.onclick=()=>{paused=!paused;sync();};
 document.addEventListener('visibilitychange',sync,{signal:events.signal});
 dialog.addEventListener('close',sync,{signal:events.signal});
 preference.addEventListener('change',event=>{paused=event.matches;sync();},{signal:events.signal});
 window.addEventListener('serengeti-motion',event=>{paused=Boolean(event.detail);sync();},{signal:events.signal});
 const observer=new MutationObserver(()=>{if(!section.isConnected){video.pause();events.abort();observer.disconnect();}});
 observer.observe(section.parentElement,{childList:true});sync();
}

const foundation='https://thejazznetworkfoundation.org';
const artists=['Dwight Adams','Bill Banfield','Marcus Belgrave','Ben’s Friends Big Band','Ron Blake','George Bohanon','Buddy Budson','Oscar Brown Jr.','James Carter','Kenn Cox','Tommy Flanagan','FRA FRA Sound','Charlie Gabriel','Roy Hargrove','Winard Harper','Dr. Teddy Harris','Bob Hurst','Milt Jackson','Sean Jones','Eugene Maslov','Mulgrew Miller','Steve Nelson','Johnny O’Neal','Michael Rabinowitz','Kareem Riggins','Vanessa Rubin','Straight Ahead','Donald Walden','Ursula Walker','Michael Wolff','Rodney Whitaker','Lenny White','Buster Williams'];
const source=(path,label)=>`<a href="${foundation}/${path}/" target="_blank" rel="noopener">${label} ↗</a>`;
const concert='<a class="legacy-link" href="https://www.youtube.com/watch?v=zqJbv-_m0wI" target="_blank" rel="noopener">Watch the anniversary performance on YouTube ↗</a>';
export const communityArchiveLinks=()=>`<div class="community-screenings"><a class="legacy-link" href="https://www.youtube.com/watch?v=lZco4lHgIoY" target="_blank" rel="noopener">Orchestra Hall · 1999 · Watch excerpt ↗</a><a class="legacy-link" href="https://www.youtube.com/watch?v=6GHATpTBBHc" target="_blank" rel="noopener">Bert’s Jazz Club · 2019 · Watch excerpt ↗</a></div>`;
const sourceLabels={'bill-foster':'Bill Foster’s biography',history:'History & legacy','awards-recognition':'Awards & recognition','community-impact':'Community impact'};
const chapters={
 portrait:{label:'Bill Foster',title:'A life in Detroit jazz',path:'bill-foster',body:()=>`
  <div class="legacy-lead"><figure><img src="${foundation}/wp-content/themes/jazz-network-foundation/assets/images/bio/bill-foster-hono-by-coingressman-conyers.jpg" alt="Bill Foster being honored by Congressman John Conyers" loading="lazy"><figcaption>Bill Foster with Congressman John Conyers.<br>Archive: The Jazz Network Foundation.</figcaption></figure><div><p class="legacy-deck">Bill Foster connects musicians, audiences and generations.</p><p>Presenter, broadcaster, mentor and foundation founder, Foster supports Detroit’s music and young people.</p><dl class="legacy-facts"><div><dt>September 20, 1933</dt><dd>Born; raised and educated in Detroit.</dd></div><div><dt>1956</dt><dd>First concert: Harold McKinney and Roy Brooks. Covered by Jet magazine.</dd></div><div><dt>Early 1960s</dt><dd>Cleveland concert promotion and jazz broadcasts on WCUY-FM and WERE-FM.</dd></div><div><dt>1970s</dt><dd>Returned to Detroit to continue presenting artists and building cultural connections.</dd></div></dl></div></div>
  <details class="legacy-artists"><summary>Artists he has presented</summary><p>The foundation names these artists among many:</p><ul>${artists.map(name=>`<li>${name}</li>`).join('')}</ul></details>`},
 history:{label:'Our history',title:'Places that kept the music living',path:'history',body:()=>`
  <p class="legacy-deck">The Jazz Network Foundation began in 1992. Its history connects performance, visual art, dance and mentorship.</p>
  <ol class="legacy-timeline"><li><span>01 · SERENGETI</span><h3>A place to gather</h3><p>The SereNgeti Ballroom and Galleries brought art, music and conversation together. Harold McKinney led Thursday jam sessions and youth-development activities.</p></li><li><span>02 · MUSIC & MENTORSHIP</span><h3>The National Jazz Orchestra</h3><p>Directed by Foster and based at the Galleries, the orchestra played four consecutive Detroit Jazz Festivals. The venue also welcomed Youth in Music, African dance groups, and African and Haitian art.</p></li><li><span>03 · DOWNTOWN DETROIT</span><h3>The Virgil Carr Center</h3><p>A former foundation home, the center represents a chapter in downtown Detroit’s Black cultural life. The foundation is no longer based there.</p></li><li id="legacy-anniversary"><span>04 · 2014</span><h3>Twenty-two years, celebrated live</h3><p>Foster organized a Knight Foundation-supported, two-hour anniversary concert. Winard Harper joined the SereNgeti Quartet: Ralph Armstrong, Marcus Elliot and Mike Jellick. Their program reinterpreted Duke Ellington’s <em>In a Sentimental Mood</em>. The archive includes a concert excerpt and an image with guests including Joan Belgrave.</p>${concert}</li></ol>`},
 community:{label:'Community',title:'Music opens doors',path:'community-impact',body:()=>`
  <p class="legacy-deck">The foundation connects young musicians, experienced artists and Detroit audiences through opportunities to learn, perform and belong.</p>
  <section class="legacy-impact-facts" aria-label="1999 Orchestra Hall program"><div><strong>700</strong><span>Detroit Public School students</span></div><div><strong>120</strong><span>minutes of learning and music</span></div><div><strong>5</strong><span>musicians sharing the stage</span></div></section>
  <ol class="legacy-timeline"><li><span>1999 · ORCHESTRA HALL</span><h3>Learning from the masters</h3><p>Foster worked with the Detroit Symphony Orchestra’s Young Musicians Program director on an educational concert. Bassoonist Michael Rabinowitz performed with Harold McKinney (piano), Marcus Belgrave (trumpet), Rodney Whitaker (bass) and George Davidson (drums).</p></li><li><span>2019 · BERT’S JAZZ CLUB</span><h3>Jazz in a neighborhood gathering place</h3><p>A Foster-organized performance brought together Alex Harding, Benny Green, James Carter, Jim Alfredson and Djallo Djaka for two hours of music and community.</p></li></ol>
  <h3>Across generations</h3><p>Workshops, jam sessions and youth programs nurture confidence. Established musicians find engaged audiences and opportunities to mentor. The foundation celebrates Detroit’s talent while building relationships and cultural spaces that can last beyond individual concerts.</p>${communityArchiveLinks()}`},
 honors:{label:'Honors',title:'A city’s gratitude',path:'awards-recognition',body:()=>`
  <p class="legacy-deck">Four milestones recognize Foster’s contribution to Detroit’s jazz community.</p>
  <div class="legacy-honors">${[
   ['2007','Jazz Guardian Award','The Detroit Jazz Festival honored his sustained work supporting and organizing jazz.'],
   ['2013','Spirit of Detroit','The City of Detroit recognized his dedication to its residents and cultural life.'],
   ['2013','Knight Arts Challenge','Support helped advance Jazz-Off’s approach to artist development and civic storytelling.'],
   ['2014','Detroit Jazz Hero','Recognition for his advocacy, generosity and commitment to jazz.']
  ].map(([year,title,copy])=>`<article><span>${year}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
  <details class="legacy-artists"><summary>See the Jazz Hero archival photograph</summary><figure><img class="legacy-award-photo" src="${foundation}/wp-content/themes/jazz-network-foundation/assets/images/bio/bill-foster-jazz-hero.jpg" alt="Bill Foster’s Detroit Jazz Hero recognition, 2014" loading="lazy"><figcaption>Archive: The Jazz Network Foundation.</figcaption></figure></details>`}
};

export function createJazzLegacy({modal,showArt}){
 const motion={paused:null};
 window.addEventListener('serengeti-motion',event=>{motion.paused=Boolean(event.detail);});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{motion.paused=event.matches;});
 function open(chapter='portrait',focusHeading=false){
  const selected=chapters[chapter]||chapters.portrait;
  const next=Object.keys(chapters)[(Object.values(chapters).indexOf(selected)+1)%Object.keys(chapters).length];
  modal(`<section class="jazz-legacy"><div class="legacy-atmosphere" aria-hidden="true"><video muted loop playsinline preload="none" poster="${import.meta.env.BASE_URL}assets/jazz-legacy/ambient.jpg"></video></div><div class="legacy-content"><div class="legacy-eyebrow"><div class="caption">BILL FOSTER & THE JAZZ LEGACY</div><button class="legacy-motion" type="button">Pause background</button></div><nav class="legacy-chapters" aria-label="Jazz legacy chapters">${Object.entries(chapters).map(([key,value])=>`<button data-legacy-chapter="${key}" aria-pressed="${value===selected}"><i class="ph-light ph-${chapterStyle[key][0]}" aria-hidden="true"></i><span><strong>${value.label}</strong><small>${chapterStyle[key][1]}</small></span></button>`).join('')}</nav><div class="legacy-reading"><h2 id="legacy-heading" tabindex="-1">${selected.title}</h2>${selected.body()}</div><button class="legacy-next" data-legacy-chapter="${next}"><span><small>KEEP EXPLORING</small><strong>${chapters[next].label}</strong></span><i class="ph-light ph-arrow-right" aria-hidden="true"></i></button><footer class="legacy-source"><p>Adapted from The Jazz Network Foundation. Explore the complete original account:</p>${source(selected.path,sourceLabels[selected.path])}<button class="outline-small" id="legacy-artwork">View the portrait artwork & editions ↗</button></footer></div></section>`);
  document.querySelectorAll('[data-legacy-chapter]').forEach(button=>button.onclick=()=>open(button.dataset.legacyChapter,true));
  document.querySelector('#legacy-artwork').onclick=()=>showArt(0);
  document.querySelector('#modal').scrollTop=0;
  animateLegacyBackground(document.querySelector('.jazz-legacy'),motion);
  if(focusHeading)document.querySelector('#legacy-heading').focus({preventScroll:true});
 }
 const storyButton=document.querySelector('#story-nav');storyButton.textContent='History & legacy';
 for(const [id,label,chapter] of [['foster-nav','Meet Bill Foster','portrait'],['honors-nav','Awards & recognition','honors'],['community-nav','Community impact','community']]){
  const button=document.createElement('button');button.id=id;button.textContent=label;button.onclick=()=>open(chapter);storyButton.after(button);
 }
 const cinema=document.querySelector('#cinema');
 const archive=document.createElement('div');archive.className='legacy-cinema';archive.innerHTML=`<strong>From the real jazz archive</strong><p>The foundation’s 2014 anniversary concert.</p>${concert}${communityArchiveLinks()}`;cinema.append(archive);
 return {open};
}
