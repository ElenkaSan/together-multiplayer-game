/** Presentation geometry only: every preview stays inside its stage. */
export function adventureCardLayout(width:number){
 const compact=width<600;
 const cardWidth=Math.min(340,width*(compact?.82:.44));
 const cardHeight=Math.max(360,cardWidth*4/3);
 const previewWidth=compact?Math.min(68,width*.21):Math.min(112,Math.max(64,(width-cardWidth)/2-36));
 const previewHeight=previewWidth*1.22;
 return {compact,cardWidth,cardHeight,previewWidth,previewHeight,visibleNeighbors:width>=900?2:1,stageHeight:cardHeight+(compact?148:72)};
}
export function adventurePreviewPosition(width:number,distance:number){
 const l=adventureCardLayout(width),tier=Math.abs(distance),direction=Math.sign(distance);
 const first=l.cardWidth/2+20+l.previewWidth/2;
 const room=width/2-l.previewWidth/2-18;
 const x=l.compact?direction*width*.31:direction*(tier===1?first:room);
 return {x,y:l.compact?0:-28-(tier-1)*46,rotateY:-direction*(l.compact?9:14),rotateZ:direction*(l.compact?5:7),scale:1,opacity:tier<=l.visibleNeighbors&&tier>0?1:0};
}
