import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {Engine} from '../server/engine';
import {collectionEvidence,meadowClueIcons} from '../server/collection-mechanisms';
import {meadowStages} from '../shared/collection-adventures';
import {MeadowClueArt,MeadowChoiceArt,MeadowMissionScene} from '../src/MeadowArt';
import {CollectionAdventure,CollectionMap} from '../src/CollectionAdventure';
import {ShareClues} from '../src/ShareClues';
import {meadowPlans} from './collection-fixtures';
const noop=async()=>{};
test('all 30 Meadow clues have explicit subject-specific illustrations, never the generic leaf',()=>{
 assert.equal(meadowClueIcons.length,5);
 for(let round=0;round<5;round++)for(const [index,text] of collectionEvidence['meadow-rescue'][round].entries()){
  const icon=meadowClueIcons[round][index];assert.ok(icon&&icon!=='leaf');const html=render(React.createElement(MeadowClueArt,{icon,text}));assert.ok(html.includes(`data-meadow-clue="${icon}"`));assert.match(html,/aria-label=/);assert.doesNotMatch(html,/leaf\.webp|expedition-icon-leaf/);
 }
 const water=render(React.createElement(MeadowClueArt,{icon:'meadow-water-before-plant',text:'WATER must happen before PLANT.'}));assert.match(water,/task-water/);assert.match(water,/task-plant/);assert.match(water,/→/);
 const delivery=render(React.createElement(MeadowClueArt,{icon:'meadow-delivery-before-lanterns',text:'DELIVERY before LANTERNS'}));assert.match(delivery,/task-delivery/);assert.match(delivery,/task-lanterns/);
});
for(const [round,stage] of meadowStages.entries())test(`${stage.location}: every control state has a different literal picture and shared preview`,()=>{
 for(const f of stage.fields){const states=f.options.map(o=>render(React.createElement(MeadowChoiceArt,{field:round===1&&f.key==='gate'?'bridgeGate':f.key,value:o.value})));assert.equal(new Set(states).size,states.length,`${f.key} alternatives must differ`);assert.ok(states.every(s=>s.includes('data-meadow-art=')));assert.ok(states.every(s=>!s.includes('leaf.webp')))}
 const scene=render(React.createElement(MeadowMissionScene,{round,settings:meadowPlans[round],completed:round}));assert.match(scene,new RegExp(stage.location));assert.match(scene,/This preview does not check the answer/);for(const f of stage.fields)assert.ok(scene.includes(f.title));assert.doesNotMatch(scene,/Not set/);
 const empty=render(React.createElement(MeadowMissionScene,{round,settings:{},completed:round}));assert.equal((empty.match(/class="meadow-unset"/g)||[]).length,6);assert.match(empty,/Choose together/);
});
for(const count of [2,6])test(`Meadow ${count} players: private, shared and owned-control pictures stay consistent throughout five stages`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','meadow-rescue');for(let i=1;i<count;i++)e.join(r.code,'Hero '+i,'h'+i);r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(let round=0;round<5;round++){
  r.round=round;e.begin(r);e.tick(r.deadline!+1);
  for(const player of r.players){const v=e.view(r,player);assert.ok(v.clues!.own.every(c=>c.icon.startsWith('meadow-')));for(const c of v.clues!.own)e.shareClue(r,player,{round,attempt:v.adventure!.attempt,adventureId:'meadow-rescue',run:v.progression!.run,clue:c.index});
   const html=render(React.createElement(CollectionAdventure,{view:e.view(r,player),connected:true,pending:false,remaining:90,command:noop}));assert.match(html,/data-meadow-clue=/);assert.match(html,/meadow-mission-scene/);assert.doesNotMatch(html,/expedition-icon-leaf|leaf\.webp/);
  }
  const cap=render(React.createElement(ShareClues,{view:e.view(r,p),connected:true,pending:false,command:noop}));assert.match(cap,/Team Clues/);assert.equal((cap.match(/data-meadow-clue=/g)||[]).length,6);
 }
});
test('Meadow map has exactly one check per completed stage, attached to its location label',()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','meadow-rescue');e.join(r.code,'Hero','h');r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(let n=0;n<=5;n++){r.tiny!.completed=Array.from({length:n},(_,i)=>({id:meadowStages[i].id,crewHelp:false,badge:true} as any));const html=render(React.createElement(CollectionMap,{view:e.view(r,p)}));assert.equal((html.match(/tiny-icon-ready/g)||[]).length,n);assert.doesNotMatch(html,/village-restored/);if(n===1)assert.match(html,/tiny-icon-ready[\s\S]*?<strong>Sunflower Village<\/strong>/)}
});

test('Meadow pictures distinguish closed cargo, task modes and final route compatibility',()=>{
 const choice=(field:string,value:string)=>render(React.createElement(MeadowChoiceArt,{field,value}));
 assert.doesNotMatch(choice('crate','closed'),/data-crate-fruit/);
 assert.match(choice('crate','open'),/data-crate-fruit/);
 const clue=(icon:string)=>render(React.createElement(MeadowClueArt,{icon,text:icon}));
 const schedule=clue('meadow-schedule');assert.match(schedule,/>Parallel</);assert.match(schedule,/>Serial</);
 const final=clue('meadow-route-arrival');assert.match(final,/>Same route</);assert.match(final,/>Different routes</);assert.match(final,/>Groups or together</);assert.doesNotMatch(final,/data-meadow-art="lanes"/);
});
