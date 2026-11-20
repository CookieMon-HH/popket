import { Pix } from '../engine/pix';
import { MON_DRAW, MON_SIZE } from './monsprites';
import type { Dir } from './common';

const OUT = '#26263a';
const EYE = '#1c1c28';

const monCache = new Map<string, HTMLCanvasElement>();
export function monSprite(species: string): HTMLCanvasElement {
  let c = monCache.get(species);
  if (!c) {
    const p = new Pix(MON_SIZE, MON_SIZE);
    (MON_DRAW[species] ?? MON_DRAW.tosil)(p);
    p.outline(OUT);
    c = p.toCanvas();
    monCache.set(species, c);
  }
  return c;
}

const backCache = new Map<string, HTMLCanvasElement>();
/**
 * The player's own monster seen from behind: the same body, but with the face
 * (eyes, mouth, cheeks and other small details) painted over with the
 * surrounding body colour.
 */
export function monBackSprite(species: string): HTMLCanvasElement {
  let c = backCache.get(species);
  if (!c) {
    const p = new Pix(MON_SIZE, MON_SIZE);
    (MON_DRAW[species] ?? MON_DRAW.tosil)(p);
    const count = new Map<string, number>();
    for (const col of p.d) if (col) count.set(col, (count.get(col) ?? 0) + 1);
    const isFace = (col: string) => col === EYE || col === '#ffffff' || (count.get(col) ?? 0) <= 6;
    for (let pass = 0; pass < 4; pass++) {
      const snap = p.d.slice();
      const at = (x: number, y: number) => (x < 0 || y < 0 || x >= p.w || y >= p.h ? null : snap[y * p.w + x]);
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const col = at(x, y);
          if (!col || !isFace(col)) continue;
          const nb = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
          if (nb.some((n) => !n)) continue; // keep the silhouette edge
          const votes = new Map<string, number>();
          for (const n of nb) if (n && !isFace(n)) votes.set(n, (votes.get(n) ?? 0) + 1);
          let best: string | null = null;
          let bestN = 0;
          for (const [k, v] of votes) if (v > bestN) [best, bestN] = [k, v];
          if (best) p.set(x, y, best);
        }
      }
    }
    p.outline(OUT);
    c = p.toCanvas();
    backCache.set(species, c);
  }
  return c;
}

// ---------------------------------------------------------------------------
// People (16x20)

export interface Pal {
  hair: string;
  shirt: string;
  pants: string;
  skin?: string;
  hat?: string;
}

const personCache = new Map<string, HTMLCanvasElement>();

function drawPerson(pal: Pal, dir: 'down' | 'up' | 'left', frame: number): Pix {
  const p = new Pix(16, 20);
  const S = pal.skin ?? '#f8d0a8';
  const shoe = '#383848';
  if (dir === 'left') {
    const fwd = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    if (fwd === 0) {
      p.rect(6, 15, 4, 4, pal.pants);
      p.rect(6, 18, 4, 1, shoe);
    } else {
      // Stride: front leg reaches out, back leg pushes off with the heel up.
      p.rect(7 + fwd * 2, 15, 2, 4, pal.pants);
      p.rect(7 + fwd * 2, 18, 2, 1, shoe);
      p.rect(7 - fwd, 15, 2, 3, pal.pants);
      p.rect(7 - fwd, 17, 2, 1, shoe);
    }
    p.rect(5, 10, 6, 6, pal.shirt);
    // Arm swings opposite to the front leg.
    p.rect(7 - fwd * 2, 11, 2, 4, pal.shirt);
    p.set(7 - fwd * 2, 14, S);
    p.ell(8, 6.5, 5, 5, S);
    p.ell(8.5, 4.5, 5, 3.6, pal.hair);
    p.rect(9, 5, 4, 4, pal.hair);
    p.rect(4, 7, 1, 2, EYE);
    if (pal.hat) {
      p.ell(8.5, 3.5, 5, 2.6, pal.hat);
      p.rect(2, 5, 5, 1, pal.hat);
    }
  } else {
    const lUp = frame === 1 ? 1 : 0;
    const rUp = frame === 3 ? 1 : 0;
    p.rect(5, 15, 2, 4 - lUp, pal.pants);
    p.rect(9, 15, 2, 4 - rUp, pal.pants);
    p.rect(5, 18 - lUp, 2, 1, shoe);
    p.rect(9, 18 - rUp, 2, 1, shoe);
    p.rect(4, 10, 8, 6, pal.shirt);
    // Arms swing: the arm on the side of the lifted leg goes back (up), the other forward (down).
    const la = lUp ? -1 : rUp ? 1 : 0;
    const ra = rUp ? -1 : lUp ? 1 : 0;
    p.rect(3, 11 + la, 1, 3, pal.shirt);
    p.rect(12, 11 + ra, 1, 3, pal.shirt);
    p.set(3, 14 + la, S);
    p.set(12, 14 + ra, S);
    p.ell(8, 6.5, 5, 5, S);
    if (dir === 'down') {
      p.ell(8, 4.5, 5.2, 3.6, pal.hair);
      p.rect(3, 5, 1, 3, pal.hair);
      p.rect(12, 5, 1, 3, pal.hair);
      p.rect(6, 7, 1, 2, EYE);
      p.rect(9, 7, 1, 2, EYE);
      if (pal.hat) {
        p.ell(8, 3.5, 5.4, 2.8, pal.hat);
        p.rect(4, 5, 8, 1, pal.hat);
      }
    } else {
      p.ell(8, 6, 5.2, 5, pal.hair);
      if (pal.hat) p.ell(8, 3.5, 5.4, 2.8, pal.hat);
    }
  }
  return p.outline(OUT);
}

