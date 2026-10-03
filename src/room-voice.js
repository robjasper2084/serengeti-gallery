export class RoomVoice {
 constructor({room,onStatus=()=>{},media=navigator.mediaDevices,Peer=globalThis.RTCPeerConnection,makeAudio=()=>document.createElement('audio'),iceServers=[{urls:'stun:stun.l.google.com:19302'}]}){
  Object.assign(this,{room,onStatus,media,Peer,makeAudio,iceServers});this.peers=new Map();this.stream=null;this.muted=false;this.starting=false;this.epoch=0;
 }
 status(message){this.onStatus(message);}
 async start(){
  if(this.stream||this.starting)return;this.starting=true;const epoch=++this.epoch;
  try{
   if(!this.room.connected)throw Error('Join a room before turning on voice.');
   if(!this.Peer||!this.media?.getUserMedia)throw Error('Voice needs a supported browser and HTTPS. Text chat is available.');
   const stream=await this.media.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
   if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;this.muted=false;await this.room.update({voice:true});this.sync();
  }catch(error){this.status(error.name==='NotAllowedError'?'Microphone permission was not granted. You can use text chat.':error.name==='NotFoundError'?'No microphone found. You can use text chat.':error.message);}finally{this.starting=false;}
 }
 mute(){if(!this.stream)return;this.muted=!this.muted;this.stream.getAudioTracks().forEach(t=>t.enabled=!this.muted);this.summary();}
 summary(){const live=[...this.peers.values()].filter(p=>p.pc.connectionState==='connected').length;this.status(!this.stream?'Voice off':this.muted?'Microphone muted':live?`Voice connected · ${live} ${live===1?'person':'people'}`:'Microphone on · waiting for a voice connection');}
 sync(){
  const members=this.room.members.filter(p=>p.id!==this.room.id&&p.voice).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,3);
  for(const [id]of this.peers)if(!this.room.connected||!members.some(p=>p.id===id))this.drop(id);
  if(this.stream&&this.room.connected)for(const p of members)if(this.room.id<p.id&&!this.peers.has(p.id))this.offer(p.id);
  this.summary();
 }
 create(id){
  if(this.peers.has(id))return this.peers.get(id);
  const pc=new this.Peer({iceServers:this.iceServers}),audio=this.makeAudio();audio.autoplay=true;audio.playsInline=true;
  const peer={pc,audio,candidates:[],queue:Promise.resolve()};this.peers.set(id,peer);
  this.stream?.getTracks().forEach(track=>pc.addTrack(track,this.stream));
  pc.onicecandidate=event=>{if(event.candidate)this.room.signal(id,'candidate',{candidate:event.candidate.toJSON()});};
  pc.ontrack=event=>{audio.srcObject=event.streams[0];audio.play()?.catch(()=>this.status('Tap Enable speakers to hear the room.'));};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')this.status('Voice could not connect on this network. Try voice again or use text.');else this.summary();};
  return peer;
 }
 async offer(id){
  const peer=this.create(id);
  try{await peer.pc.setLocalDescription(await peer.pc.createOffer());await this.room.signal(id,'offer',{description:peer.pc.localDescription.toJSON()});}catch{this.drop(id);this.status('Voice connection failed. Turn voice off and retry.');}
 }
 receive(message){
  if(message.kind==='bye'){this.drop(message.by);this.summary();return;}
  if(!this.stream||!this.room.connected||!this.room.members.some(p=>p.id===message.by&&p.voice))return;
  if(!this.peers.has(message.by)&&message.kind!=='offer'&&message.kind!=='candidate')return;
  const peer=this.create(message.by);
  // Serialize SDP and ICE so a candidate cannot overtake setRemoteDescription.
  peer.queue=peer.queue.then(async()=>{
   if(message.kind==='candidate'){
    if(!message.candidate||JSON.stringify(message.candidate).length>4096)return;
    if(peer.pc.remoteDescription)await peer.pc.addIceCandidate(message.candidate);else if(peer.candidates.length<80)peer.candidates.push(message.candidate);
   }else if(['offer','answer'].includes(message.kind)){
    const description=message.description;if(description?.type!==message.kind||typeof description.sdp!=='string'||description.sdp.length>30000)return;
    if(message.kind==='offer'&&this.room.id<message.by)return;
    if(message.kind==='answer'&&peer.pc.signalingState!=='have-local-offer')return;
    await peer.pc.setRemoteDescription(description);
    for(const candidate of peer.candidates.splice(0))await peer.pc.addIceCandidate(candidate);
    if(message.kind==='offer'){await peer.pc.setLocalDescription(await peer.pc.createAnswer());await this.room.signal(message.by,'answer',{description:peer.pc.localDescription.toJSON()});}
   }
  }).catch(()=>this.status('Voice could not connect. Turn voice off and retry.'));
 }
 speakers(){for(const p of this.peers.values())p.audio.play()?.catch(()=>this.status('Your browser blocked audio. Tap Enable speakers again.'));}
 drop(id){const peer=this.peers.get(id);if(!peer)return;this.peers.delete(id);peer.pc.onconnectionstatechange=null;peer.pc.onicecandidate=null;peer.pc.close();peer.audio.pause();peer.audio.srcObject=null;peer.audio.remove();}
 async stop(){
  ++this.epoch;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.muted=false;
  for(const [id]of this.peers){this.room.signal(id,'bye',{});this.drop(id);}
  await this.room.update({voice:false});this.summary();
 }
}
