import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {printCheckout,printEditions} from './print-editions.js';

const works=JSON.parse(readFileSync(new URL('./life-and-light.json',import.meta.url)));
const featured=works.filter(w=>w.featured).map(w=>w.id);
test('all 21 supplied originals retain their exact bytes, aspect metadata and provenance',()=>{
 assert.equal(works.length,21);assert.equal(new Set(works.map(w=>w.id)).size,21);
 for(const w of works){
  const file=new URL('../public'+w.image.replace('/serengeti-gallery',''),import.meta.url);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),w.sha256,w.title);
  assert.ok(w.width>0&&w.height>0);assert.equal(w.displayOnly,true);assert.equal(w.date,'Date not supplied');
 }
 assert.deepEqual(Object.fromEntries(['light','people','companions','abstract'].map(g=>[g,works.filter(w=>w.group===g).length])),{light:7,people:5,companions:8,abstract:1});
 assert.equal(works.filter(w=>w.credit.includes('pending')).length,2);assert.equal(featured.length,6);
 const credits=JSON.parse(readFileSync(new URL('../public/assets/exhibitions/life-and-light/credits.json',import.meta.url)));
 assert.equal(credits.generationCreditsSpent,0);assert.deepEqual(credits.images,works);
});
test('published print previews accept no payments before fulfillment and proofs are approved',()=>{
 const config=JSON.parse(readFileSync(new URL('../public/print-checkout.json',import.meta.url)));
 for(const id of featured)for(const e of printEditions)assert.equal(printCheckout(id,e.id,config,featured),null);
 assert.deepEqual(printEditions.map(e=>e.price),[25,45,85,165,300,375]);
});
test('only a known approved edition with ready shipping and webhooks can hand off to live Stripe',()=>{
 const id=featured[0];const config={currency:'USD',fulfillment:{ready:true,shippingReady:true,webhookReady:true},editions:{[`${id}:small`]:{sourceApproved:true,proofApproved:true,saleApproved:true,checkoutUrl:'https://buy.stripe.com/liveEdition123'}}};
 assert.equal(printCheckout(id,'small',config,featured),'https://buy.stripe.com/liveEdition123');
 assert.equal(printCheckout('unknown','small',config,featured),null);assert.equal(printCheckout(id,'unknown',config,featured),null);
 for(const field of ['ready','shippingReady','webhookReady']){const copy=structuredClone(config);for(const value of [false,'true','false',1,null]){copy.fulfillment[field]=value;assert.equal(printCheckout(id,'small',copy,featured),null);}}
 for(const field of ['sourceApproved','proofApproved','saleApproved']){const copy=structuredClone(config);copy.editions[`${id}:small`][field]=false;assert.equal(printCheckout(id,'small',copy,featured),null);}
 for(const link of ['https://buy.stripe.com/test_123','https://buy.stripe.com/test123','https://buy.stripe.com.attacker.example/abc','javascript:alert(1)','http://buy.stripe.com/abc','https://user@buy.stripe.com/abc','https://buy.stripe.com/abc?redirect=example','https://buy.stripe.com/abc#secret','https://buy.stripe.com:444/abc']){const copy=structuredClone(config);copy.editions[`${id}:small`].checkoutUrl=link;assert.equal(printCheckout(id,'small',copy,featured),null,link);}
});
