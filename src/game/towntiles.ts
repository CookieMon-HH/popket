import type { Pix } from '../engine/pix';

// ---------------------------------------------------------------------------
// Town tiles: grounds, concept structures and street furniture for the towns.
//
// DECO tiles are drawn with a transparent background; the overworld first draws
// the ground of a neighbouring tile underneath, so a bench or a lamp fits on grass,
// snow, sand or cobblestones alike. Multi-tile structures (fountain, windmill,
// lighthouse, pavilion, observatory) are split into quarter/segment tiles.

export const TOWN_GROUND = 'αβγϖϱϑ';
/** Walkable town tiles (everything else here is solid). */
export const TOWN_WALKABLE = 'αβγδϖϱϑⅲⅸⅹⓔⓕ';
/** Drawn over the ground of a neighbouring tile. */
export const DECO = new Set([...'εζθικλμρςφψωϘνξοπστυχⅠⅡⅢⅦⅧⅨⅩⅪⅫⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⓣⓐⓓⓔⓕ']);
export const TOWN_ANIM = new Set([...'νξοπⅠⅤⅦⅫⓛϘ♥♠♢♦']);
// The observatory's lower half (with its door) and the pavilion floor can be walked onto.
export const TOWN_SOLID = [...'εζθικλμρςφψωϘνξοπστυχⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅰⅱⅳⅴⅵⅶⅷⓖⓛⓣⓐⓓϜϝϟ♡♥♣♠♦♤♧'];

/** Extra roof colours: [base, dark]. */
export const TOWN_ROOF: Record<string, [string, string]> = {
  Ρ: ['#e88aa8', '#c0607e'], // 들꽃: pink
  Σ: ['#3a4a7a', '#26305a'], // 별빛시: navy
  Φ: ['#e8eef4', '#a8b8cc'], // 파도항구: white-blue
  Δ: ['#5a3a34', '#3a2422'], // 불꽃: charcoal-red
  Λ: ['#f4f8fc', '#c4d2e4'], // 서리: snow-laden
  Γ: ['#4a5260', '#2e343e'], // 용의 마을: 기와
  Θ: ['#b8e8f0', '#7ab8c8'], // greenhouse glass
  Π: ['#c8783a', '#9a5422'], // 솔빛: warm orange
};

const WATER = (p: Pix) => {
  p.rect(0, 0, 16, 16, '#4a9ee6');
  for (const [y, s] of [[3, 0], [8, 7], [13, 3]]) for (let i = 0; i < 4; i++) p.set((s + i) % 16, y, '#a6d8fa');
};

