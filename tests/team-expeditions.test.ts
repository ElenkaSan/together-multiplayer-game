import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine,type Room} from '../server/engine';
import {brief,resolve} from '../server/modes';
import {getAdventure,availableAdventures,adventureDifficulty} from '../shared/tiny-adventures';
import {expeditionStages} from '../shared/new-adventures';
import {expeditionSolutions} from '../server/team-expeditions';
import {adventureSnapshot} from '../server/tiny-adventures';
import {ExpeditionProgress,TeamExpeditionExperience,expeditionNarration,ExpeditionMap} from '../src/TeamExpedition';
import {TinyProgression} from '../src/TinyProgression';
function start(id:string,n=2){const e=new Engine();const {r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<n;i++)e.join(r.code,'Hero '+i,'h'+i);r.players.forEach(x=>e.ready(r,x));e.start(r,p);return {e,r,p}}
function submit(e:Engine,r:Room,plan=expeditionSolutions[r.tiny!.id][r.round]){e.tick(r.deadline!+1);for(const p of r.players)e.submit(r,p,r.round,p.slot?{confirm:'ready'}:plan,r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run);e.tick(r.deadline!+1)}
for(const n of [2,3,4,5,6])test(`both expeditions distribute six unique private observations across ${n} players and complete all stages`,()=>{
 for(const id of ['jungle-adventure','treasure-island']){
  const {e,r,p}=start(id,n);
  for(let i=0;i<5;i++){
   const all=[];for(let slot=0;slot<n;slot++){const b=brief('tiny',i,slot,n,0,id);assert.ok(b.observations!.length);all.push(...b.observations!);if(slot)assert.deepEqual(b.tasks.map(t=>t.key),['confirm']);assert.ok(b.observations!.length<6)}
   assert.equal(new Set(all.map(o=>o.text)).size,6);assert.equal(all.length,6);
   const v=e.view(r,p);assert.equal('helperBriefs' in v,false);assert.equal(v.adventure!.rescues.some(r=>'privateClues' in r),false);
   submit(e,r);assert.equal(r.result?.success,true);e.tick(r.deadline!+1);
  }assert.equal(r.phase,'finished');assert.equal(r.score,5);assert.equal(r.tiny?.completed.length,5);
 }
});
test('Treasure cave strategies have equal badges; invalid mixed sequences and flooded route fail',()=>{
 const high={route:'high',step1:'lift',step2:'turn',step3:'open'},jungle={route:'jungle',step1:'mark',step2:'follow',step3:'enter'};
 for(const a of [high,jungle])assert.equal(resolve('tiny',3,[a,{confirm:'ready'}],0,'treasure-island').success,true);
 assert.equal(resolve('tiny',3,[{...high,route:'jungle'},{confirm:'ready'}],0,'treasure-island').success,false);
 assert.equal(resolve('tiny',3,[{...jungle,route:'tide'},{confirm:'ready'}],0,'treasure-island').success,false);
});
test('retry, missing confirmation, reconnect, stale submissions and final Team Assist preserve compass completion',()=>{
 const {e,r,p}=start('treasure-island'),hero=r.players[1];
 for(let i=0;i<4;i++){submit(e,r);e.tick(r.deadline!+1)}
 assert.equal(r.tiny!.completed.length,4);
 for(let attempt=1;attempt<=2;attempt++){
  e.tick(r.deadline!+1);e.submit(r,p,4,expeditionSolutions['treasure-island'][4],attempt,'treasure-island',1);
  const v=e.view(r,hero);assert.deepEqual(v.teamPlan,expeditionSolutions['treasure-island'][4]);
  e.disconnect(hero.socketId!);e.join(r.code,'','returned'+attempt,hero.token);assert.deepEqual(e.view(r,hero).teamPlan,v.teamPlan);
  assert.throws(()=>e.submit(r,hero,4,{confirm:'ready'},attempt,'treasure-island',0),/closed/);
  // Allow the shared timer to expire with a missing confirmation.
  e.tick(r.deadline!+1);e.tick(r.deadline!+1);assert.equal(r.result?.success,false);
  if(attempt===1){assert.equal(r.result?.retry,true);assert.equal(r.tiny!.completed.length,4)}else{assert.equal(r.result?.assisted,true);assert.equal(r.tiny!.completed.length,5)}
  e.tick(r.deadline!+1);
 }
 assert.equal(r.phase,'finished');assert.equal(r.score,4);const v=e.view(r,p);
 assert.equal(v.progression!.results['treasure-island'].assists,1);
 const html=renderToStaticMarkup(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}}));
 assert.match(html,/Treasure Found!/);assert.match(html,/Friendship Compass is whole again/);assert.match(html,/5 \/ 5 compass pieces/);assert.match(html,/4 \/ 5 Adventure Badges/);assert.match(html,/1 Team Assist/);assert.doesNotMatch(html,/friends are home/);
 e.adventureMap(r,p);e.chooseAdventure(r,p,'jungle-adventure');assert.equal(r.tiny!.id,'jungle-adventure');assert.equal(r.players[1].token,hero.token);
});
test('child UI has picture clues, shared Captain plan and Read to Me without Forest tool tasks',()=>{
 for(const id of ['jungle-adventure','treasure-island']){
  const {e,r,p}=start(id);e.tick(r.deadline!+1);e.submit(r,p,0,expeditionSolutions[id][0],1,id,1);const view=e.view(r,r.players[1]);
  const html=renderToStaticMarkup(React.createElement(TeamExpeditionExperience,{view,actions:{},setActions:()=>{},connected:true,pending:false,remaining:40,command:async()=>{}}));
  assert.match(html,/Read to me/);assert.match(html,/Ready — I agree/);assert.match(html,/Captain’s plan/);assert.match(html,/expedition-icon/);assert.doesNotMatch(html,/Pick a tool|Warm Packs|kindness stars/);assert.match(expeditionNarration(view),/Captain’s plan/);
  const map=renderToStaticMarkup(React.createElement(ExpeditionMap,{view}));assert.match(map,new RegExp(`${getAdventure(id).environment.renderer}-map`));assert.equal((map.match(/stop-active/g)||[]).length,1);
  const publicContent=JSON.stringify(adventureSnapshot(r.tiny!,0));assert.doesNotMatch(publicContent,/Fresh scout tracks|old drawing shows|privateEvidence/);
 }
 assert.equal(availableAdventures().length,6);assert.equal(adventureDifficulty(4),'Medium+');
});
