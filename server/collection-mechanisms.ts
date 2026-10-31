import {collectionStages,collectionOwnKeys,weatherRounds,type CollectionBoard} from '../shared/collection-adventures.js';
import type {Action,Brief} from './modes.js';
export const collectionEvidence:Record<string,string[][]>={
 'cloud-adventure':[
 ['North corridor is sheltered. South travels high.','North uses LOW height. South uses HIGH.','LOW flight needs FOLDED sail; HIGH needs REEFED sail.','BALANCED cargo keeps either flight steady.','SECURE the tether before departure.','Switch the departure signal ON.'],
 ['After our check, wind comes from the EAST.','Air must leave on the opposite side: WEST.','Strong wind needs PROTECTED blades.','Cross on the SHELTERED side.','CENTER ballast steadies the windmill.','HOLD the brake while reconnecting it.'],
 ['UPPER is safe only in calm weather.','LOWER is sheltered from crosswind.','Our check will bring CROSSWIND to the upper passage.','Prepare DIFFERENT primary and backup routes before checking.','LOWER requires FOLDED wings and LOW flight.','SECURE the tether whichever prepared route you use.'],
 ['Clouds move from the EAST.','Dark rain clouds are approaching.','Two fog layers mean LOW visibility.','RAIN needs CLOSED shutters.','LOW visibility needs a LOW corridor.','Mist needs the AMBER beacon.'],
 ['Harbor crosswind needs a SHELTERED route.','Harbor uses LOW flight after the front.','Windmill tailwind allows OPEN or SHELTERED flight.','OPEN uses CRUISE; SHELTERED uses LOW.','Citadel rain and mist need a SHELTERED route.','Citadel uses LOW flight through mist.']
 ],
 'meadow-rescue':[
 ['Rabbit and Bear can water or plant. Assign different helpers.','WATER must happen before PLANT.','Cat and Dog can deliver or hang lanterns. Assign different helpers.','DELIVERY must happen before LANTERNS.','PARALLEL: water + delivery, then plant + lanterns. SERIAL does them one after another.','The garden valve must be OPEN for watering.'],
 ['Bridge and ford both reach the gathering place.','Each route carries only ONE delivery in our wave.','OPEN the bridge gate.','ALIGN the stepping stones for the ford.','Fruit needs a CLOSED crate.','Flowers must travel UPRIGHT.'],
 ['The source supplies THREE water units.','Orchard needs at least ONE unit.','Flowers need at least ONE unit too.','OPEN the return channel to avoid losing water.','A CLEAN filter and STEADY pump protect both gardens.','OPEN the main sluice. Divide all three units, not more.'],
 ['SOLAR or WATER can power our lights.','WATER power needs an OPEN return channel.','Point the welcome signal to the TREE.','ONE path needs GROUPS; TWO paths allow TOGETHER or GROUPS.','Open ONE or TWO paths; match the arrival plan.','Switch path lanterns ON.'],
 ['Share THREE water units: both gardens need at least ONE.','Food can use the BRIDGE or FORD.','Friends can use either route too.','SOLAR powers the celebration. WATER works with an OPEN return.','OPEN return keeps water available when the wheel powers lights.','Same route: arrive in GROUPS. Different routes: GROUPS or TOGETHER.']
 ]
};
export const collectionHints:Record<string,string[]>={
 'cloud-adventure':['Match corridor, height and sail. Balance and secure the ship.','The updated east wind needs a west outlet. Protect the blades.','Your two routes are fixed. Select the sheltered prepared route and fold the wings.','Combine wind, rain and fog evidence before choosing city protection.','Match each skyway to its own weather. Windmill has two safe configurations.'],
 'meadow-rescue':['Share the helper jobs. Water before planting; deliveries before lanterns.','Use both routes in this delivery wave. Protect both loads.','Divide three water units between two gardens, then keep the flow clean and steady.','Match arrival groups to the number of paths. Return water used by the wheel.','Keep both gardens watered, avoid route congestion, and power the lights without losing water.']
};
// One literal illustration for each observation, kept separate from answer validation.
export const cloudClueIcons=[
 ['sky-routes','sky-height','sky-sail','sky-cargo','sky-tether','sky-signal'],
 ['sky-wind','sky-wind','sky-blades','sky-crossing','sky-cargo','sky-brake'],
 ['sky-height','sky-crossing','sky-wind','sky-plan','sky-sail','sky-tether'],
 ['sky-wind','sky-rain','sky-fog','sky-shutters','sky-height','sky-beacon'],
 ['sky-crossing','sky-height','sky-routes','sky-height','sky-rain','sky-fog']
];
export function collectionBrief(id:string,round:number,slot:number,count:number):Brief {const observations=collectionEvidence[id][round].map((text,i)=>({icon:id==='cloud-adventure'?cloudClueIcons[round][i]:'leaf',text})).filter((_,i)=>(i+1)%count===slot);return {role:slot===0?'Team Captain':id==='cloud-adventure'?'Skyway Explorer':'Meadow Helper',message:observations.map(o=>o.text).join(' '),observations,tasks:collectionStages(id)[round].fields.filter((_,i)=>i%count===slot).map(f=>({...f,hint:'Share clues. Set your part of our plan.'}))}}
export function beginCollection(id:string,round:number,b:CollectionBoard){if(id==='cloud-adventure'&&(!b.weather||b.weather.round!==round))b.weather={round,checked:false};const settings:Action={};if(id==='cloud-adventure'&&round===2&&b.weather?.checked&&b.weather.prepared)Object.assign(settings,b.weather.prepared);return settings}
export function checkCollectionWeather(round:number,b:CollectionBoard,s:Action){if(!weatherRounds.includes(round))throw Error('There is no weather check here.');if(b.weather?.checked)throw Error('Conditions are already checked.');if(round===2){if(!['upper','lower'].includes(s.primary)||!['upper','lower'].includes(s.backup)||s.primary===s.backup)throw Error('Prepare two different routes first.');b.weather={round,checked:true,prepared:{primary:s.primary,backup:s.backup}}}else b.weather={round,checked:true};}
export function collectionFieldLocked(id:string,round:number,key:string,b:CollectionBoard){return id==='cloud-adventure'&&round===2&&!!b.weather?.checked&&(key==='primary'||key==='backup')}
export function collectionReadyKeys(id:string,round:number,keys:string[],b:CollectionBoard){return collectionOwnKeys(id,round,keys,b)}
export function collectionCanLaunch(id:string,round:number,b:CollectionBoard){return id!=='cloud-adventure'||!weatherRounds.includes(round)||b.weather?.round===round&&b.weather.checked}
export function collectionSuccess(id:string,round:number,s:Action,b:CollectionBoard){if(!collectionCanLaunch(id,round,b))return false;
 if(id==='cloud-adventure')return [
 ()=>((s.route==='north'&&s.height==='low'&&s.sail==='folded')||(s.route==='south'&&s.height==='high'&&s.sail==='reefed'))&&s.cargo==='balanced'&&s.tether==='secured'&&s.signal==='on',
 ()=>s.inlet==='east'&&s.outlet==='west'&&s.blades==='protected'&&s.crossing==='sheltered'&&s.ballast==='center'&&s.brake==='hold',
 ()=>!!b.weather?.prepared&&s.primary===b.weather.prepared.primary&&s.backup===b.weather.prepared.backup&&b.weather.prepared[s.active as 'primary'|'backup']==='lower'&&s.wings==='folded'&&s.height==='low'&&s.tether==='secured',
 ()=>s.wind==='east'&&s.rain==='rain'&&s.visibility==='low'&&s.shutters==='closed'&&s.height==='low'&&s.beacon==='amber',
 ()=>s.harborRoute==='sheltered'&&s.harborMode==='low'&&((s.millRoute==='open'&&s.millMode==='cruise')||(s.millRoute==='sheltered'&&s.millMode==='low'))&&s.citadelRoute==='sheltered'&&s.citadelMode==='low'
 ][round]();
 return [
 ()=>s.waterHelper!==s.plantHelper&&s.cargoHelper!==s.lightHelper&&['parallel','serial'].includes(s.schedule)&&s.valve==='open',
 ()=>s.fruitRoute!==s.flowerRoute&&s.gate==='open'&&s.stones==='aligned'&&s.crate==='closed'&&s.flowers==='upright',
 ()=>Number(s.orchard)>=1&&Number(s.meadow)>=1&&Number(s.orchard)+Number(s.meadow)===3&&s.return==='open'&&s.filter==='clean'&&s.pump==='steady'&&s.gate==='open',
 ()=>s.signal==='tree'&&s.lights==='on'&&(s.power==='solar'||s.return==='open')&&(s.lanes==='two'||s.arrival==='groups'),
 ()=>(b.restored?.length||0)>=4&&(s.power==='solar'||s.return==='open')&&(s.foodRoute!==s.friendRoute||s.arrival==='groups')
 ][round]();
}
// Coherent Assist defaults; these are server-only, never public answer keys.
export const collectionRecovery:Record<string,Action[]>={
 'cloud-adventure':[{route:'north',height:'low',sail:'folded',cargo:'balanced',tether:'secured',signal:'on'},{inlet:'east',outlet:'west',blades:'protected',crossing:'sheltered',ballast:'center',brake:'hold'},{primary:'upper',backup:'lower',active:'backup',wings:'folded',height:'low',tether:'secured'},{wind:'east',rain:'rain',visibility:'low',shutters:'closed',height:'low',beacon:'amber'},{harborRoute:'sheltered',harborMode:'low',millRoute:'open',millMode:'cruise',citadelRoute:'sheltered',citadelMode:'low'}],
 'meadow-rescue':[{waterHelper:'rabbit',plantHelper:'bear',cargoHelper:'cat',lightHelper:'dog',schedule:'parallel',valve:'open'},{fruitRoute:'bridge',flowerRoute:'ford',gate:'open',stones:'aligned',crate:'closed',flowers:'upright'},{orchard:'2',meadow:'1',return:'open',filter:'clean',pump:'steady',gate:'open'},{power:'solar',return:'closed',signal:'tree',arrival:'together',lanes:'two',lights:'on'},{water:'orchard-2',foodRoute:'bridge',friendRoute:'ford',power:'solar',return:'closed',arrival:'together'}]
};
export function commitCollection(id:string,round:number,s:Action,b:CollectionBoard,assisted:boolean){const key=collectionStages(id)[round].id;b.restored??=[];if(b.restored.includes(key))return;if(assisted){const safe={...collectionRecovery[id][round]};if(id==='cloud-adventure'&&weatherRounds.includes(round)){if(round===2&&b.weather?.prepared){Object.assign(safe,b.weather.prepared);safe.active=b.weather.prepared.primary==='lower'?'primary':'backup'}else if(round===2)b.weather={round,checked:true,prepared:{primary:'upper',backup:'lower'}};else b.weather={round,checked:true}}Object.assign(s,safe)}b.restored.push(key)}
