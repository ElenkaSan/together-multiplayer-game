import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {solveSignal,defaultSignalTimers} from '../server/signal-puzzles';
test('2 and 6 independent clients fly all five sectors: shared proposals, privacy, reconnect, lock and completion',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3146',BRIEFING_MS:'40',RESULT_MS:'200',ACTION_MS:'60000'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('Expected synchronized state'))},6000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 const connect=async()=>{const s=io('http://127.0.0.1:3146',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 try{await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('Server exited')))});
 for(const count of [2,6]){
  const crew:Socket[]=[],tokens:string[]=[];crew.push(await connect());const created=await command(crew[0],{type:'create',mode:'signal',name:'Flight Navigator'});assert.ok(created.ok);tokens.push(created.token);
  for(let i=1;i<count;i++){crew.push(await connect());const joined=await command(crew[i],{type:'join',code:created.code,name:`Crew ${i}`});assert.ok(joined.ok);tokens.push(joined.token);}
  const outsider=await connect(),other=await command(outsider,{type:'create',mode:'signal',name:'Other ship'});assert.ok(other.ok);
  for(const s of crew)assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(crew[0],{type:'start'})).ok);
  let priorScope:any;
  for(let round=0;round<5;round++){
   let views=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='action'&&v.round===round)));const first=views[0],scope={round,run:first.signal.run,puzzleId:first.signal.puzzleId};
   assert.ok(views.every(v=>v.deadline===first.deadline));assert.ok(Math.abs(first.deadline-first.serverTime-defaultSignalTimers[round])<50);
   for(let i=0;i<count;i++){assert.ok(solveSignal(views[i].signal.board,views[i].signal.ownTelemetry).length>1);assert.equal(views[i].signal.communications.length,0);for(const c of views[i].signal.ownTelemetry)assert.ok((await command(crew[i],{type:'share-telemetry',...scope,index:c.index})).ok);}
   const shared=await wait(crew[0],v=>v?.signal?.communications.length===6),solutions=solveSignal(shared.signal.board,shared.signal.communications);assert.equal(solutions.length,1);const solution=solutions[0];
   if(round===1){
    // Both stations publish only the settings they own. No private cards auto-share.
    assert.equal((await command(crew[1],{type:'signal-draft',...scope,key:'navigation',value:'north'})).ok,false);
    assert.equal((await command(outsider,{type:'signal-draft',...scope,key:'navigation',value:'north',code:created.code})).ok,false);
    for(let i=0;i<count;i++)for(const t of views[i].brief.tasks)assert.ok((await command(crew[i],{type:'signal-draft',...scope,key:t.key,value:solution[t.key]})).ok);
    const navId=first.me;const agreed=await Promise.all(crew.map(s=>wait(s,v=>v?.signal?.flightPlans.find((p:any)=>p.playerId===navId)?.orders.navigation===solution.navigation)));assert.ok(agreed.every(v=>JSON.stringify(v.signal.flightPlans)===JSON.stringify(agreed[0].signal.flightPlans)));
    assert.equal(states.get(outsider).signal.flightPlans.length,0);
    const before=states.get(crew[1]);crew[1].disconnect();crew[1]=await connect();const restored=await command(crew[1],{type:'join',code:created.code,token:tokens[1],name:''});assert.ok(restored.ok);assert.deepEqual(restored.state.signal.ownDraft,before.signal.ownDraft);assert.deepEqual(restored.state.signal.communications,before.signal.communications);assert.equal(restored.state.deadline,before.deadline);priorScope=scope;
   }else if(priorScope)assert.equal((await command(crew[0],{type:'signal-draft',...priorScope,key:'navigation',value:'north'})).ok,false);
   views=crew.map(s=>states.get(s));
   for(let i=0;i<count;i++){
    const action=Object.fromEntries(views[i].brief.tasks.map((t:any)=>[t.key,solution[t.key]]));assert.ok((await command(crew[i],{type:'submit',round,signalRun:scope.run,puzzleId:scope.puzzleId,action})).ok);
    if(round===1&&i===0)assert.equal((await command(crew[i],{type:'signal-draft',...scope,key:'navigation',value:solution.navigation})).ok,false);
   }
   const results=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='result'&&v.round===round)));assert.ok(results.every(v=>v.result.success&&v.score===round+1&&v.integrity===3));
   if(round===1)assert.ok(results.every(v=>v.signal.flightPlans.find((p:any)=>p.playerId===first.me).orders.navigation===solution.navigation));
   if(round===1){crew[1].disconnect();crew[1]=await connect();const restore=await command(crew[1],{type:'join',code:created.code,token:tokens[1],name:''});assert.ok(restore.ok);assert.ok(restore.state.round>=1);}
  }
  const final=await wait(crew[0],v=>v?.phase==='finished');assert.equal(final.score,5);assert.equal(final.integrity,3);assert.equal(final.signal.archive.length,4);for(const s of [...crew,outsider])s.disconnect();
 }
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
