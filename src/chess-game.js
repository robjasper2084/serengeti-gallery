import {readSaved,writeSaved} from './visitor-settings.js';
import {Chess} from 'chess.js';
import {attachChessDrag} from './chess-drag.js';
export class GalleryChessGame {
 snapshot(){return {version:1,mode:this.mode,pgn:this.game.pgn()};}
 restore(saved){try{if(saved?.version!==1||![1,2].includes(saved.mode)||typeof saved.pgn!=='string'||saved.pgn.length>100000)return false;const game=new Chess();game.loadPgn(saved.pgn);this.game=game;this.mode=saved.mode;this.selected='';return true;}catch{return false;}}
 constructor(){this.game=new Chess();this.mode=1;this.selected='';}
 reset(mode=this.mode){this.mode=mode;this.game.reset();this.selected='';}
 select(square){if(this.game.isGameOver()||(this.mode===1&&this.game.turn()==='b'))return;const piece=this.game.get(square);if(piece?.color===this.game.turn()){this.selected=square;return;}if(this.selected){try{this.game.move({from:this.selected,to:square,promotion:'q'});this.selected='';}catch{}}}
 computer(){if(this.mode!==1||this.game.turn()!=='b'||this.game.isGameOver())return;let best=-Infinity,chosen;const value={p:100,n:320,b:330,r:500,q:900,k:0};const score=()=>this.game.board().flat().reduce((s,p)=>s+(p?(p.color==='b'?1:-1)*value[p.type]:0),0);for(const move of this.game.moves()){this.game.move(move);let worst=Infinity;if(this.game.isCheckmate())worst=100000;else{for(const reply of this.game.moves()){this.game.move(reply);worst=Math.min(worst,this.game.isCheckmate()?-100000:score());this.game.undo();}if(worst===Infinity)worst=0;}this.game.undo();if(worst>best){best=worst;chosen=move;}}if(chosen)this.game.move(chosen);}
 undo(){this.game.undo();if(this.mode===1&&this.game.turn()==='b')this.game.undo();this.selected='';}
 state(){let board='';for(let rank=1;rank<=8;rank++)for(const file of 'abcdefgh'){const p=this.game.get(file+rank);board+=p?(p.color==='w'?p.type.toUpperCase():p.type):'.';}const turn=this.game.turn()==='w'?'White':'Black';return {board,selected:this.selected,legal:this.selected?this.game.moves({square:this.selected,verbose:true}).map(m=>m.to).join(','):'',status:this.game.isCheckmate()?`${turn} is checkmated`:this.game.isDraw()?'Draw':`${turn} to move${this.game.isCheck()?' — check':''}`,mode:this.mode===1?'1 player · You are White':'2 players · Local turns'};}
}
export function attachChess({onOnline=()=>{},onOpen=()=>{},onClose=()=>{}}={}){
 const chess=new GalleryChessGame();chess.restore(readSaved('serengeti-chess',null));let timer,instance=null,room=null,localSave=null;
 const panel=document.createElement('section');panel.id='chess-controls';panel.hidden=true;panel.setAttribute('aria-label','Chess game');panel.tabIndex=-1;
 panel.innerHTML=`<div class="chess-heading"><h2>Serengeti Chess</h2><button data-chess="leave" aria-label="Close chess">✕</button></div><div class="chess-layout"><div class="accessible-chess"><div role="grid" aria-label="Chess board"></div></div><div class="chess-options"><p class="chess-status" role="status" aria-live="polite"></p><div class="chess-modes"><button data-chess="one">Computer</button><button data-chess="two">Local 2 players</button><button data-chess="online">Play online</button></div><div class="chess-tools"><button data-chess="new">New game</button><button data-chess="undo">Undo</button><button type="button" class="read-board">Read position</button></div><div class="chess-confirm" hidden><p>Start a new game? Your current local game will be replaced.</p><button data-chess="confirm">Start new game</button><button data-chess="cancel">Keep game</button></div><p class="chess-instructions">Drag a piece to a green square, or tap the piece then its destination. Arrow keys and Enter also work. Pawns become queens.</p><div class="chess-last" aria-live="polite"></div></div></div>`;document.body.append(panel);
 const board=panel.querySelector('.accessible-chess');let focusSquare='e2',resetMode=null;
 const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
 const describe=sq=>{const piece=chess.game.get(sq);return sq+' '+(piece?(piece.color==='w'?'White ':'Black ')+names[piece.type]:'empty');};
 function drawBoard(){
  const active=document.activeElement?.dataset.square,black=room?.color==='b';const files=black?'hgfedcba':'abcdefgh';
  const legal=chess.selected?new Set(chess.game.moves({square:chess.selected,verbose:true}).map(m=>m.to)):new Set();
  board.querySelector('[role="grid"]').innerHTML=Array.from({length:8},(_,r)=>'<div role="row">'+Array.from({length:8},(_,f)=>{const sq=files[f]+(black?r+1:8-r),piece=chess.game.get(sq);return `<div role="gridcell"><button data-square="${sq}" tabindex="${sq===focusSquare?0:-1}" aria-label="${describe(sq)}${legal.has(sq)?', legal destination':''}" aria-pressed="${chess.selected===sq}" class="${(r+f)%2?'dark':'light'} ${legal.has(sq)?'legal':''}">${piece?`<span class="piece-${piece.color}">${{p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'}[piece.type]}</span>`:'·'}<small>${sq}</small></button></div>`;}).join('')+'</div>').join('');
  if(active)board.querySelector(`[data-square="${active}"]`)?.focus({preventScroll:true});
 }
 function sync(){
  const state=chess.state(),online=room?.room;
  if(online){
   const opponent=room.members.find(p=>p.id===(room.host?room.peer:room.hostId));
   state.mode=room.color?'Online · You are '+(room.color==='w'?'White':'Black'):'Online · Watching';
   if(!room.connected)state.status=room.notice;
   else if(!opponent)state.status=room.peer?'Opponent offline · waiting to reconnect':'Waiting for another player';
   else if(room.pending)state.status='Sending your move…';
   else if(!room.color)state.status='Two players are seated · '+state.status;
  }
  instance?.SendMessage('Gallery chess','SetPosition',JSON.stringify(state));
  panel.querySelector('.chess-status').textContent=state.mode+' · '+state.status;
  panel.querySelector('.chess-last').textContent=(state.selected?'Selected '+state.selected+' · ':'')+(chess.game.history().at(-1)?'Last move: '+chess.game.history().at(-1):'New game');
  for(const action of ['one','two','new','undo'])panel.querySelector(`[data-chess="${action}"]`).disabled=!!online;
  for(const [action,mode]of [['one',1],['two',2]])panel.querySelector(`[data-chess="${action}"]`).setAttribute('aria-pressed',String(!online&&chess.mode===mode));
  if(!online)writeSaved('serengeti-chess',chess.snapshot());drawBoard();
 }
 function schedule(){clearTimeout(timer);if(!room?.room&&chess.mode===1&&chess.game.turn()==='b'&&!chess.game.isGameOver())timer=setTimeout(()=>{chess.computer();sync();},250);}
 function open(){panel.hidden=false;document.body.classList.add('chess-active');onOpen();sync();panel.focus();}
 function leave(){panel.hidden=true;document.body.classList.remove('chess-active');instance?.SendMessage('Gallery chess','Leave');onClose();}
 function reset(mode){if(!room?.room){chess.reset(mode);panel.querySelector('.chess-confirm').hidden=true;resetMode=null;sync();schedule();}}
 function handle(action){
  if(action==='focus'){open();return;}if(action==='leave'){panel.hidden=true;document.body.classList.remove('chess-active');onClose();return;}
  if(action==='online'){onOnline();return;}
  if(action==='cancel'){panel.querySelector('.chess-confirm').hidden=true;resetMode=null;return;}
  if(action==='confirm'){if(resetMode!==null)reset(resetMode);return;}
  if(['one','two','new'].includes(action)){
   if(room?.room)return;const mode=action==='one'?1:action==='two'?2:chess.mode;
   if(action!=='new'&&chess.mode===mode)return;
   if(chess.game.history().length){resetMode=mode;panel.querySelector('.chess-confirm').hidden=false;return;}reset(mode);return;
  }
  if(action==='undo'&&!room?.room){clearTimeout(timer);chess.undo();sync();schedule();return;}
  if(/^[a-h][1-8]$/.test(action)){
   if(room?.room){
    if(!room.canMove)return;const p=chess.game.get(action);
    if(p?.color===room.color)chess.selected=action;
    else if(chess.selected){const from=chess.selected;chess.selected='';room.move(from,action);}
   }else chess.select(action);
   sync();schedule();
  }
 }
 panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.square){focusSquare=b.dataset.square;handle(b.dataset.square);}else if(b.dataset.chess==='leave')leave();else if(b.dataset.chess)handle(b.dataset.chess);});
 attachChessDrag({panel,squareFromEvent:e=>e.target.closest('[data-square]')?.dataset.square,
  canSelect:sq=>{const piece=chess.game.get(sq);return piece&&piece.color===chess.game.turn()&&!chess.game.isGameOver()&&(room?.room?room.canMove:chess.mode!==1||piece.color==='w');},
  select:sq=>{focusSquare=sq;handle(sq);},drop:handle,
  makeGhost:sq=>{const ghost=document.createElement('div'),piece=chess.game.get(sq);ghost.className='chess-drag-piece piece-'+piece.color;ghost.textContent=board.querySelector(`[data-square="${sq}"] span`)?.textContent;ghost.hidden=true;document.body.append(ghost);return ghost;},
  hitSquare:(x,y)=>document.elementFromPoint(x,y)?.closest('[data-square]')?.dataset.square});
 board.addEventListener('keydown',e=>{const b=e.target.closest('[data-square]');if(!b)return;const moves={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8};if(!(e.key in moves))return;e.preventDefault();e.stopPropagation();const buttons=[...board.querySelectorAll('[data-square]')],index=buttons.indexOf(b);const next=buttons[Math.max(0,Math.min(63,index+moves[e.key]))];b.tabIndex=-1;next.tabIndex=0;focusSquare=next.dataset.square;next.focus();});
 panel.querySelector('.read-board').onclick=()=>{panel.querySelector('.chess-last').textContent=chess.state().status+'. '+[...board.querySelectorAll('[data-square]')].filter(b=>chess.game.get(b.dataset.square)).map(b=>describe(b.dataset.square)).join('; ');};
 panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();leave();}});
 window.addEventListener('serengeti-chess',e=>handle(e.detail));sync();schedule();
 return {open,leave,setInstance(value){instance=value;sync();},setRoom(value){
  const online=!!value?.room;
  if(online){if(!localSave)localSave=chess.snapshot();clearTimeout(timer);const changed=chess.game!==value.game;room=value;chess.game=value.game;if(changed)chess.selected='';}
  else{room=null;if(localSave){chess.restore(localSave);localSave=null;}schedule();}sync();
 }};
}
