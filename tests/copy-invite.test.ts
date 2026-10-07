import test from 'node:test';
import assert from 'node:assert/strict';
import {copyInvite} from '../src/copy-invite';
test('invite copy writes the exact room link and confirms clipboard success',async()=>{
 let copied='';let fallback=false;
 assert.equal(await copyInvite('https://game.example/?room=ABCDEF',{writeText:async text=>{copied=text}},()=>{fallback=true;return true}),true);
 assert.equal(copied,'https://game.example/?room=ABCDEF');assert.equal(fallback,false);
});
test('clipboard denial uses the fallback with the same invite',async()=>{
 let copied='';
 assert.equal(await copyInvite('room link',{writeText:async()=>{throw new Error('denied')}},text=>{copied=text;return true}),true);
 assert.equal(copied,'room link');
});
test('missing clipboard uses fallback and total failure never claims success',async()=>{
 assert.equal(await copyInvite('room link',undefined,()=>true),true);
 assert.equal(await copyInvite('room link',undefined,()=>false),false);
});
