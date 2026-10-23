import {useId} from 'react';

// Decorative miniatures describe only the public object, never route validity or hazards.
export function expeditionPicture(name:string,label=''){
 const t=label.toLowerCase();
 if(['river','marsh','bridge'].includes(name)&&t.includes('marsh'))return 'marsh';
 if(['river','bridge'].includes(name)&&t.includes('stream'))return 'stream';
 if(/^(marsh|stream|cliff) trail$/.test(t))return t.split(' ')[0];
 if(t==='captain’s cabin')return 'cabin';
 if(t==='flooded hold')return 'hold';
 if(t==='broken deck')return 'deck';
 if(t==='twin palms')return 'palms';
 if(t==='old mast')return 'mast';
 if(t==='rock arch'||t==='arch cove')return 'arch';
 if(t==='surf beach'||t==='crescent beach'||t==='soft sand')return 'beach';
 if(t==='jungle path'||t==='garden passage')return 'garden';
 if(t==='deep pool')return 'pool';
 if(t==='tide tunnel'||t==='river passage')return 'water-cave';
 if(t==='high cave')return 'high-cave';
 if(t==='loose rocks')return 'rocks';
 if(t==='stream')return 'stream';
 if(name==='river')return 'stream';
 return name;
}
const scenes=new Set(['marsh','stream','cliff','vine','bridge','cave','arch','ship','shelter','tracks','leaf','flower','coral','water','depth','current','wind','supplies','builder','scout','rover','submarine','gate','cabin','hold','deck','palms','mast','beach','garden','pool','water-cave','high-cave','rocks','flag','map','look','sonar','power','power-off','engine','light','beacon','compass','parrot','mirror','gear','canteen']);
export const illustrationAtlases={
 places:{asset:'/art/tiny/expedition-places-v1.webp',pictures:['marsh','stream','cliff','bridge','cave','arch','ship','beach','palms','garden','shelter','tracks','cabin','hold','deck','water-cave']},
 objects:{asset:'/art/tiny/expedition-objects-v1.webp',pictures:['canteen','compass','supplies','builder','coral','submarine','engine','sonar','rover','power','mirror','gear','leaf','flower','parrot','beacon']}
};
const atlasPicture=(p:string)=>({vine:'bridge',scout:'tracks','high-cave':'cave',rocks:'cliff',pool:'stream',mast:'ship','power-off':'power'}[p]||p);
export const hasExpeditionDrawing=(name:string,label='')=>scenes.has(expeditionPicture(name,label));
export function ExpeditionIllustration({name,label=''}:{name:string;label?:string}){
 const id=useId().replace(/:/g,''),p=expeditionPicture(name,label),paint=(s:string)=>`url(#${id}-${s})`;
 const tile=atlasPicture(p),atlas=Object.values(illustrationAtlases).find(a=>a.pictures.includes(tile));
 if(atlas){const index=atlas.pictures.indexOf(tile);return <svg className="expedition-icon expedition-illustration expedition-painted" viewBox="0 0 100 100" aria-hidden="true" data-picture={p} style={{overflow:'hidden'}}><image href={atlas.asset} x={-(index%4)*100} y={-Math.floor(index/4)*100} width="400" height="400"/>{p==='power-off'&&<path d="m16 16 68 68" fill="none" stroke="#ac665c" strokeWidth="5"/>}</svg>;}
 const plant=(x:number,y:number,s=1)=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0q-5-15 0-32M0-11q-18-16-22-8 4 13 22 14M0-20q8-20 18-16 3 12-18 20" fill="#4d8861" stroke="#37664b" strokeWidth="1.5"/><path d="M0-16q-12-20-21-16 2 13 21 18M0-6q13-16 25-12-4 11-25 16" fill="#80ad69" stroke="#547c4e" strokeWidth="1.5"/></g>;
 const rocks=(x:number,y:number,s=1)=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="m-16 0 5-16 15-5L18-7l-4 10Z" fill="#a9b2ad"/><path d="m-11-16 15-5 2 16-22 5Z" fill="#d2d8c9"/><path d="m6-5 12-2-4 10-30-3Z" fill="#788e87"/></g>;
 const water=<><path d="M65 33q-35 18 7 33t-17 52h69q28-30-6-48T96 33Z" fill={paint('water')}/><path d="M74 42q-19 9 10 21m-9 15q31 7 8 22" fill="none" stroke="#d1f3ec" strokeWidth="3"/><path d="M43 110h26m35-17h20" stroke="#9cddd8" strokeWidth="2"/></>;
 const sceneBase=<><path d="M5 87Q24 47 64 60t89 22v31H5Z" fill="#c2d4a0"/><path d="M5 98q44-22 75-5t75-3v24H5Z" fill={paint('grass')}/></>;
 let art;
 if(['stream','marsh','pool','current','depth','water'].includes(p))art=<>{sceneBase}{water}{p==='marsh'?<>{[22,35,121,136].map((x,i)=><g key={x}><path d={`M${x} 100v-${32+i%2*14}m0 20-8-13m8 6 8-19`} stroke="#638447" strokeWidth="2.5"/><path d={`M${x} ${57-i%2*14}v13`} stroke="#92734d" strokeWidth="6" strokeLinecap="round"/></g>)}<ellipse cx="97" cy="91" rx="11" ry="4" fill="#93b372"/></>:<>{rocks(58,81,.7)}{rocks(94,98,.65)}{plant(26,90,.8)}{plant(134,103,.6)}</>}{p==='current'&&<path d="m94 56-9 8 9 8m-9-8h31" fill="none" stroke="#fff3d1" strokeWidth="3"/>}{p==='depth'&&<path d="M111 53v42m-5-37 5-5 5 5m-10 32 5 5 5-5" fill="none" stroke="#456f80" strokeWidth="3"/>}</>;
 else if(p==='gate')art=<>{sceneBase}<path d="M30 106V32h100v74" fill={paint('stone')} stroke="#7e9278" strokeWidth="2"/><path d="M48 105V46h65v59" fill="#5a8070"/><path d="M53 105V51h55v54" fill={paint('wood')}/><path d="M80 52v52M54 66h52m-52 25h52" stroke="#806b49" strokeWidth="2"/><circle cx="89" cy="78" r="4" fill="#e9c96c"/>{plant(27,105,.7)}{plant(135,108,.65)}</>;
 else if(['flag','map','compass','look','sonar'].includes(p))art=<><ellipse cx="80" cy="110" rx="45" ry="5" fill="#d8ddc2"/>{p==='flag'?<><path d="M51 108V20" stroke="#877250" strokeWidth="5"/><path d="M54 23q24 10 52 0v39q-28 10-52 0Z" fill={paint('canvas')} stroke="#b3975f" strokeWidth="2"/><path d="M58 28q20 8 42 1" stroke="#fff1be" strokeWidth="3"/></>:p==='map'?<><path d="m22 42 37-15 36 13 39-13v65l-39 15-36-13-37 14Z" fill="#efdfad" stroke="#aa9563" strokeWidth="2"/><path d="M59 27v67m36-54v67" stroke="#b7a573" strokeWidth="2"/><path d="m34 79 15-21 24 20 22-20 27 8" stroke="#799c68" strokeWidth="4" strokeDasharray="4 4" fill="none"/><circle cx="121" cy="65" r="7" fill="#c5885a"/></>:p==='look'?<><path d="m36 45 27 6-8 44-32-8Z" fill={paint('metal')} stroke="#58787a" strokeWidth="2"/><path d="m96 45 27-1 13 43-32 8Z" fill={paint('metal')} stroke="#58787a" strokeWidth="2"/><path d="M59 64h45" stroke="#547778" strokeWidth="10"/><ellipse cx="39" cy="87" rx="17" ry="12" fill="#b8dada" stroke="#4b747a" strokeWidth="5"/><ellipse cx="120" cy="87" rx="17" ry="12" fill="#b8dada" stroke="#4b747a" strokeWidth="5"/><path d="m31 84 9-3m71 3 9-3" stroke="#f4f9df" strokeWidth="3"/></>:<><circle cx="80" cy="62" r="42" fill={paint('canvas')} stroke="#9a8255" strokeWidth="3"/><circle cx="80" cy="62" r="34" fill="#eaf1da" stroke="#f9efc8" strokeWidth="2"/>{p==='compass'?<><path d="m80 34 11 29-11 26-11-26Z" fill="#c9876a"/><path d="m80 34 11 29H80Z" fill="#5e9897"/><circle cx="80" cy="63" r="4" fill="#f8dfa1"/><path d="M80 27v4m31 31h-4m-27 31v4M49 62h4" stroke="#68847d" strokeWidth="2"/></>:<><circle cx="80" cy="62" r="22" fill="none" stroke="#90b9a7"/><path d="M80 28v34l26 20M47 62h66m-33 0v34" fill="none" stroke="#72998b" strokeWidth="2"/><circle cx="65" cy="53" r="4" fill="#c5a957"/></>}</>}</>;
 else if(['light','beacon'].includes(p))art=<><ellipse cx="81" cy="109" rx="46" ry="6" fill="#d7dbc0"/><path d="M47 104h68l-6-10H53Z" fill="#859d88"/><path d="M60 94V50h42v44" fill={paint('metal')} stroke="#6d8b83" strokeWidth="2"/><path d="M64 78V51h34v27Z" fill={paint('canvas')}/><path d="m53 50 28-25 29 25Z" fill="#648d7c" stroke="#4f7769" strokeWidth="2"/><path d="M71 51v26m19-26v26" stroke="#ad975c" strokeWidth="2"/><path d="M81 17V8M36 39l-8-5m97 5 8-5" stroke="#e5c87a" strokeWidth="3"/></>;
 else if(p==='wind')art=<>{sceneBase}<path d="M17 64h90q31 0 21-21-10-13-22 0M29 82h98q24 0 17 17-8 13-19 1M17 99h49" stroke="#87b6bc" strokeWidth="5" strokeLinecap="round" fill="none"/>{plant(36,108,.8)}<path d="m94 29 14 2-7 9Z" fill="#c5ab67"/></>;
 return <svg className="expedition-icon expedition-illustration" viewBox="0 0 160 120" aria-hidden="true" data-picture={p}><defs><linearGradient id={`${id}-grass`} x2="0" y2="1"><stop stopColor="#afc794"/><stop offset="1" stopColor="#789d6d"/></linearGradient><linearGradient id={`${id}-water`} x2="1" y2="1"><stop stopColor="#b3e4dc"/><stop offset=".5" stopColor="#70b7c3"/><stop offset="1" stopColor="#4397aa"/></linearGradient><linearGradient id={`${id}-stone`} x2=".8" y2="1"><stop stopColor="#c9d0bd"/><stop offset="1" stopColor="#778f83"/></linearGradient><linearGradient id={`${id}-wood`} x2="0" y2="1"><stop stopColor="#d7b57c"/><stop offset="1" stopColor="#a17c4e"/></linearGradient><linearGradient id={`${id}-leaf`} x2="1" y2="1"><stop stopColor="#b0ca7b"/><stop offset=".55" stopColor="#76a466"/><stop offset="1" stopColor="#4d8058"/></linearGradient><linearGradient id={`${id}-metal`} x2=".8" y2="1"><stop stopColor="#d5e2cc"/><stop offset=".5" stopColor="#abc7bb"/><stop offset="1" stopColor="#80a69c"/></linearGradient><linearGradient id={`${id}-canvas`} x2=".8" y2="1"><stop stopColor="#fbebbe"/><stop offset=".55" stopColor="#e9ce89"/><stop offset="1" stopColor="#cbaa68"/></linearGradient></defs>{art}</svg>;
}
