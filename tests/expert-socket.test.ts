import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {magicPlans,moonPlans} from './expert-fixtures';
import type {Action} from '../server/modes';
test('Magic and Moon independent clients: all seats, all Moon equipment kits, reconnect, retries, Assist and complete missions',async(t)=>{
 const server=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3108',ACTION_MS:'20000',BRIEFING_MS:'60',RESULT_MS:'800'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error(`Timed out ${states.get(s)?.phase} round ${states.get(s)?.round}`))},22000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 try{await new Promise<void>((resolve,reject)=>{server.stdout.once('data',()=>resolve());server.once('error',reject);server.once('exit',c=>reject(Error(`Server exited ${c}`)))});
 const connect=async()=>{const s=io('http://127.0.0.1:3108',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 // Rooms run concurrently; each client has its own connection and reconnect token.
 await Promise.all([2,3,4,5,6].map(n=>t.test(`${n} devices`,async()=>{
  const clients=await Promise.all(Array.from({length:n},connect)),tokens:string[]=[];const created=await command(clients[0],{type:'create',mode:'tiny',name:'Captain',adventureId:'magic-kingdom'});assert.ok(created.ok);tokens.push(created.token);for(let i=1;i<n;i++){const joined=await command(clients[i],{type:'join',code:created.code,name:'Explorer '+i});assert.ok(joined.ok);tokens.push(joined.token)}
  const runs=[{id:'magic-kingdom',plans:magicPlans,perfect:false},...((n===2?['grip','scanner']:['grip']).flatMap(mobility=>(n===2?['battery','solar']:['solar']).map(supply=>({id:'moon-mission',plans:moonPlans(mobility,supply),perfect:n===2}))))];
  for(let run=0;run<runs.length;run++){const {id,plans,perfect}=runs[run];if(run)assert.ok((await command(clients[0],{type:'adventure',adventureId:id})).ok);for(const s of clients)assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(clients[0],{type:'start'})).ok);
   for(let round=0;round<5;round++)for(let attempt=1;attempt<=(!perfect&&round<2?2:1);attempt++){
    const views=await Promise.all(clients.map(s=>wait(s,v=>v?.adventure.id===id&&v.round===round&&v.phase==='action'&&v.adventure.attempt===attempt)));assert.equal(new Set(views.map(v=>v.deadline)).size,1);assert.ok(views.every(v=>v.expert.ownKeys.length));assert.equal(new Set(views.flatMap(v=>v.expert.ownKeys)).size,6);
    const wrong=!perfect&&(round===1||round===0&&attempt===1),plan:Action=wrong?{...plans[round],[id==='magic-kingdom'?round===0?'seal':'gate':round===0?'hatch':'pace']:id==='magic-kingdom'?round===0?'round':'cloud':round===0?'open':'fast'}:plans[round];
    if(round===0&&attempt===1)assert.equal((await command(clients[0],{type:'submit',round,attempt,adventureId:id,run:views[0].progression.run,stationVersion:views[0].expert.version,action:{launch:'launch'}})).ok,false);
    for(let slot=0;slot<n;slot++)for(const key of views[slot].expert.ownKeys){const v=states.get(clients[slot]),res=await command(clients[slot],{type:'mechanism',round,attempt,adventureId:id,run:v.progression.run,version:v.expert.version,key,value:plan[key]});assert.ok(res.ok,res.error);await Promise.all(clients.map(s=>wait(s,v=>v?.expert?.settings[key]===plan[key])))}
    if(round===2||round===0&&attempt===2){const slot=n-1,old=states.get(clients[slot]);clients[slot].disconnect();clients[slot]=await connect();const restored=await command(clients[slot],{type:'join',code:created.code,token:tokens[slot],name:''});assert.ok(restored.ok);assert.equal(restored.state.me,old.me);assert.equal(restored.state.deadline,old.deadline);assert.deepEqual(restored.state.expert.settings,old.expert.settings);assert.deepEqual(restored.state.expert.board,old.expert.board);assert.deepEqual(restored.state.expert.ownKeys,old.expert.ownKeys)}
    for(const s of clients){const v=states.get(s),res=await command(s,{type:'mechanism',round,attempt,adventureId:id,run:v.progression.run,version:v.expert.version,ready:true});assert.ok(res.ok,res.error)}const agreed=await wait(clients[0],v=>v?.expert?.explorers.every((x:any)=>x.ready&&x.connected));const launched=await command(clients[0],{type:'submit',round,attempt,adventureId:id,run:agreed.progression.run,stationVersion:agreed.expert.version,action:{launch:'launch'}});assert.ok(launched.ok,launched.error);
    const results=await Promise.all(clients.map(s=>wait(s,v=>v?.round===round&&v.phase==='result'&&v.adventure.attempt===attempt)));assert.ok(results.every(v=>JSON.stringify(v.result)===JSON.stringify(results[0].result)));assert.equal(results[0].result.success,!wrong);assert.equal(results[0].result.assisted,!perfect&&round===1&&attempt===2);assert.equal(results[0].expert.board.objectives.length,wrong&&attempt===1?round:round+1);
   }
   const finished=await Promise.all(clients.map(s=>wait(s,v=>v?.phase==='finished'&&v.adventure.id===id)));assert.ok(finished.every(v=>v.score===(perfect?5:4)&&v.adventure.completed.length===5&&v.expert.board.objectives.length===5));if(id==='moon-mission'){assert.equal(finished[0].expert.board.mobility,plans[0].mobility);assert.equal(finished[0].expert.board.supply,plans[0].supply);assert.equal(finished[0].expert.board.connection,'restored')}
  }
  assert.ok((await command(clients[0],{type:'replay'})).ok);const replay=await wait(clients[0],v=>v?.phase==='lobby');assert.equal(replay.expert,null);assert.equal(replay.adventure.completed.length,0);
 })));
 }finally{sockets.forEach(s=>s.disconnect());server.kill()}
});
