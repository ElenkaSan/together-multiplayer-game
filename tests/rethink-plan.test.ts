import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {TeamExpeditionExperience,expeditionNarration} from '../src/TeamExpedition';
import {Engine} from '../server/engine';
import {expeditionSolutions} from '../server/team-expeditions';
const setup=(id='jungle-adventure',count=3)=>{const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<count;i++)e.join(r.code,`Hero ${i}`,`h${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);e.tick(r.deadline!+1);const scope=()=>({round:r.round,attempt:r.tiny!.attempt,adventureId:id,run:r.tinyProgress!.run,planVersion:r.teamPlanVersion??0});const submit=(player= p,action=expeditionSolutions[id][r.round],version=scope().planVersion)=>e.submit(r,player,r.round,action,r.tiny!.attempt,id,r.tinyProgress!.run,undefined,version);return {e,r,p,scope,submit}};
for(const id of ['jungle-adventure','treasure-island','desert-rescue'])for(const count of [2,3,6])test(`${id}: ${count} players can rethink without losing an attempt, clues or time`,()=>{
 const {e,r,p,scope,submit}=setup(id,count),hero=r.players[1];for(const h of r.players.slice(1))e.shareAllClues(r,h,scope());
 const deadline=r.deadline,attempt=r.tiny!.attempt,bonus=r.bonus;submit();const oldVersion=scope().planVersion;
 if(count>2)submit(hero,{confirm:'ready'});
 e.rethinkPlan(r,hero,scope());assert.equal(r.phase,'action');assert.ok(r.players.every(x=>!x.action));assert.equal(r.deadline,deadline);assert.equal(r.tiny!.attempt,attempt);assert.equal(r.bonus,bonus);assert.equal(r.score,0);assert.ok(e.view(r,p).clues!.allShared);assert.equal(e.view(r,p).rethinkBy,'Hero 1');assert.equal(e.view(r,hero).teamPlan,null);
 assert.throws(()=>e.rethinkPlan(r,hero,{...scope(),planVersion:oldVersion}));assert.throws(()=>submit(hero,{confirm:'ready'}));
 e.disconnect(hero.socketId!);e.join(r.code,'','new',hero.token);assert.equal(e.view(r,hero).rethinkBy,'Hero 1');assert.ok(e.view(r,hero).clues!.own.every(c=>c.shared));
 submit();assert.equal(e.view(r,p).rethinkBy,null);assert.throws(()=>submit(hero,{confirm:'ready'},oldVersion));
 for(const h of r.players.slice(1))submit(h,{confirm:'ready'});assert.equal(r.phase,'locked');assert.throws(()=>e.rethinkPlan(r,hero,scope()));e.tick(r.deadline!+1);assert.ok(r.result?.success);assert.equal(r.score,1);
});
test('rethink rejects wrong scopes, roles, foreign objects, disconnected seats and closed phases',()=>{
 const {e,r,p,scope,submit}=setup(),h=r.players[1];assert.throws(()=>e.rethinkPlan(r,h,scope()));submit();const rev=r.revision;
 for(const bad of [{...scope(),round:2},{...scope(),attempt:9},{...scope(),run:0},{...scope(),adventureId:'treasure-island'},{...scope(),planVersion:999}])assert.throws(()=>e.rethinkPlan(r,h,bad));
 assert.throws(()=>e.rethinkPlan(r,p,scope()));assert.throws(()=>e.rethinkPlan(r,{...h},scope()));e.disconnect(h.socketId!);assert.throws(()=>e.rethinkPlan(r,h,scope()));assert.equal(r.revision,rev+1);
 e.join(r.code,'','back',h.token);r.deadline=Date.now()-1;assert.throws(()=>e.rethinkPlan(r,h,scope()));
});
test('rethink is unavailable in the other Adventures and Signal Lost',()=>{
 const e=new Engine();for(const id of ['forest-rescue','ice-rescue','ocean-adventure','magic-kingdom','moon-mission','cloud-adventure','meadow-rescue']){const {r}=e.create('tiny','Captain','c',id),{p:h}=e.join(r.code,'Hero','h');assert.throws(()=>e.rethinkPlan(r,h,{round:0,attempt:1,run:1,adventureId:id,planVersion:0}));}
 const {r,p}=e.create('signal','Captain','s');assert.throws(()=>e.rethinkPlan(r,p,{round:0,attempt:1,run:1,adventureId:'',planVersion:0}));
});
test('new round and retry clear rethink notices and confirmation versions',()=>{
 const {e,r,scope,submit}=setup();submit();e.rethinkPlan(r,r.players[1],scope());e.begin(r);assert.equal(r.teamPlanVersion,0);assert.equal(r.rethinkBy,null);assert.ok(r.players.every(p=>!p.action));
});

test('hero UI offers agreement and rethink, keeps rethink after own Ready, and announces review',()=>{
 const {e,r,p,scope,submit}=setup(),h=r.players[1];
 const render=(player=h,connected=true)=>renderToStaticMarkup(createElement(TeamExpeditionExperience,{view:e.view(r,player),actions:{},setActions:()=>{},connected,pending:false,remaining:30,command:async()=>{}}));
 assert.match(render(),/<button[^>]*disabled[^>]*>💬 Let’s rethink<\/button>/);submit();let html=render();assert.match(html,/I agree — Ready/);assert.match(html,/<button class="secondary hero-ready">💬 Let’s rethink<\/button>/);assert.doesNotMatch(render(p),/>💬 Let’s rethink<\/button>/);
 submit(h,{confirm:'ready'});assert.match(render(),/<button class="secondary hero-ready">💬 Let’s rethink<\/button>/);assert.match(render(h,false),/<button[^>]*disabled[^>]*>💬 Let’s rethink<\/button>/);
 e.rethinkPlan(r,h,scope());assert.match(render(p),/role="status"[^>]*>💬 Hero 1 asks: Let’s rethink/);assert.match(expeditionNarration(e.view(r,h)),/Let’s rethink/);
});
