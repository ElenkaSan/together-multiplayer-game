import {parseSignalTimers} from './signal-puzzles.js';
import express from 'express';
import {readFile} from 'node:fs/promises';
import {withShareMetadata,type ShareGame} from './share-metadata.js';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {resolve as pathResolve} from 'node:path';
import {Engine} from './engine.js';
const app=express();const http=createServer(app);const io=new Server(http,{maxHttpBufferSize:10000});
const engine=new Engine(r=>{for(const p of r.players)if(p.socketId)io.to(p.socketId).emit('state',engine.view(r,p))},Number(process.env.ACTION_MS)||60000,Number(process.env.BRIEFING_MS)||7000,Number(process.env.RESULT_MS)||12000,parseSignalTimers(process.env.SIGNAL_SECTOR_SECONDS));
app.get('/health',(_,res)=>res.json({ok:true}));
app.get('/',async(req,res,next)=>{
 try{
  let game:ShareGame=req.query.game==='tiny'||req.query.game==='signal'?req.query.game:null;
  if(typeof req.query.room==='string'){try{game=engine.get(req.query.room).mode}catch{}}
  const html=await readFile(pathResolve('dist/index.html'),'utf8');
  res.set('Cache-Control','no-store').type('html').send(withShareMetadata(html,game));
 }catch(error){next(error)}
});
app.use(express.static(pathResolve('dist')));app.get('/{*path}',(_,res)=>res.sendFile(pathResolve('dist/index.html')));
io.on('connection',socket=>{let seat:{code:string;token:string}|null=null;let windowAt=Date.now(),events=0;
 socket.on('command',(data,ack)=>{if(typeof ack!=='function')return;try{if(Date.now()-windowAt>10000){windowAt=Date.now();events=0}if(++events>40)throw Error('Too many requests. Try again shortly.');if(!data||typeof data!=='object')throw Error('Invalid request.');
 if(data.type==='room-info'){const r=engine.get(data.code);ack({ok:true,code:r.code,mode:r.mode});return}
 if(data.type==='create'||data.type==='join'){if(seat)throw Error('Leave your current room first.');const {r,p,...rest}=data.type==='create'?engine.create(data.mode,data.name,socket.id,data.adventureId):engine.join(data.code,data.name,socket.id,data.token);seat={code:r.code,token:p.token};if('old'in rest&&rest.old&&rest.old!==socket.id){io.to(rest.old as string).emit('replaced');io.sockets.sockets.get(rest.old as string)?.disconnect(true)}ack({ok:true,token:p.token,code:r.code,state:engine.view(r,p)});return}
 if(!seat)throw Error('Join a room first.');const r=engine.get(seat.code),p=engine.player(r,seat.token);if(p.socketId!==socket.id)throw Error('This seat is active on another connection.');if(r.closed&&data.type!=='leave')throw Error(r.closed);
 switch(data.type){case'share-telemetry':engine.shareTelemetry(r,p,data);break;case'rethink-plan':engine.rethinkPlan(r,p,data);break;case'share-all-clues':engine.shareAllClues(r,p,data);break;case'share-clue':engine.shareClue(r,p,data);break;case'ready':engine.ready(r,p);break;case'start':engine.start(r,p);break;case'submit':engine.submit(r,p,data.round,data.action,data.attempt,data.adventureId,data.run,data.stationVersion,data.planVersion,r.mode==='signal'?{run:data.signalRun,puzzleId:data.puzzleId}:undefined);break;case'station':engine.station(r,p,data);break;case'mechanism':engine.mechanism(r,p,data);break;case'adventure-map':engine.adventureMap(r,p);break;case'adventure':engine.chooseAdventure(r,p,data.adventureId);break;case'replay':engine.replay(r,p);break;case'leave':engine.leave(r,p);seat=null;break;default:throw Error('Unknown command.')}ack({ok:true});
 }catch(e){ack({ok:false,error:e instanceof Error?e.message:'Request failed.'})}});socket.on('disconnect',()=>engine.disconnect(socket.id));});
setInterval(()=>engine.tick(),200).unref();http.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('TOGETHER! ready'));

