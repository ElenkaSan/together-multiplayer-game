import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine,type Room} from '../server/engine';
import {expertFields,expertPreview,type MoonBoard} from '../shared/expert-adventures';
import {expertSuccess} from '../server/expert-mechanisms';
import {ExpertAdventure,expertNarration} from '../src/ExpertAdventure';
import type {Action} from '../server/modes';
import {magicPlans,moonPlans} from './expert-fixtures';
function setup(id:string,n=2){const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<n;i++)e.join(r.code,'Explorer '+i,'h'+i);r.players.forEach(p=>e.ready(r,p));e.start(r,p);return {e,r,p}}
function scope(r:Room){return {round:r.round,attempt:r.tiny!.attempt,adventureId:r.tiny!.id,run:r.tinyProgress!.run,version:r.expert!.version}}
function set(e:Engine,r:Room,plan:Action){for(const p of r.players)for(const f of expertFields(r.tiny!.id,r.round,p.slot,r.players.length))e.mechanism(r,p,{...scope(r),key:f.key,value:plan[f.key]});for(const p of r.players)e.mechanism(r,p,{...scope(r),ready:true})}
function launch(e:Engine,r:Room,p=r.players[0]){e.submit(r,p,r.round,{launch:'launch'},r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run,r.expert!.version)}
function attempt(e:Engine,r:Room,plan:Action){e.tick(r.deadline!+1);set(e,r,plan);launch(e,r);e.tick(r.deadline!+1)}
for(const count of [2,3,4,5,6])for(const id of ['magic-kingdom','moon-mission'])test(`${id}: ${count} meaningful seats, retry, Assist, reconnect, completion and replay`,()=>{
 const {e,r,p}=setup(id,count),plans=id==='magic-kingdom'?magicPlans:moonPlans();
 for(let round=0;round<5;round++){
  e.tick(r.deadline!+1);
  const views=r.players.map(p=>e.view(r,p));assert.ok(views.every(v=>v.expert!.ownKeys.length>0));assert.equal(new Set(views.flatMap(v=>v.expert!.ownKeys)).size,6);assert.equal(new Set(views.flatMap(v=>v.brief!.observations!.map(o=>o.text))).size,6);assert.equal('helperBriefs' in views[0],false);
  if(round===0||round===1){const wrong={...plans[round],[id==='magic-kingdom'?round===0?'seal':'gate':round===0?'hatch':'pace']:id==='magic-kingdom'?round===0?'round':'cloud':round===0?'open':'fast'};
   set(e,r,wrong);launch(e,r);e.tick(r.deadline!+1);assert.equal(r.result?.retry,true);assert.equal(r.score,round);assert.equal(r.expert!.board.objectives.length,round);
   const hero=r.players[count-1],old=e.view(r,hero);e.disconnect(hero.socketId!);e.join(r.code,'','retry-reconnect',hero.token);assert.deepEqual(e.view(r,hero).expert!.board,old.expert!.board);e.tick(r.deadline!+1);assert.equal(r.tiny!.attempt,2);e.tick(r.deadline!+1);
   if(round===1){set(e,r,wrong);launch(e,r);e.tick(r.deadline!+1);assert.equal(r.result?.assisted,true);assert.equal(r.expert!.board.objectives.length,2);assert.equal(r.expert!.board.assisted.length,1);e.tick(r.deadline!+1);continue}
  }
  set(e,r,plans[round]);const hero=r.players[count-1],before=e.view(r,hero);e.disconnect(hero.socketId!);assert.throws(()=>launch(e,r),/connected|Ready/);e.join(r.code,'','reconnected',hero.token);assert.deepEqual(e.view(r,hero).expert,before.expert);launch(e,r);e.tick(r.deadline!+1);assert.equal(r.result?.success,true);assert.equal(r.expert!.board.objectives.length,round+1);e.tick(r.deadline!+1);
 }
 assert.equal(r.phase,'finished');assert.equal(r.score,4);assert.equal(r.tiny!.completed.length,5);assert.equal(r.tinyProgress!.results[id].assists,1);if(id==='moon-mission')assert.equal(r.expert!.board.connection,'restored');
 e.replay(r,p);assert.equal(r.expert,undefined);assert.equal(r.tinyProgress!.results[id].badges,4);
});
for(const mobility of ['grip','scanner'])for(const supply of ['battery','solar'])for(const mode of ['store','scan'])test(`Moon ${mobility}/${supply}/${mode}: all five Badges without Assist`,()=>{
 const {e,r}=setup('moon-mission',2),plans=moonPlans(mobility,supply,mode);
 for(const plan of plans){attempt(e,r,plan);assert.equal(r.result?.success,true);assert.equal(r.result?.assisted,false);e.tick(r.deadline!+1)}assert.equal(r.phase,'finished');assert.equal(r.score,5);assert.equal(r.expert!.board.mobility,mobility);assert.equal(r.expert!.board.supply,supply);assert.equal(r.expert!.board.relay,mode);assert.equal(r.expert!.board.assisted.length,0);
});
test('experiments are free, owned, scoped, synchronized and require fresh consent',()=>{
 const {e,r,p}=setup('magic-kingdom',3);e.tick(r.deadline!+1);const other=r.players[1];assert.throws(()=>e.mechanism(r,p,{...scope(r),key:'color',value:'0'}),/own/);assert.throws(()=>e.mechanism(r,p,{...scope(r),ready:true}),/first/);const old=scope(r),text=expertNarration(e.view(r,p));e.mechanism(r,p,{...old,key:'source',value:'1'});assert.equal(expertNarration(e.view(r,p)),text);assert.equal(r.tiny!.attempt,1);assert.equal(r.score,0);assert.equal(r.expert!.board.objectives.length,0);assert.throws(()=>e.mechanism(r,other,{...old,key:'color',value:'1'}),/changed/);assert.throws(()=>e.mechanism(r,p,{...scope(r),run:0,key:'source',value:'0'}),/closed/);set(e,r,magicPlans[0]);assert.equal(r.expert!.ready.length,3);e.mechanism(r,p,{...scope(r),key:'source',value:'2'});assert.equal(r.expert!.ready.length,0);assert.throws(()=>launch(e,r),/Ready/);assert.throws(()=>launch(e,r,other),/Captain/);set(e,r,magicPlans[0]);launch(e,r);assert.equal(r.phase,'locked');assert.throws(()=>e.mechanism(r,p,{...scope(r),key:'source',value:'1'}),/closed/);
});
test('cause-and-effect and alternative configurations are real, not answer labels',()=>{
 assert.deepEqual(expertPreview('magic-kingdom',0,magicPlans[0],{objectives:[],assisted:[]}).values,[1,1]);assert.equal(expertSuccess('magic-kingdom',0,{...magicPlans[0],source:'1'},{objectives:[],assisted:[]}),false);
 assert.equal(expertSuccess('magic-kingdom',1,{...magicPlans[1],a:'right',b:'up',c:'right',d:'up'},{objectives:[],assisted:[]}),true);
 for(const mobility of ['grip','scanner'])for(const supply of ['battery','solar'])for(const relay of ['store','scan']){const board:MoonBoard={mobility,supply,relay,objectives:[],assisted:[]};assert.equal(expertSuccess('moon-mission',3,{...moonPlans(mobility,supply,relay)[3],recovery:'repair'},board),true);assert.equal(expertSuccess('moon-mission',3,{...moonPlans(mobility,supply,relay)[3],method:'scanner'},board),mobility==='scanner');if(supply==='solar')assert.equal(expertSuccess('moon-mission',3,{...moonPlans(mobility,supply,relay)[3],source:'stored'},board),false)}
});
test('every new player UI has owned controls, shared mechanisms and child narration',()=>{
 for(const id of ['magic-kingdom','moon-mission']){const {e,r}=setup(id,6);e.tick(r.deadline!+1);for(const p of r.players){const view=e.view(r,p),html=renderToStaticMarkup(React.createElement(ExpertAdventure,{view,connected:true,pending:false,remaining:50,command:async()=>{}}));assert.match(html,/Read to me/);assert.match(html,/Your clue · your controls/);assert.doesNotMatch(html,/Pick a tool|friends home|Warm Packs/);assert.match(html,id==='magic-kingdom'?/mechanism-illustration/:/Mission Control Board/);assert.ok(expertNarration(view).includes(view.brief!.observations![0].text));assert.equal(view.expert!.ownKeys.length,1)}}
});
