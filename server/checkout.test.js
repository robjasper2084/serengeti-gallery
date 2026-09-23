import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateItems,checkoutMiddleware} from './checkout.js';
test('does not accept client price or quantity overrides',()=>{assert.deepEqual(validateItems([{id:'archive',format:'physical',price:1,quantity:99}]),[{sku:'archive_physical',format:'physical'}]);});
test('rejects unknown, duplicate, empty, or malformed editions',()=>{for(const bad of [[],null,[{id:'x',format:'physical'}],[{id:'archive',format:'free'}],[{id:'archive',format:'digital'},{id:'archive',format:'digital'}]])assert.throws(()=>validateItems(bad));});
test('checkout fails closed without credentials',async()=>{const req={url:'/api/checkout',method:'POST',headers:{origin:'http://localhost:8205'},async *[Symbol.asyncIterator](){yield JSON.stringify({items:[{id:'archive',format:'digital'}]});}};let status,body;await checkoutMiddleware({})(req,{writeHead(s){status=s},end(b){body=JSON.parse(b)}},()=>assert.fail());assert.equal(status,503);assert.match(body.error,/no payment/);});
test('cross-origin checkout is rejected',async()=>{let status;await checkoutMiddleware({})({url:'/api/checkout',method:'POST',headers:{origin:'https://wrong.example'}},{writeHead(s){status=s},end(){}},()=>assert.fail());assert.equal(status,403);});
