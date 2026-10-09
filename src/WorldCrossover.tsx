import React,{useLayoutEffect,useRef,useState} from 'react';
import {Animal,useTinySound} from './TinyWorld';
import {revealGeometry,clampReveal} from './world-reveal';
import './world-crossover.css';

type Game='tiny'|'signal';
function WorldCard({game,world,onPlay,visual=false}:{game:Game;world:'forest'|'space';onPlay:(game:Game)=>void;visual?:boolean}){
 const tiny=game==='tiny';
 return <article className={`portal-card portal-${game}`}>
  <div className={`portal-art ${tiny?'portal-forest':'portal-console'}`}>
   {tiny?<div className="portal-heroes"><Animal kind={0} happy/><Animal kind={1}/><Animal kind={4} happy/></div>:<><div className="mission-radar" aria-hidden="true"><span>◉</span><i/><i/><b className="signal-wave left-wave">((</b><b className="signal-wave right-wave">))</b></div><span className="transmission">TRANSMISSION UNKNOWN</span></>}
   <div className="world-atmosphere" aria-hidden="true"/>
   {world==='forest'&&!tiny&&<div className="nature-traces" aria-hidden="true"><span>❧</span><span>❧</span></div>}
   {world==='space'&&tiny&&<div className="holographic-traces" aria-hidden="true"><span/><span/></div>}
   <div className="portal-tags"><span>Ages {tiny?'5+':'12+'}</span><span>2–6 players</span></div>
  </div>
  <div className="portal-content"><h2>{tiny?'Tiny Heroes':'Signal Lost'}</h2><p>{tiny?<>Ten adventures. One team.<br/>Little clues. Kind hearts.</>:<>You have part of the truth.<br/>Your crew has the rest.</>}</p>
   {visual?<div className="portal-play">Play <span>→</span></div>:<button className="portal-play" onClick={()=>onPlay(game)} aria-label={`Play ${tiny?'Tiny Heroes':'Signal Lost'}`}>Play <span aria-hidden="true">→</span></button>}
   <small>{tiny?'Family adventure':'Cooperative space mission'}</small>
  </div>
 </article>
}
export function WorldCrossover({onPlay,children,initialPosition=50}:{initialPosition?:number;onPlay:(game:Game)=>void;children?:React.ReactNode}){
 const [position,setPosition]=useState(initialPosition),[geometry,setGeometry]=useState(()=>revealGeometry(1200,850,50,false));
 const scene=useRef<HTMLElement>(null);const sound=useTinySound();
 useLayoutEffect(()=>{const update=()=>{const el=scene.current;if(!el)return;const next=revealGeometry(el.clientWidth,el.clientHeight,position,el.clientWidth<700);setGeometry(next);const cards=el.querySelector<HTMLElement>('.aligned-worlds');if(cards){const outer=el.getBoundingClientRect(),inner=cards.getBoundingClientRect();const x=inner.left-outer.left,y=inner.top-outer.top;const clip=next.mobile?`polygon(0 ${next.y+.22*(el.clientWidth/2-x)-y}px,100% ${next.y+.22*(el.clientWidth/2-x-inner.width)-y}px,100% 100%,0 100%)`:`polygon(${next.x+.26*(el.clientHeight/2-y)-x}px 0,100% 0,100% 100%,${next.x+.26*(el.clientHeight/2-y-inner.height)-x}px 100%)`;cards.style.setProperty('--card-clip',clip)}el.querySelectorAll<HTMLElement>('.quick-join>span,.quick-join button,.forest-layer .portal-play').forEach(node=>{const outer=el.getBoundingClientRect(),r=node.getBoundingClientRect(),x=r.left-outer.left,y=r.top-outer.top;const clip=next.mobile?`polygon(0 ${next.y+.22*(el.clientWidth/2-x)-y}px,100% ${next.y+.22*(el.clientWidth/2-x-r.width)-y}px,100% 100%,0 100%)`:`polygon(${next.x+.26*(el.clientHeight/2-y)-x}px 0,100% 0,100% 100%,${next.x+.26*(el.clientHeight/2-y-r.height)-x}px 100%)`;node.dataset.revealText=node.classList.contains('portal-play')?'PLAY':node.textContent||'';node.style.setProperty('--text-clip',clip)})};update();const ro=new ResizeObserver(update);if(scene.current)ro.observe(scene.current);return()=>ro.disconnect()},[position]);
 const pointer=(e:React.PointerEvent<HTMLElement|SVGPathElement>)=>{const el=scene.current;if(!el)return;const r=el.getBoundingClientRect();setPosition(clampReveal(r.width<700?((e.clientY-r.top)-.22*(r.width/2-(e.clientX-r.left)))/r.height*100:((e.clientX-r.left)-.26*(r.height/2-(e.clientY-r.top)))/r.width*100))};
 const start=(e:React.PointerEvent<HTMLElement|SVGPathElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e)};
 const move=(e:React.PointerEvent<HTMLElement|SVGPathElement>)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))pointer(e)};
 const key=(e:React.KeyboardEvent)=>{const delta=e.key==='ArrowLeft'||e.key==='ArrowUp'?-2:e.key==='ArrowRight'||e.key==='ArrowDown'?2:0;if(delta){e.preventDefault();setPosition(p=>clampReveal(p+delta))}else if(e.key==='Home'||e.key==='End'){e.preventDefault();setPosition(e.key==='Home'?0:100)}else if(e.key==='Escape'){setPosition(50)}};
 const cards=(world:'forest'|'space',visual=false)=><div className="portal-worlds"><WorldCard game="tiny" world={world} visual={visual} onPlay={onPlay}/><WorldCard game="signal" world={world} visual={visual} onPlay={onPlay}/></div>;
 return <section ref={scene} className="world-crossover" data-effects={sound.enabled?'on':'off'} style={{'--space-clip':geometry.clip,'--handle-x':`${geometry.x}px`,'--handle-y':`${geometry.y}px`} as React.CSSProperties}>
  <div className="scene-backdrop forest-backdrop" aria-hidden="true"/><div className="scene-backdrop space-backdrop" aria-hidden="true"/>
  <div className="scene-layout"><div className="portal-topbar"><strong>TOGETHER<span className="brand-exclamation">!</span></strong><span>Small screens. Big teamwork. <em>● Connected</em></span></div>
   <div className="portal-heading"><span className="eyebrow">THE CO-OP GAME NIGHT</span><h1>Different devices.<br/>Same adventure.</h1><p>Pick your world. Invite your people. Win together.</p></div>
   <div className="aligned-worlds">
    <div className="world-layer forest-layer">{cards('forest')}</div>
    <div className="world-layer space-layer" aria-hidden="true" inert>{cards('space',true)}</div>
   </div>
   <div className="portal-invite">{children}</div><div className="portal-footer"><span>No login. Just your team.</span><span>TOGETHER! · Made for shared moments.</span></div>
  </div>
  <svg className="world-boundary" aria-hidden="true"><path d={geometry.path}/><path className="boundary-hit" d={geometry.path} onPointerDown={start} onPointerMove={move}/></svg>
  <div className="world-handle" role="slider" tabIndex={0} aria-label="Reveal the two worlds. Drag or use arrow keys. Escape centers the divider." aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} aria-valuetext={`${position}% Tiny Heroes world, ${100-position}% Signal Lost world`} aria-orientation={geometry.mobile?'vertical':'horizontal'} onKeyDown={key} onPointerDown={start} onPointerMove={move}><svg className="portal-grip" viewBox="0 0 48 48" aria-hidden="true"><path className="grip-arrow" d="M16 18l-6 6 6 6M32 18l6 6-6 6"/><path className="grip-seam" d="M26 13l-4 22"/><circle className="grip-light" cx="24" cy="24" r="2.5"/></svg></div>
 </section>
}
