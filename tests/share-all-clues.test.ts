import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {ShareClues} from '../src/ShareClues';
const setup=(count:number,id='jungle-adventure')=>{const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<count;i++)e.join(r.code,`Hero ${i}`,`h${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);return {e,r,p,scope:{round:r.round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run}};};
const render=(view:ReturnType<Engine['view']>,connected=true,pending=false)=>renderToStaticMarkup(createElement(ShareClues,{view,connected,pending,command:async()=>{}}));
for(const count of [2,3,4])test(`${count} players: one Share all button sends only the sender's clues atomically`,()=>{
 const {e,r,p,scope}=setup(count),h=r.players[1];let html=render(e.view(r,h));assert.equal((html.match(/>Share all clues<\/button>/g)||[]).length,1);assert.doesNotMatch(html,/>Share with Captain<\/button>/);assert.match(html,/not answer choices/);assert.doesNotMatch(render(e.view(r,p)),/>Share all clues<\/button>/);
 const own=e.view(r,h).clues!.own,revision=r.revision;e.shareAllClues(r,h,scope);assert.equal(r.revision,revision+1);assert.deepEqual(e.view(r,p).clues!.received.map(c=>c.text),own.map(c=>c.text));assert.equal(e.view(r,h).clues!.received.length,0);assert.equal(e.view(r,p).clues!.allShared,count===2);
 const after=r.revision;e.shareAllClues(r,h,scope);assert.equal(r.revision,after);html=render(e.view(r,h));assert.match(html,/All clues shared!/);assert.match(html,/<button[^>]*disabled/);
 for(const other of r.players.slice(2)){assert.ok(e.view(r,other).clues!.own.every(c=>!c.shared));e.shareAllClues(r,other,scope);}assert.ok(e.view(r,p).clues!.allShared);
 e.disconnect(h.socketId!);e.join(r.code,'','restored',h.token);assert.ok(e.view(r,h).clues!.own.every(c=>c.shared));
 e.begin(r);assert.ok(e.view(r,h).clues!.own.every(c=>!c.shared));assert.equal(e.view(r,p).clues!.received.length,0);
});
for(const count of [5,6])test(`${count} players retain per-clue controls with explicit share-every-clue copy`,()=>{const {e,r}=setup(count),html=render(e.view(r,r.players[1]));assert.doesNotMatch(html,/>Share all clues<\/button>/);assert.match(html,/>Share with Captain<\/button>/);assert.match(html,/not answer choices/);});
test('bulk sharing rejects stale scope, foreign players, disconnected seats, Captain and Signal Lost',()=>{
 const {e,r,p,scope}=setup(3),h=r.players[1],before=r.revision;
 for(const bad of [{...scope,round:3},{...scope,attempt:2},{...scope,run:0},{...scope,adventureId:'ice-rescue'}])assert.throws(()=>e.shareAllClues(r,h,bad));
 assert.throws(()=>e.shareAllClues(r,{...h},scope));assert.throws(()=>e.shareAllClues(r,p,scope));assert.equal(r.revision,before);e.disconnect(h.socketId!);assert.throws(()=>e.shareAllClues(r,h,scope));
 const s=e.create('signal','Captain','signal');assert.throws(()=>e.shareAllClues(s.r,s.p,scope));
});
test('partial sharing is completed without duplicate received clues; offline or pending UI stays disabled',()=>{
 const {e,r,p,scope}=setup(2),h=r.players[1];e.shareClue(r,h,{...scope,clue:0});e.shareAllClues(r,h,scope);const received=e.view(r,p).clues!.received;assert.equal(received.length,e.view(r,h).clues!.own.length);assert.equal(new Set(received.map(c=>c.index)).size,received.length);
 e.begin(r);assert.match(render(e.view(r,h),false),/<button[^>]*disabled/);assert.match(render(e.view(r,h),true,true),/<button[^>]*disabled/);
});
test('retry and replay require fresh sharing and reject old attempt/run requests',()=>{
 const {e,r,p,scope}=setup(2),h=r.players[1];e.shareAllClues(r,h,scope);r.tiny!.attempt=2;e.begin(r);assert.throws(()=>e.shareAllClues(r,h,scope));assert.ok(e.view(r,h).clues!.own.every(c=>!c.shared));e.shareAllClues(r,h,{...scope,attempt:2});r.phase='finished';e.replay(r,p);assert.throws(()=>e.shareAllClues(r,h,{...scope,attempt:2}));
});

test('one-click sharing works in all ten Tiny Heroes worlds',()=>{
 for(const id of ['forest-rescue','ice-rescue','jungle-adventure','treasure-island','desert-rescue','ocean-adventure','magic-kingdom','moon-mission','cloud-adventure','meadow-rescue']){
  const {e,r,p,scope}=setup(2,id),h=r.players[1];assert.match(render(e.view(r,h)),/>Share all clues<\/button>/);e.shareAllClues(r,h,scope);assert.equal(e.view(r,p).clues!.received.length,e.view(r,h).clues!.own.length);assert.ok(e.view(r,p).clues!.allShared);assert.match(render(e.view(r,h)),/All clues shared!/);
 }
});
