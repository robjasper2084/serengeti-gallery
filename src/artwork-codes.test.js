import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
import jsQR from 'jsqr';
import {artworkPermalink,linkedArtworkIndex} from './artwork-links.js';

const records=JSON.parse(await readFile(new URL('./artwork-codes.json',import.meta.url),'utf8'));
test('every supplied artwork has a distinct public QR destination',async()=>{
 const supplied=JSON.parse(await readFile(new URL('./gallery-submissions.json',import.meta.url),'utf8'));
 const exhibition=JSON.parse(await readFile(new URL('./life-and-light.json',import.meta.url),'utf8'));
 const additions=JSON.parse(await readFile(new URL('./new-artworks.json',import.meta.url),'utf8'));
 const ids=['archive',...supplied.map(a=>a.id),...exhibition.map(a=>a.id),...additions.map(a=>a.id)];
 assert.deepEqual(records.map(a=>a.id),ids);assert.equal(new Set(records.map(a=>a.url)).size,ids.length);
 for(const record of records){assert.equal(record.url,artworkPermalink(record.id));assert.equal(new URL(record.url).searchParams.size,1);}
});
test('all saved QR images decode to the right artwork at their displayed size',async()=>{
 for(const record of records){
  const svg=await readFile(new URL(`../public/assets/artwork-codes/${record.id}.svg`,import.meta.url),'utf8');
  const rendered=new Resvg(svg,{fitTo:{mode:'width',value:192}}).render();
  const decoded=jsQR(new Uint8ClampedArray(rendered.pixels),rendered.width,rendered.height);
  assert.equal(decoded?.data,record.url,record.id);
  const png=await readFile(new URL(`../public/assets/artwork-codes/${record.id}.png`,import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');
 }
});
test('artwork links resolve by stable ID, tolerate other parameters, and reject unknown IDs',()=>{
 const works=[{id:'first-embrace'},{id:'archive'}];
 assert.equal(linkedArtworkIndex('?room=guest&artwork=archive',works),1);
 assert.equal(linkedArtworkIndex('?artwork=missing',works),-1);
 assert.equal(linkedArtworkIndex('',works),-1);
 assert.throws(()=>artworkPermalink('../private'));
});
