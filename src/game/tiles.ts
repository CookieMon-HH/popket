import { Pix } from '../engine/pix';

export const SOLID = new Set(['#', '~', 'F', 'S', 'R', 'G', 'B', 'M', 'K', 'Y', 'A', 'W', 'w', 'X', 'T', 'c', 'k', 'b', 'P', 'r', 'C', 'l', 'z', 'H', 'q', 'Q', 'm', 'v', 's', 'n', 'J', ' ']);

const ROOF: Record<string, [string, string]> = {
  R: ['#d85a4a', '#a83c34'],
  G: ['#4aa86a', '#30804c'],
  B: ['#4a7ad8', '#3058a8'],
  M: ['#e8a83a', '#b87e20'],
  K: ['#7a5a8a', '#56406a'],
  Y: ['#6a7a9a', '#4a5878'],
  A: ['#3ab0b0', '#228888'],
};

function heart(p: Pix, cx: number, cy: number, r: number, c: string) {
  p.ell(cx - r * 0.5, cy - r * 0.2, r * 0.6, r * 0.6, c);
  p.ell(cx + r * 0.5, cy - r * 0.2, r * 0.6, r * 0.6, c);
  p.tri(cx - r * 1.1, cy, cx + r * 1.1, cy, cx, cy + r * 1.1, c);
}

function centerFloor(p: Pix) {
  p.rect(0, 0, 16, 16, '#f8eef2');
  p.rect(0, 0, 8, 8, '#f0dce6');
  p.rect(8, 8, 8, 8, '#f0dce6');
}

function caveWall(p: Pix) {
  p.rect(0, 0, 16, 16, '#5a4a48');
  p.ell(4, 4, 4, 3, '#6e5e58');
  p.ell(12, 10, 4.5, 3.5, '#6e5e58');
  p.ell(3, 4, 1.5, 1, '#8a7a70');
  p.ell(11, 9, 1.8, 1, '#8a7a70');
  p.rect(0, 15, 16, 1, '#3a2e2c');
  p.rect(7, 0, 1, 5, '#3a2e2c');
  p.rect(1, 12, 5, 1, '#3a2e2c');
}

function caveFloor(p: Pix) {
  p.rect(0, 0, 16, 16, '#8a7a6a');
  for (const [x, y] of [[2, 3], [10, 2], [6, 8], [13, 11], [3, 13], [9, 14]]) p.set(x, y, '#76685a');
  for (const [x, y] of [[12, 6], [5, 5], [1, 10]]) p.set(x, y, '#9e8e7e');
}

function grass(p: Pix) {
  p.rect(0, 0, 16, 16, '#8ad46e');
  for (const [x, y] of [[2, 3], [9, 1], [13, 6], [5, 10], [11, 12], [1, 14], [7, 7]]) {
    p.set(x, y, '#6cb85a');
    p.set(x + 1, y - 1, '#6cb85a');
  }
}

function floor(p: Pix) {
  p.rect(0, 0, 16, 16, '#e4bc8c');
  p.rect(0, 3, 16, 1, '#cfa070');
  p.rect(0, 11, 16, 1, '#cfa070');
  p.rect(5, 0, 1, 3, '#cfa070');
  p.rect(12, 4, 1, 7, '#cfa070');
  p.rect(3, 12, 1, 4, '#cfa070');
}

function wall(p: Pix) {
  p.rect(0, 0, 16, 16, '#f2ead2');
  p.rect(0, 0, 16, 2, '#b8a888');
  p.rect(7, 2, 1, 12, '#e2d6b6');
  p.rect(0, 14, 16, 2, '#c8b890');
}

