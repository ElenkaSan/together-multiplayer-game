import {useEffect,useRef,useState,type CSSProperties,type ReactNode,type MouseEvent} from 'react';
export type FanItem={id:string;title:string;image:string;content:ReactNode};
function FeaturedAdventure({item,active,motionAllowed}:{item:FanItem;active:boolean;motionAllowed:boolean}){
 const reset=(e:MouseEvent<HTMLDivElement>)=>{e.currentTarget.style.setProperty('--card-tilt-x','0deg');e.currentTarget.style.setProperty('--card-tilt-y','0deg')};
 const tilt=(e:MouseEvent<HTMLDivElement>)=>{if(!motionAllowed)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--card-tilt-x',`${(0.5-(e.clientY-r.top)/r.height)*20}deg`);e.currentTarget.style.setProperty('--card-tilt-y',`${((e.clientX-r.left)/r.width-0.5)*20}deg`)};
 return <div className="fan-featured illustrated-world-cards" data-world={item.id.split('-')[0]} hidden={!active} inert={!active} onMouseMove={tilt} onMouseLeave={reset}>
  <div className="fan-card-surface">
   {item.content}
   <span className="fan-card-light" aria-hidden="true"><i/><i/><i/><i/></span>
   <span className="fan-card-sheen" aria-hidden="true"/>
  </div>
 </div>
}
export function ImageFanCarousel({items,selected,onSelect,readOnly=false}:{items:FanItem[];selected:string;onSelect?:(id:string)=>void;readOnly?:boolean}){
 const [index,setIndex]=useState(Math.max(0,items.findIndex(x=>x.id===selected)));
 const [width,setWidth]=useState(600);const [paused,setPaused]=useState(false);const [motionAllowed,setMotionAllowed]=useState(true);const frame=useRef<HTMLDivElement>(null);const touch=useRef<{x:number;y:number}|null>(null);
 useEffect(()=>{const i=items.findIndex(x=>x.id===selected);if(i>=0)setIndex(n=>{const current=((n%items.length)+items.length)%items.length;return n+((i-current+items.length+items.length/2)%items.length)-items.length/2})},[selected]);
 useEffect(()=>{const el=frame.current;if(!el)return;const observer=new ResizeObserver(()=>setWidth(el.clientWidth));observer.observe(el);setWidth(el.clientWidth);return()=>observer.disconnect()},[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setMotionAllowed(!media.matches&&!frame.current?.closest('[data-effects=off]'));update();media.addEventListener('change',update);const observer=new MutationObserver(update);observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['data-effects']});return()=>{media.removeEventListener('change',update);observer.disconnect()}},[]);
 useEffect(()=>{if(paused||!motionAllowed)return;const timer=window.setInterval(()=>setIndex(i=>i+1),4000);return()=>window.clearInterval(timer)},[paused,motionAllowed]);
 const activeIndex=((index%items.length)+items.length)%items.length;
 const active=items[activeIndex]||items[0];if(!active)return null;
 const change=(delta:number)=>setIndex(i=>i+delta);
 const radius=Math.min(380,Math.max(125,width*.42));
 return <div ref={frame} className="world-carousel-frame image-fan-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} data-motion={motionAllowed?'on':'off'} role="region" aria-roledescription="carousel" aria-label="Adventure worlds" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'){e.preventDefault();setIndex(0)}else if(e.key==='End'){e.preventDefault();setIndex(items.length-1)}}}>
  <div className="fan-stage" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{const from=touch.current;touch.current=null;if(!from)return;const dx=e.changedTouches[0].clientX-from.x,dy=e.changedTouches[0].clientY-from.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1)}}>
   <div className="fan-ring" style={{perspective:`${Math.max(650,width*2.4)}px`}} aria-label="Choose an adventure preview">{items.map((item,i)=>{const angle=(i-index)*360/items.length;return <div key={item.id} className="fan-orbit" style={{'--fan-angle':`${angle}deg`,'--fan-counter':`${-angle}deg`,'--fan-radius':`${radius}px`,'--fan-lean':`${-Math.sin(angle*Math.PI/180)*18}deg`} as CSSProperties}><button type="button" className="fan-thumbnail" disabled={readOnly} aria-label={`Preview ${item.title}`} aria-pressed={i===activeIndex} onClick={()=>{const delta=((i-activeIndex+items.length+items.length/2)%items.length)-items.length/2;setIndex(n=>n+delta);onSelect?.(item.id)}}><img src={item.image} alt="" loading="lazy"/><span>{i+1}</span></button></div>})}</div>
   {items.map(item=><FeaturedAdventure key={item.id} item={item} active={item.id===active.id} motionAllowed={motionAllowed}/>)}
  </div>
  <div className="fan-navigation"><button type="button" aria-label="Previous adventure" onClick={()=>change(-1)}>←</button><span aria-live="polite" aria-atomic="true">{activeIndex+1} / {items.length} · {active.title}</span><button type="button" aria-label="Next adventure" onClick={()=>change(1)}>→</button></div>
 </div>
}
