import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine,type Room} from '../server/engine';
import {expertFields,expertStages} from '../shared/expert-adventures';
import {expertSuccess} from '../server/expert-mechanisms';
import {collectionStages,weatherRounds} from '../shared/collection-adventures';
import {CollectionAdventure,CollectionMap,collectionNarration} from '../src/CollectionAdventure';
import {cloudPlans,meadowPlans,badKeys} from './collection-fixtures';
import type {Action} from '../server/modes';
const scope=(r:Room)=>({round:r.round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run,version:r.expert!.version});
function setup(id:string,n=2){const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<n;i++)e.join(r.code,'Explorer'+i,'h'+i);r.players.forEach(x=>e.ready(r,x));e.start(r,p);e.tick(r.deadline!+1);return {e,r,p}}
function fill(e:Engine,r:Room,plan:Action){for(const player of r.players)for(const f of expertFields(r.tiny!.id,r.round,player.slot,r.players.length)){if(r.tiny!.id==='cloud-adventure'&&r.round===2){if(!r.expert!.board.weather?.checked&&!['primary','backup'].includes(f.key))continue;if(r.expert!.board.weather?.checked&&['primary','backup'].includes(f.key))continue}e.mechanism(r,player,{...scope(r),key:f.key,value:plan[f.key]})}}
function check(e:Engine,r:Room){if(r.tiny!.id!=='cloud-adventure'||!weatherRounds.includes(r.round)||r.expert!.board.weather?.checked)return;if(r.round===2)r.players.forEach(x=>e.mechanism(r,x,{...scope(r),ready:true}));e.mechanism(r,r.players[0],{...scope(r),operation:'check'})}
function launch(e:Engine,r:Room){r.players.forEach(x=>e.mechanism(r,x,{...scope(r),ready:true}));e.submit(r,r.players[0],r.round,{launch:'launch'},r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run,r.expert!.version);e.tick(r.deadline!+1)}
for(const id of ['cloud-adventure','meadow-rescue'])for(const n of [2,3,4,5,6])test(`${id}: ${n} players have private evidence and owned controls, complete all 5 Badges`,()=>{
 const {e,r,p}=setup(id,n),plans=id==='cloud-adventure'?cloudPlans:meadowPlans;
 for(let round=0;round<5;round++){
  const views=r.players.map(x=>e.view(r,x));assert.equal(new Set(views.map(v=>v.deadline)).size,1);assert.ok(views.every(v=>v.expert!.ownKeys.length&&v.brief!.observations!.length));assert.equal(new Set(views.flatMap(v=>v.expert!.ownKeys)).size,6);assert.equal(new Set(views.flatMap(v=>v.brief!.observations!.map(o=>o.text))).size,6);
  const own=views[0].expert!.ownKeys,foreign=expertStages(id)[round].fields.find(f=>!own.includes(f.key))!;assert.throws(()=>e.mechanism(r,p,{...scope(r),key:foreign.key,value:plans[round][foreign.key]}),/own mechanism/);
  const full=JSON.stringify(views[0]);for(const other of views.slice(1))for(const clue of other.brief!.observations!)assert.ok(!full.includes(clue.text));
  fill(e,r,plans[round]);check(e,r);fill(e,r,plans[round]);launch(e,r);assert.equal(r.result!.success,true);assert.equal(r.score,round+1);assert.equal(r.expert!.board.restored!.length,round+1);e.tick(r.deadline!+1);if(round<4)e.tick(r.deadline!+1);
 }
 assert.equal(r.phase,'finished');assert.equal(r.tiny!.completed.length,5);assert.equal(r.score,5);e.replay(r,p);assert.equal(r.phase,'lobby');assert.equal(r.expert,undefined);assert.equal(r.tiny!.completed.length,0);
});
for(const id of ['cloud-adventure','meadow-rescue'])for(let failureRound=0;failureRound<5;failureRound++)test(`${id}: mission ${failureRound+1} retries, reconnects, then Assist leaves viable state`,()=>{
 const {e,r}=setup(id),plans=id==='cloud-adventure'?cloudPlans:meadowPlans;
 for(let round=0;round<5;round++)for(let attempt=1;attempt<=(round===failureRound?2:1);attempt++){
  const plan={...plans[round]},[key,bad]=badKeys[id][round];if(round===failureRound)plan[key]=bad;fill(e,r,plan);check(e,r);fill(e,r,plan);
  const board=structuredClone(r.expert!.board),settings={...r.expert!.settings},deadline=r.deadline;const hero=r.players[1];e.disconnect(hero.socketId!);const restored=e.join(r.code,'','reconnected',hero.token);assert.deepEqual(restored.r.expert!.board,board);assert.deepEqual(restored.r.expert!.settings,settings);assert.equal(restored.r.deadline,deadline);
  launch(e,r);assert.equal(r.result!.success,round!==failureRound);assert.equal(r.result!.retry,round===failureRound&&attempt===1);assert.equal(r.result!.assisted,round===failureRound&&attempt===2);
  if(r.result!.assisted)assert.equal(expertSuccess(id,round,r.expert!.settings,r.expert!.board),true);e.tick(r.deadline!+1);if(r.phase!=='finished')e.tick(r.deadline!+1);
 }
 assert.equal(r.score,4);assert.equal(r.tiny!.completed.filter(x=>x.crewHelp).length,1);assert.equal(r.expert!.board.restored!.length,5);
});
test('Storm Passage commits distinct routes with team consent; immutable across weather, retry, reconnect and stale commands',()=>{
 const {e,r,p}=setup('cloud-adventure',6);for(let round=0;round<2;round++){fill(e,r,cloudPlans[round]);check(e,r);launch(e,r);e.tick(r.deadline!+1);e.tick(r.deadline!+1)}
 assert.throws(()=>e.mechanism(r,p,{...scope(r),operation:'check'}),/Everyone/);fill(e,r,cloudPlans[2]);r.players.forEach(x=>e.mechanism(r,x,{...scope(r),ready:true}));const old=scope(r);check(e,r);assert.equal(r.expert!.ready.length,0);assert.deepEqual(r.expert!.board.weather!.prepared,{primary:'upper',backup:'lower'});assert.throws(()=>e.mechanism(r,p,{...old,key:'primary',value:'lower'}),/changed/);assert.throws(()=>e.mechanism(r,p,{...scope(r),key:'primary',value:'lower'}),/fixed/);assert.throws(()=>e.mechanism(r,p,{...scope(r),operation:'check'}),/already/);
 fill(e,r,{...cloudPlans[2],active:'primary'});launch(e,r);assert.equal(r.result!.retry,true);e.tick(r.deadline!+1);e.tick(r.deadline!+1);assert.deepEqual(r.expert!.settings,{primary:'upper',backup:'lower'});assert.equal(r.expert!.board.weather!.checked,true);assert.throws(()=>e.mechanism(r,p,{...scope(r),key:'primary',value:'lower'}),/fixed/);fill(e,r,cloudPlans[2]);launch(e,r);assert.equal(r.result!.success,true);
});
test('valid alternatives are equally accepted; incompatible water, paths and flight fail',()=>{
 const cloudBoard={objectives:[],assisted:[],weather:{round:4,checked:true}},meadowBoard={objectives:[],assisted:[],restored:['a','b','c','d']};
 assert.ok(expertSuccess('cloud-adventure',0,{...cloudPlans[0],route:'south',height:'high',sail:'reefed'},cloudBoard));assert.ok(expertSuccess('cloud-adventure',4,{...cloudPlans[4],millRoute:'sheltered',millMode:'low'},cloudBoard));
 assert.ok(expertSuccess('cloud-adventure',2,{...cloudPlans[2],primary:'lower',backup:'upper',active:'primary'},{...cloudBoard,weather:{round:2,checked:true,prepared:{primary:'lower',backup:'upper'}}}));
 for(const water of ['orchard-2','flowers-2'])for(const foodRoute of ['bridge','ford'])for(const friendRoute of ['bridge','ford'])for(const power of ['solar','water'])for(const ret of ['open','closed'])for(const arrival of ['together','groups'])assert.equal(expertSuccess('meadow-rescue',4,{water,foodRoute,friendRoute,power,return:ret,arrival},meadowBoard),(power==='solar'||ret==='open')&&(foodRoute!==friendRoute||arrival==='groups'));
 assert.ok(expertSuccess('meadow-rescue',0,{...meadowPlans[0],waterHelper:'bear',plantHelper:'rabbit',cargoHelper:'dog',lightHelper:'cat',schedule:'serial'},meadowBoard));assert.ok(expertSuccess('meadow-rescue',1,{...meadowPlans[1],fruitRoute:'ford',flowerRoute:'bridge'},meadowBoard));assert.ok(expertSuccess('meadow-rescue',2,{...meadowPlans[2],orchard:'1',meadow:'2'},meadowBoard));assert.ok(expertSuccess('meadow-rescue',3,{...meadowPlans[3],power:'water',return:'open',lanes:'one',arrival:'groups'},meadowBoard));
});
test('new UI retains child narration, restored layers, fixed routes, finale roster and accessible controls',()=>{
 const {e,r,p}=setup('meadow-rescue',6);for(let round=0;round<5;round++){fill(e,r,meadowPlans[round]);launch(e,r);e.tick(r.deadline!+1);if(round<4)e.tick(r.deadline!+1)}const view=e.view(r,p),html=renderToStaticMarkup(React.createElement(CollectionAdventure,{view,connected:true,pending:false,remaining:0,command:async()=>{}}));assert.match(html,/Together, We Did It!/);assert.match(html,/The Great Meadow is alive again!/);assert.match(html,/TOGETHER!/);assert.match(html,/Master Adventure/);assert.match(html,/Read to me/);assert.match(html,/Water flows to orchard/);assert.match(html,/All five original Tiny Heroes/);for(const player of r.players)assert.ok(html.includes(player.name));assert.doesNotMatch(html,/Skip →/);assert.match(collectionNarration(view),/Together, We Did It!/);
 const fresh=renderToStaticMarkup(React.createElement(CollectionMap,{adventureId:'meadow-rescue'}));assert.match(fresh,/saturate\(0.65\)/);assert.doesNotMatch(fresh,/Water flows to orchard/);
 const sky=renderToStaticMarkup(React.createElement(CollectionMap,{adventureId:'cloud-adventure'}));assert.match(sky,/Storm Passage/);assert.match(sky,/storm-marker/);
});
