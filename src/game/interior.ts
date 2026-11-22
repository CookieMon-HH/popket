import type { Pix } from '../engine/pix';

// ---------------------------------------------------------------------------
// Interior tiles for the town buildings. Every building has its own wall and floor
// material plus furniture that tells what the place is: a forge has a furnace, an
// anvil and a quench tub; a tea house has low tables and cushions, and so on.
//
// Walls and floors are full tiles. Furniture is drawn transparent over the floor
// found next to it (like the town's DECO tiles). Wall-mounted decorations carry
// their own wall, so each one belongs to the wall of the building it hangs in.

/** Floors (walkable grounds). */
export const IN_GROUND = 'ㅊㅋㅌㅍㅎㅃㅆㅉ';
/** Walls (solid, full tiles). */
const WALLS = 'ㄱㄴㄷㅁㅂㅅㅇㅈㄲㄸ';
/** Wall-mounted decorations (solid, full tiles with their own wall). */
const WALL_DECO = 'ㅓㅖㅗㅘㅛㅞㅠㅢㄵㄻㄼㄾㅀㅬㅯㅱㅵㅸㅻㅾㆀㆁ';
/** Furniture drawn over the neighbouring floor. */
const FURNITURE = 'ㅏㅐㅑㅒㅔㅕㅙㅚㅜㅝㅟㅡㅣㄳㄶㄽㄿㅥㅦㅧㅨㅩㅪㅫㅭㅮㅰㅲㅳㅴㅶㅺㅼㅽㅿㆂㆃㆆㆈ';
/** Rugs and cushions: furniture that can be walked on. */
const SOFT = 'ㄺㅹㆅㆉ';

export const IN_DECO = new Set([...FURNITURE, ...SOFT]);
export const IN_SOLID = [...WALLS, ...WALL_DECO, ...FURNITURE];
export const IN_ANIM = new Set([...'ㅏㅐㄾㅮㅭ']);

// ── walls ───────────────────────────────────────────────────────────────────
type Fill = (p: Pix) => void;

const logWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#b07a44');
  for (const y of [0, 4, 8]) { p.rect(0, y + 3, 16, 1, '#7a5028'); p.rect(0, y, 16, 1, '#c8925a'); }
  p.set(4, 2, '#7a5028'); p.set(11, 6, '#7a5028'); p.set(7, 10, '#7a5028');
  p.rect(0, 12, 16, 4, '#6a4220'); p.rect(0, 12, 16, 1, '#8a5a30');
};
const stoneWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#4e4642');
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 4 : 0;
    for (let x = -off; x < 16; x += 8) { p.rect(x + 1, r * 4, 6, 3, r % 2 ? '#706660' : '#7a706a'); p.rect(x + 1, r * 4, 6, 1, '#8e847c'); }
  }
  p.rect(0, 13, 16, 3, '#2e2826');
  p.set(5, 2, '#3a3230'); p.set(12, 9, '#3a3230');
};
const glassWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#eaf6f2');
  p.rect(1, 1, 6, 10, '#a8e0ea'); p.rect(9, 1, 6, 10, '#a8e0ea');
  p.line(2, 8, 5, 2, '#e4fbff'); p.line(10, 8, 13, 2, '#e4fbff');
  p.rect(0, 11, 16, 5, '#5a9a6a'); p.rect(0, 11, 16, 1, '#7ac08a');
};
const hanjiWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#f6eed8');
  p.rect(0, 0, 16, 1, '#7a4a24'); p.rect(0, 0, 1, 12, '#7a4a24'); p.rect(15, 0, 1, 12, '#7a4a24');
  p.rect(0, 6, 16, 1, '#9a6a3a');
  p.rect(0, 12, 16, 4, '#6a3e1e'); p.rect(0, 12, 16, 1, '#8a5a30');
};
const nightWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#232a56');
  for (const [x, y] of [[2, 2], [9, 1], [13, 5], [5, 7], [11, 9], [1, 10]]) p.set(x, y, '#e8ecff');
  p.set(7, 4, '#ffe890');
  p.rect(0, 12, 16, 4, '#141832'); p.rect(0, 12, 16, 1, '#3a4280');
};
const tileWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#f2f6f8');
  for (let i = 0; i < 16; i += 4) { p.rect(i, 0, 1, 11, '#cad8e0'); p.rect(0, i, 16, 1, '#cad8e0'); }
  p.rect(0, 11, 16, 5, '#5aa8c4'); p.rect(0, 11, 16, 1, '#8ad0e4');
};
const seaWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#5a88b2');
  for (const x of [3, 7, 11, 15]) p.rect(x, 0, 1, 12, '#3e6690');
  p.rect(0, 0, 16, 1, '#f4f8fc');
  p.rect(0, 12, 16, 4, '#2e4a6a'); p.rect(0, 12, 16, 1, '#f4f8fc');
};
const iceWall: Fill = (p) => {
  p.rect(0, 0, 16, 16, '#cfe8f4');
  for (let r = 0; r < 3; r++) {
    const off = r % 2 ? 4 : 0;
    p.rect(0, r * 4 + 3, 16, 1, '#a6cce0');
    for (let x = off; x < 16; x += 8) p.rect(x, r * 4, 1, 3, '#a6cce0');
  }
  p.line(10, 1, 13, 4, '#ffffff');
  p.rect(0, 12, 16, 4, '#8ab4cc'); p.rect(0, 12, 16, 1, '#b8dcec');
};
const plasterWall = (top: string, wain: string, trim: string): Fill => (p) => {
  p.rect(0, 0, 16, 16, top);
  p.rect(0, 9, 16, 7, wain); p.rect(0, 9, 16, 1, trim);
  for (const x of [3, 8, 13]) p.rect(x, 10, 1, 6, trim);
};
const creamWall = plasterWall('#f6e6cc', '#b47e4e', '#d8a676');
const pinkWall = plasterWall('#f8dce4', '#6aa86a', '#8ccc8a');

