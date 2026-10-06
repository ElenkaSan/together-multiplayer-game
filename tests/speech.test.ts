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
