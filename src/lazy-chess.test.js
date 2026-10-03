import test from 'node:test';
import assert from 'node:assert/strict';
import {attachLazyChess} from './lazy-chess.js';

function fixture(){const previous=globalThis.window;globalThis.window=new EventTarget();let resolve,calls=0,opens=0,latestInstance,latestFocus,latestRoom;const loaded=new Promise(r=>resolve=r);const ready={open(){opens++;},leave(){},setInstance(v,focus){latestInstance=v;latestFocus=focus;},setRoom(v){latestRoom=v;}};const proxy=attachLazyChess({}, {load:()=>{calls++;return loaded;}});return {proxy,finish(){resolve({attachChess:()=>ready});},get calls(){return calls;},get opens(){return opens;},get instance(){return latestInstance;},get focus(){return latestFocus;},get room(){return latestRoom;},restore(){globalThis.window=previous;}};}
test('a guest lobby defers chess and applies cached Unity and room state on first use',async()=>{
 const f=fixture();try{assert.equal(f.calls,0);const focus=()=>{};f.proxy.setInstance('unity',focus);f.proxy.setRoom('room');const opened=f.proxy.open();f.finish();await opened;assert.equal(f.calls,1);assert.equal(f.opens,1);assert.equal(f.instance,'unity');assert.equal(f.focus,focus);assert.equal(f.room,'room');await f.proxy.open();assert.equal(f.calls,1);}finally{f.restore();}
});
test('returning home while chess downloads prevents a late board from opening',async()=>{
 const f=fixture();try{const opened=f.proxy.open();f.proxy.leave();f.finish();await opened;assert.equal(f.opens,0);await f.proxy.open();assert.equal(f.opens,1);}finally{f.restore();}
});
test('a failed chess download can be retried',async()=>{
 const previous=globalThis.window;globalThis.window=new EventTarget();let calls=0,opens=0;try{const proxy=attachLazyChess({}, {load:async()=>{if(++calls===1)throw Error('Offline');return {attachChess:()=>({open(){opens++;}})};}});await proxy.open();assert.equal(opens,0);await proxy.open();assert.equal(opens,1);}finally{globalThis.window=previous;}
});
