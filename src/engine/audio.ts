// ---------------------------------------------------------------------------
// Chiptune audio: background music and sound effects synthesised with WebAudio.
// Songs are written as space-separated 8th-note steps: a note like "C5" or
// "F#4", "-" to hold the previous note, "." for a rest. Drums use k (kick),
// s (snare) and h (hi-hat).

type Track = {
  lead: string; bass: string; drums?: string; wave?: OscillatorType;
  /** Soft sustained third voice. */
  pad?: string;
  /** Faint, detuned repeat of each lead note (ghostly echo). */
  echo?: boolean;
  /** Lead vibrato depth in Hz. */
  vibrato?: number;
};
type Song = Track & { bpm: number };

const DRUM_STD = 'k . h . s . h . k . h . s . h h';
const DRUM_FAST = 'k h s h k h s h k h s h k k s h';

export const SONGS: Record<string, Song> = {
  title: {
    bpm: 132,
    lead: 'C5 - E5 G5 C6 - B5 A5 G5 - E5 - G5 - - . A5 - G5 F5 E5 - D5 E5 F5 - A5 - G5 - - .',
    bass: 'C3 . C3 . G2 . G2 . A2 . A2 . E2 . E2 . F2 . F2 . C3 . C3 . G2 . G2 . G2 . B2 .',
    drums: DRUM_STD,
  },
  town_calm: {
    bpm: 104, wave: 'triangle',
    lead: 'F5 - A5 - C6 - A5 - G5 - E5 - C5 - - . D5 - F5 - A5 - G5 - F5 - E5 - F5 - - .',
    bass: 'F2 - C3 - F2 - C3 - C3 - G2 - C3 - G2 - D3 - A2 - D3 - A2 - A#2 - C3 - F2 - - -',
  },
  town_water: {
    bpm: 96, wave: 'triangle',
    lead: 'D5 F#5 A5 - F#5 D5 E5 - G5 B5 - G5 F#5 - A5 - D6 - C#6 B5 A5 - G5 F#5 E5 - - - D5 - - .',
    bass: 'D3 - A2 - D3 - A2 - G2 - D3 - G2 - D3 - B2 - F#2 - B2 - G2 - A2 - - - D3 - - -',
  },
  city: {
    bpm: 128,
    lead: 'G5 . B5 . D6 - B5 . C6 . A5 . F#5 - D5 . G5 . B5 . D6 . G6 - F#6 E6 D6 C6 B5 - A5 -',
    bass: 'G2 G2 D3 D3 G2 G2 D3 D3 A2 A2 E3 E3 D3 D3 F#2 F#2 G2 G2 D3 D3 E3 E3 B2 B2 C3 C3 D3 D3 G2 G2 D3 D3',
    drums: DRUM_STD,
  },
  town_fire: {
    bpm: 120,
    lead: 'E5 - G5 A5 B5 - A5 G5 E5 - D5 E5 G5 - - . E5 - G5 A5 B5 - D6 B5 A5 - G5 A5 E5 - - .',
    bass: 'E2 E3 E2 E3 E2 E3 E2 E3 C3 C2 C3 C2 D3 D2 D3 D2 E2 E3 E2 E3 G2 G3 G2 G3 A2 A3 B2 B3 E2 E3 E2 E3',
    drums: DRUM_STD,
  },
  town_snow: {
    bpm: 84, wave: 'triangle',
    lead: 'A5 - C6 - E6 - - - D6 - C6 - B5 - - - A5 - G5 - E5 - - - F5 - E5 - A5 - - -',
    bass: 'A2 - - - E3 - - - G2 - - - E3 - - - F2 - - - C3 - - - D3 - - - E3 - - -',
  },
  town_dragon: {
    bpm: 100,
    lead: 'D5 - E5 - A5 - - - B5 - A5 - E5 - D5 - D5 - E5 - G5 - A5 - B5 - D6 - B5 - A5 -',
    bass: 'D3 - - A2 D3 - - A2 G2 - - D3 G2 - - D3 B2 - - F#2 B2 - - F#2 A2 - - E3 A2 - - E3',
    drums: 'k . . . s . . . k . . . s . h .',
  },
  route: {
    bpm: 140,
    lead: 'G4 C5 E5 G5 - E5 C5 - A4 D5 F5 A5 - F5 D5 - G4 B4 D5 G5 - F5 E5 D5 C5 - E5 - G5 - - .',
    bass: 'C3 . G2 . C3 . G2 . D3 . A2 . D3 . A2 . G2 . D3 . G2 . B2 . C3 . G2 . C3 . . .',
    drums: DRUM_STD,
  },
  cave: {
    bpm: 90, wave: 'triangle',
    lead: 'A4 - . C5 - . B4 - . E4 - . - - - . A4 - . C5 - . D5 - . E5 - . - - D5 .',
    bass: 'A2 - - - - - - - G2 - - - - - - - F2 - - - - - - - E2 - - - - - - -',
    drums: 'k . . . . . h . k . . . . . h .',
  },
  ship: {
    // Slow, eerie music-box waltz over a low drone, with a heartbeat and ghostly echoes.
    bpm: 66, wave: 'sine', echo: true, vibrato: 5,
    lead: 'D5 - - F5 - - A5 - G#5 - - - - - . . F5 - - E5 - - D5 - C#5 - - - - - . . D5 - - F5 - - A#5 - A5 - - - G#5 - - . G5 - F5 - E5 - D#5 - D5 - - - - - - .',
    bass: 'D2 - - - - - - - - - - - - - - - A#1 - - - - - - - A1 - - - - - - - G1 - - - - - - - - - - - - - - - A1 - - - - - - - D2 - - - - - - -',
    pad: 'A3 - - - - - - - F3 - - - - - - - F3 - - - - - - - E3 - - - - - - - D3 - - - - - - - D#3 - - - - - - - C#3 - - - - - - - A3 - - - - - - -',
    drums: 'k . k . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
  },
  forest: {
    // Gentle A-Dorian lilt with a soft echo: green light, whispers between the trees.
    bpm: 92, wave: 'triangle', echo: true,
    lead: 'A4 - C5 E5 - D5 C5 - B4 A4 - - G4 - A4 B4 C5 - E5 G5 - F#5 E5 - D5 E5 - - . . . . A4 - C5 E5 - D5 C5 - B4 A4 - G4 E4 - - . F#4 - A4 C5 - B4 A4 - G4 A4 - - - - . .',
    bass: 'A2 - - E3 - - A2 - G2 - - D3 - - G2 - F2 - - C3 - - F2 - E2 - - B2 - - E2 - A2 - - E3 - - A2 - G2 - - D3 - - G2 - D2 - - A2 - - D2 - E2 - - - A2 - - -',
    pad: 'E4 - - - - - - - D4 - - - - - - - C4 - - - - - - - B3 - - - - - - - E4 - - - - - - - D4 - - - - - - - F#4 - - - - - - - E4 - - - C#4 - - -',
    drums: 'k . . h . . k . . h . . k . h .',
  },
  volcano: {
    // Driving E-Phrygian riff over a pounding bass: heat, danger and a ticking clock.
    bpm: 112, vibrato: 3,
    lead: 'E5 - F5 - E5 . B4 - C5 - B4 . A4 - B4 - E5 - F5 - G5 - F5 E5 F5 - - - . . . . E5 - F5 - E5 . B4 - C5 - D5 . C5 - B4 - A4 - B4 - C5 - B4 A4 G#4 - - - E4 - - .',
    bass: 'E2 E2 E3 E2 F2 F2 F3 F2 E2 E2 E3 E2 D2 D2 D3 D2 C2 C2 C3 C2 D2 D2 D3 D2 E2 E2 E3 E2 E2 E2 B2 B2 E2 E2 E3 E2 F2 F2 F3 F2 E2 E2 E3 E2 D2 D2 D3 D2 A1 A1 A2 A1 B1 B1 B2 B1 E2 E2 E3 E2 E2 E2 E2 .',
    pad: 'B3 - - - - - - - A3 - - - - - - - G3 - - - - - - - G#3 - - - - - - - B3 - - - - - - - A3 - - - - - - - C4 - - - - - - - B3 - - - - - - -',
    drums: 'k . h k s . h . k k h . s . h h',
  },
  safari: {
    bpm: 136,
    lead: 'C5 F5 A5 F5 C6 - A5 - A#5 G5 E5 C5 G5 - - . A5 C6 A5 F5 A#5 - G5 - E5 G5 C6 A#5 A5 - F5 -',
    bass: 'F2 . C3 . F2 . C3 . C3 . G2 . C3 . G2 . F2 . C3 . A#2 . F3 . C3 . E3 . F2 . C3 .',
    drums: 'k . h k s . h . k . h k s . h h',
  },
  center: {
    bpm: 92, wave: 'triangle',
    lead: 'E5 - G5 - C6 - - - B5 - G5 - D5 - - - C5 - E5 - A5 - - - G5 - F5 - E5 - - -',
    bass: 'C3 - - - G2 - - - G2 - - - G2 - - - A2 - - - F2 - - - C3 - - - G2 - - -',
  },
  gym: {
    bpm: 130,
    lead: 'E5 E5 . E5 G5 . E5 . D5 D5 . D5 F#5 . D5 . C5 C5 . C5 E5 . C5 . B4 - D#5 - F#5 - B5 -',
    bass: 'E2 E2 E3 E2 E2 E2 E3 E2 D2 D2 D3 D2 D2 D2 D3 D2 C2 C2 C3 C2 C2 C2 C3 C2 B1 B1 B2 B1 B1 B1 B2 B1',
    drums: DRUM_STD,
  },
  battle_wild: {
    bpm: 160,
    lead: 'A5 . A5 C6 . A5 E5 . G5 . G5 B5 . G5 D5 . F5 . F5 A5 . F5 C5 . E5 G#5 B5 E6 D6 C6 B5 G#5',
    bass: 'A2 A3 A2 A3 A2 A3 A2 A3 G2 G3 G2 G3 G2 G3 G2 G3 F2 F3 F2 F3 F2 F3 F2 F3 E2 E3 E2 E3 E2 E3 E2 E3',
    drums: DRUM_FAST,
  },
  battle_trainer: {
    bpm: 156,
    lead: 'C5 D#5 G5 C6 - G5 D#5 - A#4 D5 F5 A#5 - F5 D5 - G#4 C5 D#5 G#5 - D#5 C5 - G4 B4 D5 G5 F5 D#5 D5 B4',
    bass: 'C3 C3 G2 G2 C3 C3 G2 G2 A#2 A#2 F2 F2 A#2 A#2 F2 F2 G#2 G#2 D#3 D#3 G#2 G#2 D#3 D#3 G2 G2 D3 D3 G2 G2 B2 B2',
    drums: DRUM_FAST,
  },
  battle_boss: {
    bpm: 168,
    lead: 'D5 F5 A5 D6 C#6 A5 E5 C#5 D5 F5 A5 D6 F6 E6 D6 C#6 A#5 A5 G5 F5 E5 F5 G5 A5 A#5 - A5 - G5 - E5 -',
    bass: 'D2 D3 D2 D3 A1 A2 A1 A2 D2 D3 D2 D3 D2 D3 C#3 A2 A#1 A#2 A#1 A#2 C2 C3 C2 C3 G1 G2 G1 G2 A1 A2 A1 A2',
    drums: 'k h s h k k s h k h s h k k s s',
  },
  league: {
    bpm: 120,
    lead: 'A#4 - D5 F5 A#5 - - - A5 - G5 F5 G5 - - - D#5 - G5 A#5 C6 - A#5 A5 A#5 - F5 - D5 - - .',
    bass: 'A#2 . F3 . A#2 . F3 . F2 . C3 . D#3 . A#2 . D#2 . A#2 . F2 . C3 . A#2 . F3 . A#2 . . .',
    drums: 'k . s . k k s . k . s . k k s s',
  },
  sky: {
    bpm: 88, wave: 'triangle',
    lead: 'B5 - - E6 - - G#6 - F#6 - - E6 - - B5 - C#6 - - E6 - - A6 - G#6 - - F#6 - - E6 -',
    bass: 'E3 - - - B2 - - - C#3 - - - G#2 - - - A2 - - - E3 - - - B2 - - - B2 - - -',
  },
};

