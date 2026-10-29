import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ExpeditionIcon} from '../src/ExpeditionArt';
import {expeditionPicture,hasExpeditionDrawing} from '../src/ExpeditionIllustrations';
import {adventures} from '../shared/tiny-adventures';
import {expeditionStages} from '../shared/new-adventures';
const draw=(name:string,label?:string,simple=false)=>renderToStaticMarkup(createElement(ExpeditionIcon,{name,label,simple}));
test('all choices in Levels 3–10 render public artwork without adding safety answers',()=>{
 let count=0;
 for(const a of Object.values(adventures).filter(a=>(a.level||1)>=3))for(const stage of expeditionStages(a.id))for(const f of stage.fields)for(const o of f.options){
  const html=draw(o.icon,o.label);assert.match(html,/<svg|expedition-symbol-strip/);assert.doesNotMatch(html,/undefined|NaN|correct|wrong|safe route|danger/);count++;
 }
 assert.ok(count>300);
});
test('different trails and shipwreck compartments have recognizably different illustrations',()=>{
 for(const [icon,label,picture] of [['marsh','Marsh trail','marsh'],['river','Stream trail','stream'],['cliff','Cliff trail','cliff'],['ship','Captain’s cabin','cabin'],['river','Flooded hold','hold'],['cliff','Broken deck','deck'],['leaf','Twin palms','palms'],['ship','Old mast','mast']]){
  assert.equal(expeditionPicture(icon,label),picture);assert.ok(hasExpeditionDrawing(icon,label));assert.match(draw(icon,label),new RegExp(`data-picture="${picture}"`));
 }
});
test('puzzle shapes and colour swatches preserve their exact original semantics',()=>{
 for(const name of ['circle','triangle','diamond','blue','green','amber','violet']){assert.equal(draw(name),draw(name,undefined,true));}
});
test('Forest and Ice shared clues can retain their original pictograms',()=>{
 assert.doesNotMatch(draw('river','River',true),/expedition-illustration/);
 assert.doesNotMatch(draw('tracks','Tracks',true),/expedition-illustration/);
});
test('illustration gradient IDs are unique when multiple cards render together',()=>{
 const html=renderToStaticMarkup(createElement('div',null,...['water','wind','current','depth'].map((name,i)=>createElement(ExpeditionIcon,{name,key:i}))));
 const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/url\(#([^)]*)\)/g))assert.ok(ids.includes(m[1]));
});

test('painted atlases exist and keep exact 4 by 4 tile coordinates',async()=>{
 const {illustrationAtlases}=await import('../src/ExpeditionIllustrations');
 const {statSync}=await import('node:fs');
 for(const a of Object.values(illustrationAtlases)){assert.equal(a.pictures.length,16);assert.ok(statSync(`public${a.asset}`).size>10000);for(let i=0;i<a.pictures.length;i++){const h=draw(a.pictures[i]);assert.ok(h.includes(a.asset));assert.ok(h.includes(`x="${-(i%4)*100}"`));assert.ok(h.includes(`y="${-Math.floor(i/4)*100}"`));}}
});

test('direction and broad-leaf clues use literal illustrations instead of an unrelated flag',()=>{
 for(const text of ['Read the door pictures from left to right.','Read the stones from left to right.','Read the panel from left to right.']){assert.equal(expeditionPicture('flag',text),'read-left-right');assert.match(draw('flag',text),/data-picture="read-left-right"/);}
 assert.equal(expeditionPicture('flag','The broad-leaf marker stands beside the stream.'),'leaf-marker');assert.match(draw('flag','The broad-leaf marker stands beside the stream.'),/data-picture="leaf-marker"/);
 assert.equal(expeditionPicture('flag','The scout brings back a green flag when the crossing is safe.'),'flag');assert.doesNotMatch(draw('flag','Read the door pictures from left to right.'),/Leaf · Sun · River|correct|data-picture="leaf"/);
});
