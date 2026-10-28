import {TinyIcon} from './TinyIcon';
type Props={invite?:boolean;tiny?:boolean;expedition?:boolean;name:string;code:string;pending:boolean;connected:boolean;createLabel:string;onName:(name:string)=>void;onCode:(code:string)=>void;onEnter:(type:'join'|'create')=>void;onChooseGame?:()=>void};
export function RoomEntry({invite=false,tiny=false,expedition=false,name,code,pending,connected,createLabel,onName,onCode,onEnter,onChooseGame}:Props){
 const create=<button className={invite?'secondary':'primary'} type="button" disabled={pending||(!invite&&(!connected||!name.trim()))} onClick={()=>invite?onChooseGame?.():onEnter('create')}>{createLabel}</button>;
 return <form className={`panel ${tiny||invite?'lobby-entry':''}`} onSubmit={e=>{e.preventDefault();onEnter(invite||code?'join':'create')}}>
  {(tiny||invite)&&<div className="entry-heading"><TinyIcon name="map"/><div><h2>{invite?'Join your team':expedition?'Join the expedition':'Join the rescue'}</h2><span>2–6 players · Your own device</span></div></div>}
  <label htmlFor="name">Your name</label><input id="name" required maxLength={24} autoComplete="nickname" autoFocus={invite} placeholder="What should your team call you?" value={name} onChange={e=>onName(e.target.value)}/>
  {!invite&&<>{create}<div className="divider">or join your team</div></>}
  <label htmlFor="code">Room code</label><input id="code" maxLength={6} placeholder="ABC234" value={code} onChange={e=>onCode(e.target.value.toUpperCase())}/>
  <button className={invite?'primary':'secondary'} type="submit" disabled={pending||!connected||!name.trim()||code.length!==6}>Join room</button>
  <small>The invite decides the game mode. No account needed.</small>
  {invite&&<><div className="divider">or start a new team</div>{create}</>}
 </form>;
}
