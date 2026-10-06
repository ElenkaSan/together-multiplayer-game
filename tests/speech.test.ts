import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReader} from '../src/speech';
function fixture(){
 const spoken:SpeechSynthesisUtterance[]=[];const states:string[]=[];let canceled=0,resumed=0;
 const synth={paused:true,cancel(){canceled++},resume(){resumed++;this.paused=false},getVoices(){return []},speak(u:SpeechSynthesisUtterance){spoken.push(u)}};
 const reader=createReader(synth as unknown as SpeechSynthesis,text=>({text} as SpeechSynthesisUtterance),(state,error)=>states.push(error||state));
 return {reader,spoken,states,synth,get canceled(){return canceled},get resumed(){return resumed}};
}
test('read-aloud requires explicit start and resumes a paused browser',()=>{
 const f=fixture();assert.equal(f.spoken.length,0);f.reader.start('See your clue. Pick a tool.');
 assert.equal(f.resumed,1);assert.equal(f.spoken[0].volume,1);
 f.spoken[0].onstart?.({} as SpeechSynthesisEvent);assert.equal(f.states.at(-1),'reading');
 f.spoken[0].onend?.({} as SpeechSynthesisEvent);assert.equal(f.spoken[1].text,'Pick a tool.');
 f.spoken[1].onend?.({} as SpeechSynthesisEvent);assert.equal(f.states.at(-1),'idle');f.reader.stop();
});
test('stopping or changing screens prevents old callbacks from reading the next sentence',()=>{
 const f=fixture();f.reader.start('First clue. Next clue.');const end=f.spoken[0].onend!;
 f.reader.stop();end.call(f.spoken[0],{} as SpeechSynthesisEvent);assert.equal(f.spoken.length,1);assert.equal(f.spoken[0].onend,null);
});
test('speech failure exposes a usable error and allows another tap',()=>{
 const f=fixture();f.reader.start('Hello.');f.spoken[0].onerror?.({error:'voice-unavailable'} as SpeechSynthesisErrorEvent);
 assert.equal(f.states.at(-1),'voice-unavailable');f.reader.start('Try again.');assert.equal(f.spoken.length,2);f.reader.stop();
});
test('a silent browser that never starts speech times out instead of remaining on Stop reading',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const f=fixture();f.reader.start('Hello.');t.mock.timers.tick(7001);
 assert.equal(f.states.at(-1),'start-timeout');assert.equal(f.spoken[0].onstart,null);f.reader.stop();
});

function voice(name:string,lang='en-US',localService=true):SpeechSynthesisVoice{return {name,lang,localService,default:false,voiceURI:name}}
test('recommended narration prefers a natural English voice over the first local voice',()=>{
 const f=fixture();const robot=voice('Basic English'),natural=voice('English Natural', 'en-US',false),other=voice('French Premium','fr-FR');
 f.synth.getVoices=()=>[other,robot,natural] as never[];
 f.reader.start('Hello.');assert.equal(f.spoken[0].voice,natural);assert.equal(f.spoken[0].rate,.92);assert.equal(f.spoken[0].pitch,1);f.reader.stop();
});
test('a chosen English voice keeps its accent and pace; missing choices fall back safely',()=>{
 const spoken:SpeechSynthesisUtterance[]=[];const selected=voice('Serena','en-GB'),fallback=voice('Samantha');let preferences={voiceURI:selected.voiceURI,rate:1};
 const synth={paused:false,cancel(){},resume(){},getVoices(){return [fallback,selected]},speak(u:SpeechSynthesisUtterance){spoken.push(u)}};
 const reader=createReader(synth as unknown as SpeechSynthesis,text=>({text} as SpeechSynthesisUtterance),()=>{},()=>preferences);
 reader.start('Hello.');assert.equal(spoken[0].voice,selected);assert.equal(spoken[0].lang,'en-GB');assert.equal(spoken[0].rate,1);
 preferences={voiceURI:'a voice from another device',rate:.92};reader.start('Again.');assert.equal(spoken[1].voice,fallback);reader.stop();
});
test('voices populated after mount are used on the next explicit tap',()=>{
 const f=fixture();f.reader.start('Hello.');assert.equal(f.spoken[0].voice,undefined);f.reader.stop();
 const available=voice('Samantha Enhanced');f.synth.getVoices=()=>[available] as never[];assert.equal(f.spoken.length,1);
 f.reader.start('Try again.');assert.equal(f.spoken[1].voice,available);f.reader.stop();
});
