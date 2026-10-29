import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../server/engine';
import {adventures} from '../shared/tiny-adventures';
import {tinyActionDuration,adventureState} from '../server/tiny-adventures';
for(const a of Object.values(adventures))test(`${a.title}: all stages and retry use the Level ${a.level||1} action window`,()=>{
 const expected=60000+Math.floor(((a.level||1)-1)/2)*30000,e=new Engine(),{r,p}=e.create('tiny','Captain','c',a.id);const h=e.join(r.code,'Hero','h').p;e.ready(r,p);e.ready(r,h);e.start(r,p);
 for(let round=0;round<5;round++)for(const attempt of [1,2]){r.round=round;r.tiny!.attempt=attempt;e.begin(r);const at=r.deadline!+1;e.tick(at);assert.equal(r.phase,'action');assert.equal(r.deadline!-at,expected);const deadline=r.deadline;e.disconnect(h.socketId!);e.join(r.code,'','back',h.token);assert.equal(e.view(r,h).deadline,deadline);assert.equal(e.view(r,p).deadline,deadline);}
});
test('Signal Lost retains 60 seconds and explicit custom action timer overrides remain exact',()=>{
 const e=new Engine(),{r,p}=e.create('signal','Captain','c'),h=e.join(r.code,'Hero','h').p;e.ready(r,p);e.ready(r,h);e.start(r,p);const at=r.deadline!+1;e.tick(at);assert.equal(r.deadline!-at,60000);assert.equal(tinyActionDuration(adventureState('meadow-rescue'),1234),1234);assert.equal(tinyActionDuration(undefined,1234),1234);
});
