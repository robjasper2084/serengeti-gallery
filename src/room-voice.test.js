import test from 'node:test';
import assert from 'node:assert/strict';
import {RoomVoice} from './room-voice.js';
function fixture(){
 const track={enabled:true,stopped:false,stop(){this.stopped=true;}};const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};const signals=[];
 const room={id:'b',connected:true,members:[{id:'a',voice:true}],async update(p){Object.assign(this,p);},async signal(...args){signals.push(args);}};
 class Peer{
  constructor(){this.connectionState='new';this.signalingState='stable';this.candidates=[];}
  addTrack(){}async setRemoteDescription(d){this.remoteDescription=d;}async addIceCandidate(c){assert.ok(this.remoteDescription);this.candidates.push(c);}async createAnswer(){return {type:'answer',sdp:'answer'};}async setLocalDescription(d){this.localDescription={...d,toJSON:()=>d};}close(){this.closed=true;}
 }
 const voice=new RoomVoice({room,Peer,media:{getUserMedia:async()=>stream},makeAudio:()=>({play:async()=>{},pause(){},remove(){}})});return {track,voice,room,signals};
}
test('voice starts only after a request, supports mic mute, and releases tracks when leaving',async()=>{
 const f=fixture();assert.equal(f.voice.stream,null);assert.equal(f.track.stopped,false);await f.voice.start();assert.equal(f.room.voice,true);f.voice.mute();assert.equal(f.track.enabled,false);f.voice.mute();assert.equal(f.track.enabled,true);await f.voice.stop();assert.equal(f.track.stopped,true);assert.equal(f.room.voice,false);assert.equal(f.voice.peers.size,0);
});
test('early ICE waits for an offer; signalling is addressed only to opted-in members',async()=>{
 const f=fixture();await f.voice.start();f.voice.receive({by:'a',kind:'candidate',candidate:{candidate:'ICE'}});f.voice.receive({by:'a',kind:'offer',description:{type:'offer',sdp:'offer'}});await f.voice.peers.get('a').queue;assert.equal(f.voice.peers.get('a').pc.candidates.length,1);assert.equal(f.signals[0][1],'answer');f.voice.receive({by:'outsider',kind:'offer',description:{type:'offer',sdp:'offer'}});assert.equal(f.voice.peers.has('outsider'),false);await f.voice.stop();
});
test('denied microphone permission leaves text room connected and voice off',async()=>{
 const f=fixture();let status;f.voice.onStatus=m=>status=m;f.voice.media={getUserMedia:async()=>{const e=Error();e.name='NotAllowedError';throw e;}};await f.voice.start();assert.match(status,/not granted/);assert.equal(f.voice.stream,null);assert.equal(f.room.connected,true);
});
test('leaving while a microphone request is pending stops the eventual stream',async()=>{
 const f=fixture();let resolve;f.voice.media={getUserMedia:()=>new Promise(r=>resolve=r)};const pending=f.voice.start();await f.voice.stop();resolve({getTracks:()=>[f.track],getAudioTracks:()=>[f.track]});await pending;assert.equal(f.track.stopped,true);assert.equal(f.voice.stream,null);
});
