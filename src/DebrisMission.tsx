import {signalSceneModel,type SignalSceneModel} from './SignalMission';
import {SignalControlTimer} from './SignalControlTimer';
import {useId,useState} from 'react';
import type {Engine} from '../server/engine';
import type {Action} from '../server/modes';
type View=ReturnType<Engine['view']>;
type Props={remaining?:number;view:View;actions:Action;setActions:(a:Action)=>void;connected:boolean;pending:boolean;command:(data:Record<string,unknown>)=>Promise<any>};
export const debrisRoutes=[
 {value:'north',name:'North',path:'M 55 210 C 180 210 200 55 350 65 S 530 110 645 210',x:48,y:18},
 {value:'east',name:'East',path:'M 55 210 C 190 210 205 135 350 145 S 530 170 645 210',x:49,y:38},
 {value:'south',name:'South',path:'M 55 210 C 190 210 205 285 350 275 S 530 250 645 210',x:49,y:62},
 {value:'west',name:'West',path:'M 55 210 C 180 210 200 365 350 355 S 530 310 645 210',x:48,y:82}
] as const;
export function DebrisMission({view,actions,connected,pending,command,remaining}:Props){
 const [moving,setMoving]=useState(true);
 const state=view.signal;if(view.mode!=='signal'||view.round!==1||!state?.board)return null;
 const tasks=view.brief?.tasks||[],canFly=tasks.some(t=>t.key==='navigation'),result=view.phase==='result';
 const disabled=view.phase!=='action'||view.submitted||pending||!connected;
 const plans=state.flightPlans||[],navigationPlans=plans.filter(p=>p.orders.navigation);
 // Every station sees the same published lead proposal, including the Navigator.
 const route=(result?navigationPlans.find(p=>p.locked):navigationPlans[0])?.orders.navigation;
 const activePath=debrisRoutes.find(p=>p.value===route);
 const conflicts=new Set(navigationPlans.map(p=>p.orders.navigation)).size>1;
 const locked=view.players.filter(p=>p.submitted).length;
 async function choose(key:string,value:string){
  if(disabled)return;
  await command({type:'signal-draft',round:view.round,run:state!.run,puzzleId:state!.puzzleId,key,value});
 }
 return <section className="debris-mission" aria-label="Cross the Debris Field mission console" data-phase={view.phase} data-motion={moving?'on':'off'}>
  <SignalControlTimer remaining={remaining??Math.max(0,Math.ceil(((view.deadline||0)-view.serverTime)/1000))} phase={view.phase} connected={connected}/>
  <div className="debris-console-top"><div><span className="eyebrow">FLIGHT DECK / SECTOR 02</span><h3>Cross the Debris Field</h3></div><button type="button" className="secondary" aria-pressed={!moving} onClick={()=>setMoving(!moving)}>{moving?'Effects off':'Effects on'}</button></div>
  <p className="debris-help">Plot a flight path. Compare fuel, clearance and relay readings in Crew Communications before locking. A highlighted route is a proposal, not a safety prediction.</p>
  <SharedDebrisMap model={signalSceneModel(view)!} serverTime={view.serverTime} canFly={canFly} disabled={disabled} onChoose={value=>void choose('navigation',value)}/>
  <div className="debris-map-caption"><span>{canFly?'Tap a corridor on the map.':'Navigator plots the corridor; your console controls are below.'}</span><span className={conflicts?'debris-warning':''}>{conflicts?'Navigator proposals differ':route?`Proposed: ${route.toUpperCase()}`:'Awaiting flight proposal'}</span></div>
  <details className="debris-equipment"><summary>Equipment codes — available to every station</summary><dl>{Object.entries(state.board.controls).map(([key,c])=><div key={key}><dt>{c.title}</dt><dd>{c.options.map(o=>o.label).join(' / ')}</dd></div>)}</dl></details>
  <div className="debris-systems">
   {tasks.filter(t=>t.key!=='navigation').map(task=><fieldset key={task.key} disabled={disabled}><legend>{task.title}</legend><p className="task-hint">{task.hint}</p><div className={`debris-system-visual system-${task.key}`} aria-hidden="true">{task.key==='engineering'?<><span className={actions.engineering==='high'?'boost':''}>▰ ▰ ▰</span><small>THRUSTER BUS</small></>:task.key==='comms'?<><span className={`relay-${actions.comms||'idle'}`}>◉</span><small>RENDEZVOUS ARRAY</small></>:<><span className={actions.shield==='on'?'shield-up':''}>⬡</span><small>HULL PROTECTION</small></>}</div><div className="debris-options">{task.options.map(o=><button type="button" key={o.value} className={actions[task.key]===o.value?'is-selected':''} aria-pressed={actions[task.key]===o.value} onClick={()=>void choose(task.key,o.value)}>{o.label}</button>)}</div></fieldset>)}
  </div>
  <div className="debris-crew-plan" aria-label="Shared flight proposals"><h4>Crew flight proposals</h4><p>Console changes are shared with the crew. Private telemetry stays private until you share it.</p>{plans.map(p=><div key={p.playerId}><strong>{p.name}{p.playerId===view.me?' (you)':''}</strong><span>{Object.entries(p.orders).map(([k,v])=>`${state.board!.controls[k as keyof typeof state.board.controls]?.title}: ${state.board!.controls[k as keyof typeof state.board.controls]?.options.find(o=>o.value===v)?.label||v}`).join(' · ')||'No settings proposed'}</span><em>{p.locked?'Locked':'Planning'}</em></div>)}</div>
  {!result&&<div className="debris-launch"><p role="status">{!connected?'Connection interrupted — controls paused.':view.phase==='briefing'?'Review your telemetry. Flight controls open after briefing.':view.submitted?'Your orders are locked. Waiting for the crew.':view.phase==='locked'?'Crew orders received. Resolving the crossing…':'Changes are free until you lock your orders.'}</p><button type="button" className="primary lock-button" disabled={disabled||!tasks.length||!tasks.every(t=>actions[t.key])} onClick={()=>void command({type:'submit',round:view.round,signalRun:state.run,puzzleId:state.puzzleId,action:actions})}>{view.submitted?'✓ Orders locked':'Lock flight orders'}</button><small>{locked} / {view.players.length} operators locked. Every operator must confirm compatible settings.</small></div>}
  {result&&<p className={view.result?.success?'debris-outcome':'debris-outcome debris-warning'} role="status">{view.result?.success?'Crossing complete — rendezvous confirmed.':activePath?'Crossing unaligned — showing the lead Navigator’s submitted path. Emergency recovery engaged.':'No Navigator flight order received. Emergency recovery engaged.'}</p>}
 </section>;
}

