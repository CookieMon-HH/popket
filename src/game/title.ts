import { W, H, FONT_FAMILY, drawSprite, text, type Ctx } from '../engine/draw';
import { clock } from '../engine/timing';
import { input } from '../engine/input';
import { ui } from '../engine/ui';
import type { Scene } from '../engine/scene';
import { silhouette } from '../engine/pix';
import { monSprite, capsuleSprite } from './sprites';

// ---------------------------------------------------------------------------
// Title screen: dawn over the 해솔 region.
// The static landscape is rendered once per screen width; clouds, monsters,
// sparkles and the logo animate on top.

const HORIZON = 118;

/** Deterministic value noise so the skyline is the same every time. */
function ridge(x: number, seed: number, amp: number[], freq: number[]) {
  let v = 0;
  for (let i = 0; i < amp.length; i++) v += Math.sin(x * freq[i] + seed * (i + 1) * 1.7) * amp[i];
  return v;
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dither = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)] / 16;

const SKY: [number, string][] = [
  [0, '#1c2a66'],
  [0.18, '#2f3f8e'],
  [0.36, '#5a5fb4'],
  [0.52, '#9a6fc0'],
  [0.66, '#e88aa8'],
  [0.8, '#ffb07a'],
  [0.92, '#ffd88a'],
  [1, '#fff0b8'],
];

function skyColor(t: number, d: number) {
  // Banded gradient with ordered dithering between bands.
  for (let i = 0; i < SKY.length - 1; i++) {
    const [a, ca] = SKY[i];
    const [b, cb] = SKY[i + 1];
    if (t <= b) return (t - a) / (b - a) > d ? cb : ca;
  }
  return SKY[SKY.length - 1][1];
}

let bgCache: { w: number; c: HTMLCanvasElement } | null = null;

function background(): HTMLCanvasElement {
  if (bgCache && bgCache.w === W) return bgCache.c;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const px = (x: number, y: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, 1, 1);
  };

  // Sky
  for (let y = 0; y < HORIZON; y++) {
    for (let x = 0; x < W; x++) px(x, y, skyColor(y / HORIZON, dither(x, y)));
  }
  // Stars in the upper sky
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < W * 0.35; i++) {
    const x = Math.floor(rnd() * W);
    const y = Math.floor(rnd() * 44);
    px(x, y, rnd() < 0.25 ? '#ffffff' : '#9fb0ff');
  }

  // Rising sun with halo rings
  const sx = Math.round(W * 0.74);
  const sy = HORIZON - 40;
  for (let y = sy - 34; y <= sy + 34; y++) {
    for (let x = sx - 34; x <= sx + 34; x++) {
      const r = Math.hypot(x - sx, (y - sy) * 1.05);
      if (r < 15) px(x, y, r < 12 ? '#fffbe6' : '#ffeaa0');
      else if (r < 22 && dither(x, y) < 0.5 - (r - 15) / 16) px(x, y, '#ffe0a0');
      else if (r < 32 && dither(x, y) < 0.22 - (r - 22) / 48) px(x, y, '#ffd0a0');
    }
  }

  // Far mountains (snow-capped)
  for (let x = 0; x < W; x++) {
    const top = Math.round(HORIZON - 26 - ridge(x, 1, [12, 6, 3], [0.021, 0.057, 0.13]));
    for (let y = top; y < HORIZON + 6; y++) {
      const depth = y - top;
      let col = depth < 3 && top < HORIZON - 30 ? '#f4f0ff' : '#7a6aae';
      if (depth >= 3 && x % 2 === 0 && dither(x, y) < 0.3 && depth < 10) col = '#8a7abc';
      px(x, y, col);
    }
  }
  // Mid hills with a fringe of pine trees
  for (let x = 0; x < W; x++) {
    const top = Math.round(HORIZON - 6 - ridge(x, 4, [7, 4, 2], [0.017, 0.049, 0.11]));
    for (let y = top; y < H; y++) px(x, y, y - top < 2 ? '#4f8a7a' : '#3e7266');
    if (x % 7 === 3) {
      const th = 6 + ((x * 13) % 5);
      for (let k = 0; k < th; k++) {
        const half = Math.floor(k / 2);
        for (let dx = -half; dx <= half; dx++) px(x + dx, top - th + k, k === 0 ? '#5aa08a' : '#2f5e56');
      }
    }
  }
  // Near meadow where the monsters stand
  for (let x = 0; x < W; x++) {
    const top = Math.round(150 - ridge(x, 9, [5, 2.5], [0.012, 0.045]));
    for (let y = top; y < H; y++) {
      const d = y - top;
      let col = d < 2 ? '#b8ec7a' : d < 6 ? '#8ad46e' : '#6cc05a';
      if (d > 8 && dither(x, y) < 0.18) col = '#5cae4c';
      px(x, y, col);
    }
    // grass tufts and flowers
    if ((x * 7) % 11 === 0) px(x, top - 1, '#b8ec7a');
    if ((x * 31) % 53 === 0) {
      const fy = top + 6 + ((x * 3) % 20);
      const fc = ['#ffffff', '#ffd84a', '#ff9ab8', '#c8a0ff'][x % 4];
      px(x, fy, fc);
      px(x - 1, fy + 1, fc);
      px(x + 1, fy + 1, fc);
      px(x, fy + 2, fc);
      px(x, fy + 1, '#ffe070');
    }
  }
  bgCache = { w: W, c };
  return c;
}

