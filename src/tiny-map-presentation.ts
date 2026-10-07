// Coordinates and travel are visual only; never used by the server or scoring.
export type MapPoint=[number,number];
export const forestLocations:MapPoint[]=[[27,78],[32,46],[65,42],[87,27],[84,72]];
export const villageHomes:MapPoint[]=[[62,86],[67,89],[72,92],[77,94],[82,96]];
const trails:MapPoint[][]=[
 [[15,79],[27,78],[31,71],[37,58],[32,46]],
 [[32,46],[41,50],[48,46],[57,40],[65,42]],
 [[65,42],[71,38],[79,31],[87,27]],
 [[87,27],[85,41],[76,52],[77,62],[84,72]],
 [[84,72],[75,78],[72,86],[77,94],[82,96]],
];
export type MapSnapshot={identity:string;round:number;completed:number;phase:string;success:boolean};
export type MapTravel={from:number;to:number;points:MapPoint[]};
export function mapTravel(previous:MapSnapshot|null,current:MapSnapshot,motion:boolean):MapTravel|null{
 if(!motion||!previous||previous.identity!==current.identity||current.phase!=='result'||!current.success||current.completed!==previous.completed+1||previous.round!==current.round)return null;
 return {from:current.round,to:Math.min(current.round+1,4),points:trails[current.round]};
}

export function travelFrames(points:MapPoint[]){return [{left:`${points[0][0]}%`,top:`${points[0][1]}%`,offset:0},...points.map(([x,y],i)=>({left:`${x}%`,top:`${y}%`,offset:Math.min(1,.2+.8*i/(points.length-1))}))]}
