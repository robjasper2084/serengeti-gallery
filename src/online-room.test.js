import test from 'node:test';
import assert from 'node:assert/strict';
import {GalleryRoom,validRoom,waitingPair} from './online-room.js';
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
const roomId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function fixture(){
 const topics=new Map();let failSend=false;
 class Channel{
  constructor(topic,config){this.topic=topic;this.config=config;this.handlers=[];this.active=false;}
  on(type,filter,fn){this.handlers.push({type,filter,fn});return this;}
  subscribe(fn){this.status=fn;queueMicrotask(()=>{this.active=true;topics.set(this.topic,[...(topics.get(this.topic)||[]),this]);fn('SUBSCRIBED');});return this;}
  sync(){for(const c of topics.get(this.topic)||[])for(const h of c.handlers)if(h.type==='presence'&&h.filter.event==='sync')h.fn();}
  async track(p){this.member=p;this.sync();return 'ok';}
  presenceState(){return Object.fromEntries((topics.get(this.topic)||[]).filter(c=>c.member).map(c=>[c.config.config.presence.key,[c.member]]));}
  async send(p){if(failSend)return 'error';for(const c of topics.get(this.topic)||[])if(c!==this)for(const h of c.handlers)if(h.type==='broadcast'&&h.filter.event===p.event)h.fn({payload:p.payload});return 'ok';}
 }
 const client={channel:(t,c)=>new Channel(t,c),async removeChannel(c){topics.set(c.topic,(topics.get(c.topic)||[]).filter(x=>x!==c));c.status?.('CLOSED');c.sync();}};
 const messages=[],saved=new Map(),make=(id=ids[0])=>new GalleryRoom({client,id,onChat:m=>messages.push(m),save:(r,s)=>saved.set(id+r,s),load:r=>saved.get(id+r)});
 return {make,messages,saved,client,fail(value){failSend=value;}};
}
test('two live seats validate turns, illegal moves, and duplicate requests',async()=>{
 const f=fixture(),host=f.make(),guest=f.make(ids[1]);try{
  await host.connect(roomId,true);assert.equal(host.canMove,false);await guest.connect(roomId,false);
  assert.equal(host.peer,guest.id);assert.equal(guest.color,'b');assert.equal(host.canMove,true);assert.equal(guest.canMove,false);
  assert.equal(await guest.move('e7','e5'),false);assert.equal(await host.move('e2','e5'),false);
  assert.equal(await host.move('e2','e4'),true);assert.equal(guest.game.fen(),host.game.fen());assert.equal(guest.canMove,true);
  const before=guest.game.fen();assert.equal(await guest.move('e7','e5'),true);assert.equal(host.version,2);assert.equal(guest.version,2);assert.equal(host.game.fen(),guest.game.fen());
  host.receive('move',{by:guest.id,from:'e7',to:'e5',version:1,fen:before});assert.equal(host.version,2);
 }finally{await host.leave();await guest.leave();}
});
test('a third visitor watches without taking either player seat',async()=>{
 const f=fixture(),host=f.make(),guest=f.make(ids[1]),spectator=f.make(ids[2]);try{
  await host.connect(roomId);await guest.connect(roomId,false);await spectator.connect(roomId,false);assert.equal(spectator.color,null);assert.equal(await spectator.move('e2','e4'),false);
  await host.move('f2','f3');await guest.move('e7','e5');await host.move('g2','g4');await guest.move('d8','h4');assert.equal(host.game.isCheckmate(),true);assert.equal(spectator.game.isCheckmate(),true);assert.equal(host.canMove,false);
 }finally{await host.leave();await guest.leave();await spectator.leave();}
});
test('opponent disconnection pauses play and refresh restores the same seats and game',async()=>{
 const f=fixture(),host=f.make(),guest=f.make(ids[1]);let replacement;try{
  await host.connect(roomId);await guest.connect(roomId,false);await host.move('e2','e4');await guest.leave();assert.equal(host.canMove,false);
  replacement=f.make(ids[1]);await replacement.connect(roomId,false);assert.equal(replacement.version,1);await replacement.move('e7','e5');assert.equal(host.version,2);
 }finally{await host.leave();await replacement?.leave();}
});
test('unconfirmed sends never advance a guest board; bad state and outsider packets are ignored',async()=>{
 const f=fixture(),host=f.make(),guest=f.make(ids[1]);try{
  await host.connect(roomId);await guest.connect(roomId,false);await host.move('e2','e4');f.fail(true);assert.equal(await guest.move('e7','e5'),false);assert.equal(guest.pending,false);assert.equal(guest.version,1);
  guest.receive('state',{by:ids[2],pgn:'1. e4 e5',version:2,peer:guest.id});assert.equal(guest.version,1);
  guest.receive('state',{by:host.id,pgn:'invalid',version:2,peer:guest.id});assert.equal(guest.version,1);
 }finally{f.fail(false);await host.leave();await guest.leave();}
});
test('chat is bounded, deduplicated, and rejects unknown senders',async()=>{
 const f=fixture(),host=f.make(),guest=f.make(ids[1]);try{
  await host.connect(roomId);await guest.connect(roomId,false);assert.equal(await host.chat('<b>Hello</b>'),true);assert.equal(f.messages.length,2);assert.equal(f.messages[0].text,'<b>Hello</b>');assert.equal(await host.chat('too fast'),false);
  guest.receive('chat',{by:ids[2],messageId:crypto.randomUUID(),text:'outside'});assert.equal(f.messages.length,2);
 }finally{await host.leave();await guest.leave();}
});
test('matchmaking joins the oldest waiting host, without matching a third visitor twice',async()=>{
 const f=fixture(),first=f.make(),second=f.make(ids[1]);let lastRenderedWaiting;first.onChange=room=>{lastRenderedWaiting=room.waiting;};try{
  await first.connect(roomId);await first.browse(true);await second.connect('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');await second.browse(true);
  for(let n=0;n<10;n++)await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(second.room,first.room);assert.equal(second.host,false);assert.equal(first.peer,second.id);assert.equal(first.waiting,false);assert.equal(lastRenderedWaiting,false);
 }finally{await first.leave();await second.leave();}
});
test('room links and matchmaking reject malformed identifiers',()=>{
 assert.equal(validRoom(roomId),true);assert.equal(validRoom('../../admin'),false);assert.equal(validRoom('foo'),false);
 assert.deepEqual(waitingPair([{id:ids[1],room:roomId,waiting:true,at:2},{id:ids[0],room:roomId,waiting:true,at:1},{id:ids[2],room:'bad',waiting:true,at:0}]).map(p=>p.id),[ids[0],ids[1]]);
});
