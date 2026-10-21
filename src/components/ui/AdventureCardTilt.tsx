/// <reference types="vite/client" />
import {m,useMotionValue,useTransform,useSpring,useMotionValueEvent,type MotionStyle} from 'framer-motion';
import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
import {adventureCursorPosition} from './adventure-card-layout';

/** Outer hitbox is stable. Only its visible inner surface receives pointer transforms. */
export function AdventureCardTilt({children,enabled,limit,className,debug=false}:{children:ReactNode;enabled:boolean;limit:number;className:string;debug?:boolean}){
 const pointerX=useMotionValue(0),pointerY=useMotionValue(0),lift=useMotionValue(0);
 const targetX=useTransform(pointerY,[-1,1],[limit,-limit]);
 const targetY=useTransform(pointerX,[-1,1],[-limit,limit]);
 const spring={stiffness:180,damping:24,mass:.6};
 const rotateX=useSpring(targetX,spring),rotateY=useSpring(targetY,spring),y=useSpring(lift,spring);
 const imageX=useTransform(rotateY,v=>`${-v*.65}px`),imageY=useTransform(rotateX,v=>`${v*.65}px`);
 const [hovered,setHovered]=useState(false);
 const received=useRef(false),debugOutput=useRef<HTMLOutputElement>(null);
 const showDebug=import.meta.env?.DEV&&debug;
 const updateDebug=()=>{if(showDebug&&debugOutput.current)debugOutput.current.textContent=`pointerX: ${pointerX.get().toFixed(3)}\npointerY: ${pointerY.get().toFixed(3)}\nrotateX: ${rotateX.get().toFixed(2)}°\nrotateY: ${rotateY.get().toFixed(2)}°\npointer events received: ${received.current?'YES':'NO'}`};
 useMotionValueEvent(pointerX,'change',updateDebug);useMotionValueEvent(pointerY,'change',updateDebug);
 useMotionValueEvent(rotateX,'change',updateDebug);useMotionValueEvent(rotateY,'change',updateDebug);
 const reset=()=>{pointerX.set(0);pointerY.set(0);lift.set(0);setHovered(false)};
 useEffect(()=>{if(!enabled){pointerX.set(0);pointerY.set(0);lift.set(0);rotateX.jump(0);rotateY.jump(0);y.jump(0);setHovered(false)}},[enabled,pointerX,pointerY,lift,rotateX,rotateY,y]);
 const move=(e:PointerEvent<HTMLDivElement>)=>{
  received.current=true;updateDebug();
  // Actual event type supports hybrid laptops; touch never drives mouse tilt.
  if(!enabled||e.pointerType!=='mouse')return;
  const position=adventureCursorPosition(e.currentTarget.getBoundingClientRect(),e.clientX,e.clientY);
  pointerX.set(position.x);pointerY.set(position.y);lift.set(-4);setHovered(true);updateDebug();
 };
 return <div className="fan-tilt-hitbox" data-tilt={enabled?'on':'off'} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} onDragStart={e=>e.preventDefault()}>
  <m.div className={`${className} fan-tilt-surface`} data-tilting={hovered?'on':'off'} style={{rotateX,rotateY,y,transformStyle:'preserve-3d','--card-image-x':imageX,'--card-image-y':imageY} as MotionStyle}>
   {children}<span className="fan-card-light" aria-hidden="true"><i/><i/><i/><i/></span><span className="fan-card-sheen" aria-hidden="true"/>
   {showDebug&&<output className="fan-tilt-debug" ref={debugOutput} aria-hidden="true">{'pointerX: 0\npointerY: 0\nrotateX: 0°\nrotateY: 0°\npointer events received: NO'}</output>}
  </m.div>
 </div>
}