/** A soft pixel cloud. */
function cloud(g: Ctx, x: number, y: number, w: number, light: string, shade: string) {
  x = Math.round(x);
  g.fillStyle = shade;
  g.fillRect(x, y + 4, w, 4);
  g.fillStyle = light;
  g.fillRect(x + 2, y + 2, w - 4, 4);
  g.fillRect(x + Math.round(w * 0.2), y, Math.round(w * 0.35), 3);
  g.fillRect(x + Math.round(w * 0.5), y - 2, Math.round(w * 0.3), 5);
}

interface Sparkle {
  x: number;
  y: number;
  vy: number;
  ph: number;
}

export class TitleScene implements Scene {
  t0 = clock.frame;
  started = false;
  private startResolve: (() => void) | null = null;
  private sparkles: Sparkle[] = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 53) % 456,
    y: (i * 37) % 192,
    vy: 0.12 + ((i * 7) % 5) * 0.04,
    ph: i * 1.3,
  }));
  private onTap = () => this.start();

  constructor() {
    document.getElementById('screen')?.addEventListener('pointerdown', this.onTap);
  }

  /** Resolves once the player presses A / taps the screen. */
  waitStart(): Promise<void> {
    if (this.started) return Promise.resolve();
    return new Promise((r) => (this.startResolve = r));
  }

  private start() {
    if (this.started || clock.frame - this.t0 < 30) return;
    this.started = true;
    document.getElementById('screen')?.removeEventListener('pointerdown', this.onTap);
    this.startResolve?.();
  }

  dispose() {
    document.getElementById('screen')?.removeEventListener('pointerdown', this.onTap);
  }

  update() {
    if (!this.started && !ui.active && input.pressed('a')) this.start();
    for (const s of this.sparkles) {
      s.y -= s.vy;
      if (s.y < -4) {
        s.y = H + 2;
        s.x = (s.x + 97) % Math.max(W, 1);
      }
    }
  }

  drawWorld(g: Ctx) {
    const t = clock.frame;
    g.drawImage(background(), 0, 0);

    // Clouds, two parallax layers
    for (let i = 0; i < 4; i++) {
      const x = ((t * 0.12 + i * 140) % (W + 80)) - 60;
      cloud(g, x, 52 + (i % 2) * 14, 34 + (i % 3) * 8, '#ffd8e8', '#e8a8c8');
    }
    for (let i = 0; i < 3; i++) {
      const x = ((t * 0.28 + i * 190 + 60) % (W + 100)) - 70;
      cloud(g, x, 20 + i * 11, 44, '#c8c8f4', '#9a9ad8');
    }

    // The legendary sky whale glides across the dawn every so often.
    const cycle = 1500;
    const ph = (t % cycle) / cycle;
    if (ph < 0.6) {
      const p = ph / 0.6;
      const wx = W + 40 - p * (W + 140);
      const wy = 30 + Math.sin(p * Math.PI * 2) * 6;
      drawSprite(g, silhouette(monSprite('eunha'), '#55559e'), Math.round(wx), Math.round(wy), 56, 56);
    }

    // Starters (and friends on wide screens) on the meadow
    const cx = W / 2;
    const cast: [string, number, number][] = [
      ['modak', cx - 116, 64],
      ['pong', cx - 32, 64],
      ['saesun', cx + 52, 64],
    ];
    if (W >= 340) {
      cast.unshift(['monsil', cx - 170, 44]);
      cast.push(['jjirit', cx + 126, 44]);
    }
    cast.forEach(([id, x, size], i) => {
      const hop = Math.max(0, Math.sin(t / 14 + i * 1.9));
      const y = 152 - size + 6 - Math.round(hop * hop * 6);
      g.fillStyle = 'rgba(30,70,40,0.35)';
      const sw = Math.round(size * (0.5 - hop * 0.08));
      g.fillRect(Math.round(x + size / 2 - sw / 2), 152 + 3, sw, 3);
      g.fillRect(Math.round(x + size / 2 - sw / 2 + 2), 152 + 2, sw - 4, 1);
      drawSprite(g, monSprite(id), Math.round(x), y, size, size, i >= cast.length / 2);
    });

    // Floating sparkles / dandelion seeds
    for (const s of this.sparkles) {
      if (s.x > W) continue;
      const x = Math.round(s.x + Math.sin(t / 30 + s.ph) * 4);
      const y = Math.round(s.y);
      const on = Math.sin(t / 10 + s.ph) > -0.3;
      if (!on) continue;
      g.fillStyle = y < HORIZON ? '#fff6c8' : '#ffffff';
      g.fillRect(x, y, 1, 1);
      if (Math.sin(t / 10 + s.ph) > 0.7) {
        g.fillStyle = 'rgba(255,246,200,0.6)';
        g.fillRect(x - 1, y, 3, 1);
        g.fillRect(x, y - 1, 1, 3);
      }
    }
  }

  drawUI(c: Ctx) {
    const t = clock.frame - this.t0;
    const cx = W / 2;

    // Logo drops in with a little bounce
    const p = Math.min(1, t / 36);
    const bounce = p < 1 ? Math.sin(p * Math.PI) * 0.18 * (1 - p) : 0;
    const scale = (p < 1 ? 0.4 + 0.6 * (1 - Math.pow(1 - p, 3)) : 1) + bounce;
    const float = Math.sin(clock.frame / 40) * 1.5;
    const ly = 46 + float;
    c.save();
    c.translate(cx, ly);
    c.scale(scale, scale);
    c.font = `900 46px ${FONT_FAMILY}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    const word = '팜팜몬';
    // drop shadow
    c.fillStyle = 'rgba(20,16,60,0.55)';
    c.fillText(word, 2.5, 4);
    // thick outline
    c.strokeStyle = '#231a5a';
    c.lineWidth = 9;
    c.strokeText(word, 0, 0);
    c.strokeStyle = '#ffffff';
    c.lineWidth = 4;
    c.strokeText(word, 0, 0);
    // golden fill
    const grad = c.createLinearGradient(0, -22, 0, 22);
    grad.addColorStop(0, '#fff7b0');
    grad.addColorStop(0.45, '#ffd23a');
    grad.addColorStop(0.55, '#ffb020');
    grad.addColorStop(1, '#ff7a2a');
    c.fillStyle = grad;
    c.fillText(word, 0, 0);
    // shine sweep
    const sweep = ((clock.frame % 240) / 240) * 260 - 130;
    c.save();
    c.globalCompositeOperation = 'source-atop';
    const sg = c.createLinearGradient(sweep - 18, -24, sweep + 18, 24);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sg;
    c.fillText(word, 0, 0);
    c.restore();
    c.restore();

    // 팜팜볼 icons orbiting the logo
    if (p >= 1) {
      const ball = capsuleSprite();
      for (const side of [-1, 1]) {
        const a = clock.frame / 22 + (side > 0 ? Math.PI : 0);
        const bx = cx + side * 92 - 9;
        const by = ly - 9 + Math.sin(a) * 3;
        c.save();
        c.translate(bx + 9, by + 9);
        c.rotate(Math.sin(a) * 0.25 * side);
        drawSprite(c, ball, -9, -9, 18, 18);
        c.restore();
      }
    }

    // Subtitle ribbon
    const rw = 118;
    const ry = 74;
    c.fillStyle = '#8a2a4a';
    c.beginPath();
    c.moveTo(cx - rw / 2 - 14, ry + 2);
    c.lineTo(cx - rw / 2 - 6, ry + 7);
    c.lineTo(cx - rw / 2 - 14, ry + 12);
    c.lineTo(cx - rw / 2 + 2, ry + 12);
    c.lineTo(cx - rw / 2 + 2, ry + 2);
    c.moveTo(cx + rw / 2 + 14, ry + 2);
    c.lineTo(cx + rw / 2 + 6, ry + 7);
    c.lineTo(cx + rw / 2 + 14, ry + 12);
    c.lineTo(cx + rw / 2 - 2, ry + 12);
    c.lineTo(cx + rw / 2 - 2, ry + 2);
    c.fill();
    c.fillStyle = '#d8466e';
    c.fillRect(cx - rw / 2, ry - 1, rw, 12);
    c.fillStyle = '#f07a96';
    c.fillRect(cx - rw / 2, ry - 1, rw, 2);
    text(c, '해솔 지방 이야기', cx, ry, { size: 9, weight: 900, align: 'center', color: '#ffffff', shadow: '#8a2a4a' });

    // Press start
    if (!this.started && !ui.active && p >= 1) {
      const blink = (Math.sin(clock.frame / 12) + 1) / 2;
      c.globalAlpha = 0.55 + blink * 0.45;
      const label = '화면을 누르거나 Z 키로 시작';
      c.fillStyle = 'rgba(20,24,60,0.55)';
      const pw = 124;
      roundRect(c, cx - pw / 2, 166, pw, 15, 7.5);
      c.fill();
      text(c, label, cx, 168.5, { size: 8.5, weight: 800, align: 'center', color: '#fff6c8', shadow: false });
      c.globalAlpha = 1;
    }
    text(c, 'ver 1.7', W - 4, H - 10, { size: 7, align: 'right', color: 'rgba(255,255,255,0.7)', shadow: false });
  }
}

function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