export function personSprite(pal: Pal, dir: Dir, frame: number): HTMLCanvasElement {
  const key = `${pal.hair}${pal.shirt}${pal.pants}${pal.skin}${pal.hat}|${dir}|${frame}`;
  let c = personCache.get(key);
  if (!c) {
    const base = drawPerson(pal, dir === 'right' ? 'left' : dir, frame);
    c = (dir === 'right' ? base.flipped() : base).toCanvas();
    personCache.set(key, c);
  }
  return c;
}

// ---------------------------------------------------------------------------
// Small objects

let sackC: HTMLCanvasElement | null = null;
export function itemSprite(): HTMLCanvasElement {
  if (!sackC) {
    const p = new Pix(16, 16);
    p.ell(8, 10.5, 5, 4.5, '#c8945a');
    p.ell(8, 5, 3, 1.5, '#c8945a');
    p.rect(6, 6, 4, 2, '#8a5a30');
    p.ell(6, 9, 1.5, 1.2, '#e8bc84');
    p.outline(OUT);
    sackC = p.toCanvas();
  }
  return sackC;
}

let capsuleC: HTMLCanvasElement | null = null;
/** 팜팜볼 — a lantern-shaped capture capsule. */
export function capsuleSprite(): HTMLCanvasElement {
  if (!capsuleC) {
    const p = new Pix(10, 10);
    p.rect(2, 1, 6, 8, '#3aa8a0');
    p.rect(1, 2, 8, 6, '#3aa8a0');
    p.rect(2, 3, 6, 4, '#d8fff6');
    p.rect(3, 4, 2, 1, '#ffffff');
    p.rect(1, 1, 8, 1, '#ffc840');
    p.rect(1, 8, 8, 1, '#ffc840');
    p.outline(OUT);
    capsuleC = p.toCanvas();
  }
  return capsuleC;
}

// ---------------------------------------------------------------------------
// Puzzle objects

let boulderC: HTMLCanvasElement | null = null;
export function boulderSprite(): HTMLCanvasElement {
  if (!boulderC) {
    const p = new Pix(16, 16);
    p.ell(8, 9, 7, 6.5, '#7a7680');
    p.ell(8, 8.5, 6, 5.5, '#9a96a0');
    p.ell(5.5, 6, 2.5, 1.6, '#c8c4cc');
    p.rect(9, 10, 3, 1, '#6a6670'); p.rect(4, 11, 2, 1, '#6a6670');
    p.outline(OUT);
    boulderC = p.toCanvas();
  }
  return boulderC;
}

const barrierCache = new Map<string, HTMLCanvasElement>();
export function barrierSprite(kind: 'water' | 'electric' | 'stone', frame: number): HTMLCanvasElement {
  const f = kind === 'electric' ? Math.floor(frame / 8) % 2 : 0;
  const key = kind + f;
  let c = barrierCache.get(key);
  if (!c) {
    const p = new Pix(16, 16);
    if (kind === 'water') {
      p.rect(0, 2, 16, 13, '#2a5a8a');
      for (const x of [1, 5, 9, 13]) p.rect(x, 2, 2, 13, '#7ac0f0');
      p.rect(0, 2, 16, 2, '#4a6a8a'); p.rect(0, 13, 16, 2, '#4a6a8a');
    } else if (kind === 'electric') {
      p.rect(1, 1, 2, 15, '#6a6a7a'); p.rect(13, 1, 2, 15, '#6a6a7a');
      p.ell(2, 1.5, 1.8, 1.5, '#ffe040'); p.ell(14, 1.5, 1.8, 1.5, '#ffe040');
      for (const y of [4, 8, 12]) for (let x = 3; x < 13; x++) p.set(x, y + ((x + f) % 2), f ? '#fff6a0' : '#ffd040');
    } else {
      p.rect(0, 0, 16, 16, '#5a4a6a');
      p.rect(1, 1, 14, 14, '#7a6a8a');
      p.ell(8, 8, 4, 4, '#e8c860'); p.ell(8, 8, 2, 2, '#7a6a8a');
      p.rect(0, 7, 16, 2, '#3a2e48');
    }
    p.outline(OUT);
    c = p.toCanvas();
    barrierCache.set(key, c);
  }
  return c;
}
