import { Pix } from '../engine/pix';
import { MON_SIZE } from './monsprites';

// ---------------------------------------------------------------------------
// Art style v2 (sample set, behind the `?art2` URL flag until approved).
//
// - Every colour comes from a 5-step ramp: outline · dark · base · light · highlight,
//   hue-shifted (shadows lean cool/purple, lights lean warm/yellow).
// - One light source: top-left, slightly in front. Round parts are shaded as
//   ellipsoids, flat parts get a bevel (lit top-left edge, dark bottom-right edge).
// - Selective outline: each part is outlined in its own darkest ramp colour, which
//   also draws the contour where it overlaps a part behind it. No flat black outline.
// - Faces: dark-violet eye frame (never pure black), coloured iris, two highlights;
//   mouths use a dark warm colour.
// - Each monster has a real back view instead of an auto-erased face.

type RGB = [number, number, number];
const toRgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

function rgbToHsl([r, g, b]: RGB): RGB {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb([h, s, l]: RGB): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
/** Move hue `h` up to `deg` degrees toward `target`. */
function hueToward(h: number, target: number, deg: number) {
  let d = target - h;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return h + Math.sign(d) * Math.min(Math.abs(d), deg);
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface Ramp { o: string; d: string; b: string; l: string; h: string }

/** Build a hue-shifted 5-step ramp around a base colour. */
export function ramp(base: string): Ramp {
  const [h, s, l] = rgbToHsl(toRgb(base));
  const mk = (dl: number, hueTarget: number, deg: number, ds: number) =>
    toHex(hslToRgb([hueToward(h, hueTarget, s < 0.08 ? 0 : deg), clamp01(s + ds), clamp01(l + dl)]));
  return {
    o: mk(-Math.min(0.42, l * 0.62), 255, 22, 0.05),
    d: mk(-Math.min(0.13, l * 0.24), 250, 6, 0.02),
    b: base,
    l: mk(Math.min(0.1, (1 - l) * 0.4), 55, 6, -0.05),
    h: mk(Math.min(0.17, (1 - l) * 0.6), 55, 14, -0.08),
  };
}
/** A ramp given explicitly (for glowing materials such as fire and lava). */
const fixed = (o: string, d: string, b: string, l: string, h: string): Ramp => ({ o, d, b, l, h });
const FIRE = fixed('#8a1e10', '#d8401a', '#ff7a2a', '#ffc040', '#fff4c0');
const LAVA = fixed('#5a1a0e', '#c8361a', '#ff6a24', '#ffb040', '#fff0b0');

// Light: top-left and toward the viewer. Back views are drawn mirrored and then flipped
// to face right (toward the enemy), so their light is mirrored while drawing.
const LX = -0.55, LY = -0.62, LZ = 0.56;
let mirrored = false;

type Shade = { kind: 'sphere'; cx: number; cy: number; rx: number; ry: number; spec?: boolean } | { kind: 'bevel' } | { kind: 'glow'; cx: number; cy: number; rx: number; ry: number } | { kind: 'flat' };

/**
 * Draw one body part: `shape` paints its silhouette into a mask, the mask is shaded
 * with `r`, and (unless `line` is false) a contour in the ramp's outline colour is
 * drawn around it — over whatever was drawn before.
 */
export function part(p: Pix, r: Ramp, shape: (m: Pix) => void, shade: Shade = { kind: 'bevel' }, line = true) {
  const m = new Pix(p.w, p.h);
  shape(m);
  const inM = (x: number, y: number) => m.get(x, y) !== null;
  if (line) {
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      if (inM(x, y)) continue;
      if (!(inM(x - 1, y) || inM(x + 1, y) || inM(x, y - 1) || inM(x, y + 1))) continue;
      // Outer edge: the dark outline. Over another part: a softer inner line in the
      // front part's shadow colour, so overlaps read without a busy black grid.
      p.set(x, y, p.get(x, y) ? r.d : r.o);
    }
  }
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (!inM(x, y)) continue;
    let c = r.b;
    if (shade.kind === 'sphere' || shade.kind === 'glow') {
      const dx = (x + 0.5 - shade.cx) / shade.rx;
      const dy = (y + 0.5 - shade.cy) / shade.ry;
      const d2 = Math.min(1, dx * dx + dy * dy);
      if (shade.kind === 'glow') {
        const k = 1 - Math.sqrt(d2);
        c = k > 0.72 ? r.h : k > 0.45 ? r.l : k > 0.18 ? r.b : r.d;
      } else {
        const nz = Math.sqrt(1 - d2);
        const dot = (mirrored ? -LX : LX) * dx + LY * dy + LZ * nz;
        c = dot > 0.965 && shade.spec !== false ? r.h : dot > 0.6 ? r.l : dot > -0.12 ? r.b : r.d;
      }
    } else if (shade.kind === 'bevel') {
      const sx = mirrored ? -1 : 1;
      if (!inM(x - sx, y) || !inM(x, y - 1)) c = r.l;
      else if (!inM(x + sx, y) || !inM(x, y + 1)) c = r.d;
    }
    p.set(x, y, c);
  }
}
const sph = (cx: number, cy: number, rx: number, ry: number, spec = true): Shade => ({ kind: 'sphere', cx, cy, rx, ry, spec });
const glow = (cx: number, cy: number, rx: number, ry: number): Shade => ({ kind: 'glow', cx, cy, rx, ry });
const FLAT: Shade = { kind: 'flat' };

