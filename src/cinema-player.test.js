import test from 'node:test';
import assert from 'node:assert/strict';
import {parseScreening} from './cinema-player.js';
import {projectiveTransform} from './projective-transform.js';
const base='http://localhost:8205/';
test('video, live and short YouTube links resolve to the same safe player ID',()=>{
 for(const url of ['https://www.youtube.com/watch?v=4euNaGauB5k','https://youtu.be/4euNaGauB5k','https://youtube.com/live/4euNaGauB5k']) assert.equal(parseScreening(url,base).id,'4euNaGauB5k');
});
test('movie and HLS sources accept query strings and local gallery films',()=>{
 assert.equal(parseScreening('/serengeti-gallery/assets/serengeti-loop.mp4',base).type,'movie');
 assert.equal(parseScreening('https://media.example/stream.m3u8?token=example',base).type,'hls');
});
test('unsafe schemes and channel pages do not become playable embeds',()=>{
 for(const url of ['javascript:alert(1)','file:///secret.mp4','https://youtube.com/@Jazz-OffDetroit','https://youtube.com.evil.example/watch?v=4euNaGauB5k','http://media.example/film.mp4']) assert.throws(()=>parseScreening(url,base));
});
test('perspective media projection lands on all four measured frame corners',()=>{
 const corners=[[176,100],[468,177],[460,619],[164,632]];
 const matrix=projectiveTransform(360,475,corners).slice(9,-1).split(',').map(Number);
 [[0,0],[360,0],[360,475],[0,475]].forEach(([x,y],i)=>{
  const w=matrix[3]*x+matrix[7]*y+matrix[15];
  assert.ok(Math.abs((matrix[0]*x+matrix[4]*y+matrix[12])/w-corners[i][0])<.001);
  assert.ok(Math.abs((matrix[1]*x+matrix[5]*y+matrix[13])/w-corners[i][1])<.001);
 });
});
