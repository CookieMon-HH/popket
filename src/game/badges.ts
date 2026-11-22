import { Pix } from '../engine/pix';

// ---------------------------------------------------------------------------
// Gym badges, drawn as small metal pins for the trainer card's badge case.

export interface BadgeDef { flag: string; name: string; leader: string; town: string }

export const BADGES: BadgeDef[] = [
  { flag: 'badge1', name: '바위배지', leader: '단단', town: '들꽃마을' },
  { flag: 'badge2', name: '물결배지', leader: '마루', town: '물안개마을' },
  { flag: 'badge3', name: '번개배지', leader: '하람', town: '별빛시' },
  { flag: 'badge4', name: '달빛배지', leader: '달님', town: '파도항구' },
  { flag: 'badge5', name: '화염배지', leader: '화련', town: '불꽃마을' },
  { flag: 'badge6', name: '얼음배지', leader: '서리', town: '서리마을' },
  { flag: 'badge7', name: '용린배지', leader: '용하', town: '용의 마을' },
];

const S = 20;
const C = 9.5;
type Mask = (x: number, y: number) => boolean;
const dx = (x: number) => x + 0.5 - C - 0.5;
const dy = (y: number) => y + 0.5 - C - 0.5;

const MASKS: Mask[] = [
  // 바위: octagon
  (x, y) => Math.abs(dx(x)) <= 8 && Math.abs(dy(y)) <= 8 && Math.abs(dx(x)) + Math.abs(dy(y)) <= 11.5,
  // 물결: water drop (round bottom, pointed top)
  (x, y) => { const a = dx(x), b = dy(y) - 3; return b >= 0 ? a * a + b * b <= 36 : Math.abs(a) <= 6 * (1 + b / 12) && b >= -12 + 3; },
  // 번개: rhombus
  (x, y) => Math.abs(dx(x)) / 8.5 + Math.abs(dy(y)) / 9.5 <= 1,
  // 달빛: circle
  (x, y) => dx(x) ** 2 + dy(y) ** 2 <= 8.6 ** 2,
  // 화염: flame (round bottom, three tongues on top)
  (x, y) => {
    const a = dx(x), b = dy(y);
    if (b >= 1) return a * a + (b - 1) ** 2 <= 7.5 ** 2;
    const tongue = [[-4.5, -5], [0, -9.5], [4.5, -5.5]].some(([tx, ty]) => Math.abs(a - tx * ((b - 1) / (ty - 1))) <= 3.2 * (1 - (b - 1) / (ty - 1)) + 0.4 && b >= ty);
    return tongue || (Math.abs(a) <= 7 && b >= -1);
  },
  // 얼음: hexagon
  (x, y) => { const a = Math.abs(dx(x)), b = Math.abs(dy(y)); return b <= 8.5 && a <= 8.8 - b * 0.0 && a * 0.5 + b * 0.866 <= 8.6 && a <= 8.2; },
  // 용린: shield / scale (rounded top, pointed bottom)
  (x, y) => { const a = dx(x), b = dy(y); return b <= 1 ? a * a + (b - 1) ** 2 * 0.8 <= 64 && b >= -8.5 : Math.abs(a) <= 8 * (1 - (b - 1) / 8.5); },
];

const METAL: [string, string, string, string][] = [
  ['#4a3220', '#9a6a3a', '#c8945a', '#f0d098'], // bronze
  ['#16386a', '#2e6ac0', '#4a9ae8', '#c0e8ff'], // water blue
  ['#6a4e08', '#c89a10', '#f0c828', '#fff6b0'], // gold
  ['#2e2458', '#6a5ab0', '#9a8ad8', '#eee8ff'], // moon silver-violet
  ['#6a1a08', '#c03a18', '#ec6a2a', '#ffd090'], // flame
  ['#1a5068', '#3a9ab8', '#68cce0', '#e8fcff'], // ice
  ['#24186a', '#4a36b0', '#7a5ce0', '#d8ccff'], // dragon violet
];

function emblem(p: Pix, i: number) {
  const W = '#ffffff';
  switch (i) {
    case 0: // stacked rocks
      p.ell(9, 11, 4, 3, '#6a625a'); p.ell(9, 10.5, 3.2, 2.2, '#9a928a'); p.ell(9, 7, 2.6, 2, '#7a726a'); p.ell(8.6, 6.6, 1.6, 1.1, '#b8b0a8');
      break;
    case 1: // wave crest
      p.line(5, 13, 8, 10, W); p.line(8, 10, 11, 12, W); p.line(11, 12, 14, 9, W); p.set(13, 8, W);
      p.ell(7, 15, 1, 0.8, '#a8d8ff');
      break;
    case 2: // lightning bolt
      for (const [x, y] of [[11, 3], [10, 4], [9, 5], [8, 6], [7, 7], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [10, 9], [9, 10], [8, 11], [7, 12], [6, 13], [6, 14]]) { p.set(x, y, '#5a3a08'); p.set(x + 1, y, '#5a3a08'); }
      break;
    case 3: // golden crescent and a star
      p.ell(9, 9.5, 5, 5, '#f8d860'); p.ell(11, 8, 4.4, 4.4, '#9a8ad8');
      for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) if ((x - 11.5) ** 2 + (y - 8.5) ** 2 <= 4.4 ** 2 && p.get(x, y) === '#f8d860') p.set(x, y, '#9a8ad8');
      p.set(13, 13, W); p.set(14, 12, '#fff6b0');
      break;
    case 4: // inner flame
      p.ell(9.5, 12, 3.2, 3.2, '#ffd060'); p.ell(9.5, 9.5, 1.8, 3, '#ffd060'); p.ell(9.5, 12.5, 1.6, 1.8, '#fff6c0');
      break;
    case 5: // snowflake
      for (const [ax, ay] of [[0, -6], [5.2, -3], [5.2, 3], [0, 6], [-5.2, 3], [-5.2, -3]]) p.line(9.5, 9.5, 9.5 + ax, 9.5 + ay, W);
      p.ell(9.5, 9.5, 1.2, 1.2, '#a8e8f8');
      break;
    case 6: // three overlapping scales
      for (const [x, y] of [[6.5, 8], [12.5, 8], [9.5, 12]]) { p.ell(x, y, 3, 3, '#3ad0b8'); p.ell(x, y - 0.6, 2, 2, '#8af0e0'); p.set(Math.round(x) - 1, Math.round(y) - 2, W); }
      break;
  }
}

const cache = new Map<string, HTMLCanvasElement>();

/** A badge pin. `earned` false draws the empty, engraved slot. */
export function badgeSprite(i: number, earned: boolean): HTMLCanvasElement {
  const key = i + (earned ? 'y' : 'n');
  let c = cache.get(key);
  if (c) return c;
  const p = new Pix(S, S);
  const m = MASKS[i];
  const [o, d, b, h] = METAL[i];
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < S && y < S && m(x, y);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (!earned) { p.set(x, y, edge ? '#1a1626' : '#2e2840'); continue; }
      if (edge) { p.set(x, y, o); continue; }
      // bevel: light from the top-left
      const lit = !inside(x - 2, y - 2) ? h : !inside(x + 2, y + 2) ? d : b;
      p.set(x, y, lit);
    }
  }
  if (earned) {
    emblem(p, i);
    p.set(5, 4, '#ffffff'); p.set(6, 4, '#ffffff'); p.set(5, 5, '#ffffff');
  }
  c = p.toCanvas();
  cache.set(key, c);
  return c;
}
