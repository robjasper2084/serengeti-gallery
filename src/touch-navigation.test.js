import test from 'node:test';import assert from 'node:assert/strict';import {joystickVector,attachTouchNavigation} from './touch-navigation.js';
test('floating joystick clamps diagonals and applies a center dead zone',()=>{assert.deepEqual(joystickVector(0,0),{x:0,y:0,px:0,py:0});const v=joystickVector(200,-200);assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<.0001);assert.ok(v.x>0&&v.y>0);assert.equal(joystickVector(2,1).x,0);assert.equal(joystickVector(0,54).y,-1);});

function touchFixture(){
 const originals=new Map(),observers=[];
 class Element extends EventTarget{
  constructor(){super();this.style={};this.parts=new Map();this.captures=new Set();this.classes=new Set();this.classList={add:n=>this.classes.add(n),remove:n=>this.classes.delete(n),contains:n=>this.classes.has(n)};}
  setAttribute(){} append(child){this.child=child;} focus(){}
  querySelector(s){if(!this.parts.has(s))this.parts.set(s,new Element());return this.parts.get(s);}
  getBoundingClientRect(){return{left:0,top:0};}
  setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}
 }
 const window=new EventTarget(),document=new EventTarget(),canvas=new Element(),modal=new Element();
 document.body=new Element();document.body.classes.add('exploring');document.querySelector=()=>modal;document.createElement=()=>new Element();
 for(const [key,value]of Object.entries({window,document,MutationObserver:class{constructor(callback){this.callback=callback;}observe(target){observers.push({target,callback:this.callback});}}})){
  originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,value});
 }
 const calls=[];attachTouchNavigation({canvas,send:(...args)=>calls.push(args),resume(){}});
 const pointer=(target,type,id,x,y)=>target.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerId:id,pointerType:'touch',clientX:x,clientY:y}));
 return{window,document,canvas,zone:document.body.child,modal,calls,pointer,openActivities(name='activities-open'){document.body.classes.add(name);observers.find(o=>o.target===document.body).callback();},openModal(){modal.open=true;observers.find(o=>o.target===modal).callback();},restore(){for(const [key,value]of originals)value?Object.defineProperty(globalThis,key,value):delete globalThis[key];}};
}

for(const event of ['orientationchange','resize'])test(`${event} releases movement and look pointers without retaining a held direction`,()=>{
 const f=touchFixture();try{
  f.pointer(f.zone,'pointerdown',1,20,20);f.pointer(f.zone,'pointermove',1,60,20);
  f.pointer(f.canvas,'pointerdown',2,200,200);f.pointer(f.canvas,'pointermove',2,210,205);
  assert.deepEqual(f.calls.at(-1),['LookTouch','10,5']);
  f.window.dispatchEvent(new Event(event));
  assert.equal(f.zone.captures.size,0);assert.equal(f.canvas.captures.size,0);assert.deepEqual(f.calls.at(-1),['SetJoystick','0,0']);
  const count=f.calls.length;f.pointer(f.zone,'pointermove',1,90,20);f.pointer(f.canvas,'pointermove',2,240,200);assert.equal(f.calls.length,count);
  f.pointer(f.zone,'pointerdown',3,10,10);f.pointer(f.zone,'pointermove',3,10,-44);assert.deepEqual(f.calls.at(-1),['SetJoystick','0.000,1.000']);
 }finally{f.restore();}
});

test('opening artwork details cancels a held joystick and touch look',()=>{
 const f=touchFixture();try{
  f.pointer(f.zone,'pointerdown',1,10,10);f.pointer(f.zone,'pointermove',1,10,-44);f.pointer(f.canvas,'pointerdown',2,40,40);
  f.openModal();assert.deepEqual(f.calls.at(-1),['SetJoystick','0,0']);assert.equal(f.zone.captures.size,0);assert.equal(f.canvas.captures.size,0);
 }finally{f.restore();}
});

for(const mode of ['activities-open','together-open'])test(`opening ${mode} releases held movement and camera pointers`,()=>{
 const f=touchFixture();try{
  f.pointer(f.zone,'pointerdown',1,10,10);f.pointer(f.zone,'pointermove',1,10,-44);f.pointer(f.canvas,'pointerdown',2,40,40);
  f.openActivities(mode);assert.deepEqual(f.calls.at(-1),['SetJoystick','0,0']);assert.equal(f.zone.captures.size,0);assert.equal(f.canvas.captures.size,0);
 }finally{f.restore();}
});
