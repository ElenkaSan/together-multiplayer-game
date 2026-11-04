import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {solveSignal} from '../server/signal-puzzles';
import {signalSceneModel} from '../src/SignalMission';
// Network integration, not browser or physical-device verification.
test('2 and 6 independent Socket.IO clients synchronize every visual sector and finish 5/5',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3151',BRIEFING_MS:'50',RESULT_MS:'400',ACTION_MS:'60000'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,d:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',d,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('Visual state timeout'))},7000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 const connect=async()=>{const s=io('http://127.0.0.1:3151',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('Test server stopped')))});
  for(const count of [2,6]){
   const crew=[await connect()],tokens:string[]=[];const created=await command(crew[0],{type:'create',mode:'signal',name:'Navigator'});assert.ok(created.ok);tokens.push(created.token);
   for(let i=1;i<count;i++){crew.push(await connect());const j=await command(crew[i],{type:'join',code:created.code,name:i===1?'Engineer':`Station ${i}`});assert.ok(j.ok);tokens.push(j.token)}
   const outsider=await connect();assert.ok((await command(outsider,{type:'create',mode:'signal',name:'Other room'})).ok);
   for(const s of crew)assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(crew[0],{type:'start'})).ok);
   for(let round=0;round<5;round++){
    const views=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='action'&&v.round===round))),base=views[0],scope={round,run:base.signal.run,puzzleId:base.signal.puzzleId};
    for(const v of views){assert.deepEqual(signalSceneModel(v),signalSceneModel(base));assert.equal(v.deadline,base.deadline);assert.equal(v.signal.communications.length,0);assert.ok(solveSignal(v.signal.board,v.signal.ownTelemetry).length>1)}
    // One selected card is delivered; the remaining private cards are still absent.
    const first=views[0].signal.ownTelemetry[0];assert.ok((await command(crew[0],{type:'share-telemetry',...scope,index:first.index,text:'FORGED'})).ok);
    const one=await wait(crew[1],v=>v?.signal?.communications.length===1);assert.equal(one.signal.communications[0].text,first.text);assert.equal(states.get(outsider).signal.communications.length,0);
    for(let i=0;i<count;i++)for(const c of views[i].signal.ownTelemetry)if(!(i===0&&c.index===first.index))assert.ok((await command(crew[i],{type:'share-telemetry',...scope,index:c.index})).ok);
    const shared=await wait(crew[0],v=>v?.signal?.communications.length===6),solutions=solveSignal(shared.signal.board,shared.signal.communications);assert.equal(solutions.length,1);
    for(let i=0;i<count;i++)for(const t of views[i].brief.tasks)assert.ok((await command(crew[i],{type:'signal-draft',...scope,key:t.key,value:solutions[0][t.key]})).ok);
    const expected=views.reduce((n,v)=>n+v.brief.tasks.length,0);
    const proposed=await Promise.all(crew.map(s=>wait(s,v=>v?.round===round&&v?.signal?.proposals.reduce((n:number,p:any)=>n+Object.keys(p.orders).length,0)===expected)));
    for(const v of proposed)assert.deepEqual(signalSceneModel(v),signalSceneModel(proposed[0]));assert.equal(states.get(outsider).signal.proposals.length,0);
    const before=states.get(crew[1]);crew[1].disconnect();crew[1]=await connect();const restored=await command(crew[1],{type:'join',code:created.code,token:tokens[1],name:''});assert.ok(restored.ok);assert.deepEqual(signalSceneModel(restored.state),signalSceneModel(before));assert.deepEqual(restored.state.signal.ownTelemetry,before.signal.ownTelemetry);assert.equal(restored.state.deadline,before.deadline);
    for(let i=0;i<count;i++){const current=states.get(crew[i]);assert.ok((await command(crew[i],{type:'submit',round,signalRun:scope.run,puzzleId:scope.puzzleId,action:current.signal.ownDraft})).ok)}
    const result=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='result'&&v.round===round)));
    for(const v of result){assert.deepEqual(signalSceneModel(v),signalSceneModel(result[0]));assert.equal(v.score,round+1);assert.equal(v.integrity,3);assert.equal(v.result.success,true);assert.ok(v.signal.resolvedAt)}
    assert.equal((await command(outsider,{type:'signal-draft',...scope,key:'navigation',value:solutions[0].navigation,code:created.code})).ok,false);
   }
   const final=await Promise.all(crew.map(s=>wait(s,v=>v?.phase==='finished')));for(const v of final){assert.equal(v.score,5);assert.equal(v.integrity,3);assert.equal(v.signal.archive.length,4)}
   console.log(`${count} Socket.IO clients: all five shared scenes, selective privacy, reconnect in every sector, final 5/5 with integrity 3/3`);
   for(const s of [...crew,outsider])s.disconnect();
  }
 }finally{sockets.forEach(s=>s.disconnect());child.kill()}
});
