export type CardTouch={id:number;x:number;y:number};
export type CardTouchPoint={id:number;x:number;y:number;primary:boolean};
/** Keep horizontal card interaction separate from the browser's vertical pan. */
export function adventureCardTouch(contact:CardTouch|null,phase:'down'|'move'|'up'|'cancel',point:CardTouchPoint){
 if(phase==='down'){
  if(!point.primary||contact)return {contact,track:false,reset:false};
  return {contact:{id:point.id,x:point.x,y:point.y},track:true,reset:false};
 }
 if(!contact||contact.id!==point.id)return {contact,track:false,reset:false};
 if(phase==='up'||phase==='cancel')return {contact:null,track:false,reset:true};
 const dx=Math.abs(point.x-contact.x),dy=Math.abs(point.y-contact.y);
 if(dy>10&&dy>dx)return {contact:null,track:false,reset:true};
 return {contact,track:true,reset:false};
}
