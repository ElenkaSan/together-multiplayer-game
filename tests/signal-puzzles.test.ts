import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {makeSignalPuzzle,solveSignal,signalBrief,signalCandidates,parseSignalTimers,defaultSignalTimers,recoverSignalRecord,type SignalState} from '../server/signal-puzzles';
import {SignalCrew} from '../src/SignalCrew';
for(let sector=0;sector<5;sector++)test(`sector ${sector+1}: generated puzzles are unique, derivable and asymmetric at every crew size`,()=>{
 for(let seed=0;seed<80;seed++){
  const p=makeSignalPuzzle(sector,seed,[0,1,2,3].map((x)=>({sector:x,label:'Recovery',value:(seed+x)%4,recovered:false})));assert.deepEqual(solveSignal(p.board,p.cards),[p.solution]);
  for(let count=2;count<=6;count++){const assigned=p.assignments[count];assert.deepEqual(assigned.flat().sort(),[0,1,2,3,4,5]);for(let slot=0;slot<count;slot++){const own=assigned[slot].map(i=>p.cards[i]),candidates=solveSignal(p.board,own);assert.ok(candidates.length>1,`${sector}/${seed}/${count}/${slot}`);assert.ok(candidates.length<signalCandidates(p.board).length);assert.ok(signalBrief(p,slot,count).tasks.length>=2);}}
  assert.doesNotMatch(JSON.stringify(p.cards),/safe corridor|verified rescue carrier|high power is required|requires shield ON/);
 }
});
test('distinct mechanisms enforce allocation, authenticated telemetry and archive-dependent transmission',()=>{
 const power=makeSignalPuzzle(2,12);assert.equal(power.board.budget,8);assert.equal(Object.values(power.solution).reduce((n,v)=>n+Number(v),0),8);assert.ok(power.cards.some(c=>c.fact.op==='compare'));
 const sensor=makeSignalPuzzle(3,12);assert.equal(sensor.board.sensors!.length,3);const chosen=sensor.board.sensors![sensor.board.controls.comms.options.find(o=>o.value===sensor.solution.comms)!.units-1];assert.equal(chosen.sequence,8);assert.equal(chosen.crc,0);assert.equal(chosen.age,2);assert.ok(sensor.board.sensors!.some(s=>s.sequence>chosen.sequence));assert.equal(sensor.solution.navigation,chosen.navigation);assert.equal(sensor.solution.engineering,chosen.engineering);
 const a=makeSignalPuzzle(4,12,[0,1,2,3].map(sector=>({sector,label:'Record',value:1,recovered:false}))),b=makeSignalPuzzle(4,12,[0,1,2,3].map(sector=>({sector,label:'Record',value:3,recovered:true})));assert.notDeepEqual(a.cards,b.cards);assert.equal(solveSignal(a.board,a.cards).length,1);assert.equal(solveSignal(b.board,b.cards).length,1);
});
function setup(count=2){const e=new Engine(),{r,p}=e.create('signal','Captain','c');for(let i=1;i<count;i++)e.join(r.code,`Operator ${i}`,`h${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);return{e,r,p};}
test('sharing is selective, scoped and idempotent; forged text, foreign cards and seats cannot leak',()=>{
 const {e,r,p}=setup(6),v=e.view(r,p),own=v.signal!.ownTelemetry[0],scope={round:0,run:v.signal!.run,puzzleId:v.signal!.puzzleId!,index:own.index};assert.ok(r.players.every(x=>e.view(r,x).signal!.communications.length===0));
 e.shareTelemetry(r,p,{...scope,text:'FORGED'} as any);const rev=r.revision;for(const x of r.players){const log=e.view(r,x).signal!.communications;assert.equal(log.length,1);assert.equal(log[0].text,own.text);assert.equal(log[0].name,'Captain');}e.shareTelemetry(r,p,scope);assert.equal(r.revision,rev);
 for(const bad of [{...scope,index:99},{...scope,index:e.view(r,r.players[1]).signal!.ownTelemetry[0].index},{...scope,run:0},{...scope,puzzleId:'old'},{...scope,round:1}])assert.throws(()=>e.shareTelemetry(r,p,bad));assert.throws(()=>e.shareTelemetry(r,{...p},scope));
 e.disconnect(p.socketId!);e.join(r.code,'','back',p.token);assert.equal(e.view(r,p).signal!.communications.length,1);assert.ok(e.view(r,p).signal!.ownTelemetry[0].shared);const html=renderToStaticMarkup(createElement(SignalCrew,{view:e.view(r,p),connected:true,pending:false,command:async()=>{}}));assert.match(html,/Crew Communications|Delivered to crew/);assert.doesNotMatch(html,/Share with Captain|phone call|usual call/);
 const snapshot=JSON.stringify(e.view(r,p));assert.ok(!snapshot.includes(r.signal!.seed.toString()));assert.doesNotMatch(snapshot,/"solution"|"assignments"|"cards"/);
});
for(const count of [2,6])test(`${count} players: complete mission, recover records after failure, synchronized timers and replay`,()=>{
 const {e,r,p}=setup(count);for(let round=0;round<5;round++){const start=r.deadline!+1;e.tick(start);assert.equal(r.deadline!-start,defaultSignalTimers[round]);const puzzle=r.signal!.puzzle!;for(const x of r.players){const v=e.view(r,x);assert.equal(v.deadline,r.deadline);const action=Object.fromEntries(v.brief!.tasks.map(t=>[t.key,puzzle.solution[t.key]]));if(round===1&&x.slot===0)action.shield=action.shield==='on'?'off':'on';e.submit(r,x,round,action);}e.tick(r.deadline!+1);assert.equal(r.result!.success,round!==1);e.tick(r.deadline!+1);}
 assert.equal(r.phase,'finished');assert.equal(r.score,4);assert.equal(r.integrity,2);assert.equal(r.signal!.archive.length,4);assert.ok(r.signal!.archive[1].recovered);const run=r.signal!.run;e.replay(r,p);assert.equal(r.signal!.run,run+1);assert.equal(r.signal!.archive.length,0);
});
test('all failure histories retain sufficient finale records and supported timer overrides validate',()=>{
 for(let mask=0;mask<16;mask++){const state:SignalState={seed:mask,run:1,puzzle:null,shared:{},archive:[]};for(let sector=0;sector<4;sector++){state.puzzle=makeSignalPuzzle(sector,mask,state.archive);recoverSignalRecord(state,!!(mask&(1<<sector)));}assert.equal(state.archive.length,4);const finale=makeSignalPuzzle(4,mask,state.archive);assert.equal(solveSignal(finale.board,finale.cards).length,1);}
 assert.deepEqual(parseSignalTimers('60,90,105,120,135'),defaultSignalTimers);for(const x of ['1,2','60,90,NaN,120,135','0,90,105,120,135'])assert.throws(()=>parseSignalTimers(x));
});
