import {useState,type CSSProperties} from 'react';
import type {Engine} from '../server/engine';
import type {Action} from '../server/modes';
import type {SignalBoard} from '../server/signal-puzzles';
import {SignalControlTimer} from './SignalControlTimer';

type View=ReturnType<Engine['view']>;
type Proposal={playerId:string;name:string;locked:boolean;orders:Action};
/** Public scene contract. No private brief, telemetry, puzzle facts or solution. */
export type SignalSceneModel={sector:number;phase:string;board:SignalBoard;proposals:Proposal[];score:number;integrity:number;success:boolean|null;resolvedAt:number|null};
export function signalSceneModel(view:View):SignalSceneModel|null{
 const state=view.signal;if(view.mode!=='signal'||!state?.board)return null;
 return{sector:view.round,phase:view.phase,board:state.board,proposals:state.proposals,score:view.score,integrity:view.integrity,success:view.result?.success??null,resolvedAt:state.resolvedAt};
}
export const signalSceneNames=['Wake the Relay','Cross the Debris Field','Power Failure','The Ghost Telemetry','Final Transmission'];
const systemKeys=['navigation','engineering','comms','shield'] as const;
function leadOrders(proposals:Proposal[]){return Object.fromEntries(systemKeys.map(key=>[key,proposals.find(p=>p.orders[key])?.orders[key]||'']))}
function Vessel({x=0,y=0}:{x?:number;y?:number}){return <g transform={`translate(${x} ${y})`}><path d="M22 0-18-13-8 0-18 13Z" fill="#d6f0f3" stroke="#84cad7" strokeWidth="2"/><path d="M-11-5-32 0-11 5" fill="#adf66b"/></g>}
function Stars(){return <g fill="#bddce4">{Array.from({length:32},(_,i)=><circle key={i} cx={(i*113+31)%680+10} cy={(i*71+19)%290+12} r={i%5===0?1.5:.7} opacity={.2+(i%4)*.13}/>)}</g>}
function RelayArt({orders}:{orders:Action}){const angle=['north','east','south','west'].indexOf(orders.navigation)*90;return <>
 <path d="M80 160H540" className="signal-link" style={{stroke:orders.comms==='amber'?'#efbe75':orders.comms==='green'?'#adf66b':'#80d8df'}}/>
 <g transform="translate(280 160)" stroke="#79b9c9" strokeWidth="2"><path d="M-95-45H80V45H-95Z" fill="#183847"/><path d="M-185-65h70V65h-70ZM100-65h70V65h-70Z" fill="#102e40"/>{[-173,-151,-129,112,134,156].map(x=><path key={x} d={`M${x} -63v126`} stroke="#416b80"/>)}<path d="M-180-20h60m-60 40h60m225-40h60m-60 40h60" stroke="#416b80"/><circle r="29" fill="#081822"/><circle r="18" fill={orders.engineering==='high'?'#adf66b':'#467a89'}/><path d="m-81-47 12 18-17 11 22 10" stroke="#efbd72" fill="none"/>
 <g transform={`translate(0 -45) rotate(${angle<0?0:angle})`}><path d="M0 0v-32m-28-16q28 38 56 0M0-32v-23" fill="none"/><circle cy="-56" r="5" fill="#adf66b"/></g></g>
 <g transform="translate(560 160)" fill="none" stroke="#80d8df" strokeWidth="3"><circle r="44"/><path d="M-30 0h60m-30-30v60"/>{[58,75,92].map(r=><path key={r} className="signal-wave" d={`M${-r} ${-r*.6}q${-r*.4} ${r*.6} 0 ${r*1.2}`} style={{animationDelay:`${r/60}s`}}/>)}</g>
 <circle cx="280" cy="160" r="37" fill="none" stroke={orders.shield==='on'?'#adf66b':'#365663'} strokeDasharray={orders.shield==='on'?undefined:'4 8'}/><Vessel x={75} y={160}/>
 </>}
