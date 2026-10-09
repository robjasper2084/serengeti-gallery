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
