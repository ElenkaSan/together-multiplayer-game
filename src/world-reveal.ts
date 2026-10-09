export function clampReveal(value:number){return Math.max(0,Math.min(100,value))}
export function revealGeometry(width:number,height:number,value:number,mobile:boolean){
 const p=clampReveal(value)/100;
 if(mobile){const y=height*p,slope=.22;const left=y+width*slope/2,right=y-width*slope/2;return{mobile,x:width/2,y,path:`M 0 ${left} L ${width} ${right}`,clip:`polygon(0 ${left}px,100% ${right}px,100% 100%,0 100%)`}}
 const x=width*p,slope=.26;const top=x+height*slope/2,bottom=x-height*slope/2;return{mobile,x,y:height/2,path:`M ${top} 0 L ${bottom} ${height}`,clip:`polygon(${top}px 0,100% 0,100% 100%,${bottom}px 100%)`}
}
