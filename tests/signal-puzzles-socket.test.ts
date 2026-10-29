import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {solveSignal,defaultSignalTimers} from '../server/signal-puzzles';
test('2 and 6 real clients solve all five sectors using only selectively shared telemetry, with reconnect and synchronized scoring',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3144',ACTION_MS:'60000',BRIEFING_MS:'40',RESULT_MS:'150'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('No synchronized Signal state'))},5000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 const connect=async()=>{const s=io('http://127.0.0.1:3144',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('Test server exited')))});
  for(const count of [2,6]){
   const crew:Socket[]=[],tokens:string[]=[];crew.push(await connect());const created=await command(crew[0],{type:'create',mode:'signal',name:'Coordinator'});assert.ok(created.ok);tokens.push(created.token);
   for(let i=1;i<count;i++){crew.push(await connect());const j=await command(crew[i],{type:'join',code:created.code,name:`Operator ${i}`});assert.ok(j.ok);tokens.push(j.token);}
   const outsider=await connect(),other=await command(outsider,{type:'create',mode:'signal',name:'Other crew'});assert.ok(other.ok);
   for(const s of crew)assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(crew[0],{type:'start'})).ok);
   let stale:any;
   for(let round=0;round<5;round++){
    const views=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='action'&&v.round===round))),first=views[0],scope={round,run:first.signal.run,puzzleId:first.signal.puzzleId};
    assert.ok(Math.abs(first.deadline-first.serverTime-defaultSignalTimers[round])<50);assert.ok(views.every(v=>v.deadline===first.deadline));assert.ok(views.every(v=>v.signal.communications.length===0));
    for(let i=0;i<count;i++){assert.ok(solveSignal(views[i].signal.board,views[i].signal.ownTelemetry).length>1);for(const c of views[i].signal.ownTelemetry){assert.ok((await command(crew[i],{type:'share-telemetry',...scope,index:c.index,text:'FORGED',code:other.code})).ok);}}
    const all=await wait(crew[0],v=>v?.signal?.communications.length===6);assert.ok(all.signal.communications.every((c:any)=>c.text!=='FORGED'));assert.equal(states.get(outsider).signal.communications.length,0);
    const index=views[0].signal.ownTelemetry[0].index;assert.ok((await command(crew[0],{type:'share-telemetry',...scope,index})).ok);assert.equal(states.get(crew[0]).signal.communications.length,6);assert.equal((await command(outsider,{type:'share-telemetry',...scope,index})).ok,false);
    if(stale)assert.equal((await command(crew[0],{type:'share-telemetry',...stale})).ok,false);stale={...scope,index};
    if(round===2){const before=states.get(crew[1]);crew[1].disconnect();crew[1]=await connect();const restored=await command(crew[1],{type:'join',code:created.code,token:tokens[1],name:''});assert.ok(restored.ok);assert.equal(restored.state.deadline,before.deadline);assert.deepEqual(restored.state.signal.communications,before.signal.communications);assert.ok(restored.state.signal.ownTelemetry.every((c:any)=>c.shared));}
    const solutions=solveSignal(all.signal.board,all.signal.communications);assert.equal(solutions.length,1);
    for(let i=0;i<count;i++){const current=states.get(crew[i]),action=Object.fromEntries(current.brief.tasks.map((t:any)=>[t.key,solutions[0][t.key]]));if(round===1&&i===count-1)action.shield=action.shield==='on'?'off':'on';assert.ok((await command(crew[i],{type:'submit',round,signalRun:scope.run,puzzleId:scope.puzzleId,action})).ok);}
    const results=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='result'&&v.round===round)));assert.ok(results.every(v=>JSON.stringify(v.result)===JSON.stringify(results[0].result)));assert.equal(results[0].result.success,round!==1);
   }
   const finished=await wait(crew[0],v=>v?.phase==='finished');assert.equal(finished.score,4);assert.equal(finished.integrity,2);assert.equal(finished.signal.archive.length,4);assert.ok(finished.signal.archive[1].recovered);
   for(const s of [...crew,outsider])s.disconnect();
  }
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
