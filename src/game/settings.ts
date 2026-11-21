export type ControlMode = 'dpad' | 'stick';

const KEY = 'popket-settings-v1';

import { setAudioEnabled } from '../engine/audio';

export const settings: { controls: ControlMode; noCloudPrompt?: boolean; music?: boolean; sfx?: boolean } = { controls: 'dpad', music: true, sfx: true };

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) Object.assign(settings, JSON.parse(raw));
  } catch {
    /* storage unavailable: keep defaults */
  }
  applySettings();
}

export function applySettings() {
  document.body.dataset.controls = settings.controls;
  setAudioEnabled(settings.music !== false, settings.sfx !== false);
}

export function setControls(mode: ControlMode) {
  settings.controls = mode;
  applySettings();
  saveSettings();
}

export function setMusic(on: boolean) {
  settings.music = on;
  applySettings();
  saveSettings();
}

export function setSfx(on: boolean) {
  settings.sfx = on;
  applySettings();
  saveSettings();
}

export function saveSettings() {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
