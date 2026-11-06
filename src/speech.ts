export interface NarrationSettings {
  voiceURI: string;
  rate: number;
}
const preferenceKey = "tiny-heroes-narration-v2";
export function loadNarrationSettings(): NarrationSettings {
  try {
    const p = JSON.parse(localStorage.getItem(preferenceKey) || "null");
    return {
      voiceURI: typeof p?.voiceURI === "string" ? p.voiceURI : "",
      rate: p?.rate === 1 ? 1 : 0.92,
    };
  } catch {
    return { voiceURI: "", rate: 0.92 };
  }
}
export function saveNarrationSettings(settings: NarrationSettings) {
  try {
    localStorage.setItem(preferenceKey, JSON.stringify(settings));
  } catch {
    /* Reading still works when storage is unavailable. */
  }
}
const allowedVoices = [
  { name: "Karen", lang: "en-AU" },
  { name: "Tessa", lang: "en-ZA" },
  { name: "Daniel", lang: "en-GB" },
  { name: "Whisper", lang: "en-US" },
];
export function narrationVoices(voices: SpeechSynthesisVoice[]) {
  return allowedVoices.flatMap((allowed) =>
    voices.filter(
      (v) =>
        v.lang.replace("_", "-").toLowerCase() === allowed.lang.toLowerCase() &&
        new RegExp(`^${allowed.name}(?:$|[ (])`, "i").test(v.name),
    ),
  );
}
export function chooseNarrationVoice(
  voices: SpeechSynthesisVoice[],
  preferred = "",
) {
  const available = narrationVoices(voices);
  return available.find((v) => v.voiceURI === preferred) || available[0];
}
// Nothing is spoken until start() is called by the Read to me button.
export function createReader(
  synth: SpeechSynthesis,
  make: (text: string) => SpeechSynthesisUtterance,
  update: (
    state: "starting" | "reading" | "idle" | "error",
    error?: string,
  ) => void,
  settings: () => NarrationSettings = loadNarrationSettings,
) {
  let current: SpeechSynthesisUtterance | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function stop() {
    clearTimeout(timer);
    if (current) {
      current.onstart = null;
      current.onend = null;
      current.onerror = null;
      current = null;
      synth.cancel();
    }
  }
  function start(text: string) {
    stop();
    synth.cancel();
    synth.resume();
    const sentences =
      text
        .match(/[^.!?]+[.!?]*/g)
        ?.map((s) => s.trim())
        .filter(Boolean) || [];
    let index = 0;
    function next() {
      if (index === sentences.length) {
        current = null;
        update("idle");
        return;
      }
      const utterance = make(sentences[index++]);
      const preferences = settings();
      current = utterance;
      utterance.lang = "en-US";
      utterance.rate = preferences.rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voices = synth.getVoices();
      const voice = chooseNarrationVoice(voices, preferences.voiceURI);
      if (!voice) {
        current = null;
        update("error", "voice-unavailable");
        return;
      }
      utterance.voice = voice;
      utterance.lang = voice.lang;
      update("starting");
      const fail = (error: string) => {
        if (current !== utterance) return;
        stop();
        update("error", error);
      };
      timer = setTimeout(() => fail("start-timeout"), 7000);
      utterance.onstart = () => {
        if (current === utterance) {
          clearTimeout(timer);
          update("reading");
        }
      };
      utterance.onend = () => {
        if (current === utterance) {
          clearTimeout(timer);
          next();
        }
      };
      utterance.onerror = (event) => fail(event.error);
      try {
        synth.speak(utterance);
        if (synth.paused) synth.resume();
      } catch {
        fail("synthesis-failed");
      }
    }
    next();
  }
  return { start, stop };
}
