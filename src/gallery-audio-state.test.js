import test from 'node:test';
import assert from 'node:assert/strict';
import {GalleryAudioState} from './gallery-audio-state.js';
test('welcome and trailer never receive sound at the same time',()=>{
 const audio=new GalleryAudioState();audio.setEnabled(true);audio.claim('trailer');assert.equal(audio.allows('trailer'),true);audio.claim('portrait');assert.equal(audio.allows('trailer'),false);assert.equal(audio.allows('portrait'),true);audio.release('trailer');assert.equal(audio.allows('portrait'),true);
});
test('muting and leaving the page silence every source without losing the selected source',()=>{
 const audio=new GalleryAudioState();audio.claim('cinema');assert.equal(audio.allows('cinema'),false);audio.setEnabled(true);audio.suspended=true;assert.equal(audio.allows('cinema'),false);audio.suspended=false;assert.equal(audio.allows('cinema'),true);audio.setEnabled(false);assert.equal(audio.allows('cinema'),false);assert.equal(audio.source,'cinema');
});