/** Close any gaps in the outer silhouette with a darkened copy of the neighbouring colour. */
function seal(p: Pix) {
  const src = p.d.slice();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= p.w || y >= p.h ? null : src[y * p.w + x]);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (at(x, y)) continue;
    const n = at(x + 1, y) ?? at(x, y + 1) ?? at(x - 1, y) ?? at(x, y - 1);
    if (!n) continue;
    const [r, g, b] = toRgb(n);
    // already-dark contour pixels do not need another ring
    if (r + g + b < 200) continue;
    p.set(x, y, ramp(n).o);
  }
}

const LASH = '#221a30';
const WHITE = '#ffffff';
/** 3×4 eye: dark frame, coloured iris, a big and a small highlight. Faces left. */
function eye(p: Pix, x: number, y: number, iris: string) {
  const ir = ramp(iris);
  p.rect(x, y, 3, 4, LASH);
  p.set(x, y, WHITE); p.set(x + 1, y, WHITE); // big highlight, top-left (toward the light)
  p.set(x, y + 2, ir.o); p.set(x + 1, y + 2, ir.o);
  p.set(x + 2, y + 2, WHITE); // small second highlight
  p.set(x, y + 3, ir.b); p.set(x + 1, y + 3, ir.l); p.set(x + 2, y + 3, ir.d); // iris glows at the bottom
}
/** Narrow, fierce eye for evolved forms. */
function fierceEye(p: Pix, x: number, y: number, iris: string) {
  p.rect(x, y, 4, 2, LASH);
  p.set(x, y, iris); p.set(x + 1, y, ramp(iris).h); p.set(x + 2, y + 1, iris);
  p.line(x - 1, y - 2, x + 4, y - 1, LASH);
}
function star4(p: Pix, x: number, y: number, c: string, glowC: string) {
  p.set(x, y, c);
  p.set(x - 1, y, glowC); p.set(x + 1, y, glowC); p.set(x, y - 1, glowC); p.set(x, y + 1, glowC);
}

const mk = (draw: (p: Pix) => void) => () => {
  const p = new Pix(MON_SIZE, MON_SIZE);
  draw(p);
  seal(p);
  return p;
};
/** Back view: drawn in the same left-facing layout, returned facing right (toward the enemy). */
const mkBack = (draw: (p: Pix) => void) => () => {
  mirrored = true;
  try {
    return mk(draw)().flipped();
  } finally {
    mirrored = false;
  }
};

// ---------------------------------------------------------------------------

const MODAK = { body: ramp('#f28a3a'), belly: ramp('#ffd8a0'), frill: ramp('#e8402a'), frillIn: ramp('#ff8a48'), horn: ramp('#fff0d0'), spike: ramp('#ffd040') };
const PONG = { body: ramp('#7ab8e8'), belly: ramp('#eef8ff'), drop: ramp('#a8e4ff'), spot: '#5a98d0' };
const SAESUN = { body: ramp('#a8d070'), belly: ramp('#f0f8d8'), leaf: ramp('#3aa848'), ear: '#f0c8b8' };
const HWASAN = { body: ramp('#a43e1e'), rock: ramp('#5a4e58'), belly: ramp('#d0784a'), horn: ramp('#ece2d0') };
const EUNHA = { body: ramp('#2e3e92'), belly: ramp('#94b8f4'), star: '#fff8c8', glowC: '#9ad8ff', moon: ramp('#fff0b8') };

