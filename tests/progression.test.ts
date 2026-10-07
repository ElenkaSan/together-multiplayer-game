import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine,type Room} from '../server/engine';
import {getAdventure,unlockedAdventures} from '../shared/tiny-adventures';
import {solutionFor} from '../server/tiny-adventures';
function setup(){const e=new Engine();const {r,p}=e.create('tiny','Captain','c');e.join(r.code,'Hero','h');return {e,r,p}}
function start(e:Engine,r:Room){r.players.forEach(p=>e.ready(r,p));e.start(r,r.players.find(p=>p.id===r.host)!)}
function attempt(e:Engine,r:Room,tool:string,support='save'){
 e.tick(r.deadline!+1);assert.equal(r.phase,'action');
 for(const p of r.players)e.submit(r,p,r.round,p.slot===0?{support}:{tool},r.tiny!.attempt,r.tiny!.id,r.tinyProgress!.run);
 e.tick(r.deadline!+1);assert.equal(r.phase,'result');
}
function finish(e:Engine,r:Room,miss=false){start(e,r);for(let i=0;i<getAdventure(r.tiny!.id).rescues.length;i++){
 const rescue=getAdventure(r.tiny!.id).rescues[i],support=getAdventure(r.tiny!.id).mechanics?.resource.requiredRescueIds.includes(rescue.id)?'warm':'save';
 attempt(e,r,miss?'not-a-tool':solutionFor(r.tiny!.id,i).tool,support);e.tick(r.deadline!+1);
 }}
for(const count of [2,3,4,5,6])test(`Forest unlocks Ice, transition retains ${count} seats and Ice completes through same phases`,()=>{
 const {e,r,p}=setup();for(let i=2;i<count;i++)e.join(r.code,'Hero '+i,'h'+i);
 const tokens=r.players.map(p=>p.token);assert.deepEqual(e.view(r,p).progression?.unlocked,['forest-rescue']);
 assert.throws(()=>e.chooseAdventure(r,p,'ice-rescue'),/complete/);
 finish(e,r);assert.equal(r.phase,'finished');const v=e.view(r,p);assert.deepEqual(v.progression?.completed,['forest-rescue']);assert.deepEqual(v.progression?.unlocked,['forest-rescue','ice-rescue']);assert.equal(v.progression?.newlyUnlockedId,'ice-rescue');
 assert.throws(()=>e.chooseAdventure(r,r.players[1],'ice-rescue'),/host/);assert.throws(()=>e.chooseAdventure(r,p,'jungle-adventure'),/not available/);
 e.adventureMap(r,p);assert.equal(e.view(r,r.players[1]).progression?.mapOpen,true);
 e.chooseAdventure(r,p,'ice-rescue');assert.equal(r.phase,'lobby');assert.equal(r.bonus,2);assert.equal(r.tiny?.id,'ice-rescue');assert.deepEqual(r.players.map(p=>p.token),tokens);assert.ok(r.players.every(p=>!p.ready&&!p.action));
 finish(e,r);assert.equal(r.phase,'finished');assert.equal(r.score,5);assert.equal(r.bonus,0);assert.deepEqual(e.view(r,p).progression?.completed,['forest-rescue','ice-rescue']);assert.equal(e.view(r,p).progression?.newlyUnlockedId,null);
 e.replay(r,p);assert.equal(r.bonus,2);assert.deepEqual(e.view(r,p).progression?.completed,['forest-rescue','ice-rescue']);
});
test('unlock is earned by completion, including crew help, never by badge count or the client',()=>{
 const {e,r,p}=setup();start(e,r);
 for(let i=0;i<5;i++){const right=solutionFor(r.tiny!.id,i).tool,wrong=right==='rope'?'blanket':'rope';for(let n=0;n<2;n++){attempt(e,r,wrong);e.tick(r.deadline!+1)}}
 assert.equal(r.score,0);assert.equal(r.phase,'finished');assert.ok(e.view(r,p).progression?.unlocked.includes('ice-rescue'));assert.throws(()=>e.create('tiny','Shortcut','s','ice-rescue'),/Complete Forest/);
});
test('Ice resource is bounded, spent once, and wrong picks retain the existing retry/crew-help flow',()=>{
 const {e,r,p}=setup();finish(e,r);e.chooseAdventure(r,p,'ice-rescue');start(e,r);
 attempt(e,r,'blanket','warm');assert.equal(r.result?.success,false);assert.equal(r.bonus,1);assert.equal(r.result?.retry,true);e.tick(Date.now());assert.equal(r.bonus,1);e.tick(r.deadline!+1);
 attempt(e,r,'rope');assert.equal(r.result?.success,true);e.tick(r.deadline!+1);
 for(let i=1;i<3;i++){attempt(e,r,solutionFor('ice-rescue',i).tool);e.tick(r.deadline!+1)}
 attempt(e,r,'blanket','save');assert.equal(r.result?.success,false);assert.equal(r.bonus,1);e.tick(r.deadline!+1);
 attempt(e,r,'blanket','warm');assert.equal(r.result?.success,true);assert.equal(r.bonus,0);e.tick(r.deadline!+1);
 attempt(e,r,'boat','save');assert.equal(r.result?.retry,true);e.tick(r.deadline!+1);attempt(e,r,'boat','save');assert.equal(r.result?.assisted,true);e.tick(r.deadline!+1);assert.equal(r.phase,'finished');assert.equal(r.tiny?.completed.length,5);
});
test('reconnect keeps unlocks, map and seats; stale Forest submissions cannot enter Ice',()=>{
 const {e,r,p}=setup();finish(e,r);e.adventureMap(r,p);const hero=r.players[1];e.disconnect('h');e.join(r.code,'','h2',hero.token);assert.equal(e.view(r,hero).progression?.mapOpen,true);
 e.chooseAdventure(r,p,'ice-rescue');e.disconnect('h2');assert.equal(r.players.length,2);e.join(r.code,'','h3',hero.token);start(e,r);e.tick(r.deadline!+1);
 assert.throws(()=>e.submit(r,hero,0,{tool:'rope'},1,'forest-rescue',1),/adventure is closed/);assert.throws(()=>e.submit(r,hero,0,{tool:'rope'},1),/adventure is closed/);
 e.submit(r,hero,0,{tool:'rope'},1,'ice-rescue',r.tinyProgress!.run);e.disconnect('h3');e.join(r.code,'','h4',hero.token);const v=e.view(r,hero);assert.equal(v.submitted,true);assert.equal(v.adventure?.id,'ice-rescue');assert.deepEqual(v.progression?.unlocked,['forest-rescue','ice-rescue']);
});
test('future route remains locked until its playable pack is registered; Signal has no campaign fields',()=>{
 assert.ok(!unlockedAdventures(['forest-rescue','ice-rescue']).includes('jungle-adventure'));const e=new Engine();const {r,p}=e.create('signal','S','s');assert.equal('progression' in e.view(r,p),false);assert.throws(()=>e.adventureMap(r,p),/host/);assert.throws(()=>e.chooseAdventure(r,p,'forest-rescue'),/host/);
});
