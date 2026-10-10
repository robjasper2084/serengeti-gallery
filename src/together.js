import {validRoom,cleanName} from './room-identity.js';
import {readSaved,writeSaved} from './visitor-settings.js';

export function attachTogether({chess,pause=()=>{},resume=()=>{},toast=()=>{}}){
 const launch=document.createElement('button');launch.id='together-launch';launch.className='icon-button';launch.setAttribute('aria-label','Friends, live chess and chat');launch.setAttribute('aria-controls','together-panel');launch.setAttribute('aria-expanded','false');launch.innerHTML='<i class="ph-light ph-chats" aria-hidden="true"></i><span class="friend-label">Friends</span><span class="friend-online" aria-hidden="true"></span><span class="friend-count" aria-label="Unread messages"></span>';document.querySelector('#menu-nav').before(launch);
 const panel=document.createElement('aside');panel.id='together-panel';panel.hidden=true;panel.setAttribute('aria-label','Friends and chat');
 panel.innerHTML=`<div class="together-heading"><div><small>VISIT TOGETHER</small><h2>Friends & chess</h2></div><button id="together-close" aria-label="Close friends and chat">✕</button></div><p id="room-status" role="status">Invite a friend or meet visitors who are here.</p><label for="visitor-name">Your nickname</label><input id="visitor-name" maxlength="24" autocomplete="off" placeholder="Visitor"><div class="together-actions"><button id="create-room">Invite friends</button><button id="meet-visitors">Meet visitors</button><button id="find-opponent">Find chess opponent</button><button id="open-online-board">Open chess board</button></div><div id="room-invite" hidden><label for="invite-link">Invite link</label><div class="invite-copy"><input id="invite-link" readonly><button id="copy-invite">Copy</button></div><small>Anyone with this link can join. Up to 4 microphones at a time. Chats last for this visit.</small></div><ul id="room-members" aria-label="People in your room"></ul><div id="visitor-list" aria-label="Available visitors"></div><div id="room-communication" hidden><div class="voice-actions"><button id="voice-start">Turn on microphone</button><button id="voice-mute" hidden>Mute mic</button><button id="voice-stop" hidden>Voice off</button><button id="voice-speakers">Enable speakers</button></div><p id="voice-status" role="status">Voice off</p><div id="room-messages" role="log" aria-live="polite" aria-label="Room chat"></div><form id="room-chat-form"><label for="chat-message">Message your room</label><div class="chat-send"><input id="chat-message" maxlength="500" placeholder="Say hello…" autocomplete="off"><button type="submit">Send</button></div></form><button id="leave-room">Leave shared room</button></div>`;document.body.append(panel);
 const presence=document.createElement('p');presence.className='visitor-presence';presence.id='visitor-presence';presence.setAttribute('role','status');presence.textContent='See who is online with Meet visitors. Only visitors sharing a room appear.';panel.querySelector('#room-status').after(presence);
 const $=s=>panel.querySelector(s);let room=null,voice=null,promise=null,busy=false,unread=0,returnFocus=null,renderedRoom='';
 launch.setAttribute('aria-label','Friends, voice chat and chess');panel.setAttribute('aria-label','Friends, voice and text chat');$('.together-heading h2').textContent='Friends & voice chat';
 const voiceInvite=document.createElement('button');voiceInvite.id='start-voice-room';voiceInvite.textContent='Start voice chat';$('.together-actions').prepend(voiceInvite);
 const voiceHelp=document.createElement('p');voiceHelp.className='voice-room-help';voiceHelp.textContent='Talk with up to 4 visitors. Start a voice room, allow your microphone, then share the invite link.';$('.together-actions').after(voiceHelp);
 const voiceHeading=document.createElement('h3');voiceHeading.className='voice-room-heading';voiceHeading.textContent='Voice chat';$('#room-communication').prepend(voiceHeading);$('#voice-status').setAttribute('aria-live','polite');
 $('#visitor-name').value=cleanName(readSaved('serengeti-visitor-name','Visitor'));
 const drawer=matchMedia('(max-width:1100px)');
 const modal=document.querySelector('#modal');
 const visible=element=>element?.isConnected&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden';
 function isDialog(){return drawer.matches||modal.open;}
 function syncAccess(){const dialog=!panel.hidden&&isDialog();panel.setAttribute('role',dialog?'dialog':'complementary');if(dialog)panel.setAttribute('aria-modal','true');else panel.removeAttribute('aria-modal');}
 drawer.addEventListener('change',syncAccess);
 function open(){if(panel.hidden)returnFocus=document.activeElement;panel.hidden=false;document.body.classList.add('together-open');launch.setAttribute('aria-expanded','true');syncAccess();pause();unread=0;launch.querySelector('.friend-count').textContent='';$('#together-close').focus();}
 function close(){panel.hidden=true;document.body.classList.remove('together-open');launch.setAttribute('aria-expanded','false');syncAccess();[returnFocus,launch,document.querySelector('#chess-controls')].find(visible)?.focus();resume();}
 launch.onclick=()=>panel.hidden?open():close();$('#together-close').onclick=close;
 panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'&&isDialog()){const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter(visible);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});panel.addEventListener('pointerdown',e=>e.stopPropagation());
 // Keep chat reachable while artwork or the lightweight film is in the top-layer dialog.
 const modalChat=document.createElement('button');modalChat.className='modal-friends';modalChat.textContent='Friends & chat';modalChat.onclick=open;modal.append(modalChat);
 new MutationObserver(()=>{if(modal.open){if(panel.parentElement!==modal)modal.append(panel);}else if(panel.parentElement===modal)document.body.append(panel);syncAccess();}).observe(modal,{attributes:true,attributeFilter:['open']});
 function status(message){$('#room-status').textContent=message;}
 function render(){
  chess.setRoom(room);voice?.sync();if(!room)return;
  if(room.room!==renderedRoom){renderedRoom=room.room;$('#room-messages').replaceChildren();}
  $('#room-status').textContent=!room.room?'Invite a friend or meet visitors who are here.':room.connected?(room.waiting?'Finding a chess opponent…':`Connected · ${room.members.length||1} in your room`):room.notice||'Room disconnected';
  $('#room-invite').hidden=!room.room;$('#room-communication').hidden=!room.room;
  $('#room-chat-form button').disabled=!room.connected;
  const link=new URL(location.href);link.search='';link.hash='';link.searchParams.set('room',room.room);$('#invite-link').value=link.href;
  if(room.connected&&room.room){const current=new URL(location.href);if(current.searchParams.get('room')!==room.room){current.searchParams.set('room',room.room);history.replaceState(null,'',current);}}
  $('#room-members').replaceChildren(...room.members.map(p=>{const li=document.createElement('li');li.textContent=p.name+(p.id===room.id?' (you)':'')+' · '+p.activity+(p.voice?' · mic on':'');return li;}));
  $('#find-opponent').textContent=room.waiting?'Searching… (cancel)':'Find chess opponent';
 }
 function visitors(entries){
  const count=new Set(entries.map(p=>p.id)).size;
  launch.querySelector('.friend-online').textContent=room?.lobby?String(count):'';
  presence.textContent=room?.lobby?`${count} ${count===1?'visitor':'visitors'} online in shared rooms · including you`:'See who is online with Meet visitors. Only visitors sharing a room appear.';
  const list=$('#visitor-list');list.replaceChildren();const others=entries.filter(p=>p.id!==room?.id&&p.room!==room?.room).slice(0,30);
  if(room?.lobby){const title=document.createElement('p');title.textContent=others.length?'Visitors open to company':'No other visitors yet. Share your invite link or keep this open.';list.append(title);}
  for(const p of others){const button=document.createElement('button');button.textContent='Join '+cleanName(p.name)+' · '+String(p.activity||'Lobby').slice(0,24);button.onclick=()=>run(async()=>{await voice?.stop();await room.stopBrowsing();await room.connect(p.room,false);open();});list.append(button);}
 }
 function chat(message){
  const log=$('#room-messages'),entry=document.createElement('p'),name=document.createElement('strong'),text=document.createElement('span');name.textContent=message.name+(message.by===room?.id?' (you)':'');text.textContent=message.text;entry.append(name,text);log.append(entry);while(log.children.length>100)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;
  if(panel.hidden&&message.by!==room?.id){unread++;launch.querySelector('.friend-count').textContent=String(Math.min(unread,99));}
 }
 async function ensure(){
  if(room)return room;
  if(!promise)promise=(async()=>{
   const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
   if(!url||!key)throw Error('Live rooms are not configured. Local chess is available.');
   const [{createClient},{GalleryRoom},{RoomVoice}]=await Promise.all([import('@supabase/supabase-js'),import('./online-room.js'),import('./room-voice.js')]);const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'serengeti-live-guest'}});
   let id=readSaved('serengeti-live-id',null,sessionStorage);if(!validRoom(id)){id=crypto.randomUUID();writeSaved('serengeti-live-id',id,sessionStorage);}
   room=new GalleryRoom({client,id,name:$('#visitor-name').value,onChange:render,onChat:chat,onSignal:p=>voice?.receive(p),onVisitors:visitors,save:(r,s)=>writeSaved('serengeti-room-'+r,s,sessionStorage),load:r=>readSaved('serengeti-room-'+r,null,sessionStorage)});
   voice=new RoomVoice({room,onStatus:message=>{$('#voice-status').textContent=message;voiceInvite.hidden=!!voice.stream;$('#voice-start').hidden=!!voice.stream;$('#voice-mute').hidden=$('#voice-stop').hidden=!voice.stream;$('#voice-mute').textContent=voice.muted?'Unmute mic':'Mute mic';$('#voice-mute').setAttribute('aria-pressed',String(voice.muted));}});
   return room;
  })().catch(error=>{promise=null;throw error;});return promise;
 }
 async function run(action){if(busy)return;busy=true;panel.setAttribute('aria-busy','true');try{await action();}catch(error){status(error.message);toast(error.message);}finally{busy=false;panel.removeAttribute('aria-busy');}}
 async function newRoom(){const r=await ensure();await voice?.stop();await r.stopBrowsing();await r.connect();$('#room-messages').replaceChildren();render();}
 $('#create-room').onclick=()=>run(newRoom);
 $('#meet-visitors').onclick=()=>run(async()=>{const r=await ensure();if(!r.room)await r.connect();await r.browse(false);render();});
 $('#find-opponent').onclick=()=>run(async()=>{const r=await ensure();if(r.waiting){await r.stopBrowsing();render();return;}if(r.peer||!r.host){await voice?.stop();await r.stopBrowsing();await r.connect();}await r.browse(true);chess.open();render();});
 $('#open-online-board').onclick=()=>{chess.open();close();};
 $('#copy-invite').onclick=async()=>{try{await navigator.clipboard.writeText($('#invite-link').value);status('Invite link copied. Send it to your friends.');}catch{$('#invite-link').select();status('Select and copy the invite link above.');}};
 $('#visitor-name').onchange=()=>{const name=cleanName($('#visitor-name').value);$('#visitor-name').value=name;writeSaved('serengeti-visitor-name',name);room?.update({name});};
 $('#room-chat-form').onsubmit=e=>{e.preventDefault();const input=$('#chat-message');run(async()=>{if(await room?.chat(input.value))input.value='';});};
 async function startVoice(){if(!room?.connected){status('Join a room first.');return;}if(room.members.filter(p=>p.voice).length>=4){$('#voice-status').textContent='Four microphones are already in use. Text chat is available.';return;}$('#voice-start').disabled=voiceInvite.disabled=true;try{await voice.start();}finally{$('#voice-start').disabled=voiceInvite.disabled=false;}}
 voiceInvite.onclick=()=>run(async()=>{const r=await ensure();if(!r.connected)await newRoom();await startVoice();});
 $('#voice-start').onclick=startVoice;
 $('#voice-mute').onclick=()=>voice?.mute();$('#voice-stop').onclick=()=>voice?.stop();$('#voice-speakers').onclick=()=>voice?.speakers();
 $('#leave-room').onclick=()=>run(async()=>{await voice?.stop();await room?.leave();$('#room-messages').replaceChildren();$('#room-invite').hidden=$('#room-communication').hidden=true;status('You left the shared room. Local chess is available.');const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u);});
 window.addEventListener('serengeti-room',e=>room?.update({activity:['Atrium','Art gallery','Cinema'][e.detail]||'Lobby'}));
 window.addEventListener('pagehide',()=>{voice?.stop();room?.leave();});
 window.addEventListener('offline',()=>{status('You are offline. Live chat and chess will reconnect when your connection returns.');voice?.sync();});
 const invite=new URL(location.href).searchParams.get('room');
 // An invite joins in the background; Friends and chess open only on request.
 if(invite){run(async()=>{if(!validRoom(invite))throw Error('This invite link is not valid.');const r=await ensure();const saved=readSaved('serengeti-room-'+invite,null,sessionStorage);await r.connect(invite,saved?.host===true);render();});}
 return {open,close,openChess(){chess.open();open();},leave:async()=>{await voice?.stop();await room?.leave();}};
}
