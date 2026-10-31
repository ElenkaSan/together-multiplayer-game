import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../server/engine';
import {availableAdventures} from '../shared/tiny-adventures';
import {desertSolutions} from '../server/advanced-evidence';
import {expertFields} from '../shared/expert-adventures';
const setup=(id:string,n:number)=>{const e=new Engine(),{r,p}=e.create(id==='signal'?'signal':'tiny','Captain','s0',id==='signal'?undefined:id);for(let i=1;i<n;i++)e.join(r.code,`Hero ${i}`,`s${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);e.tick(r.deadline!+1);return {e,r,p}};
for(const id of [...availableAdventures(),'signal'])test(`${id}: either player leaving a two-person game ends it without scoring or reconnecting the departed seat`,()=>{
 for(const slot of [0,1]){const {e,r}=setup(id,2),leaver=r.players[slot],other=r.players[1-slot],token=leaver.token;
  e.leave(r,leaver);assert.match(e.view(r,other).closed!,/other player left the game/);assert.equal(r.deadline,null);assert.equal(r.players.length,1);assert.equal(r.score,0);assert.equal(r.tiny?.completed.length||0,0);e.tick(Date.now()+200000);assert.equal(r.phase,'paused');assert.throws(()=>e.join(r.code,'','return',token),/ended/);
 }
});
for(const n of [3,4,5,6])for(const id of availableAdventures())test(`${id}: captain leaves ${n} players; roles, clues and controls migrate without spending an attempt`,()=>{
 const {e,r,p}=setup(id,n),others=r.players.slice(1),oldRun=r.tinyProgress!.run,bonus=r.bonus;
 const originalPool=id==='ice-rescue'?null:new Set(r.players.flatMap(x=>e.clueList(r,x)).map(c=>c.text));
 const expertSettings=r.expert?{...r.expert.settings}:null,board=r.expert?structuredClone(r.expert.board):null;
 e.leave(r,p);const captain=r.players[0];assert.equal(captain.id,others[0].id);assert.equal(r.host,captain.id);assert.equal(r.players.length,n-1);assert.equal(r.players.filter(x=>e.view(r,x).players.find(y=>y.id===x.id)?.role==='Team Captain').length,1);
 assert.match(e.view(r,captain).crewNotice!.message,/You are now the Team Captain/);assert.equal(r.tiny!.attempt,1);assert.equal(r.score,0);assert.equal(r.bonus,bonus);assert.equal(r.tinyProgress!.run,oldRun+1);assert.ok(r.players.every(x=>x.action===null));assert.throws(()=>e.player(r,p.token));
 const clues=r.players.map(x=>e.clueList(r,x));assert.ok(clues.every(x=>x.length>0));assert.ok(Math.max(...clues.map(x=>x.length))-Math.min(...clues.map(x=>x.length))<=1);
 if((e.view(r,captain).adventure!.level||1)>=3&&originalPool)assert.deepEqual(new Set(clues.flat().map(c=>c.text)),originalPool);
 for(const x of r.players){const v=e.view(r,x);assert.deepEqual(v.brief!.observations!.map(o=>o.text),e.clueList(r,x).map(o=>o.text));assert.equal(v.clues!.received.length,0);}
 if(board){assert.deepEqual(r.expert!.board,board);assert.deepEqual(r.expert!.settings,expertSettings);const keys=r.players.flatMap(x=>e.view(r,x).expert!.ownKeys);assert.equal(new Set(keys).size,keys.length);assert.equal(keys.length,expertFields(id,r.round,0,1).length);}
 if(r.ocean){const keys=r.players.flatMap(x=>e.view(r,x).ocean!.ownKeys);assert.equal(new Set(keys).size,6);}
 const hero=r.players.at(-1)!,clueTexts=e.clueList(r,hero);e.disconnect(hero.socketId!);e.join(r.code,'','returned',hero.token);assert.deepEqual(e.clueList(r,hero),clueTexts);assert.equal(hero.slot,n-2);
});
test('transferred Desert captain can receive every redistributed clue and complete the stage; stale commands fail',()=>{
 const {e,r,p}=setup('desert-rescue',3),oldRun=r.tinyProgress!.run;const formerHero=r.players[1];
 e.shareAllClues(r,r.players[2],{round:0,attempt:1,adventureId:'desert-rescue',run:oldRun});
 e.leave(r,p);const captain=r.players[0],hero=r.players[1];assert.equal(captain,formerHero);e.tick(r.deadline!+1);
 assert.throws(()=>e.shareAllClues(r,hero,{round:0,attempt:1,adventureId:'desert-rescue',run:oldRun}),/closed/);
 const scope={round:0,attempt:1,adventureId:'desert-rescue',run:r.tinyProgress!.run};e.shareAllClues(r,hero,scope);
 assert.equal(e.view(r,captain).clues!.received.length,3);assert.equal(e.view(r,captain).clues!.allShared,true);
 e.submit(r,captain,0,desertSolutions[0],1,'desert-rescue',scope.run);e.submit(r,hero,0,{confirm:'ready'},1,'desert-rescue',scope.run,undefined,r.teamPlanVersion);e.tick(r.deadline!+1);assert.equal(r.result?.success,true);assert.equal(r.score,1);
});
test('helper leaving six-player crew preserves captain, invalidates old agreements and transfers their unshared clues',()=>{
 const {e,r,p}=setup('jungle-adventure',6),leaver=r.players[4],clue=e.clueList(r,leaver)[0].text;e.leave(r,leaver);assert.equal(r.players[0],p);assert.equal(r.host,p.id);assert.ok(r.players.flatMap(x=>e.clueList(r,x)).some(c=>c.text===clue));assert.ok(!e.view(r,p).crewNotice!.message.includes('You are now'));assert.equal(r.phase,'briefing');
});
test('Signal captain exit retains the puzzle/archive, reassigns every telemetry card and rejects old sector scope',()=>{
 const {e,r,p}=setup('signal',6),puzzle=r.signal!.puzzle!,archive=structuredClone(r.signal!.archive),oldRun=r.signal!.run;e.leave(r,p);assert.equal(r.signal!.puzzle,puzzle);assert.deepEqual(r.signal!.archive,archive);assert.equal(r.signal!.run,oldRun+1);const cards=r.players.flatMap(x=>e.view(r,x).signal!.ownTelemetry.map(c=>c.index));assert.equal(new Set(cards).size,6);assert.equal(cards.length,6);assert.match(e.view(r,r.players[0]).crewNotice!.message,/lead Navigator/);assert.throws(()=>e.shareTelemetry(r,r.players[0],{round:0,run:oldRun,puzzleId:puzzle.id,index:0}),/closed/);
});
test('Cloud prepared routes and Moon persistent decisions survive a captain handover',()=>{
 for(const id of ['cloud-adventure','moon-mission']){const {e,r,p}=setup(id,4);r.expert!.settings={primary:'ridge',backup:'arch',route:'ridge'};r.expert!.board.objectives=['saved-stage'];if(id==='cloud-adventure')r.expert!.board.weather={checked:true,primary:'ridge',backup:'arch'} as any;else {r.expert!.board.mobility='scanner';r.expert!.board.supply='battery';}const board=structuredClone(r.expert!.board),settings={...r.expert!.settings};e.leave(r,p);assert.deepEqual(r.expert!.board,board);assert.deepEqual(r.expert!.settings,settings);assert.deepEqual(r.expert!.ready,[]);}
});
test('temporary disconnect is not Leave: same seat, clues, choices and captain role survive refresh',()=>{
 const {e,r,p}=setup('desert-rescue',2),hero=r.players[1],token=p.token;e.submit(r,p,0,desertSolutions[0],1,'desert-rescue',1);e.disconnect(p.socketId!);assert.equal(r.closed,undefined);assert.equal(r.players.length,2);assert.equal(r.crewNotice,undefined);e.join(r.code,'','restored',token);assert.equal(p.slot,0);assert.equal(e.view(r,p).submitted,true);assert.equal(e.view(r,p).players.find(x=>x.id===p.id)!.role,'Team Captain');assert.equal(hero.slot,1);
});

test('departure during locked launch reopens the same attempt; departure during results never scores twice',()=>{
 for(const phase of ['locked','result'] as const){const {e,r,p}=setup('desert-rescue',3);for(const x of r.players)e.submit(r,x,0,x.slot?{confirm:'ready'}:desertSolutions[0],1,'desert-rescue',1);assert.equal(r.phase,'locked');if(phase==='result'){e.tick(r.deadline!+1);assert.equal(r.score,1);}const score=r.score,bonus=r.bonus;e.leave(r,p);assert.equal(r.score,score);assert.equal(r.bonus,bonus);assert.equal(r.tiny!.attempt,1);assert.equal(r.phase,phase==='locked'?'briefing':'result');if(phase==='result'){e.tick(r.deadline!+1);assert.equal(r.score,1);assert.equal(r.round,1);assert.equal(r.tiny!.completed.length,1);}}
});
test('lobby departure transfers captain and readiness safely, without closing a remaining two-player team',()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','s0','jungle-adventure');e.join(r.code,'Hero 1','s1');e.join(r.code,'Hero 2','s2');r.players.forEach(x=>e.ready(r,x));e.leave(r,p);assert.equal(r.closed,undefined);assert.equal(r.phase,'lobby');assert.equal(r.players.length,2);assert.ok(r.players.every(x=>!x.ready));assert.equal(r.host,r.players[0].id);assert.match(e.view(r,r.players[0]).crewNotice!.message,/You are now the Team Captain/);
});
