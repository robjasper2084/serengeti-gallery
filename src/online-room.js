import {Chess} from 'chess.js';

export const validRoom = value => typeof value === 'string' && /^[a-f0-9-]{36}$/.test(value) && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value);
export const cleanName = value => String(value || 'Visitor').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 24) || 'Visitor';
 export const waitingPair = entries => entries.filter(p => p.waiting && validRoom(p.room) && validRoom(p.id) && Number.isFinite(p.at)).sort((a,b) => a.at-b.at || a.id.localeCompare(b.id)).slice(0,2);

// Casual guest rooms use opaque invite IDs and Realtime; no account or personal data is required.
// The host validates every chess move. These are friendly games, without ranked results.
export class GalleryRoom {
 constructor({client,id=crypto.randomUUID(),name='Visitor',onChange=()=>{},onChat=()=>{},onSignal=()=>{},onVisitors=()=>{},save=()=>{},load=()=>null}) {
  Object.assign(this,{client,id,name:cleanName(name),onChange,onChat,onSignal,onVisitors,save,load});
  this.game=new Chess();this.members=[];this.visitors=[];this.connected=false;this.pending=false;this.version=0;this.host=false;this.peer='';this.hostId='';this.room='';this.notice='';this.activity='Lobby';this.voice=false;this.closed=false;this.seen=new Set();this.rates=new Map();
 }
 changed(){this.onChange(this);}
 get color(){return this.host?'w':this.peer===this.id?'b':null;}
 get canMove(){return this.connected && !!this.color && this.members.some(p=>p.id===(this.host?this.peer:this.hostId)) && !this.pending && !this.game.isGameOver() && this.game.turn()===this.color;}
 async connect(room=crypto.randomUUID(),host=true){
  if(!validRoom(room))throw Error('This invite link is not valid.');
  await this.disconnect();this.closed=false;this.room=room;this.host=host;this.hostId=host?this.id:'';this.peer='';this.members=[];this.game=new Chess();this.version=0;this.notice='Connecting…';this.changed();
  const saved=this.load(room);if(saved?.host===host){try{this.game.loadPgn(saved.pgn);this.version=this.game.history().length;this.peer=saved.peer||'';this.hostId=host?this.id:saved.hostId||'';}catch{this.game.reset();}}
  const generation=++this.generation;
  const channel=this.client.channel('serengeti-visit-'+room,{config:{broadcast:{ack:true,self:false},presence:{key:this.id}}});this.channel=channel;
  channel.on('presence',{event:'sync'},()=>this.presence());
  for(const event of ['hello','state','move','chat','signal'])channel.on('broadcast',{event},({payload})=>this.receive(event,payload));
  await new Promise((resolve,reject)=>{
   let settled=false;const timeout=setTimeout(()=>{if(!settled){settled=true;reject(Error('Connection timed out. Try again.'));}},12000);
   channel.subscribe(async status=>{
    if(generation!==this.generation)return;
    if(status==='SUBSCRIBED'){
     this.connected=true;this.notice='Connected';
     try{const result=await channel.track(this.member());if(result!=='ok')throw Error('Could not join the room.');clearTimeout(timeout);if(!settled){settled=true;resolve();}this.changed();await this.send('hello',{});}catch(error){if(!settled){settled=true;clearTimeout(timeout);reject(error);}this.notice=error.message;this.changed();}
    }else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){
     this.connected=false;this.pending=false;this.notice=status==='CLOSED'?'Disconnected':'Connection lost — reconnecting…';this.changed();
    }
   });
  }).catch(async error=>{await this.disconnect();this.notice=error.message;this.changed();throw error;});
 }
 generation=0;
 member(){return {id:this.id,name:this.name,host:this.host,activity:this.activity,voice:this.voice,at:this.joinedAt??=Date.now()};}
 async update({name=this.name,activity=this.activity,voice=this.voice}={}){
  this.name=cleanName(name);this.activity=activity;this.voice=!!voice;
  if(this.connected)await this.channel.track(this.member());
  if(this.lobby)await this.lobby.track(this.listing());this.changed();
 }
 presence(){
  if(!this.channel)return;
  this.members=Object.values(this.channel.presenceState()).flat().filter(p=>validRoom(p.id)).map(p=>({...p,name:cleanName(p.name)}));
  const hosts=this.members.filter(p=>p.host).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
  if(!this.host&&hosts[0])this.hostId=hosts[0].id;
  if(this.host&&!this.peer){const guest=this.members.filter(p=>p.id!==this.id&&!p.host).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id))[0];if(guest)this.peer=guest.id;}
  if(this.host&&this.peer&&this.waiting){this.waiting=false;this.lobby?.track(this.listing());}
  this.persist();this.changed();
  if(this.host)this.publish();
  else this.send('hello',{});
 }
 async send(event,payload){
  if(!this.connected||!this.channel)return false;
  try{const result=await this.channel.send({type:'broadcast',event,payload:{...payload,by:this.id}});if(result!=='ok')throw Error('Message was not delivered.');return true;}catch{this.notice='Could not send. Check your connection and try again.';this.changed();return false;}
 }
 publish(){return this.send('state',{pgn:this.game.pgn(),version:this.version,peer:this.peer});}
 persist(){if(this.room)this.save(this.room,{host:this.host,pgn:this.game.pgn(),peer:this.peer,hostId:this.hostId});}
 allowed(sender,event){
  if(!this.members.some(p=>p.id===sender))return false;
  const key=sender+':'+event,now=Date.now(),last=this.rates.get(key)||0;
  if(event==='chat'&&now-last<400)return false;
  this.rates.set(key,now);return true;
 }
 receive(event,p){
  if(!p||p.by===this.id||!this.allowed(p.by,event))return;
  if(event==='hello'&&this.host){this.publish();return;}
  if(event==='state'&&!this.host&&p.by===this.hostId){
   if(typeof p.pgn!=='string'||p.pgn.length>100000||!Number.isSafeInteger(p.version)||p.version<this.version||!validRoom(p.peer))return;
   try{const game=new Chess();game.loadPgn(p.pgn);if(game.history().length!==p.version)return;this.game=game;this.version=p.version;this.peer=p.peer;this.pending=false;clearTimeout(this.pendingTimer);this.persist();this.changed();}catch{}return;
  }
  if(event==='move'&&this.host){
   if(p.by!==this.peer||this.game.turn()!=='b'||p.version!==this.version||p.fen!==this.game.fen()||!this.canMoveForGuest())return;
   this.apply(p);return;
  }
  if(event==='chat'&&validRoom(p.messageId)&&typeof p.text==='string'&&p.text.trim()&&p.text.length<=500&&!this.seen.has(p.messageId)){
   this.remember(p.messageId);this.onChat({id:p.messageId,by:p.by,name:this.members.find(m=>m.id===p.by)?.name||'Visitor',text:p.text});return;
  }
  if(event==='signal'&&p.to===this.id&&typeof p.kind==='string'&&['offer','answer','candidate','bye'].includes(p.kind))this.onSignal(p);
 }
 canMoveForGuest(){return this.connected&&!this.game.isGameOver()&&this.members.some(m=>m.id===this.peer);}
 apply(move){
  if(!/^[a-h][1-8]$/.test(move.from)||!/^[a-h][1-8]$/.test(move.to))return false;
  try{this.game.move({from:move.from,to:move.to,promotion:'q'});this.version++;this.persist();this.changed();this.publish();return true;}catch{return false;}
 }
 async move(from,to){
  if(!this.canMove)return false;
  try{const check=new Chess(this.game.fen());check.move({from,to,promotion:'q'});}catch{return false;}
  if(this.host)return this.apply({from,to});
  this.pending=true;this.changed();
  const sent=await this.send('move',{from,to,version:this.version,fen:this.game.fen()});
  if(!sent){this.pending=false;this.changed();return false;}
  clearTimeout(this.pendingTimer);this.pendingTimer=setTimeout(()=>{this.pending=false;this.notice='Move not confirmed. Reconnecting the board…';this.send('hello',{});this.changed();},5000);return true;
 }
 remember(id){this.seen.add(id);if(this.seen.size>200)this.seen.delete(this.seen.values().next().value);}
 async chat(text){
  text=String(text).trim().slice(0,500);if(!text||!this.connected)return false;
  if(Date.now()-(this.lastChat||0)<500)return false;this.lastChat=Date.now();
  const id=crypto.randomUUID();const sent=await this.send('chat',{messageId:id,text});
  if(sent){this.remember(id);this.onChat({id,by:this.id,name:this.name,text});}return sent;
 }
 signal(to,kind,data){return this.send('signal',{to,kind,...data});}
 listing(){return {id:this.id,name:this.name,room:this.room,activity:this.activity,waiting:!!this.waiting,at:this.searchAt||Date.now()};}
 async browse(waiting=false){
  if(!this.room||!this.host)await this.connect();this.waiting=waiting;this.searchAt=Date.now();
  if(this.lobby){await this.lobby.track(this.listing());return;}
  const channel=this.client.channel('serengeti-visitors-v1',{config:{presence:{key:this.id}}});this.lobby=channel;
  channel.on('presence',{event:'sync'},()=>{
   this.visitors=Object.values(channel.presenceState()).flat().filter(p=>validRoom(p.id)&&validRoom(p.room));this.onVisitors(this.visitors);
   const pair=waitingPair(this.visitors);
   if(this.waiting&&!this.matching&&pair.length===2&&pair[1].id===this.id){this.matching=true;this.waiting=false;const target=pair[0].room;this.stopBrowsing().then(()=>this.connect(target,false)).catch(error=>{this.notice=error.message;this.changed();}).finally(()=>this.matching=false);}
  });
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Visitor list could not connect.')),12000);channel.subscribe(async status=>{if(status==='SUBSCRIBED'){clearTimeout(timeout);const result=await channel.track(this.listing());result==='ok'?resolve():reject(Error('Visitor list unavailable.'));}else if(status==='CHANNEL_ERROR'){clearTimeout(timeout);reject(Error('Visitor list unavailable.'));}});}).catch(async error=>{await this.stopBrowsing();throw error;});
 }
 async stopBrowsing(){const channel=this.lobby;this.lobby=null;this.waiting=false;if(channel)await this.client.removeChannel(channel);this.visitors=[];this.onVisitors([]);}
 async disconnect(){
  ++this.generation;clearTimeout(this.pendingTimer);this.pending=false;this.connected=false;
  const channel=this.channel;this.channel=null;if(channel)await this.client.removeChannel(channel);this.members=[];this.changed();
 }
 async leave(){await this.stopBrowsing();await this.disconnect();this.room='';this.peer='';this.hostId='';this.closed=true;this.changed();}
}
