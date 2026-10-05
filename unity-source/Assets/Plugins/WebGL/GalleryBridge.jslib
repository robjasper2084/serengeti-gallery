mergeInto(LibraryManager.library, {
 SerengetiVRArt: function(index) { window.dispatchEvent(new CustomEvent("serengeti-vr-art", {detail:index})); },
 SerengetiPiano: function(value) { window.dispatchEvent(new CustomEvent("serengeti-piano", {detail:UTF8ToString(value)})); },
 SerengetiChess: function(value) { window.dispatchEvent(new CustomEvent("serengeti-chess", {detail:UTF8ToString(value)})); },
 SerengetiXRState: function(active) {window.dispatchEvent(new CustomEvent('serengeti-xr',{detail:!!active}));},
 SerengetiArtwork: function(index) { window.dispatchEvent(new CustomEvent('serengeti-art',{detail:index})); },
 SerengetiVisitStarted: function() { window.dispatchEvent(new CustomEvent('serengeti-visit-started')); },
 SerengetiRoomChanged: function(room) { window.dispatchEvent(new CustomEvent('serengeti-native-room',{detail:room})); },
 SerengetiNavigation: function(x,z,yaw,pitch) {
  var canvas=document.getElementById('world');if(!canvas)return;
  canvas.dataset.position=x.toFixed(3)+','+z.toFixed(3);
  canvas.dataset.cameraYaw=yaw.toFixed(2);canvas.dataset.cameraPitch=pitch.toFixed(2);
 },
 SerengetiScreenCorners: function(ax,ay,bx,by,cx,cy,dx,dy,visible) {
  if(window.serengetiProjectScreen)window.serengetiProjectScreen([ax,ay,bx,by,cx,cy,dx,dy],visible);
 }
});
