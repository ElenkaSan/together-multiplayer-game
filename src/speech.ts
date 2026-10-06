// Nothing is spoken until start() is called by the Read to me button.
export function createReader(synth: SpeechSynthesis, make: (text: string) => SpeechSynthesisUtterance, update: (state: 'starting'|'reading'|'idle'|'error', error?: string) => void) {
 let current: SpeechSynthesisUtterance|null=null;
 let timer: ReturnType<typeof setTimeout>|undefined;
 function stop() {
  clearTimeout(timer);
  if(current){current.onstart=null;current.onend=null;current.onerror=null;current=null;synth.cancel()}
 }
 function start(text: string) {
  stop(); synth.cancel(); synth.resume();
  const sentences=text.match(/[^.!?]+[.!?]*/g)?.map(s=>s.trim()).filter(Boolean)||[];
  let index=0;
  function next() {
   if(index===sentences.length){current=null;update('idle');return}
   const utterance=make(sentences[index++]);
   current=utterance;utterance.lang='en-US';utterance.rate=.88;utterance.volume=1;
   const voices=synth.getVoices();
   const voice=voices.find(v=>v.localService&&v.lang.startsWith('en'))??voices.find(v=>v.default&&v.lang.startsWith('en'))??voices.find(v=>v.lang.startsWith('en'));
   if(voice)utterance.voice=voice;
   update('starting');
   const fail=(error:string)=>{if(current!==utterance)return;stop();update('error',error)};
   timer=setTimeout(()=>fail('start-timeout'),7000);
   utterance.onstart=()=>{if(current===utterance){clearTimeout(timer);update('reading')}};
   utterance.onend=()=>{if(current===utterance){clearTimeout(timer);next()}};
   utterance.onerror=event=>fail(event.error);
   try{synth.speak(utterance);if(synth.paused)synth.resume()}catch{fail('synthesis-failed')}
  }
  next();
 }
 return {start,stop};
}