function build(ch: string, anim: number): Pix {
  const p = new Pix(16, 16);
  switch (ch) {
    case '.':
      grass(p);
      break;
    case ',': {
      p.rect(0, 0, 16, 16, '#5cb44a');
      let row = 0;
      for (const by of [4, 9, 14]) {
        for (const bx of row % 2 ? [3, 11] : [-1, 7, 15]) {
          p.set(bx, by, '#3a8a34');
          p.set(bx + 1, by - 2, '#3a8a34');
          p.set(bx + 1, by - 1, '#9ee07a');
          p.set(bx + 2, by - 1, '#3a8a34');
          p.set(bx + 3, by, '#3a8a34');
        }
        row++;
      }
      break;
    }
    case '#':
      grass(p);
      p.rect(6, 12, 4, 4, '#7a4a28');
      p.ell(8, 7, 8, 7, '#24603a');
      p.ell(8, 6.5, 7.2, 6.2, '#3a9448');
      p.ell(8, 9, 6, 3.5, '#2e7c3c');
      p.ell(5.5, 4, 2.2, 1.6, '#5cb860');
      p.rect(7, 13, 2, 1, '#5a3418');
      break;
    case '=':
      p.rect(0, 0, 16, 16, '#e6d6a4');
      for (const [x, y] of [[3, 2], [10, 5], [6, 9], [13, 12], [1, 13], [9, 14]]) p.set(x, y, '#d2bf88');
      for (const [x, y] of [[12, 2], [4, 6], [8, 12]]) p.set(x, y, '#f2e6c0');
      break;
    case '~': {
      p.rect(0, 0, 16, 16, '#4a9ee6');
      const o = anim * 4;
      for (const [y, s] of [[3, 0], [8, 7], [13, 3]]) {
        for (let i = 0; i < 4; i++) p.set((s + o + i) % 16, y, '#a6d8fa');
      }
      break;
    }
    case 'f':
      grass(p);
      for (const [x, y, c] of [[3, 4, '#f06464'], [11, 3, '#ffffff'], [6, 11, '#ffffff'], [13, 11, '#f06464']] as const) {
        const yy = y + (anim && x > 8 ? 1 : 0);
        p.set(x - 1, yy, c); p.set(x + 1, yy, c); p.set(x, yy - 1, c); p.set(x, yy + 1, c);
        p.set(x, yy, '#ffd84a');
      }
      break;
    case 'F':
      grass(p);
      p.rect(0, 6, 16, 2, '#c88c52');
      p.rect(0, 10, 16, 2, '#c88c52');
      p.rect(2, 4, 3, 10, '#b07a44');
      p.rect(11, 4, 3, 10, '#b07a44');
      p.rect(2, 4, 3, 1, '#8a5a30');
      p.rect(11, 4, 3, 1, '#8a5a30');
      break;
    case 'S':
      grass(p);
      p.rect(7, 9, 2, 6, '#8a5a30');
      p.rect(2, 2, 12, 8, '#7a4a24');
      p.rect(3, 3, 10, 6, '#c8945a');
      p.rect(4, 4, 8, 1, '#7a4a24');
      p.rect(4, 6, 6, 1, '#7a4a24');
      break;
    case 'R': case 'G': case 'B': case 'M': case 'K': case 'Y': case 'A': {
      const [base, dark] = ROOF[ch];
      p.rect(0, 0, 16, 16, base);
      for (let y = 0; y < 16; y += 4) {
        p.rect(0, y + 3, 16, 1, dark);
        const off = (y / 4) % 2 ? 4 : 0;
        for (let x = off; x < 16; x += 8) p.rect(x, y, 1, 3, dark);
      }
      break;
    }
    case 'W':
      wall(p);
      break;
    case 'C':
      caveWall(p);
      break;
    case 'H': {
      // 회복소 roof emblem: white plate with a pink heart
      const [base, dark] = ROOF.B;
      p.rect(0, 0, 16, 16, base);
      p.rect(0, 3, 16, 1, dark);
      p.rect(0, 11, 16, 1, dark);
      p.ell(8, 8, 7, 7, '#ffffff');
      p.ell(8, 8, 6, 6, '#ffe8f0');
      heart(p, 8, 7.5, 4, '#f05a8a');
      p.set(6, 6, '#ffffff');
      break;
    }
    case 'E':
      // automatic glass door used by every 회복소
      wall(p);
      p.rect(2, 2, 12, 14, '#3a5a8a');
      p.rect(3, 3, 5, 13, '#a8e0f8');
      p.rect(8, 3, 5, 13, '#a8e0f8');
      p.rect(4, 4, 1, 6, '#ffffff');
      p.rect(9, 4, 1, 6, '#ffffff');
      heart(p, 8, 1.5, 1.6, '#f05a8a');
      break;
    case 'q':
      p.rect(0, 0, 16, 16, '#fbe4ec');
      for (let x = 0; x < 16; x += 4) p.rect(x, 0, 2, 12, '#f8d4e0');
      p.rect(0, 12, 16, 4, '#e88aa8');
      p.rect(0, 12, 16, 1, '#c86a88');
      break;
    case 'Q':
      p.rect(0, 0, 16, 16, '#fbe4ec');
      p.rect(0, 12, 16, 4, '#e88aa8');
      p.rect(0, 12, 16, 1, '#c86a88');
      p.ell(8, 6, 6, 5.5, '#ffffff');
      heart(p, 8, 5.5, 3.5, '#f05a8a');
      break;
    case 'u':
      centerFloor(p);
      break;
    case 'n':
      centerFloor(p);
      p.rect(0, 2, 16, 12, '#c86a88');
      p.rect(0, 2, 16, 9, '#ffffff');
      p.rect(0, 2, 16, 1, '#ffd8e4');
      p.rect(0, 9, 16, 2, '#f8b8cc');
      break;
    case 'm':
      // healing machine with capsule slots
      centerFloor(p);
      p.rect(1, 2, 14, 12, '#7a8aa0');
      p.rect(2, 3, 12, 10, '#c8d4e4');
      for (const [x, y] of [[3, 4], [7, 4], [11, 4], [3, 8], [7, 8], [11, 8]]) {
        p.rect(x, y, 3, 3, '#3aa8a0');
        p.set(x + 1, y + 1, '#d8fff6');
      }
      p.rect(2, 13, 12, 1, '#5a6a80');
      break;
    case 'v':
      centerFloor(p);
      p.rect(5, 10, 6, 5, '#c87848');
      p.rect(5, 10, 6, 1, '#e8985a');
      p.ell(8, 6, 5, 5, '#3a9448');
      p.ell(6, 4, 2, 1.5, '#5cb860');
      p.ell(10, 7, 2, 1.5, '#5cb860');
      break;
    case 's':
      centerFloor(p);
      p.rect(1, 3, 14, 11, '#d85a7a');
      p.rect(2, 4, 12, 4, '#f08aa4');
      p.rect(1, 3, 2, 11, '#b84a68');
      p.rect(13, 3, 2, 11, '#b84a68');
      break;
    case 'J':
      // 서낭당: stone cairn with five-color ribbons
      grass(p);
      p.ell(8, 12, 7, 3.5, '#6a6a72');
      p.ell(8, 9, 5.5, 3, '#8a8a92');
      p.ell(8, 6, 4, 2.6, '#9a9aa2');
      p.ell(8, 3.5, 2.6, 2, '#aaaab2');
      p.ell(6, 5, 1.5, 0.8, '#c8c8d0');
      p.rect(7, 0, 2, 3, '#7a5a3a');
      for (const [x, c] of [[1, '#e84a4a'], [4, '#f0d040'], [11, '#3a7ad8'], [14, '#58b048']] as const) {
        p.rect(x, 4, 1, 6, c);
        p.set(x + (x < 8 ? 1 : -1), 9, c);
      }
      p.rect(7, 13, 2, 2, '#ffffff');
      break;
    case '_':
      caveFloor(p);
      break;
    case 'O':
      caveWall(p);
      p.ell(8, 10, 6, 7, '#26201e');
      p.rect(2, 10, 12, 6, '#26201e');
      p.ell(8, 10, 4.5, 5.5, '#100c0c');
      p.rect(3.5, 10, 9, 6, '#100c0c');
      break;
    case 'z':
      caveFloor(p);
      p.tri(3, 14, 8, 14, 5, 3, '#5ab8d8');
      p.tri(7, 14, 13, 14, 10, 1, '#78d8f0');
      p.tri(9, 14, 11, 14, 10, 5, '#c8f4ff');
      p.set(5, 7, '#ffffff');
      break;
    case '+': {
      p.rect(0, 0, 16, 16, '#4a9ee6');
      p.rect(0, 1, 16, 14, '#b8864a');
      for (const y of [4, 8, 12]) p.rect(0, y, 16, 1, '#8a5e32');
      p.rect(0, 1, 16, 1, '#d8a66a');
      p.set(3, 2, '#6a4422'); p.set(12, 6, '#6a4422'); p.set(7, 10, '#6a4422');
      break;
    }
    case 'l':
      grass(p);
      p.rect(7, 5, 2, 10, '#3a3a4a');
      p.rect(5, 14, 6, 2, '#3a3a4a');
      p.ell(8, 3.5, 3.5, 3, '#3a3a4a');
      p.ell(8, 3.5, 2.5, 2, '#ffe880');
      break;
    case 'w':
      wall(p);
      p.rect(3, 4, 10, 8, '#5a6a88');
      p.rect(4, 5, 8, 6, '#a8d8f8');
      p.rect(8, 5, 1, 6, '#5a6a88');
      p.rect(4, 8, 8, 1, '#5a6a88');
      p.set(5, 6, '#ffffff');
      break;
    case 'D':
      wall(p);
      p.rect(3, 3, 10, 13, '#6a3e22');
      p.rect(4, 4, 8, 12, '#a8683e');
      p.rect(8, 4, 1, 12, '#8a5432');
      p.set(10, 10, '#ffd84a');
      break;
    case 'X':
      p.rect(0, 0, 16, 16, '#d8cce8');
      for (let x = 2; x < 16; x += 4) p.rect(x, 0, 1, 12, '#c8bce0');
      p.rect(0, 12, 16, 4, '#9a86b8');
      p.rect(0, 12, 16, 1, '#7a6698');
      break;
    case 'o':
      floor(p);
      break;
    case 'T': case 'c':
      floor(p);
      p.rect(0, 2, 16, 12, '#8a5630');
      p.rect(0, 2, 16, 9, '#c88a56');
      p.rect(0, 2, 16, 1, '#dca070');
      if (ch === 'c') {
        p.rect(5, 2, 6, 7, '#3aa8a0');
        p.rect(6, 3, 4, 4, '#d8fff6');
        p.rect(5, 2, 6, 1, '#ffc840');
        p.rect(5, 8, 6, 1, '#ffc840');
      }
      break;
    case 'k': {
      p.rect(0, 0, 16, 16, '#7a4a2a');
      p.rect(1, 1, 14, 14, '#5a3418');
      const cols = ['#d85a5a', '#4a7ad8', '#58b048', '#e8b820', '#9a6ad8'];
      for (const sy of [1, 8]) {
        for (let i = 0; i < 6; i++) p.rect(2 + i * 2, sy + 1 + (i % 2), 2, 5 - (i % 2), cols[(i + sy) % cols.length]);
        p.rect(1, sy + 6, 14, 1, '#7a4a2a');
      }
      break;
    }
    case 'b':
      floor(p);
      p.rect(1, 0, 14, 16, '#6a4a3a');
      p.rect(2, 1, 12, 14, '#ffffff');
      p.rect(3, 2, 10, 4, '#e8ecff');
      p.rect(2, 7, 12, 8, '#e05a5a');
      p.rect(2, 7, 12, 1, '#f08a8a');
      break;
    case 'e':
      floor(p);
      p.rect(1, 3, 14, 11, '#f0d070');
      p.rect(2, 4, 12, 9, '#d85a5a');
      break;
    case 'P':
      floor(p);
      p.rect(2, 1, 12, 14, '#585e70');
      p.rect(3, 2, 10, 12, '#9098aa');
      p.rect(4, 3, 8, 6, '#58d0f0');
      p.rect(5, 4, 3, 1, '#c8f4ff');
      p.rect(4, 11, 8, 1, '#585e70');
      break;
    case 'r':
      floor(p);
      p.ell(8, 9, 6.5, 6.5, '#5a6068');
      p.ell(8, 8.5, 5.5, 5.5, '#9aa0a8');
      p.ell(6, 6, 2, 1.5, '#c8ccd4');
      p.rect(2, 14, 12, 2, '#6a5a50');
      break;
    default:
      p.rect(0, 0, 16, 16, '#000000');
  }
  return p;
}

const cache = new Map<string, HTMLCanvasElement>();
export function tileCanvas(ch: string, anim: number): HTMLCanvasElement {
  const animated = ch === '~' || ch === 'f';
  const key = animated ? ch + anim : ch;
  let c = cache.get(key);
  if (!c) {
    c = build(ch, animated ? anim : 0).toCanvas();
    cache.set(key, c);
  }
  return c;
}
