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
      p.rect(7 + fwd, 15, 2, 4, pal.pants);
      p.rect(7 - fwd, 15, 2, 3, pal.pants);
      p.rect(7 + fwd, 18, 2, 1, shoe);
    }
    p.rect(5, 10, 6, 6, pal.shirt);
    p.rect(7 - fwd, 11, 2, 4, pal.shirt);
    p.set(7 - fwd, 14, S);
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
    p.rect(3, 11, 1, 3, pal.shirt);
    p.rect(12, 11, 1, 3, pal.shirt);
    p.set(3, 14, S);
    p.set(12, 14, S);
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
