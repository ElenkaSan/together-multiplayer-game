import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {Engine} from '../server/engine';
import {adventures,availableAdventures,nextAdventureId} from '../shared/tiny-adventures';
import {ShareClues} from '../src/ShareClues';
import {TinyProgression} from '../src/TinyProgression';
import {MissionMap} from '../src/TinyWorld';
import {SignalControlTimer} from '../src/SignalControlTimer';
import {pageTitle} from '../src/page-title';
const setup=(id:string,n=2)=>{const e=new Engine(),{r,p}=e.create('tiny','Captain','c',id);for(let i=1;i<n;i++)e.join(r.code,`Hero ${i}`,`h${i}`);r.players.forEach(x=>e.ready(r,x));e.start(r,p);return {e,r,p}};
for(const id of availableAdventures())test(`QA-06 ${id}: captain explicitly shares selected information, never all private facts`,()=>{
 const {e,r,p}=setup(id,3),hero=r.players[1],other=r.players[2];
 const scope={round:r.round,attempt:r.tiny!.attempt,adventureId:id,run:r.tinyProgress!.run};
 const own=e.view(r,p).clues!.own;
 assert.equal(e.view(r,hero).clues!.received.length,0);
 const before=render(React.createElement(ShareClues,{view:e.view(r,p),connected:true,pending:false,command:async()=>{}}));assert.match(before,/Share with Team/);
 e.shareClue(r,p,{...scope,clue:0});const revision=r.revision;e.shareClue(r,p,{...scope,clue:0});assert.equal(r.revision,revision);
 for(const h of [hero,other]){assert.deepEqual(e.view(r,h).clues!.received.map(c=>c.text),[own[0].text]);assert.equal(e.view(r,h).clues!.received[0].name,'Captain')}
 assert.equal(e.view(r,p).clues!.received.length,0);assert.equal(e.view(r,p).clues!.own.filter(c=>c.shared).length,1);
 assert.throws(()=>e.shareClue(r,p,{...scope,clue:999}));assert.throws(()=>e.shareClue(r,p,{...scope,run:0,clue:0}));
 e.disconnect(hero.socketId!);e.join(r.code,'','restored',hero.token);assert.deepEqual(e.view(r,hero).clues!.received.map(c=>c.text),[own[0].text]);
 e.disconnect(p.socketId!);e.join(r.code,'','cap-restored',p.token);assert.equal(e.view(r,p).clues!.own[0].shared,true);
 const html=render(React.createElement(ShareClues,{view:e.view(r,hero),connected:true,pending:false,command:async()=>{}}));assert.match(html,/Information your captain explicitly shared/);assert.ok(html.includes(own[0].text));
 e.leave(r,p);const promoted=r.players[0],remaining=r.players[1];assert.equal(e.view(r,remaining).clues!.received.length,0);
 const fresh={...scope,run:r.tinyProgress!.run};e.shareClue(r,promoted,{...fresh,clue:0});assert.equal(e.view(r,remaining).clues!.received[0].text,e.view(r,promoted).clues!.own[0].text);
 assert.throws(()=>e.shareClue(r,promoted,{...scope,clue:0}));
});
test('QA-05: all ten recommendations follow catalog level order and respect availability',()=>{
 const order=Object.values(adventures).sort((a,b)=>a.level!-b.level!).map(a=>a.id);assert.equal(order.length,10);
 for(const [i,id] of order.entries()){assert.equal(nextAdventureId(id),order[i+1]);assert.equal(nextAdventureId(id,[id]),undefined);const {e,r,p}=setup(id);assert.equal(e.view(r,p).progression!.nextId,order[i+1]||null)}
 assert.equal(nextAdventureId('not-a-world'),undefined);
 const {e,r,p}=setup('ocean-adventure');r.phase='finished';const v=e.view(r,p);assert.equal(v.progression!.nextId,'magic-kingdom');
 const html=render(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}}));assert.match(html,/Continue Adventure → Magic Kingdom/);assert.doesNotMatch(html,/More adventures coming soon/);
 v.progression!.available=[];assert.doesNotMatch(render(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}})),/Continue Adventure → Magic Kingdom/);
});
test('QA-04: finished Ice has one badge/progress summary for either role, active map retains progress',()=>{
 const {e,r}=setup('ice-rescue');for(const p of r.players){r.phase='action';let v=e.view(r,p);assert.equal((render(React.createElement(MissionMap,{view:v})).match(/class="adventure-progress"/g)||[]).length,1);
 r.phase='finished';v=e.view(r,p);const html=render(React.createElement(TinyProgression,{view:v,connected:true,pending:false,command:async()=>{}}));assert.equal((html.match(/class="adventure-progress"/g)||[]).length,1);assert.match(html,/Jungle Adventure/)}
});
test('QA-02: title follows Signal → Tiny → home and invite/screen changes',()=>{
 assert.match(pageTitle({mode:'signal',screen:'action',round:1}),/Signal Lost.*Sector 2\/5/);
 const tiny=pageTitle({mode:'tiny',adventure:'Magic Kingdom',screen:'action',round:0});assert.match(tiny,/Tiny Heroes.*Magic Kingdom.*Stage 1\/5/);assert.doesNotMatch(tiny,/Signal Lost/);
 assert.equal(pageTitle({}), 'TOGETHER! · Cooperative adventures');assert.match(pageTitle({mode:'tiny',screen:'invite'}),/Tiny Heroes.*Join your team/);assert.match(pageTitle({mode:'signal',screen:'finished'}),/Mission complete/);
 assert.match(readFileSync('src/main.tsx','utf8'),/useEffect\(\(\)=>\{document.title=title\},\[title\]\)/);
});
test('QA-01: compact timer renders supplied authoritative remaining time with no second clock',()=>{
 for(const remaining of [135,61,1,0,-5]){const html=render(React.createElement(SignalControlTimer,{remaining,phase:'action',connected:true}));assert.match(html,new RegExp(`${Math.max(0,remaining)}s remaining`));assert.match(html,/role="timer"/)}
 const html=render(React.createElement(SignalControlTimer,{remaining:12,phase:'locked',connected:false}));assert.match(html,/Orders locked/);assert.match(html,/Reconnecting/);
 assert.doesNotMatch(readFileSync('src/SignalControlTimer.tsx','utf8'),/setInterval|Date\.now|useState/);
 const main=readFileSync('src/main.tsx','utf8');assert.match(readFileSync('src/SignalMission.tsx','utf8'),/<SignalControlTimer remaining=\{remaining\}/);assert.match(main,/<SignalMission/);assert.match(main,/<DebrisMission[^>]*remaining=\{remaining\}/);
 const css=readFileSync('src/signal-mission.css','utf8');assert.match(css,/signal-control-timer\{position:sticky/);assert.match(css,/@media\(max-width:600px\)/);
});
function luminance(hex:string){const c=hex.match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('QA-03: opaque homepage caption colors exceed WCAG AA on both clipped world layers',()=>{
 const css=readFileSync('src/world-crossover.css','utf8');assert.match(css,/\.home \.portal-content small\{color:#463d2b;opacity:1\}/);assert.match(css,/\.home \.space-layer \.portal-content small\{color:#c3d3cd;opacity:1\}/);
 // Actual solid/gradient endpoints beneath captions, including the crossover layer.
 for(const [fg,bgs] of [['463d2b',['f9db88','fff5db']],['c3d3cd',['14201e','182938','102030','101c29','142127','0c171d']]] as const)for(const bg of bgs)assert.ok(contrast(fg,bg)>=4.5,`${fg}/${bg}: ${contrast(fg,bg)}`);
 assert.match(css,/space-layer[^}]*clip-path:/); // transition clips opaque layers, never fades text
});
