import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
const wait=(s:Socket,check:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{const timer=setTimeout(()=>{s.off('state',fn);reject(Error('state timeout'))},5000);const fn=(v:any)=>{if(check(v)){clearTimeout(timer);s.off('state',fn);resolve(v)}};s.on('state',fn)});
test('two sockets synchronize wrong answer, same-rescue retry, reconnect, stale rejection and success',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3102',ACTION_MS:'5000',BRIEFING_MS:'50',RESULT_MS:'600'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[];
 try{await new Promise<void>((resolve,reject)=>{child.stdout.on('data',()=>resolve());child.on('error',reject);child.on('exit',code=>reject(Error('server exited '+code)))});
 const connect=async()=>{const s=io('http://127.0.0.1:3102',{forceNew:true,transports:['websocket']});sockets.push(s);await new Promise<void>((resolve,reject)=>{s.once('connect',()=>resolve());s.once('connect_error',reject)});return s};
 let a=await connect();const b=await connect();const created=await command(a,{type:'create',mode:'tiny',adventureId:'forest-rescue',name:'Captain'});await command(b,{type:'join',code:created.code,name:'Hero'});await command(a,{type:'ready'});await command(b,{type:'ready'});const opening=wait(a,v=>v.phase==='action');await command(a,{type:'start'});await opening;
 const failA=wait(a,v=>v.phase==='result'),failB=wait(b,v=>v.phase==='result');await command(a,{type:'submit',round:0,attempt:1,action:{support:'save'}});await command(b,{type:'submit',round:0,attempt:1,action:{tool:'blanket'}});const [fa,fb]=await Promise.all([failA,failB]);assert.deepEqual(fa.result,fb.result);assert.equal(fa.result.retry,true);assert.equal(fa.result.success,false);assert.equal(fa.adventure.completed.length,0);
 const retry=await wait(a,v=>v.phase==='action'&&v.adventure.attempt===2);assert.equal(retry.round,0);assert.equal(retry.adventure.hint,null);assert.equal(fa.result.hint.tool,'rope');assert.equal((await command(a,{type:'submit',round:0,attempt:1,action:{support:'save'}})).ok,false);
 await command(a,{type:'submit',round:0,attempt:2,action:{support:'save'}});a.disconnect();a=await connect();const restored=await command(a,{type:'join',code:created.code,token:created.token,name:''});assert.equal(restored.state.adventure.attempt,2);assert.equal(restored.state.submitted,true);assert.equal(restored.state.adventure.hint,null);
 const winA=wait(a,v=>v.phase==='result'),winB=wait(b,v=>v.phase==='result');await command(b,{type:'submit',round:0,attempt:2,action:{tool:'rope'}});const [wa,wb]=await Promise.all([winA,winB]);assert.deepEqual(wa.result,wb.result);assert.equal(wa.result.success,true);assert.equal(wa.score,1);assert.equal(wa.adventure.hint,null);assert.equal(wa.adventure.completed.length,1);
 }finally{sockets.forEach(s=>s.disconnect());child.kill()}
});

