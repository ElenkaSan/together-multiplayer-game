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
 intro:'Five animal adventurers need your help. Follow the forest trail and bring them home together!',
 environment:{renderer:'forest',mapAsset:'/art/tiny/forest-map.webp'},policy:{maxAttempts:2,kindnessStars:3},
 rescues:[
 {id:'bunny-bridge',title:'The wobbly bridge',story:'The bridge is broken. How can we make it safe?',icon:'🐰',friend:'Bunny',character:0,scene:'bridge',art:{scene:'/art/tiny/scene-bridge.webp'},clue:'We need something strong and bendy to tie the bridge together!',tools,mapPosition:[210,420],sounds:{success:'rescue',hint:'hint'}},
 {id:'kitten-tree',title:'A kitten in the clouds',story:'Kitten is high in the tree. How can we help?',icon:'🐱',friend:'Kitten',character:1,scene:'tree',art:{scene:'/art/tiny/scene-tree.webp'},clue:'We need something with steps to reach our friend!',tools,mapPosition:[240,220],sounds:{success:'rescue',hint:'hint'}},
 {id:'puppy-cave',title:'The dark little cave',story:'Puppy is lost in the cave. How can we guide the way?',icon:'🐶',friend:'Puppy',character:2,scene:'cave',art:{scene:'/art/tiny/scene-cave.webp'},clue:'It is too dark to see the path!',tools,mapPosition:[480,205],sounds:{success:'rescue',hint:'hint'}},
 {id:'bear-trail',title:'A chilly forest hill',story:'Bear is shivering. How can we help on the snowy trail?',icon:'🐻',friend:'Bear cub',character:3,scene:'snow',art:{scene:'/art/tiny/scene-snow.webp'},clue:'Something soft and warm could wrap around our friend!',tools,mapPosition:[740,140],sounds:{success:'rescue',hint:'hint'}},
 {id:'duckling-home',title:'Home before the rain',story:'The path is flooded. How can Duckling get home?',icon:'🐥',friend:'Duckling',character:4,scene:'flood',art:{scene:'/art/tiny/scene-flood.webp'},clue:'We need something that floats and carries our friend!',tools,mapPosition:[740,405],sounds:{success:'rescue',hint:'hint'}}
 ]
};
export const adventures:Record<string,Adventure>={'forest-rescue':forestRescue};
export const defaultAdventureId=forestRescue.id;
export const futureWorlds=[['❄️','Ice Rescue'],['🌴','Jungle Adventure'],['🏝️','Treasure Island'],['🏜️','Desert Rescue'],['🌊','Ocean Adventure'],['🏰','Magic Kingdom'],['🌙','Moon Mission'],['☁️','Cloud Adventure'],['🌸','Meadow Rescue']];
export function getAdventure(id=defaultAdventureId):Adventure {const a=adventures[id];if(!a)throw Error('This adventure is not available yet. Choose Forest Rescue.');return a}
