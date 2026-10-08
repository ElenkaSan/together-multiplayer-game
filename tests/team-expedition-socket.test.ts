import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {expeditionSolutions} from '../server/team-expeditions';
test('two independent Socket.IO clients play Jungle then Treasure with retry, Ready synchronization and reconnect',async()=>{
 const processServer=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3106',ACTION_MS:'5000',BRIEFING_MS:'40',RESULT_MS:'180'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('Timed out awaiting synchronized state'))},7000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 try{
  await new Promise<void>((resolve,reject)=>{processServer.stdout.once('data',()=>resolve());processServer.once('error',reject);processServer.once('exit',c=>reject(Error(`Server exited ${c}`)))});
  const connect=async()=>{const s=io('http://127.0.0.1:3106',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
  const captain=await connect();let hero=await connect();const created=await command(captain,{type:'create',mode:'tiny',name:'Captain',adventureId:'jungle-adventure'}),joined=await command(hero,{type:'join',name:'Hero',code:created.code});assert.ok(created.ok&&joined.ok);
  for(const id of ['jungle-adventure','treasure-island']){
   if(id==='treasure-island')assert.ok((await command(captain,{type:'adventure',adventureId:id})).ok);
   assert.ok((await command(captain,{type:'ready'})).ok);assert.ok((await command(hero,{type:'ready'})).ok);assert.ok((await command(captain,{type:'start'})).ok);
   for(let round=0;round<5;round++){
    let vc=await wait(captain,v=>v?.phase==='action'&&v.adventure.id===id&&v.round===round),vh=await wait(hero,v=>v?.phase==='action'&&v.adventure.id===id&&v.round===round);
    assert.equal(vc.deadline,vh.deadline);assert.notDeepEqual(vc.brief.observations,vh.brief.observations);
    const submit=(s:Socket,v:any,action:object)=>command(s,{type:'submit',round,attempt:v.adventure.attempt,adventureId:id,run:v.progression.run,action});
    if(round===0){const wrong={...expeditionSolutions[id][0],route:id==='jungle-adventure'?'marsh':'surf'};assert.ok((await submit(captain,vc,wrong)).ok);await wait(hero,v=>v?.teamPlan?.route===wrong.route);assert.ok((await submit(hero,vh,{confirm:'ready'})).ok);const failed=await wait(hero,v=>v?.phase==='result'&&v.round===0&&v.result.retry);assert.equal(failed.adventure.completed.length,0);hero.disconnect();hero=await connect();const restored=await command(hero,{type:'join',code:created.code,token:joined.token,name:''});assert.ok(restored.ok);vc=await wait(captain,v=>v?.phase==='action'&&v.adventure.attempt===2);vh=await wait(hero,v=>v?.phase==='action'&&v.adventure.attempt===2)}
    const plan=expeditionSolutions[id][round];assert.ok((await submit(captain,vc,plan)).ok);const proposed=await wait(hero,v=>v?.teamPlan&&Object.entries(plan).every(([k,x])=>v.teamPlan[k]===x));assert.equal(proposed.players.filter((p:any)=>p.submitted).length,1);
    if(round===2){hero.disconnect();hero=await connect();const restored=await command(hero,{type:'join',code:created.code,token:joined.token,name:''});assert.ok(restored.ok);assert.deepEqual(restored.state.teamPlan,plan);assert.equal(restored.state.deadline,vc.deadline);vh=restored.state}
    assert.ok((await submit(hero,vh,{confirm:'ready'})).ok);const [a,b]=await Promise.all([wait(captain,v=>v?.phase==='result'&&v.round===round&&v.result.success),wait(hero,v=>v?.phase==='result'&&v.round===round&&v.result.success)]);assert.deepEqual(a.result,b.result);assert.equal(a.adventure.completed.length,round+1);
   }
   const finished=await wait(hero,v=>v?.phase==='finished');assert.equal(finished.score,5);assert.equal(finished.adventure.completed.length,5);assert.equal(finished.progression.available.length,8);
  }
  assert.ok((await command(captain,{type:'adventure-map'})).ok);const map=await wait(hero,v=>v?.progression.mapOpen);assert.equal(map.progression.results['treasure-island'].badges,5);assert.equal(map.progression.completed.length,2);
 }finally{sockets.forEach(s=>s.disconnect());processServer.kill()}
});
