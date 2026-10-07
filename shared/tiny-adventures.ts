/** Public content, never answer keys. Original art uses stable keys, not round indices. */
export type ToolId='rope'|'ladder'|'lamp'|'blanket'|'boat';
export type SceneId='bridge'|'tree'|'cave'|'snow'|'flood';
export interface TinyTool {id:ToolId;label:string;icon:string}
export const tinyTools:Record<ToolId,TinyTool>={rope:{id:'rope',label:'Rope',icon:'🪢'},ladder:{id:'ladder',label:'Ladder',icon:'🪜'},lamp:{id:'lamp',label:'Light',icon:'🔦'},blanket:{id:'blanket',label:'Blanket',icon:'🧣'},boat:{id:'boat',label:'Boat',icon:'🚤'}};
export interface RouteChoice {id:string;label:string;visual:'ice'|'cracks'|'shelter'|'ridge'|'pines'|'cave'|'bridge'|'station';note?:string}
export interface ExpeditionChallenge {kind:'route'|'resource-route'|'navigation'|'finale';location:string;choices:RouteChoice[]}
export interface RescueContent {
 id:string;title:string;story:string;icon:string;friend:string;character:number;
 challenge?:ExpeditionChallenge;scene:SceneId;clue:string;privateClues?:string[];tools:ToolId[];mapPosition:[number,number];
 art?:{scene?:string;character?:string;clue?:string};
 sounds:{success:string;hint:string};
}
export interface Adventure {
 id:string;title:string;world:string;intro:string;icon:string;
 environment:{renderer:'forest'|'ice';mapAsset?:string};rescues:RescueContent[];
 level?:number;nextId?:string;
 presentation?:{laterBriefingScale:number;successResultScale:number};
 mechanics?:{resource:{id:'heat-pack';label:string;total:number;requiredRescueIds:string[]};primary?:'routes';difficulty?:number;introduced?:string[]};
 policy:{maxAttempts:number;kindnessStars:number};
}
const tools:ToolId[]=['rope','ladder','lamp','blanket','boat'];
export const forestRescue:Adventure={
 id:'forest-rescue',level:1,nextId:'ice-rescue',title:'Forest Rescue',world:'Sunny Valley',icon:'🌳',
 intro:'Five animal adventurers need your help. Follow the forest trail and bring them home together!',
 environment:{renderer:'forest',mapAsset:'/art/tiny/forest-map.webp'},policy:{maxAttempts:2,kindnessStars:3},presentation:{laterBriefingScale:.55,successResultScale:.65},
 rescues:[
 {id:'bunny-bridge',title:'The wobbly bridge',story:'The bridge is broken. How can we make it safe?',icon:'🐰',friend:'Bunny',character:0,scene:'bridge',art:{scene:'/art/tiny/scene-bridge.webp'},clue:'We need something strong and bendy to tie the bridge together!',privateClues:["It must be strong and bend around the bridge posts.", "It must hold tightly when I cross.", "It needs to tie both sides of the crossing together."],tools:["blanket", "rope", "lamp"],mapPosition:[210,420],sounds:{success:'rescue',hint:'hint'}},
 {id:'kitten-tree',title:'A kitten in the clouds',story:'Kitten is high in the tree. How can we help?',icon:'🐱',friend:'Kitten',character:1,scene:'tree',art:{scene:'/art/tiny/scene-tree.webp'},clue:'We need something with steps to reach our friend!',privateClues:["I need steps I can climb down.", "It must stand on the ground and reach my branch.", "I need a safe way to climb from up high."],tools:["ladder", "boat", "rope"],mapPosition:[240,220],sounds:{success:'rescue',hint:'hint'}},
 {id:'puppy-cave',title:'The dark little cave',story:'Puppy is lost in the cave. How can we guide the way?',icon:'🐶',friend:'Puppy',character:2,scene:'cave',art:{scene:'/art/tiny/scene-cave.webp'},clue:'It is too dark to see the path!',privateClues:["My trail disappears in the shadows.", "I need to see where my paws go.", "Something that shines could guide me."],tools:["boat", "rope", "lamp"],mapPosition:[480,205],sounds:{success:'rescue',hint:'hint'}},
 {id:'bear-trail',title:'A chilly forest hill',story:'Bear is shivering. How can we help on the snowy trail?',icon:'🐻',friend:'Bear cub',character:3,scene:'snow',art:{scene:'/art/tiny/scene-snow.webp'},clue:'Something soft and warm could wrap around our friend!',privateClues:["Snow is making me shiver.", "Something soft could wrap around me.", "I need warmth that stays close."],tools:["rope", "blanket", "ladder"],mapPosition:[740,140],sounds:{success:'rescue',hint:'hint'}},
 {id:'duckling-home',title:'Home before the rain',story:'The path is flooded. How can Duckling get home?',icon:'🐥',friend:'Duckling',character:4,scene:'flood',art:{scene:'/art/tiny/scene-flood.webp'},clue:'We need something that floats and carries our friend!',privateClues:["The water is too deep for my feet.", "I need something that floats.", "It must carry me across the water."],tools:["blanket", "boat", "rope"],mapPosition:[740,405],sounds:{success:'rescue',hint:'hint'}}
 ]
};
export const iceRescue:Adventure={
 id:'ice-rescue',level:2,nextId:'jungle-adventure',title:'Ice Rescue',world:'Frostpeak Expedition',icon:'❄️',
 intro:'Climb from the frozen lake to Blizzard Station. Share your clues, choose a route, and save warmth for the journey!',
 environment:{renderer:'ice',mapAsset:'/art/tiny/ice-expedition-map.webp'},policy:{maxAttempts:2,kindnessStars:2},
 mechanics:{primary:'routes',difficulty:2,introduced:['environmental clues','shared limited Warm Packs','safe route alternatives'],resource:{id:'heat-pack',label:'Warm Packs',total:2,requiredRescueIds:[]}},
 rescues:[
 {id:'ice-cracked-lake',title:'Cracked Ice',story:'The lake is cracking. Which crossing can carry our team?',icon:'❄️',friend:'Bunny',character:0,scene:'flood',clue:'',privateClues:['The wide blue ice is thick enough for our team.','White cracks spread near the narrow edge.','Wind has hidden the stepping stones under soft snow.','Our scout found firm blue ice beside the tall ice shelf.','The middle crossing bends toward the dangerous cracks.'],tools:[],mapPosition:[162,421],challenge:{kind:'route',location:'Frozen Lake',choices:[{id:'blue-shelf',label:'Blue shelf',visual:'ice'},{id:'cracked-edge',label:'Cracked edge',visual:'cracks'},{id:'snow-stones',label:'Snow stones',visual:'ridge'}]},sounds:{success:'rescue',hint:'hint'}},
 {id:'ice-chilly-passenger',title:'A Chilly Passenger',story:'Kitten is chilly. How shall we travel to the next shelter?',icon:'❄️',friend:'Kitten',character:1,scene:'snow',clue:'',privateClues:['The short open trail is cold; a Warm Pack keeps Kitten safe.','The cabin trail is longer but sheltered and warm.','The steep ridge has no shelter from the wind.','There is time to take the longer cabin trail.','The open trail reaches the shelter sooner.'],tools:[],mapPosition:[279,248],challenge:{kind:'resource-route',location:'Warm Shelter',choices:[{id:'open-trail',label:'Short open trail',visual:'ridge',note:'Shorter'},{id:'cabin-trail',label:'Cabin trail',visual:'shelter',note:'Longer'},{id:'steep-ridge',label:'Steep ridge',visual:'cracks'}]},sounds:{success:'rescue',hint:'hint'}},
 {id:'ice-snowstorm-trail',title:'Snowstorm Trail',story:'Snow hides the signs. Which trail leads through the whiteout?',icon:'❄️',friend:'Puppy',character:2,scene:'cave',clue:'',privateClues:['Our next trail passes two tall pines.','The trail beside the bare rock ends at a drop.','Wind blows over the high ridge; lower ground is sheltered.','A blue ribbon marks the trail beneath the pines.','The rescue beacon is ahead of the hollow, not the ridge.'],tools:[],mapPosition:[450,205],challenge:{kind:'navigation',location:'Snowstorm Trail',choices:[{id:'pine-hollow',label:'Pine hollow',visual:'pines'},{id:'rock-turn',label:'Rock turn',visual:'cave'},{id:'high-ridge',label:'High ridge',visual:'ridge'}]},sounds:{success:'rescue',hint:'hint'}},
 {id:'ice-windy-crossing',title:'Windy Crossing',story:'The pass is windy. How shall we cross the ravine?',icon:'❄️',friend:'Bear cub',character:3,scene:'bridge',clue:'',privateClues:['The bridge is sturdy, but the wind chills anyone crossing.','The longer cave path protects our team from the wind.','One Warm Pack keeps Bear warm on the exposed bridge.','The narrow cliff ledge has loose snow.','The cave path meets the bridge trail on the far side.'],tools:[],mapPosition:[657,259],challenge:{kind:'resource-route',location:'Windy Crossing',choices:[{id:'exposed-bridge',label:'Exposed bridge',visual:'bridge',note:'Shorter'},{id:'cave-path',label:'Cave path',visual:'cave',note:'Longer'},{id:'cliff-ledge',label:'Cliff ledge',visual:'cracks'}]},sounds:{success:'rescue',hint:'hint'}},
 {id:'ice-blizzard-finale',title:'Blizzard Rescue — Finale',story:'Blizzard Station is ahead. Plan our final crossing together.',icon:'❄️',friend:'Duckling',character:4,scene:'snow',clue:'',privateClues:['The beacon ridge leads straight to the station but is bitterly cold.','A tunnel protects us all the way to the station.','The lake shortcut has new cracks beneath the snow.','A saved Warm Pack lets Duckling take the shorter beacon ridge.','The tunnel reaches the same station without a Warm Pack.'],tools:[],mapPosition:[756,124],challenge:{kind:'finale',location:'Blizzard Station',choices:[{id:'beacon-ridge',label:'Beacon ridge',visual:'station',note:'Shorter'},{id:'shelter-tunnel',label:'Shelter tunnel',visual:'cave',note:'Longer'},{id:'lake-shortcut',label:'Lake shortcut',visual:'cracks'}]},sounds:{success:'complete',hint:'hint'}}
 ]
};
export const adventures:Record<string,Adventure>={'forest-rescue':forestRescue,'ice-rescue':iceRescue};
export function availableAdventures(){return Object.keys(adventures)}
export function adventureDifficulty(level=1){return level===1?"Easy":level===2?"Easy+":level<=4?"Medium":level<=6?"Challenging":"Advanced"}
export function adventureSkills(level=1){return level===1?"Clues • Tools • Teamwork":level===2?"Routes • Shared Warm Packs":level===3?"Different clues • Team decisions":level===4?"Exploration • Action sequences":level<=6?"Routes • Priorities • Combined decisions":"More clues • More teamwork • More strategy"}

export const defaultAdventureId=forestRescue.id;
export const futureWorlds=[['❄️','Ice Rescue'],['🌴','Jungle Adventure'],['🏝️','Treasure Island'],['🏜️','Desert Rescue'],['🌊','Ocean Adventure'],['🏰','Magic Kingdom'],['🌙','Moon Mission'],['☁️','Cloud Adventure'],['🌸','Meadow Rescue']];
export function getAdventure(id=defaultAdventureId):Adventure {const a=adventures[id];if(!a)throw Error('This adventure is not available yet. Choose Forest Rescue.');return a}

