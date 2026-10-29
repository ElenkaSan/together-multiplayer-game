import {solveSignal} from '../server/signal-puzzles';
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
const waitFor=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{const timer=setTimeout(()=>{s.off('state',fn);reject(Error('state timeout'))},5000);const fn=(v:any)=>{if(predicate(v)){clearTimeout(timer);s.off('state',fn);resolve(v)}};s.on('state',fn)});
test('two independent real Socket.IO clients: both missions, privacy, reconnect and synchronized results',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3101',ACTION_MS:'3000',BRIEFING_MS:'30',RESULT_MS:'30'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[];try{await new Promise<void>((resolve,reject)=>{child.stdout.on('data',()=>resolve());child.on('error',reject);child.on('exit',code=>reject(Error(`server exited ${code}`)))});
 const connect=async()=>{const s=io('http://127.0.0.1:3101',{forceNew:true,transports:['websocket']});sockets.push(s);await new Promise<void>((resolve,reject)=>{s.once('connect',()=>resolve());s.once('connect_error',reject)});return s};
 for(const mode of ['tiny','signal']){let a=await connect();const b=await connect();let va:any,vb:any;a.on('state',v=>va=v);b.on('state',v=>vb=v);const created=await command(a,{type:'create',mode,name:'Captain'});assert.equal(created.ok,true);const joined=await command(b,{type:'join',code:created.code,name:'Helper'});assert.equal(joined.ok,true);va=created.state;vb=joined.state;await command(a,{type:'ready'});await command(b,{type:'ready'});const opening=waitFor(a,v=>v.phase==='action');await command(a,{type:'start'});await opening;
 for(let round=0;round<5;round++){
  if(round>0&&va.phase!=='action')await waitFor(a,v=>v.phase==='action'&&v.round===round);
  if(vb?.phase!=='action'||vb.round!==round)await waitFor(b,v=>v.phase==='action'&&v.round===round);
  const select=(v:any)=>{if(mode==='signal'){const solutions=solveSignal(va.signal.board,[...va.signal.ownTelemetry,...vb.signal.ownTelemetry]);assert.equal(solutions.length,1);return Object.fromEntries(v.brief.tasks.map((t:any)=>[t.key,solutions[0][t.key]]))}return Object.fromEntries(v.brief.tasks.map((t:any)=>[t.key,t.key==='tool'?['rope','ladder','lamp','blanket','boat'][round]:t.options[0].value]))};
  const scope=(v:any)=>mode==='signal'?{signalRun:v.signal.run,puzzleId:v.signal.puzzleId}:{};

  assert.equal('power' in va.mission,false);assert.equal('token' in vb.players[0],false);
  const first=await command(a,{type:'submit',round,...scope(va),action:select(va)});assert.equal(first.ok,true);
  if(round===0){a.disconnect();a=await connect();a.on('state',v=>va=v);const restore=await command(a,{type:'join',code:created.code,token:created.token,name:''});assert.equal(restore.ok,true);assert.equal(restore.state.submitted,true);assert.equal(restore.state.me,created.state.me);va=restore.state}
  const resultA=waitFor(a,v=>v.phase==='result'&&v.round===round),resultB=waitFor(b,v=>v.phase==='result'&&v.round===round);assert.equal((await command(b,{type:'submit',round,...scope(vb),action:select(vb)})).ok,true);const [ra,rb]=await Promise.all([resultA,resultB]);assert.deepEqual(ra.result,rb.result);assert.equal(ra.result.success,true);
 }
 const final=await waitFor(a,v=>v.phase==='finished');assert.equal(final.score,5);await command(a,{type:'leave'});await command(b,{type:'leave'});a.disconnect();b.disconnect();
 }
 }finally{sockets.forEach(s=>s.disconnect());child.kill()}
});

