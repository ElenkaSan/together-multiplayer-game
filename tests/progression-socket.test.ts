import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';

test('two independent clients share Forest unlock, map, Ice transition, retry and reconnect',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3103',ACTION_MS:'3000',BRIEFING_MS:'30',RESULT_MS:'160'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[];
 const states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,fn:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{
  if(fn(states.get(s)))return resolve(states.get(s));
  const timeout=setTimeout(()=>{s.off('state',onState);reject(Error('state timeout'))},6000);
  const onState=(v:any)=>{if(fn(v)){clearTimeout(timeout);s.off('state',onState);resolve(v)}};s.on('state',onState);
 });
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.on('data',()=>resolve());child.on('error',reject);child.on('exit',c=>reject(Error(`server exited ${c}`)))});
  const connect=async()=>{const s=io('http://127.0.0.1:3103',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',()=>resolve());s.once('connect_error',reject)});return s};
  const a=await connect();let b=await connect();const room=await command(a,{type:'create',mode:'tiny',name:'Captain'}),hero=await command(b,{type:'join',code:room.code,name:'Hero'});assert.ok(room.ok&&hero.ok);
  const mission=async(id:string)=>{
   assert.ok((await command(a,{type:'ready'})).ok);assert.ok((await command(b,{type:'ready'})).ok);assert.ok((await command(a,{type:'start'})).ok);
   for(let round=0;round<5;round++){
    let va=await wait(a,v=>v?.phase==='action'&&v.round===round),vb=await wait(b,v=>v?.phase==='action'&&v.round===round);
    if(id==='ice-rescue'&&round===0){const stale=await command(b,{type:'submit',round,attempt:1,action:{tool:'rope'},adventureId:'forest-rescue',run:1});assert.equal(stale.ok,false)}
    const submit=(s:Socket,v:any,action:object)=>command(s,{type:'submit',round,attempt:v.adventure.attempt,adventureId:id,run:v.progression.run,action});
    if(id==='forest-rescue'&&round===0){assert.ok((await submit(a,va,{support:'save'})).ok);assert.ok((await submit(b,vb,{tool:'blanket'})).ok);const result=await wait(b,v=>v?.phase==='result'&&v.round===0);assert.equal(result.result.retry,true);va=await wait(a,v=>v?.phase==='action'&&v.adventure.attempt===2);vb=await wait(b,v=>v?.phase==='action'&&v.adventure.attempt===2)}
    const route=['blue-shelf','open-trail','pine-hollow','exposed-bridge','shelter-tunnel'][round];
    assert.ok((await submit(a,va,id==='ice-rescue'?{route,...([1,3,4].includes(round)?{support:round===4?'save':'warm'}:{})}:{support:'save'})).ok);
    assert.ok((await submit(b,vb,id==='ice-rescue'?{route}:{tool:['rope','ladder','lamp','blanket','boat'][round]})).ok);
    if(id==='ice-rescue'&&round===1){b.disconnect();b=await connect();const restore=await command(b,{type:'join',code:room.code,token:hero.token,name:''});assert.ok(restore.ok);assert.equal(restore.state.me,hero.state.me);assert.ok(restore.state.submitted);assert.deepEqual(restore.state.progression.completed,['forest-rescue'])}
    const [ra,rb]=await Promise.all([wait(a,v=>v?.phase==='result'&&v.round===round&&v.result.success),wait(b,v=>v?.phase==='result'&&v.round===round&&v.result.success)]);assert.deepEqual(ra.result,rb.result);
   }
   return await wait(a,v=>v?.phase==='finished');
  };
  const forest=await mission('forest-rescue');assert.deepEqual(forest.progression.available,['forest-rescue','ice-rescue','jungle-adventure','treasure-island','desert-rescue','ocean-adventure','magic-kingdom','moon-mission','cloud-adventure','meadow-rescue']);assert.equal((await command(b,{type:'adventure',adventureId:'ice-rescue'})).ok,false);
  assert.ok((await command(a,{type:'adventure-map'})).ok);await wait(b,v=>v?.progression.mapOpen);
  b.disconnect();b=await connect();const restore=await command(b,{type:'join',code:room.code,token:hero.token,name:''});assert.ok(restore.ok);assert.ok(restore.state.progression.mapOpen);
  assert.ok((await command(a,{type:'adventure',adventureId:'ice-rescue'})).ok);const lobby=await wait(b,v=>v?.phase==='lobby'&&v.adventure.id==='ice-rescue');assert.equal(lobby.me,hero.state.me);assert.equal(lobby.players.length,2);assert.equal(lobby.bonus,2);
  const ice=await mission('ice-rescue');assert.deepEqual(ice.progression.completed,['forest-rescue','ice-rescue']);assert.equal(ice.score,5);assert.equal(ice.bonus,0);assert.equal((await command(a,{type:'adventure',adventureId:'unbuilt-world'})).ok,false);
  await command(a,{type:'leave'});await command(b,{type:'leave'});
 }finally{sockets.forEach(s=>s.disconnect());child.kill()}
});