function PowerArt({orders,board}:{orders:Action;board:SignalBoard}){const positions=[[120,75],[580,75],[580,245],[120,245]];return <>
 {positions.map(([x,y],i)=><g key={i}><path className={`signal-energy ${orders[systemKeys[i]]?'energized':''}`} d={`M350 160Q${x} 160 ${x} ${y}`} fill="none"/><rect x={x-60} y={y-30} width="120" height="60" rx="9" fill="#122c3a" stroke="#5c9dac"/>{Array.from({length:Number(orders[systemKeys[i]]||0)},(_,n)=><rect key={n} x={x-38+n*27} y={y-15} width="21" height="30" fill="#adf66b"/>)}<text x={x} y={y+51} textAnchor="middle" fill="#cde5ec" fontSize="16">{['LIFE SUPPORT','ENGINE','TRANSMITTER','STABILIZER'][i]}</text></g>)}
 <circle cx="350" cy="160" r="66" fill="#0b202e" stroke="#80d8df" strokeWidth="3"/><circle className="signal-core" cx="350" cy="160" r="39" fill="#80d8df33" stroke="#adf66b" strokeWidth="5"/><path d="m350 124-19 38h20l-6 36 25-48h-22Z" fill="#adf66b"/>
 <text x="350" y="285" textAnchor="middle" fill="#cde5ec" fontSize="18">{systemKeys.reduce((sum,k)=>sum+Number(orders[k]||0),0)} / {board.budget} cells proposed</text>
 </>}
function RadarArt({orders,board}:{orders:Action;board:SignalBoard}){const source=['blue','amber','green'].indexOf(orders.comms);return <>
 <g transform="translate(350 160)" fill="none" stroke="#488591">{[38,76,114,142].map(r=><circle key={r} r={r}/>)}<path d="M-145 0h290M0-145v290"/><g className="signal-radar-sweep"><path d="M0 0 135-45A142 142 0 0 1 135 45Z" fill="#80d8df1c"/><path d="M0 0h142" stroke="#adf66b" strokeWidth="2"/></g></g>
 {(board.sensors||[]).map((sensor,i)=>{const x=200+i*150,y=i===1?230:95;return <g key={sensor.name} transform={`translate(${x} ${y})`}><circle r={source===i?24:17} fill={source===i?'#adf66b':'#183a4c'} stroke="#80d8df" strokeWidth="2"/><text textAnchor="middle" y="6" fill={source===i?'#102014':'#d7edf2'} fontSize="16">{'ABC'[i]}</text></g>})}
 <g transform="translate(350 160)"><path d="M0-66 10-42H-10Z" fill="#adf66b" transform={`rotate(${Math.max(0,['north','east','south','west'].indexOf(orders.navigation))*90})`}/><circle r="24" fill={orders.engineering==='high'?'#adf66b':'#244858'} stroke="#80d8df"/><circle r="32" fill="none" stroke={orders.shield==='on'?'#efbe75':'#365663'} strokeDasharray="4 5"/></g><path className="signal-interference" d="m40 165 20-20 15 35 20-28 15 16m470 0 20-20 15 35 20-28 15 16" stroke="#d1a76d" strokeWidth="3" fill="none"/>
 </>}
