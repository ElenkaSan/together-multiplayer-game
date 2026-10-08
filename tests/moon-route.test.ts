import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {moonTravel,moonRouteNames,moonRouteState,moonAnchors,MoonProgressPath} from '../src/MoonRoute';
import {Engine} from '../server/engine';
import {ExpertAdventure} from '../src/ExpertAdventure';
import {moonPlans} from './expert-fixtures';
import {expertFields} from '../shared/expert-adventures';
test('Moon itinerary closes at the same base and highlights only authoritative progress',()=>{
 assert.deepEqual(moonRouteNames,['Moon Base','Crater Crossing','Solar Ridge','Lost Rover Valley','Earth Signal','Moon Base']);assert.deepEqual(moonAnchors[5],moonAnchors[0]);
 for(let completed=0;completed<=5;completed++){const html=renderToStaticMarkup(React.createElement(MoonProgressPath,{completed}));assert.equal((html.match(/class="moon-route-segment route-traveled"/g)||[]).length,completed);assert.equal((html.match(/class="moon-route-segment route-next"/g)||[]).length,completed===5?0:1);assert.equal(moonRouteState(4,completed),completed===5?'traveled':completed===4?'next':'future');assert.match(html,/Earth Signal → Moon Base/)}
});
test('return animation is local, skippable state; reconnect, catch-up, retry and Effects Off snap',()=>{
 assert.deepEqual(moonTravel(4,5,true),{from:4,to:5});assert.equal(moonTravel(null,5,true),null);assert.equal(moonTravel(5,5,true),null);assert.equal(moonTravel(2,5,true),null);assert.equal(moonTravel(4,5,false),null);assert.equal(moonTravel(3,3,true),null);
});
test('completed Moon keeps the approved map and renders the team home without changing badges or board',()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','moon-mission');e.join(r.code,'Hero','h');r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(const plan of moonPlans()){
  e.tick(r.deadline!+1);const scope=()=>({round:r.round,attempt:r.tiny!.attempt,adventureId:'moon-mission',run:r.tinyProgress!.run,version:r.expert!.version});for(const x of r.players)for(const f of expertFields('moon-mission',r.round,x.slot,2))e.mechanism(r,x,{...scope(),key:f.key,value:plan[f.key]});for(const x of r.players)e.mechanism(r,x,{...scope(),ready:true});e.submit(r,p,r.round,{launch:'launch'},r.tiny!.attempt,'moon-mission',r.tinyProgress!.run,r.expert!.version);e.tick(r.deadline!+1);e.tick(r.deadline!+1);
 }
 const view=e.view(r,p),before=JSON.stringify(view.expert!.board);const html=renderToStaticMarkup(React.createElement(ExpertAdventure,{view,connected:true,pending:false,remaining:0,command:async()=>{}}));assert.match(html,/moon-map.webp/);assert.match(html,/Expedition home at Moon Base/);assert.match(html,/Mission Complete! Connection Restored!/);assert.match(html,/left:29%;top:88%/);assert.equal(r.score,5);assert.equal(JSON.stringify(e.view(r,p).expert!.board),before);assert.equal((html.match(/route-traveled/g)||[]).length,5);assert.doesNotMatch(html,/Skip →/);
});
