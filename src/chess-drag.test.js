import test from 'node:test';
import assert from 'node:assert/strict';
import {attachChessDrag} from './chess-drag.js';
import {GalleryChessGame} from './chess-game.js';
function fixture(){
 const panel=new EventTarget(),captured=new Set(),game=new GalleryChessGame(),ghosts=[];let hit='e4';
 panel.setPointerCapture=id=>captured.add(id);panel.hasPointerCapture=id=>captured.has(id);panel.releasePointerCapture=id=>captured.delete(id);
 attachChessDrag({panel,squareFromEvent:e=>e.square,canSelect:s=>game.game.get(s)?.color===game.game.turn(),select:s=>game.select(s),drop:s=>game.select(s),makeGhost:()=>{const g={hidden:true,style:{},removed:false,remove(){this.removed=true;}};ghosts.push(g);return g;},hitSquare:()=>hit});
 const pointer=(type,square,x,y,id=1)=>panel.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{square,clientX:x,clientY:y,button:0,isPrimary:true,pointerId:id}));
 return {pointer,game,ghosts,captured,setHit:s=>hit=s};
}
test('touch and mouse drag selects a piece, highlights it, and commits a legal drop once',()=>{
 const f=fixture();f.pointer('pointerdown','e2',10,10);assert.equal(f.game.selected,'e2');f.pointer('pointermove',null,40,40);assert.equal(f.ghosts[0].hidden,false);f.pointer('pointerup',null,40,40);assert.deepEqual(f.game.game.history(),['e4']);assert.equal(f.captured.size,0);assert.equal(f.ghosts[0].removed,true);f.pointer('pointerup',null,40,40);assert.equal(f.game.game.history().length,1);
});
test('a tap keeps the piece selected for tap-to-move; a small finger wobble does not move it',()=>{
 const f=fixture();f.pointer('pointerdown','e2',10,10);f.pointer('pointermove',null,12,12);f.pointer('pointerup',null,12,12);assert.equal(f.game.selected,'e2');assert.equal(f.game.game.history().length,0);f.game.select('e4');assert.equal(f.game.game.history()[0],'e4');
});
test('illegal and outside drops, canceled touches, and other fingers cannot move the piece',()=>{
 for(const hit of ['e5',null]){const f=fixture();f.setHit(hit);f.pointer('pointerdown','e2',10,10);f.pointer('pointermove',null,50,50);f.pointer('pointerup',null,50,50);assert.equal(f.game.game.history().length,0);}
 const f=fixture();f.pointer('pointerdown','e2',10,10);f.pointer('pointermove',null,50,50,2);f.pointer('pointercancel',null,50,50);assert.equal(f.game.game.history().length,0);assert.equal(f.captured.size,0);
});
