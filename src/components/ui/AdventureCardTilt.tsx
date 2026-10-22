/// <reference types="vite/client" />
import {m,useMotionValue,useTransform,useSpring,useMotionValueEvent,type MotionStyle} from 'framer-motion';
import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
import {adventureCursorPosition} from './adventure-card-layout';
import {adventureCardTouch,type CardTouch} from './adventure-card-touch';

/** Outer hitbox is stable. Only its visible inner surface receives pointer transforms. */
export function AdventureCardTilt({children,enabled,limit,className,debug=false}:{children:ReactNode;enabled:boolean;limit:number;className:string;debug?:boolean}){
 const pointerX=useMotionValue(0),pointerY=useMotionValue(0),lift=useMotionValue(0);
 const targetX=useTransform(pointerY,[-1,1],[limit,-limit]);
 const targetY=useTransform(pointerX,[-1,1],[-limit,limit]);
 const spring={stiffness:180,damping:24,mass:.6};
 const rotateX=useSpring(targetX,spring),rotateY=useSpring(targetY,spring),y=useSpring(lift,spring);
 const imageX=useTransform(rotateY,v=>`${-v*.65}px`),imageY=useTransform(rotateX,v=>`${v*.65}px`);
 const [hovered,setHovered]=useState(false);
 const touch=useRef<CardTouch|null>(null);
 const received=useRef(false),debugOutput=useRef<HTMLOutputElement>(null);
 const showDebug=import.meta.env?.DEV&&debug;
 const updateDebug=()=>{if(showDebug&&debugOutput.current)debugOutput.current.textContent=`pointerX: ${pointerX.get().toFixed(3)}\npointerY: ${pointerY.get().toFixed(3)}\nrotateX: ${rotateX.get().toFixed(2)}°\nrotateY: ${rotateY.get().toFixed(2)}°\npointer events received: ${received.current?'YES':'NO'}`};
 useMotionValueEvent(pointerX,'change',updateDebug);useMotionValueEvent(pointerY,'change',updateDebug);
 useMotionValueEvent(rotateX,'change',updateDebug);useMotionValueEvent(rotateY,'change',updateDebug);
 const reset=()=>{touch.current=null;pointerX.set(0);pointerY.set(0);lift.set(0);setHovered(false)};
 useEffect(()=>{if(!enabled){touch.current=null;pointerX.set(0);pointerY.set(0);lift.set(0);rotateX.jump(0);rotateY.jump(0);y.jump(0);setHovered(false)}},[enabled,pointerX,pointerY,lift,rotateX,rotateY,y]);
 const apply=(e:PointerEvent<HTMLDivElement>)=>{
  const position=adventureCursorPosition(e.currentTarget.getBoundingClientRect(),e.clientX,e.clientY);
  pointerX.set(position.x);pointerY.set(position.y);lift.set(-4);setHovered(true);updateDebug();
 };
 const interact=(phase:'down'|'move'|'up'|'cancel',e:PointerEvent<HTMLDivElement>)=>{
  received.current=true;updateDebug();
  if(!enabled)return;
  const action=!!(e.target as Element).closest('[data-no-card-tilt]');
  if(e.pointerType==='mouse'){
   if(phase==='move'&&!action)apply(e);
   if(phase==='cancel')reset();
   return;
  }
  const next=adventureCardTouch(touch.current,phase,{id:e.pointerId,x:e.clientX,y:e.clientY,primary:e.isPrimary,action});
  touch.current=next.contact;
  if(next.reset)reset();
  if(next.track)apply(e);
  // No preventDefault or pointer capture: Safari retains native vertical scrolling.
 };
 return <div className="fan-tilt-hitbox" data-tilt={enabled?'on':'off'} onPointerDown={e=>interact('down',e)} onPointerMove={e=>interact('move',e)} onPointerUp={e=>interact('up',e)} onPointerLeave={e=>{if(e.pointerType==='mouse'||touch.current?.id===e.pointerId)reset()}} onPointerCancel={e=>interact('cancel',e)} onDragStart={e=>e.preventDefault()}>
  <m.div className={`${className} fan-tilt-surface`} data-tilting={hovered?'on':'off'} style={{rotateX,rotateY,y,transformStyle:'preserve-3d','--card-image-x':imageX,'--card-image-y':imageY} as MotionStyle}>
   {children}<span className="fan-card-light" aria-hidden="true"><i/><i/><i/><i/></span><span className="fan-card-sheen" aria-hidden="true"/>
   {showDebug&&<output className="fan-tilt-debug" ref={debugOutput} aria-hidden="true">{'pointerX: 0\npointerY: 0\nrotateX: 0°\nrotateY: 0°\npointer events received: NO'}</output>}
  </m.div>
 </div>
}
