import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
export type FanItem={id:string;title:string;image:string;content:ReactNode};
export function ImageFanCarousel({items,selected}:{items:FanItem[];selected:string}){
 const [index,setIndex]=useState(Math.max(0,items.findIndex(x=>x.id===selected)));
 const [width,setWidth]=useState(600);const frame=useRef<HTMLDivElement>(null);const touch=useRef<{x:number;y:number}|null>(null);
 useEffect(()=>{const i=items.findIndex(x=>x.id===selected);if(i>=0)setIndex(i)},[selected]);
 useEffect(()=>{const el=frame.current;if(!el)return;const observer=new ResizeObserver(()=>setWidth(el.clientWidth));observer.observe(el);setWidth(el.clientWidth);return()=>observer.disconnect()},[]);
 const active=items[index]||items[0];if(!active)return null;
 const change=(delta:number)=>setIndex(i=>(i+delta+items.length)%items.length);
 const radius=Math.min(320,Math.max(110,width*.43));
 return <div ref={frame} className="world-carousel-frame image-fan-carousel" role="region" aria-roledescription="carousel" aria-label="Adventure worlds" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'){e.preventDefault();setIndex(0)}else if(e.key==='End'){e.preventDefault();setIndex(items.length-1)}}}>
  <div className="fan-stage" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{const from=touch.current;touch.current=null;if(!from)return;const dx=e.changedTouches[0].clientX-from.x,dy=e.changedTouches[0].clientY-from.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1)}}>
   <div className="fan-ring" aria-label="Choose an adventure preview">{items.map((item,i)=>{const angle=(i-index)*2*Math.PI/items.length,x=Math.sin(angle)*radius,y=-Math.cos(angle)*(width<700?215:260);return <button type="button" key={item.id} className="fan-thumbnail" aria-label={`Preview ${item.title}`} aria-pressed={i===index} onClick={()=>setIndex(i)} style={{'--fan-x':`${x}px`,'--fan-y':`${y}px`,'--fan-scale':`${.8+.15*Math.cos(angle)}`,zIndex:Math.round(10+Math.cos(angle)*5)} as CSSProperties}><img src={item.image} alt="" loading="lazy"/><span>{i+1}</span></button>})}</div>
   {items.map(item=><div className="fan-featured illustrated-world-cards" key={item.id} hidden={item.id!==active.id} inert={item.id!==active.id}>{item.content}</div>)}
  </div>
  <div className="fan-navigation"><button type="button" aria-label="Previous adventure" onClick={()=>change(-1)}>←</button><span aria-live="polite" aria-atomic="true">{index+1} / {items.length} · {active.title}</span><button type="button" aria-label="Next adventure" onClick={()=>change(1)}>→</button></div>
 </div>
}
