import test from 'node:test';
import assert from 'node:assert/strict';
import {clampReveal,revealGeometry} from '../src/world-reveal';
import {readFileSync} from 'node:fs';
test('diagonal is continuous, bounded and reversible on desktop and mobile',()=>{
 for(const mobile of [false,true]){
  const w=mobile?390:1440,h=mobile?1450:900;
  const center=revealGeometry(w,h,50,mobile);
  assert.equal(center.x,w/2);assert.equal(center.y,h/2);
  assert.deepEqual(center,revealGeometry(w,h,50,mobile));
  const a=revealGeometry(w,h,49,mobile),b=revealGeometry(w,h,51,mobile);
  assert.ok(mobile?b.y>a.y:b.x>a.x);
  assert.ok(Math.abs(mobile?b.y-a.y:b.x-a.x)<40);
 }
 assert.equal(clampReveal(-1),20);assert.equal(clampReveal(100),80);
});
test('homepage uses aligned whole-card layers and integrated accessible handle',()=>{
 const source=readFileSync(new URL('../src/WorldCrossover.tsx',import.meta.url),'utf8');
 assert.match(source,/cards\('forest'\)/);assert.match(source,/cards\('space',true\)/);
 assert.match(source,/role="slider"/);assert.match(source,/aria-hidden="true" inert/);
 assert.match(source,/onKeyDown=\{key\}/);assert.match(source,/onClick=\{\(\)=>onPlay\(game\)\}/);
 assert.doesNotMatch(source,/crossover-control|type="range"|crossover-presets/);
 const css=readFileSync(new URL('../src/world-crossover.css',import.meta.url),'utf8');
 assert.match(css,/space-layer\{position:absolute;inset:0/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(css,/portal-card[^}]*transform:/);
});