/** front faces left (toward the player); back faces right (toward the enemy). */
export const MON_V2: Record<string, { front: () => Pix; back: () => Pix }> = {
  modak: {
    front: mk((p) => {
      const { body, belly, frill, frillIn, horn, spike } = MODAK;
      const legFar = ramp(body.d);
      part(p, legFar, (m) => { m.rect(14, 31, 4, 6, 'x'); m.rect(28, 31, 4, 6, 'x'); });
      part(p, body, (m) => m.tri(30, 24, 39, 28, 30, 31, 'x'), sph(32, 26, 8, 5));
      part(p, FIRE, (m) => m.ell(38, 27, 2.2, 3, 'x'), glow(38, 28.5, 2.2, 3));
      part(p, spike, (m) => { m.tri(9, 12, 12, 11, 8, 6, 'x'); m.tri(13, 9, 17, 9, 15, 3, 'x'); m.tri(18, 10, 21, 12, 23, 6, 'x'); });
      part(p, frill, (m) => m.ell(15, 16, 7, 7.5, 'x'), sph(15, 16, 7, 7.5));
      part(p, frillIn, (m) => m.ell(15, 16, 4.5, 5, 'x'), glow(15, 17, 4.5, 5), false);
      part(p, body, (m) => m.ell(23, 26, 11, 8, 'x'), sph(23, 25, 11, 8));
      part(p, belly, (m) => m.ell(22, 30.5, 8, 3, 'x'), sph(22, 27, 9, 6, false), false);
      part(p, ramp(body.d), (m) => { m.ell(25, 20, 2, 1.2, 'x'); m.ell(30, 22, 1.6, 1, 'x'); }, FLAT, false);
      part(p, body, (m) => m.ell(11, 22, 7.5, 6.5, 'x'), sph(11, 21, 7.5, 6.5));
      part(p, belly, (m) => m.ell(6, 24.5, 3.5, 3, 'x'), sph(6, 23, 4, 3.5, false), false);
      part(p, horn, (m) => m.tri(4, 21, 7, 20, 3, 16, 'x'));
      part(p, horn, (m) => m.tri(10, 16, 13, 16, 12, 12, 'x'));
      part(p, body, (m) => { m.rect(9, 31, 5, 7, 'x'); m.rect(23, 31, 5, 7, 'x'); });
      for (const x of [10, 12, 24, 26]) p.set(x, 37, belly.l);
      eye(p, 9, 19, '#5a3018');
      p.set(5, 26, '#7a2a1c'); p.set(6, 27, '#7a2a1c'); p.set(7, 27, '#7a2a1c'); p.set(6, 26, '#c8503a');
      p.set(13, 24, '#ff9a8a'); p.set(14, 24, '#ff9a8a');
    }),
    back: mkBack((p) => {
      const { body, frill, frillIn, spike, horn } = MODAK;
      part(p, ramp(body.d), (m) => { m.rect(14, 31, 4, 6, 'x'); m.rect(28, 31, 4, 6, 'x'); });
      part(p, body, (m) => m.tri(28, 23, 39, 27, 28, 32, 'x'), sph(32, 26, 8, 5));
      part(p, FIRE, (m) => m.ell(38, 26, 2.5, 3.4, 'x'), glow(38, 27.5, 2.5, 3.4));
      part(p, horn, (m) => m.tri(3, 22, 7, 21, 2, 17, 'x'));
      part(p, body, (m) => m.ell(23, 26, 11, 8, 'x'), sph(23, 25, 11, 8));
      // ridge along the back
      for (const [x, y] of [[20, 18], [25, 18], [30, 20]] as const) part(p, spike, (m) => m.tri(x - 2, y + 1, x + 2, y + 1, x, y - 2, 'x'));
      part(p, body, (m) => m.ell(11, 22, 7, 6, 'x'), sph(11, 21, 7, 6));
      part(p, spike, (m) => { m.tri(7, 11, 11, 10, 7, 4, 'x'); m.tri(12, 8, 17, 8, 15, 1, 'x'); m.tri(18, 9, 22, 11, 23, 4, 'x'); });
      // the back of the frill faces us: big and bright-rimmed
      part(p, frill, (m) => m.ell(15, 15, 8, 7.5, 'x'), sph(13, 12, 11, 11, false));
      part(p, ramp(frill.d), (m) => { for (const x of [11, 15, 19]) m.line(x, 9, 15 + (x - 15) * 0.4, 20, 'x'); }, FLAT, false);
      part(p, body, (m) => { m.rect(9, 31, 5, 7, 'x'); m.rect(23, 31, 5, 7, 'x'); });
    }),
  },
  pong: {
    front: mk((p) => {
      const { body, belly, drop, spot } = PONG;
      part(p, ramp(body.d), (m) => m.tri(31, 30, 39, 25, 39, 35, 'x'));
      part(p, body, (m) => m.ell(22, 29, 12.5, 7.5, 'x'), sph(22, 27, 12.5, 8));
      for (const [x, y, rx, ry] of [[26, 25, 1.6, 1], [31, 28, 1.3, 1], [22, 24, 1.3, 0.8]] as const) p.ell(x, y, rx, ry, spot);
      part(p, belly, (m) => m.ell(20, 33.5, 9, 2.6, 'x'), sph(20, 29, 10, 6, false), false);
      part(p, drop, (m) => { m.ell(13, 13, 2.4, 3, 'x'); m.tri(12, 12, 14, 12, 13, 7, 'x'); }, sph(12.5, 12, 2.6, 4));
      part(p, body, (m) => m.ell(12, 22, 9, 8, 'x'), sph(12, 21, 9, 8));
      part(p, belly, (m) => m.ell(10, 26.5, 5, 3, 'x'), sph(10, 25, 6, 4, false), false);
      part(p, ramp(body.d), (m) => m.ell(16, 34, 4.5, 2, 'x'), sph(16, 33, 4.5, 2.5));
      eye(p, 6, 19, '#1e4a8a'); eye(p, 14, 19, '#1e4a8a');
      p.rect(9, 25, 3, 2, '#2a3050'); p.set(9, 25, '#5a6a90');
      p.set(8, 27, '#2a3050'); p.set(12, 27, '#2a3050'); p.set(9, 28, '#c8506a'); p.set(10, 28, '#c8506a'); p.set(11, 28, '#c8506a');
      for (const [x, y] of [[4, 26], [3, 25], [16, 26], [17, 25]] as const) p.set(x, y, body.d);
      p.set(5, 24, '#ff9ab0'); p.set(17, 23, '#ff9ab0');
    }),
    back: mkBack((p) => {
      const { body, drop, spot } = PONG;
      part(p, body, (m) => m.ell(22, 29, 12.5, 7.5, 'x'), sph(22, 27, 12.5, 8));
      for (const [x, y, rx, ry] of [[26, 25, 1.6, 1], [31, 28, 1.3, 1], [22, 24, 1.3, 0.8], [18, 30, 1.2, 0.8]] as const) p.ell(x, y, rx, ry, spot);
      part(p, ramp(body.d), (m) => m.tri(30, 31, 39, 25, 39, 36, 'x'));
      part(p, body, (m) => m.ell(12, 21, 9, 8, 'x'), sph(12, 20, 9, 8));
      p.ell(9, 18, 1.4, 1, spot); p.ell(15, 23, 1.2, 0.8, spot);
      part(p, drop, (m) => { m.ell(12, 12, 2.6, 3.2, 'x'); m.tri(11, 11, 13, 11, 12, 5, 'x'); }, sph(11.5, 11, 2.8, 4));
      part(p, ramp(body.d), (m) => m.ell(18, 34, 5, 2.2, 'x'), sph(18, 33, 5, 2.5));
    }),
  },
  saesun: {
    front: mk((p) => {
      const { body, belly, leaf, ear } = SAESUN;
      const far = ramp(body.d);
      part(p, far, (m) => { m.rect(17, 28, 2, 9, 'x'); m.rect(29, 28, 2, 9, 'x'); });
      part(p, belly, (m) => m.ell(33, 21, 2.2, 2.2, 'x'), sph(33, 21, 2.2, 2.2));
      part(p, body, (m) => m.ell(24, 24, 9.5, 5.5, 'x'), sph(24, 23, 9.5, 6));
      for (const [x, y] of [[23, 21], [27, 22], [30, 20], [20, 23]] as const) { p.set(x, y, belly.l); p.set(x + 1, y, belly.b); }
      part(p, belly, (m) => m.ell(24, 27.5, 6, 2, 'x'), sph(24, 25, 7, 4, false), false);
      part(p, body, (m) => m.ell(16, 19, 3, 5, 'x'), sph(16, 18, 3, 5));
      part(p, body, (m) => m.ell(16, 10, 3.6, 1.7, 'x'), sph(16, 10, 3.6, 1.7, false));
      p.ell(16.5, 10, 2, 0.7, ear);
      part(p, body, (m) => m.ell(12, 14, 5.5, 5, 'x'), sph(12, 13, 5.5, 5));
      part(p, belly, (m) => m.ell(7.5, 16.5, 3.2, 2.5, 'x'), sph(7.5, 15.5, 3.5, 3, false), false);
      part(p, ramp('#5a8a3a'), (m) => m.line(12, 9, 12, 6, 'x'), FLAT, false);
      part(p, leaf, (m) => m.ell(9.5, 5, 2.8, 1.5, 'x'), sph(9.5, 4.6, 2.8, 1.6, false));
      part(p, leaf, (m) => m.ell(14.5, 4.5, 2.8, 1.5, 'x'), sph(14.5, 4.1, 2.8, 1.6, false));
      p.set(9, 5, leaf.d); p.set(10, 5, leaf.d); p.set(14, 4, leaf.d); p.set(15, 4, leaf.d);
      part(p, body, (m) => { m.rect(14, 28, 2, 10, 'x'); m.rect(26, 28, 2, 10, 'x'); });
      p.rect(14, 37, 2, 1, '#5a4030'); p.rect(26, 37, 2, 1, '#5a4030');
      eye(p, 9, 12, '#5a3a20');
      p.set(5, 16, '#3a2a28'); p.set(5, 15, '#6a5048');
      p.set(7, 18, '#8a4a3a');
      p.set(12, 17, '#ffb0a0'); p.set(13, 17, '#ffc8b8');
    }),
    back: mkBack((p) => {
      const { body, belly, leaf, ear } = SAESUN;
      part(p, ramp(body.d), (m) => { m.rect(17, 28, 2, 9, 'x'); m.rect(29, 28, 2, 9, 'x'); });
      part(p, body, (m) => m.ell(24, 24, 9.5, 5.5, 'x'), sph(24, 23, 9.5, 6));
      for (const [x, y] of [[23, 21], [27, 22], [30, 20], [20, 23], [25, 25], [18, 22]] as const) { p.set(x, y, belly.l); p.set(x + 1, y, belly.b); }
      part(p, belly, (m) => m.ell(33, 21.5, 2.4, 2.4, 'x'), sph(32.5, 21, 2.4, 2.4, false));
      part(p, body, (m) => m.ell(16, 19, 3, 5, 'x'), sph(16, 18, 3, 5));
      part(p, body, (m) => m.ell(12, 14, 5.5, 5, 'x'), sph(12, 13, 5.5, 5));
      part(p, body, (m) => m.ell(17, 10, 3.6, 1.7, 'x'), sph(17, 10, 3.6, 1.7, false));
      part(p, body, (m) => m.ell(7, 11, 3, 1.5, 'x'), sph(7, 11, 3, 1.5, false));
      p.ell(17, 10, 2, 0.7, ear);
      part(p, ramp('#5a8a3a'), (m) => m.line(12, 9, 12, 6, 'x'), FLAT, false);
      part(p, leaf, (m) => m.ell(9.5, 5, 2.8, 1.5, 'x'), sph(9.5, 4.6, 2.8, 1.6, false));
      part(p, leaf, (m) => m.ell(14.5, 4.5, 2.8, 1.5, 'x'), sph(14.5, 4.1, 2.8, 1.6, false));
      part(p, body, (m) => { m.rect(14, 28, 2, 10, 'x'); m.rect(26, 28, 2, 10, 'x'); });
      p.rect(14, 37, 2, 1, '#5a4030'); p.rect(26, 37, 2, 1, '#5a4030');
    }),
  },
  hwasan: {
    front: mk((p) => {
      const { body, rock, belly, horn } = HWASAN;
      const crack = (m: Pix, pts: [number, number, number, number][]) => { for (const [a, b, c, d] of pts) m.line(a, b, c, d, 'x'); };
      part(p, ramp(body.d), (m) => { m.rect(12, 29, 6, 9, 'x'); m.rect(30, 29, 6, 9, 'x'); });
      part(p, body, (m) => m.tri(31, 20, 40, 26, 31, 30, 'x'), sph(33, 24, 8, 6));
      part(p, rock, (m) => { m.tri(17, 17, 24, 17, 21, 7, 'x'); m.tri(24, 17, 31, 17, 28, 9, 'x'); m.tri(30, 20, 36, 20, 34, 12, 'x'); });
      part(p, LAVA, (m) => crack(m, [[21, 10, 21, 16], [28, 12, 28, 16], [34, 15, 34, 19]]), FLAT, false);
      part(p, body, (m) => m.ell(24, 24, 13.5, 9.5, 'x'), sph(24, 23, 13.5, 9.5));
      part(p, LAVA, (m) => crack(m, [[20, 21, 24, 26], [24, 26, 23, 29], [29, 22, 31, 27], [14, 24, 16, 28]]), FLAT, false);
      for (const [x, y] of [[22, 23], [30, 24], [15, 26]] as const) p.set(x, y, LAVA.h);
      // volcano crater on the head with an eruption
      part(p, rock, (m) => m.ell(12, 12, 9, 9, 'x'), sph(12, 12, 9, 9));
      part(p, ramp('#2a2228'), (m) => m.ell(12, 12, 6.5, 6.5, 'x'), glow(13, 13, 6.5, 6.5), false);
      part(p, LAVA, (m) => m.ell(12, 12, 4, 4, 'x'), glow(12, 12.5, 4, 4), false);
      part(p, FIRE, (m) => { m.ell(12, 4.5, 2.8, 3.8, 'x'); m.tri(10, 4, 14, 4, 12, -1, 'x'); }, glow(12, 6, 2.8, 4.5));
      part(p, body, (m) => m.ell(9, 20, 8, 7, 'x'), sph(9, 19, 8, 7));
      part(p, belly, (m) => m.ell(3, 23, 3.5, 3.5, 'x'), sph(3, 22, 3.8, 3.8));
      part(p, horn, (m) => { m.tri(5, 15, 8, 15, 2, 5, 'x'); m.tri(11, 15, 14, 15, 13, 5, 'x'); m.tri(1, 21, 4, 19, 0, 14, 'x'); });
      part(p, body, (m) => { m.rect(7, 29, 7, 9, 'x'); m.rect(23, 29, 7, 9, 'x'); });
      part(p, rock, (m) => { m.rect(7, 33, 7, 2, 'x'); m.rect(23, 33, 7, 2, 'x'); }, FLAT, false);
      for (const x of [8, 10, 12, 24, 26, 28]) p.set(x, 37, horn.d);
      part(p, belly, (m) => m.ell(22, 30.5, 9, 3, 'x'), sph(22, 27, 10, 6, false), false);
      fierceEye(p, 5, 18, '#ffd040');
      p.line(1, 25, 5, 26, '#4a1408'); p.set(2, 26, '#ff8a3a');
    }),
    back: mkBack((p) => {
      const { body, rock, horn } = HWASAN;
      part(p, ramp(body.d), (m) => { m.rect(12, 29, 6, 9, 'x'); m.rect(30, 29, 6, 9, 'x'); });
      part(p, body, (m) => m.tri(30, 19, 40, 26, 30, 32, 'x'), sph(33, 24, 8, 6));
      part(p, body, (m) => m.ell(24, 24, 13.5, 9.5, 'x'), sph(24, 23, 13.5, 9.5));
      // the rock plates run down the back and face the viewer
      for (const [x, y, h] of [[18, 17, 10], [25, 15, 11], [32, 18, 8], [21, 23, 6], [29, 24, 5]] as const) {
        part(p, rock, (m) => m.tri(x - 3, y + 1, x + 3, y + 1, x, y + 1 - h, 'x'));
        part(p, LAVA, (m) => m.line(x, y - h + 4, x, y, 'x'), FLAT, false);
      }
      part(p, body, (m) => m.ell(9, 20, 7.5, 6.5, 'x'), sph(9, 19, 7.5, 6.5));
      part(p, horn, (m) => { m.tri(4, 15, 7, 15, 1, 6, 'x'); m.tri(10, 15, 13, 15, 12, 6, 'x'); });
      part(p, rock, (m) => m.ell(12, 12, 9, 9, 'x'), sph(12, 12, 9, 9));
      part(p, ramp('#2a2228'), (m) => m.ell(12, 11, 6, 5.5, 'x'), glow(12, 12, 6, 5.5), false);
      part(p, LAVA, (m) => m.ell(12, 11, 3.6, 3.2, 'x'), glow(12, 11.5, 3.6, 3.2), false);
      part(p, FIRE, (m) => { m.ell(12, 4, 3, 4, 'x'); m.tri(10, 3, 14, 3, 12, -2, 'x'); }, glow(12, 6, 3, 4.5));
      part(p, body, (m) => { m.rect(7, 29, 7, 9, 'x'); m.rect(23, 29, 7, 9, 'x'); });
      part(p, rock, (m) => { m.rect(7, 33, 7, 2, 'x'); m.rect(23, 33, 7, 2, 'x'); }, FLAT, false);
    }),
  },
  eunha: {
    front: mk((p) => {
      const { body, belly, star, glowC, moon } = EUNHA;
      part(p, body, (m) => { m.tri(29, 18, 40, 6, 38, 20, 'x'); m.tri(29, 20, 38, 20, 40, 32, 'x'); }, sph(34, 19, 8, 12));
      p.set(39, 7, glowC); p.set(38, 8, glowC); p.set(39, 31, glowC); p.set(38, 30, glowC);
      part(p, body, (m) => m.ell(17, 20, 16, 11, 'x'), sph(16, 18, 16, 11));
      part(p, belly, (m) => m.ell(15, 25.5, 12, 4, 'x'), sph(14, 22, 13, 7, false), false);
      for (const x of [8, 12, 16, 20, 24]) p.line(x, 24, x + 1, 28, belly.d);
      part(p, ramp(body.d), (m) => m.tri(12, 27, 20, 27, 13, 36, 'x'), sph(15, 29, 5, 6));
      // the galaxy on its back: stars with glow, a few distant specks
      for (const [x, y] of [[9, 14], [23, 15], [27, 12], [21, 19], [13, 17], [29, 18]] as const) p.set(x, y, star);
      for (const [x, y] of [[11, 11], [19, 14], [25, 17], [31, 15], [6, 17]] as const) p.set(x, y, body.l);
      star4(p, 17, 11, WHITE, glowC);
      p.ell(7, 13, 2.6, 2.6, moon.b); p.ell(8.2, 12.3, 2.2, 2.2, body.b); p.set(5, 12, moon.h);
      eye(p, 5, 18, '#3a6ae0');
      p.line(2, 23, 6, 23, body.o); p.set(3, 24, '#8a3a5a');
    }),
    back: mkBack((p) => {
      const { body, star, glowC, moon } = EUNHA;
      part(p, body, (m) => { m.tri(29, 18, 40, 5, 38, 20, 'x'); m.tri(29, 20, 38, 20, 40, 33, 'x'); }, sph(34, 19, 8, 12));
      part(p, body, (m) => m.ell(17, 20, 16, 11, 'x'), sph(16, 18, 16, 11));
      for (const [x, y] of [[9, 14], [17, 12], [23, 15], [27, 12], [21, 19], [13, 17], [29, 18], [6, 18], [16, 24], [24, 23], [10, 22]] as const) p.set(x, y, star);
      for (const [x, y] of [[11, 11], [19, 15], [25, 18], [31, 15], [6, 21], [20, 27]] as const) p.set(x, y, body.l);
      star4(p, 18, 10, WHITE, glowC); star4(p, 26, 20, star, glowC);
      p.ell(7, 13, 2.6, 2.6, moon.b); p.ell(8.2, 12.3, 2.2, 2.2, body.b); p.set(5, 12, moon.h);
      part(p, ramp(body.d), (m) => m.tri(14, 26, 23, 26, 16, 36, 'x'), sph(17, 29, 5, 6));
    }),
  },
};

/** `?art2` turns on the v2 sample sprites. */
export const ART_V2 = typeof location !== 'undefined' && new URLSearchParams(location.search).has('art2');
