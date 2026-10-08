import {isCollection,collectionStages,collectionPreview,type CollectionBoard} from './collection-adventures.js';
import type {Adventure,RescueContent} from './tiny-adventures.js';
import type {ExpeditionStage,PlanField,PlanChoice} from './new-adventures.js';
export type ExpertId='magic-kingdom'|'moon-mission'|'cloud-adventure'|'meadow-rescue';
export const isExpert=(id?:string):id is ExpertId=>id==='magic-kingdom'||id==='moon-mission'||isCollection(id);
const o=(value:string,label:string,icon=value):PlanChoice=>({value,label,icon});
const f=(key:string,title:string,options:PlanChoice[]):PlanField=>({key,title,options});
const binary=(key:string,title:string,a:string,b:string,icon:string)=>f(key,title,[o(a,a.replaceAll('-',' '),icon),o(b,b.replaceAll('-',' '),icon)]);
const turns=(key:string,title:string)=>f(key,title,[o('0','0 turns','compass'),o('1','1 turn','compass'),o('2','2 turns','compass')]);
const shapes=f('source','Start shape',[o('0','Circle','circle'),o('1','Triangle','triangle'),o('2','Diamond','diamond')]);
const colors=f('color','Start color',[o('0','Blue','blue'),o('1','Gold','amber'),o('2','Violet','violet')]);
const stage=(id:string,location:string,story:string,position:[number,number],fields:PlanField[]):ExpeditionStage=>({id,location,story,position,fields,observations:[]});
export const magicStages=[
 stage('magic-gate','Rainbow Gate','Try the magic. What changes?',[48,79],[shapes,colors,turns('shapeTurn','Shape wheel'),turns('colorTurn','Color wheel'),binary('lens','Lens','clear','swap','light'),binary('seal','Gate frame','round','diamond','gate')]),
 stage('magic-garden','Mirror Garden','Turn your mirror. Follow the light together.',[25,51],['a','b','c','d'].map((k,i)=>binary(k,`Mirror ${i+1}`,'up','right','mirror')).concat([binary('filter','Light filter','blue','gold','light'),binary('gate','Beam exit','garden','cloud','gate')])),
 stage('magic-bridges','Floating Bridges','Our platforms are linked. Build one safe path.',[61,44],[turns('left','Left lift'),turns('middle','Middle lift'),turns('right','Right lift'),binary('link','Link direction','same','opposite','vine'),binary('weight','Counterweight','left','right','supplies'),binary('anchor','Path anchor','hold','release','shield')]),
 stage('magic-tower','Clockwork Tower','Turn the gears. Watch both pointers.',[85,28],[turns('drive','Drive gear'),binary('gear','Gear size','small','large','gear'),binary('direction','Gear direction','forward','reverse','compass'),turns('offset','Second pointer'),binary('coupling','Gear coupling','linked','free','vine'),binary('lock','Light lock','blue','gold','light')]),
 stage('magic-castle','Crystal Castle','Transform, guide and steady the Heart of Light.',[48,16],[turns('transform','Light wheel'),binary('mirror','Mirror route','heart','sky','mirror'),turns('left','Left platform'),turns('right','Right platform'),binary('coupling','Heart gears','linked','free','gear'),binary('lens','Heart lens','clear','swap','light')])
];
export const moonStages=[
 stage('moon-base','Moon Base','Prepare our expedition. Think about the journey ahead.',[24,80],[binary('mobility','Explore module','grip','scanner','rover'),binary('supply','Power module','battery','solar','power'),binary('hatch','Hatch','sealed','open','gate'),binary('beacon','Base beacon','on','off','beacon'),binary('map','Return map','saved','blank','map'),binary('cargo','Equipment straps','secure','loose','supplies')]),
 stage('moon-crater','Crater Crossing','Use our preparation to find a safe crossing.',[49,47],[binary('route','Crossing','ramp','rim','cliff'),binary('support','Crossing support','grip','rails','shield'),binary('pace','Rover pace','careful','fast','rover'),binary('lamp','Path light','on','off','light'),binary('marker','Return markers','placed','none','flag'),binary('balance','Cargo balance','low','high','supplies')]),
 stage('moon-solar','Solar Ridge','Restore the relay. Prepare power for our next stop.',[24,24],[binary('panel','Panel aim','sun','shadow','sun'),binary('cable','Relay cable','joined','open','power'),binary('mode','Relay mode','store','scan','sonar'),binary('engine','Parked engine','off','on','engine'),binary('reserve','Return reserve','protected','shared','shield'),binary('mount','Panel mount','steady','loose','builder')]),
 stage('moon-rover','Lost Rover Valley','Combine the evidence. Find and help the research rover.',[82,32],[f('search','Search area',[o('tracks','Wheel tracks','tracks'),o('glint','Rock glint','diamond')]),binary('method','Search method','scanner','tracks','sonar'),binary('recovery','Bring rover home','tow','repair','builder'),binary('source','Recovery power','relay','stored','power'),binary('stabilizer','Research rover','brace','free','shield'),binary('link','Rover connection','paired','silent','signal')]),
 stage('moon-signal','Earth Signal','Bring our rover home and restore the Earth link.',[80,68],[binary('returnRoute','Return route','surveyed','shortcut','map'),binary('power','Antenna power','relay','stored','power'),binary('antenna','Antenna aim','earth','ridge','compass'),f('exchange','Communication order',[o('request-confirm-send','Request · Confirm · Send','signal'),o('send-request-confirm','Send · Request · Confirm','signal')]),binary('rover','Rover return','escort','leave','rover'),binary('engine','Signal engine','off','on','engine')])
];
export function expertStages(id:string){return isCollection(id)?collectionStages(id):id==='magic-kingdom'?magicStages:moonStages}
export function expertFields(id:string,round:number,slot:number,count:number){return expertStages(id)[round].fields.filter((_,i)=>i%count===slot)}
export interface MoonBoard extends CollectionBoard {mobility?:string;supply?:string;crossing?:string;relay?:string;rover?:string;connection?:string;objectives:string[];assisted:string[]}
export interface MechanismPreview {kind:string;values:number[];labels:string[];beam?:[number,number][];power?:number;capacity?:number}
const n=(s:Record<string,string>,k:string)=>Number(s[k]||0),mod=(v:number)=>(v%3+3)%3;
// Observable physics/rules only. Goals and validation live on the server.
export function expertPreview(id:string,round:number,s:Record<string,string>,board:MoonBoard):MechanismPreview{
 if(isCollection(id))return collectionPreview(id,round,s,board);
 if(id==='magic-kingdom'){
 if(round===0){let shape=mod(n(s,'source')+n(s,'shapeTurn')),color=mod(n(s,'color')+n(s,'colorTurn'));if(s.lens==='swap')[shape,color]=[color,shape];return {kind:'transform',values:[shape,color],labels:['Circle','Triangle','Diamond']}}
 if(round===1){let x=10,y=80;const beam:[number,number][]=[[x,y]];for(const key of ['a','b','c','d']){if(!s[key])break;if(s[key]==='up')y-=17;else x+=18;beam.push([x,y])}return {kind:'mirrors',values:[x,y],labels:[s.filter||'No filter',s.gate||'No exit'],beam}}
 if(round===2){const a=n(s,'left'),b=mod(n(s,'middle')+(s.link==='opposite'?2-a:a)),c=mod(n(s,'right')+(s.weight==='right'?1:0));return {kind:'platforms',values:[a,b,c],labels:[s.anchor||'Choose anchor']}}
 if(round===3){const a=mod(n(s,'drive')*(s.gear==='large'?2:1)*(s.direction==='reverse'?-1:1)),b=s.coupling==='linked'?mod(a+n(s,'offset')):n(s,'offset');return {kind:'gears',values:[a,b],labels:[s.lock||'Choose light lock']}}
 return {kind:'heart',values:[mod(n(s,'transform')+(s.lens==='swap'?1:0)),n(s,'left'),n(s,'right')],labels:[s.mirror||'Choose mirror',s.coupling||'Choose gears']};
 }
 const capacity=board.supply==='battery'?(board.relay==='store'?4:3):(board.relay==='scan'?4:3);
 return {kind:'mission',values:[round],labels:[board.mobility||s.mobility||'Choose equipment',board.supply||s.supply||'Choose power',board.crossing||s.route||'Route not surveyed',board.relay||s.mode||'Relay not restored',board.rover||s.recovery||'Rover not found'],capacity,power:round===3?(s.method==='scanner'?2:1)+(s.recovery==='repair'?2:1):round===4?(s.power==='stored'?2:1)+(s.engine==='on'?2:0):0};
}
function create(id:ExpertId,title:string,world:string,level:number,renderer:'magic'|'moon',intro:string,nextId?:string):Adventure {const stages=expertStages(id);return {id,title,world,level,nextId,icon:'',intro,environment:{renderer,mapAsset:`/art/tiny/${renderer}-map.webp`},mechanics:{primary:'mechanisms',difficulty:level,introduced:renderer==='magic'?['discover transformations','live linked mechanisms']:['multi-round planning','persistent mission control board']},policy:{maxAttempts:2,kindnessStars:0},rescues:stages.map((s,i):RescueContent=>({id:s.id,title:s.location,story:s.story,icon:'',friend:s.location,character:i,scene:'tree',clue:'',tools:[],mapPosition:[s.position[0]*9,s.position[1]*5.4],challenge:{kind:i===4?'finale':'navigation',location:s.location,choices:s.fields[0].options.map(o=>({id:o.value,label:o.label,visual:'station'}))},sounds:{success:i===4?'complete':'rescue',hint:'hint'}}))}}
export const magicKingdom=create('magic-kingdom','Magic Kingdom','The Lost Kingdom of Light',7,'magic','Discover and transform together. Restore the Heart of Light!','moon-mission');
export const moonMission=create('moon-mission','Moon Mission','The Lunar Rescue Expedition',8,'moon','Think ahead together. Find the research rover and restore our connection to Earth!','cloud-adventure');
