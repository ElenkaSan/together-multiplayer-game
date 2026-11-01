import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
import {magicPlans} from './expert-fixtures';

// The same protocol regression can target an isolated public staging service.
// Never point it at production: it creates disposable QA rooms.
test('QA-06: independent clients receive selected captain facts, restore them, transfer ownership and complete a stage',async()=>{
 const external=process.env.QA_PUBLIC_URL;
 const child=external?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3141',BRIEFING_MS:'40',RESULT_MS:'250'},stdio:['ignore','pipe','pipe']});
 const sockets:Socket[]=[],states=new Map<Socket,any>();
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(10000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 const wait=async(s:Socket,predicate:(v:any)=>boolean)=>{if(predicate(states.get(s)))return states.get(s);return new Promise<any>((resolve,reject)=>{const timer=setTimeout(()=>{s.off('state',listen);reject(Error('State timeout'))},20000);function listen(v:any){if(predicate(v)){clearTimeout(timer);s.off('state',listen);resolve(v)}}s.on('state',listen)})};
 const connect=async()=>{const s=io(external||'http://127.0.0.1:3141',{forceNew:true,transports:['websocket']});sockets.push(s);s.on('state',v=>states.set(s,v));await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});return s};
 const scope=(v:any)=>({round:v.round,attempt:v.adventure.attempt,adventureId:v.adventure.id,run:v.progression.run});
 try{
  if(child)await new Promise<void>((resolve,reject)=>{child.stdout!.once('data',()=>resolve());child.once('error',reject)});
  const captain=await connect(),hero=await connect();let third=await connect();const outsider=await connect();
  const created=await command(captain,{type:'create',mode:'tiny',name:'QA Captain',adventureId:'magic-kingdom'});assert.ok(created.ok);
  const joined=await command(hero,{type:'join',code:created.code,name:'QA Explorer'});assert.ok(joined.ok);
  const joinedThird=await command(third,{type:'join',code:created.code,name:'QA Other'});assert.ok(joinedThird.ok);
  const isolated=await command(outsider,{type:'create',mode:'tiny',name:'QA Isolated',adventureId:'magic-kingdom'});assert.ok(isolated.ok);
  for(const s of [captain,hero,third])assert.ok((await command(s,{type:'ready'})).ok);assert.ok((await command(captain,{type:'start'})).ok);
  const vc=await wait(captain,v=>v?.phase==='action');const vh=await wait(hero,v=>v?.phase==='action');assert.equal(vh.deadline,vc.deadline);assert.equal(vh.clues.received.length,0);
  const target=vc.clues.own[0];assert.ok(target.text.includes('GOLD TRIANGLE'));
  assert.ok((await command(captain,{type:'share-clue',...scope(vc),clue:target.index,text:'FORGED',playerId:joined.state.me})).ok);
  const delivered=await wait(hero,v=>v?.clues?.received?.length===1);assert.equal(delivered.clues.received[0].text,target.text);assert.equal(delivered.clues.received[0].name,'QA Captain');assert.equal(delivered.clues.received.length,1);
  assert.equal(states.get(outsider)?.code,isolated.code);assert.equal(states.get(outsider)?.phase,'lobby');
  const capAfter=await wait(captain,v=>v?.clues?.own[0]?.shared);assert.equal(capAfter.clues.received.length,0);
  third.disconnect();third=await connect();const restored=await command(third,{type:'join',code:created.code,token:joinedThird.token,name:''});assert.ok(restored.ok);assert.equal(restored.state.clues.received[0].text,target.text);assert.equal(restored.state.players.length,3);assert.equal(restored.state.deadline,vc.deadline);
  assert.ok((await command(captain,{type:'leave'})).ok);
  let promoted=await wait(hero,v=>v?.players?.length===2&&v.host===v.me);assert.match(promoted.crewNotice.message,/You are now the Team Captain/);
  assert.equal((await command(hero,{type:'share-clue',...scope(vc),clue:0})).ok,false);
  assert.ok((await command(hero,{type:'share-clue',...scope(promoted),clue:0})).ok);
  let remaining=await wait(third,v=>v?.clues?.received?.length===1&&v.players?.length===2);assert.equal(remaining.clues.received[0].name,'QA Explorer');
  promoted=await wait(hero,v=>v?.phase==='action'&&v.players.length===2);remaining=await wait(third,v=>v?.phase==='action'&&v.players.length===2);
  for(const [s,v] of [[hero,promoted],[third,remaining]] as const)for(const key of v.expert.ownKeys){const latest=states.get(s);assert.ok((await command(s,{type:'mechanism',...scope(latest),version:latest.expert.version,key,value:magicPlans[0][key]})).ok)}
  for(const s of [hero,third]){const latest=states.get(s);assert.ok((await command(s,{type:'mechanism',...scope(latest),version:latest.expert.version,ready:true})).ok)}
  const ready=await wait(hero,v=>v?.expert?.explorers?.every((x:any)=>x.ready));assert.ok((await command(hero,{type:'submit',...scope(ready),stationVersion:ready.expert.version,action:{launch:'launch'}})).ok);
  const [a,b]=await Promise.all([wait(hero,v=>v?.phase==='result'),wait(third,v=>v?.phase==='result')]);assert.ok(a.result.success);assert.equal(a.score,1);assert.deepEqual(a.result,b.result);assert.equal(a.score,b.score);assert.equal(a.deadline,b.deadline);
  console.log(JSON.stringify({environment:external?'public staging':'isolated test server',room:created.code,players:3,handoverTo:2,score:a.score,selectedSharing:true,reconnect:true,roomIsolation:true,synchronizedDeadline:true}));
 }finally{sockets.forEach(s=>s.disconnect());child?.kill()}
});
