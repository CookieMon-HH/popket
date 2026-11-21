import { SPECIES } from '../data/species';
import type { TrainerDef } from './maps';

// ---------------------------------------------------------------------------
// Which background music plays where.

const BY_MAP: Record<string, string> = {
  home: 'town_calm', lab: 'town_calm', town1: 'town_calm', town2: 'town_calm',
  town3: 'town_water', town5: 'town_water', town4: 'city', plateau: 'city',
  town6: 'town_fire', town7: 'town_snow', town8: 'town_dragon',
  league: 'league', skyroad: 'sky', summit: 'sky', pastel: 'town_calm',
};

export function musicForMap(id: string): string {
  if (BY_MAP[id]) return BY_MAP[id];
  if (id.startsWith('ship')) return 'ship';
  if (id.startsWith('volcano')) return 'volcano';
  if (id.startsWith('forest')) return 'forest';
  if (id.startsWith('icecave')) return 'icecave';
  if (id.startsWith('den')) return 'den';
  if (id.startsWith('safari')) return 'safari';
  if (id.startsWith('center')) return 'center';
  if (id.startsWith('shop')) return BY_MAP['town' + id.replace(/\D/g, '')] ?? 'town_calm';
  if (id.startsWith('gym') || id === 'dojo') return 'gym';
  if (['cave', 'peak'].includes(id)) return 'cave';
  return 'route';
}

const BOSS_CLASSES = ['관장', '두목', '간부', '챔피언', '수호자', '라이벌', '잔당', '선장', '태초'];

export function musicForBattle(o: { kind: 'wild' | 'trainer'; enemies: { species: string }[]; trainer?: { cls: string } }): string {
  if (o.kind === 'wild') {
    const sp = SPECIES[o.enemies[0].species];
    return sp.legend || sp.special ? 'battle_boss' : 'battle_wild';
  }
  return BOSS_CLASSES.some((c) => o.trainer?.cls.includes(c)) ? 'battle_boss' : 'battle_trainer';
}

export type { TrainerDef };
