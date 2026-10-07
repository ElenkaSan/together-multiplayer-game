import {getAdventure} from '../shared/tiny-adventures.js';
import type {Action,Brief} from './modes.js';
// Winning route rules live only on the server. Public art never identifies them.
export const iceRoutes:Record<string,{free:string;warm?:string;hint:string}>={
 'ice-cracked-lake':{free:'blue-shelf',hint:'Find the wide blue shelf. Avoid cracks and soft snow.'},
 'ice-chilly-passenger':{free:'cabin-trail',warm:'open-trail',hint:'The cabin trail needs no pack. The open trail needs one Warm Pack.'},
 'ice-snowstorm-trail':{free:'pine-hollow',hint:'Combine the two pines, blue ribbon and sheltered hollow.'},
 'ice-windy-crossing':{free:'',warm:'exposed-bridge',hint:'Snow blocks the cave. The sturdy exposed bridge needs one Warm Pack.'},
 'ice-blizzard-finale':{free:'shelter-tunnel',warm:'beacon-ridge',hint:'The tunnel is protected. A saved Warm Pack protects the team on the cold beacon ridge.'}
};
export function iceBrief(index:number,slot:number,count:number,bonus:number):Brief{
 const rescue=getAdventure('ice-rescue').rescues[index],c=rescue.challenge!,clues=rescue.privateClues!;
 // With two players the helper combines all observations; larger crews divide them.
 const indices=clues.map((_,i)=>i).filter(i=>i%(count-1)===(slot-1)%(count-1));
 const own=indices.map(i=>clues[i]).join(' ');
 const pictures=[['ice','cracks','ridge','ice','cracks'],['heat','shelter','wind','clock','ridge'],['pines','cave','wind','flag','station'],['wind','cave','heat','cracks','bridge'],['station','cave','cracks','heat','cave']][index];
 const options=c.choices.map(x=>({value:x.id,label:x.label}));
 const route={key:'route',title:c.kind==='navigation'?'Find the trail':'Choose a route',hint:'Share your clues and agree on one route.',options};
 if(slot!==0)return {role:'Little Hero',message:`Your secret clue: ${own} Tell your captain.`,visuals:indices.map(i=>pictures[i]),tasks:[route]};
 return {role:'Team Captain',message:`${rescue.story} Warm Packs remaining: ${bonus}. Compare your heroes’ environmental clues. Check cold, shelter and blocked paths before choosing. Warm Packs protect against extreme cold; they do not fix a wrong route.`,tasks:[route,...(c.kind==='resource-route'||c.kind==='finale'?[{key:'support',title:'Team warmth',hint:'Choose warmth to match your route. Keep a pack for the finale if you can.',options:[{value:'save',label:'Save Warm Packs'},...(bonus>0?[{value:'warm',label:'Use 1 Warm Pack'}]:[])]}]:[])]};
}
export function resolveIce(index:number,actions:Action[],bonus:number){
 const r=getAdventure('ice-rescue').rescues[index],rule=iceRoutes[r.id];
 const captain=actions[0]||{},warmSelected=!!rule.warm&&captain.support==='warm'&&bonus>0;
 const aligned=!!captain.route&&actions.every(a=>a.route===captain.route);
 const safe=(!!rule.free&&captain.route===rule.free)||(captain.route===rule.warm&&warmSelected);
 const resourceChosen=!rule.warm||captain.support==='save'||warmSelected;
 const success=aligned&&safe&&resourceChosen;
 const spend=success&&captain.route===rule.warm&&warmSelected;
 const chosen=r.challenge!.choices.find(x=>x.id===captain.route)?.label||'No route';
 return {success,bonus:bonus-(spend?1:0),details:success?`${chosen} brought everyone to safety. ${spend?'One Warm Pack kept our passenger warm.':'Warm Packs saved.'} ${bonus-(spend?1:0)} remain.`:`${!aligned?'Agree on the same route together.':'This route needs a different plan.'} No Warm Pack used. Try the environmental hint.`,message:success?'You did it! Rescue complete!':"Oops! That didn't work. Let's try something else!"};
}

