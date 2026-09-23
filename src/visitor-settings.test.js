import test from 'node:test';import assert from 'node:assert/strict';
import {readSaved,writeSaved,qualityProfile,restoreDiscoveries} from './visitor-settings.js';
test('blocked or corrupt storage falls back safely',()=>{const blocked={getItem(){throw Error();},setItem(){throw Error();}};assert.deepEqual(readSaved('a',[],blocked),[]);assert.equal(writeSaved('a',{},blocked),false);assert.equal(readSaved('a','auto',{getItem:()=>'{'}),'auto');});
test('quality defaults adapt and discoveries reject corrupt indices',()=>{assert.equal(qualityProfile('auto',true).mode,'low');assert.equal(qualityProfile('high',true).ratio,1.5);assert.deepEqual(restoreDiscoveries([0,0,32,-1,33,'1'],33),[0,32]);});
