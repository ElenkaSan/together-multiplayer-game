import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReader,chooseNarrationVoice,narrationVoices} from '../src/speech';
function fixture(){
 const spoken:SpeechSynthesisUtterance[]=[];const states:string[]=[];let canceled=0,resumed=0;
 const synth={paused:true,cancel(){canceled++},resume(){resumed++;this.paused=false},getVoices(){return [voice('Karen','en-AU')]},speak(u:SpeechSynthesisUtterance){spoken.push(u)}};
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
test('only the four requested voices and accents are available; Karen is the default',()=>{
 const karen=voice('Karen','en-AU'),tessa=voice('Tessa','en-ZA'),daniel=voice('Daniel','en-GB'),whisper=voice('Whisper','en-US');
 const voices=[voice('Samantha'),daniel,voice('Karen','en-US'),whisper,tessa,karen,voice('English Natural')];
 assert.deepEqual(narrationVoices(voices),[karen,tessa,daniel,whisper]);
 assert.equal(chooseNarrationVoice(voices),karen);assert.equal(chooseNarrationVoice(voices,'Samantha'),karen);
 const f=fixture();f.reader.start('Hello.');assert.equal(f.spoken[0].voice?.name,'Karen');assert.equal(f.spoken[0].lang,'en-AU');assert.equal(f.spoken[0].rate,.92);assert.equal(f.spoken[0].pitch,1);f.reader.stop();
});
test('a chosen allowed voice keeps its accent and pace; missing choices fall back to Karen',()=>{
 const spoken:SpeechSynthesisUtterance[]=[];const selected=voice('Daniel','en-GB'),fallback=voice('Karen','en-AU');let preferences={voiceURI:selected.voiceURI,rate:1};
 const synth={paused:false,cancel(){},resume(){},getVoices(){return [selected,fallback]},speak(u:SpeechSynthesisUtterance){spoken.push(u)}};
 const reader=createReader(synth as unknown as SpeechSynthesis,text=>({text} as SpeechSynthesisUtterance),()=>{},()=>preferences);
 reader.start('Hello.');assert.equal(spoken[0].voice,selected);assert.equal(spoken[0].lang,'en-GB');assert.equal(spoken[0].rate,1);
 preferences={voiceURI:'a voice from another device',rate:.92};reader.start('Again.');assert.equal(spoken[1].voice,fallback);reader.stop();
});
test('unavailable voices never silently use a removed voice; late loading permits another tap',()=>{
 const f=fixture();f.synth.getVoices=()=>[voice('Samantha')];f.reader.start('Hello.');assert.equal(f.spoken.length,0);assert.equal(f.states.at(-1),'voice-unavailable');
 const available=voice('Karen (Enhanced)','en-AU');f.synth.getVoices=()=>[available];assert.equal(f.spoken.length,0);
 f.reader.start('Try again.');assert.equal(f.spoken[0].voice,available);f.reader.stop();
});
test('Karen unavailable falls back only to another requested voice',()=>{
 const tessa=voice('Tessa','en-ZA');assert.equal(chooseNarrationVoice([voice('Samantha'),tessa]),tessa);
 assert.equal(chooseNarrationVoice([voice('Samantha')]),undefined);
});
