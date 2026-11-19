export type ControlMode = 'dpad' | 'stick';

const KEY = 'popket-settings-v1';

export const settings: { controls: ControlMode } = { controls: 'dpad' };

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
}

export function setControls(mode: ControlMode) {
  settings.controls = mode;
  applySettings();
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
