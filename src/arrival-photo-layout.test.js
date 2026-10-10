import test from 'node:test';
import assert from 'node:assert/strict';
import {fitArrivalPhoto} from './arrival-photo-layout.js';

test('the entire photograph fits phone and tablet viewports without cropping',()=>{
 for(const [width,height] of [[390,260],[604,334],[768,960],[1024,704]]){
  const {scale,x,y}=fitArrivalPhoto(width,height,{objectFit:'contain'});
  assert.ok(x>=0&&y>=0);
  assert.ok(x+1536*scale<=width+.001&&y+1024*scale<=height+.001);
 }
});
test('desktop cover positioning stays unchanged',()=>{
 const {scale,x,y}=fitArrivalPhoto(1536,900);
 assert.equal(scale,1);assert.equal(x,0);assert.equal(y,-62);
});
test('portrait and cinema overlays share letterbox offsets after rotation',()=>{
 const layout=fitArrivalPhoto(604,334,{objectFit:'contain'});
 assert.equal(layout.scale,334/1024);
 assert.equal(layout.y,0);assert.equal(layout.x,(604-1536*334/1024)/2);
});
test('enlarged landscape photo keeps portrait and cinema anchors on the same centered image',()=>{
 const style={objectFit:'cover',objectPosition:'50% 50%',getPropertyValue:name=>name==='--arrival-photo-zoom'?'1.12':''};
 for(const [width,height]of [[1074,867],[1440,836],[1024,704]]){
  const layout=fitArrivalPhoto(width,height,style);
  assert.equal(layout.scale,Math.max(width/1536,height/1024)*1.12);
  assert.ok(Math.abs(layout.x+768*layout.scale-width/2)<.001);
  assert.ok(Math.abs(layout.y+512*layout.scale-height/2)<.001);
  // The center of each photographed doorway remains inside the visible scene.
  for(const [x,y]of [[317.5,395],[1277.5,482.5]]){
   assert.ok(layout.x+x*layout.scale>0&&layout.x+x*layout.scale<width);
   assert.ok(layout.y+y*layout.scale>0&&layout.y+y*layout.scale<height);
  }
 }
});
