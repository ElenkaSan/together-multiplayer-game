import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Engine} from '../server/engine';
import {expertPreview,expertStages} from '../shared/expert-adventures';
import {MagicMechanismArt} from '../src/MagicMechanismArt';
import {MoonMechanismArt} from '../src/ExpertArt';
import {ExpertPicture,expertPictureKind} from '../src/ExpertPicture';
const html=(c:any,props:any)=>renderToStaticMarkup(createElement(c,props));
for(const id of ['magic-kingdom','moon-mission'])for(let round=0;round<5;round++)test(`${id} stage ${round+1}: labelled current settings and every private clue render without generic fallback`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);e.join(r.code,'Explorer','h');r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=round;e.begin(r);e.tick(r.deadline!+1);
 const stable=(v:ReturnType<Engine['view']>)=>{const {serverTime,...state}=v;return JSON.stringify(state)};
 const before=stable(e.view(r,p)),v=e.view(r,p),state=v.expert!;
 const content=id==='magic-kingdom'?html(MagicMechanismArt,{preview:state.preview,settings:state.settings,round}):html(MoonMechanismArt,{round,settings:state.settings,board:state.board,preview:state.preview});
 assert.match(content,/<figure/);assert.match(content,/<figcaption>/);assert.match(content,/<h3>/);assert.doesNotMatch(content,/NaN|undefined|Infinity/);assert.match(content,/current|Live preview/);
 // Render actual role-assigned clue text only; no new private state is requested.
 let count=0;for(const player of r.players)for(const o of e.view(r,player).brief!.observations!){const picture=html(ExpertPicture,{text:o.text});assert.ok(picture.includes('expert-picture')||picture.includes('expedition-icon'));count++;}assert.equal(count,6);
 for(const f of expertStages(id)[round].fields)for(const o of f.options){const picture=html(ExpertPicture,{text:o.label,field:f.key,value:o.value});assert.doesNotMatch(picture,/NaN|undefined/);}
 assert.equal(stable(e.view(r,p)),before,'presentation must not mutate authoritative state');
});
test('literal clue imagery distinguishes shapes, lenses, mirrors and lunar systems',()=>{
 for(const [text,kind] of [['The gate wants a GOLD TRIANGLE.','shape'],['Color wheel: Blue → Gold → Violet → Blue.','colors'],['Clear lens keeps shape and color.','lens'],['Mirror 1 and Mirror 2 must point differently.','mirror'],['The flower drinks GOLD light.','flower'],['JOIN the relay cable.','cable'],['The hatch must be SEALED.','hatch'],['Aim the antenna at EARTH.','earth'],['SECURE equipment straps.','cargo']] as const)assert.equal(expertPictureKind(text),kind);
 assert.notEqual(html(ExpertPicture,{text:'Blue',field:'color',value:'0'}),html(ExpertPicture,{text:'Gold',field:'color',value:'1'}));
 assert.notEqual(html(ExpertPicture,{text:'clear',field:'lens',value:'clear'}),html(ExpertPicture,{text:'swap',field:'lens',value:'swap'}));
 assert.notEqual(html(ExpertPicture,{text:'0 turns',field:'shapeTurn',value:'0'}),html(ExpertPicture,{text:'2 turns',field:'shapeTurn',value:'2'}));
 assert.notEqual(html(ExpertPicture,{text:'up',field:'a',value:'up'}),html(ExpertPicture,{text:'right',field:'a',value:'right'}));
});
test('magic live preview follows color and pointer changes without displaying private targets',()=>{
 const s={source:'1',color:'2',shapeTurn:'0',colorTurn:'0',lens:'clear'},board={objectives:[],assisted:[]};
 const markup=html(MagicMechanismArt,{round:0,settings:s,preview:expertPreview('magic-kingdom',0,s,board)});
 assert.match(markup,/Triangle · Violet/);assert.match(markup,/#b5a1e0/);assert.doesNotMatch(markup,/GOLD TRIANGLE|correct|safe route/);
 const mirror=html(MagicMechanismArt,{round:1,settings:{},preview:expertPreview('magic-kingdom',1,{},board)});assert.match(mirror,/Mirror 4: Not set/);assert.match(mirror,/Current endpoint: 10, 80/);assert.doesNotMatch(mirror,/36 steps right/);
});
