import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {Engine} from '../server/engine';
import {solveSignal} from '../server/signal-puzzles';
import {SignalMission,SharedSignalScene,signalSceneModel,signalSceneNames} from '../src/SignalMission';
import {DebrisMission,SharedDebrisMap} from '../src/DebrisMission';
const noop=async()=>{};
const renderScene=(model:NonNullable<ReturnType<typeof signalSceneModel>>,serverTime:number)=>model.sector===1?render(createElement(SharedDebrisMap,{model,serverTime})):render(createElement(SharedSignalScene,{model,serverTime}));
for(const count of [2,3,4,5,6])test(`${count} stations: all five public environments, private controls, reconnect and synchronized resolution`,()=>{
 const e=new Engine(),{r,p}=e.create('signal','Navigator','nav');for(let i=1;i<count;i++)e.join(r.code,`Station ${i}`,`s${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 for(let round=0;round<5;round++){
  assert.equal(r.round,round);e.tick(r.deadline!+1);const puzzle=r.signal!.puzzle!,scope={round,run:r.signal!.run,puzzleId:puzzle.id};
  assert.equal(r.phase,'action');const snapshot=e.view(r,p),deadline=r.deadline;
  for(const player of r.players){const v=e.view(r,player);assert.ok(solveSignal(v.signal!.board!,v.signal!.ownTelemetry).length>1);assert.equal(v.signal!.communications.length,0);
   assert.deepEqual(v.signal!.ownTelemetry.map(c=>c.index),puzzle.assignments[count][player.slot]);
   for(const task of v.brief!.tasks)e.signalDraft(r,player,{...scope,key:task.key,value:puzzle.solution[task.key]});
   assert.throws(()=>e.signalDraft(r,player,{...scope,key:'answer',value:'private'}));
  }
  const shared=signalSceneModel(e.view(r,p))!;assert.deepEqual(Object.keys(shared).sort(),['board','integrity','phase','proposals','resolvedAt','score','sector','success'].sort());
  for(const player of r.players){const v=e.view(r,player);assert.deepEqual(signalSceneModel(v),shared);assert.equal(v.signal!.communications.length,0);
   const scene=renderScene(shared,snapshot.serverTime);for(const card of puzzle.cards)assert.ok(!scene.includes(card.text));assert.doesNotMatch(JSON.stringify(shared),/solution|assignments|ownTelemetry|seed|fact/);
   const html=round===1?render(createElement(DebrisMission,{view:v,actions:{navigation:'fake-local-route'},setActions:()=>{},remaining:90,connected:true,pending:false,command:noop})):render(createElement(SignalMission,{view:v,actions:v.signal!.ownDraft!,remaining:90,connected:true,pending:false,command:noop}));
   assert.ok(html.includes(round===1?'Interactive holographic flight map':signalSceneNames[round]+' shared mission environment'));
   assert.equal((html.match(/<fieldset/g)||[]).length,v.brief!.tasks.filter(t=>round!==1||t.key!=='navigation').length);
   if(round===1)assert.ok(html.includes(`data-route="${puzzle.solution.navigation}"`));
  }
  const engineer=r.players[1],before=e.view(r,engineer);e.disconnect(engineer.socketId!);e.join(r.code,'','restored',engineer.token);assert.deepEqual(e.view(r,engineer).signal!.ownDraft,before.signal!.ownDraft);assert.deepEqual(signalSceneModel(e.view(r,engineer)),shared);assert.equal(r.deadline,deadline);
  // Share one chosen card: the server copies only that assigned card to the crew.
  const card=before.signal!.ownTelemetry[0];e.shareTelemetry(r,engineer,{...scope,index:card.index});assert.equal(e.view(r,p).signal!.communications.length,1);assert.equal(e.view(r,p).signal!.communications[0].text,card.text);
  for(const player of r.players)e.submit(r,player,round,e.view(r,player).signal!.ownDraft!,undefined,undefined,undefined,undefined,undefined,{run:scope.run,puzzleId:scope.puzzleId});
  assert.equal(r.phase,'locked');assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value:puzzle.solution.navigation}));
  e.tick(r.deadline!+1);assert.equal(r.result!.success,true);assert.equal(r.score,round+1);assert.equal(r.integrity,3);const at=r.signal!.resolvedAt;assert.ok(at);
  for(const player of r.players){const v=e.view(r,player);assert.equal(v.signal!.resolvedAt,at);assert.equal(v.deadline,r.deadline);assert.deepEqual(v.result,r.result);assert.deepEqual(signalSceneModel(v),signalSceneModel(e.view(r,p)))}
  const v=e.view(r,p),resolved=renderScene(signalSceneModel(v)!,at!+5000);assert.match(resolved,/data-result="success"/);assert.match(resolved,/animation-delay:-5000ms/);
  e.tick(r.deadline!+1);assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value:puzzle.solution.navigation}));
 }
 assert.equal(r.phase,'finished');assert.equal(r.score,5);assert.equal(r.signal!.archive.length,4);assert.equal(signalSceneModel(e.view(r,p)),null);
});
for(let round=0;round<5;round++)test(`Sector ${round+1}: proposals reject foreign roles/rooms, stale scopes, expired and disconnected writes`,()=>{
 const e=new Engine(),{r,p}=e.create('signal','Navigator','nav');const {p:eng}=e.join(r.code,'Engineer','eng');r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=round;e.begin(r);e.tick(r.deadline!+1);
 const scope={round,run:r.signal!.run,puzzleId:r.signal!.puzzle!.id},value=r.signal!.puzzle!.solution.navigation,other=e.create('signal','Other','other');
 for(const [who,data] of [[eng,{...scope,key:'navigation',value}],[other.p,{...scope,key:'navigation',value}],[p,{...scope,run:0,key:'navigation',value}],[p,{...scope,puzzleId:'old',key:'navigation',value}],[p,{...scope,key:'navigation',value:'bad'}]] as const)assert.throws(()=>e.signalDraft(r,who,data));
 e.disconnect(p.socketId!);assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value}));e.join(r.code,'','back',p.token);r.deadline=Date.now()-1;assert.throws(()=>e.signalDraft(r,p,{...scope,key:'navigation',value}));assert.deepEqual(e.view(r,eng).signal!.proposals.map(p=>p.orders),[{},{}]);
});
test('non-Debris console pauses all owned controls during briefing and disconnection',()=>{
 const e=new Engine(),{r,p}=e.create('signal','A','a');e.join(r.code,'B','b');r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 let html=render(createElement(SignalMission,{view:e.view(r,p),actions:{},remaining:7,connected:true,pending:false,command:noop}));assert.match(html,/Controls open after briefing/);assert.match(html,/<fieldset disabled/);assert.match(html,/lock-button" disabled/);
 e.tick(r.deadline!+1);html=render(createElement(SignalMission,{view:e.view(r,p),actions:{},remaining:60,connected:false,pending:false,command:noop}));assert.match(html,/Connection interrupted/);assert.match(html,/<fieldset disabled/);
});

for(const first of [0,1])test(`Either station may lock first (${first===0?'host':'invitee'}); the remaining station may finish editing and lock in every sector`,()=>{
 for(let round=0;round<5;round++){
  const e=new Engine(),{r,p}=e.create('signal','Host','host');e.join(r.code,'Invitee','guest');r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=round;e.begin(r);e.tick(r.deadline!+1);
  const scope={round,run:r.signal!.run,puzzleId:r.signal!.puzzle!.id},solution=r.signal!.puzzle!.solution;
  const crew=[r.players[first],r.players[1-first]];
  for(let i=0;i<crew.length;i++){
   const player=crew[i];for(const t of e.view(r,player).brief!.tasks)e.signalDraft(r,player,{...scope,key:t.key,value:solution[t.key]});
   const v=e.view(r,player),props={view:v,actions:{},setActions:()=>{},remaining:60,connected:true,pending:false,command:noop};
   // A stale parent mirror cannot disable a complete server-confirmed station.
   const html=render(round===1?createElement(DebrisMission,props):createElement(SignalMission,props));
   assert.doesNotMatch(html,/<button[^>]*class="primary lock-button"[^>]*disabled/);assert.match(html,/regardless of who locks first/);
   e.submit(r,player,round,v.signal!.ownDraft!,undefined,undefined,undefined,undefined,undefined,{run:scope.run,puzzleId:scope.puzzleId});
   if(i===0){assert.equal(r.phase,'action');assert.equal(e.view(r,crew[1]).submitted,false);assert.equal(e.view(r,crew[1]).players.filter(x=>x.submitted).length,1)}
  }
  assert.equal(r.phase,'locked');e.tick(r.deadline!+1);assert.equal(r.result!.success,true);assert.equal(r.integrity,3);
 }
});
test('shared route and another station lock never imply that my own missing controls are selected',()=>{
 const e=new Engine(),{r,p}=e.create('signal','Host','host');const {p:guest}=e.join(r.code,'Invitee','guest');r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=1;e.begin(r);e.tick(r.deadline!+1);
 const puzzle=r.signal!.puzzle!,scope={round:1,run:r.signal!.run,puzzleId:puzzle.id};
 for(const t of e.view(r,guest).brief!.tasks)e.signalDraft(r,guest,{...scope,key:t.key,value:puzzle.solution[t.key]});
 e.submit(r,guest,1,e.view(r,guest).signal!.ownDraft!,undefined,undefined,undefined,undefined,undefined,{run:scope.run,puzzleId:scope.puzzleId});
 const html=render(createElement(DebrisMission,{view:e.view(r,p),actions:puzzle.solution,setActions:()=>{},connected:true,pending:false,command:noop}));
 assert.match(html,/Choose at your station:/);assert.match(html,/Shared crew proposals do not select your own controls/);assert.match(html,/<button[^>]*class="primary lock-button" disabled/);
});
