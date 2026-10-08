import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine,type Room,type Player} from '../server/engine';
import {brief,resolve,type Action} from '../server/modes';
import {desertSolutions,oceanPlans} from '../server/advanced-evidence';
import {stationFields,oceanStages,oceanPower} from '../shared/advanced-adventures';
import {availableAdventures,adventureDifficulty} from '../shared/tiny-adventures';
import {TeamExpeditionExperience,ExpeditionMap} from '../src/TeamExpedition';
import {oceanNarration} from '../src/OceanAdventure';
import {TinyProgression} from '../src/TinyProgression';
function setup(id:string,n=2){const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<n;i++)e.join(r.code,'Hero '+i,'h'+i);r.players.forEach(p=>e.ready(r,p));e.start(r,p);return {e,r,p}}
function scope(r:Room){return {round:r.round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run,version:r.ocean!.version}}
function setOcean(e:Engine,r:Room,plan:Action){for(const p of r.players)for(const f of stationFields(r.round,p.slot,r.players.length))e.station(r,p,{...scope(r),key:f.key,value:plan[f.key]});for(const p of r.players)e.station(r,p,{...scope(r),ready:true})}
function launch(e:Engine,r:Room,p=r.players[0]){e.submit(r,p,r.round,{launch:'launch'},r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run,r.ocean!.version)}
function finishAttempt(e:Engine,r:Room,plan:Action){e.tick(r.deadline!+1);if(r.tiny!.id==='ocean-adventure'){setOcean(e,r,plan);launch(e,r)}else for(const p of r.players)e.submit(r,p,r.round,p.slot?{confirm:'ready'}:plan,r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run);e.tick(r.deadline!+1)}
for(const count of [2,3,6])for(const id of ['desert-rescue','ocean-adventure'])test(`${id}: ${count} players, unique clues, all stages, retry, Assist, reconnect and independent replay`,()=>{
 const {e,r,p}=setup(id,count),hero=r.players[count-1],originalTokens=r.players.map(p=>p.token);
 for(let round=0;round<5;round++){
  const observations=r.players.flatMap(p=>brief('tiny',round,p.slot,count,0,id).observations!);assert.equal(observations.length,6);assert.equal(new Set(observations.map(o=>o.text)).size,6);assert.ok(r.players.every(p=>brief('tiny',round,p.slot,count,0,id).observations!.length>0));
  if(id==='ocean-adventure'){const keys=r.players.flatMap(p=>stationFields(round,p.slot,count).map(f=>f.key));assert.equal(keys.length,6);assert.equal(new Set(keys).size,6);assert.ok(r.players.every(p=>stationFields(round,p.slot,count).length>0));}
  const plan=id==='desert-rescue'?desertSolutions[round]:oceanPlans[round][0];
  if(round===0){const wrong={...plan,[id==='desert-rescue'?'drink':'route']:id==='desert-rescue'?'shell':'surf'};finishAttempt(e,r,wrong);assert.equal(r.result?.retry,true);assert.equal(r.tiny!.completed.length,0);assert.equal(r.score,0);e.disconnect(hero.socketId!);e.join(r.code,'','retry-restored',hero.token);assert.equal(e.view(r,hero).adventure?.attempt,1);e.tick(r.deadline!+1);assert.equal(r.tiny!.attempt,2)}
  if(round===1){for(let attempt=1;attempt<=2;attempt++){finishAttempt(e,r,{...plan,[id==='desert-rescue'?'landmark':'route']:id==='desert-rescue'?'shimmer':'roots'});assert.equal(r.result?.assisted,attempt===2);e.tick(r.deadline!+1)}continue}
  if(round===2){e.tick(r.deadline!+1);if(id==='ocean-adventure'){setOcean(e,r,plan);const settings={...r.ocean!.settings},version=r.ocean!.version;e.disconnect(hero.socketId!);assert.throws(()=>launch(e,r),/connected and Ready/);e.join(r.code,'','normal-restored',hero.token);assert.deepEqual(e.view(r,hero).ocean?.settings,settings);assert.equal(e.view(r,hero).ocean?.version,version);assert.equal(e.view(r,hero).ocean?.ready,true);launch(e,r)}else{e.submit(r,p,round,plan,r.tiny!.attempt,id,1);e.disconnect(hero.socketId!);e.join(r.code,'','normal-restored',hero.token);assert.deepEqual(e.view(r,hero).teamPlan,plan);for(const helper of r.players.slice(1))e.submit(r,helper,round,{confirm:'ready'},r.tiny!.attempt,id,1)}e.tick(r.deadline!+1)}else finishAttempt(e,r,plan);
  assert.equal(r.result?.success,true);e.tick(r.deadline!+1);
 }
 assert.equal(r.phase,'finished');assert.equal(r.tiny!.completed.length,5);assert.equal(r.score,4);assert.equal(r.tiny!.completed.filter(s=>s.crewHelp).length,1);assert.equal(r.tinyProgress!.results[id].badges,4);assert.deepEqual(r.players.map(p=>p.token),originalTokens);
 const html=renderToStaticMarkup(React.createElement(TinyProgression,{view:e.view(r,p),connected:true,pending:false,command:async()=>{}}));assert.match(html,id==='desert-rescue'?/Caravan Rescued!/:/Ocean Light Restored!/);assert.doesNotMatch(html,/friends are home|Locked/);assert.match(html,/1 Team Assist/);assert.match(html,/Can you earn all 5 badges/);
 e.replay(r,p);assert.equal(r.tiny!.completed.length,0);assert.equal(r.phase,'lobby');assert.equal(r.ocean,undefined);assert.equal(r.tinyProgress!.results[id].badges,4);
});
test('Ocean owns every control, rejects stale versions/scopes and requires everyone to agree again after any edit',()=>{
 const {e,r,p}=setup('ocean-adventure',3);e.tick(r.deadline!+1);const other=r.players[1];
 assert.throws(()=>e.station(r,p,{...scope(r),key:'thrust',value:'gentle'}),/own station/);
 assert.throws(()=>e.station(r,p,{...scope(r),run:0,key:'route',value:'channel'}),/closed attempt/);
 assert.throws(()=>e.station(r,p,{...scope(r),ready:true}),/settings first/);
 const narrationBefore=oceanNarration(e.view(r,p));const old=scope(r);e.station(r,p,{...old,key:'route',value:'channel'});assert.equal(oceanNarration(e.view(r,p)),narrationBefore);assert.throws(()=>e.station(r,other,{...old,key:'thrust',value:'gentle'}),/settings changed/);
 setOcean(e,r,oceanPlans[0][0]);assert.equal(r.ocean!.ready.length,3);const previous=r.ocean!.version;
 e.station(r,p,{...scope(r),key:'route',value:'surf'});assert.equal(r.ocean!.ready.length,0);
 assert.throws(()=>e.submit(r,p,0,{launch:'launch'},1,'ocean-adventure',1,previous),/settings changed/);
 assert.throws(()=>launch(e,r),/every station/i);assert.throws(()=>launch(e,r,other),/Captain/);
 setOcean(e,r,oceanPlans[0][0]);launch(e,r);assert.equal(r.phase,'locked');assert.ok(r.players.every(p=>p.action));assert.throws(()=>e.station(r,p,{...scope(r),key:'route',value:'surf'}),/round is closed/);
});
test('Ocean compatible alternatives have equal badges and invalid dependencies or excess power fail',()=>{
 for(let i=0;i<5;i++)for(const plan of oceanPlans[i]){const actions=Array.from({length:6},(_,slot)=>Object.fromEntries(stationFields(i,slot,6).map(f=>[f.key,plan[f.key]])));actions[0].launch='launch';assert.equal(resolve('tiny',i,actions,0,'ocean-adventure').success,true)}
 const split=(round:number,plan:Action)=>[{...Object.fromEntries(stationFields(round,0,2).map(f=>[f.key,plan[f.key]])),launch:'launch'},Object.fromEntries(stationFields(round,1,2).map(f=>[f.key,plan[f.key]]))];
 assert.equal(resolve('tiny',2,split(2,{...oceanPlans[2][0],thrust:'gentle'}),0,'ocean-adventure').success,false);assert.equal(oceanPower(2,{...oceanPlans[2][0],thrust:'gentle'}).used,4);
 assert.equal(resolve('tiny',4,split(4,{...oceanPlans[4][0],sensor:'sonar'}),0,'ocean-adventure').success,false);
 assert.equal(resolve('tiny',3,split(3,{...oceanPlans[3][0],signal:'blue'}),0,'ocean-adventure').success,false);
});
test('advanced screens retain child audio, visual choices, own station controls and separate completion labels',()=>{
 for(const id of ['desert-rescue','ocean-adventure']){const {e,r}=setup(id,6);e.tick(r.deadline!+1);for(const p of r.players){const v=e.view(r,p),html=renderToStaticMarkup(React.createElement(TeamExpeditionExperience,{view:v,actions:{},setActions:()=>{},connected:true,pending:false,remaining:50,command:async()=>{}}));assert.match(html,/Read to me/);assert.match(html,/expedition-icon/);assert.doesNotMatch(html,/Pick a tool|friends home|Warm Packs/);assert.equal('helperBriefs' in v,false);if(id==='ocean-adventure'){assert.match(html,/Working power/);assert.match(html,/Your station clues/);assert.equal(v.ocean!.ownKeys.length,1);assert.match(oceanNarration(v),/Set your station/);assert.match(html,p.slot===0?/Launch team plan/:/Captain launches/)}const map=renderToStaticMarkup(React.createElement(ExpeditionMap,{view:v}));assert.match(map,new RegExp(`${id==='desert-rescue'?'desert':'ocean'}-map.webp`));if(id==='ocean-adventure')assert.match(map,/submarine-art/);assert.doesNotMatch(JSON.stringify(v.adventure),/privateEvidence|The caravan needs drinking water|The sheltered channel is clear/);}}
 assert.equal(availableAdventures().length,10);assert.equal(adventureDifficulty(5),'Hard');assert.equal(adventureDifficulty(6),'Hard+');
});
