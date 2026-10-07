import {mechanicFor} from './adventure-mechanics.js';
import {forestRescue,getAdventure,tinyTools,defaultAdventureId} from '../shared/tiny-adventures.js';
import {solutionFor} from './tiny-adventures.js';
export type Mode = 'tiny'|'signal';
export type Action = Record<string,string>;
export interface Task { key:string; title:string; hint:string; options:{value:string;label:string}[] }
export interface Brief {role:string; message:string; tasks:Task[];visuals?:string[]}
export interface MissionRound {title:string; story:string; icon:string; target:string; hazard:string; power:string; frequency:string}
export const rounds:Record<Mode,MissionRound[]> = {
 tiny:forestRescue.rescues.map((r,i)=>({title:r.title,story:r.story,icon:r.icon,target:r.scene,hazard:r.scene,power:solutionFor(forestRescue.id,i).tool,frequency:''})),
 signal:[
 ['Wake the relay','Recover a carrier signal from the silent station.','01','east','interference','low','blue'],
 ['Cross the debris field','Align your flight path through a moving debris belt.','02','north','debris','high','amber'],
 ['The ghost transmission','Separate the rescue beacon from a decoy.','03','west','interference','low','green'],
 ['Restore the core','Route power before the station loses its orbit.','04','south','debris','high','blue'],
 ['Bring them home','Synchronize the final rescue corridor.','05','east','debris','high','green']
 ].map(([title,story,icon,target,hazard,power,frequency])=>({title,story,icon,target,hazard,power,frequency}))
};
const opts=(pairs:string[][])=>pairs.map(([value,label])=>({value,label}));
export function missionRound(mode:Mode,index:number,adventureId=defaultAdventureId):MissionRound {if(mode==='signal')return rounds.signal[index];const r=getAdventure(adventureId).rescues[index];return {title:r.title,story:r.story,icon:r.icon,target:r.scene,hazard:r.scene,power:solutionFor(adventureId,index).tool,frequency:''}}
export function brief(mode:Mode,index:number,slot:number,count:number,bonus:number,adventureId=defaultAdventureId):Brief {
 const r=missionRound(mode,index,adventureId);
 if(mode==='tiny') {
  const pack=getAdventure(adventureId),resource=pack.mechanics?.resource;
  const custom=mechanicFor(pack.id);if(custom)return custom.brief(index,slot,count,bonus);
  if(slot===0)return {role:'Team Captain',message:`Your rescue map: ${r.story} Helpers have clues about the right tool. You have ${bonus} kindness stars left. One star can cover one helper’s wrong or missing tool. Save some for later!`,tasks:[{key:'support',title:'Choose your team plan',hint:'Ask your helpers what they need, then decide.',options:opts([['save','⭐ Save our stars'],...(bonus>0?[['boost','💛 Spend 1 star to help']]:[])])}]};
  const rescue=getAdventure(adventureId).rescues[index],clue=count>2&&rescue.privateClues?.length?rescue.privateClues[(slot-1)%rescue.privateClues.length]:rescue.clue;
  return {role:'Little Hero',message:`Your secret clue: ${clue} Tell your captain.`,tasks:[{key:'tool',title:'What should you bring?',hint:'Pick a tool, then tap Ready!',options:rescue.tools.map(id=>({value:id,label:`${tinyTools[id].icon} ${tinyTools[id].label}`}))}]};
 }
 const responsibilities=['navigation','engineering','comms'].filter((_,i)=>i%count===slot%count);
 if(count>3 && slot>=3) responsibilities.push(['navigation','engineering','comms'][(slot-3)%3]);
 const tasks:Task[]=responsibilities.map(key=>key==='navigation'?{key,title:'Navigation · route',hint:`Your chart: ${r.target.toUpperCase()} is the safe corridor.`,options:opts([['north','North'],['east','East'],['south','South'],['west','West']])}:key==='engineering'?{key,title:'Engineering · power',hint:`Telemetry: ${r.hazard==='debris'?'Dense debris. High power is required.':'Signal interference. Low power is required.'}`,options:opts([['low','Low power'],['high','High power']])}:{key,title:'Communications · carrier',hint:`Decoder: the verified rescue carrier is ${r.frequency.toUpperCase()}.`,options:opts([['blue','Blue · 144'],['amber','Amber · 218'],['green','Green · 390']])});
 tasks.push({key:'shield',title:'Shared decision · shield',hint:'Navigation operators see the route; engineers see the hazard. Ask the team: debris requires shield ON, interference requires shield OFF. Everyone must agree.',options:opts([['on','Shield on'],['off','Shield off']])});
 return {role:responsibilities.map(x=>({navigation:'Navigator',engineering:'Engineer',comms:'Signal Analyst'}[x])).join(' + '),message:'Share your telemetry aloud or in your usual call. Coordinate all systems before locking your orders. Duplicate operators must also submit the correct setting.',tasks};
}
export function resolve(mode:Mode,index:number,actions:Action[],bonus:number,adventureId=defaultAdventureId) {
 const r=missionRound(mode,index,adventureId);
 if(mode==='tiny') {
  const resource=getAdventure(adventureId).mechanics?.resource;
  const custom=mechanicFor(adventureId);if(custom)return custom.resolve(index,actions,bonus);
  const spend=actions[0]?.support==='boost'&&bonus>0;
  const misses=actions.slice(1).filter(a=>a.tool!==r.power).length;
  const success=misses<=(spend?1:0);
  return {success,bonus:bonus-(spend?1:0),details:`The right tool was ${r.power}. ${actions.slice(1).filter(a=>a.tool===r.power).length}/${actions.length-1} helpers brought it.${spend?' A kindness star covered one missing tool.':''}`,message:success?'You did it! Rescue complete!':"Oops! That didn't work. Let's try something else!"};
 }
 const expected:Action={navigation:r.target,engineering:r.power,comms:r.frequency,shield:r.hazard==='debris'?'on':'off'};
 const errors:string[]=[];
 actions.forEach((a,i)=>brief(mode,index,i,actions.length,bonus).tasks.forEach(t=>{if(a[t.key]!==expected[t.key])errors.push(`Player ${i+1}: ${t.title}`)}));
 return {success:!errors.length,bonus,details:`Route ${r.target.toUpperCase()} · ${r.power} power · ${r.frequency} carrier · shield ${expected.shield.toUpperCase()}.${errors.length?' Unaligned systems: '+errors.join('; ')+'.':''}`,message:errors.length?'Link unstable. The emergency system preserves the crew; integrity drops by 1.':'Signal acquired. All systems aligned.'};
}
