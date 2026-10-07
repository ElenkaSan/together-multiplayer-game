import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {TinyProgression,progressionAudio,IceResourceGuide} from '../src/TinyProgression';
import {AdventurePicker} from '../src/TinyWorld';

function completeForest(){const e=new Engine();const {r,p}=e.create('tiny','Captain','c');e.join(r.code,'Hero','h');r.players.forEach(x=>e.ready(r,x));e.start(r,p);for(const tool of ['rope','ladder','lamp','blanket','boat']){e.tick(r.deadline!+1);r.players.forEach(x=>e.submit(r,x,r.round,x.slot?{tool}:{support:'save'},1,r.tiny!.id,r.tinyProgress!.run));e.tick(r.deadline!+1);e.tick(r.deadline!+1)}return {e,r,p}}
test('completion has accessible unlock and Captain controls, with matching read-aloud text',()=>{
 const {e,r,p}=completeForest(),v=e.view(r,p);
 const html=renderToStaticMarkup(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}}));
 assert.match(html,/New Adventure Unlocked/);assert.match(html,/Ice Rescue/);assert.match(html,/5 friends are home/);assert.match(html,/Continue to Ice Rescue/);assert.match(html,/Back to Adventure Map/);assert.match(progressionAudio(v),/New adventure unlocked: Ice Rescue/);
 const child=renderToStaticMarkup(React.createElement(TinyProgression,{view:e.view(r,r.players[1]),connected:true,pending:false,command:async()=>{}}));assert.doesNotMatch(child,/<button/);assert.match(child,/captain chooses/);
});
test('Adventure Map marks completed Forest, playable Ice and locked future worlds',()=>{
 const html=renderToStaticMarkup(React.createElement(AdventurePicker,{selected:'forest-rescue',completed:['forest-rescue'],unlocked:['forest-rescue','ice-rescue'],onSelect:()=>{}}));
 assert.match(html,/Completed/);assert.match(html,/Play again/);assert.match(html,/5\/5 friends home/);assert.match(html,/New/);assert.match(html,/Jungle Adventure: locked, coming soon/);
 const readOnly=renderToStaticMarkup(React.createElement(AdventurePicker,{selected:'forest-rescue',completed:['forest-rescue'],unlocked:['forest-rescue','ice-rescue'],readOnly:true,onSelect:()=>{}}));assert.equal((readOnly.match(/<button[^>]*disabled=""/g)||[]).length,2);
});
test('Ice resource guide reads the server budget, including depletion',()=>{
 const {e,r,p}=completeForest();e.chooseAdventure(r,p,'ice-rescue');r.bonus=0;
 const html=renderToStaticMarkup(React.createElement(IceResourceGuide,{view:e.view(r,p)}));assert.match(html,/0 of 2 Warm Packs left/);assert.match(html,/0 Warm Packs left/);assert.equal((html.match(/pack-empty/g)||[]).length,2);
});
