export interface NarrationSettings {voiceURI:string;rate:number}
const preferenceKey='tiny-heroes-narration-v1';
export function loadNarrationSettings():NarrationSettings {
 try {const p=JSON.parse(localStorage.getItem(preferenceKey)||'null');return {voiceURI:typeof p?.voiceURI==='string'?p.voiceURI:'',rate:p?.rate===1?1:.92}}catch{return {voiceURI:'',rate:.92}}
}
export function saveNarrationSettings(settings:NarrationSettings){try{localStorage.setItem(preferenceKey,JSON.stringify(settings))}catch{/* Reading still works when storage is unavailable. */}}
export function englishVoices(voices:SpeechSynthesisVoice[]){return voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang))}
// Voice quality is not exposed by the API; these name hints are a best-effort default.
// The listener can always choose a different voice on their own device.
export function chooseNarrationVoice(voices:SpeechSynthesisVoice[],preferred=''){
 const english=englishVoices(voices);const chosen=english.find(v=>v.voiceURI===preferred);if(chosen)return chosen;
 function score(v:SpeechSynthesisVoice){return (/premium|enhanced|natural|neural/i.test(v.name)?100:0)+(/samantha|ava|allison|serena|karen|aria|jenny|google us english/i.test(v.name)?40:0)+(/^en[-_]US$/i.test(v.lang)?15:0)+(v.default?5:0)+(v.localService?1:0)}
 return english.reduce<SpeechSynthesisVoice|undefined>((best,v)=>!best||score(v)>score(best)?v:best,undefined);
}
// Nothing is spoken until start() is called by the Read to me button.
export function createReader(synth: SpeechSynthesis, make: (text: string) => SpeechSynthesisUtterance, update: (state: 'starting'|'reading'|'idle'|'error', error?: string) => void, settings:()=>NarrationSettings=loadNarrationSettings) {
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
   const preferences=settings();current=utterance;utterance.lang='en-US';utterance.rate=preferences.rate;utterance.pitch=1;utterance.volume=1;
   const voices=synth.getVoices();
   const voice=chooseNarrationVoice(voices,preferences.voiceURI);
   if(voice){utterance.voice=voice;utterance.lang=voice.lang}
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
