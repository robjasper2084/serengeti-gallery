import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultWebsiteView} from './website-view.js';

test('iPad desktop and mobile browser identities both default to desktop',()=>{
 for(const userAgent of ['Mozilla iPad','Mozilla Macintosh'])assert.equal(defaultWebsiteView({width:768,height:1024,userAgent,touchPoints:5}),'desktop');
 assert.equal(defaultWebsiteView({width:500,height:900,userAgent:'Mozilla Macintosh',touchPoints:5}),'desktop');
});
test('Android tablets default to desktop in either orientation; phones stay mobile',()=>{
 for(const [width,height] of [[800,1280],[1280,800]])assert.equal(defaultWebsiteView({width,height,userAgent:'Android'}),'desktop');
 for(const [width,height] of [[390,844],[844,390]])assert.equal(defaultWebsiteView({width,height,userAgent:'Android Mobile'}),'mobile');
});
