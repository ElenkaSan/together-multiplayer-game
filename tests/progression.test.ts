import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,type Room} from '../server/engine';
import {getAdventure,availableAdventures} from '../shared/tiny-adventures';
import {iceRoutes} from '../server/ice-expedition';
import {solutionFor} from '../server/tiny-adventures';
function setup(){const e=new Engine();const {r,p}=e.create('tiny','Captain','c');e.join(r.code,'Hero','h');return {e,r,p}}
function start(e:Engine,r:Room){r.players.forEach(p=>e.ready(r,p));e.start(r,r.players.find(p=>p.id===r.host)!)}
function attempt(e:Engine,r:Room,tool:string,support='save'){
 e.tick(r.deadline!+1);assert.equal(r.phase,'action');
 const ice=getAdventure(r.tiny!.id).mechanics?.primary==='routes',resource=ice&&!!iceRoutes[getAdventure(r.tiny!.id).rescues[r.round].id].warm;
 for(const p of r.players)e.submit(r,p,r.round,ice?{route:tool,...(p.slot===0&&resource?{support}:{})}:p.slot===0?{support}:{tool},r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run);
 e.tick(r.deadline!+1);assert.equal(r.phase,'result');
}
function finish(e:Engine,r:Room,miss=false){start(e,r);for(let i=0;i<getAdventure(r.tiny!.id).rescues.length;i++){
 const rescue=getAdventure(r.tiny!.id).rescues[i],rule=r.tiny!.id==='ice-rescue'?iceRoutes[rescue.id]:undefined,support=rule?.warm&&i<4?'warm':'save';
 attempt(e,r,miss?'not-a-tool':support==='warm'?rule!.warm!:solutionFor(r.tiny!.id,i).tool,support);e.tick(r.deadline!+1);
 }}
for(const count of [2,3,4,5,6])test(`Forest unlocks Ice, transition retains ${count} seats and Ice completes through same phases`,()=>{
 const {e,r,p}=setup();for(let i=2;i<count;i++)e.join(r.code,'Hero '+i,'h'+i);
 const tokens=r.players.map(p=>p.token);assert.deepEqual(e.view(r,p).progression?.available,['forest-rescue','ice-rescue','jungle-adventure','treasure-island']);
 assert.throws(()=>e.chooseAdventure(r,p,'ice-rescue'),/complete/);
 finish(e,r);assert.equal(r.phase,'finished');const v=e.view(r,p);assert.deepEqual(v.progression?.completed,['forest-rescue']);assert.deepEqual(v.progression?.available,['forest-rescue','ice-rescue','jungle-adventure','treasure-island']);
 assert.throws(()=>e.chooseAdventure(r,r.players[1],'ice-rescue'),/host/);assert.throws(()=>e.chooseAdventure(r,p,'desert-rescue'),/not available/);
 e.adventureMap(r,p);assert.equal(e.view(r,r.players[1]).progression?.mapOpen,true);
 e.chooseAdventure(r,p,'ice-rescue');assert.equal(r.phase,'lobby');assert.equal(r.bonus,2);assert.equal(r.tiny?.id,'ice-rescue');assert.deepEqual(r.players.map(p=>p.token),tokens);assert.ok(r.players.every(p=>!p.ready&&!p.action));
 finish(e,r);assert.equal(r.phase,'finished');assert.equal(r.score,5);assert.equal(r.bonus,0);assert.deepEqual(e.view(r,p).progression?.completed,['forest-rescue','ice-rescue']);
 e.replay(r,p);assert.equal(r.bonus,2);assert.deepEqual(e.view(r,p).progression?.completed,['forest-rescue','ice-rescue']);
});
test('unlock is earned by completion, including crew help, never by badge count or the client',()=>{
 const {e,r,p}=setup();start(e,r);
 for(let i=0;i<5;i++){const right=solutionFor(r.tiny!.id,i).tool,wrong=right==='rope'?'blanket':'rope';for(let n=0;n<2;n++){attempt(e,r,wrong);e.tick(r.deadline!+1)}}
 assert.equal(r.score,0);assert.equal(r.phase,'finished');assert.ok(e.view(r,p).progression?.available.includes('ice-rescue'));assert.equal(e.create('tiny','Shortcut','s','ice-rescue').r.tiny?.id,'ice-rescue');
});
test('Ice resource is bounded, spent once, and zero packs still allows a protected finale',()=>{
 const {e,r,p}=setup();finish(e,r);e.chooseAdventure(r,p,'ice-rescue');start(e,r);
 attempt(e,r,'blue-shelf');assert.equal(r.result?.success,true);e.tick(r.deadline!+1);
 attempt(e,r,'steep-ridge','warm');assert.equal(r.result?.success,false);assert.equal(r.bonus,2);assert.equal(r.result?.retry,true);e.tick(Date.now());assert.equal(r.bonus,2);e.tick(r.deadline!+1);
 attempt(e,r,'open-trail','warm');assert.equal(r.result?.success,true);assert.equal(r.bonus,1);e.tick(r.deadline!+1);
 attempt(e,r,'pine-hollow');e.tick(r.deadline!+1);
 attempt(e,r,'exposed-bridge','warm');assert.equal(r.result?.success,true);e.tick(r.deadline!+1);
 attempt(e,r,'beacon-ridge');assert.equal(r.result?.retry,true);e.tick(r.deadline!+1);
 attempt(e,r,'shelter-tunnel');assert.equal(r.result?.success,true);assert.equal(r.bonus,0);e.tick(r.deadline!+1);assert.equal(r.phase,'finished');assert.equal(r.tiny?.completed.length,5);assert.equal(r.score,5);
});
test('reconnect keeps unlocks, map and seats; stale Forest submissions cannot enter Ice',()=>{
 const {e,r,p}=setup();finish(e,r);e.adventureMap(r,p);const hero=r.players[1];e.disconnect('h');e.join(r.code,'','h2',hero.token);assert.equal(e.view(r,hero).progression?.mapOpen,true);
 e.chooseAdventure(r,p,'ice-rescue');e.disconnect('h2');assert.equal(r.players.length,2);e.join(r.code,'','h3',hero.token);start(e,r);e.tick(r.deadline!+1);
 assert.throws(()=>e.submit(r,hero,0,{tool:'rope'},1,'forest-rescue',1),/adventure is closed/);assert.throws(()=>e.submit(r,hero,0,{tool:'rope'},1),/adventure is closed/);
 e.submit(r,hero,0,{route:'blue-shelf'},1,'ice-rescue',r.tinyProgress!.run);e.disconnect('h3');e.join(r.code,'','h4',hero.token);const v=e.view(r,hero);assert.equal(v.submitted,true);assert.equal(v.adventure?.id,'ice-rescue');assert.deepEqual(v.progression?.available,['forest-rescue','ice-rescue','jungle-adventure','treasure-island']);
});
test('future route remains locked until its playable pack is registered; Signal has no campaign fields',()=>{
 assert.ok(!availableAdventures().includes('desert-rescue'));const e=new Engine();const {r,p}=e.create('signal','S','s');assert.equal('progression' in e.view(r,p),false);assert.throws(()=>e.adventureMap(r,p),/host/);assert.throws(()=>e.chooseAdventure(r,p,'forest-rescue'),/host/);
});

