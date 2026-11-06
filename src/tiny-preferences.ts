const soundKey = "tiny-heroes-effects-v1";
export function loadSoundPreference() {
  try {
    return localStorage.getItem(soundKey) === "on";
  } catch {
    return false;
  }
}
export function saveSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(soundKey, enabled ? "on" : "off");
  } catch {
    /* Effects still work without storage. */
  }
}
