// The lobby does not need the chess engine. Keep Unity's existing synchronous bridge.
export function attachLazyChess(options,{load=()=>import('./chess-game.js'),onLoading=()=>{}}={}){
 let chess=null,promise=null,instance=null,focusTable=null,room=null,intent=0;
 function prepare(){
  if(chess)return Promise.resolve(chess);
  promise??=load().then(({attachChess})=>{chess=attachChess(options);if(instance)chess.setInstance(instance,focusTable);if(room)chess.setRoom(room);return chess;}).catch(error=>{promise=null;throw error;});
  return promise;
 }
 async function open(){const current=++intent;onLoading('Loading chess…');try{const ready=await prepare();if(current===intent)ready.open();}catch{onLoading('Chess could not load. Please try again.');}}
 window.addEventListener('serengeti-chess',event=>{if(!chess&&event.detail==='focus')open();});
 return {open,prepare,leave(){++intent;chess?.leave();},setInstance(value,focus){instance=value;focusTable=focus;chess?.setInstance(value,focus);},setRoom(value){room=value;chess?.setRoom(value);}};
}