const WALL_OF: Record<string, Fill> = {
  'ㄱ': logWall, 'ㄴ': stoneWall, 'ㄷ': glassWall, 'ㅁ': hanjiWall, 'ㅂ': nightWall,
  'ㅅ': tileWall, 'ㅇ': seaWall, 'ㅈ': iceWall, 'ㄲ': creamWall, 'ㄸ': pinkWall,
};

// ── floors ──────────────────────────────────────────────────────────────────
const FLOOR_OF: Record<string, Fill> = {
  'ㅊ': (p) => { // flagstones
    p.rect(0, 0, 16, 16, '#5e5652');
    for (const [x, y, w, h] of [[0, 0, 9, 7], [10, 0, 6, 5], [10, 6, 6, 6], [0, 8, 5, 8], [6, 8, 4, 8], [11, 13, 5, 3]]) {
      p.rect(x, y, w - 1, h - 1, '#8a827a'); p.rect(x, y, w - 1, 1, '#9e968e');
    }
  },
  'ㅋ': (p) => { // terracotta tiles
    p.rect(0, 0, 16, 16, '#b8683e');
    for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) { p.rect(x, y, 7, 7, '#d0804e'); p.rect(x, y, 7, 1, '#e0986a'); }
  },
  'ㅌ': (p) => { // ondol: oiled paper floor
    p.rect(0, 0, 16, 16, '#e8c470');
    p.rect(0, 7, 16, 1, '#c8a24c'); p.rect(7, 0, 1, 7, '#c8a24c'); p.rect(12, 8, 1, 8, '#c8a24c');
    p.line(1, 3, 4, 1, '#f4d890'); p.line(9, 12, 12, 10, '#f4d890');
  },
  'ㅍ': (p) => { // observatory floor: deep blue with faint stars
    p.rect(0, 0, 16, 16, '#2c3266');
    p.rect(0, 15, 16, 1, '#232858'); p.rect(15, 0, 1, 16, '#232858');
    for (const [x, y] of [[3, 4], [11, 2], [8, 10], [2, 13], [13, 12]]) p.set(x, y, '#8a96e0');
  },
  'ㅎ': (p) => { // bath tiles
    p.rect(0, 0, 16, 16, '#e2ecf0');
    for (let i = 0; i < 16; i += 4) { p.rect(i, 0, 1, 16, '#c0d2da'); p.rect(0, i, 16, 1, '#c0d2da'); }
  },
  'ㅃ': (p) => { // dark sea-worn planks
    p.rect(0, 0, 16, 16, '#8e6c4c');
    for (const y of [3, 7, 11, 15]) p.rect(0, y, 16, 1, '#6a4e34');
    for (const [x, y] of [[5, 0], [12, 4], [3, 8], [10, 12]]) p.rect(x, y, 1, 3, '#6a4e34');
    p.set(8, 1, '#a88a68'); p.set(2, 9, '#a88a68');
  },
  'ㅆ': (p) => { // restaurant checker
    p.rect(0, 0, 16, 16, '#f2eee4');
    p.rect(0, 0, 8, 8, '#4a78b0'); p.rect(8, 8, 8, 8, '#4a78b0');
  },
  'ㅉ': (p) => { // frosty pale boards
    p.rect(0, 0, 16, 16, '#dbe9f2');
    for (const y of [3, 7, 11, 15]) p.rect(0, y, 16, 1, '#b4cddd');
    for (const [x, y] of [[6, 0], [12, 4], [2, 8], [9, 12]]) p.rect(x, y, 1, 3, '#b4cddd');
  },
};

// ── helpers ─────────────────────────────────────────────────────────────────
const shadow = (p: Pix, y = 14, x = 2, w = 12) => p.rect(x, y, w, 2, 'rgba(0,0,0,0.18)');
const table = (p: Pix, top: string, side: string, y = 5) => {
  shadow(p);
  p.rect(1, y + 7, 2, 14 - y - 7, side); p.rect(13, y + 7, 2, 14 - y - 7, side);
  p.rect(0, y, 16, 7, top); p.rect(0, y + 6, 16, 1, side); p.rect(0, y, 16, 1, '#ffffff40');
};

