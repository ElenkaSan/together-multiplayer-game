import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {MissionMap,AdventurePicker} from '../src/TinyWorld';
import {mapTravel,travelFrames,type MapSnapshot} from '../src/tiny-map-presentation';
const before:MapSnapshot={identity:'room:forest:1',round:0,completed:0,phase:'locked',success:false};
const after:MapSnapshot={...before,completed:1,phase:'result',success:true};
test('travel only follows a newly observed successful rescue, never initial/reconnect/Oops/replay snapshots',()=>{
 assert.ok(mapTravel(before,after,true));
 assert.equal(mapTravel(null,after,true),null);
 assert.equal(mapTravel(after,after,true),null);
 assert.equal(mapTravel(before,{...after,identity:'room:forest:2'},true),null);
 assert.equal(mapTravel(before,{...after,success:false},true),null);
 assert.equal(mapTravel(before,{...after,completed:0},true),null);
 assert.equal(mapTravel(before,after,false),null);
 assert.equal(mapTravel(before,{...after,phase:'action'},true),null);
});
function game(){const e=new Engine();const {r,p}=e.create('tiny','Captain','a');const h=e.join(r.code,'Hero','b').p;r.players.forEach(x=>e.ready(r,x));e.start(r,p);return {e,r,p,h}}
function htmlMap(v:ReturnType<Engine['view']>){return renderToStaticMarkup(React.createElement(MissionMap,{view:v}))}
test('wrong answers leave friends waiting; successful rescues put original heroes home and rotate the trail hero',()=>{
 const {e,r,p,h}=game();e.tick(r.deadline!+1);e.submit(r,p,0,{support:'save'});e.submit(r,h,0,{tool:'blanket'});e.tick(r.deadline!+1);
 let html=htmlMap(e.view(r,h));assert.match(html,/scout-oops/);assert.doesNotMatch(html,/Bunny, home/);assert.match(html,/0 \/ 5 friends home/);
 e.tick(r.deadline!+1);e.tick(r.deadline!+1);e.submit(r,p,0,{support:'save'},2);e.submit(r,h,0,{tool:'rope'},2);e.tick(r.deadline!+1);
 html=htmlMap(e.view(r,h));assert.match(html,/Bunny, home/);assert.match(html,/builder-idle/);assert.match(html,/scout-happy/);assert.match(html,/1 \/ 5 friends home/);assert.doesNotMatch(html,/Skip/); // Fresh mount restores immediately.
});
test('complete map has all five original friends home with no animation prerequisite',()=>{
 const {e,r,p,h}=game();for(const tool of ['rope','ladder','lamp','blanket','boat']){e.tick(r.deadline!+1);e.submit(r,p,r.round,{support:'save'});e.submit(r,h,r.round,{tool});e.tick(r.deadline!+1);e.tick(r.deadline!+1)}
 const html=htmlMap(e.view(r,h));assert.match(html,/data-map-state="all-home"/);for(const name of ['scout','builder','guide','ranger','rescuer'])assert.match(html,new RegExp(`${name}-celebrate`));assert.match(html,/All friends home/);assert.doesNotMatch(html,/Skip/);
});
test('clean world cards expose completion progress and action without a badge collection',()=>{
 const html=renderToStaticMarkup(React.createElement(AdventurePicker,{selected:'forest-rescue',completed:['forest-rescue'],unlocked:['forest-rescue','ice-rescue'],onSelect:()=>{}}));assert.match(html,/5\/5 friends home/);assert.match(html,/Level 1/);assert.match(html,/Completed/);assert.match(html,/Play again/);assert.match(html,/New/);assert.match(html,/Locked/);assert.doesNotMatch(html,/rescue badges|badge-count/);
});

test('all five travel paths have valid bounded monotonic Web Animation offsets',()=>{
 for(let round=0;round<5;round++){const plan=mapTravel({...before,round,completed:round},{...after,round,completed:round+1},true)!;const frames=travelFrames(plan.points);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);frames.forEach((f,i)=>{assert.ok(f.offset>=0&&f.offset<=1);if(i)assert.ok(f.offset>=frames[i-1].offset)})}
});

test('Forest welcome places a waving Scout before the bridge without moving rescue marker one',()=>{
 const html=renderToStaticMarkup(React.createElement(MissionMap,{adventureId:'forest-rescue'}));
 assert.match(html,/Bunny waving hello/);
 assert.match(html,/scout-greeting-paw/);
 assert.match(html,/left:13%;top:88%/);
 assert.match(html,/left:27%;top:78%/);
});
