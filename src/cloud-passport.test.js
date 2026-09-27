import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCloudPassport} from './cloud-passport.js';
test('cloud saves and progress scope reads and deletes to the signed-in user',async()=>{
 const calls=[];let result={data:[{artwork_id:'archive'}],error:null};
 const query={select(v){calls.push(['select',v]);return this;},eq(k,v){calls.push(['eq',k,v]);return this;},delete(){calls.push(['delete']);return this;},upsert(v,o){calls.push(['upsert',v,o]);return this;},then(ok,bad){return Promise.resolve(result).then(ok,bad);}};
 const service=createCloudPassport({from(t){calls.push(['from',t]);return query;}},'user-a');
 assert.deepEqual(await service.list(),['archive']);
 await service.remove('archive');
 assert.equal(calls.filter(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='user-a').length,2);
 await service.save('archive');await service.progress('room','cinema');
 for(const call of calls.filter(c=>c[0]==='upsert')){assert.equal(call[1].user_id,'user-a');assert.equal(call[2].ignoreDuplicates,true);}
 result={data:null,error:new Error('denied')};await assert.rejects(()=>service.list(),/denied/);
});