function TransmissionArt({orders,proposals}:{orders:Action;proposals:Proposal[]}){return <>
 <path d={`M130 210Q350 ${orders.navigation==='south'||orders.navigation==='west'?290:70} 610 115`} className="signal-link signal-transmission" style={{stroke:orders.engineering==='high'?'#adf66b':'#80d8df',strokeWidth:orders.engineering==='high'?5:3,strokeDasharray:orders.comms==='amber'?'16 8 4 8':orders.comms==='green'?'4 8 16 8':'8 12'}}/>
 <g transform="translate(160 200)" fill="none" stroke="#80d8df" strokeWidth="3"><path d="M-55 45h110M-30 45 0-15 30 45M-60-75q0 80 110 25M-60-75 15-58 50-50M15-58l18-36"/><circle cx="35" cy="-96" r="7" fill="#adf66b"/></g>
 <Vessel x={330} y={140}/><g transform="translate(245 210)" stroke={orders.shield==='on'?'#efbe75':'#80d8df'} strokeWidth="5"><path d={orders.shield==='on'?'M0-30V30':'M-12-30-12-13M12 13v17'}/></g>
 <g transform="translate(605 110)" fill="none" stroke="#adf66b"><circle r="42"/><circle r="30"/><path d="M-52 0h104M0-52v104"/></g>
 <g transform="translate(380 270)">{proposals.map((p,i)=><rect key={p.playerId} x={i*25-proposals.length*12.5} y="0" width="18" height="12" fill={p.locked?'#adf66b':'#344e5e'} stroke="#7bafbd"/>)}</g>
 <text x="350" y="310" textAnchor="middle" fill="#cde5ec" fontSize="16">{proposals.filter(p=>p.locked).length} / {proposals.length} crew authorizations</text>
 </>}