/** Draw a town tile; returns false if `ch` is not a town tile. */
export function drawTownTile(ch: string, anim: number, p: Pix): boolean {
  switch (ch) {
    // ── grounds ────────────────────────────────────────────────
    case 'α': // cobblestone
      p.rect(0, 0, 16, 16, '#b8b0a4');
      for (const [x, y, w, h] of [[0, 0, 7, 5], [8, 0, 8, 4], [0, 6, 5, 5], [6, 5, 6, 6], [13, 5, 3, 6], [0, 12, 8, 4], [9, 12, 7, 4]]) {
        p.rect(x, y, w - 1, h - 1, '#cac2b6');
        p.rect(x, y, w - 1, 1, '#d8d2c8');
      }
      return true;
    case 'β': // red-brick street
      p.rect(0, 0, 16, 16, '#a8584a');
      for (let y = 0; y < 16; y += 4) {
        p.rect(0, y + 3, 16, 1, '#86403a');
        const off = (y / 4) % 2 ? 4 : 0;
        for (let x = off; x < 16; x += 8) p.rect(x, y, 1, 3, '#86403a');
        p.rect(off + 1, y, 6, 1, '#c07060');
      }
      return true;
    case 'γ': // boardwalk planks
      p.rect(0, 0, 16, 16, '#b88a56');
      for (const y of [3, 7, 11, 15]) p.rect(0, y, 16, 1, '#8a6038');
      for (const [x, y] of [[4, 0], [12, 4], [2, 8], [9, 12]]) p.rect(x, y, 1, 3, '#8a6038');
      p.set(6, 1, '#d4a878'); p.set(13, 9, '#d4a878');
      return true;
    case 'δ': // stepping stone in the water
      WATER(p);
      p.ell(8, 9, 6, 4.5, '#6a6a70'); p.ell(8, 8, 6, 4, '#a8a8b0'); p.ell(6, 6.5, 2, 1, '#c8c8d0');
      return true;
    case 'ϖ': // star-mosaic plaza
      p.rect(0, 0, 16, 16, '#3a4a6a');
      p.rect(0, 0, 16, 1, '#4a5a7a'); p.rect(0, 0, 1, 16, '#4a5a7a');
      p.set(8, 8, '#ffe880'); p.set(7, 8, '#c8b860'); p.set(9, 8, '#c8b860'); p.set(8, 7, '#c8b860'); p.set(8, 9, '#c8b860');
      p.set(3, 3, '#a8b8e0'); p.set(12, 13, '#a8b8e0');
      return true;
    case 'ϱ': // grey flagstone path
      p.rect(0, 0, 16, 16, '#8a8a84');
      for (const [x, y, w, h] of [[1, 1, 7, 6], [9, 1, 6, 6], [1, 8, 5, 7], [7, 8, 8, 7]]) { p.rect(x, y, w, h, '#a8a8a0'); p.rect(x, y, w, 1, '#c0c0b8'); }
      return true;
    case 'ϑ': // warm volcanic earth
      p.rect(0, 0, 16, 16, '#b07a5a');
      for (const [x, y] of [[2, 3], [10, 2], [6, 8], [13, 11], [3, 13], [9, 14]]) p.set(x, y, '#8a5a40');
      for (const [x, y] of [[12, 6], [5, 5]]) p.set(x, y, '#d89a70');
      return true;

    // ── street furniture (deco) ───────────────────────────────
    case 'ε': // flower bed
      p.rect(1, 6, 14, 9, '#8a5432'); p.rect(2, 7, 12, 7, '#5a3a22');
      for (const [x, y, c] of [[4, 6, '#ff6a8a'], [8, 5, '#ffe060'], [12, 6, '#a86ae8'], [6, 9, '#ff9a4a'], [10, 9, '#ff6a8a'], [3, 10, '#ffffff'], [13, 10, '#ffe060']] as const) {
        p.rect(x - 1, y, 3, 1, c); p.rect(x, y - 1, 1, 3, c); p.set(x, y, '#fff6c0');
      }
      for (const x of [5, 9, 11]) p.rect(x, 11, 1, 3, '#3a8a34');
      return true;
    case 'ζ': // trimmed hedge
      p.rect(0, 4, 16, 11, '#2e7a3c'); p.rect(0, 4, 16, 3, '#4aa058'); p.rect(0, 14, 16, 2, '#1e5a2a');
      for (const [x, y] of [[3, 8], [10, 10], [7, 6], [13, 7]]) p.set(x, y, '#6ac07a');
      return true;
    case 'θ': // wooden bench
      p.rect(1, 6, 14, 2, '#8a5a30'); p.rect(1, 9, 14, 2, '#a8703c'); p.rect(1, 9, 14, 1, '#c8905a');
      p.rect(2, 11, 2, 4, '#4a4a54'); p.rect(12, 11, 2, 4, '#4a4a54'); p.rect(2, 4, 2, 5, '#4a4a54'); p.rect(12, 4, 2, 5, '#4a4a54');
      return true;
    case 'ι': // stone well
      p.ell(8, 11, 7, 4, '#6a6a74'); p.ell(8, 10, 6, 3, '#9a9aa4'); p.ell(8, 10, 4, 2, '#2a4a7a');
      p.rect(2, 2, 2, 9, '#7a4a28'); p.rect(12, 2, 2, 9, '#7a4a28'); p.rect(1, 1, 14, 2, '#a86a3a'); p.rect(7, 3, 2, 4, '#5a5a64');
      return true;
    case 'κ': case 'λ': { // market stall with an awning
      const [a, b] = ch === 'κ' ? ['#e84a4a', '#fff4e8'] : ['#3a7ad8', '#fff4e8'];
      for (let x = 0; x < 16; x += 4) { p.rect(x, 1, 2, 5, a); p.rect(x + 2, 1, 2, 5, b); }
      p.rect(0, 6, 16, 1, '#8a5a30');
      p.rect(1, 9, 14, 5, '#a8703c'); p.rect(1, 9, 14, 1, '#c8905a');
      for (const [x, c] of [[3, '#ff6a3a'], [6, '#ffd040'], [9, '#7ac84a'], [12, '#e85a8a']] as const) p.ell(x, 8.5, 1.3, 1.2, c);
      p.rect(1, 6, 1, 8, '#6a4a2a'); p.rect(14, 6, 1, 8, '#6a4a2a');
      return true;
    }
    case 'μ': // crates and a barrel
      p.rect(1, 6, 8, 9, '#b07a40'); p.rect(1, 6, 8, 1, '#d09a5a'); p.line(1, 6, 8, 14, '#8a5a2a'); p.line(8, 6, 1, 14, '#8a5a2a');
      p.ell(12, 10, 3.5, 5, '#7a4a28'); p.rect(9, 7, 7, 1, '#4a4a54'); p.rect(9, 12, 7, 1, '#4a4a54'); p.rect(10, 6, 4, 1, '#9a6a3a');
      return true;
    case 'ρ': // stone statue of a trainer and a monster
      p.rect(3, 12, 10, 4, '#7a7a84'); p.rect(2, 11, 12, 2, '#9a9aa4');
      p.rect(6, 3, 4, 8, '#b8b8c0'); p.ell(8, 2.5, 2, 2, '#c8c8d0'); p.rect(5, 5, 1, 4, '#a8a8b0'); p.rect(10, 4, 3, 1, '#a8a8b0');
      p.ell(12, 9.5, 2, 1.8, '#c8c8d0'); p.set(12, 7, '#c8c8d0');
      return true;
    case 'ς': // haystack
      p.ell(8, 10, 7, 5.5, '#c8a040'); p.ell(8, 9, 6, 4.5, '#e8c860'); p.line(4, 8, 7, 12, '#b08a30'); p.line(9, 7, 12, 11, '#b08a30');
      return true;
    case 'φ': // crop rows
      p.rect(0, 0, 16, 16, '#8a5a34');
      for (const y of [2, 7, 12]) { p.rect(0, y, 16, 2, '#6a4224'); for (let x = 1; x < 16; x += 3) { p.rect(x, y - 2, 1, 3, '#4aa83a'); p.set(x - 1, y - 2, '#7ad04a'); p.set(x + 1, y - 1, '#7ad04a'); } }
      return true;
    case 'ψ': // beehive box
      p.rect(3, 4, 10, 10, '#e8c060'); for (const y of [6, 9, 12]) p.rect(3, y, 10, 1, '#b08a30');
      p.rect(2, 3, 12, 2, '#a86a3a'); p.rect(7, 12, 2, 2, '#4a3420'); p.rect(4, 14, 2, 2, '#6a4a2a'); p.rect(10, 14, 2, 2, '#6a4a2a');
      p.set(13, 2, '#ffd040'); p.set(14, 1, '#1c1c28');
      return true;
    case 'ω': // scarecrow
      p.rect(7, 4, 2, 12, '#7a4a28'); p.rect(2, 6, 12, 2, '#7a4a28');
      p.ell(8, 3, 3, 2.5, '#e8d0a0'); p.rect(4, 0, 8, 2, '#c8a040'); p.rect(5, 8, 6, 5, '#3a6ab0'); p.set(7, 3, '#1c1c28'); p.set(9, 3, '#1c1c28');
      return true;
    case 'Ϙ': // street lamp (lit)
      p.rect(7, 5, 2, 10, '#3a3a4a'); p.rect(5, 14, 6, 2, '#3a3a4a');
      p.ell(8, 3.5, 3.5, 3, '#3a3a4a'); p.ell(8, 3.5, 2.5, 2, anim ? '#fff0a0' : '#ffe880');
      return true;
    case 'ⓣ': // tree in a round planter
      p.rect(3, 11, 10, 5, '#8a8a94'); p.rect(3, 11, 10, 1, '#a8a8b0');
      p.rect(7, 8, 2, 4, '#7a4a28'); p.ell(8, 5, 6, 5, '#2e7a3c'); p.ell(7, 4, 4, 3, '#4aa058');
      return true;

    // ── fountain (2×2: ν ξ / ο π) ─────────────────────────────
    case 'ν': case 'ξ': case 'ο': case 'π': {
      const qx = ch === 'ξ' || ch === 'π' ? 1 : 0, qy = ch === 'ο' || ch === 'π' ? 1 : 0;
      const ox = -qx * 16, oy = -qy * 16;
      const E = (x: number, y: number, rx: number, ry: number, c: string) => p.ell(x + ox, y + oy, rx, ry, c);
      E(16, 18, 15, 12, '#8a8a94'); E(16, 17, 14, 11, '#b8b8c4'); E(16, 17, 12, 9, '#4a9ee6');
      E(16, 15, 3, 7, '#b8b8c4'); E(16, 9, 5, 2, '#b8b8c4'); E(16, 8.5, 4, 1.4, '#4a9ee6');
      E(16, 4 - anim, 1.5, 3, '#a6d8fa'); E(12, 12 + anim, 1, 1.5, '#d8f0ff'); E(20, 12 + anim, 1, 1.5, '#d8f0ff');
      for (const [x, y] of [[10, 20], [22, 22], [14, 24]]) p.set(x + ox + anim, y + oy, '#d8f0ff');
      return true;
    }
    // ── windmill (2×2: σ τ / υ χ) ─────────────────────────────
    case 'σ': case 'τ': case 'υ': case 'χ': {
      const qx = ch === 'τ' || ch === 'χ' ? 1 : 0, qy = ch === 'υ' || ch === 'χ' ? 1 : 0;
      const ox = -qx * 16, oy = -qy * 16;
      const T = (a: number, b: number, c: number, d: number, e: number, f: number, col: string) => p.tri(a + ox, b + oy, c + ox, d + oy, e + ox, f + oy, col);
      T(6, 32, 26, 32, 16, 9, '#e8d8b8'); T(8, 32, 16, 32, 16, 9, '#f4ead2');
      p.rect(13 + ox, 24 + oy, 6, 8, '#7a4a28'); p.rect(14 + ox, 16 + oy, 4, 4, '#5a6a88'); p.rect(14 + ox, 16 + oy, 4, 1, '#3a4a68');
      // four sail blades around the hub (16, 11)
      for (const ang of [-2.0, -0.4, 1.17, 2.74]) {
        const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
        const h = [16 + dx * 2, 11 + dy * 2], t = [16 + dx * 15, 11 + dy * 15];
        T(h[0], h[1], t[0], t[1], t[0] + px * 5, t[1] + py * 5, '#f0e4c8');
        T(h[0], h[1], h[0] + px * 2, h[1] + py * 2, t[0] + px * 5, t[1] + py * 5, '#f0e4c8');
        p.line(h[0] + ox, h[1] + oy, t[0] + ox, t[1] + oy, '#8a5a30');
      }
      p.ell(16 + ox, 10 + oy, 1.5, 1.5, '#5a3a22');
      return true;
    }
    // ── lighthouse (Ⅰ top, Ⅱ middle, Ⅲ base) ──────────────────
    case 'Ⅰ':
      p.rect(4, 9, 8, 7, '#d8323a'); p.rect(5, 5, 6, 4, anim ? '#fff4a0' : '#ffe060'); p.rect(4, 4, 8, 1, '#3a3a4a'); p.tri(3, 4, 13, 4, 8, 0, '#3a3a4a');
      if (anim) { p.tri(0, 5, 5, 6, 0, 8, '#fff8c0'); p.tri(16, 5, 11, 6, 16, 8, '#fff8c0'); }
      return true;
    case 'Ⅱ':
      p.rect(3, 0, 10, 16, '#f4f4f8'); p.rect(3, 6, 10, 5, '#d8323a'); p.rect(3, 0, 2, 16, '#ffffff'); p.rect(11, 0, 2, 16, '#c8ccd8'); p.rect(7, 2, 2, 3, '#5a6a88');
      return true;
    case 'Ⅲ':
      p.rect(2, 0, 12, 12, '#f4f4f8'); p.rect(2, 0, 2, 12, '#ffffff'); p.rect(12, 0, 2, 12, '#c8ccd8'); p.rect(6, 5, 4, 7, '#6a3e22');
      p.rect(0, 12, 16, 4, '#7a7a84'); p.rect(0, 12, 16, 1, '#9a9aa4');
      return true;
    case 'Ⅳ': // moored fishing boat
      WATER(p);
      p.tri(0, 8, 16, 8, 13, 14, '#a8603a'); p.tri(0, 8, 3, 14, 13, 14, '#a8603a'); p.rect(1, 8, 14, 2, '#f4f0e8');
      p.rect(7, 1, 1, 7, '#6a4a2a'); p.tri(8, 1, 8, 7, 13, 6, '#f4f4f8');
      return true;
    // ── fire town ─────────────────────────────────────────────
    case 'Ⅴ': // steaming hot spring
      p.rect(0, 0, 16, 16, '#5ab8c8'); p.rect(0, 0, 16, 1, '#8ad8e0');
      for (const [x, y] of [[3, 5], [10, 10], [12, 3]]) p.ell(x, y, 2, 1, '#a8e8f0');
      for (const [x, y] of [[4, 2], [11, 7], [7, 12]]) { p.ell(x + anim, y - anim, 2, 1.5, '#e8f6fa'); p.set(x + anim + 1, y - anim - 2, '#ffffff'); }
      return true;
    case 'Ⅵ': // volcanic rock wall
      p.rect(0, 0, 16, 16, '#3a2e2e');
      for (const [x, y, rx, ry] of [[4, 4, 4, 3], [12, 5, 4, 3.5], [7, 11, 5, 3.5], [14, 13, 2.5, 2]]) { p.ell(x, y, rx, ry, '#5a4646'); p.ell(x - 1, y - 1, rx * 0.4, ry * 0.4, '#7a6262'); }
      p.set(9, 8, '#e8602a'); p.set(3, 12, '#e8602a');
      return true;
    case 'Ⅶ': // blacksmith's anvil with a glowing ingot
      p.rect(3, 12, 10, 3, '#3a3a44'); p.rect(5, 9, 6, 3, '#4a4a54'); p.rect(2, 6, 12, 3, '#5a5a68'); p.rect(2, 6, 12, 1, '#7a7a88'); p.tri(14, 6, 16, 6, 14, 8, '#5a5a68');
      p.rect(6, 4, 5, 2, anim ? '#ffb040' : '#ff8a2a');
      return true;
    // ── snow town ─────────────────────────────────────────────
    case 'Ⅷ': // snowman
      p.ell(8, 11.5, 5.5, 4.5, '#ffffff'); p.ell(8, 11.5, 5.5, 4.5, '#ffffff'); p.ell(9.5, 13, 3, 2, '#dce8f4');
      p.ell(8, 5.5, 4, 3.5, '#ffffff'); p.ell(9.5, 6.5, 2, 1.5, '#dce8f4');
      p.set(7, 5, '#1c1c28'); p.set(9, 5, '#1c1c28'); p.rect(8, 6, 3, 1, '#ff8a2a'); p.rect(5, 8, 7, 1, '#d8323a'); p.rect(6, 0, 4, 3, '#2a2a34'); p.rect(5, 2, 6, 1, '#2a2a34');
      return true;
    case 'Ⅸ': // ice sculpture of a dragon-bird
      p.rect(3, 13, 10, 3, '#9ab8d0'); p.tri(4, 13, 12, 13, 8, 2, '#c8ecf8'); p.tri(8, 4, 15, 7, 9, 9, '#a8dcf0'); p.tri(8, 4, 1, 7, 7, 9, '#a8dcf0');
      p.line(8, 3, 8, 12, '#ffffff'); p.set(7, 5, '#5a8ab0');
      return true;
    case 'Ⅹ': case 'Ⅺ': { // igloo (left / right half)
      const ox = ch === 'Ⅺ' ? -16 : 0;
      p.ell(16 + ox, 16, 14, 13, '#e8f2fa'); p.ell(14 + ox, 13, 10, 9, '#ffffff');
      for (const y of [7, 11]) for (let x = 2; x < 30; x += 5) p.rect(x + ox + (y === 11 ? 2 : 0), y, 1, 3, '#c4d4e4');
      p.rect(2 + ox, 10, 28, 1, '#c4d4e4'); p.ell(16 + ox, 16, 4, 5, '#3a4a6a');
      return true;
    }
    // ── dragon village ────────────────────────────────────────
    case 'Ⅻ': // stone lantern (석등) with a flame
      p.rect(6, 12, 4, 4, '#7a7a84'); p.rect(4, 11, 8, 1, '#8a8a94'); p.rect(5, 6, 6, 5, '#9a9aa4'); p.rect(7, 7, 2, 3, anim ? '#ffd060' : '#ffb040');
      p.tri(2, 6, 14, 6, 8, 1, '#7a7a84'); p.rect(7, 0, 2, 1, '#7a7a84');
      return true;
    case 'ⅰ': case 'ⅱ': // 홍살문 posts
      p.rect(6, 0, 4, 16, '#c8302a'); p.rect(6, 0, 1, 16, '#e85a4a'); p.rect(5, 13, 6, 3, '#3a3a44');
      p.rect(ch === 'ⅰ' ? 8 : 0, 2, 8, 2, '#c8302a');
      return true;
    case 'ⅲ': // 홍살문 crossbar with red arrows over the path (walkable)
      p.rect(0, 2, 16, 2, '#c8302a'); p.rect(0, 6, 16, 1, '#a82820');
      for (let x = 1; x < 16; x += 3) { p.rect(x, 0, 1, 6, '#c8302a'); p.set(x, 0, '#ffd040'); }
      return true;
    case 'ⅳ': // dragon statue
      p.rect(3, 12, 10, 4, '#6a6a74'); p.rect(3, 12, 10, 1, '#8a8a94');
      p.ell(8, 9, 4, 3, '#4a8a7a'); p.ell(6, 5, 3, 3, '#4a8a7a'); p.tri(4, 3, 6, 0, 7, 3, '#e8c860'); p.tri(7, 3, 9, 0, 9, 4, '#e8c860');
      p.rect(2, 5, 2, 2, '#4a8a7a'); p.set(5, 4, '#ff4a3a'); p.line(11, 9, 14, 5, '#4a8a7a'); p.set(14, 4, '#6ab8a8');
      return true;
    case 'ⅴ': // bamboo grove
      for (const [x, c] of [[3, '#5aa84a'], [8, '#7ac85a'], [12, '#4a984a']] as const) { p.rect(x, 0, 2, 16, c); for (const y of [3, 8, 13]) p.rect(x, y, 2, 1, '#2e6a2e'); }
      for (const [x, y] of [[1, 2], [6, 6], [11, 1], [14, 9], [5, 11]]) p.tri(x, y, x + 4, y - 1, x + 2, y + 1, '#3a8a3a');
      return true;
    case 'ⅵ': // 장독대: onggi jars on a stone ledge
      p.rect(0, 12, 16, 4, '#9a9aa4'); p.rect(0, 12, 16, 1, '#b8b8c0');
      for (const [x, r] of [[4, 3.5], [11, 3], [8, 2.5]] as const) { p.ell(x, 9, r, r + 0.5, '#6a3a22'); p.ell(x - 1, 8, r * 0.4, r * 0.5, '#9a5a3a'); p.rect(x - r + 1, 5, r * 2 - 2, 1, '#4a2a18'); }
      return true;
    case 'ⅶ': case 'ⅷ': case 'ⅸ': case 'ⅹ': { // 정자 pavilion (2×2)
      const qx = ch === 'ⅷ' || ch === 'ⅹ' ? 1 : 0, qy = ch === 'ⅸ' || ch === 'ⅹ' ? 1 : 0;
      const ox = -qx * 16, oy = -qy * 16;
      p.rect(2 + ox, 24 + oy, 28, 6, '#a8703c'); p.rect(2 + ox, 24 + oy, 28, 1, '#c8905a');
      for (const x of [5, 25]) p.rect(x + ox, 12 + oy, 2, 13, '#c8302a');
      p.tri(-2 + ox, 13 + oy, 34 + ox, 13 + oy, 16 + ox, 2 + oy, '#4a5260'); p.rect(0 + ox, 11 + oy, 32, 3, '#2e343e');
      p.tri(-2 + ox, 13 + oy, 2 + ox, 13 + oy, -2 + ox, 9 + oy, '#4a5260'); p.tri(30 + ox, 13 + oy, 34 + ox, 13 + oy, 34 + ox, 9 + oy, '#4a5260');
      for (let x = 2; x < 30; x += 4) p.rect(x + ox, 14 + oy, 2, 1, '#3aa878');
      return true;
    }
    // ── observatory dome (2×2: ⓐ ⓓ / ⓔ ⓕ) ─────────────────────
    case 'ⓐ': case 'ⓓ': case 'ⓔ': case 'ⓕ': {
      const qx = ch === 'ⓓ' || ch === 'ⓕ' ? 1 : 0, qy = ch === 'ⓔ' || ch === 'ⓕ' ? 1 : 0;
      const ox = -qx * 16, oy = -qy * 16;
      p.rect(3 + ox, 18 + oy, 26, 14, '#d8dce8'); p.rect(3 + ox, 18 + oy, 26, 2, '#b8bccc'); p.rect(13 + ox, 24 + oy, 6, 8, '#3a4a6a');
      p.ell(16 + ox, 18 + oy, 13, 14, '#8a9ab8'); p.ell(13 + ox, 13 + oy, 7, 7, '#a8b8d4');
      p.rect(15 + ox, 4 + oy, 3, 14, '#2a3450'); p.line(17 + ox, 6 + oy, 26 + ox, 0 + oy, '#5a6a88'); p.line(17 + ox, 7 + oy, 26 + ox, 1 + oy, '#5a6a88');
      return true;
    }
    // ── water deco ────────────────────────────────────────────
    case 'ⓖ': // reeds in shallow water
      WATER(p);
      for (const x of [3, 6, 9, 12]) { p.rect(x, 3 + (x % 3), 1, 12, '#4a8a3a'); p.rect(x, 2 + (x % 3), 1, 2, '#8a5a30'); }
      return true;
    case 'ⓛ': // lotus pads
      WATER(p);
      p.ell(5, 6, 3.5, 2.5, '#3a9a4a'); p.ell(11, 11, 4, 3, '#3a9a4a'); p.set(5, 6, '#2a7a3a');
      p.ell(11, 10, 1.8, 1.5, anim ? '#ffb0d0' : '#ff8ab8'); p.set(11, 9, '#ffffff');
      return true;
    // ── walls ─────────────────────────────────────────────────
    case 'Ϝ': // wooden plank wall
      p.rect(0, 0, 16, 16, '#9a6a3a'); for (const x of [0, 5, 10, 15]) p.rect(x, 0, 1, 16, '#7a4a28'); p.rect(0, 0, 16, 2, '#6a4024'); p.rect(0, 14, 16, 2, '#6a4024');
      return true;
    case 'ϝ': // wooden wall with a lit window
      p.rect(0, 0, 16, 16, '#9a6a3a'); for (const x of [0, 15]) p.rect(x, 0, 1, 16, '#7a4a28'); p.rect(0, 0, 16, 2, '#6a4024'); p.rect(0, 14, 16, 2, '#6a4024');
      p.rect(3, 4, 10, 8, '#5a3a22'); p.rect(4, 5, 8, 6, '#ffd88a'); p.rect(8, 5, 1, 6, '#5a3a22'); p.rect(4, 8, 8, 1, '#5a3a22');
      return true;
    case 'ϟ': // grey stone wall
      p.rect(0, 0, 16, 16, '#8a8a94');
      for (let y = 0; y < 16; y += 4) { p.rect(0, y + 3, 16, 1, '#6a6a74'); const off = (y / 4) % 2 ? 4 : 0; for (let x = off; x < 16; x += 8) p.rect(x, y, 1, 3, '#6a6a74'); }
      return true;
    // ── the ghost ship seen from the harbour (water behind it) ──
    case '♡': // broken mast with a tattered flag
      WATER(p);
      p.rect(7, 0, 2, 16, '#3a3036'); p.rect(4, 3, 8, 1, '#3a3036');
      p.tri(9, 4, 9, 9, 14, 8, '#6a6a5a'); p.set(12, 6, '#3a6a4a');
      return true;
    case '♥': // soot-black funnel with a ghostly wisp
      WATER(p);
      p.rect(4, 5, 8, 11, '#2a2228'); p.rect(4, 8, 8, 2, '#5a2226'); p.rect(4, 5, 8, 1, '#4a4048');
      p.ell(9 + anim, 2, 2.5, 1.8, '#8ae0b0'); p.set(8, 3 - anim, '#c8ffe0');
      return true;
    case '♣': // upper deck rail
      WATER(p);
      p.rect(0, 8, 16, 8, '#6e7672'); p.rect(0, 8, 16, 1, '#8a928e');
      for (const x of [1, 6, 11]) p.rect(x, 3, 1, 5, '#4a504e');
      p.rect(0, 3, 16, 1, '#5a605e');
      return true;
    case '♠': // grimy superstructure with a porthole glowing ghost-green
      p.rect(0, 0, 16, 16, '#7a827e'); p.rect(0, 14, 16, 2, '#4a5050');
      p.rect(3, 11, 1, 3, '#7a5238'); p.rect(12, 10, 1, 4, '#7a5238');
      p.ell(8, 7, 3.5, 3.5, '#3a4040'); p.ell(8, 7, 2.5, 2.5, anim ? '#5ae0a0' : '#3a9a70'); p.set(7, 6, '#c8ffe0');
      return true;
    case '♢': // gangway opening in the hull (walkable)
      p.rect(0, 0, 16, 16, '#7a827e'); p.rect(3, 2, 10, 14, '#141a1e'); p.rect(3, 2, 10, 1, '#4a5050');
      p.rect(5, 12, 6, 4, '#6a4a2a'); p.ell(8, 7, 2, 2, anim ? '#3a9a70' : '#2a6a50');
      return true;
    case '♦': // rusted hull above the waterline
      p.rect(0, 0, 16, 16, '#4a9ee6'); p.rect(0, 0, 16, 12, '#2a2a34'); p.rect(0, 0, 16, 2, '#c8c8c0');
      p.rect(0, 9, 16, 2, '#5a2226'); p.rect(4, 2, 1, 5, '#6a4030'); p.rect(11, 3, 1, 6, '#6a4030');
      for (let x = 0; x < 16; x += 5) p.set(x + anim, 13, '#a6d8fa');
      return true;
    case '♤': case '♧': { // bow (left) / stern (right)
      WATER(p);
      const L = ch === '♤';
      p.tri(L ? 16 : 0, 0, L ? 16 : 0, 12, L ? 2 : 14, 0, '#2a2a34');
      p.rect(L ? 6 : 0, 0, 10, 2, '#c8c8c0');
      p.tri(L ? 16 : 0, 9, L ? 16 : 0, 11, L ? 8 : 8, 9, '#5a2226');
      return true;
    }
  }
  return false;
}
