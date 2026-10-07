import {iceRoutes} from './ice-expedition.js';
import {getAdventure,tinyTools,type ToolId,type Adventure} from '../shared/tiny-adventures.js';
export interface RescueOutcome {id:string;attempts:number;earnedBadge:boolean;hintUsed:boolean;kindnessUsed:boolean;crewHelp:boolean}
export interface TinyAdventureState {id:string;attempt:number;hintUsed:boolean;kindnessUsed:boolean;completed:RescueOutcome[]}
// Answer keys and hint reveals remain on the server until a failed attempt.
export const adventureSolutions:Record<string,Record<string,{tool:string;hint:string}>>={
 'forest-rescue':{
 'bunny-bridge':{tool:'rope',hint:'A rope can make the bridge steady.'},
 'kitten-tree':{tool:'ladder',hint:'A ladder helps us reach high places.'},
 'puppy-cave':{tool:'lamp',hint:'A light helps us see in the dark.'},
 'bear-trail':{tool:'blanket',hint:'A blanket keeps our friend warm.'},
 'duckling-home':{tool:'boat',hint:'A boat floats on deep water.'}
 },
 'ice-rescue':Object.fromEntries(Object.entries(iceRoutes).map(([id,rule])=>[id,{tool:rule.free,hint:rule.hint}]))};
export function adventureState(id?:string):TinyAdventureState {const a=getAdventure(id);validateAdventure(a);return {id:a.id,attempt:1,hintUsed:false,kindnessUsed:false,completed:[]}}
export function validateAdventure(a:Adventure){if(a.mechanics?.resource&&(a.mechanics.resource.total!==a.policy.kindnessStars||!a.mechanics.resource.requiredRescueIds.every(id=>a.rescues.some(r=>r.id===id))))throw Error('Invalid resource policy');if(!a.rescues.length||!Number.isInteger(a.policy.maxAttempts)||a.policy.maxAttempts<2||a.policy.maxAttempts>5||!Number.isInteger(a.policy.kindnessStars)||a.policy.kindnessStars<0)throw Error('Invalid adventure policy');const ids=new Set<string>();for(const r of a.rescues){const solution=adventureSolutions[a.id]?.[r.id];if(ids.has(r.id)||!solution||(r.challenge?!r.challenge.choices.some(c=>c.id===solution.tool):!r.tools.includes(solution.tool as ToolId))||!r.tools.every(t=>tinyTools[t]))throw Error('Invalid rescue content');ids.add(r.id)}}
export function solutionFor(id:string,index:number){const a=getAdventure(id);return adventureSolutions[id][a.rescues[index].id]}
export function tinyFeedback(state:TinyAdventureState,index:number,success:boolean,bonusBefore:number,bonusAfter:number){const a=getAdventure(state.id),rescue=a.rescues[index],solution=solutionFor(a.id,index);const retry=!success&&state.attempt<a.policy.maxAttempts;const assisted=!success&&!retry;
 state.kindnessUsed ||= bonusAfter<bonusBefore;
 if(!success)state.hintUsed=true;
 if(!retry)state.completed.push({id:rescue.id,attempts:state.attempt,earnedBadge:success,hintUsed:state.hintUsed,kindnessUsed:state.kindnessUsed,crewHelp:assisted});
 return {retry,assisted,hint:!success?{tool:solution.tool,label:tinyTools[solution.tool as ToolId]?.label||rescue.challenge?.choices.find(c=>c.id===solution.tool)?.label||'a sheltered route',text:solution.hint}:null};
}
export function advanceTiny(state:TinyAdventureState,retry:boolean){if(retry){state.attempt++;return}state.attempt=1;state.hintUsed=false;state.kindnessUsed=false}
export function adventureSnapshot(state:TinyAdventureState,index:number){const a=getAdventure(state.id);return {id:a.id,title:a.title,world:a.world,intro:a.intro,total:a.rescues.length,level:a.level||1,mechanics:a.mechanics||null,environment:a.environment,rescues:a.rescues.map(({clue,privateClues,...rescue})=>rescue),attempt:state.attempt,maxAttempts:a.policy.maxAttempts,completed:state.completed.map(x=>({...x})),hint:state.hintUsed?{...solutionFor(a.id,index),label:tinyTools[solutionFor(a.id,index).tool as ToolId]?.label||a.rescues[index].challenge?.choices.find(c=>c.id===solutionFor(a.id,index).tool)?.label||'a sheltered route'}:null}}

// Presentation pacing scales injected timers; transport, action windows and retry rules stay intact.
export function tinyPresentationDuration(state:TinyAdventureState|undefined,base:number,kind:'briefing'|'result',round:number,success=false){if(!state)return base;const p=getAdventure(state.id).presentation;if(!p)return base;const scale=kind==='briefing'?(round===0&&state.attempt===1?1:p.laterBriefingScale):success?p.successResultScale:1;return Math.max(1,Math.round(base*scale))}