const JINGLES: Record<string, { bpm: number; notes: string; wave?: OscillatorType }> = {
  win: { bpm: 220, notes: 'C5 E5 G5 C6 - - G5 C6 - - - -' },
  lose: { bpm: 140, notes: 'G4 F4 E4 D4 C4 - - -', wave: 'triangle' },
  heal: { bpm: 200, notes: 'C5 E5 G5 E5 C6 - - -' },
  levelup: { bpm: 260, notes: 'C5 E5 G5 C6 - -' },
  catch: { bpm: 220, notes: 'G5 B5 D6 G6 - D6 G6 - - -' },
  item: { bpm: 240, notes: 'E5 G5 C6 - - -' },
};

// ---------------------------------------------------------------------------

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(note: string) {
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const n = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}
const steps = (s: string) => s.trim().split(/\s+/);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noise: AudioBuffer | null = null;
let musicOn = true;
let sfxOn = true;
const MUSIC_VOL = 0.32;
const SFX_VOL = 0.6;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = musicOn ? MUSIC_VOL : 0;
  musicBus.connect(master);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = sfxOn ? SFX_VOL : 0;
  sfxBus.connect(master);
  noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

/** Browsers only allow sound after a tap or key press; call this from one. */
export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') void c.resume();
  if (pendingSong && !current) startSong(pendingSong);
}

