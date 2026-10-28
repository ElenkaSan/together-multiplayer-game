import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {expeditionSolutions} from '../server/team-expeditions';
test('Share all synchronizes 3 and 4 independent clients, survives reconnect and unlocks Captain plan',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3140',ACTION_MS:'15000',BRIEFING_MS:'40',RESULT_MS:'150'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=(s:Socket,predicate:(v:any)=>boolean)=>new Promise<any>((resolve,reject)=>{if(predicate(states.get(s)))return resolve(states.get(s));const timer=setTimeout(()=>{s.off('state',listen);reject(Error('No synchronized state'))},5000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)});
 const connect=async()=>{const s=io('http://127.0.0.1:3140',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('Test server exited')))});
  for(const count of [3,4]){
   const captain=await connect(),heroes:Socket[]=[],tokens:string[]=[];const created=await command(captain,{type:'create',mode:'tiny',name:'Captain',adventureId:'jungle-adventure'});assert.ok(created.ok);
   for(let i=1;i<count;i++){const h=await connect();heroes.push(h);const joined=await command(h,{type:'join',code:created.code,name:`Hero ${i}`});assert.ok(joined.ok);tokens.push(joined.token);}
   for(const s of [captain,...heroes])assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(captain,{type:'start'})).ok);
   const vc=await wait(captain,v=>v?.phase==='action'),scope={round:vc.round,attempt:vc.adventure.attempt,adventureId:vc.adventure.id,run:vc.progression.run};let expected=0;
   for(let i=0;i<heroes.length;i++){
    const h=heroes[i],vh=await wait(h,v=>v?.phase==='action');const own=vh.clues.own;expected+=own.length;
    const sent=await command(h,{type:'share-all-clues',...scope,clues:[999],text:'FORGED',playerId:vc.me});assert.ok(sent.ok);
    const got=await wait(captain,v=>v?.clues?.received.length===expected);assert.equal(got.clues.allShared,i===heroes.length-1);assert.ok(got.clues.received.every((c:any)=>c.text!=='FORGED'));assert.equal((await wait(h,v=>v?.clues?.own.every((c:any)=>c.shared))).clues.received.length,0);
    assert.ok((await command(h,{type:'share-all-clues',...scope})).ok);assert.equal(states.get(captain).clues.received.length,expected);
   }
   heroes[0].disconnect();heroes[0]=await connect();const restored=await command(heroes[0],{type:'join',code:created.code,token:tokens[0],name:''});assert.ok(restored.ok);assert.ok(restored.state.clues.own.every((c:any)=>c.shared));await wait(captain,v=>v?.players.every((p:any)=>p.connected));assert.ok(states.get(captain).clues.allShared);
   assert.equal((await command(heroes[0],{type:'share-all-clues',...scope,attempt:99})).ok,false);
   assert.ok((await command(captain,{type:'submit',...scope,action:expeditionSolutions['jungle-adventure'][0]})).ok);
   for(const h of heroes){await wait(h,v=>!!v?.teamPlan);assert.ok((await command(h,{type:'submit',...scope,action:{confirm:'ready'}})).ok);}
   const result=await wait(captain,v=>v?.phase==='result');assert.ok(result.result.success);assert.equal(result.score,1);
   for(const s of [captain,...heroes])s.disconnect();
  }
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
