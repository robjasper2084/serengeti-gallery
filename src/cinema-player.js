import {projectiveTransform} from './projective-transform.js';

export function parseScreening(input,base=location.href) {
 const url=new URL(input,base);
 if(!['https:','http:'].includes(url.protocol))throw Error('Use a video link beginning with https://.');
 const host=url.hostname.toLowerCase();
 if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be'].includes(host)) {
  const id=host==='youtu.be'?url.pathname.split('/')[1]:url.searchParams.get('v')||url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
  if(!/^[\w-]{11}$/.test(id||''))throw Error('Paste a specific YouTube video or live-stream link.');
  return {type:'youtube',id,url:`https://www.youtube.com/watch?v=${id}`};
 }
 if(url.origin!==new URL(base).origin&&url.protocol!=='https:')throw Error('External movies and streams need an https:// link.');
 const type=/\.m3u8$/i.test(url.pathname)?'hls':/\.(mp4|webm|ogv)$/i.test(url.pathname)?'movie':null;
 if(!type)throw Error('Use a YouTube video link, an MP4/WebM movie, or an HLS .m3u8 stream.');
 return {type,url:url.href};
}

export function createCinemaPlayer() {
 const stage=document.querySelector('#cinema-screen');
 const surface=document.querySelector('#screen-surface');
 const title=document.querySelector('#screening-title');
 const status=document.querySelector('#film-state');
 const panel=document.querySelector('#cinema');
 const canvas=document.querySelector('#world');
 let active=false,sound=false,video=null,iframe=null,hls=null,selected=null,generation=0,loadTimer=null;
 const ytOrigin='https://www.youtube-nocookie.com';
 const command=(func,args=[])=>iframe?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}),ytOrigin);
 function stop(){generation++;clearTimeout(loadTimer);loadTimer=null;hls?.destroy();hls=null;if(video){video.pause();video.removeAttribute('src');video.load();}video=null;iframe=null;surface.replaceChildren();}
 async function load(input,label){
  let source;try{source=parseScreening(input);}catch(error){status.textContent=error.message;return;}
  selected={input,label};stop();const token=generation;title.textContent=label;status.textContent='Loading the screening…';
  document.querySelector('#screening-link').href=source.url;
  document.querySelector('#screening-link').textContent=source.type==='youtube'?'Open on YouTube ↗':'Open source ↗';
  if(source.type==='youtube') {
   iframe=document.createElement('iframe');iframe.title=label;iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
   iframe.src=`${ytOrigin}/embed/${source.id}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}&autoplay=1&mute=${sound?0:1}&rel=0&playsinline=1`;
   loadTimer=setTimeout(()=>{if(token!==generation)return;status.textContent='YouTube has not loaded. Under Screenings & streams, try Gallery film or Open on YouTube.';},15000);
   iframe.addEventListener('load',()=>{if(token!==generation)return;clearTimeout(loadTimer);status.textContent='Press play on the screen to begin.';iframe.contentWindow.postMessage(JSON.stringify({event:'listening',id:'serengeti-screen'}),ytOrigin);command('addEventListener',['onStateChange']);command('addEventListener',['onError']);command(sound?'unMute':'mute');});surface.append(iframe);
  }else {
   video=document.createElement('video');video.id='club-movie';video.controls=true;video.playsInline=true;video.muted=!sound;video.crossOrigin='anonymous';video.loop=source.type==='movie';video.preload='auto';surface.append(video);
   video.addEventListener('playing',()=>status.textContent=source.type==='hls'?'Stream playing':'Film playing');
   video.addEventListener('pause',()=>status.textContent='Paused');
   video.addEventListener('error',()=>status.textContent='This source could not play. Check the address and whether the host allows playback here.');
   if(source.type==='hls'&&!video.canPlayType('application/vnd.apple.mpegurl')) {
    const {default:Hls}=await import('hls.js');if(token!==generation)return;
    if(!Hls.isSupported()){status.textContent='This browser cannot play this HLS stream.';return;}
    hls=new Hls();hls.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal){status.textContent='The stream is unavailable or the host blocks playback here.';hls?.destroy();hls=null;}});hls.loadSource(source.url);hls.attachMedia(video);
   }else video.src=source.url;
   video.play().catch(()=>{if(token===generation)status.textContent='Press play on the screen to start.';});
  }
 }
 window.serengetiProjectScreen=(points,visible)=>{
  const show=active&&visible&&!document.querySelector('#modal').open;
  stage.classList.toggle('screen-visible',!!show);if(!show)return;
  const rect=canvas.getBoundingClientRect();const corners=[];
  for(let i=0;i<8;i+=2)corners.push([rect.left+points[i]*rect.width,rect.top+points[i+1]*rect.height]);
  const matrix=projectiveTransform(1280,720,corners);if(matrix)surface.style.transform=matrix;else stage.classList.remove('screen-visible');
 };
 window.addEventListener('message',event=>{
  if(event.origin!==ytOrigin||event.source!==iframe?.contentWindow)return;
  let data;try{data=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch{return;}
  if(data.event==='onError')status.textContent='YouTube could not embed this video. Use Open on YouTube to watch it.';
  const state=data.event==='onStateChange'?data.info:data.event==='infoDelivery'?data.info?.playerState:undefined;
  if(state===1)status.textContent='Screening playing';else if(state===2)status.textContent='Paused';else if(state===0)status.textContent='Screening ended · Restart to watch again';
 });
 document.querySelector('#watch-jazz').onclick=()=>load('https://www.youtube.com/watch?v=4euNaGauB5k','Jazz-Off Detroit');
 document.querySelector('#watch-gallery-film').onclick=()=>load('/serengeti-gallery/assets/serengeti-loop.mp4','Between concrete & grass');
 document.querySelector('#screening-form').onsubmit=event=>{event.preventDefault();load(document.querySelector('#screening-url').value,'Your screening');};
 document.querySelector('#play-film').onclick=()=>{if(video)video.play().catch(()=>{status.textContent='Press play on the screen to start.';});else command('playVideo');};
 document.querySelector('#pause-film').onclick=()=>{video?.pause();command('pauseVideo');};
 document.querySelector('#restart-film').onclick=()=>{if(video){video.currentTime=0;video.play().catch(()=>{});}else{command('seekTo',[0,true]);command('playVideo');}};
 panel.addEventListener('keydown',event=>event.stopPropagation());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){video?.pause();command('pauseVideo');}});
 return {
  enter(){active=true;panel.classList.remove('hidden');if(!iframe&&!video)load(selected?.input||'https://www.youtube.com/watch?v=4euNaGauB5k',selected?.label||'Jazz-Off Detroit');},
  leave(){active=false;stage.classList.remove('screen-visible');panel.classList.add('hidden');stop();},
  setSound(enabled){sound=enabled;if(video)video.muted=!enabled;command(enabled?'unMute':'mute');},
 };
}
