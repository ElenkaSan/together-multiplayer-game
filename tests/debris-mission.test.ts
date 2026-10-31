import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {DebrisMission,debrisRoutes} from '../src/DebrisMission';
import {solveSignal} from '../server/signal-puzzles';
function setup(count=2){const e=new Engine(),{r,p}=e.create('signal','Navigator','nav');for(let i=1;i<count;i++)e.join(r.code,`Station ${i}`,`s${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=1;e.begin(r);e.tick(r.deadline!+1);return{e,r,p,scope:{round:1,run:r.signal!.run,puzzleId:r.signal!.puzzle!.id}}}
for(const count of [2,3,4,5,6])test(`${count} crew: visual proposals validate ownership, synchronize and restore without exposing clues`,()=>{
 const {e,r,p,scope}=setup(count),deadline=r.deadline,integrity=r.integrity;
 for(const player of r.players){const v=e.view(r,player);assert.ok(solveSignal(v.signal!.board!,v.signal!.ownTelemetry).length>1);for(const task of v.brief!.tasks){const value=r.signal!.puzzle!.solution[task.key];e.signalDraft(r,player,{...scope,key:task.key,value});}assert.equal(e.view(r,player).signal!.communications.length,0);}
 const plans=e.view(r,p).signal!.flightPlans;
 for(const player of r.players){assert.deepEqual(e.view(r,player).signal!.flightPlans,plans);const html=renderToStaticMarkup(createElement(DebrisMission,{view:e.view(r,player),actions:e.view(r,player).signal!.ownDraft!,setActions:()=>{},connected:true,pending:false,command:async()=>({ok:true})}));assert.match(html,/Interactive holographic flight map/);assert.match(html,/Lock flight orders/);assert.match(html,/Equipment codes/);assert.equal((html.match(/class="debris-route/g)||[]).length,4);assert.doesNotMatch(html,/"solution"|"seed"|"assignments"/);}
 const helper=r.players[1],before=e.view(r,helper);e.disconnect(helper.socketId!);e.join(r.code,'','refresh',helper.token);assert.deepEqual(e.view(r,helper).signal!.ownDraft,before.signal!.ownDraft);assert.equal(r.deadline,deadline);assert.equal(r.integrity,integrity);
 for(const player of r.players)e.submit(r,player,1,e.view(r,player).signal!.ownDraft!,undefined,undefined,undefined,undefined,undefined,{run:scope.run,puzzleId:scope.puzzleId});
 assert.equal(r.phase,'locked');assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value:'north'}));e.tick(r.deadline!+1);assert.ok(r.result!.success);assert.equal(r.score,1);
 const resultHtml=renderToStaticMarkup(createElement(DebrisMission,{view:e.view(r,helper),actions:e.view(r,helper).signal!.ownOrders!,setActions:()=>{},connected:true,pending:false,command:async()=>({ok:true})}));assert.match(resultHtml,/debris-flight is-success/);assert.match(resultHtml,/Crossing complete/);e.tick(r.deadline!+1);assert.equal(r.round,2);assert.deepEqual(e.view(r,p).signal!.flightPlans,[]);assert.equal(e.view(r,p).signal!.ownDraft,null);
});
test('proposals reject spoofed owners, foreign fields, stale sectors, invalid values, expired timers and post-lock edits',()=>{
 const {e,r,p,scope}=setup(2),engineer=r.players[1];
 for(const data of [{...scope,key:'navigation',value:'north'},{...scope,key:'engineering',value:'bad'},{...scope,key:'engineering',value:'low',run:0},{...scope,key:'engineering',value:'low',puzzleId:'old'},{...scope,key:'engineering',value:'low',round:0}])assert.throws(()=>e.signalDraft(r,engineer,data));
 assert.throws(()=>e.signalDraft(r,{...p},{...scope,key:'navigation',value:'north'}));
 const other=e.create('signal','Other','other');assert.throws(()=>e.signalDraft(r,other.p,{...scope,key:'navigation',value:'north'}));
 r.deadline=Date.now()-1;assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value:'north'}));assert.equal(Object.keys(r.signal!.drafts||{}).length,0);
});
test('disconnected and briefing scenes expose no enabled flight orders; map labels have keyboard-native buttons',()=>{
 const {e,r,p}=setup(),v=e.view(r,p);const props={view:v,actions:{},setActions:()=>{},connected:false,pending:false,command:async()=>null};
 let html=renderToStaticMarkup(createElement(DebrisMission,props));assert.match(html,/Connection interrupted/);assert.match(html,/aria-label="Plot North corridor, burn 1"/);assert.match(html,/class="primary lock-button" disabled/);r.phase='briefing';html=renderToStaticMarkup(createElement(DebrisMission,{...props,view:e.view(r,p),connected:true}));assert.match(html,/Flight controls open after briefing/);assert.equal(debrisRoutes.length,4);
});
test('failed resolution uses submitted path, never silently substitutes the correct path',()=>{
 const {e,r,p,scope}=setup();const submitted=r.signal!.puzzle!.solution.navigation==='north'?'south':'north';
 for(const player of r.players){const v=e.view(r,player);const action=Object.fromEntries(v.brief!.tasks.map(t=>[t.key,t.key==='navigation'?submitted:r.signal!.puzzle!.solution[t.key]]));e.submit(r,player,1,action,undefined,undefined,undefined,undefined,undefined,{run:scope.run,puzzleId:scope.puzzleId});}
 e.tick(r.deadline!+1);assert.equal(r.result!.success,false);assert.equal(r.integrity,2);const html=renderToStaticMarkup(createElement(DebrisMission,{view:e.view(r,r.players[1]),actions:{},setActions:()=>{},connected:true,pending:false,command:async()=>{}}));assert.match(html,/debris-flight is-failure/);assert.match(html,new RegExp(`data-route="${submitted}"`));assert.match(html,/Emergency recovery/);
});
