import test from 'node:test';
import assert from 'node:assert/strict';
import {createPortraitWelcome} from './portrait-welcome.js';
import {createCinemaTeaser} from './cinema-teaser.js';

// Exercise the real media controllers, including browser events and playback.
function browserFixture({reduced=false,savedMotion=null}={}) {
 const originals=new Map(),nodes=[];
 class Element extends EventTarget {
  constructor(tag='div',id=''){super();this.tagName=tag;this.id=id;this.style={};this.parts=new Map();this.open=false;this.hidden=false;this.paused=true;this.muted=true;this.currentTime=0;this.ended=false;
   const classes=new Set();this.classList={add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n),toggle:(n,on)=>{const next=on??!classes.has(n);next?classes.add(n):classes.delete(n);return next;}};nodes.push(this);}
  append(...children){for(const child of children)child.parent=this;}
  before(child){child.parent=this.parent;}
  setAttribute(name,value){this[name]=String(value);}
  getAttribute(name){return this[name]||null;}
  querySelector(selector){if(!this.parts.has(selector))this.parts.set(selector,new Element());return this.parts.get(selector);}
  getBoundingClientRect(){return {width:1536,height:1024};}
  load(){this.dispatchEvent(new Event('loadeddata'));}
  play(){const wasPaused=this.paused;this.paused=false;this.ended=false;if(wasPaused){this.dispatchEvent(new Event('play'));this.dispatchEvent(new Event('playing'));}return Promise.resolve();}
  pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));}}
  finish(){this.paused=true;this.ended=true;this.dispatchEvent(new Event('ended'));}
 }
 for(const id of ['arrival','atrium-image','portrait-stage','portrait-welcome','welcome-control','modal','loading'])new Element(id==='portrait-welcome'?'video':'div',id);
 nodes.find(n=>n.id==='loading').classList.add('hidden');
 const document=new EventTarget();document.body=new Element();document.hidden=false;
 document.querySelector=selector=>nodes.find(n=>n.id===selector.slice(1));document.createElement=tag=>new Element(tag);
 const window=new EventTarget(),motion=new EventTarget();motion.matches=reduced;
 const storage=new Map(savedMotion===null?[]:[['serengeti-reduced-motion',JSON.stringify(savedMotion)]]);
 const install=(key,value)=>{originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
 install('document',document);install('window',window);install('matchMedia',()=>motion);
 install('localStorage',{getItem:key=>storage.get(key)??null});install('getComputedStyle',()=>({objectPosition:'50% 50%'}));
 install('ResizeObserver',class{observe(){}});install('MutationObserver',class{observe(){}});
 return {document,window,motion,get:id=>nodes.find(n=>n.id===id),reduce(value){storage.set('serengeti-reduced-motion',JSON.stringify(value));window.dispatchEvent(new CustomEvent('serengeti-motion',{detail:value}));},restore(){for(const [key,descriptor]of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}};
}

test('portrait starts moving muted, loops, and preserves an explicit pause after a visibility change',()=>{
 const f=browserFixture();try{
  createPortraitWelcome();const video=f.get('portrait-welcome');
  assert.equal(video.paused,false);assert.equal(video.muted,true);assert.equal(video.loop,true);assert.ok(video.src.endsWith('/portrait-welcome.mp4'));
  f.get('portrait-motion-control').onclick();assert.equal(video.paused,true);
  f.document.hidden=true;f.document.dispatchEvent(new Event('visibilitychange'));
  f.document.hidden=false;f.document.dispatchEvent(new Event('visibilitychange'));assert.equal(video.paused,true);
  f.get('portrait-motion-control').onclick();assert.equal(video.paused,false);assert.equal(video.muted,true);
 }finally{f.restore();}
});

test('narration requests global sound, supports pause/resume, and returns to silent motion after completion',()=>{
 const f=browserFixture();try{
  const soundRequests=[];let completed=0;f.window.addEventListener('serengeti-audio-request',e=>soundRequests.push(e.detail));f.window.addEventListener('serengeti-portrait-complete',()=>completed++);
  const portrait=createPortraitWelcome(),video=f.get('portrait-welcome'),button=f.get('welcome-control');
  button.onclick();assert.deepEqual(soundRequests,[true]);assert.equal(video.muted,false);assert.equal(video.loop,false);
  button.onclick();assert.equal(video.paused,true);assert.equal(button.getAttribute('aria-label'),'Resume the portrait welcome');
  button.onclick();assert.equal(video.paused,false);
  video.finish();assert.equal(completed,1);assert.equal(video.paused,false);assert.equal(video.loop,true);assert.equal(video.muted,true);assert.equal(f.get('portrait-stage').classList.contains('ready'),true);
  button.onclick();portrait.setSound(false);assert.equal(video.muted,true);assert.equal(video.loop,true);
  portrait.setSound(true);assert.equal(video.muted,true,'enabling sound alone must not start narration');
 }finally{f.restore();}
});

for(const preference of [{reduced:true},{savedMotion:true}])test(`both previews defer loading for ${JSON.stringify(preference)} but allow explicit play`,()=>{
 const f=browserFixture(preference);try{
  createPortraitWelcome();createCinemaTeaser({enterCinema(){}});
  const portrait=f.get('portrait-welcome'),teaser=f.get('cinema-teaser');
  assert.equal(portrait.src,undefined);assert.equal(teaser.src,undefined);assert.equal(teaser.autoplay,false);
  f.get('welcome-control').onclick();assert.equal(portrait.paused,false);
  const panel=f.get('cinema-teaser-controls');panel.querySelector('#teaser-play').onclick();assert.equal(teaser.paused,false);
 }finally{f.restore();}
});

test('changing motion preference pauses both previews and restores only automatically playing previews',()=>{
 const f=browserFixture();try{
  createPortraitWelcome();createCinemaTeaser({enterCinema(){}});
  const portrait=f.get('portrait-welcome'),teaser=f.get('cinema-teaser');
  f.reduce(true);assert.equal(portrait.paused,true);assert.equal(teaser.paused,true);
  f.reduce(false);assert.equal(portrait.paused,false);assert.equal(teaser.paused,false);
  f.get('portrait-motion-control').onclick();f.get('cinema-teaser-controls').querySelector('#teaser-play').onclick();
  f.reduce(true);f.reduce(false);assert.equal(portrait.paused,true);assert.equal(teaser.paused,true);
 }finally{f.restore();}
});