/** Background music and sound effects (including jingles) can be switched separately. */
export function setAudioEnabled(music: boolean, effects: boolean) {
  musicOn = music;
  sfxOn = effects;
  if (!ctx) return;
  musicBus?.gain.setTargetAtTime(music ? MUSIC_VOL : 0, ctx.currentTime, 0.05);
  sfxBus?.gain.setTargetAtTime(effects ? SFX_VOL : 0, ctx.currentTime, 0.05);
}

function tone(bus: GainNode, f: number, t: number, dur: number, wave: OscillatorType, vol: number, slideTo?: number, vibrato = 0) {
  if (!ctx || !f) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  if (vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5.5;
    depth.gain.value = vibrato;
    lfo.connect(depth).connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.02);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.04));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function hit(bus: GainNode, kind: string, t: number, vol = 1) {
  if (!ctx || !noise) return;
  if (kind === 'k') {
    tone(bus, 120, t, 0.12, 'sine', 0.5 * vol, 40);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = kind === 'h' ? 'highpass' : 'bandpass';
  filter.frequency.value = kind === 'h' ? 7000 : 1800;
  const g = ctx.createGain();
  const dur = kind === 'h' ? 0.04 : 0.12;
  g.gain.setValueAtTime((kind === 'h' ? 0.12 : 0.3) * vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(bus);
  src.start(t);
  src.stop(t + dur);
}

// --- music sequencer ----------------------------------------------------------------

let current: string | null = null;
let pendingSong: string | null = null;
let timer: number | null = null;
let songGain: GainNode | null = null;

function startSong(id: string) {
  const c = ensure();
  if (!c || !musicBus) return;
  const song = SONGS[id];
  if (!song) return;
  current = id;
  pendingSong = id;
  const gain = c.createGain();
  gain.gain.value = 1;
  gain.connect(musicBus);
  songGain = gain;
  const lead = steps(song.lead);
  const bass = steps(song.bass);
  const drums = song.drums ? steps(song.drums) : [];
  const pad = song.pad ? steps(song.pad) : [];
  const stepDur = 60 / song.bpm / 2;
  const len = Math.max(lead.length, bass.length);
  let step = 0;
  let next = c.currentTime + 0.05;
  const noteLen = (arr: string[], i: number) => {
    let n = 1;
    while (arr[(i + n) % arr.length] === '-' && n < arr.length) n++;
    return n;
  };
  const tick = () => {
    if (!ctx || songGain !== gain) return;
    while (next < ctx.currentTime + 0.15) {
      const i = step % len;
      const l = lead[i % lead.length];
      if (l && l !== '-' && l !== '.') {
        const dur = stepDur * noteLen(lead, i % lead.length) * 0.92;
        tone(gain, freq(l), next, dur, song.wave ?? 'square', song.wave === 'sine' ? 0.22 : 0.16, undefined, song.vibrato ?? 0);
        if (song.echo) tone(gain, freq(l) * 1.006, next + stepDur * 3, dur, 'sine', 0.06, undefined, song.vibrato ?? 0);
      }
      const pd = pad.length ? pad[i % pad.length] : null;
      if (pd && pd !== '-' && pd !== '.') tone(gain, freq(pd), next, stepDur * noteLen(pad, i % pad.length) * 0.95, 'triangle', 0.09);
      const b = bass[i % bass.length];
      if (b && b !== '-' && b !== '.') tone(gain, freq(b), next, stepDur * noteLen(bass, i % bass.length) * 0.9, 'triangle', 0.3);
      if (drums.length) {
        const d = drums[i % drums.length];
        if (d && d !== '.') hit(gain, d, next, 0.8);
      }
      step++;
      next += stepDur;
    }
  };
  tick();
  timer = window.setInterval(tick, 40);
}

function stopSong(fade = 0.25) {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  if (songGain && ctx) {
    const g = songGain;
    g.gain.setTargetAtTime(0.0001, ctx.currentTime, fade / 3);
    window.setTimeout(() => g.disconnect(), fade * 1000 + 200);
  }
  songGain = null;
  current = null;
}

/** Switch the background music (no-op if it is already playing). */
export function playMusic(id: string | null) {
  if (id === current || (id === pendingSong && !ctx)) return;
  pendingSong = id;
  stopSong();
  if (id && ctx && ctx.state !== 'closed') startSong(id);
}

export const currentMusic = () => current;

// --- jingles and sound effects --------------------------------------------------------

let jingleUntil = 0;

/** A short tune; the background music ducks while it plays. */
export function jingle(id: string) {
  const c = ensure();
  const j = JINGLES[id];
  if (!c || !sfxBus || !j) return;
  const sd = 60 / j.bpm;
  const notes = steps(j.notes);
  let t = c.currentTime + 0.02;
  notes.forEach((n, i) => {
    if (n !== '-' && n !== '.') {
      let len = 1;
      while (notes[i + len] === '-') len++;
      tone(sfxBus!, freq(n), t, sd * len * 0.95, j.wave ?? 'square', 0.22);
      tone(sfxBus!, freq(n) / 2, t, sd * len * 0.95, 'triangle', 0.18);
    }
    t += sd;
  });
  const total = sd * notes.length;
  if (musicBus && musicOn && sfxOn) {
    musicBus.gain.setTargetAtTime(0.06, c.currentTime, 0.03);
    jingleUntil = c.currentTime + total;
    window.setTimeout(() => {
      if (ctx && musicBus && musicOn && ctx.currentTime >= jingleUntil - 0.05) musicBus.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, 0.15);
    }, total * 1000 + 30);
  }
}

export function sfx(id: string) {
  const c = ensure();
  if (!c || !sfxBus) return;
  const t = c.currentTime + 0.005;
  const b = sfxBus;
  switch (id) {
    case 'thunder': {
      // distant rumble: low-passed noise swelling and fading
      if (!noise) return;
      for (let k = 0; k < 3; k++) {
        const src = c.createBufferSource();
        src.buffer = noise;
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 220 - k * 50;
        const g = c.createGain();
        const t0 = t + k * 0.35;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.5 - k * 0.12, t0 + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
        src.connect(f).connect(g).connect(b);
        src.start(t0);
        src.stop(t0 + 0.5);
      }
      tone(b, 60, t, 1.2, 'sine', 0.25, 35);
      return;
    }
    case 'cursor':
      tone(b, 1200, t, 0.03, 'square', 0.08);
      break;
    case 'select':
      tone(b, 880, t, 0.05, 'square', 0.12);
      tone(b, 1320, t + 0.05, 0.06, 'square', 0.12);
      break;
    case 'encounter':
      for (let i = 0; i < 6; i++) tone(b, 300 + i * 120, t + i * 0.05, 0.06, 'square', 0.14);
      break;
    case 'hit':
      hit(b, 's', t, 1.4);
      tone(b, 220, t, 0.1, 'square', 0.15, 90);
      break;
    case 'super':
      hit(b, 's', t, 1.8);
      tone(b, 330, t, 0.16, 'sawtooth', 0.18, 70);
      tone(b, 660, t + 0.06, 0.1, 'square', 0.1, 200);
      break;
    case 'weak':
      hit(b, 'h', t, 1.5);
      tone(b, 180, t, 0.08, 'triangle', 0.15, 120);
      break;
    case 'faint':
      tone(b, 600, t, 0.5, 'square', 0.14, 80);
      break;
    case 'ball':
      tone(b, 400, t, 0.25, 'triangle', 0.18, 1400);
      break;
    case 'shake':
      tone(b, 260, t, 0.06, 'square', 0.12);
      tone(b, 200, t + 0.07, 0.06, 'square', 0.12);
      break;
    case 'door':
      tone(b, 520, t, 0.05, 'square', 0.1);
      tone(b, 390, t + 0.05, 0.08, 'square', 0.1);
      break;
    case 'bump':
      tone(b, 90, t, 0.06, 'square', 0.12);
      break;
    case 'stat':
      for (let i = 0; i < 4; i++) tone(b, 500 + i * 160, t + i * 0.04, 0.05, 'triangle', 0.12);
      break;
  }
}
