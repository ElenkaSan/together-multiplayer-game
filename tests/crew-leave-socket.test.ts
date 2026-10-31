import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {solveSignal} from '../server/signal-puzzles';
const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
test('independent clients: two-player closure, 3/6-player captain handover, balanced clues, fresh plans, reconnect and Signal telemetry',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3145',ACTION_MS:'20000',BRIEFING_MS:'100',RESULT_MS:'1000'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const until=async(s:Socket,check:(v:any)=>boolean)=>{const end=Date.now()+6000;while(Date.now()<end){const v=states.get(s);if(v&&check(v))return v;await new Promise(r=>setTimeout(r,10));}throw Error('state timeout');};
 const connect=async()=>{const s=io('http://127.0.0.1:3145',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((r,j)=>{s.once('connect',()=>r());s.once('connect_error',j)});return s;};
 const crew=async(n:number,mode='tiny')=>{const members:{s:Socket;token:string;id:string}[]=[];let code='';for(let i=0;i<n;i++){const s=await connect();const r=await command(s,i?{type:'join',code,name:`Hero ${i}`}:{type:'create',mode,adventureId:'desert-rescue',name:'Captain'});assert.equal(r.ok,true);states.set(s,r.state);code=r.code;members.push({s,token:r.token,id:r.state.me});}for(const p of members)assert.equal((await command(p.s,{type:'ready'})).ok,true);await command(members[0].s,{type:'start'});await until(members[0].s,v=>v.phase==='action');return {members,code};};
 try{await new Promise<void>((r,j)=>{child.stdout.on('data',()=>r());child.once('error',j);child.once('exit',c=>j(Error('server exited '+c)))});
 for(const mode of ['tiny','signal'])for(const leaving of [0,1]){const {members,code}=await crew(2,mode),other=members[1-leaving];assert.equal((await command(members[leaving].s,{type:'leave'})).ok,true);const ended=await until(other.s,v=>!!v.closed);assert.match(ended.closed,/other player left the game/);assert.equal(ended.deadline,null);assert.equal((await command(other.s,{type:'ready'})).ok,false);assert.equal((await command(other.s,{type:'leave'})).ok,true);const next=await command(other.s,{type:'create',mode,name:'New Captain'});assert.equal(next.ok,true,'closing a room releases the other socket for a new game');await command(other.s,{type:'leave'});const outsider=await connect();assert.equal((await command(outsider,{type:'join',code,token:members[leaving].token,name:''})).ok,false);}
 for(const n of [3,6]){const {members,code}=await crew(n),oldRun=states.get(members[0].s).progression.run;
  await command(members[0].s,{type:'leave'});const remaining=members.slice(1),captain=remaining[0];let v=await until(captain.s,x=>x.players.length===n-1&&x.progression.run>oldRun);assert.match(v.crewNotice.message,/You are now the Team Captain/);assert.equal(v.me,v.host);assert.equal(v.adventure.attempt,1);
  const counts=await Promise.all(remaining.map(async p=>(await until(p.s,x=>x.progression.run===v.progression.run)).clues.own.length));assert.ok(Math.max(...counts)-Math.min(...counts)<=1);assert.equal(counts.reduce((a,b)=>a+b),6);
  const hero=remaining.at(-1)!;hero.s.disconnect();hero.s=await connect();const restored=await command(hero.s,{type:'join',code,token:hero.token,name:''});assert.equal(restored.ok,true);states.set(hero.s,restored.state);assert.equal(restored.state.players.length,n-1);assert.equal(restored.state.clues.own.length,counts.at(-1));
  const scope={round:0,attempt:1,adventureId:'desert-rescue',run:v.progression.run};assert.equal((await command(hero.s,{type:'share-all-clues',...scope,run:oldRun})).ok,false);
  for(const p of remaining.slice(1))assert.equal((await command(p.s,{type:'share-all-clues',...scope})).ok,true);
  v=await until(captain.s,x=>x.phase==='action'&&x.clues.allShared);assert.equal((await command(captain.s,{type:'submit',...scope,planVersion:v.teamPlanVersion,action:{drink:'compass',cover:'water',guide:'shade'}})).ok,true);
  for(const p of remaining.slice(1)){const plan=await until(p.s,x=>!!x.teamPlan);assert.equal((await command(p.s,{type:'submit',...scope,planVersion:plan.teamPlanVersion,action:{confirm:'ready'}})).ok,true);}
  v=await until(captain.s,x=>x.phase==='result');assert.equal(v.result.success,true);assert.equal(v.score,1);
  if(n===3){await command(hero.s,{type:'leave'});assert.match((await until(captain.s,x=>!!x.closed)).closed,/other player left/);}
 }
 const {members}=await crew(6,'signal');await command(members[0].s,{type:'leave'});const remaining=members.slice(1),lead=remaining[0];let v=await until(lead.s,x=>x.players.length===5&&x.phase==='action');assert.match(v.crewNotice.message,/lead Navigator/);
 for(const p of remaining){const own=await until(p.s,x=>x.signal.run===v.signal.run);for(const card of own.signal.ownTelemetry)assert.equal((await command(p.s,{type:'share-telemetry',round:0,run:own.signal.run,puzzleId:own.signal.puzzleId,index:card.index})).ok,true);}
 v=await until(lead.s,x=>x.signal.communications.length===6);const solutions=solveSignal(v.signal.board,v.signal.communications);assert.equal(solutions.length,1);
 for(const p of remaining){const own=states.get(p.s),action=Object.fromEntries(own.brief.tasks.map((t:any)=>[t.key,solutions[0][t.key as keyof typeof solutions[0]]]));assert.equal((await command(p.s,{type:'submit',round:0,signalRun:own.signal.run,puzzleId:own.signal.puzzleId,action})).ok,true);}
 v=await until(lead.s,x=>x.phase==='result');assert.equal(v.result.success,true);assert.equal(v.score,1);
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
