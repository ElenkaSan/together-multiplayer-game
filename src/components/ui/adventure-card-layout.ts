/** Presentation geometry: shallow arc with partial adjacent previews on phones. */
export function adventureCardLayout(width:number){
 const compact=width<600;
 const cardWidth=Math.min(340,width*(compact?.76:.44));
 const cardHeight=Math.max(360,cardWidth*4/3);
 const previewWidth=cardWidth*(compact?.84:.86);
 const previewHeight=cardHeight*.91;
 return {compact,cardWidth,cardHeight,previewWidth,previewHeight,visibleNeighbors:width>=850?2:1,stageHeight:cardHeight+72};
}
export function adventurePreviewPosition(width:number,distance:number){
 const l=adventureCardLayout(width),tier=Math.abs(distance),direction=Math.sign(distance);
 const span=width/2-l.previewWidth*.39-8;
 const offset=l.compact?width*.19:span*(tier===1?.65:1);
 return {x:direction*offset,y:12+(tier-1)*20,z:-40-(tier-1)*35,rotateY:-direction*(tier===1?22:30),rotateZ:0,scale:tier===1?.94:.84,opacity:tier<=l.visibleNeighbors&&tier>0?1:0};
}

/** Stable outer hitbox coordinates, clamped independently on each axis. */
export function adventureCursorPosition(rect:{left:number;top:number;width:number;height:number},clientX:number,clientY:number){
 const clamp=(value:number)=>Math.max(-1,Math.min(1,value));
 return {x:clamp((clientX-rect.left)/Math.max(1,rect.width)*2-1),y:clamp((clientY-rect.top)/Math.max(1,rect.height)*2-1)};
}
