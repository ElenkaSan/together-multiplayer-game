import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {brief} from '../server/modes';
import {forestRescue} from '../shared/tiny-adventures';
import {solutionFor,tinyPresentationDuration} from '../server/tiny-adventures';
import {heroNarration,heroNarrationContext,TinyHeroExperience} from '../src/TinyHeroExperience';
import {HeroTrail,TinySoundProvider,SoundToggle} from '../src/TinyWorld';
import {loadSoundPreference,saveSoundPreference} from '../src/tiny-preferences';

function setup(count=2){const e=new Engine();const {r,p}=e.create('tiny','Captain','c');for(let i=1;i<count;i++)e.join(r.code,'Hero '+i,'h'+i);r.players.forEach(x=>e.ready(r,x));e.start(r,p);return {e,r,p,hero:r.players[1]}}
test('Forest has five distinct scenes and varied three-tool menus; public stories never name tools',()=>{
 assert.equal(new Set(forestRescue.rescues.map(r=>r.art?.scene)).size,5);
 assert.equal(new Set(forestRescue.rescues.map(r=>r.tools.join(','))).size,5);
 forestRescue.rescues.forEach((r,i)=>{assert.equal(r.tools.length,3);assert.ok(r.tools.some(t=>t===solutionFor(forestRescue.id,i).tool));assert.doesNotMatch(r.story,/\b(rope|ladder|lamp|light|blanket|boat)\b/i)});
});
test('multiple Little Heroes receive useful different clues, without broadcasting the private clue list',()=>{
 const {e,r,p}=setup(4);assert.notEqual(brief('tiny',0,1,4,3).message,brief('tiny',0,2,4,3).message);assert.match(brief('tiny',0,1,2,3).message,/strong and bendy/);
 const child=e.view(r,r.players[1]);assert.equal('helperBriefs' in child,false);child.adventure!.rescues.forEach(rescue=>{assert.equal('clue' in rescue,false);assert.equal('privateClues' in rescue,false)});assert.equal(e.view(r,p).helperBriefs?.length,3);
});
test('Forest pacing reduces later waits but retains the action deadline, full retry review and Signal timing',()=>{
 const {e,r}=setup();assert.equal(tinyPresentationDuration(r.tiny,7000,'briefing',0),7000);assert.equal(tinyPresentationDuration(r.tiny,7000,'briefing',1),3850);assert.equal(tinyPresentationDuration(r.tiny,12000,'result',0,true),7800);assert.equal(tinyPresentationDuration(r.tiny,12000,'result',0,false),12000);assert.equal(tinyPresentationDuration(undefined,12000,'result',0,true),12000);
 const now=r.deadline!+1;e.tick(now);assert.equal(r.deadline,now+60000);
});
test('Read to Me continues across Look→action and gives short, truthful retry/results narration',()=>{
 const {e,r,hero}=setup();const look=e.view(r,hero);e.tick(r.deadline!+1);const act=e.view(r,hero);assert.equal(heroNarration(look),heroNarration(act));assert.equal(heroNarrationContext(look),heroNarrationContext(act));assert.match(heroNarration(act),/Your clue/);assert.doesNotMatch(heroNarration(act),/See your clue\. Pick a tool\. Tap Ready\. Rescue together/);
 e.submit(r,r.players[0],0,{support:'save'});e.submit(r,hero,0,{tool:'blanket'});e.tick(r.deadline!+1);const wrong=e.view(r,hero);assert.match(heroNarration(wrong),/Oops/);assert.doesNotMatch(heroNarration(wrong),/You did it|is home/);assert.ok(heroNarration(wrong).split(/\s+/).length<25);
 e.tick(r.deadline!+1);e.tick(r.deadline!+1);e.submit(r,r.players[0],0,{support:'save'},2);e.submit(r,hero,0,{tool:'rope'},2);e.tick(r.deadline!+1);assert.match(heroNarration(e.view(r,hero)),/Bunny is home/);
});
test('reconnect restores own locked tool and highlight without exposing other hero submissions',()=>{
 const {e,r,hero}=setup(3);e.tick(r.deadline!+1);e.submit(r,hero,0,{tool:'rope'});e.disconnect('h1');e.join(r.code,'','restored',hero.token);const v=e.view(r,hero);assert.deepEqual(v.ownAction,{tool:'rope'});assert.equal(e.view(r,r.players[2]).ownAction,null);assert.equal('action' in e.view(r,r.players[2]).players[1],false);
 const html=renderToStaticMarkup(React.createElement(TinyHeroExperience,{view:v,actions:v.ownAction!,setActions:()=>{},connected:true,pending:false,remaining:45,command:async()=>{}}));assert.match(html,/aria-pressed="true" aria-label="Rope"/);assert.match(html,/Ready!/);
 const s=new Engine(),signal=s.create('signal','S','s');assert.equal('ownAction' in s.view(signal.r,signal.p),false);
});
test('visible trail keeps progress separate from an unsuccessful attempt',()=>{
 const {e,r,p,hero}=setup();e.tick(r.deadline!+1);e.submit(r,p,0,{support:'save'});e.submit(r,hero,0,{tool:'blanket'});e.tick(r.deadline!+1);let html=renderToStaticMarkup(React.createElement(HeroTrail,{view:e.view(r,hero)}));assert.match(html,/0 \/ 5 home/);assert.doesNotMatch(html,/Bunny: home/);
 e.tick(r.deadline!+1);e.tick(r.deadline!+1);e.submit(r,p,0,{support:'save'},2);e.submit(r,hero,0,{tool:'rope'},2);e.tick(r.deadline!+1);html=renderToStaticMarkup(React.createElement(HeroTrail,{view:e.view(r,hero)}));assert.match(html,/1 \/ 5 home/);assert.match(html,/Bunny: home/);
});
test('Sound On/Off preference survives refresh and storage failures remain safe',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v)}});
 try{assert.equal(loadSoundPreference(),false);saveSoundPreference(true);assert.equal(loadSoundPreference(),true);let html=renderToStaticMarkup(React.createElement(TinySoundProvider,null,React.createElement(SoundToggle)));assert.match(html,/Sound on/);assert.match(html,/Mute sound effects/);saveSoundPreference(false);html=renderToStaticMarkup(React.createElement(TinySoundProvider,null,React.createElement(SoundToggle)));assert.match(html,/Sound off/);Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('blocked')}});assert.equal(loadSoundPreference(),false);assert.doesNotThrow(()=>saveSoundPreference(true))}finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage')}
});
