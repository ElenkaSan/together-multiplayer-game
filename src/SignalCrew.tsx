import type {Engine} from '../server/engine';
type View=ReturnType<Engine['view']>;
export function SignalCrew({view,connected,pending,command}:{view:View;connected:boolean;pending:boolean;command:(d:Record<string,unknown>)=>Promise<unknown>}){
 const state=view.signal;if(!state?.board)return null;
 return <>
 <section className="panel signal-communications" aria-label="Crew Communications"><h3>Crew Communications</h3><p>Choose which telemetry to send. Only shared cards are visible to the crew.</p><h4>Your private telemetry</h4><ul className="signal-telemetry-cards">{state.ownTelemetry.map(c=><li key={c.index}><p>{c.text}</p><button className="secondary" disabled={c.shared||pending||!connected||!['briefing','action'].includes(view.phase)} onClick={()=>void command({type:'share-telemetry',round:view.round,run:state.run,puzzleId:state.puzzleId,index:c.index})}>{c.shared?'✓ Delivered to crew':'Share with Crew'}</button></li>)}</ul><h4>Shared crew log</h4><div aria-live="polite" aria-relevant="additions"><ul className="signal-crew-log">{state.communications.map(c=><li key={`${c.playerId}:${c.index}`}><strong>{c.name}{c.playerId===view.me?' (you)':''}</strong><p>{c.text}</p></li>)}</ul>{!state.communications.length&&<p>No telemetry shared yet.</p>}</div></section></>;
}
