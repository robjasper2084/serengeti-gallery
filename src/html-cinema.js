export function attachHTMLCinema({modal,close=()=>document.querySelector('#modal .close').click()}){
 const button=document.createElement('button');button.id='html-cinema-nav';button.textContent='Watch films without 3D';document.querySelector('#account-nav').before(button);
 function open(){
  modal('<div class="list-panel"><div class="caption">SERENGETI SCREENING ROOM</div><h2>Detroit After Dark</h2><p>A short journey through Detroit, art, and jazz. Press Play to begin.</p><video id="home-film" controls playsinline muted preload="none" poster="/serengeti-gallery/assets/atrium-cinematic.webp" src="/serengeti-gallery/assets/detroit-after-dark-web.mp4" aria-label="Detroit After Dark concept trailer"></video><div class="film-toolbar"><button data-gallery-sound>Enable sound</button><button id="film-fullscreen">Full screen</button><button id="film-back">Back to lobby</button></div><p id="film-display-status" role="status"></p><details><summary>About this film</summary><p>A 15-second generated concept trailer, not a documentary or advertised exhibition. A dusk riverfront gives way to a warm concrete gallery with a bronze sculpture. A musician plays piano before the view enters an intimate cinema. The soundtrack is instrumental jazz with no spoken dialogue.</p></details><p><a href="https://www.youtube.com/watch?v=4euNaGauB5k" target="_blank" rel="noopener">Watch Jazz-Off Detroit on YouTube ↗</a></p><p class="muted">YouTube provides captions where the creator has made them available.</p></div>');
  const film=document.querySelector('#home-film');
  film.muted=document.querySelector('#sound').dataset.enabled!=='true';
  document.querySelector('#film-fullscreen').onclick=async()=>{try{if(film.requestFullscreen)await film.requestFullscreen();else if(film.webkitEnterFullscreen)film.webkitEnterFullscreen();else throw Error();}catch{document.querySelector('#film-display-status').textContent='Use the full-screen button on the video player if your browser supports it.';}};
  document.querySelector('#film-back').onclick=()=>{close();document.querySelector('#home').click();};
 }
 button.onclick=open;return {open};
}
