import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine,type Room} from '../server/engine';
import {brief,resolve} from '../server/modes';
import {iceRescue} from '../shared/tiny-adventures';
import {iceRoutes} from '../server/ice-expedition';
import {AdventureProgress,MissionMap} from '../src/TinyWorld';
import {TinyProgression,progressionAudio} from '../src/TinyProgression';
import {TinyHeroExperience,heroNarration,HeroInstructions} from '../src/TinyHeroExperience';
function attempt(e:Engine,r:Room,action:(slot:number)=>Record<string,string>){e.tick(r.deadline!+1);r.players.forEach(p=>e.submit(r,p,r.round,action(p.slot),r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run));e.tick(r.deadline!+1)}
function forest(assist=false){const e=new Engine();const {r,p}=e.create('tiny','Captain','c');const h=e.join(r.code,'Hero','h').p;r.players.forEach(p=>e.ready(r,p));e.start(r,p);for(const [i,tool] of ['rope','ladder','lamp','blanket','boat'].entries()){
 if(assist&&i===0){for(let n=0;n<2;n++){attempt(e,r,(slot):Record<string,string>=>slot?{tool:'blanket'}:{support:'save'});e.tick(r.deadline!+1)}}else{attempt(e,r,(slot):Record<string,string>=>slot?{tool}:{support:'save'});e.tick(r.deadline!+1)}
 }return {e,r,p,h}}
test('Ice uses five expedition locations and no Forest tool tasks or public clue answers',()=>{
 assert.deepEqual(iceRescue.rescues.map(r=>r.challenge?.location),['Frozen Lake','Warm Shelter','Snowstorm Trail','Windy Crossing','Blizzard Station']);
 assert.equal(new Set(iceRescue.rescues.map(r=>r.mapPosition.join(','))).size,5);
 assert.doesNotMatch(iceRescue.intro,/pick a tool/i);
 for(let i=0;i<5;i++)for(let count=2;count<=6;count++){
  const clues=new Set<string>();for(let slot=1;slot<count;slot++){const b=brief('tiny',i,slot,count,2,'ice-rescue');assert.ok(b.message.length>35);assert.ok(b.visuals?.length);assert.deepEqual(b.tasks.map(t=>t.key),['route']);clues.add(b.message)}
  assert.equal(clues.size,count-1);
 }
});
test('warm routes and sheltered routes are valid alternatives with clear finite resource costs',()=>{
 for(const index of [1,3,4]){const rule=iceRoutes[iceRescue.rescues[index].id];
  const free=resolve('tiny',index,[{route:rule.free,support:'save'},{route:rule.free}],2,'ice-rescue');assert.equal(free.success,true);assert.equal(free.bonus,2);
  const warm=resolve('tiny',index,[{route:rule.warm!,support:'warm'},{route:rule.warm!}],2,'ice-rescue');assert.equal(warm.success,true);assert.equal(warm.bonus,1);
  assert.equal(resolve('tiny',index,[{route:rule.warm!,support:'save'},{route:rule.warm!}],2,'ice-rescue').success,false);
  assert.equal(resolve('tiny',index,[{route:rule.free,support:'save'},{route:rule.warm!}],2,'ice-rescue').success,false);
 }
});
test('Blizzard Finale remains winnable at 2, 1 and 0 packs; saved warmth gives the shorter route',()=>{
 for(const packs of [2,1,0]){
  assert.equal(resolve('tiny',4,[{route:'shelter-tunnel',support:'save'},{route:'shelter-tunnel'}],packs,'ice-rescue').success,true);
  const short=resolve('tiny',4,[{route:'beacon-ridge',support:'warm'},{route:'beacon-ridge'}],packs,'ice-rescue');assert.equal(short.success,packs>0);assert.equal(short.bonus,Math.max(0,packs-1));
 }
});
test('one Team Assist completes Forest with 5 home, 4 badges and Ice unlock; replay explicitly offers all badges',()=>{
 const {e,r,p}=forest(true),v=e.view(r,p);assert.equal(r.phase,'finished');assert.equal(r.score,4);assert.equal(v.adventure?.completed.length,5);assert.equal(v.adventure?.completed.filter(c=>c.crewHelp).length,1);assert.ok(v.progression?.unlocked.includes('ice-rescue'));
 const progress=renderToStaticMarkup(React.createElement(AdventureProgress,{view:v}));assert.match(progress,/4 \/ 5 Rescue Badges/);assert.match(progress,/1 Team Assist/);assert.doesNotMatch(progress,/tiny-icon-heart/);
 const html=renderToStaticMarkup(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}}));assert.match(html,/Continue to Ice Rescue/);assert.match(html,/Can you earn all 5 badges/);assert.match(progressionAudio(v),/1 Team Assist/);
});
test('Ice retry and reconnect retain route, warmth and meaningful narration without Forest tool controls',()=>{
 const {e,r,p,h}=forest();e.chooseAdventure(r,p,'ice-rescue');r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 attempt(e,r,()=>({route:'cracked-edge'}));assert.equal(r.result?.retry,true);assert.equal(r.tiny?.completed.length,0);e.tick(r.deadline!+1);e.tick(r.deadline!+1);
 e.submit(r,h,0,{route:'blue-shelf'},2,'ice-rescue',r.tinyProgress!.run);e.disconnect('h');e.join(r.code,'','h2',h.token);const v=e.view(r,h);assert.deepEqual(v.ownAction,{route:'blue-shelf'});assert.equal(v.bonus,2);assert.equal(v.adventure?.attempt,2);
 e.submit(r,p,0,{route:'blue-shelf'},2,'ice-rescue',r.tinyProgress!.run);e.tick(r.deadline!+1);assert.equal(r.result?.success,true);
 const child=e.view(r,h);const html=renderToStaticMarkup(React.createElement(TinyHeroExperience,{view:child,actions:{},setActions:()=>{},connected:true,pending:false,remaining:3,command:async()=>{}}));assert.doesNotMatch(html,/Pick a tool|tool-art/);assert.match(heroNarration(child),/Warm Packs remaining: 2/);
 const map=renderToStaticMarkup(React.createElement(MissionMap,{view:child}));assert.match(map,/ice-expedition-map/);assert.match(map,/Frozen Lake/);assert.match(map,/Blizzard Station/);assert.doesNotMatch(map,/forest-map|ice-map\.webp/);
 const rules=renderToStaticMarkup(React.createElement(()=>HeroInstructions({ice:true})));assert.match(rules,/Choose a route/);assert.doesNotMatch(rules,/Pick a tool/);
});
