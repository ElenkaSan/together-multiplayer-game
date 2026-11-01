import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CloudShip,CloudChoiceArt,CloudClueArt,CloudMissionScene,CloudWeatherArt} from '../src/CloudArt';
import {CollectionAdventure} from '../src/CollectionAdventure';
import {Engine} from '../server/engine';
import {cloudStages} from '../shared/collection-adventures';
const render=(component:any,props:any)=>renderToStaticMarkup(createElement(component,props));
test('sail, wings, tether and ballast choices have physically different art instead of repeated wind/bridge/crate pictures',()=>{
 for(const [field,a,b] of [['sail','folded','full'],['sail','reefed','full'],['wings','folded','open'],['tether','secured','loose'],['ballast','center','edge'],['cargo','balanced','uneven'],['brake','hold','release'],['blades','protected','open'],['shutters','closed','open'],['rain','rain','dry'],['visibility','low','clear']]){
  const left=render(CloudChoiceArt,{field,value:a}),right=render(CloudChoiceArt,{field,value:b});assert.notEqual(left,right,field);assert.doesNotMatch(left+right,/<img|\.webp/);
 }
 const secured=render(CloudShip,{tether:'secured',sail:'folded',cargo:'balanced'});assert.match(secured,/data-tether="secured"/);assert.match(secured,/data-sail="folded"/);assert.match(secured,/Sail: folded/);assert.match(secured,/data-part="tether"/);
});
test('meteorological east wind and a west outlet point west, while west wind points east',()=>{
 const east=render(CloudChoiceArt,{field:'inlet',value:'east'}),westOutlet=render(CloudChoiceArt,{field:'outlet',value:'west'}),west=render(CloudChoiceArt,{field:'inlet',value:'west'});
 assert.equal(east,westOutlet);assert.notEqual(east,west);
 assert.equal(render(CloudClueArt,{icon:'sky-wind',text:'Air must leave on the opposite side: WEST.'}),render(CloudClueArt,{icon:'sky-wind',text:'After our check, wind comes from the EAST.'}));
});
for(let round=0;round<5;round++)test(`Cloud stage ${round+1}: all roles, private clue pictures and owned controls keep the existing rules`,()=>{
 const e=new Engine(),{r,p}=e.create('tiny','Captain','c','cloud-adventure');e.join(r.code,'Skyway Explorer','h');r.players.forEach(x=>e.ready(r,x));e.start(r,p);r.round=round;e.begin(r);e.tick(r.deadline!+1);
 const stable=()=>{const {serverTime,...v}=e.view(r,p);return JSON.stringify(v)},before=stable();let clues=0;
 for(const player of r.players){const view=e.view(r,player);const html=render(CollectionAdventure,{view,connected:true,pending:false,remaining:120,command:async()=>({ok:true})});
  assert.match(html,/cloud-mission-scene/);assert.ok(html.includes(cloudStages[round].location));assert.match(html,/Launch team plan|Captain launches/);assert.doesNotMatch(html,/NaN|undefined/);
  for(const o of view.brief!.observations!){assert.match(render(CloudClueArt,{icon:o.icon,text:o.text}),/<svg/);clues++;}
 }
 assert.equal(clues,6);for(const f of cloudStages[round].fields)for(const o of f.options)assert.match(render(CloudChoiceArt,{field:f.key,value:o.value}),/<svg/);
 assert.equal(stable(),before,'drawings must not change game state');
});
test('calm status is calm; weather changes only reflect the public board; blank forecasts do not invent a chosen answer',()=>{
 assert.match(render(CloudWeatherArt,{kind:'calm'}),/data-weather="calm"/);
 const before=render(CloudMissionScene,{round:1,settings:{},board:{weather:{round:1,checked:false}}});assert.match(before,/Before weather check: calm conditions/);assert.match(before,/data-weather="calm"/);
 const after=render(CloudMissionScene,{round:1,settings:{},board:{weather:{round:1,checked:true}}});assert.match(after,/Wind now blows strongly from the east/);assert.match(after,/data-weather="wind"/);
 const forecast=render(CloudMissionScene,{round:3,settings:{},board:{}});assert.match(forecast,/Combine your observations/);assert.match(forecast,/data-weather="forecast"/);assert.match(forecast,/Not set/);
});
test('Storm Passage retains fixed prepared routes; finale presents all three independent skyways',()=>{
 const storm=render(CloudMissionScene,{round:2,settings:{primary:'lower',backup:'upper',active:'primary',wings:'folded',height:'low',tether:'secured'},board:{weather:{round:2,checked:true,prepared:{primary:'lower',backup:'upper'}}}});assert.match(storm,/Routes fixed: primary lower · backup upper/);assert.match(storm,/data-wings="folded"/);assert.match(storm,/data-tether="secured"/);
 const final=render(CloudMissionScene,{round:4,settings:{harborRoute:'sheltered',harborMode:'low',millRoute:'open',millMode:'cruise',citadelRoute:'sheltered',citadelMode:'low'},board:{weather:{round:4,checked:true}}});for(const name of ['Sky Harbor','Windmill Islands','Cloud Citadel'])assert.ok(final.includes(name));assert.equal((final.match(/<article/g)||[]).length,3);
});
