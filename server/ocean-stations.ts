import {oceanStages,stationFields,oceanPower} from '../shared/advanced-adventures.js';
import {oceanEvidence,oceanPlans} from './advanced-evidence.js';
import type {Action,Brief} from './modes.js';
export interface OceanState {version:number;settings:Action;ready:number[]}
export function oceanBrief(index:number,slot:number,count:number):Brief {
 const fields=stationFields(index,slot,count),roles=[...new Set(fields.map(f=>f.station))];
 const observations=oceanEvidence[index].filter((_,i)=>i%count===slot).map(([icon,text])=>({icon,text}));
 return {role:slot===0?'Team Captain':roles.join(' + '),message:`Your station clue. ${observations.map(o=>o.text).join(' ')} Tell your team.`,observations,tasks:fields.map(f=>({...f,hint:'Discuss the clues. Set your station.'}))};
}
export function resolveOcean(index:number,actions:Action[],bonus:number){
 const settings=Object.assign({},...actions),power=oceanPower(index,settings);
 const success=actions.length>=2&&actions[0]?.launch==='launch'&&oceanStages[index].fields.every(f=>actions.every((a,slot)=>f.key in a?stationFields(index,slot,actions.length).some(own=>own.key===f.key):true))&&power.used<=power.capacity&&oceanPlans[index].some(plan=>Object.entries(plan).every(([k,v])=>settings[k]===v));
 const details=success?index===4?'Ocean Light Restored! The navigation beacon shines again.':'One more ocean mission system is restored.':power.used>power.capacity?'Too many systems need power. Switch something off and share the power blocks.':index===4&&settings.sensor==='sonar'?'Sonar interferes with the beacon. Check the sensor and signal clues.':'Our settings do not work together yet. Share every station clue and try a compatible plan.';
 return {success,bonus,message:success?'You did it! Systems working together!':"Oops! That didn't work. Let's try something else!",details};
}
