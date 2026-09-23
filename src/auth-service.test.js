import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountService,accountError} from './auth-service.js';
test('accounts use provider auth and a fixed confirmation/recovery redirect',async()=>{
 const calls=[];const client={auth:Object.fromEntries(['signUp','signInWithPassword','resetPasswordForEmail','updateUser','signOut'].map(name=>[name,async(...args)=>{calls.push({name,args});return {data:{session:null},error:null};}]))};
 const url='https://example.com/gallery/',service=createAccountService(client,url);
 await service.signUp(' visitor@example.com ','long test password');await service.signIn(' visitor@example.com ','long test password');await service.reset(' visitor@example.com ');await service.updatePassword('new long password');await service.signOut();
 assert.deepEqual(calls[0],{name:'signUp',args:[{email:'visitor@example.com',password:'long test password',options:{emailRedirectTo:url}}]});
 assert.equal(calls[1].name,'signInWithPassword');assert.deepEqual(calls[2].args,['visitor@example.com',{redirectTo:url}]);assert.deepEqual(calls[3].args,[{password:'new long password'}]);assert.deepEqual(calls[4].args,[{scope:'local'}]);
});
test('provider failures are not treated as authenticated sessions or exposed verbatim',async()=>{
 const error={code:'invalid_credentials',message:'internal details'};
 const service=createAccountService({auth:{signInWithPassword:async()=>({data:null,error})}},'https://example.com/');
 await assert.rejects(service.signIn('visitor@example.com','wrong'),e=>e===error);
 assert.equal(accountError(error),'Email or password is incorrect.');assert.ok(!accountError({message:'secret'}).includes('secret'));
});
