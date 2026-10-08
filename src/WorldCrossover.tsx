import React,{useLayoutEffect,useRef,useState} from 'react';
import {Animal,useTinySound} from './TinyWorld';
import './world-crossover.css';

// The reveal is local presentation state; it never enters the multiplayer engine.
export function crossoverPosition(value:number){return Math.max(20,Math.min(80,value))}
export function WorldCrossover({onPlay}:{onPlay:(mode:'tiny'|'signal')=>void}){
 const [position,setPosition]=useState(50);
 const root=useRef<HTMLDivElement>(null);
 const images=useRef<(HTMLDivElement|null)[]>([]);
 const sound=useTinySound();
 useLayoutEffect(()=>{
  const update=()=>{
   const area=root.current;if(!area)return;
   const bounds=area.getBoundingClientRect();
   // A single diagonal in page coordinates, mapped into each illustration.
   const center=bounds.width*position/100;
   images.current.forEach((node,index)=>{
    if(!node)return;const r=node.getBoundingClientRect();
    const edge=(y:number)=>center+.22*(bounds.height/2-(r.top-bounds.top+y))-(r.left-bounds.left);
    const top=position===50?(index===0?r.width+100:-100):edge(0),bottom=position===50?top:edge(r.height);
    const line=node.querySelector('line');line?.setAttribute('x1',String(top));line?.setAttribute('x2',String(bottom));line?.setAttribute('y2',String(r.height));
    node.style.setProperty('--reveal-mask',index===0?`polygon(${top}px 0,100% 0,100% 100%,${bottom}px 100%)`:`polygon(0 0,${top}px 0,${bottom}px 100%,0 100%)`);
   });
  };
  update();const observer=new ResizeObserver(update);if(root.current)observer.observe(root.current);images.current.forEach(n=>n&&observer.observe(n));window.addEventListener('resize',update);
  return()=>{observer.disconnect();window.removeEventListener('resize',update)};
 },[position]);
 const drag=(e:React.PointerEvent<HTMLDivElement>)=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=root.current?.getBoundingClientRect();if(r)setPosition(crossoverPosition((e.clientX-r.left)/r.width*100))};
 const pointerDown=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);drag(e)};
 const seam=<svg className="crossover-seam" aria-hidden="true"><line x1="-100" y1="0" x2="-100" y2="300"/></svg>;
 return <section className="world-crossover" data-effects={sound.enabled?'on':'off'}>
  <div className="portal-heading"><span className="eyebrow">THE CO-OP GAME NIGHT</span><h1>Different devices.<br/>Same adventure.</h1><p>Pick your world. Invite your people. Win together.</p></div>
  <div className="portal-worlds" ref={root} style={{'--world-position':`${position}%`} as React.CSSProperties}>
   <article className="portal-card portal-tiny">
    <div onPointerDown={pointerDown} onPointerMove={drag} className="portal-art portal-forest" ref={n=>{images.current[0]=n}}>
     <div className="portal-heroes"><Animal kind={0} happy/><Animal kind={1}/><Animal kind={4} happy/></div>
     <div className="crossover-treatment crossover-cold" aria-hidden="true"><span className="scan-orbit"/></div>
     {seam}<div className="portal-tags"><span>Ages 5+</span><span>2–6 players</span></div>
    </div>
    <div className="portal-content"><h2>Tiny Heroes</h2><p>Ten adventures. One team.<br/>Little clues. Kind hearts.</p><button className="portal-play" onClick={()=>onPlay('tiny')}>Play Tiny Heroes <span aria-hidden="true">→</span></button><small>Family adventure</small></div>
   </article>
   <article className="portal-card portal-signal">
    <div onPointerDown={pointerDown} onPointerMove={drag} className="portal-art portal-console" ref={n=>{images.current[1]=n}}>
     <div className="portal-radar" aria-hidden="true"><i/><b>◉</b><i/></div><span className="transmission">TRANSMISSION UNKNOWN</span>
     <div className="crossover-treatment crossover-warm" aria-hidden="true"><span>❧</span><span>❧</span></div>
     {seam}<div className="portal-tags"><span>Ages 12+</span><span>2–6 players</span></div>
    </div>
    <div className="portal-content"><h2>Signal Lost</h2><p>You have part of the truth.<br/>Your crew has the rest.</p><button className="portal-play" onClick={()=>onPlay('signal')}>Play Signal Lost <span aria-hidden="true">→</span></button><small>Cooperative space mission</small></div>
   </article>
  </div>
  <div className="crossover-control"><label htmlFor="world-reveal">World crossover</label><input id="world-reveal" type="range" min="20" max="80" step="1" value={position} aria-valuetext={position===50?'Centered. Both original worlds':position<50?'Signal atmosphere over Tiny Heroes':'Woodland light over Signal Lost'} onChange={e=>setPosition(crossoverPosition(Number(e.target.value)))}/><div className="crossover-presets"><button onClick={()=>setPosition(20)}>Signal atmosphere</button><button onClick={()=>setPosition(50)}>Reset</button><button onClick={()=>setPosition(80)}>Woodland light</button></div><small>Drag, tap or use arrow keys. You can play either game anytime.</small></div>
 </section>
}
