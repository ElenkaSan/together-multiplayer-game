import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io,type Socket} from 'socket.io-client';
test('link crawlers receive room-specific metadata without joining or seeing private room details',async()=>{
 const child=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,PORT:'3143'},stdio:['ignore','pipe','pipe']});const sockets:Socket[]=[];
 const command=(s:Socket,data:object)=>new Promise<any>((resolve,reject)=>s.timeout(5000).emit('command',data,(err:Error|null,r:any)=>err?reject(err):resolve(r)));
 try{
  await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('Test server exited')))});
  for(const mode of ['tiny','signal']){
   const s=io('http://127.0.0.1:3143',{forceNew:true,transports:['websocket']});sockets.push(s);await new Promise<void>((resolve,reject)=>{s.once('connect',resolve);s.once('connect_error',reject)});
   const room=await command(s,{type:'create',mode,name:'SECRET PLAYER NAME'});assert.ok(room.ok);
   const response=await fetch(`http://127.0.0.1:3143/?room=${room.code}&game=${mode==='tiny'?'signal':'tiny'}`),html=await response.text();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(html.includes(`/art/share/${mode}-v2.png`));assert.ok(html.includes(mode==='tiny'?'TOGETHER! — Tiny Heroes':'TOGETHER! — Signal Lost'));assert.doesNotMatch(html,/SECRET PLAYER NAME/);assert.ok(!html.includes(room.token));
  }
  for(const url of ['/', '/?game=signal','/?room=EXPIRED&game=tiny']){const response=await fetch('http://127.0.0.1:3143'+url);assert.equal(response.status,200);assert.match(await response.text(),/og:image/);}
  const image=await fetch('http://127.0.0.1:3143/art/share/together-v2.png');assert.equal(image.status,200);assert.match(image.headers.get('content-type')!,/image\/png/);
 }finally{sockets.forEach(s=>s.disconnect());child.kill();}
});
