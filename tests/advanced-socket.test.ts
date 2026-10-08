import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {desertSolutions,oceanPlans} from '../server/advanced-evidence';
import {stationFields} from '../shared/advanced-adventures';
import type {Action} from '../server/modes';
test('Desert and Ocean independent network clients at 2, 3 and 6 seats: all missions, retries, Assist, reconnect and replay',async(t)=>{
 const server=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3107',ACTION_MS:'12000',BRIEFING_MS:'80',RESULT_MS:'600'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error(`Timed out at ${JSON.stringify(states.get(s)?.phase)} round ${states.get(s)?.round}`))},16000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 try{
  await new Promise<void>((resolve,reject)=>{server.stdout.once('data',()=>resolve());server.once('error',reject);server.once('exit',c=>reject(Error(`Server exited ${c}`)))});
  const connect=async()=>{const s=io('http://127.0.0.1:3107',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
  await Promise.all([2,3,6].map(n=>t.test(`${n} independent clients`,async()=>{
   const clients=await Promise.all(Array.from({length:n},connect)),tokens:string[]=[];
   const created=await command(clients[0],{type:'create',mode:'tiny',name:'Captain',adventureId:'desert-rescue'});assert.ok(created.ok);tokens.push(created.token);
   for(let i=1;i<n;i++){const joined=await command(clients[i],{type:'join',code:created.code,name:'Hero '+i});assert.ok(joined.ok);tokens.push(joined.token)}
   for(const id of ['desert-rescue','ocean-adventure']){
    if(id==='ocean-adventure')assert.ok((await command(clients[0],{type:'adventure',adventureId:id})).ok);
    for(const client of clients)assert.ok((await command(client,{type:'ready'})).ok);assert.ok((await command(clients[0],{type:'start'})).ok);
    for(let round=0;round<5;round++){
     const attempts=round<2?2:1;
     for(let attempt=1;attempt<=attempts;attempt++){
      const views=await Promise.all(clients.map(s=>wait(s,v=>v?.adventure.id===id&&v.round===round&&v.phase==='action'&&v.adventure.attempt===attempt)));
      assert.equal(new Set(views.map(v=>v.deadline)).size,1);assert.equal(new Set(views.flatMap(v=>v.brief.observations.map((o:any)=>o.text))).size,6);
      const valid=id==='desert-rescue'?desertSolutions[round]:oceanPlans[round][0];
      const wrong=round===1||round===0&&attempt===1;
      const plan:Action=wrong?{...valid,[id==='desert-rescue'?round===0?'drink':'landmark':'route']:id==='desert-rescue'?round===0?'shell':'shimmer':round===0?'surf':'roots'}:valid;
      const submit=(client:Socket,v:any,action:Action)=>command(client,{type:'submit',round,attempt,adventureId:id,run:v.progression.run,action});
      if(id==='desert-rescue'){
       assert.ok((await submit(clients[0],views[0],plan)).ok);await Promise.all(clients.slice(1).map(s=>wait(s,v=>v?.teamPlan&&Object.entries(plan).every(([k,x])=>v.teamPlan[k]===x))));
      }else{
       assert.equal((await submit(clients[0],views[0],{launch:'launch'})).ok,false);
       for(let slot=0;slot<n;slot++)for(const f of stationFields(round,slot,n)){
        const v=states.get(clients[slot]);const response=await command(clients[slot],{type:'station',round,attempt,adventureId:id,run:v.progression.run,version:v.ocean.version,key:f.key,value:plan[f.key]});assert.ok(response.ok,response.error);await Promise.all(clients.map(s=>wait(s,current=>current?.ocean?.settings[f.key]===plan[f.key])));
       }
      }
      if(round===2||round===0&&attempt===2){
       const slot=n-1,old=states.get(clients[slot]);clients[slot].disconnect();clients[slot]=await connect();const restored=await command(clients[slot],{type:'join',code:created.code,token:tokens[slot],name:''});assert.ok(restored.ok);assert.equal(restored.state.me,old.me);assert.equal(restored.state.deadline,old.deadline);assert.equal(restored.state.adventure.attempt,attempt);if(id==='ocean-adventure'){assert.deepEqual(restored.state.ocean.settings,old.ocean.settings);assert.deepEqual(restored.state.ocean.ownKeys,old.ocean.ownKeys)}else assert.deepEqual(restored.state.teamPlan,plan);
      }
      if(id==='desert-rescue'){for(let slot=1;slot<n;slot++)assert.ok((await submit(clients[slot],states.get(clients[slot]),{confirm:'ready'})).ok)}else{
       for(let slot=0;slot<n;slot++){const v=states.get(clients[slot]),res=await command(clients[slot],{type:'station',round,attempt,adventureId:id,run:v.progression.run,version:v.ocean.version,ready:true});assert.ok(res.ok,res.error)}
       const agreed=await wait(clients[0],v=>v?.ocean?.stations.every((s:any)=>s.ready&&s.connected));const launched=await command(clients[0],{type:'submit',round,attempt,adventureId:id,run:agreed.progression.run,stationVersion:agreed.ocean.version,action:{launch:'launch'}});assert.ok(launched.ok,launched.error);
      }
      const results=await Promise.all(clients.map(s=>wait(s,v=>v?.round===round&&v.phase==='result'&&v.adventure.attempt===attempt)));assert.ok(results.every(v=>JSON.stringify(v.result)===JSON.stringify(results[0].result)));assert.equal(results[0].result.success,!wrong);assert.equal(results[0].result.assisted,round===1&&attempt===2);if(round===0&&attempt===1)assert.equal(results[0].adventure.completed.length,0);
     }
    }
    const finished=await Promise.all(clients.map(s=>wait(s,v=>v?.phase==='finished'&&v.adventure.id===id)));assert.ok(finished.every(v=>v.score===4&&v.adventure.completed.length===5&&v.progression.results[id].assists===1));assert.equal(finished[0].progression.available.length,10);
   }
   assert.ok((await command(clients[0],{type:'adventure-map'})).ok);await Promise.all(clients.map(s=>wait(s,v=>v?.progression.mapOpen)));assert.ok((await command(clients[0],{type:'replay'})).ok);const replay=await wait(clients[0],v=>v?.phase==='lobby');assert.equal(replay.adventure.completed.length,0);assert.equal(replay.ocean,null);assert.equal(replay.progression.results['ocean-adventure'].badges,4);
  })));
 }finally{sockets.forEach(s=>s.disconnect());server.kill()}
});
