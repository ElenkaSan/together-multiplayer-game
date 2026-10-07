import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveIce} from '../server/ice-expedition';
import {iceRescue} from '../shared/tiny-adventures';

for(const players of [2,3,4,5,6])test(`Warm Packs only protect successful cold routes for ${players} players`,()=>{
 for(const round of [1,3,4]){
  const route=({1:'open-trail',3:'exposed-bridge',4:'beacon-ridge'} as Record<number,string>)[round];
  const aligned=Array.from({length:players},(_,i)=>({route,...(i===0?{support:'warm'}:{})}));
  const success=resolveIce(round,aligned,2);assert.equal(success.success,true);assert.equal(success.bonus,1);
  for(const errors of [1,players-1]){
   const mixed=aligned.map((a,i)=>i>0&&i<=errors?{route:'wrong'}:a);
   const fail=resolveIce(round,mixed,2);assert.equal(fail.success,false);assert.equal(fail.bonus,2);assert.match(fail.details,/No Warm Pack used/);
  }
  const wrong=resolveIce(round,aligned.map((a)=>({...a,route:'wrong'})),2);assert.equal(wrong.success,false);assert.equal(wrong.bonus,2);
  const missing=resolveIce(round,[aligned[0],...Array.from({length:players-1},()=>({}))],2);assert.equal(missing.success,false);assert.equal(missing.bonus,2);
  const noWarmth=resolveIce(round,aligned.map((a,i)=>i===0?{...a,support:'save'}:a),2);assert.equal(noWarmth.success,false);assert.equal(noWarmth.bonus,2);
 }
});
test('sheltered success never spends an unnecessary selected pack; blocked cave is unsafe',()=>{
 for(const [round,route] of [[1,'cabin-trail'],[4,'shelter-tunnel']] as const){const r=resolveIce(round,[{route,support:'warm'},{route}],2);assert.equal(r.success,true);assert.equal(r.bonus,2)}
 const blocked=resolveIce(3,[{route:'cave-path',support:'warm'},{route:'cave-path'}],2);assert.equal(blocked.success,false);assert.equal(blocked.bonus,2);
 assert.match(iceRescue.rescues[3].privateClues!.join(' '),/blocks the cave/);
 assert.doesNotMatch(iceRescue.rescues.map(r=>JSON.stringify(r)).join(' '),/shorter|longer|sooner/i);
});
