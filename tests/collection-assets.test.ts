import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getAdventure} from '../shared/tiny-adventures';

test('released Cloud and Meadow maps exist at their registered public paths as WebP assets',()=>{
 for(const id of ['cloud-adventure','meadow-rescue']){
  const asset=getAdventure(id).environment.mapAsset;
  const bytes=readFileSync(new URL('../public'+asset,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length>10000,`${id} illustration must be included in the deployment`);
 }
});
