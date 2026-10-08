import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {getAdventure,availableAdventures} from '../shared/tiny-adventures';
import {solutionFor} from '../server/tiny-adventures';
import {AdventurePicker} from '../src/TinyWorld';

test('fresh rooms can start any released adventure without completion; future packs remain unavailable',()=>{
 for(const id of availableAdventures()){
  const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);e.join(r.code,'Hero','h');
  assert.deepEqual(e.view(r,p).progression?.completed,[]);r.players.forEach(x=>e.ready(r,x));e.start(r,p);
  assert.equal(r.phase,'briefing');assert.equal(r.tiny?.id,id);
 }
 assert.throws(()=>new Engine().create('tiny','C','c','magic-kingdom'),/not available/);
});
test('starting with Ice then choosing Forest preserves room results, seats and reconnect',()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','ice-rescue');const hero=e.join(r.code,'Hero','h').p;
 r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(let i=0;i<5;i++){
  e.tick(r.deadline!+1);const route=solutionFor('ice-rescue',i).tool;
  for(const x of r.players)e.submit(r,x,i,{route,...(x.slot===0&&getAdventure('ice-rescue').rescues[i].challenge!.kind!=='route'&&i!==2?{support:i===3?'warm':'save'}:{})},1,'ice-rescue',r.tinyProgress!.run);
  e.tick(r.deadline!+1);e.tick(r.deadline!+1);
 }
 assert.equal(r.phase,'finished');assert.deepEqual(e.view(r,p).progression?.results['ice-rescue'],{friendsHome:5,badges:5,assists:0});
 const tokens=r.players.map(x=>x.token);e.adventureMap(r,p);e.chooseAdventure(r,p,'forest-rescue');assert.deepEqual(r.players.map(x=>x.token),tokens);
 e.disconnect('h');e.join(r.code,'','h2',hero.token);const v=e.view(r,hero);
 assert.equal(v.adventure?.id,'forest-rescue');assert.equal(v.progression?.results['ice-rescue'].badges,5);
 const html=renderToStaticMarkup(React.createElement(AdventurePicker,{selected:'forest-rescue',completed:v.progression!.completed,results:v.progression!.results,onSelect:()=>{}}));
 assert.match(html,/Completed/);assert.match(html,/5\/5 Rescue Badges/);assert.doesNotMatch(html,/Locked|Unlocked|Complete Forest Rescue/);
});
test('fresh Adventure Select offers all Explore actions and describes difficulty without locks',()=>{
 const html=renderToStaticMarkup(React.createElement(AdventurePicker,{selected:'forest-rescue',onSelect:()=>{}}));
 assert.equal((html.match(/<button[^>]*disabled/g)||[]).length,0);assert.equal((html.match(/Explore →/g)||[]).length,6);
 assert.match(html,/Level 1 · Easy/);assert.match(html,/Level 2 · Easy\+/);assert.match(html,/Coming Soon/);assert.doesNotMatch(html,/Locked|Unlock/);
});
