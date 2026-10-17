import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {ShareClues} from '../src/ShareClues';
for(const count of [2,3,6])test(`owned clue sharing, privacy, idempotency and reconnect for ${count} players`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','jungle-adventure');for(let i=1;i<count;i++)e.join(r.code,`Hero ${i}`,`h${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 const h=r.players[1],scope={round:r.round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run};
 assert.equal(e.view(r,p).clues!.received.length,0);const own=e.view(r,h).clues!.own;
 assert.throws(()=>e.shareClue(r,h,{...scope,clue:999}));assert.throws(()=>e.shareClue(r,h,{...scope,run:0,clue:0}));
 assert.throws(()=>e.shareClue(r,{...h},{...scope,clue:0}));
 e.shareClue(r,h,{...scope,clue:0});const revision=r.revision;e.shareClue(r,h,{...scope,clue:0});assert.equal(r.revision,revision);
 assert.equal(e.view(r,p).clues!.received[0].text,own[0].text);assert.equal(e.view(r,h).clues!.received.length,0);assert.equal(e.view(r,p).clues!.received.length,1);
 e.disconnect(h.socketId!);e.join(r.code,'','restored',h.token);assert.equal(e.view(r,h).clues!.own[0].shared,true);assert.equal(e.view(r,p).clues!.received.length,1);
 for(const player of r.players.slice(1))for(const c of e.view(r,player).clues!.own)e.shareClue(r,player,{...scope,clue:c.index});assert.equal(e.view(r,p).clues!.allShared,true);
 const html=renderToStaticMarkup(React.createElement(ShareClues,{view:e.view(r,h),connected:true,pending:false,command:async()=>{}}));assert.match(html,/Shared!/);assert.match(html,/disabled/);assert.match(html,/Read to me/);
 e.begin(r);assert.equal(e.view(r,p).clues!.received.length,0);
});
test('all ten Tiny Heroes adventures expose only own shareable clues; Signal Lost has none',()=>{
 const ids=['forest-rescue','ice-rescue','jungle-adventure','treasure-island','desert-rescue','ocean-adventure','magic-kingdom','moon-mission','cloud-adventure','meadow-rescue'];
 for(const id of ids){const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);const h=e.join(r.code,'Hero','h').p;r.players.forEach(x=>e.ready(r,x));e.start(r,p);assert.ok(e.view(r,h).clues!.own.length);assert.equal(e.view(r,p).clues!.received.length,0)}
 const e=new Engine(),{r,p}=e.create('signal','Captain','c');assert.equal('clues' in e.view(r,p),false);
});
