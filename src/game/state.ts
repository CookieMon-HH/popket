import { fixExp, type Mon } from './monster';
import type { Dir } from './common';
import { RENAMED } from '../data/species';

/** How far each town's old layout moved when the towns were widened (layout 2). */
const TOWN_SHIFT: Record<string, [number, number]> = {
  town1: [7, 3], town2: [7, 3], town3: [7, 3], town4: [7, 3], town5: [7, 3], town6: [7, 3], town7: [7, 3], town8: [7, 3],
};

export interface GameState {
  name: string;
  map: string;
  x: number;
  y: number;
  dir: Dir;
  money: number;
  party: Mon[];
  box: Mon[];
  bag: Record<string, number>;
  flags: Record<string, boolean>;
  seen: string[];
  caught: string[];
  lastHeal: { map: string; x: number; y: number };
  /** Town layout version (2 = towns widened; older saves get positions shifted). */
  townLayout?: number;
  frames: number;
  /** Set while inside the safari: frames of time left (runs during battles too). */
  safari?: { left: number; balls?: number };
  /** Wall-clock time of the last save (ms), used to pick the newer of local and cloud saves. */
  savedAtMs?: number;
  /** Number of league tournament wins. */
  leagueWins?: number;
}

const SAVE_KEY = 'popket-save-v1';

function fresh(name: string): GameState {
  return {
    name,
    map: 'home',
    x: 2,
    y: 5,
    dir: 'down',
    money: 3000,
    party: [],
    box: [],
    bag: { potion: 2 },
    flags: {},
    seen: [],
    caught: [],
    lastHeal: { map: 'home', x: 6, y: 3 },
    frames: 0,
    townLayout: 2,
  };
}

export const game: GameState = fresh('하루');

/** Non-persistent runtime flags. */
export const runtime = {
  busy: 0,
  /** game.frames at the last save/load. */
  savedAt: 0,
  /** True once this session's game is tied to the save slot (loaded or saved). */
  ownsSave: false,
  /** Server save was already offered this session. */
  cloudAsked: false,
  /** League tournament: current round (0 = 16강 … 3 = 결승), -1 when not playing. */
  tourneyRound: -1,
};

export function newGame(name: string) {
  runtime.ownsSave = false;
  runtime.savedAt = 0;
  for (const k of Object.keys(game)) delete (game as unknown as Record<string, unknown>)[k];
  Object.assign(game, fresh(name));
}

export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

export function saveGame(): boolean {
  try {
    game.savedAtMs = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    runtime.savedAt = game.frames;
    runtime.ownsSave = true;
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as GameState;
    // Migrate species that were replaced in later versions.
    const fix = (id: string) => RENAMED[id] ?? id;
    for (const m of [...(data.party ?? []), ...(data.box ?? [])]) {
      m.species = fix(m.species);
      fixExp(m);
    }
    data.seen = [...new Set((data.seen ?? []).map(fix))];
    data.caught = [...new Set((data.caught ?? []).map(fix))];
    // Towns were widened: saves standing in a town keep their spot in the new layout.
    if ((data.townLayout ?? 1) < 2) {
      const sh = TOWN_SHIFT[data.map];
      if (sh) { data.x += sh[0]; data.y += sh[1]; }
      const lh = TOWN_SHIFT[data.lastHeal?.map];
      if (lh) { data.lastHeal.x += lh[0]; data.lastHeal.y += lh[1]; }
      data.townLayout = 2;
    }
    newGame(data.name);
    Object.assign(game, data);
    runtime.savedAt = game.frames;
    runtime.ownsSave = true;
    return true;
  } catch {
    return false;
  }
}

/** savedAtMs of the save stored in this browser, or 0. */
export function localSaveTime(): number {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? ((JSON.parse(raw) as GameState).savedAtMs ?? 1) : 0;
  } catch {
    return 0;
  }
}

/** Replace this browser's save with one downloaded from the cloud. */
export function writeLocalSave(data: unknown): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export const badgeCount = () => [1, 2, 3, 4, 5, 6, 7].filter((n) => game.flags['badge' + n]).length;

export const itemCount = (id: string) => game.bag[id] ?? 0;

export function addItem(id: string, n = 1) {
  game.bag[id] = Math.min(99, itemCount(id) + n);
}

export function removeItem(id: string, n = 1) {
  game.bag[id] = Math.max(0, itemCount(id) - n);
  if (game.bag[id] === 0) delete game.bag[id];
}

export function markSeen(id: string) {
  if (!game.seen.includes(id)) game.seen.push(id);
}

/** Returns true when this is a new dex entry. */
export function markCaught(id: string): boolean {
  markSeen(id);
  if (game.caught.includes(id)) return false;
  game.caught.push(id);
  return true;
}

export function addMon(m: Mon): 'party' | 'box' {
  if (game.party.length < 6) {
    game.party.push(m);
    return 'party';
  }
  game.box.push(m);
  return 'box';
}

/** True once every listed trainer has been beaten (bosses wait for their grunts). */
export const beatenAll = (ids?: string[]) => (ids ?? []).every((id) => game.flags['tr_' + id]);