/** Receives public data only; the same environment is rendered at every station. */
export function SharedSignalScene({model,moving=true,serverTime}:{model:SignalSceneModel;moving?:boolean;serverTime:number}){
 const orders=leadOrders(model.proposals),result=model.phase==='result',elapsed=result?Math.max(0,serverTime-(model.resolvedAt??serverTime)):0;
 return <div className="signal-shared-scene" data-sector={model.sector+1} data-motion={moving?'on':'off'} data-result={result?(model.success?'success':'failure'):'pending'} aria-label={`${signalSceneNames[model.sector]} shared mission environment`}>
 <div className="signal-viewport"><svg data-settings={systemKeys.map(k=>orders[k]||'unset').join(':')} viewBox="0 0 700 330" role="img" aria-label={signalSceneNames[model.sector]}><rect width="700" height="330" fill="#081722"/><Stars/>{model.sector===0?<RelayArt orders={orders}/>:model.sector===2?<PowerArt orders={orders} board={model.board}/>:model.sector===3?<RadarArt orders={orders} board={model.board}/>:<TransmissionArt orders={orders} proposals={model.proposals}/>}{result&&<g className="signal-resolution" style={{animationDelay:`-${elapsed}ms`} as CSSProperties}><circle cx="350" cy="160" r="145" fill="none" stroke={model.success?'#adf66b':'#efb970'} strokeWidth="4"/></g>}</svg></div>
 {model.sector===2&&<p className="signal-scene-caption">Power budget: <strong>{systemKeys.reduce((n,k)=>n+Number(orders[k]||0),0)} / {model.board.budget} cells proposed</strong>. Conflicting station proposals still require agreement.</p>}
 <div className="signal-scene-readings" aria-label="Shared console readings">{systemKeys.map(key=>{const control=model.board.controls[key],values=[...new Set(model.proposals.map(p=>p.orders[key]).filter(Boolean))];return <div key={key} className={values.length>1?'signal-conflict':''}><strong>{control.title}</strong><span>{values.length?values.map(value=>control.options.find(o=>o.value===value)?.label||value).join(' / '):'Awaiting proposal'}</span>{values.length>1&&<small>Proposals differ — agree as a crew</small>}</div>})}</div>
 {model.board.sensors&&<div className="signal-sensor-reports" aria-label="Public sensor reports">{model.board.sensors.map(s=><article key={s.name}><h4>{s.name}</h4><p>{s.navigation} · Reactor {s.engineering}</p><dl><div><dt>Sequence</dt><dd>{s.sequence}</dd></div><div><dt>CRC parity</dt><dd>{s.crc}</dd></div><div><dt>Age</dt><dd>{s.age}s</dd></div></dl></article>)}</div>}
 <p className="signal-scene-caption">{result?(model.success?'Systems aligned — mission resolution shared with every station.':'Systems unaligned — emergency recovery active.'): 'Live crew proposals, not verified settings. Combine private telemetry in Crew Communications.'}</p>
 </div>
}
export function SignalMission({view,actions,remaining,connected,pending,command}:{view:View;actions:Action;remaining:number;connected:boolean;pending:boolean;command:(d:Record<string,unknown>)=>Promise<unknown>}){
 const [moving,setMoving]=useState(true),model=signalSceneModel(view);if(!model||view.round===1)return null;
 const state=view.signal!,tasks=view.brief?.tasks||[],disabled=view.phase!=='action'||view.submitted||!connected||pending;
 const scope={round:view.round,run:state.run,puzzleId:state.puzzleId};
 return <section className="signal-mission panel" aria-label={`${signalSceneNames[view.round]} mission console`}>
 <SignalControlTimer remaining={remaining} phase={view.phase} connected={connected}/>
 <div className="signal-console-heading"><div><span className="eyebrow">SHARED FLIGHT DECK / SECTOR {view.round+1}</span><h3>{signalSceneNames[view.round]}</h3></div><button className="secondary" type="button" aria-pressed={!moving} onClick={()=>setMoving(!moving)}>{moving?'Effects off':'Effects on'}</button></div>
 <SharedSignalScene model={model} moving={moving} serverTime={view.serverTime}/>
 <details className="signal-equipment-guide"><summary>Equipment codes and mission instructions</summary>{model.board.instructions.map(text=><p key={text}>{text}</p>)}<dl>{Object.values(model.board.controls).map(c=><div key={c.title}><dt>{c.title}</dt><dd>{c.options.map(o=>o.label).join(' / ')}</dd></div>)}</dl>{model.board.archive.length>0&&<><h4>Recovered mission archive</h4><ul>{model.board.archive.map(x=><li key={x.sector}>{x.label}: {x.value}{x.recovered?' · emergency recovery':''}</li>)}</ul></>}</details>
 {view.phase!=='result'&&<><div className="signal-station-controls"><h4>Your station · {view.brief?.role}</h4><p>These controls publish proposals. Private readings are shared only using Share with Crew.</p><div className="signal-console-modules">{tasks.map(task=><fieldset key={task.key} disabled={disabled}><legend>{task.title}</legend><p className="task-hint">{task.hint}</p><div className={`signal-module-indicator module-${task.key}`} aria-hidden="true">{view.round===2?<span>{actions[task.key]||'—'} cells</span>:view.round===3?<span>{task.key==='comms'?'◉':task.key==='shield'?'⬡':'⌁'}</span>:<span>{task.key==='comms'?'≋':task.key==='engineering'?'ϟ':'◉'}</span>}</div><div className="signal-module-options">{task.options.map(o=><button key={o.value} type="button" aria-pressed={actions[task.key]===o.value} onClick={()=>void command({type:'signal-draft',...scope,key:task.key,value:o.value})}>{o.label}</button>)}</div></fieldset>)}</div></div>
 <div className="signal-orders"><p role="status">{!connected?'Connection interrupted — controls paused.':view.submitted?'Orders locked. Waiting for the crew.':view.phase==='briefing'?'Review telemetry. Controls open after briefing.':view.phase==='locked'?'Resolving synchronized crew orders…':'Agree on the shared proposals, then lock your station orders.'}</p><button type="button" className="primary lock-button" disabled={disabled||!tasks.length||!tasks.every(t=>actions[t.key])} onClick={()=>void command({type:'submit',round:view.round,signalRun:state.run,puzzleId:state.puzzleId,action:actions})}>{view.submitted?'✓ Orders locked':'Lock station orders'}</button><small>{view.players.filter(p=>p.submitted).length} / {view.players.length} locked</small></div></>}
 <div className="signal-public-proposals" aria-label="Shared station proposals"><h4>Crew proposals</h4>{model.proposals.map(p=><article key={p.playerId}><strong>{p.name}</strong><span>{Object.entries(p.orders).map(([key,value])=>`${model.board.controls[key as keyof typeof model.board.controls].title}: ${model.board.controls[key as keyof typeof model.board.controls].options.find(o=>o.value===value)?.label}`).join(' · ')||'No settings proposed'}</span><small>{p.locked?'Locked':'Planning'}</small></article>)}</div>
 </section>
}
