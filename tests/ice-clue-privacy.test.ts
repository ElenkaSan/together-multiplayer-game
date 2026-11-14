import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {iceRescue} from '../shared/tiny-adventures';
import {TinyHeroExperience} from '../src/TinyHeroExperience';

for(const count of [2,3,6]) test(`Ice private clues remain role-scoped at all five stops with ${count} players`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','captain','ice-rescue');
 for(let i=1;i<count;i++)e.join(r.code,`Hero ${i}`,`hero-${i}`);
 r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(let round=0;round<5;round++){
  r.round=round;e.begin(r);
  const scope={round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run};
  const captain=e.view(r,p);
  assert.equal(captain.clues!.received.length,0);
  for(const hero of r.players.slice(1)){
   const view=e.view(r,hero),payload=JSON.stringify(view);
   const assigned=iceRescue.rescues[round].privateClues!.filter((_,i)=>i%(count-1)===(hero.slot-1)%(count-1));
   for(const text of assigned)assert.ok(view.brief!.message.includes(text));
   for(const text of iceRescue.rescues[round].privateClues!.filter(x=>!assigned.includes(x)))assert.ok(!payload.includes(text));
   for(const text of assigned)assert.ok(!JSON.stringify(captain).includes(text));
   assert.ok(!('helperBriefs' in view));
   assert.deepEqual(view.brief!.tasks.map(t=>t.key),['route']);
   assert.equal(view.clues!.received.length,0);
   const html=renderToStaticMarkup(createElement(TinyHeroExperience,{view,actions:{},setActions:()=>{},connected:true,pending:false,remaining:60,command:async()=>{}}));
   assert.match(html,count===2?/all environmental clues are yours/:/Other heroes have different clues/);
   e.shareAllClues(r,hero,scope);
   assert.ok(e.view(r,p).clues!.received.some(c=>c.playerId===hero.id));
  }
  e.shareClue(r,p,{...scope,clue:0});
  for(const hero of r.players.slice(1)){
   const received=e.view(r,hero).clues!.received;
   assert.equal(received.length,1);assert.equal(received[0].playerId,p.id);
  }
 }
});
