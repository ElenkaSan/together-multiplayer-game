import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {expeditionSolutions} from '../server/team-expeditions';
test('real clients synchronize rethink, reject stale agreement, restore after refresh and complete revised plan',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3141',ACTION_MS:'20000',BRIEFING_MS:'40',RESULT_MS:'150'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('No synchronized state'))},5000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 const connect=async()=>{const s=io('http://127.0.0.1:3141',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',()=>reject(Error('Test server exited')))});
  const captain=await connect(),first=await connect();let second=await connect();const created=await command(captain,{type:'create',mode:'tiny',name:'Captain',adventureId:'jungle-adventure'});assert.ok(created.ok);
  assert.ok((await command(first,{type:'join',code:created.code,name:'Hero 1'})).ok);const joined=await command(second,{type:'join',code:created.code,name:'Hero 2'});assert.ok(joined.ok);
  for(const s of [captain,first,second])assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(captain,{type:'start'})).ok);
  const v=await wait(captain,v=>v?.phase==='action'),scope={round:0,attempt:v.adventure.attempt,adventureId:v.adventure.id,run:v.progression.run};
  for(const s of [first,second])assert.ok((await command(s,{type:'share-all-clues',...scope})).ok);
  assert.ok((await command(captain,{type:'submit',...scope,planVersion:0,action:expeditionSolutions['jungle-adventure'][0]})).ok);
  await wait(first,v=>v?.teamPlanVersion===1);assert.ok((await command(first,{type:'submit',...scope,planVersion:1,action:{confirm:'ready'}})).ok);
  assert.equal((await command(captain,{type:'rethink-plan',...scope,planVersion:1})).ok,false);
  assert.ok((await command(second,{type:'rethink-plan',...scope,planVersion:1})).ok);
  for(const s of [captain,first,second]){const reset=await wait(s,v=>v?.teamPlanVersion===2);assert.equal(reset.teamPlan,null);assert.equal(reset.rethinkBy,'Hero 2');assert.ok(reset.players.every((p:any)=>!p.submitted));assert.equal(reset.deadline,v.deadline);assert.equal(reset.adventure.attempt,1);}
  assert.equal((await command(first,{type:'submit',...scope,planVersion:1,action:{confirm:'ready'}})).ok,false);
  second.disconnect();second=await connect();const restored=await command(second,{type:'join',code:created.code,token:joined.token,name:''});assert.ok(restored.ok);assert.equal(restored.state.rethinkBy,'Hero 2');assert.equal(restored.state.teamPlanVersion,2);assert.ok(restored.state.clues.own.every((c:any)=>c.shared));
  assert.ok((await command(captain,{type:'submit',...scope,planVersion:2,action:expeditionSolutions['jungle-adventure'][0]})).ok);
  for(const s of [first,second]){await wait(s,v=>v?.teamPlanVersion===3&&v.teamPlan);assert.ok((await command(s,{type:'submit',...scope,planVersion:3,action:{confirm:'ready'}})).ok);}
  const result=await wait(captain,v=>v?.phase==='result');assert.ok(result.result.success);assert.equal(result.score,1);assert.equal(result.adventure.attempt,1);
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