/** Draw an interior tile; returns false if `ch` is not one. */
export function drawInteriorTile(ch: string, anim: number, p: Pix): boolean {
  const wallFill = WALL_OF[ch];
  if (wallFill) { wallFill(p); return true; }
  const floorFill = FLOOR_OF[ch];
  if (floorFill) { floorFill(p); return true; }
  switch (ch) {
    // ── 대장간 ───────────────────────────────────────────────
    case 'ㅏ': case 'ㅐ': { // brick furnace, two tiles wide, with a roaring mouth
      const L = ch === 'ㅏ';
      p.rect(0, 0, 16, 15, '#6a3a2a');
      for (let y = 0; y < 15; y += 3) for (let x = (y / 3) % 2 ? 0 : 3; x < 16; x += 6) p.rect(x, y, 5, 2, '#8a4a34');
      p.rect(0, 0, 16, 2, '#3a2420');
      const mx = L ? 7 : 0;
      p.rect(mx, 6, 9, 8, '#2a1410');
      p.rect(mx + (L ? 1 : 0), 8, 8, 6, anim ? '#ff9a2a' : '#ff7a1a');
      p.rect(mx + (L ? 2 : 1), 10, 6, 4, anim ? '#ffe070' : '#ffc040');
      p.set(mx + (L ? 4 : 3), 8 - anim, '#ffd060');
      p.rect(0, 14, 16, 2, '#3a2420');
      return true;
    }
    case 'ㅑ': // anvil with a glowing ingot
      shadow(p);
      p.rect(5, 10, 6, 4, '#3a3e46'); p.rect(3, 13, 10, 2, '#2a2e34');
      p.rect(1, 5, 14, 5, '#5a606a'); p.rect(1, 5, 14, 1, '#8a909a'); p.rect(0, 6, 3, 2, '#5a606a');
      p.rect(6, 3, 5, 2, '#ff6a2a'); p.rect(7, 3, 3, 1, '#ffd060');
      return true;
    case 'ㅒ': // quench tub
      shadow(p);
      p.rect(2, 4, 12, 11, '#7a5230'); p.rect(2, 7, 12, 1, '#4a4e56'); p.rect(2, 12, 12, 1, '#4a4e56');
      p.ell(8, 4, 6, 2, '#2a5a7a'); p.rect(5, 3, 3, 1, '#8ac0e0');
      p.set(10, 2, '#e8eef4'); p.set(11, 1, '#e8eef4');
      return true;
    case 'ㅔ': // coal heap
      p.ell(8, 11, 7, 4.5, '#1e1c1e');
      for (const [x, y] of [[4, 10], [9, 8], [12, 12], [6, 13], [8, 11]]) { p.rect(x, y, 2, 2, '#3a383c'); p.set(x, y, '#5a585e'); }
      return true;
    case 'ㅕ': // grindstone wheel
      shadow(p);
      p.rect(2, 11, 12, 3, '#6a4a2a');
      p.ell(8, 7, 5.5, 5.5, '#8a8680'); p.ell(8, 7, 4, 4, '#a8a49e'); p.ell(8, 7, 1.2, 1.2, '#4a4642');
      p.rect(13, 6, 2, 2, '#4a3220');
      return true;
    case 'ㅓ': // tool rack on the stone wall: hammer, tongs, file
      stoneWall(p);
      p.rect(1, 2, 14, 2, '#6a4220');
      p.rect(3, 4, 1, 8, '#7a5028'); p.rect(1, 4, 5, 3, '#4a4e56');
      p.line(8, 4, 7, 11, '#4a4e56'); p.line(9, 4, 10, 11, '#4a4e56');
      p.rect(12, 4, 2, 7, '#6a6e76'); p.rect(12, 9, 2, 3, '#7a5028');
      return true;
    case 'ㅖ': // finished blades on display
      stoneWall(p);
      for (const x of [3, 8, 12]) { p.rect(x, 2, 2, 7, '#c8d0dc'); p.set(x, 2, '#ffffff'); p.rect(x - 1, 9, 4, 1, '#b8902a'); p.rect(x, 10, 2, 2, '#5a3a1e'); }
      return true;

    // ── 어부·등대 (sea) ──────────────────────────────────────
    case 'ㅗ': // fishing net hung on the wall, with a float
      seaWall(p);
      for (let i = 0; i < 14; i += 3) { p.line(1 + i, 1, 1 + i + 3, 11, '#d8c898'); p.line(15 - i, 1, 12 - i, 11, '#d8c898'); }
      p.ell(12, 9, 2, 2, '#e85a3a'); p.set(11, 8, '#ffb0a0');
      return true;
    case 'ㅘ': // rods in a wall rack
      seaWall(p);
      p.rect(1, 9, 14, 2, '#6a4220');
      for (const [x, c] of [[3, '#e8d090'], [7, '#d0a060'], [11, '#e8d090']] as [number, string][]) { p.line(x, 9, x + 2, 0, c); p.rect(x, 7, 2, 2, '#3a3e46'); }
      return true;
    case 'ㅛ': // ship's wheel
      seaWall(p);
      p.ell(8, 6, 5, 5, '#7a4a24'); p.ell(8, 6, 3.5, 3.5, '#5a88b2'); p.ell(8, 6, 1.5, 1.5, '#b88a50');
      for (const [dx, dy] of [[0, -6], [0, 6], [-6, 0], [6, 0], [-4, -4], [4, 4], [-4, 4], [4, -4]]) p.rect(8 + dx - (dx > 0 ? 1 : 0), 6 + dy - (dy > 0 ? 1 : 0), 1, 1, '#b88a50');
      return true;
    case 'ㅞ': // sea chart pinned to the wall
      seaWall(p);
      p.rect(1, 1, 14, 10, '#efe2bc'); p.rect(1, 1, 14, 1, '#d4c294');
      p.ell(5, 6, 3, 2, '#a8c890'); p.line(8, 3, 13, 8, '#c84a3a'); p.set(13, 8, '#c84a3a'); p.set(12, 3, '#3a5a8a');
      return true;
    case 'ㅙ': // barrel
      shadow(p);
      p.ell(8, 9, 5.5, 6, '#9a6232'); p.rect(3, 6, 10, 1, '#4a4e56'); p.rect(3, 11, 10, 1, '#4a4e56');
      p.ell(8, 4, 5, 1.8, '#b47a44'); p.rect(6, 7, 1, 5, '#b47a44');
      return true;
    case 'ㅚ': // fish drying on a rack
      p.rect(1, 3, 1, 12, '#6a4220'); p.rect(14, 3, 1, 12, '#6a4220'); p.rect(1, 3, 14, 1, '#7a5028');
      for (const x of [3, 7, 11]) { p.rect(x + 1, 4, 1, 2, '#d8c898'); p.ell(x + 1.5, 9, 1.6, 3.5, '#9ab0c0'); p.set(x + 1, 7, '#2a2a2a'); p.rect(x, 12, 3, 1, '#7a90a0'); }
      return true;
    case 'ㅜ': // oil lantern on a stand
      shadow(p, 14, 5, 6);
      p.rect(7, 9, 2, 5, '#3a3e46'); p.rect(5, 13, 6, 2, '#3a3e46');
      p.rect(5, 2, 6, 7, '#2a2e34'); p.rect(6, 3, 4, 5, anim ? '#ffe070' : '#ffd040'); p.rect(7, 4, 2, 3, '#fff8c0');
      p.rect(6, 1, 4, 1, '#2a2e34');
      return true;
    case 'ㅝ': // anchor leaning on the floor
      p.rect(7, 2, 2, 11, '#4a4e56'); p.ell(8, 2, 2, 1.5, '#4a4e56'); p.rect(5, 4, 6, 1, '#4a4e56');
      p.line(3, 10, 7, 13, '#4a4e56'); p.line(13, 10, 9, 13, '#4a4e56'); p.rect(2, 9, 2, 2, '#4a4e56'); p.rect(12, 9, 2, 2, '#4a4e56');
      p.line(9, 3, 12, 8, '#d8c898');
      return true;

    // ── 천문대 ───────────────────────────────────────────────
    case 'ㅟ': // big brass telescope on a tripod
      shadow(p);
      p.line(8, 9, 3, 15, '#5a3a1e'); p.line(8, 9, 13, 15, '#5a3a1e'); p.rect(8, 9, 1, 6, '#5a3a1e');
      for (let i = 0; i < 9; i++) p.rect(3 + i, 9 - i, 3, 3, i < 2 ? '#8a6a2a' : '#d8a840');
      p.rect(12, 0, 3, 3, '#f0d070'); p.rect(4, 8, 2, 2, '#4a3a1a');
      return true;
    case 'ㅠ': // constellation chart on the night wall
      nightWall(p);
      p.rect(1, 1, 14, 10, '#1a3a6a'); p.rect(1, 1, 14, 1, '#d8b858');
      for (const [a, b, c, d] of [[3, 8, 6, 4], [6, 4, 10, 6], [10, 6, 13, 3]]) p.line(a, b, c, d, '#6a8ad0');
      for (const [x, y] of [[3, 8], [6, 4], [10, 6], [13, 3]]) p.set(x, y, '#ffffff');
      return true;
    case 'ㅡ': // globe on a stand
      shadow(p, 14, 4, 8);
      p.rect(7, 11, 2, 3, '#8a6a2a'); p.rect(5, 13, 6, 2, '#6a4a1a');
      p.ell(8, 6, 5, 5, '#4a88d0'); p.ell(6, 5, 2, 2.5, '#6ab060'); p.ell(10, 8, 1.6, 1.4, '#6ab060');
      p.line(3, 6, 8, 11, '#d8a840');
      return true;
    case 'ㆈ': // desk covered in star maps
      table(p, '#7a5230', '#4a3018');
      p.rect(2, 6, 6, 4, '#f0e6c8'); p.set(4, 7, '#3a5a9a'); p.set(6, 8, '#3a5a9a');
      p.rect(9, 5, 5, 4, '#e8dcbc'); p.rect(10, 9, 1, 1, '#1a1a1a'); p.rect(12, 3, 1, 3, '#f8f8f8');
      return true;
    case 'ㆉ': // round rug with a star
      p.ell(8, 8, 7.5, 6.5, '#3a3a7a'); p.ell(8, 8, 6, 5, '#4a4a90');
      for (const [x, y] of [[8, 4], [8, 12], [4, 8], [12, 8], [8, 8]]) p.set(x, y, '#f0d070');
      return true;

    // ── 학원·서당 ─────────────────────────────────────────────
    case 'ㅢ': // blackboard on the cream wall
      creamWall(p);
      p.rect(0, 1, 16, 9, '#7a5028'); p.rect(1, 2, 14, 7, '#2e5a40');
      p.rect(2, 4, 5, 1, '#e8f0e8'); p.rect(2, 6, 8, 1, '#e8f0e8'); p.rect(11, 3, 3, 3, '#f0e0a0');
      p.rect(4, 10, 8, 1, '#f8f8f8');
      return true;
    case 'ㄵ': { // type chart poster
      creamWall(p);
      p.rect(2, 0, 12, 9, '#ffffff'); p.rect(2, 0, 12, 1, '#d84a3a');
      const tc = ['#ff7a3a', '#4a9ae0', '#5ac05a', '#f0d040', '#a8d8f0', '#a06ad0'];
      for (let i = 0; i < 6; i++) p.rect(3 + (i % 3) * 4, 2 + Math.floor(i / 3) * 3, 3, 2, tc[i]);
      return true;
    }
    case 'ㅣ': // student desk with an open notebook
      shadow(p);
      p.rect(2, 11, 1, 3, '#6a4220'); p.rect(13, 11, 1, 3, '#6a4220');
      p.rect(1, 5, 14, 6, '#c88a56'); p.rect(1, 10, 14, 1, '#8a5630');
      p.rect(4, 6, 8, 3, '#ffffff'); p.rect(8, 6, 1, 3, '#c8c8d8'); p.rect(12, 7, 2, 1, '#e8c040');
      return true;
    case 'ㄳ': // teacher's lectern
      shadow(p, 14, 4, 8);
      p.rect(4, 6, 8, 9, '#8a5630'); p.rect(4, 6, 8, 1, '#b47a44'); p.rect(3, 4, 10, 3, '#a86e3e');
      p.rect(5, 3, 6, 2, '#f0f0f0');
      return true;
    case 'ㄶ': // low table (밥상/서안) with a tea set or books
      shadow(p, 13);
      p.rect(2, 10, 2, 3, '#5a3418'); p.rect(12, 10, 2, 3, '#5a3418');
      p.rect(1, 6, 14, 5, '#7a3e20'); p.rect(1, 6, 14, 1, '#a85a30'); p.rect(1, 10, 14, 1, '#4a2410');
      p.rect(4, 4, 3, 3, '#f0f0e8'); p.rect(5, 3, 1, 1, '#f0f0e8'); p.rect(9, 5, 2, 2, '#e0e8e0'); p.rect(12, 5, 2, 2, '#e0e8e0');
      return true;
    case 'ㄺ': // floor cushion
      p.rect(3, 4, 10, 9, '#3a5aa8'); p.rect(4, 5, 8, 7, '#d84a5a'); p.rect(6, 7, 4, 3, '#f0c040');
      return true;
    case 'ㄻ': // calligraphy scroll on hanji
      hanjiWall(p);
      p.rect(4, 0, 8, 1, '#5a3418'); p.rect(5, 1, 6, 10, '#fbf6e8'); p.rect(4, 11, 8, 1, '#5a3418');
      p.rect(7, 2, 2, 1, '#1a1a1a'); p.rect(6, 4, 4, 1, '#1a1a1a'); p.rect(8, 5, 1, 3, '#1a1a1a'); p.rect(6, 9, 3, 1, '#1a1a1a'); p.set(9, 9, '#c83a2a');
      return true;
    case 'ㄼ': // folding screen with mountains and a dragon
      hanjiWall(p);
      for (const x of [0, 4, 8, 12]) { p.rect(x, 1, 4, 11, '#f0e4c4'); p.rect(x, 1, 1, 11, '#8a5a30'); }
      p.line(1, 9, 5, 4, '#5a7a5a'); p.line(5, 4, 9, 9, '#5a7a5a'); p.line(9, 8, 13, 3, '#4a6a8a'); p.ell(12, 3, 1.5, 1, '#3a6aa8');
      return true;
    case 'ㄽ': // ink stone, brush and paper
      shadow(p, 13);
      p.rect(1, 7, 14, 6, '#f8f2e0'); p.rect(1, 12, 14, 1, '#d8ccb0');
      p.rect(2, 8, 4, 3, '#2a2a2e'); p.rect(3, 9, 2, 1, '#4a4a56');
      p.line(8, 11, 13, 6, '#7a4a24'); p.rect(13, 5, 2, 2, '#1a1a1a');
      p.rect(8, 9, 3, 1, '#1a1a1a');
      return true;
    case 'ㅻ': // hanging scale ornaments (노리개) on hanji
      hanjiWall(p);
      p.rect(0, 1, 16, 1, '#7a4a24');
      for (const [x, c] of [[3, '#4aa8d8'], [8, '#5ad0b0'], [12, '#6a8ae8']] as [number, string][]) {
        p.rect(x, 2, 1, 3, '#d84a5a'); p.ell(x + 0.5, 6, 1.6, 1.6, c); p.set(x, 5, '#e8fbff'); p.rect(x, 8, 1, 3, '#d84a5a');
      }
      return true;
    case 'ㅺ': // glass display case with scale crafts
      shadow(p);
      p.rect(1, 4, 14, 11, '#6a4020'); p.rect(2, 5, 12, 6, '#c8ecf4');
      for (const [x, c] of [[4, '#4aa8d8'], [8, '#5ad0b0'], [11, '#6a8ae8']] as [number, string][]) { p.ell(x, 8, 1.5, 1.5, c); p.set(x - 1, 7, '#ffffff'); }
      p.line(3, 6, 6, 5, '#ffffff');
      return true;
    case 'ㅼ': // basket of shed dragon scales
      p.ell(8, 11, 6, 4, '#a87a3e'); p.rect(2, 8, 12, 3, '#c89a56');
      for (const [x, y] of [[5, 8], [8, 7], [10, 8], [7, 9]]) { p.ell(x, y, 1.6, 1.2, '#5ab8e0'); p.set(x, y - 1, '#d0f4ff'); }
      return true;
    case 'ㅽ': // craft workbench with tools and scales
      table(p, '#8a5a30', '#5a3418', 4);
      p.ell(5, 7, 2, 1.4, '#5ab8e0'); p.set(4, 6, '#d0f4ff');
      p.rect(8, 6, 4, 1, '#c8ccd4'); p.rect(12, 5, 1, 3, '#6a4220'); p.rect(9, 8, 2, 2, '#d84a5a');
      return true;

    // ── 마을회관·이웃집 (log) ────────────────────────────────
    case 'ㄾ': { // stone fireplace with a crackling fire, set into the log wall
      logWall(p);
      p.rect(1, 2, 14, 14, '#7a706a'); p.rect(1, 2, 14, 2, '#5a524e');
      for (const [x, y] of [[2, 5], [12, 6], [3, 10], [12, 11]]) p.rect(x, y, 2, 2, '#948a82');
      p.rect(4, 6, 8, 10, '#2a1a14');
      p.rect(5, 13, 6, 2, '#6a3a1e');
      p.ell(8, 11.5 - anim * 0.5, 2.5, 3, '#ff8a2a'); p.ell(8, 12, 1.4, 1.8, '#ffe070');
      return true;
    }
    case 'ㅀ': // farming tools on the log wall
      logWall(p);
      p.rect(3, 1, 1, 11, '#d8a868'); p.rect(1, 1, 5, 2, '#6a6e76');
      p.rect(8, 1, 1, 11, '#d8a868'); for (let i = 0; i < 4; i++) p.rect(6 + i * 2, 10, 1, 2, '#6a6e76'); p.rect(6, 10, 7, 1, '#6a6e76');
      p.ell(13, 7, 2, 3, '#c8a858'); p.rect(13, 3, 1, 2, '#8a6a2a');
      return true;
    case 'ㄿ': // sacks of potatoes
      p.ell(5, 10, 4, 5, '#c8a870'); p.ell(11, 11, 4, 4, '#b8985e');
      p.rect(4, 5, 2, 1, '#8a6a3a'); p.rect(10, 7, 2, 1, '#8a6a3a');
      for (const [x, y] of [[9, 6], [12, 6], [14, 9]]) p.ell(x, y, 1.4, 1, '#a8783a');
      return true;
    case 'ㆆ': // windmill model on a table
      table(p, '#a86e3e', '#6a4220', 8);
      p.rect(7, 3, 3, 6, '#f0e6d0'); p.rect(7, 2, 3, 1, '#c84a3a');
      p.line(8, 3, 3, 0, '#8a5a30'); p.line(9, 3, 14, 0, '#8a5a30'); p.line(8, 3, 4, 7, '#8a5a30'); p.line(9, 3, 13, 7, '#8a5a30');
      return true;
    case 'ㅾ': // notice board full of village notices
      logWall(p);
      p.rect(1, 1, 14, 10, '#8a5a30'); p.rect(2, 2, 12, 8, '#d8b878');
      p.rect(3, 3, 4, 3, '#ffffff'); p.rect(8, 3, 5, 4, '#f8f0c0'); p.rect(4, 7, 5, 2, '#e8f0ff');
      p.set(5, 3, '#d84a3a'); p.set(10, 3, '#3a6ad8');
      return true;
    case 'ㆀ': // village banner
      logWall(p);
      p.rect(2, 0, 12, 1, '#5a3418'); p.rect(3, 1, 10, 9, '#c84a3a'); p.rect(5, 10, 2, 2, '#c84a3a'); p.rect(9, 10, 2, 2, '#c84a3a');
      p.ell(8, 5, 2.5, 2.5, '#f8d040'); p.rect(7, 4, 2, 2, '#c84a3a');
      return true;
    case 'ㆁ': // framed map of the region
      logWall(p);
      p.rect(1, 1, 14, 10, '#5a3418'); p.rect(2, 2, 12, 8, '#efe2bc');
      p.ell(6, 6, 3, 2.5, '#9ac880'); p.ell(11, 5, 2, 2, '#9ac880'); p.rect(2, 8, 12, 2, '#8ac0e0');
      p.line(4, 7, 11, 4, '#c84a3a');
      return true;
    case 'ㅿ': // long meeting table
      table(p, '#a0683a', '#6a3e1e', 4);
      p.rect(2, 6, 3, 2, '#f8f8f0'); p.rect(11, 6, 3, 2, '#f8f8f0'); p.rect(7, 5, 2, 3, '#e8e0d0');
      return true;
    case 'ㆂ': // trophy cabinet
      shadow(p);
      p.rect(1, 1, 14, 14, '#6a4020'); p.rect(2, 2, 12, 5, '#3a2410'); p.rect(2, 8, 12, 6, '#3a2410');
      p.rect(4, 3, 3, 3, '#f0c040'); p.rect(5, 6, 1, 1, '#f0c040'); p.rect(9, 4, 3, 2, '#c8ccd4');
      p.ell(5, 11, 1.6, 1.6, '#d8a840'); p.rect(9, 10, 4, 3, '#efe2bc');
      return true;
    case 'ㆅ': // woven rug
      p.rect(1, 2, 14, 12, '#b84a3a'); p.rect(2, 3, 12, 10, '#d86a4a');
      p.rect(4, 5, 8, 6, '#f0c060'); p.rect(6, 7, 4, 2, '#b84a3a');
      return true;

    // ── 꽃집·온실 ─────────────────────────────────────────────
    case 'ㅥ': // flower buckets on a tiered stand
      shadow(p);
      p.rect(1, 8, 14, 2, '#7a5028'); p.rect(1, 13, 14, 2, '#7a5028');
      for (const [x, y, c] of [[2, 3, '#e8586a'], [6, 3, '#f0d040'], [10, 3, '#9a6ad8'], [4, 9, '#f8f8f8'], [9, 9, '#f08ab0']] as [number, number, string][]) {
        p.rect(x, y + 2, 4, 3, '#5a7a9a'); p.ell(x + 2, y + 1, 2, 1.6, c); p.set(x + 1, y + 2, '#3a8a3a');
      }
      return true;
    case 'ㅦ': // shop counter with a cash box
      p.rect(0, 4, 16, 11, '#8a5630'); p.rect(0, 4, 16, 2, '#c88a56'); p.rect(0, 14, 16, 1, '#5a3418');
      p.rect(2, 8, 12, 1, '#a06a3a');
      p.rect(9, 1, 5, 4, '#5a606a'); p.rect(10, 2, 3, 1, '#a8e0a0');
      return true;
    case 'ㅧ': // tall vase of flowers on a stand
      shadow(p, 14, 4, 8);
      p.rect(6, 11, 4, 4, '#7a5028'); p.ell(8, 8, 3, 3.5, '#4a8ac8'); p.rect(7, 4, 2, 2, '#4a8ac8');
      for (const [x, y, c] of [[5, 2, '#e8586a'], [8, 1, '#f0d040'], [11, 2, '#f08ab0'], [7, 3, '#f8f8f8']] as [number, number, string][]) { p.ell(x, y + 1, 1.6, 1.4, c); }
      return true;
    case 'ㅨ': // big potted plant
      shadow(p, 14, 4, 8);
      p.rect(4, 10, 8, 5, '#b8683e'); p.rect(3, 10, 10, 1, '#d0804e');
      p.ell(8, 6, 6, 5, '#3a8a3a'); p.ell(6, 5, 3, 2.5, '#5aaa4a'); p.ell(10, 7, 2.5, 2, '#5aaa4a');
      return true;
    case 'ㅩ': // potting table with seedlings and a watering can
      table(p, '#9a7a4a', '#6a4e2a', 6);
      for (const x of [2, 5]) { p.rect(x, 5, 2, 2, '#b8683e'); p.rect(x, 3, 1, 2, '#5aaa4a'); p.set(x + 1, 3, '#5aaa4a'); }
      p.rect(9, 4, 4, 3, '#5aa8c8'); p.line(13, 5, 15, 3, '#5aa8c8'); p.rect(10, 3, 2, 1, '#3a88a8');
      return true;
    case 'ㅪ': // raised flower bed
      p.rect(0, 5, 16, 10, '#7a5028'); p.rect(1, 6, 14, 8, '#5a3a22');
      for (let i = 0; i < 5; i++) { const x = 2 + i * 3; p.rect(x, 3, 1, 4, '#3a8a3a'); p.ell(x, 3, 1.5, 1.5, ['#e8586a', '#f0d040', '#9a6ad8', '#f08ab0', '#ff8a3a'][i]); }
      return true;
    case 'ㅬ': // window onto the mist
      logWall(p);
      p.rect(2, 1, 12, 10, '#5a3418'); p.rect(3, 2, 10, 8, '#c8d8dc');
      p.rect(3, 6, 10, 2, '#e8eef0'); p.rect(4, 4, 5, 1, '#e8eef0'); p.rect(8, 1, 1, 10, '#5a3418');
      return true;
    case 'ㅫ': // tea counter with a kettle on a brazier
      p.rect(0, 5, 16, 10, '#6a3e20'); p.rect(0, 5, 16, 2, '#9a6232');
      p.ell(5, 4, 3, 2.5, '#3a3a3e'); p.rect(8, 3, 2, 1, '#3a3a3e'); p.rect(4, 1, 2, 1, '#3a3a3e');
      p.rect(11, 3, 2, 2, '#e8f0e8'); p.rect(13, 3, 2, 2, '#e8f0e8');
      p.set(5, 0, '#e8eef4');
      return true;

    // ── 식당 ─────────────────────────────────────────────────
    case 'ㅭ': // kitchen stove with a sizzling pan
      p.rect(0, 2, 16, 13, '#c8ccd4'); p.rect(0, 2, 16, 2, '#e8ecf0'); p.rect(0, 14, 16, 1, '#8a8e96');
      p.rect(2, 9, 12, 4, '#4a4e56'); p.rect(3, 10, 2, 2, '#ff7a2a');
      p.ell(9, 5, 5, 2, '#2a2e34'); p.rect(13, 5, 3, 1, '#2a2e34');
      p.rect(7, 4, 2, 1, '#f0c040'); p.set(10, 4, '#e85a3a');
      p.set(8, 2 - anim, '#f4f8fc'); p.set(10, 1 + anim, '#f4f8fc');
      return true;
    case 'ㅮ': // aquarium
      p.rect(0, 3, 16, 12, '#5a606a'); p.rect(1, 4, 14, 9, '#5ab0e0'); p.rect(1, 4, 14, 1, '#a8e0f8');
      p.rect(1, 11, 14, 2, '#e8d090');
      p.ell(5 + anim * 2, 7, 1.8, 1, '#ff8a3a'); p.set(3 + anim * 2, 7, '#ff8a3a');
      p.ell(11 - anim, 9, 1.4, 0.8, '#f0e040');
      p.rect(12, 8, 1, 3, '#3a9a5a');
      return true;
    case 'ㅯ': // menu board on the tiled wall
      tileWall(p);
      p.rect(1, 0, 14, 10, '#3a3e3a'); p.rect(1, 0, 14, 1, '#7a5028');
      for (const y of [2, 4, 6, 8]) { p.rect(3, y, 6, 1, '#f0f0e8'); p.rect(11, y, 2, 1, '#f0d040'); }
      return true;
    case 'ㆃ': // dining table with seafood
      table(p, '#e8e8f0', '#8a5630', 5);
      p.rect(0, 5, 16, 2, '#d84a4a'); p.rect(0, 9, 16, 1, '#d84a4a');
      p.ell(5, 7, 2.5, 1.5, '#ffffff'); p.ell(5, 7, 1.5, 0.8, '#ff8a5a');
      p.ell(11, 7, 2.5, 1.5, '#ffffff'); p.ell(11, 7, 1.6, 0.8, '#f0d070');
      return true;

    // ── 온천장 ───────────────────────────────────────────────
    case 'ㅰ': // wooden stool and bucket
      p.rect(2, 9, 6, 2, '#c8985a'); p.rect(2, 11, 1, 3, '#9a6a3a'); p.rect(7, 11, 1, 3, '#9a6a3a');
      p.rect(9, 7, 5, 6, '#d8a868'); p.rect(9, 8, 5, 1, '#9a6a3a'); p.rect(9, 11, 5, 1, '#9a6a3a'); p.ell(11.5, 7, 2.5, 1, '#8ad0f0');
      return true;
    case 'ㅱ': // towel shelf
      tileWall(p);
      p.rect(1, 3, 14, 1, '#9a6a3a'); p.rect(1, 8, 14, 1, '#9a6a3a');
      for (const [x, y, c] of [[2, 1, '#f8f8f8'], [6, 1, '#f0a0b0'], [10, 1, '#a0d0f0'], [3, 6, '#f0d080'], [8, 6, '#f8f8f8']] as [number, number, string][]) p.rect(x, y, 3, 2, c);
      return true;
    case 'ㅲ': // bamboo partition
      for (const x of [1, 4, 7, 10, 13]) { p.rect(x, 0, 2, 16, '#7aa84a'); p.rect(x, 0, 1, 16, '#9ac868'); p.rect(x, 5, 2, 1, '#5a8a3a'); p.rect(x, 11, 2, 1, '#5a8a3a'); }
      p.rect(0, 3, 16, 1, '#6a4a2a'); p.rect(0, 12, 16, 1, '#6a4a2a');
      return true;

    // ── 얼음 공방·코코아 찻집 ─────────────────────────────────
    case 'ㅳ': // stacked ice blocks
      for (const [x, y] of [[1, 8], [8, 8], [4, 2]]) { p.rect(x, y, 7, 6, '#a8d8f0'); p.rect(x, y, 7, 1, '#e8f8ff'); p.rect(x + 6, y, 1, 6, '#7ab4d4'); p.set(x + 2, y + 2, '#ffffff'); }
      return true;
    case 'ㅴ': // finished ice sculpture of a swan on a plinth
      shadow(p, 14, 3, 10);
      p.rect(3, 12, 10, 3, '#9ab8cc');
      p.ell(8, 9, 5, 3, '#c8eefc'); p.rect(9, 3, 2, 6, '#c8eefc'); p.ell(9, 3, 2, 1.5, '#c8eefc'); p.rect(11, 3, 2, 1, '#8ab8d8');
      p.line(4, 8, 9, 6, '#ffffff');
      return true;
    case 'ㅵ': // chisels on the ice wall
      iceWall(p);
      p.rect(1, 2, 14, 1, '#6a4a2a');
      for (const x of [2, 5, 8, 11, 13]) { p.rect(x, 3, 1, 4, '#7a5028'); p.rect(x, 7, 1, 3, '#c8d0dc'); p.set(x, 10, '#ffffff'); }
      return true;
    case 'ㅶ': // cocoa counter with steaming mugs
      p.rect(0, 5, 16, 10, '#7a4a2a'); p.rect(0, 5, 16, 2, '#a86e3e'); p.rect(0, 10, 16, 1, '#f4f8fc');
      for (const [x, c] of [[2, '#e85a5a'], [7, '#f8f8f8'], [12, '#5a9ae0']] as [number, string][]) { p.rect(x, 2, 3, 3, c); p.rect(x + 3, 3, 1, 1, c); p.set(x + 1, 1 - anim, '#f4f8fc'); }
      return true;
    case 'ㅸ': // window onto falling snow
      logWall(p);
      p.rect(2, 1, 12, 10, '#f4f8fc'); p.rect(3, 2, 10, 8, '#6a88b8');
      for (const [x, y] of [[4, 3], [9, 4], [6, 7], [11, 8], [5, 9]]) p.set(x, y, '#ffffff');
      p.rect(3, 9, 10, 1, '#ffffff'); p.rect(8, 1, 1, 10, '#f4f8fc');
      return true;
    case 'ㅹ': // knitted rug with a snowflake
      p.rect(1, 2, 14, 12, '#c84a5a'); p.rect(2, 3, 12, 10, '#e8e0d0');
      p.rect(7, 4, 2, 8, '#c84a5a'); p.rect(4, 7, 8, 2, '#c84a5a'); p.set(5, 5, '#c84a5a'); p.set(10, 10, '#c84a5a'); p.set(10, 5, '#c84a5a'); p.set(5, 10, '#c84a5a');
      return true;
  }
  return false;
}
