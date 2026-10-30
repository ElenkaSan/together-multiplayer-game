import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {availableAdventures,getAdventure} from '../shared/tiny-adventures';
import {TeamExpeditionExperience,expeditionNarration} from '../src/TeamExpedition';
import {TinyHeroExperience,heroNarration,captainAudio} from '../src/TinyHeroExperience';
import {expertNarration} from '../src/ExpertAdventure';
import {oceanNarration} from '../src/OceanAdventure';
import {collectionNarration} from '../src/CollectionAdventure';
import {RescueHint} from '../src/TinyWorld';
for(const adventure of availableAdventures().map(getAdventure))test(`Level ${adventure.level||1}: result hint hides on retry for both seats and after reconnect`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','captain',adventure.id);
 e.join(r.code,'Hero','hero');r.players.forEach(x=>e.ready(r,x));e.start(r,p);
 e.tick(r.deadline!+1);e.tick(r.deadline!+1);e.tick(r.deadline!+1);
 assert.equal(r.phase,'result');assert.equal(r.result?.retry,true);
 const hint=r.result!.hint!.text;assert.ok(hint);
 const render=(view:ReturnType<Engine['view']>)=>renderToStaticMarkup(React.createElement((adventure.level||1)<3?TinyHeroExperience:TeamExpeditionExperience,{view,actions:{},setActions:()=>{},connected:true,pending:false,remaining:40,command:async()=>{}}));
 for(const player of r.players)assert.ok(render(e.view(r,player)).includes(hint),'failed result shows the hint');
 e.tick(r.deadline!+1);assert.equal(r.phase,'briefing');
 const check=()=>{for(const player of r.players){const view=e.view(r,player);assert.equal(view.adventure!.hint,null);assert.ok(!render(view).includes(hint));
  const narrator=(adventure.level||1)<3?(player.slot?heroNarration:captainAudio):adventure.id==='ocean-adventure'?oceanNarration:['magic-kingdom','moon-mission'].includes(adventure.id)?expertNarration:['cloud-adventure','meadow-rescue'].includes(adventure.id)?collectionNarration:expeditionNarration;
  assert.ok(!narrator(view).includes(hint),'Read to Me does not repeat the answer hint');
  const stale={...view,adventure:{...view.adventure!,hint:{tool:'rope',label:'Rope',hint}}};
  assert.equal(renderToStaticMarkup(React.createElement(RescueHint,{view:stale})), '','shared component rejects stale hints');
 }};
 check();e.tick(r.deadline!+1);assert.equal(r.phase,'action');check();
 const hero=r.players[1];e.disconnect(hero.socketId!);e.join(r.code,'','refreshed',hero.token);check();
 // Every stage uses the same phase-gated server snapshot, including later rounds.
 for(let round=0;round<5;round++){r.round=round;for(const phase of ['briefing','action','locked','paused','finished'] as const){r.phase=phase;for(const player of r.players)assert.equal(e.view(r,player).adventure!.hint,null);}}
});
