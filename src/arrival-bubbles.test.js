import test from 'node:test';
import assert from 'node:assert/strict';
import {createArrivalBubbleTimers} from './arrival-bubbles.js';

function clock(){
 let time=0,visible=true,next=0;const tasks=new Map(),revealed=[];
 const controller=createArrivalBubbleTimers([
  {delay:15000,reveal:()=>revealed.push('portrait')},
  {delay:16000,reveal:()=>revealed.push('cinema')},
 ],{isVisible:()=>visible,now:()=>time,schedule:(callback,delay)=>{const id=++next;tasks.set(id,{at:time+delay,callback});return id;},cancel:id=>tasks.delete(id)});
 return {controller,revealed,visible(value){visible=value;controller.sync();},advance(ms){const end=time+ms;for(;;){const first=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0];if(!first||first[1].at>end)break;time=first[1].at;tasks.delete(first[0]);first[1].callback();}time=end;}};
}

test('portrait and cinema invitations appear at 15 and 16 seconds, independently',()=>{
 const f=clock();f.advance(14999);assert.deepEqual(f.revealed,[]);
 f.advance(1);assert.deepEqual(f.revealed,['portrait']);
 f.advance(999);assert.deepEqual(f.revealed,['portrait']);
 f.advance(1);assert.deepEqual(f.revealed,['portrait','cinema']);
});
test('time outside the lobby or in a hidden tab does not consume the invitation delay',()=>{
 const f=clock();f.advance(5000);f.visible(false);f.advance(60000);assert.deepEqual(f.revealed,[]);
 f.visible(true);f.advance(9999);assert.deepEqual(f.revealed,[]);
 f.advance(1);assert.deepEqual(f.revealed,['portrait']);f.advance(1000);assert.deepEqual(f.revealed,['portrait','cinema']);
});
test('returning to the lobby does not repeat already displayed invitations',()=>{
 const f=clock();f.advance(15000);f.visible(false);f.advance(10000);f.visible(true);f.advance(1000);
 assert.deepEqual(f.revealed,['portrait','cinema']);f.visible(false);f.visible(true);f.controller.sync();f.advance(60000);
 assert.deepEqual(f.revealed,['portrait','cinema']);
});
test('disposed invitations cannot pop up later',()=>{
 const f=clock();f.controller.dispose();f.controller.sync();f.advance(60000);assert.deepEqual(f.revealed,[]);
});
