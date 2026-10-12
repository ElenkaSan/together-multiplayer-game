import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ExpeditionRoundScene} from '../src/TeamExpedition';
import {expeditionSceneLayouts,sceneViewport} from '../src/expedition-scene-layout';
import {getAdventure} from '../shared/tiny-adventures';
import {expeditionStages} from '../shared/new-adventures';

test('all Jungle and Treasure scenes keep each hero inside the same illustration on phones and desktop',()=>{
 for(const [id,layouts] of Object.entries(expeditionSceneLayouts)){
  assert.equal(layouts.length,5);
  assert.equal(new Set(layouts.map(x=>x.ground)).size,5);
  for(const [round,layout] of layouts.entries()){
   const crop=sceneViewport(layout);
   assert.ok(crop.top>=0&&crop.top+crop.height<=layout.height);
   for(const width of [280,390,768,1060]){
    const scale=width/layout.width,footY=crop.heroTop/100*crop.height*scale;
    const heroHeight=width*.11*280/240;
    assert.ok(footY-heroHeight>0,'ears remain in the scene');
    assert.ok(footY<crop.height*scale,'feet remain inside the image above the caption');
   }
   for(const expression of ['idle','thinking','oops','happy','celebrate'] as const){
    const html=renderToStaticMarkup(React.createElement(ExpeditionRoundScene,{id,round,mapAsset:getAdventure(id).environment.mapAsset,story:expeditionStages(id)[round].story,expression}));
    assert.match(html,new RegExp(`data-stage="${expeditionStages(id)[round].id}"`));
    assert.ok(html.includes(layout.ground));
    assert.match(html,/grounded-scene-hero/);
    assert.ok(html.includes(`-${expression}.webp`));
    assert.equal((html.match(/<image /g)||[]).length,1,'one unchanged illustrated background');
   }
  }
 }
});
