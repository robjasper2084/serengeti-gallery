// Capture on the stable panel because selecting a piece redraws its square button.
export function attachChessDrag({panel,squareFromEvent,canSelect,select,drop,makeGhost,hitSquare}){
 let drag=null;
 panel.addEventListener('pointerdown',event=>{
  const square=squareFromEvent(event);if(!square||event.button!==0||!event.isPrimary||drag||!canSelect(square))return;
  event.preventDefault();const ghost=makeGhost(square);select(square);panel.setPointerCapture(event.pointerId);
  drag={id:event.pointerId,square,x:event.clientX,y:event.clientY,moved:false,ghost};
 });
 panel.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;
  if(drag.moved){drag.ghost.hidden=false;drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';}
 });
 function finish(event,cancel=false){
  if(!drag||drag.id!==event.pointerId)return;const current=drag;drag=null;current.ghost.remove();
  if(!cancel&&current.moved){const square=hitSquare(event.clientX,event.clientY);if(square&&square!==current.square)drop(square);}
  if(panel.hasPointerCapture(event.pointerId))panel.releasePointerCapture(event.pointerId);
 }
 panel.addEventListener('pointerup',event=>finish(event));panel.addEventListener('pointercancel',event=>finish(event,true));panel.addEventListener('lostpointercapture',event=>finish(event,true));
}
