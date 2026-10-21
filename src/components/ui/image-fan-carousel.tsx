import {LazyMotion,m,useMotionValue,useTransform,useSpring,type MotionStyle} from 'framer-motion';
const loadMotion=()=>import('./adventure-motion').then(module=>module.default);
import {useEffect,useRef,useState,type CSSProperties,type ReactNode,type MouseEvent} from 'react';
import {adventureCardLayout,adventurePreviewPosition,adventureCursorPosition} from './adventure-card-layout';
export type FanItem={id:string;title:string;image:string;content:ReactNode};
/** This inner surface owns pointer tilt; carousel transforms stay on its parent. */
function AdventureTiltSurface({children,enabled,limit,className}:{children:ReactNode;enabled:boolean;limit:number;className:string}){
 const cursorX=useMotionValue(0),cursorY=useMotionValue(0),lift=useMotionValue(0);
 const targetX=useTransform(cursorY,[-1,1],[limit,-limit]);
 const targetY=useTransform(cursorX,[-1,1],[-limit,limit]);
 const spring={stiffness:180,damping:24,mass:.6};
 const rotateX=useSpring(targetX,spring),rotateY=useSpring(targetY,spring),y=useSpring(lift,spring);
 const imageX=useTransform(rotateY,v=>`${-v*.65}px`),imageY=useTransform(rotateX,v=>`${v*.65}px`);
 const [hovered,setHovered]=useState(false);
 const reset=()=>{cursorX.set(0);cursorY.set(0);lift.set(0);setHovered(false)};
 useEffect(()=>{if(!enabled){cursorX.set(0);cursorY.set(0);lift.set(0);rotateX.jump(0);rotateY.jump(0);y.jump(0);setHovered(false)}},[enabled,cursorX,cursorY,lift,rotateX,rotateY,y]);
 const move=(e:MouseEvent<HTMLDivElement>)=>{
  if(!enabled)return;
  const position=adventureCursorPosition(e.currentTarget.getBoundingClientRect(),e.clientX,e.clientY);
  cursorX.set(position.x);cursorY.set(position.y);
 };
 return <div className="fan-tilt-hitbox" onMouseEnter={()=>{if(enabled){setHovered(true);lift.set(-4)}}} onMouseMove={move} onMouseLeave={reset}>
  <m.div className={`${className} fan-tilt-surface`} data-tilting={hovered?'on':'off'} style={{rotateX,rotateY,y,transformPerspective:1200,'--card-image-x':imageX,'--card-image-y':imageY} as MotionStyle}>
   {children}<span className="fan-card-light" aria-hidden="true"><i/><i/><i/><i/></span><span className="fan-card-sheen" aria-hidden="true"/>
  </m.div>
 </div>
}
function FeaturedAdventure({item,active,motionAllowed,tiltEnabled}:{item:FanItem;active:boolean;motionAllowed:boolean;tiltEnabled:boolean}){
 return <m.div className="fan-featured illustrated-world-cards" data-world={item.id.split('-')[0]} hidden={!active} inert={!active} initial={false} animate={{opacity:active?1:0,scale:active?1:.97,rotateY:active?0:5}} transition={{duration:motionAllowed?.45:0,ease:[.22,1,.36,1]}}>
  <AdventureTiltSurface className="fan-card-surface" enabled={active&&tiltEnabled} limit={8}>{item.content}</AdventureTiltSurface>
 </m.div>
}
export function ImageFanCarousel({items,selected,onSelect,readOnly=false}:{items:FanItem[];selected:string;onSelect?:(id:string)=>void;readOnly?:boolean}){
 const [index,setIndex]=useState(Math.max(0,items.findIndex(x=>x.id===selected)));
 const [width,setWidth]=useState(600),[paused,setPaused]=useState(false),[motionAllowed,setMotionAllowed]=useState(false),[finePointer,setFinePointer]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(hover: hover) and (pointer: fine)');const update=()=>setFinePointer(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 const frame=useRef<HTMLDivElement>(null),touch=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
 useEffect(()=>{const i=items.findIndex(x=>x.id===selected);if(i>=0)setIndex(n=>{const current=((n%items.length)+items.length)%items.length;return n+((i-current+items.length+items.length/2)%items.length)-items.length/2})},[selected,items.length]);
 useEffect(()=>{const el=frame.current;if(!el)return;const update=()=>setWidth(el.clientWidth);const observer=new ResizeObserver(update);observer.observe(el);update();return()=>observer.disconnect()},[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),scope=frame.current?.closest('[data-effects]');const update=()=>setMotionAllowed(!media.matches&&scope?.getAttribute('data-effects')!=='off');update();media.addEventListener('change',update);const observer=new MutationObserver(update);if(scope)observer.observe(scope,{attributes:true,attributeFilter:['data-effects']});return()=>{media.removeEventListener('change',update);observer.disconnect()}},[]);
 useEffect(()=>{if(paused||!motionAllowed||readOnly||items.length<2)return;const timer=window.setInterval(()=>setIndex(i=>i+1),4000);return()=>window.clearInterval(timer)},[paused,motionAllowed,readOnly,items.length]);
 const activeIndex=((index%items.length)+items.length)%items.length,active=items[activeIndex]||items[0];if(!active)return null;
 const layout=adventureCardLayout(width),tiltEnabled=motionAllowed&&finePointer&&!layout.compact,change=(delta:number)=>setIndex(i=>i+delta);
 return <LazyMotion features={loadMotion} strict><div ref={frame} className="world-carousel-frame image-fan-carousel living-adventure-cards" style={{'--living-card-width':`${layout.cardWidth}px`,'--living-card-height':`${layout.cardHeight}px`,'--living-preview-width':`${layout.previewWidth}px`,'--living-preview-height':`${layout.previewHeight}px`} as CSSProperties} data-layout={layout.compact?'compact':'wide'} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} data-motion={motionAllowed?'on':'off'} role="region" aria-roledescription="carousel" aria-label="Adventure worlds" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'){e.preventDefault();setIndex(0)}else if(e.key==='End'){e.preventDefault();setIndex(items.length-1)}}}>
  <div className="fan-stage" onTouchStart={e=>{swiped.current=false;setPaused(true);touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchCancel={()=>{touch.current=null;setPaused(false)}} onTouchEnd={e=>{const from=touch.current;touch.current=null;setPaused(false);if(!from)return;const dx=e.changedTouches[0].clientX-from.x,dy=e.changedTouches[0].clientY-from.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){swiped.current=true;change(dx<0?1:-1)}}} onClickCapture={e=>{if(swiped.current){e.preventDefault();e.stopPropagation();swiped.current=false}}}>
   <svg className="fan-light-trail" viewBox="0 0 1000 180" aria-hidden="true"><defs><linearGradient id="livingTrail"><stop stopColor="#b2cbb8" stopOpacity="0"/><stop offset=".5" stopColor="#d2b86c" stopOpacity=".55"/><stop offset="1" stopColor="#b2cbb8" stopOpacity="0"/></linearGradient></defs><path d="M20 25Q500 225 980 25" fill="none" stroke="url(#livingTrail)" strokeWidth="2"/></svg>
   <div className="fan-ring" aria-label="Choose an adventure preview">{items.map((item,i)=>{const distance=((i-activeIndex+items.length+items.length/2)%items.length)-items.length/2,visible=Math.abs(distance)<=layout.visibleNeighbors&&distance!==0;return <m.div key={item.id} className="fan-orbit" aria-hidden={!visible} inert={!visible} style={{visibility:visible?'visible':'hidden',zIndex:10-Math.abs(distance)}} initial={false} animate={adventurePreviewPosition(width,distance)} transition={motionAllowed?{type:'spring',stiffness:140,damping:24,mass:.8}:{duration:0}}><AdventureTiltSurface className="fan-preview-surface" enabled={visible&&tiltEnabled&&!readOnly} limit={5}><m.button type="button" className="fan-thumbnail" disabled={readOnly} aria-label={`Preview ${item.title}`} aria-pressed={i===activeIndex} onClick={()=>{setIndex(n=>n+distance);onSelect?.(item.id);requestAnimationFrame(()=>frame.current?.querySelector<HTMLButtonElement>('.fan-featured:not([hidden]) button')?.focus({preventScroll:true}))}}><img src={item.image} alt="" loading="lazy" draggable={false}/><span>{i+1}</span></m.button></AdventureTiltSurface></m.div>})}</div>
   {items.map(item=><FeaturedAdventure key={item.id} item={item} active={item.id===active.id} motionAllowed={motionAllowed} tiltEnabled={tiltEnabled}/>)}
  </div>
  <div className="fan-navigation"><button type="button" aria-label="Previous adventure" onClick={()=>change(-1)}>←</button><span aria-live="polite" aria-atomic="true">{activeIndex+1} / {items.length} · {active.title}</span><button type="button" aria-label="Next adventure" onClick={()=>change(1)}>→</button></div>
 </div></LazyMotion>
}
