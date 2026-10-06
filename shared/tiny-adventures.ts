/** Public content, never answer keys. Original art uses stable keys, not round indices. */
export type ToolId='rope'|'ladder'|'lamp'|'blanket'|'boat';
export type SceneId='bridge'|'tree'|'cave'|'snow'|'flood';
export interface TinyTool {id:ToolId;label:string;icon:string}
export const tinyTools:Record<ToolId,TinyTool>={rope:{id:'rope',label:'Rope',icon:'🪢'},ladder:{id:'ladder',label:'Ladder',icon:'🪜'},lamp:{id:'lamp',label:'Light',icon:'🔦'},blanket:{id:'blanket',label:'Blanket',icon:'🧣'},boat:{id:'boat',label:'Boat',icon:'🚤'}};
export interface RescueContent {
 id:string;title:string;story:string;icon:string;friend:string;character:number;
 scene:SceneId;clue:string;tools:ToolId[];mapPosition:[number,number];
 art?:{scene?:string;character?:string;clue?:string};
 sounds:{success:string;hint:string};
}
export interface Adventure {
 id:string;title:string;world:string;intro:string;icon:string;
 environment:{renderer:'forest';mapAsset?:string};rescues:RescueContent[];
 policy:{maxAttempts:number;kindnessStars:number};
}
const tools:ToolId[]=['rope','ladder','lamp','blanket','boat'];
export const forestRescue:Adventure={
 id:'forest-rescue',title:'Forest Rescue',world:'Sunny Valley',icon:'🌳',
 intro:'Five little friends need your help. Follow the forest trail and bring them home together!',
 environment:{renderer:'forest'},policy:{maxAttempts:2,kindnessStars:3},
 rescues:[
 {id:'bunny-bridge',title:'The wobbly bridge',story:'Bunny needs a safe way across the river.',icon:'🐰',friend:'Bunny',character:0,scene:'bridge',clue:'The bridge needs a strong rope!',tools,mapPosition:[570,310],sounds:{success:'rescue',hint:'hint'}},
 {id:'kitten-tree',title:'A kitten in the clouds',story:'Kitten is stuck up a very tall tree.',icon:'🐱',friend:'Kitten',character:1,scene:'tree',clue:'Our friend is very high up!',tools,mapPosition:[205,207],sounds:{success:'rescue',hint:'hint'}},
 {id:'puppy-cave',title:'The dark little cave',story:'Puppy cannot find the way out.',icon:'🐶',friend:'Puppy',character:2,scene:'cave',clue:'It is too dark to see!',tools,mapPosition:[487,161],sounds:{success:'rescue',hint:'hint'}},
 {id:'bear-trail',title:'A chilly forest hill',story:'Bear cub is shivering on the snowy forest trail.',icon:'🐻',friend:'Bear cub',character:3,scene:'snow',clue:'Our friend feels cold!',tools,mapPosition:[723,178],sounds:{success:'rescue',hint:'hint'}},
 {id:'duckling-home',title:'Home before the rain',story:'Bring Duckling home along the flooded path.',icon:'🐥',friend:'Duckling',character:4,scene:'flood',clue:'The water is deep — bring a boat!',tools,mapPosition:[697,415],sounds:{success:'rescue',hint:'hint'}}
 ]
};
export const adventures:Record<string,Adventure>={'forest-rescue':forestRescue};
export const defaultAdventureId=forestRescue.id;
export const futureWorlds=[['❄️','Ice Rescue'],['🌴','Jungle Adventure'],['🏝️','Treasure Island'],['🏜️','Desert Rescue'],['🌊','Ocean Adventure'],['🏰','Magic Kingdom'],['🌙','Moon Mission'],['☁️','Cloud Adventure'],['🌸','Meadow Rescue']];
export function getAdventure(id=defaultAdventureId):Adventure {const a=adventures[id];if(!a)throw Error('This adventure is not available yet. Choose Forest Rescue.');return a}
