export type ControlMode = 'dpad' | 'stick';

const KEY = 'popket-settings-v1';

import { setSoundEnabled } from '../engine/audio';

export const settings: { controls: ControlMode; noCloudPrompt?: boolean; sound?: boolean } = { controls: 'dpad', sound: true };

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
  setSoundEnabled(settings.sound !== false);
}

export function setControls(mode: ControlMode) {
  settings.controls = mode;
  applySettings();
  saveSettings();
}

export function setSound(on: boolean) {
  settings.sound = on;
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