/** The asteroid environment accepts only the public scene DTO and public role permissions. */
export function SharedDebrisMap({model,serverTime,canFly=false,disabled=true,onChoose=()=>{}}:{model:SignalSceneModel;serverTime:number;canFly?:boolean;disabled?:boolean;onChoose?:(route:string)=>void}){
 const uid=useId().replaceAll(':',''),result=model.phase==='result';
 const navigationPlans=model.proposals.filter(p=>p.orders.navigation);
 const route=(result?navigationPlans.find(p=>p.locked):navigationPlans[0])?.orders.navigation;
 const activePath=debrisRoutes.find(p=>p.value===route);
 return <div className="debris-map" data-result={result?(model.success?'success':'failure'):'pending'} aria-label="Interactive holographic flight map">
   <svg viewBox="0 0 700 420" preserveAspectRatio="none" aria-hidden="true">
    <defs><radialGradient id={`${uid}-space`}><stop stopColor="#163442"/><stop offset="1" stopColor="#07121e"/></radialGradient><pattern id={`${uid}-grid`} width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" fill="none" stroke="#67cfdd" strokeOpacity=".07"/></pattern></defs>
    <rect width="700" height="420" fill={`url(#${uid}-space)`}/><rect width="700" height="420" fill={`url(#${uid}-grid)`}/>
    {Array.from({length:38},(_,i)=><circle key={i} cx={(i*113+17)%700} cy={(i*73+29)%420} r={i%3===0?1.4:.7} fill="#a2c7d4" opacity={.2+(i%4)*.1}/>)}
    {[{x:180,y:80,s:20},{x:240,y:218,s:30},{x:460,y:95,s:24},{x:480,y:330,s:35},{x:130,y:330,s:20},{x:560,y:218,s:21},{x:365,y:218,s:22}].map((a,i)=><g key={i} transform={`translate(${a.x} ${a.y}) scale(${a.s/25})`}><path d="M-22-8-8-23 14-18 26 0 12 24-13 19-27 3Z" fill="#273746" stroke="#526575"/><path d="M-8-23 1 0 26 0M1 0-13 19" fill="none" stroke="#354c5b"/><circle className="debris-hazard" r="35" fill="none" stroke="#f0b65a" strokeDasharray="3 10" opacity=".3"/></g>)}
    {debrisRoutes.map(p=><path key={p.value} className={`debris-path ${route===p.value?'is-selected':''}`} data-route={p.value} d={p.path} fill="none"/>)}
    <g transform="translate(645 210)" stroke="#89cdd8" fill="none"><circle r="23"/><circle r="31" strokeOpacity=".3"/><path d="M-32 0H32M0-32V32"/></g>
    {!result&&<g transform="translate(55 210)" fill="#d5e7ed" stroke="#7cabbc"><path d="M19 0-14-10-8 0-14 10Z"/><path d="M-10-4-23 0-10 4" stroke="#adf66b"/></g>}
    {result&&activePath&&<g className={`debris-flight ${model.success?'is-success':'is-failure'}`} style={{offsetPath:`path('${activePath.path}')`,animationDelay:`-${Math.max(0,serverTime-(model.resolvedAt??serverTime))}ms`}}><path d="M16 0-12-8-6 0-12 8Z" fill="#e6f5f8"/><path d="M-8-3-20 0-8 3" fill="#adf66b"/></g>}
   </svg>
   <span className="debris-origin">ENTRY</span><span className="debris-destination">RELAY</span>
   {debrisRoutes.map(p=>{
    const option=model.board.controls.navigation.options.find(o=>o.value===p.value)!;
    return <button type="button" key={p.value} className={`debris-route ${route===p.value?'is-selected':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} disabled={!canFly||disabled} aria-label={`Plot ${p.name} corridor, burn ${option.units}`} aria-pressed={route===p.value} onClick={()=>onChoose(p.value)}><strong>{p.name}</strong><span>Burn {option.units}</span></button>
   })}
  </div>;
}
