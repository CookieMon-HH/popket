import { SPECIES, type Stats } from '../data/species';
import { MOVES, type Status } from '../data/moves';
import { rand } from './common';

export interface MoveSlot {
  id: string;
  pp: number;
}

export interface Mon {
  uid: number;
  species: string;
  level: number;
  exp: number;
  hp: number;
  ivs: Stats;
  moves: MoveSlot[];
  status: Status | null;
  sleep: number;
  pendingEvo?: boolean;
}

let uidCounter = Date.now() % 100000;

export function monName(m: Mon) {
  return SPECIES[m.species].name;
}

/** Total experience needed for a level. Legendary and special monsters grow 1.5x slower. */
export function expFor(level: number, species?: string) {
  if (level <= 1) return 0;
  const sp = species ? SPECIES[species] : undefined;
  const slow = sp && (sp.legend || sp.special) ? 1.5 : 1;
  return Math.floor(level * level * level * slow);
}

export function calcStats(m: Mon): Stats {
  const b = SPECIES[m.species].base;
  const s = (base: number, iv: number) => Math.floor(((base * 2 + iv) * m.level) / 100) + 5;
  return {
    hp: Math.floor(((b.hp * 2 + m.ivs.hp) * m.level) / 100) + m.level + 10,
    atk: s(b.atk, m.ivs.atk),
    def: s(b.def, m.ivs.def),
    spe: s(b.spe, m.ivs.spe),
  };
}

export const maxHp = (m: Mon) => calcStats(m).hp;

export function movesAtLevel(species: string, level: number): string[] {
  const learned: string[] = [];
  for (const [lv, id] of SPECIES[species].learnset) {
    if (lv <= level && !learned.includes(id)) learned.push(id);
  }
  return learned.slice(-4);
}

export function createMon(species: string, level: number): Mon {
  const m: Mon = {
    uid: ++uidCounter,
    species,
    level,
    exp: expFor(level, species),
    hp: 1,
    ivs: { hp: rand(0, 15), atk: rand(0, 15), def: rand(0, 15), spe: rand(0, 15) },
    moves: movesAtLevel(species, level).map((id) => ({ id, pp: MOVES[id].pp })),
    status: null,
    sleep: 0,
  };
  m.hp = maxHp(m);
  return m;
}

export function healMon(m: Mon) {
  m.hp = maxHp(m);
  m.status = null;
  m.sleep = 0;
  for (const s of m.moves) s.pp = MOVES[s.id].pp;
}

export function expRatio(m: Mon) {
  if (m.level >= 100) return 1;
  const a = expFor(m.level, m.species);
  const b = expFor(m.level + 1, m.species);
  return Math.max(0, Math.min(1, (m.exp - a) / (b - a)));
}
