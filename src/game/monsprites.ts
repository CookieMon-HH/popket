import { Pix } from '../engine/pix';

/** Monster sprites are drawn on a 40x40 grid, front/left facing, feet near y=38. */
export const MON_SIZE = 40;

const K = '#1c1c28';
const WHITE = '#ffffff';

function eye(p: Pix, x: number, y: number, h = 3, w = 2) {
  p.rect(x, y, w, h, K);
  p.set(x, y, WHITE);
}
function bigEye(p: Pix, x: number, y: number, c = K) {
  p.rect(x, y, 3, 4, c);
  p.set(x, y, WHITE);
  p.set(x + 1, y, WHITE);
  p.set(x + 2, y + 2, WHITE);
}
function happyEye(p: Pix, x: number, y: number) {
  p.set(x, y + 1, K);
  p.set(x + 1, y, K);
  p.set(x + 2, y, K);
  p.set(x + 3, y + 1, K);
}
/** Recolor filled pixels inside a rectangle (for bands and stripes on bodies). */
function paint(p: Pix, x: number, y: number, w: number, h: number, c: string) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (p.get(i, j)) p.set(i, j, c);
}
/** Draw a thick polyline as a chain of ellipses. */
function chain(p: Pix, pts: [number, number][], r: number, c: string) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let k = 0; k <= n; k++) p.ell(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, r, r, c);
  }
}

export const MON_DRAW: Record<string, (p: Pix) => void> = {
  // ── 불: 아기 뿔공룡 ───────────────────────────────────────────
  modak(p) {
    const B = '#f28a3a', D = '#c8601e', L = '#ffd8a0', R = '#e8402a', Y = '#ffd040', H = '#fff4dc';
    p.rect(14, 31, 4, 6, D); p.rect(28, 31, 4, 6, D);
    p.tri(30, 24, 39, 28, 30, 31, B); p.ell(38, 27.5, 2, 2.5, R); p.ell(38, 28, 1, 1.4, Y);
    p.ell(23, 26, 11, 8, B);
    p.ell(22, 30.5, 8, 3, L);
    p.ell(25, 20, 2, 1.2, D); p.ell(30, 22, 1.6, 1, D);
    p.tri(9, 12, 12, 11, 8, 6, Y); p.tri(13, 9, 17, 9, 15, 3, Y); p.tri(18, 10, 21, 12, 23, 6, Y);
    p.ell(15, 16, 7, 7.5, R);
    p.ell(15, 16, 4.5, 5, '#ff7a40');
    p.ell(11, 22, 7.5, 6.5, B);
    p.ell(6, 24.5, 3.5, 3, L);
    p.tri(4, 21, 7, 20, 3, 16, H);
    p.tri(10, 16, 13, 16, 12, 12, H);
    p.rect(9, 31, 5, 7, B); p.rect(23, 31, 5, 7, B);
    p.rect(9, 37, 5, 1, D); p.rect(23, 37, 5, 1, D);
    bigEye(p, 9, 19);
    p.set(5, 26, '#7a2a10'); p.set(6, 27, '#7a2a10'); p.set(7, 27, '#7a2a10');
    p.set(13, 24, '#ff9a7a'); p.set(14, 24, '#ff9a7a');
  },
  hwaro(p) {
    const B = '#e0702c', D = '#a84a18', L = '#ffd090', R = '#e8402a', Y = '#ffd040', H = '#fff4dc';
    p.rect(13, 30, 5, 8, D); p.rect(29, 30, 5, 8, D);
    p.tri(31, 21, 40, 27, 31, 30, B); p.ell(39, 26, 1.8, 3, R);
    for (const [x, y] of [[18, 15], [23, 13], [28, 14], [33, 17]] as const) {
      p.ell(x, y, 2.3, 3.2, R);
      p.ell(x, y + 0.8, 1.1, 1.6, Y);
    }
    p.ell(24, 24, 13, 9, B);
    p.ell(23, 29.5, 10, 3.5, L);
    p.tri(5, 9, 9, 7, 3, 2, Y); p.tri(11, 5, 16, 5, 13, -1, Y); p.tri(17, 6, 21, 9, 22, 1, Y);
    p.ell(13, 13, 8, 8.5, R);
    p.ell(13, 13, 5.5, 6, '#ff7a40');
    p.ell(10, 20, 8, 7, B);
    p.ell(4, 23, 4, 3.5, L);
    p.tri(7, 15, 10, 15, 5, 7, H); p.tri(12, 15, 15, 15, 14, 7, H); p.tri(2, 20, 5, 19, 0, 15, H);
    p.rect(8, 30, 6, 8, B); p.rect(23, 30, 6, 8, B);
    p.rect(8, 37, 6, 1, D); p.rect(23, 37, 6, 1, D);
    p.rect(7, 18, 3, 3, K); p.set(7, 18, WHITE);
    p.line(6, 16, 11, 17, D);
    p.line(2, 25, 6, 26, '#7a2a10');
  },
  hwasan(p) {
    const B = '#9a3a1c', D = '#5e2010', Rk = '#4a4048', La = '#ff7a2a', Y = '#ffd040', H = '#e8e0d0';
    p.rect(12, 29, 6, 9, D); p.rect(30, 29, 6, 9, D);
    p.tri(31, 20, 40, 26, 31, 30, B);
    p.tri(17, 17, 24, 17, 21, 7, Rk); p.tri(24, 17, 31, 17, 28, 9, Rk); p.tri(30, 20, 36, 20, 34, 12, Rk);
    p.line(21, 10, 21, 16, La); p.line(28, 12, 28, 16, La); p.line(34, 15, 34, 19, La);
    p.ell(24, 24, 13.5, 9.5, B);
    p.line(20, 21, 24, 26, La); p.line(29, 22, 31, 27, La); p.line(14, 24, 16, 28, La);
    p.ell(12, 12, 9, 9, Rk);
    p.ell(12, 12, 6.5, 6.5, '#2a2228');
    p.ell(12, 12, 4, 4, La);
    p.ell(12, 4, 2.5, 3.5, La); p.ell(12, 2, 1.5, 2, Y); p.ell(12, 12, 2, 2, Y);
    p.ell(9, 20, 8, 7, B);
    p.ell(3, 23, 3.5, 3.5, '#c86a3a');
    p.tri(5, 15, 8, 15, 2, 5, H); p.tri(11, 15, 14, 15, 13, 5, H); p.tri(1, 21, 4, 19, 0, 14, H);
    p.rect(7, 29, 7, 9, B); p.rect(23, 29, 7, 9, B);
    p.rect(7, 33, 7, 2, Rk); p.rect(23, 33, 7, 2, Rk);
    p.ell(22, 30.5, 9, 3, '#c86a3a');
    p.rect(5, 18, 3, 2, Y);
    p.line(4, 16, 9, 17, D);
  },

  // ── 물: 아기 물범 → 곡예 물범 → 얼음 바다코끼리 ──────────────
  pong(p) {
    const B = '#7ab8e8', D = '#4a88c8', L = '#eaf6ff', C = '#a8e0ff', Sp = '#5a98d0';
    p.tri(31, 30, 39, 25, 39, 35, D);
    p.ell(22, 29, 12.5, 7.5, B);
    p.ell(26, 25, 1.6, 1, Sp); p.ell(31, 28, 1.3, 1, Sp); p.ell(22, 24, 1.3, 0.8, Sp);
    p.ell(20, 33.5, 9, 2.6, L);
    p.ell(13, 13, 2.2, 3, C); p.tri(12, 12, 14, 12, 13, 7, C);
    p.ell(12, 22, 9, 8, B);
    p.ell(10, 26.5, 5, 3, L);
    p.ell(16, 34, 4.5, 2, D);
    bigEye(p, 6, 19); bigEye(p, 14, 19);
    p.rect(9, 25, 3, 2, '#203050');
    p.set(4, 26, '#203050'); p.set(3, 25, '#203050'); p.set(16, 26, '#203050'); p.set(17, 25, '#203050');
    p.set(5, 24, '#ff9ab0'); p.set(17, 23, '#ff9ab0');
  },
  mulbora(p) {
    const B = '#4a96e0', D = '#2e68b0', L = '#e8f6ff', C = '#b8e8ff';
    p.ell(9, 6, 5.5, 5.5, C); p.ell(7, 4, 1.6, 1.6, WHITE); p.set(12, 8, WHITE);
    p.tri(26, 36, 37, 33, 37, 39, D);
    p.ell(22, 27, 9, 10, B);
    p.ell(21, 29, 5.5, 7, L);
    p.ell(17, 16, 6.5, 6, B);
    p.ell(12, 13, 4, 2.6, B);
    p.ell(22, 11, 3.5, 2.5, L); p.ell(24, 14, 2.5, 2, L);
    p.ell(13, 33, 5, 2.5, D); p.ell(30, 33, 5, 2.5, D);
    happyEye(p, 14, 14);
    p.rect(9, 12, 2, 1, '#203050');
    p.set(10, 15, '#203050'); p.set(8, 14, '#203050');
  },
  haeil(p) {
    const B = '#3a6ec0', D = '#244a8a', L = '#e8f6ff', Ic = '#a8e8f8', T = '#fffbe8';
    p.tri(31, 18, 36, 18, 35, 12, Ic); p.tri(34, 21, 38, 21, 38, 15, Ic);
    p.ell(20, 27, 17, 11, B);
    p.ell(19, 17, 10, 8, B);
    p.ell(20, 31.5, 11, 5.5, L);
    p.ell(4, 34, 4, 3, D); p.ell(36, 34, 4, 3, D);
    p.rect(10, 8, 19, 2, Ic);
    p.tri(10, 9, 14, 9, 12, 1, Ic); p.tri(16, 8, 22, 8, 19, 0, Ic); p.tri(24, 9, 28, 9, 26, 1, Ic);
    p.set(19, 3, WHITE); p.set(12, 4, WHITE);
    p.ell(15, 22, 4, 3, L); p.ell(23, 22, 4, 3, L);
    p.rect(14, 24, 2, 9, T); p.rect(23, 24, 2, 9, T);
    p.rect(13, 15, 3, 2, K); p.rect(23, 15, 3, 2, K);
    p.line(12, 13, 16, 14, D); p.line(27, 13, 23, 14, D);
    p.ell(19, 20, 2, 1.5, D);
  },

  // ── 풀: 새싹 아기사슴 → 꽃사슴 → 숲의 왕사슴 ─────────────────
  saesun(p) {
    const B = '#a8d070', D = '#78a048', L = '#f0f8d8', Lf = '#3aa848', Sp = '#e8f8c0';
    p.rect(17, 28, 2, 9, D); p.rect(29, 28, 2, 9, D);
    p.ell(33, 21, 2, 2, L);
    p.ell(24, 24, 9.5, 5.5, B);
    p.ell(23, 21, 1.3, 1, Sp); p.ell(27, 22, 1.3, 1, Sp); p.ell(30, 20, 1, 0.8, Sp); p.ell(20, 23, 1, 0.8, Sp);
    p.ell(24, 27.5, 6, 2, L);
    p.ell(16, 19, 3, 5, B);
    p.ell(16, 10, 3.5, 1.6, B); p.ell(16, 10, 2, 0.8, '#f0c8b8');
    p.ell(12, 14, 5.5, 5, B);
    p.ell(7.5, 16.5, 3.2, 2.5, L);
    p.line(12, 9, 12, 6, D);
    p.ell(9.5, 5, 2.7, 1.4, Lf); p.ell(14.5, 4.5, 2.7, 1.4, Lf);
    p.rect(14, 28, 2, 10, B); p.rect(26, 28, 2, 10, B);
    p.rect(14, 37, 2, 1, D); p.rect(26, 37, 2, 1, D);
    bigEye(p, 9, 12);
    p.set(5, 16, K);
    p.set(12, 17, '#ffb0a0');
  },
  kkot(p) {
    const B = '#8cb860', D = '#5a8838', L = '#f0f8d8', An = '#8a6a40', P = '#f088b8', Y = '#ffe060';
    p.rect(17, 26, 3, 11, D); p.rect(30, 26, 3, 11, D);
    p.ell(36, 18, 2, 2.5, L);
    p.ell(25, 21, 11, 6.5, B);
    p.ell(24, 18, 1.3, 1, L); p.ell(28, 19, 1.3, 1, L); p.ell(32, 17, 1, 0.8, L);
    p.ell(25, 25, 7, 2, L);
    p.ell(15, 16, 3.5, 6, B);
    p.ell(15, 7, 3.5, 1.5, B);
    p.ell(11, 10, 5, 4.5, B);
    p.ell(6.5, 12, 3, 2.5, L);
    p.line(10, 6, 8, 1, An); p.line(9, 3, 5, 2, An); p.line(12, 6, 15, 1, An); p.line(14, 3, 18, 3, An);
    for (const [x, y] of [[5, 2], [8, 1], [15, 1], [18, 3], [12, 4]] as const) {
      p.ell(x, y, 1.4, 1.4, P);
      p.set(x, y, Y);
    }
    p.rect(14, 26, 3, 12, B); p.rect(27, 26, 3, 12, B);
    p.rect(14, 37, 3, 1, D); p.rect(27, 37, 3, 1, D);
    eye(p, 9, 9, 2);
    p.set(4, 12, K);
  },
  supji(p) {
    const B = '#5a9a4a', D = '#3a6a30', An = '#7a5a38', Lf = '#2e9a40', Ll = '#48b858', Gl = '#fff6a0', M = '#f4f4e8';
    p.rect(17, 25, 3, 12, D); p.rect(31, 25, 3, 12, D);
    p.ell(37, 17, 2.5, 3, M);
    p.ell(26, 20, 11.5, 7, B);
    p.ell(26, 24, 8, 2, '#8ac078');
    p.ell(15, 17, 5, 7, M);
    p.line(9, 6, 6, 2, An); p.line(11, 6, 14, 1, An); p.line(8, 4, 3, 4, An); p.line(13, 3, 18, 2, An);
    p.ell(11, 2.5, 10, 3.5, Lf);
    p.ell(6, 1.5, 3, 1.5, Ll); p.ell(16, 2, 3, 1.5, Ll);
    p.ell(10, 9, 5, 4.5, B);
    p.ell(5.5, 11, 3, 2.5, '#c8e8b8');
    for (const [x, y] of [[3, 2], [9, 0], [15, 3], [20, 1], [2, 8], [21, 6]] as const) p.set(x, y, Gl);
    p.rect(14, 25, 3, 13, B); p.rect(28, 25, 3, 13, B);
    p.rect(14, 37, 3, 1, Gl); p.rect(28, 37, 3, 1, Gl);
    p.rect(8, 8, 2, 2, '#f8e060'); p.set(8, 8, WHITE);
    p.set(3, 11, K);
  },

  // ── 노말: 햄스터 → 다람쥐 ──────────────────────────────────
  tosil(p) {
    const B = '#e8b87a', D = '#b8844a', L = '#fff4e0', P = '#f8b8b0';
    p.ell(12, 14, 3.2, 3.2, B); p.ell(28, 14, 3.2, 3.2, B);
    p.ell(12, 14, 1.6, 1.6, P); p.ell(28, 14, 1.6, 1.6, P);
    p.ell(20, 26, 11, 10, B);
    p.ell(10, 25, 4.5, 4, L); p.ell(30, 25, 4.5, 4, L);
    p.ell(20, 31, 6, 5, L);
    p.ell(14, 36, 3, 1.5, D); p.ell(26, 36, 3, 1.5, D);
    p.ell(20, 30.5, 2.6, 3.6, '#ece4cc'); p.line(20, 27, 20, 33, '#5a4a3a');
    p.ell(16.5, 30, 1.6, 1.3, P); p.ell(23.5, 30, 1.6, 1.3, P);
    bigEye(p, 13, 20); bigEye(p, 24, 20);
    p.rect(19, 24, 2, 1, '#6a3a2a');
    p.set(18, 25, '#6a3a2a'); p.set(21, 25, '#6a3a2a');
  },
  tongsil(p) {
    const B = '#c8844a', D = '#8a5428', L = '#fff0d8', T = '#e0a060';
    p.ell(30, 17, 9, 13, D); p.ell(30, 17, 7, 11, T); p.ell(33, 7, 3.5, 3.5, D); p.ell(33, 7, 2, 2, T);
    for (const y of [12, 18, 24]) p.line(25, y, 35, y - 2, D);
    p.ell(17, 28, 8, 8.5, B);
    p.ell(16, 30, 4.5, 6, L);
    p.tri(9, 11, 13, 10, 9, 3, B); p.tri(18, 10, 22, 11, 22, 3, B);
    p.set(9, 3, D); p.set(22, 3, D);
    p.ell(15.5, 15, 7, 6.5, B);
    p.ell(15.5, 18, 4, 3, L);
    bigEye(p, 10, 12); bigEye(p, 17, 12);
    p.rect(15, 17, 2, 1, '#4a2a1a');
    p.ell(16, 27, 2.8, 2.6, '#a06a30'); p.rect(13, 23.5, 6, 2, '#6a4420'); p.set(16, 22.5, '#6a4420');
    p.ell(11, 37, 3, 1.4, D); p.ell(21, 37, 3, 1.4, D);
  },

  // ── 비행: 참새 → 제비 → 독수리 ─────────────────────────────
  jjaek(p) {
    const B = '#b07848', D = '#7a4a28', L = '#f8e0b8', Kb = '#f0a030', Cap = '#8a5a38';
    p.tri(26, 22, 37, 17, 35, 26, D);
    p.ell(20, 24, 9, 8, B);
    p.ell(17, 27.5, 5.5, 4.5, L);
    p.ell(24, 23, 6, 4.5, D); p.line(20, 22, 28, 22, '#c89868'); p.line(21, 25, 28, 25, '#c89868');
    p.ell(14, 15, 6.5, 6, B);
    p.ell(15, 11, 5, 3, Cap);
    p.ell(13, 18, 2.5, 2, '#f4f0e8');
    bigEye(p, 10, 13);
    p.tri(5, 16, 9, 14, 9, 18, Kb);
    p.line(18, 31, 17, 37, Kb); p.line(22, 31, 23, 37, Kb);
    p.line(15, 37, 19, 37, Kb); p.line(21, 37, 25, 37, Kb);
  },
  baramsae(p) {
    const B = '#2a3a6a', W = '#f4f0e8', R = '#e05a4a', A = '#78b0e0';
    p.tri(10, 19, 2, 4, 19, 16, B); p.line(4, 6, 12, 17, A);
    p.tri(22, 17, 32, 2, 27, 20, B); p.line(30, 4, 25, 17, A);
    p.tri(24, 21, 39, 26, 30, 23, B); p.tri(24, 22, 37, 32, 29, 24, B);
    p.ell(18, 21, 9, 5, B);
    p.ell(16, 23.5, 6, 2.6, W);
    p.ell(10, 18.5, 5, 4.5, B);
    p.ell(8, 21.5, 2.6, 1.8, R);
    eye(p, 7, 16, 2);
    p.tri(2, 18.5, 6, 17, 6, 20, '#303040');
    p.line(36, 25, 39, 26, A);
  },
  hoeori(p) {
    const B = '#7a5a3a', D = '#4a3420', W = '#f8f4ec', Kb = '#f0b030', A = '#68a8d8';
    p.ell(7, 18, 7, 11, D); p.ell(33, 18, 7, 11, D);
    p.tri(0, 24, 5, 22, 1, 32, D); p.tri(40, 24, 35, 22, 39, 32, D);
    p.ell(8, 16, 4, 8, B); p.ell(32, 16, 4, 8, B);
    p.tri(15, 33, 25, 33, 20, 40, D);
    p.ell(20, 24, 8, 11, B);
    for (const y of [21, 25, 29]) { p.line(16, y, 20, y + 2, W); p.line(24, y, 20, y + 2, W); }
    p.ell(20, 11, 6.5, 6, W);
    p.ell(16.5, 4, 2, 2.6, A); p.ell(22, 3, 2, 3, A); p.ell(19, 1.5, 1.3, 1.5, A);
    p.rect(16, 10, 2, 2, K); p.rect(22, 10, 2, 2, K);
    p.line(14, 8, 18, 9, D); p.line(26, 8, 22, 9, D);
    p.tri(17.5, 13, 22.5, 13, 20, 18, Kb);
    p.rect(16, 35, 2, 3, Kb); p.rect(22, 35, 2, 3, Kb);
  },

  // ── 벌레: 애벌레 → 고치 → 나방 ──────────────────────────────
  kkomul(p) {
    const B = '#a8d850', D = '#78a830', Y = '#ffe060', P = '#f07878';
    p.ell(8, 32, 5, 5, B); p.ell(15, 30, 5.5, 5.5, B); p.ell(22, 27, 6, 6, B);
    p.ell(28, 18, 8, 7.5, B);
    p.ell(8, 31, 1.6, 1.6, Y); p.ell(15, 29, 1.8, 1.8, Y); p.ell(22, 26, 2, 2, Y);
    p.line(25, 11, 23, 5, D); p.line(31, 11, 34, 5, D);
    p.ell(23, 4.5, 1.6, 1.6, P); p.ell(34, 4.5, 1.6, 1.6, P);
    p.rect(6, 37, 3, 1, D); p.rect(13, 35, 3, 1, D); p.rect(20, 33, 3, 1, D);
    bigEye(p, 23, 16); bigEye(p, 30, 16);
    p.rect(27, 22, 3, 1, '#305020');
    p.set(22, 21, '#ff9a8a'); p.set(34, 21, '#ff9a8a');
  },
  dandan(p) {
    const S = '#b8c078', D = '#7a8a48', Bn = '#ecebd2';
    p.rect(8, 1, 25, 2, '#7a5a3a'); p.set(30, 0, '#58a048'); p.set(31, 0, '#58a048');
    p.line(20, 3, 20, 7, Bn);
    p.ell(20, 22, 9, 15, S);
    for (const y of [11, 18, 25, 32]) paint(p, 0, y, 40, 1, Bn);
    p.ell(16, 14, 2, 1.4, '#d0d890');
    p.rect(15, 15, 3, 2, K); p.rect(22, 15, 3, 2, K);
    p.set(15, 15, WHITE); p.set(22, 15, WHITE);
    p.rect(15, 14, 3, 1, D); p.rect(22, 14, 3, 1, D);
  },
  naphul(p) {
    const Wg = '#c8a8f0', Wd = '#9a78d0', S = '#fff0a0', Bd = '#6a5a7a', F = '#f8f0ff';
    p.ell(9, 15, 9, 9, Wg); p.ell(31, 15, 9, 9, Wg);
    p.ell(11, 28, 6.5, 6.5, Wd); p.ell(29, 28, 6.5, 6.5, Wd);
    p.ell(8, 14, 3, 3, S); p.ell(32, 14, 3, 3, S);
    p.ell(8, 14, 1.3, 1.3, Wd); p.ell(32, 14, 1.3, 1.3, Wd);
    p.ell(11, 29, 2, 2, S); p.ell(29, 29, 2, 2, S);
    p.ell(20, 22, 4, 10, Bd);
    p.ell(20, 15.5, 5.5, 3.5, F);
    p.ell(20, 11, 4.5, 3.8, Bd);
    p.rect(17, 10, 2, 2, '#ffe060'); p.rect(21, 10, 2, 2, '#ffe060');
    p.line(18, 7, 13, 2, Bd); p.line(21, 7, 26, 2, Bd);
    p.set(12, 2, Bd); p.set(27, 2, Bd); p.set(12, 3, Bd); p.set(27, 3, Bd);
  },

  // ── 페어리: 구름양 → 솜사탕양 ──────────────────────────────
  monsil(p) {
    const Wo = '#fbf8ff', Wd = '#e4dcf0', F = '#f8dcc8', Hn = '#e8c890', P = '#ffb8d0';
    p.rect(13, 31, 3, 6, '#8a7a90'); p.rect(24, 31, 3, 6, '#8a7a90');
    for (const [x, y, r] of [[20, 24, 10], [11, 21, 5], [17, 16, 5], [24, 16, 5], [30, 21, 5], [30, 28, 4.5], [10, 28, 4.5], [20, 30, 5]] as const) p.ell(x, y, r, r * 0.9, Wo);
    p.ell(13, 18, 1.6, 1.2, Wd); p.ell(27, 26, 1.6, 1.2, Wd); p.ell(22, 14, 1.4, 1, Wd);
    p.ell(20, 24, 5.5, 5, F);
    p.ell(14, 20, 2.2, 2.2, Hn); p.ell(26, 20, 2.2, 2.2, Hn);
    happyEye(p, 16, 23); happyEye(p, 21, 23);
    p.set(15, 26, P); p.set(25, 26, P);
    p.rect(19, 27, 2, 1, '#a86a6a');
    p.set(34, 13, '#fff2a0'); p.set(35, 12, '#fff2a0'); p.set(33, 12, '#fff2a0'); p.set(34, 11, '#fff2a0');
  },
  monggeul(p) {
    const Pk = '#ffc0d8', Bl = '#b8dcff', F = '#fbe4d4', Hn = '#f0c860', St = '#fff6a8';
    p.rect(12, 33, 3, 5, '#9a8aa8'); p.rect(25, 33, 3, 5, '#9a8aa8');
    const puffs = [[20, 22, 12, Pk], [8, 18, 6, Bl], [14, 10, 6.5, Pk], [24, 8, 6.5, Bl], [33, 15, 6, Pk], [33, 25, 5.5, Bl], [8, 28, 5.5, Pk], [20, 31, 6, Bl]] as const;
    for (const [x, y, r, c] of puffs) p.ell(x, y, r, r * 0.9, c);
    p.ell(20, 22, 6, 5.5, F);
    p.ell(13, 17, 2.5, 2.5, Hn); p.ell(27, 17, 2.5, 2.5, Hn); p.set(13, 17, '#c89a30'); p.set(27, 17, '#c89a30');
    bigEye(p, 15, 20, '#6a4a8a'); bigEye(p, 22, 20, '#6a4a8a');
    p.set(14, 25, '#ff90b0'); p.set(26, 25, '#ff90b0');
    p.rect(19, 25, 2, 1, '#a86a6a');
    for (const [x, y] of [[4, 6], [36, 6], [3, 34], [37, 33], [20, 2]] as const) {
      p.set(x, y, St); p.set(x - 1, y, St); p.set(x + 1, y, St); p.set(x, y - 1, St); p.set(x, y + 1, St);
    }
  },

  // ── 전기: 꼬마번개구름 → 먹구름 ────────────────────────────
  jjirit(p) {
    const C = '#eef2ff', Cs = '#c8d0f0', Y = '#ffe04a', Yd = '#e0a820';
    chain(p, [[20, 24], [16, 28], [22, 31], [18, 36]], 1.6, Yd);
    chain(p, [[20, 24], [16, 28], [22, 31], [18, 36]], 0.8, Y);
    p.ell(20, 17, 9, 7, C); p.ell(12, 20, 6, 5, C); p.ell(28, 20, 6, 5, C); p.ell(20, 22, 10, 4, C);
    p.ell(14, 23, 3, 1.4, Cs); p.ell(27, 23, 3, 1.4, Cs);
    bigEye(p, 15, 15); bigEye(p, 22, 15);
    p.set(12, 20, Y); p.set(11, 21, Y); p.set(28, 20, Y); p.set(29, 21, Y);
    p.set(18, 21, K); p.set(19, 22, K); p.set(20, 21, K); p.set(21, 22, K);
    p.line(8, 9, 10, 12, Y); p.line(32, 9, 30, 12, Y);
  },
  beongae(p) {
    const C = '#8a94c8', Cd = '#626aa0', Cl = '#b8c0e8', Y = '#ffe04a';
    p.tri(9, 26, 15, 26, 10, 33, Y); p.tri(10, 32, 14, 32, 8, 39, Y);
    p.tri(25, 26, 31, 26, 28, 33, Y); p.tri(26, 32, 30, 32, 31, 39, Y);
    p.ell(10, 18, 8, 7, C); p.ell(30, 18, 8, 7, C);
    p.ell(20, 13, 10, 9, C); p.ell(20, 22, 13.5, 6, C);
    p.ell(17, 8, 4, 2.5, Cl); p.ell(8, 14, 2.5, 2, Cl);
    p.rect(13, 16, 4, 3, Y); p.rect(23, 16, 4, 3, Y);
    p.line(12, 14, 17, 15, Cd); p.line(28, 14, 23, 15, Cd);
    p.rect(17, 22, 6, 1, Cd); p.set(16, 23, Cd); p.set(23, 23, Cd);
  },

  // ── 전기: 고슴도치 3단 ─────────────────────────────────────
  ddakkum(p) {
    const Y = '#f4c838', Yd = '#c89a20', F = '#f8e8c8', Sp = '#fff27a';
    const spines: [number, number, number, number, number, number][] = [
      [14, 24, 19, 22, 13, 14], [18, 21, 23, 20, 19, 11], [22, 20, 27, 20, 25, 11], [26, 21, 31, 23, 31, 14], [29, 24, 33, 27, 36, 19],
    ];
    for (const t of spines) { p.tri(...t, Yd); p.set(t[4], t[5], Sp); }
    p.ell(24, 28, 10, 7, Y);
    p.ell(13, 29, 6.5, 5, F);
    p.tri(4, 30, 9, 27, 9, 32, F);
    p.ell(4.5, 30, 1.4, 1.4, K);
    p.ell(15, 23.5, 1.6, 1.6, F);
    bigEye(p, 10, 26);
    p.set(13, 31, '#ff9a8a');
    p.rect(13, 33, 3, 4, Yd); p.rect(26, 33, 3, 4, Yd);
  },
  beonjjeok(p) {
    const Y = '#ffd040', Yd = '#d8a020', F = '#fff0d0', Bl = '#fffbd0';
    for (const [x, y] of [[7, 17], [9, 11], [14, 7], [20, 5], [26, 7], [31, 11], [33, 17]] as const) {
      p.ell(x, y, 3, 3, Yd);
      p.ell(x - 0.5, y - 0.5, 1.4, 1.4, Bl);
    }
    p.ell(20, 23, 12.5, 12, Y);
    p.ell(20, 26.5, 8.5, 8, F);
    p.ell(7, 25, 2.2, 3, Y); p.ell(33, 23, 2.2, 3, Y);
    p.rect(14, 20, 4, 5, K); p.rect(23, 20, 4, 5, K);
    p.rect(14, 20, 2, 2, WHITE); p.set(17, 23, WHITE); p.rect(23, 20, 2, 2, WHITE); p.set(26, 23, WHITE);
    p.ell(11.5, 27.5, 2, 1.3, '#ffa0a0'); p.ell(28.5, 27.5, 2, 1.3, '#ffa0a0');
    for (const [x, y] of [[18, 28], [19, 29], [20, 28], [21, 29], [22, 28]] as const) p.set(x, y, K);
    p.ell(15, 35.5, 3.2, 2, Yd); p.ell(25, 35.5, 3.2, 2, Yd);
  },
  noejeon(p) {
    const Bd = '#384a80', Bk = '#26345c', Be = '#d8e4ff', Bl = '#7ad8ff', Wt = '#ffffff', Y = '#ffe040';
    p.rect(15, 28, 3, 9, Bk); p.rect(29, 28, 3, 9, Bk);
    p.tri(31, 22, 38, 13, 34, 23, Bl); p.tri(34, 18, 40, 16, 35, 24, Bl);
    p.tri(10, 14, 21, 11, 28, 4, Bl); p.tri(14, 17, 27, 14, 36, 9, Bl); p.tri(17, 20, 29, 18, 38, 17, Bl);
    p.line(16, 12, 26, 6, Wt); p.line(20, 15, 33, 10, Wt); p.line(22, 19, 35, 17, Wt);
    p.ell(24, 25, 11, 5.5, Bd);
    p.ell(22, 28.5, 7, 1.8, Be);
    p.ell(11, 18, 6, 4.5, Bd);
    p.tri(2, 20, 8, 16, 8, 22, Bd);
    p.tri(12, 14, 15, 14, 15, 8, Bd);
    p.rect(8, 17, 3, 1, Y); p.set(11, 16, Y);
    p.line(7, 15, 11, 16, Bk);
    p.set(3, 20, K);
    p.rect(11, 28, 3, 10, Bd); p.rect(25, 28, 3, 10, Bd);
    p.rect(11, 37, 3, 1, Wt); p.rect(25, 37, 3, 1, Wt);
    for (const [x, y] of [[4, 10], [6, 27], [38, 30], [30, 3]] as const) { p.set(x, y, Bl); p.set(x + 1, y + 1, Bl); }
  },

  // ── 바위: 아르마딜로 3단 ───────────────────────────────────
  doldol(p) {
    const S = '#9aa0a8', Sd = '#6a7078', Sl = '#c8ccd4', F = '#d8b890', Fd = '#a88a60';
    p.rect(15, 32, 3, 5, Fd); p.rect(28, 32, 3, 5, Fd);
    p.tri(33, 28, 39, 32, 33, 32, Fd);
    p.ell(23, 26, 12, 9, S);
    for (const x of [16, 21, 26, 31]) paint(p, x, 0, 1, 40, Sd);
    p.ell(20, 20, 3, 1.5, Sl);
    p.ell(10, 29, 5, 4, F);
    p.tri(1, 31, 7, 28, 7, 33, F);
    p.ell(11, 24, 1.6, 2.6, F);
    bigEye(p, 8, 27);
    p.set(2, 31, K);
    p.rect(11, 32, 3, 6, Fd); p.rect(24, 32, 3, 6, Fd);
  },
  bawi(p) {
    const S = '#8a9098', Sd = '#5a6068', Sl = '#c0c4cc', F = '#d0ae84', Fd = '#a08058';
    p.rect(14, 31, 4, 6, Fd); p.rect(29, 31, 4, 6, Fd);
    p.tri(34, 26, 40, 32, 34, 31, Fd);
    for (const [x, h] of [[16, 9], [21, 11], [26, 11], [31, 9]] as const) p.tri(x - 2.5, 18, x + 2.5, 18, x, 18 - h, Sd);
    p.ell(24, 25, 13, 9.5, S);
    for (const x of [16, 21, 26, 31]) paint(p, x, 0, 1, 40, Sd);
    p.ell(20, 19, 3.5, 1.6, Sl);
    p.ell(9, 28, 5.5, 4.5, F);
    p.tri(0, 30, 6, 26, 6, 33, F);
    p.ell(10, 22.5, 1.8, 3, F);
    p.rect(6, 26, 3, 2, K); p.set(6, 26, WHITE);
    p.line(5, 24, 9, 25, Fd);
    p.rect(10, 31, 4, 7, Fd); p.rect(24, 31, 4, 7, Fd);
  },
  geoam(p) {
    const S = '#7a8088', Sd = '#4a5058', Sn = '#f4f8ff', F = '#c89a70', Fd = '#946a48', Cr = '#78d8f0';
    p.rect(9, 30, 6, 8, Fd); p.rect(27, 30, 6, 8, Fd);
    p.tri(6, 20, 15, 20, 11, 4, Sd); p.tri(13, 18, 29, 18, 21, 0, S); p.tri(26, 20, 36, 20, 31, 5, Sd);
    p.tri(9.5, 9, 12.5, 9, 11, 4.5, Sn); p.tri(18.5, 5, 23.5, 5, 21, 0.5, Sn); p.tri(29.5, 10, 32.5, 10, 31, 5.5, Sn);
    p.ell(22, 25, 16, 9.5, S);
    p.tri(14, 22, 18, 22, 16, 16, Cr); p.tri(26, 22, 30, 22, 28, 16, Cr);
    p.set(15, 19, WHITE); p.set(27, 19, WHITE);
    p.ell(7, 28, 6, 5, F);
    p.tri(0, 30, 4, 26, 4, 33, F);
    p.rect(4, 26, 3, 2, K); p.set(4, 26, WHITE);
    p.line(3, 24, 8, 25, Fd);
    p.rect(4, 30, 7, 8, Fd); p.rect(22, 30, 7, 8, Fd);
  },

  // ── 땅: 진흙 3단 ───────────────────────────────────────────
  jinheuk(p) {
    const M = '#9a6a40', Md = '#6a4424', Ml = '#c8946a', P = '#c8c0b0';
    p.rect(12, 34, 5, 3, Md); p.rect(23, 34, 5, 3, Md);
    p.ell(13, 16, 4.5, 4, M); p.ell(23, 14, 5, 4.5, M);
    p.ell(20, 26, 12, 10, M);
    p.ell(14, 20, 3, 1.8, Ml); p.ell(24, 12, 2, 1.2, Ml);
    p.ell(15, 24, 2.6, 2.6, P); p.ell(25, 24, 2.6, 2.6, P);
    p.rect(15, 24, 2, 2, K); p.rect(25, 24, 2, 2, K);
    p.rect(18, 29, 4, 1, Md);
    p.ell(8, 33, 1.8, 2, Md); p.ell(32, 32, 1.8, 2, Md);
  },
  heukjang(p) {
    const M = '#9a6a40', Md = '#6a4424', P = '#a8a098', Y = '#ffd040';
    p.rect(11, 33, 6, 5, Md); p.rect(23, 33, 6, 5, Md);
    p.ell(5, 21, 5, 7.5, M); p.ell(35, 21, 5, 7.5, M);
    p.ell(5, 30, 4.5, 3.8, Md); p.ell(35, 30, 4.5, 3.8, Md);
    p.ell(20, 23, 12, 12, M);
    p.ell(20, 10, 7, 6, M);
    p.line(15, 18, 17, 23, Md); p.line(25, 17, 23, 22, Md);
    p.ell(20, 26, 5.5, 5, P);
    p.rect(16, 9, 3, 2, Y); p.rect(22, 9, 3, 2, Y);
    p.rect(17, 13, 6, 1, Md);
  },
  daeji(p) {
    const M = '#8a5e38', Md = '#5a3a1e', St = '#8a8a90', Gr = '#58b048', Y = '#ffd040';
    p.rect(8, 32, 8, 6, Md); p.rect(24, 32, 8, 6, Md);
    p.ell(3, 22, 3.5, 9, Md); p.ell(37, 22, 3.5, 9, Md);
    p.ell(20, 23, 16, 12, M);
    p.ell(20, 9, 8, 6, M);
    p.ell(20, 4, 8, 2.8, Gr); p.set(14, 1, Gr); p.set(20, 0, Gr); p.set(25, 1, Gr);
    p.ell(11, 19, 5, 3.5, St); p.ell(29, 19, 5, 3.5, St); p.ell(20, 27, 6, 5, St);
    p.ell(10, 18, 2, 1, '#b0b0b8'); p.ell(28, 18, 2, 1, '#b0b0b8');
    p.rect(15, 8, 4, 2, Y); p.rect(22, 8, 4, 2, Y);
    p.rect(16, 12, 8, 1, Md);
  },

  // ── 격투: 아기캥거루 → 챔피언캥거루 ────────────────────────
  kkaeng(p) {
    const B = '#c89060', D = '#9a6a40', L = '#f4dcc0', G = '#e83a3a', Pk = '#f0a8a0';
    p.tri(24, 32, 39, 38, 26, 37, D);
    p.ell(14, 37, 5, 1.6, D); p.ell(25, 37, 5, 1.6, D);
    p.ell(15, 32, 4, 4.5, B); p.ell(24, 32, 4, 4.5, B);
    p.ell(20, 26, 7, 8, B);
    p.ell(20, 28, 4.5, 6, L);
    p.ell(14, 5, 2.2, 5.5, B); p.ell(24, 5, 2.2, 5.5, B);
    p.ell(14, 5, 1, 4, Pk); p.ell(24, 5, 1, 4, Pk);
    p.ell(19, 14, 6.5, 6, B);
    p.rect(12, 10, 15, 2, G); p.tri(26, 10, 31, 8, 30, 14, G);
    bigEye(p, 15, 13); bigEye(p, 21, 13);
    p.ell(19, 18, 3, 2, L); p.rect(18, 17, 2, 1, K);
    p.ell(10, 23, 4.2, 4.2, G); p.ell(30, 21, 4.2, 4.2, G);
    p.ell(9, 22, 1.4, 1.2, '#ff8a8a'); p.ell(29, 20, 1.4, 1.2, '#ff8a8a');
  },
  kwontu(p) {
    const B = '#b87848', D = '#8a5430', L = '#f0d4b0', G = '#d82a2a', Gd = '#ffd040';
    p.tri(24, 30, 40, 38, 27, 37, D);
    p.ell(12, 37.5, 6, 1.6, D); p.ell(27, 37.5, 6, 1.6, D);
    p.ell(14, 31, 5, 5.5, B); p.ell(26, 31, 5, 5.5, B);
    p.ell(20, 22, 9, 10, B);
    p.ell(20, 24, 5.5, 7, L);
    p.rect(11, 27, 18, 3, Gd); p.rect(18, 26, 4, 5, '#c89a20');
    p.ell(14, 4, 2.5, 5, B); p.ell(25, 4, 2.5, 5, B);
    p.ell(19.5, 11, 7, 6, B);
    p.rect(13, 13, 3, 2, K); p.rect(23, 13, 3, 2, K); p.set(13, 13, WHITE); p.set(23, 13, WHITE);
    p.line(12, 11, 17, 12, D); p.line(27, 11, 22, 12, D);
    p.ell(19.5, 15.5, 3.2, 2, L); p.rect(18, 14, 3, 1, K);
    p.ell(6, 16, 5.5, 5.5, G); p.ell(34, 20, 5.5, 5.5, G);
    p.ell(5, 14.5, 2, 1.5, '#ff8a8a'); p.ell(33, 18.5, 2, 1.5, '#ff8a8a');
  },

  // ── 풀/독: 버섯 3단 ────────────────────────────────────────
  pojani(p) {
    const Cp = '#9a5ac8', Cd = '#6a3a98', Sp = '#ffe060', St = '#f4ead8', Sd = '#c8b8a0';
    p.rect(14, 34, 4, 3, Sd); p.rect(22, 34, 4, 3, Sd);
    p.ell(20, 28, 8, 7.5, St);
    p.ell(20, 16, 14, 9.5, Cp);
    p.ell(20, 22, 11, 3, Cd);
    p.ell(13, 12, 2.6, 2, Sp); p.ell(23, 9, 2, 1.7, Sp); p.ell(29, 15, 1.9, 1.6, Sp); p.ell(9, 17, 1.5, 1.5, Sp); p.ell(18, 15, 1.4, 1.2, Sp);
    bigEye(p, 15, 25); bigEye(p, 22, 25);
    p.rect(19, 31, 2, 1, '#5a3a2a');
    p.set(13, 30, '#ffa8c8'); p.set(26, 30, '#ffa8c8');
  },
  beoseot(p) {
    const Cp = '#9a5ac8', Cd = '#6a3a98', Sp = '#ffe060', St = '#f4ead8', Sd = '#c8b8a0', Pf = '#d8c8f0';
    p.ell(3, 8, 2, 2, Pf); p.ell(36, 6, 2, 2, Pf); p.ell(34, 2, 1.2, 1.2, Pf);
    p.rect(13, 34, 5, 4, Sd); p.rect(22, 34, 5, 4, Sd);
    p.ell(8, 27, 3, 4.5, St); p.ell(32, 27, 3, 4.5, St);
    p.ell(20, 28, 10, 8.5, St);
    p.ell(20, 13, 17, 10, Cp);
    p.ell(20, 19.5, 14, 3.2, Cd);
    p.ell(11, 11, 3, 2.4, Sp); p.ell(21, 7, 2.7, 2.2, Sp); p.ell(30, 12, 2.4, 2.2, Sp); p.ell(16, 14, 1.6, 1.4, Sp); p.ell(34, 16, 1.4, 1.4, Sp);
    eye(p, 15, 25); eye(p, 23, 25);
    p.rect(14, 24, 3, 1, Sd); p.rect(23, 24, 3, 1, Sd);
    p.rect(18, 30, 4, 1, '#5a3a2a');
  },
  beoseotking(p) {
    const Cp = '#7a3aa8', Cd = '#4a2068', Sp = '#ffe060', G = '#ffd040', St = '#f4ead8', Sd = '#c8b8a0', Ps = '#a050c0';
    p.rect(12, 34, 6, 4, Sd); p.rect(22, 34, 6, 4, Sd);
    p.ell(5, 27, 3.5, 5, St); p.ell(35, 27, 3.5, 5, St);
    p.ell(5, 33.5, 1.2, 1.8, Ps); p.ell(35, 33.5, 1.2, 1.8, Ps);
    p.ell(20, 28, 11, 9, St);
    p.ell(20, 11, 19.5, 10.5, Cp);
    p.ell(20, 18, 16, 3.5, Cd);
    for (let x = 4; x <= 36; x += 4) p.set(x, 17, G);
    p.ell(10, 8, 3.6, 3, Sp); p.ell(22, 4.5, 3.2, 2.5, Sp); p.ell(31, 9, 3, 2.5, Sp); p.ell(16, 12, 1.6, 1.4, Sp);
    eye(p, 15, 24); eye(p, 23, 24);
    p.line(12, 22, 16, 23, '#4a3020'); p.line(27, 22, 23, 23, '#4a3020');
    p.rect(16, 30, 8, 1, '#5a3a2a'); p.set(16, 29, '#5a3a2a'); p.set(23, 29, '#5a3a2a');
  },

  // ── 벌레/강철: 사슴벌레 ────────────────────────────────────
  soejip(p) {
    const M = '#8a98b0', Md = '#5a6880', Ml = '#d8e0ec', R = '#e85a5a';
    p.line(10, 22, 4, 20, Md); p.line(10, 27, 3, 29, Md); p.line(11, 32, 5, 37, Md);
    p.line(30, 22, 36, 20, Md); p.line(30, 27, 37, 29, Md); p.line(29, 32, 35, 37, Md);
    p.tri(13, 15, 17, 14, 8, 2, M); p.tri(27, 14, 31, 15, 32, 2, M);
    p.set(11, 7, Md); p.set(29, 7, Md);
    p.ell(20, 27, 10, 10, M);
    p.line(20, 18, 20, 37, Md);
    p.ell(15, 24, 2, 4, Ml);
    p.ell(20, 15, 7, 5, Md);
    p.rect(15, 14, 2, 2, R); p.rect(23, 14, 2, 2, R);
  },
  gangjip(p) {
    const M = '#9aa8c0', Md = '#5a6880', Ml = '#e8eef8', G = '#f0c040', R = '#ff5a4a';
    for (const [y, dx] of [[20, 8], [26, 9], [32, 8]] as const) { p.line(8, y, 8 - dx / 2, y + 3, Md); p.line(32, y, 32 + dx / 2, y + 3, Md); }
    p.tri(12, 14, 17, 13, 4, -1, M); p.tri(23, 13, 28, 14, 36, -1, M);
    for (const [x, y] of [[9, 6], [11, 9], [31, 6], [29, 9]] as const) p.set(x, y, Md);
    p.ell(20, 26, 13, 12, M);
    p.line(20, 15, 20, 38, Md);
    p.ell(13, 22, 2.5, 5, Ml); p.ell(27, 22, 1.5, 4, Ml);
    p.rect(8, 30, 24, 1, G); paint(p, 0, 31, 40, 1, Md);
    p.ell(20, 13, 9, 5.5, Md);
    p.tri(14, 14, 18, 14, 16, 11, R); p.tri(22, 14, 26, 14, 24, 11, R);
  },

  // ── 악: 너구리 2단 ─────────────────────────────────────────
  kkwae(p) {
    const B = '#9a8a7a', D = '#5a4a40', L = '#f0e8dc', Mk = '#2a2228';
    p.ell(31, 26, 5, 8.5, B);
    for (const y of [20, 24, 28, 32]) paint(p, 26, y, 12, 2, D);
    p.ell(19, 28, 9, 9, B);
    p.ell(19, 30, 5, 6, L);
    p.tri(10, 12, 15, 9, 10, 3, B); p.tri(23, 9, 28, 12, 28, 3, B);
    p.set(11, 5, D); p.set(27, 5, D);
    p.ell(19, 15, 9.5, 7.5, B);
    p.ell(14, 15, 4.5, 2.8, Mk); p.ell(24, 15, 4.5, 2.8, Mk);
    p.rect(13, 14, 2, 2, WHITE); p.rect(23, 14, 2, 2, WHITE); p.set(14, 15, K); p.set(24, 15, K);
    p.ell(19, 19.5, 4, 3, L); p.ell(19, 17.8, 1.6, 1.1, Mk);
    p.line(17, 21, 21, 21, Mk); p.set(21, 20, Mk);
    p.ell(19, 27, 2.2, 2.2, '#ffd040'); p.set(18, 26, WHITE);
    p.ell(14, 37, 3, 1.4, D); p.ell(24, 37, 3, 1.4, D);
  },
  dodug(p) {
    const B = '#8a7a6a', D = '#4a3a30', L = '#efe4d4', Mk = '#1e1820', Sc = '#c83a3a', Sk = '#c8a870';
    p.ell(33, 24, 5, 11, B);
    for (const y of [15, 20, 25, 30]) paint(p, 28, y, 12, 2, D);
    p.ell(7, 30, 5, 6, Sk); p.rect(5, 23, 4, 3, '#8a6a3a');
    p.rect(13, 30, 5, 8, B); p.rect(22, 30, 5, 8, B);
    p.ell(20, 23, 8, 10, B);
    p.ell(20, 25, 4.5, 7, L);
    p.tri(11, 9, 16, 6, 11, 0, B); p.tri(24, 6, 29, 9, 29, 0, B);
    p.ell(20, 11, 9, 6.5, B);
    p.rect(11, 9, 18, 4, Mk);
    p.rect(14, 10, 3, 1, '#ffe060'); p.rect(23, 10, 3, 1, '#ffe060');
    p.ell(20, 15, 3.5, 2.5, L); p.ell(20, 13.6, 1.4, 1, Mk);
    p.line(18, 17, 22, 16, Mk);
    p.rect(12, 18, 16, 3, Sc); p.tri(26, 18, 34, 20, 27, 22, Sc);
  },

  // ── 고스트: 도깨비 3단 ─────────────────────────────────────
  dokbul(p) {
    const F1 = '#3a7ae8', F2 = '#7ac0ff', F3 = '#d8f4ff', Hn = '#f0e0b0';
    p.tri(15, 31, 25, 31, 23, 39, F1);
    p.tri(10, 21, 15, 23, 7, 11, F1); p.tri(25, 23, 30, 21, 33, 11, F1);
    p.tri(11, 22, 29, 22, 20, 3, F1);
    p.ell(20, 25, 10, 9, F1);
    p.tri(14, 23, 26, 23, 20, 9, F2);
    p.ell(20, 26, 7, 6.5, F2);
    p.ell(20, 28, 3.5, 3, F3);
    p.tri(18, 13, 22, 13, 20, 7, Hn);
    p.ell(16.5, 23, 2.2, 2.8, WHITE); p.ell(23.5, 23, 2.2, 2.8, WHITE);
    p.rect(16, 23, 2, 2, K); p.rect(23, 23, 2, 2, K);
    p.set(18, 28, K); p.set(19, 29, K); p.set(20, 29, K); p.set(21, 29, K); p.set(22, 28, K);
  },
  dokkae(p) {
    const Sk = '#5ab0c8', Sd = '#3a8aa0', H = '#2a2a3a', Hn = '#f0e0b0', Pt = '#e85a4a', Cl = '#a8743a', Wi = '#a8d8f0';
    p.ell(13, 38, 4, 1.5, Wi); p.ell(27, 38, 4, 1.5, Wi);
    p.rect(14, 30, 4, 7, Sk); p.rect(22, 30, 4, 7, Sk);
    p.rect(13, 27, 14, 5, Pt); p.rect(13, 29, 14, 1, '#ffd040');
    p.rect(31, 6, 4, 18, Cl); p.ell(33, 7, 4, 5, Cl);
    for (const [x, y] of [[31, 5], [34, 4], [33, 9], [30, 9], [35, 8]] as const) p.set(x, y, '#ffd040');
    p.ell(20, 23, 8, 6.5, Sk);
    p.ell(10, 24, 2.6, 4, Sk); p.ell(31, 22, 2.8, 3.5, Sk);
    p.ell(19, 14, 8.5, 7, Sk);
    p.tri(10, 12, 15, 9, 10, 3, H); p.tri(14, 9, 20, 8, 15, 1, H); p.tri(21, 8, 27, 10, 27, 2, H);
    p.tri(18, 8, 22, 8, 20, 0, Hn);
    bigEye(p, 14, 13); bigEye(p, 22, 13);
    p.rect(15, 19, 9, 1, K); p.set(16, 20, WHITE); p.set(22, 20, WHITE);
    p.set(13, 17, Sd); p.set(26, 17, Sd);
  },
  dokdae(p) {
    const Sk = '#3a5a9a', Sd = '#26407a', H = '#f0f0f8', Hn = '#f8e8b0', Rb = '#2a1e3a', G = '#ffd040', Gd = '#c89a20', Au = '#7ac0ff';
    p.ell(20, 34, 16, 6, Au);
    p.tri(4, 30, 10, 30, 6, 20, Au); p.tri(30, 30, 36, 30, 34, 20, Au);
    p.ell(20, 29, 12, 8, Rb);
    p.rect(14, 26, 12, 2, G);
    p.rect(32, 3, 5, 22, Gd); p.ell(34.5, 6, 5, 6, G);
    for (const [x, y] of [[32, 3], [36, 2], [35, 8], [31, 7], [37, 6]] as const) p.set(x, y, '#fff6c0');
    p.ell(20, 21, 10, 7, Sk);
    p.ell(7, 22, 4, 5, Sk); p.ell(32, 21, 3.5, 4, Sk);
    p.ell(19, 11, 9, 7.5, Sk);
    p.ell(10, 7, 4, 4, H); p.ell(28, 7, 4, 4, H); p.ell(19, 4, 6, 3, H);
    p.tri(11, 5, 14, 5, 9, -2, Hn); p.tri(24, 5, 27, 5, 29, -2, Hn);
    p.rect(13, 10, 3, 2, G); p.rect(22, 10, 3, 2, G);
    p.line(11, 8, 16, 9, Sd); p.line(27, 8, 22, 9, Sd);
    p.rect(14, 15, 10, 2, K); p.set(15, 15, WHITE); p.set(22, 15, WHITE); p.set(15, 17, WHITE); p.set(22, 17, WHITE);
    p.ell(19, 19, 4, 2, H);
  },

  // ── 에스퍼: 달토끼 3단 ─────────────────────────────────────
  dalto(p) {
    const W = '#f4f0ff', Wd = '#d8d0f0', P = '#ffb8d0', Mn = '#ffe070', Ps = '#c890f0', Ey = '#a050c8';
    p.ell(13.5, 8, 2.6, 8, W); p.ell(26.5, 8, 2.6, 8, W);
    p.ell(13.5, 8, 1.2, 6, P); p.ell(26.5, 8, 1.2, 6, P);
    p.ell(30, 32, 2.8, 2.8, W);
    p.ell(20, 29, 8, 8, W);
    p.ell(20, 31, 4.5, 4.5, '#fffaff');
    p.ell(20, 19, 8.5, 7, W);
    p.ell(20, 14.5, 2.6, 2.6, Mn); p.ell(21.2, 13.8, 2.3, 2.3, W);
    bigEye(p, 14, 18, Ey); bigEye(p, 23, 18, Ey);
    p.set(20, 22, P); p.set(19, 23, '#a86a8a'); p.set(21, 23, '#a86a8a');
    p.set(13, 23, P); p.set(27, 23, P);
    p.ell(15, 37, 3.5, 1.5, Wd); p.ell(25, 37, 3.5, 1.5, Wd);
    for (const [x, y] of [[5, 18], [35, 16], [6, 30], [36, 26]] as const) { p.set(x, y, Ps); p.set(x, y + 1, Ps); }
  },
  jeolgu(p) {
    const W = '#f0ecff', Wd = '#d0c8ec', P = '#ffb8d0', Mn = '#ffe070', Ey = '#9040c0', Wo = '#a87850', Wd2 = '#7a5230', Rc = '#ffffff';
    p.ell(30, 35, 8, 3, Wd2); p.ell(30, 32, 8, 3.5, Wo); p.ell(30, 31, 6, 2, Rc);
    p.ell(13, 6, 2.6, 7.5, W); p.ell(24, 5, 2.6, 7.5, W);
    p.ell(13, 6, 1.2, 5.5, P); p.ell(24, 5, 1.2, 5.5, P);
    p.rect(12, 30, 4, 7, W); p.rect(20, 30, 4, 7, W);
    p.ell(18, 25, 7.5, 8, W);
    p.ell(18, 27, 4.5, 5, '#fffaff');
    p.ell(18.5, 15, 8, 6.5, W);
    p.ell(18.5, 10.5, 2.4, 2.4, Mn); p.ell(19.6, 9.8, 2.1, 2.1, W);
    bigEye(p, 13, 14, Ey); bigEye(p, 21, 14, Ey);
    p.set(18, 18, P);
    p.line(25, 15, 33, 27, Wo); p.line(26, 15, 34, 27, Wo);
    p.ell(25, 22, 2.5, 2, W);
    p.ell(13, 37, 3.5, 1.4, Wd); p.ell(22, 37, 3.5, 1.4, Wd);
  },
  wolgung(p) {
    const Mo = '#fff2a8', Md = '#f0d870', W = '#f8f4ff', P = '#ffb8d8', Rb = '#c890f0', Ey = '#7a30b0';
    p.ell(20, 15, 14, 14, Mo);
    p.ell(14, 10, 2.5, 2, Md); p.ell(26, 20, 3, 2, Md); p.ell(24, 8, 1.5, 1.2, Md);
    chain(p, [[6, 30], [10, 26], [16, 30], [22, 27], [30, 31], [36, 27]], 1, Rb);
    p.ell(15, 7, 2.4, 7, W); p.ell(25, 7, 2.4, 7, W);
    p.ell(15, 7, 1.1, 5, P); p.ell(25, 7, 1.1, 5, P);
    p.ell(20, 28, 6, 7, W);
    p.tri(14, 32, 26, 32, 20, 39, W);
    p.ell(20, 18, 7.5, 6.5, W);
    p.rect(15, 17, 3, 3, Ey); p.rect(23, 17, 3, 3, Ey); p.set(15, 17, WHITE); p.set(23, 17, WHITE);
    p.set(16, 15, Ey); p.set(24, 15, Ey);
    p.set(20, 21, P); p.set(14, 21, P); p.set(26, 21, P);
    p.ell(20, 12.5, 1.6, 1.6, '#ffd040');
  },

  // ── 물: 물고기 2단 ─────────────────────────────────────────
  banjjak(p) {
    const B = '#9ac8e8', L = '#f0faff', F = '#78b0e0';
    p.tri(27, 20, 38, 10, 38, 30, F);
    p.tri(14, 14, 24, 14, 22, 6, F);
    p.tri(15, 27, 21, 27, 16, 33, F);
    p.ell(18, 20, 12, 8, B);
    p.ell(17, 24, 8.5, 3, L);
    bigEye(p, 10, 17);
    p.rect(6, 22, 2, 1, K);
    p.set(17, 17, WHITE); p.set(22, 19, WHITE); p.set(25, 15, WHITE); p.set(20, 22, WHITE);
  },
  eungeo(p) {
    const S = '#c8d4e0', Sd = '#8a9ab0', G = '#f0c040', L = '#ffffff';
    p.tri(28, 21, 40, 6, 40, 36, G);
    p.tri(10, 13, 26, 13, 21, 2, G);
    p.tri(12, 29, 20, 29, 13, 37, G);
    p.ell(17, 21, 14, 10, S);
    for (let y = 15; y <= 26; y += 3) for (let x = 13 + (y % 2) * 2; x <= 28; x += 4) p.set(x, y, Sd);
    p.ell(15, 26, 10, 3.5, L);
    eye(p, 6, 17, 3);
    p.rect(2, 22, 3, 1, K);
    p.line(4, 23, 0, 27, G); p.line(5, 24, 2, 31, G);
  },

  // ── 얼음: 펭귄 2단 ─────────────────────────────────────────
  agipeng(p) {
    const Fz = '#a8b4c8', Fd = '#7a8aa0', W = '#ffffff', Ic = '#a8e8f8', Kb = '#f0a030';
    p.ell(20, 26, 11, 11, Fz);
    p.ell(9, 25, 3, 6, Fd); p.ell(31, 25, 3, 6, Fd);
    p.ell(20, 22, 8, 8, W);
    p.ell(20, 30, 6, 5, '#f0f4f8');
    p.tri(17, 13, 23, 13, 20, 6, Ic); p.tri(21, 12, 26, 13, 27, 7, Ic);
    bigEye(p, 15, 19); bigEye(p, 23, 19);
    p.tri(18, 24, 22, 24, 20, 27, Kb);
    p.set(13, 25, '#ffb0c0'); p.set(27, 25, '#ffb0c0');
    p.ell(15, 37, 3, 1.4, Kb); p.ell(25, 37, 3, 1.4, Kb);
  },
  eolpeng(p) {
    const B = '#2a3a5a', W = '#ffffff', Ic = '#a8e8f8', Id = '#68c0d8', Kb = '#f0b030';
    p.ell(20, 23, 10, 15, B);
    p.ell(20, 25, 6.5, 11, W);
    p.tri(4, 34, 10, 16, 12, 22, B); p.tri(36, 34, 30, 16, 28, 22, B);
    p.line(5, 33, 10, 18, Ic);
    p.tri(13, 24, 27, 24, 20, 32, Ic); p.tri(15, 24, 25, 24, 20, 29, Id);
    p.rect(11, 15, 18, 3, Ic);
    for (const x of [12, 16, 20, 24, 28]) p.tri(x - 1.5, 18, x + 1.5, 18, x, 22, Ic);
    p.tri(14, 5, 18, 5, 15, -1, Ic); p.tri(19, 4, 23, 4, 21, -2, Ic); p.tri(24, 5, 27, 5, 26, 0, Ic);
    p.rect(15, 9, 3, 2, K); p.rect(23, 9, 3, 2, K); p.set(15, 9, Ic); p.set(23, 9, Ic);
    p.line(14, 7, 18, 8, '#101828'); p.line(27, 7, 23, 8, '#101828');
    p.tri(18, 11, 23, 11, 20.5, 15, Kb);
    p.ell(15, 38, 3.5, 1.4, Kb); p.ell(25, 38, 3.5, 1.4, Kb);
  },

  // ── 드래곤: 아기용 → 날개용 → 천룡 ────────────────────────
  kkomaryong(p) {
    const B = '#5ac8a8', D = '#3a9a80', L = '#e8fff4', Egg = '#fff8e8', Ed = '#d8ccb0', Wg = '#9ae8d0';
    p.tri(10, 21, 4, 12, 13, 16, Wg); p.tri(30, 21, 36, 12, 27, 16, Wg);
    p.ell(20, 24, 8, 8, B);
    p.ell(20, 26, 4, 4, L);
    p.tri(15, 11, 18, 11, 15, 5, Egg); p.tri(22, 11, 25, 11, 25, 5, Egg);
    p.ell(20, 15, 7.5, 6.5, B);
    p.ell(20, 18.5, 4.5, 2.6, L);
    p.ell(20, 32, 11, 7, Egg);
    for (let x = 9; x <= 29; x += 4) p.tri(x, 27, x + 4, 27, x + 2, 23, Egg);
    p.ell(14, 33, 1.6, 1.2, Ed); p.ell(25, 30, 1.4, 1, Ed); p.ell(22, 35, 1.2, 1, Ed);
    bigEye(p, 14, 13); bigEye(p, 23, 13);
    p.set(18, 18, D); p.set(22, 18, D);
    p.set(13, 18, '#ffb0c0'); p.set(27, 18, '#ffb0c0');
  },
  nalgae(p) {
    const B = '#3aa890', D = '#22705e', L = '#e0f8e8', Wg = '#7ad0b8', Hn = '#f8f0d8', Y = '#ffd040';
    p.tri(14, 18, 0, 3, 5, 24, Wg); p.line(2, 5, 13, 18, D); p.line(3, 14, 12, 19, D);
    p.tri(26, 18, 40, 3, 35, 24, Wg); p.line(38, 5, 27, 18, D); p.line(37, 14, 28, 19, D);
    p.tri(24, 32, 39, 29, 27, 37, B); p.tri(36, 27, 40, 26, 39, 31, D);
    p.rect(13, 30, 5, 8, B); p.rect(22, 30, 5, 8, B);
    p.rect(13, 37, 5, 1, D); p.rect(22, 37, 5, 1, D);
    p.ell(20, 25, 8, 9, B);
    for (const y of [21, 24, 27, 30]) p.rect(17, y, 6, 1, L);
    p.tri(19, 9, 22, 9, 23, 1, Hn); p.tri(23, 10, 26, 10, 28, 3, Hn);
    p.ell(20, 13, 6.5, 5.5, B);
    p.ell(15, 15, 4, 2.6, B);
    p.rect(17, 11, 2, 2, Y); p.set(17, 11, WHITE);
    p.line(16, 10, 20, 10, D);
    p.set(12, 15, K);
    for (const [x, y] of [[26, 18], [28, 21], [29, 25]] as const) p.tri(x, y, x + 3, y + 1, x + 1, y - 2, D);
  },
  cheonryong(p) {
    const B = '#3a6ad8', D = '#22449a', L = '#f4ecc8', Mn = '#ffffff', Wh = '#f0e0a0', Pr = '#ffe8a0', Cl = '#eef2ff', Hn = '#f8e8c0';
    p.ell(10, 37, 6, 2.5, Cl); p.ell(30, 38, 7, 2, Cl);
    const path: [number, number][] = [[32, 36], [36, 30], [34, 23], [27, 20], [20, 23], [14, 28], [9, 23], [10, 16]];
    chain(p, path, 4, B);
    chain(p, path.map(([x, y]) => [x - 1, y + 1.5] as [number, number]), 1.6, L);
    for (const [x, y] of path.slice(1, -1)) p.tri(x - 1.5, y - 3.5, x + 1.5, y - 3.5, x + 1, y - 6.5, D);
    p.ell(26, 34, 3.4, 3.4, Pr); p.set(25, 33, WHITE); p.set(26, 33, WHITE);
    p.line(22, 30, 25, 32, D); p.line(29, 31, 28, 33, D);
    p.ell(20, 9, 5, 4, Mn); p.ell(23, 13, 3.5, 3, Mn);
    p.ell(12, 11, 6, 5, B);
    p.ell(6, 13, 4, 3, B);
    p.tri(12, 7, 15, 7, 16, 0, Hn); p.line(15, 3, 18, 2, Hn); p.tri(8, 7, 11, 7, 8, 1, Hn);
    p.line(3, 13, 0, 8, Wh); p.line(3, 15, 0, 19, Wh); p.set(0, 7, Wh); p.set(0, 20, Wh);
    p.rect(9, 9, 3, 2, '#ffd040'); p.set(9, 9, WHITE);
    p.line(8, 8, 12, 8, D);
    p.rect(3, 15, 4, 1, D);
  },

  // ── 불: 군고구마 2단 ───────────────────────────────────────
  gungo(p) {
    const Sk = '#8a3a6a', Sd = '#5e2448', In = '#ffc840', Il = '#ffe8a0', Ft = '#5e2448', Sm = '#f4f4f8';
    chain(p, [[8, 32], [14, 26], [22, 21], [30, 15]], 7, Sk);
    p.ell(31, 13, 4, 4, Sk);
    p.line(33, 10, 36, 6, Sd); p.set(37, 5, '#58a048'); p.set(36, 4, '#58a048');
    p.tri(14, 24, 28, 14, 24, 24, In); p.tri(16, 22, 26, 15, 22, 21, Il);
    p.line(14, 24, 28, 14, Sd);
    for (const [x, y] of [[9, 30], [18, 28], [27, 20]] as const) p.set(x, y, Sd);
    bigEye(p, 9, 25); bigEye(p, 16, 21);
    p.set(13, 30, K); p.set(14, 31, K); p.set(15, 30, K);
    p.set(8, 29, '#ff8a9a'); p.set(19, 25, '#ff8a9a');
    p.rect(6, 36, 3, 2, Ft); p.rect(16, 33, 3, 2, Ft);
    for (const [x, y] of [[20, 9], [22, 5], [19, 2], [26, 7], [28, 3]] as const) { p.set(x, y, Sm); p.set(x + 1, y - 1, Sm); }
  },
  jangjak(p) {
    const Dr = '#6a7080', Dd = '#454a58', Dl = '#9aa0ae', Fi = '#ff7a2a', Fy = '#ffd040', Sk = '#8a3a6a', In = '#ffc840', Wd = '#8a5a30', Sm = '#f4f4f8';
    p.rect(8, 6, 4, 10, Dd); p.rect(7, 4, 6, 2, Dd);
    for (const [x, y] of [[9, 2], [11, 0], [8, -1]] as const) p.set(x, y, Sm);
    p.ell(20, 14, 9, 5, Sk);
    p.tri(14, 13, 26, 13, 20, 7, In);
    p.rect(9, 16, 22, 20, Dr);
    p.rect(9, 16, 22, 2, Dl); p.rect(9, 25, 22, 1, Dd); p.rect(9, 34, 22, 2, Dd);
    p.rect(12, 18, 2, 15, Dl);
    p.rect(14, 28, 12, 6, '#2a2228');
    p.ell(20, 32, 4.5, 2.5, Fi); p.ell(20, 32.5, 2.5, 1.5, Fy);
    bigEye(p, 15, 19); bigEye(p, 22, 19);
    p.rect(18, 23, 4, 1, K);
    p.line(3, 22, 9, 24, Wd); p.line(37, 22, 31, 24, Wd);
    p.line(2, 21, 3, 22, Wd); p.line(38, 21, 37, 22, Wd);
    p.rect(10, 36, 4, 2, Dd); p.rect(26, 36, 4, 2, Dd);
  },

  // ── 물/악: 문어 3단 ─────────────────────────────────────────
  munu(p) {
    const B = '#f08aa0', D = '#c85a78', L = '#ffd8e0', Sp = '#ffb8c8';
    for (const [x0, x1, x2] of [[11, 7, 4], [17, 15, 13], [23, 25, 27], [29, 33, 36]] as const) chain(p, [[x0, 26], [x1, 31], [x2, 34]], 2.2, B);
    for (const x of [4, 13, 27, 36]) p.ell(x, 35, 2, 1.6, D);
    p.ell(20, 18, 11, 10, B);
    p.ell(15, 12, 2, 1.4, Sp); p.ell(26, 13, 1.6, 1.2, Sp);
    p.rect(13, 6, 14, 3, '#ffffff'); p.rect(13, 8, 14, 1, '#4a7ad8');
    bigEye(p, 14, 17); bigEye(p, 23, 17);
    p.ell(20, 24, 2, 1.6, D);
    p.set(12, 22, '#ff6a8a'); p.set(28, 22, '#ff6a8a');
  },
  meokmul(p) {
    const B = '#8a5ab8', D = '#5a3488', L = '#c8a8e8', In = '#2a2238';
    p.ell(6, 34, 3, 2, In); p.ell(34, 33, 2.5, 1.8, In); p.ell(38, 26, 1.5, 1.5, In);
    const legs: [number, number][][] = [[[10, 24], [5, 28], [3, 34]], [[14, 26], [11, 33], [13, 37]], [[19, 27], [19, 34], [16, 38]], [[22, 27], [24, 34], [27, 37]], [[26, 26], [30, 32], [33, 36]], [[30, 24], [35, 27], [38, 32]]];
    for (const l of legs) chain(p, l, 2, B);
    p.ell(20, 16, 12, 11, B);
    p.ell(14, 10, 3, 2, L); p.ell(27, 21, 2, 1.4, L);
    p.rect(13, 14, 4, 3, K); p.rect(24, 14, 4, 3, K); p.set(13, 14, '#ffffff'); p.set(24, 14, '#ffffff');
    p.line(12, 12, 17, 13, D); p.line(29, 12, 24, 13, D);
    p.ell(20, 21, 2.2, 1.8, D);
    p.line(17, 23, 23, 23, In);
  },
  daewang(p) {
    const B = '#a8324a', D = '#701e30', L = '#e87a8a', Hat = '#2a2a3a', G = '#ffd040';
    const legs: [number, number][][] = [[[8, 24], [2, 26], [1, 33]], [[11, 27], [6, 33], [9, 38]], [[15, 29], [14, 36], [11, 39]], [[19, 30], [20, 37]], [[23, 29], [26, 36], [29, 39]], [[27, 27], [32, 33], [31, 38]], [[31, 24], [37, 26], [39, 33]]];
    for (const l of legs) chain(p, l, 2.6, B);
    for (const l of legs) { const [x, y] = l[l.length - 1]; p.set(x, y, L); }
    p.ell(20, 16, 14, 12, B);
    p.ell(13, 9, 4, 2.5, L);
    p.rect(9, 3, 22, 3, Hat); p.rect(12, 0, 16, 4, Hat); p.rect(12, 3, 16, 1, G);
    p.ell(20, 1.5, 2, 1.5, G);
    p.rect(12, 14, 5, 3, '#ffd040'); p.rect(24, 14, 5, 3, '#ffd040');
    p.rect(14, 15, 2, 2, K); p.rect(26, 15, 2, 2, K);
    p.line(11, 12, 17, 13, D); p.line(30, 12, 24, 13, D);
    p.ell(20, 22, 3, 2, D);
  },

  // ── 격투: 씨름곰 3단 ───────────────────────────────────────
  agigom(p) {
    const B = '#a8743a', D = '#7a5024', L = '#e8c898', Rb = '#e84a4a';
    p.ell(12, 10, 3, 3, B); p.ell(28, 10, 3, 3, B); p.ell(12, 10, 1.5, 1.5, D); p.ell(28, 10, 1.5, 1.5, D);
    p.ell(14, 35, 3.5, 2.5, D); p.ell(26, 35, 3.5, 2.5, D);
    p.ell(20, 27, 9, 9, B);
    p.ell(20, 29, 5.5, 6, L);
    p.ell(10, 25, 3, 4, B); p.ell(30, 25, 3, 4, B);
    p.ell(20, 16, 9, 7.5, B);
    p.ell(20, 19.5, 4, 3, L); p.rect(19, 18, 3, 2, K);
    p.rect(11, 12, 18, 2, Rb); p.tri(28, 12, 33, 10, 32, 15, Rb);
    bigEye(p, 14, 14); bigEye(p, 23, 14);
    p.set(13, 19, '#ff9a8a'); p.set(27, 19, '#ff9a8a');
  },
  satba(p) {
    const B = '#8a5a2c', D = '#5e3a18', L = '#e0bc88', Sb = '#f4f4f0', Sd = '#c8c8c0';
    p.rect(11, 31, 7, 7, B); p.rect(22, 31, 7, 7, B);
    p.rect(10, 37, 8, 1, D); p.rect(22, 37, 8, 1, D);
    p.ell(5, 21, 4, 6.5, B); p.ell(35, 21, 4, 6.5, B);
    p.ell(5, 28, 3.5, 3, D); p.ell(35, 28, 3.5, 3, D);
    p.ell(20, 22, 12, 11, B);
    p.ell(20, 22, 7, 8, L);
    p.rect(8, 28, 24, 4, Sb); p.rect(8, 28, 24, 1, Sd); p.rect(18, 30, 4, 7, Sb);
    p.ell(11, 6, 3, 3, B); p.ell(29, 6, 3, 3, B);
    p.ell(20, 10, 8.5, 7, B);
    p.ell(20, 13, 4, 3, L); p.rect(19, 11, 3, 2, K);
    p.rect(14, 8, 3, 2, K); p.rect(23, 8, 3, 2, K);
    p.line(13, 6, 17, 7, D); p.line(27, 6, 23, 7, D);
    p.rect(17, 15, 6, 1, D);
  },
  jangsa(p) {
    const B = '#5e3c22', D = '#3a2412', L = '#c89a6a', Sb = '#ffd040', Sd = '#c89a20', Sc = '#e8e0d0';
    p.rect(9, 31, 8, 7, B); p.rect(23, 31, 8, 7, B);
    p.ell(4, 19, 5, 8, B); p.ell(36, 19, 5, 8, B);
    p.ell(4, 28, 4.5, 4, D); p.ell(36, 28, 4.5, 4, D);
    p.ell(20, 21, 14, 12.5, B);
    p.ell(20, 21, 8, 9, L);
    p.line(14, 16, 18, 24, D); p.line(26, 16, 22, 24, D);
    p.rect(6, 28, 28, 5, Sb); p.rect(6, 28, 28, 1, Sd); p.rect(17, 31, 6, 7, Sb);
    p.ell(10, 4, 3.5, 3.5, B); p.ell(30, 4, 3.5, 3.5, B);
    p.ell(20, 9, 9.5, 7.5, B);
    p.ell(20, 12.5, 4.5, 3, L); p.rect(19, 10, 3, 2, K);
    p.rect(13, 7, 4, 2, '#ffd040'); p.rect(23, 7, 4, 2, '#ffd040');
    p.line(12, 5, 17, 6, D); p.line(28, 5, 23, 6, D);
    p.rect(16, 15, 8, 1, D);
    p.line(28, 14, 31, 18, Sc);
  },

  // ── 강철: 깡통 로봇 3단 ────────────────────────────────────
  ggangtong(p) {
    const M = '#a8b0c0', Md = '#6a7488', Ml = '#e0e6f0', Sc = '#58e0a8', Rd = '#ff5a4a';
    p.line(20, 8, 20, 3, Md); p.ell(20, 2.5, 1.6, 1.6, Rd);
    p.ell(20, 33, 5, 5, '#3a3e4a'); p.ell(20, 33, 2.5, 2.5, Md);
    p.rect(12, 9, 16, 21, M);
    p.ell(20, 9, 8, 2.5, Ml); p.ell(20, 30, 8, 2, Md);
    p.rect(12, 16, 16, 1, Md); p.rect(12, 24, 16, 1, Md);
    p.rect(14, 18, 12, 5, '#1e2a28');
    p.rect(16, 19, 2, 2, Sc); p.rect(22, 19, 2, 2, Sc);
    p.set(18, 22, Sc); p.set(19, 22, Sc); p.set(20, 22, Sc); p.set(21, 22, Sc);
    p.rect(14, 11, 2, 4, Ml);
    p.line(12, 20, 7, 24, Md); p.line(28, 20, 33, 24, Md);
    p.ell(7, 25, 1.6, 1.6, Md); p.ell(33, 25, 1.6, 1.6, Md);
  },
  cheolgap(p) {
    const M = '#8a98b0', Md = '#56627a', Ml = '#d0d8e8', Vi = '#58e0f0', Y = '#ffd040';
    p.rect(12, 30, 6, 8, Md); p.rect(22, 30, 6, 8, Md);
    p.rect(10, 36, 9, 2, M); p.rect(21, 36, 9, 2, M);
    p.rect(3, 16, 6, 14, M); p.rect(31, 16, 6, 14, M);
    p.rect(2, 28, 8, 4, Md); p.rect(30, 28, 8, 4, Md);
    p.rect(10, 15, 20, 16, M);
    p.rect(10, 15, 20, 2, Ml); p.rect(14, 20, 12, 7, Md);
    p.ell(20, 23.5, 3, 3, Y);
    p.rect(13, 4, 14, 11, M);
    p.rect(13, 4, 14, 2, Ml);
    p.rect(14, 8, 12, 3, '#1e2838'); p.rect(15, 9, 10, 1, Vi);
    p.line(16, 4, 14, 0, Md); p.set(14, 0, Y);
  },
  geosin(p) {
    const M = '#4a5a8a', Md = '#2e3a60', Ml = '#a8b8e0', Bl = '#7ad8ff', Y = '#ffd040', Rd = '#ff5a4a';
    p.tri(4, 34, 10, 34, 7, 39, Bl); p.tri(30, 34, 36, 34, 33, 39, Bl);
    p.rect(9, 27, 8, 8, Md); p.rect(23, 27, 8, 8, Md);
    p.rect(0, 12, 8, 18, M); p.rect(32, 12, 8, 18, M);
    p.ell(4, 12, 5, 4, Ml); p.ell(36, 12, 5, 4, Ml);
    p.rect(0, 28, 9, 5, Md); p.rect(31, 28, 9, 5, Md);
    p.rect(8, 11, 24, 18, M);
    p.rect(8, 11, 24, 2, Ml);
    p.ell(20, 20, 5, 5, Md); p.ell(20, 20, 3.5, 3.5, Bl);
    p.tri(19, 17, 22, 17, 19, 21, Y); p.tri(18, 20, 21, 20, 20, 24, Y);
    p.rect(13, 1, 14, 10, M); p.rect(13, 1, 14, 2, Ml);
    p.tri(12, 4, 13, 9, 8, 2, Ml); p.tri(28, 4, 27, 9, 32, 2, Ml);
    p.rect(15, 5, 4, 2, Rd); p.rect(21, 5, 4, 2, Rd);
    p.rect(16, 8, 8, 1, Md);
  },

  // ── 얼음: 고양이 → 설표 ────────────────────────────────────
  nunnyang(p) {
    const W = '#f4f8ff', Ws = '#c8d8f0', Bl = '#7ab8e8', Ic = '#a8e8f8', P = '#ffb8c8';
    chain(p, [[28, 30], [33, 26], [34, 19]], 1.6, W);
    p.ell(34, 17, 2.6, 2.6, Ic); p.set(34, 15, '#ffffff'); p.set(32, 17, '#ffffff'); p.set(36, 17, '#ffffff'); p.set(34, 19, '#ffffff');
    p.ell(20, 29, 8, 7, W);
    p.ell(15, 36, 2.6, 1.6, Ws); p.ell(25, 36, 2.6, 1.6, Ws);
    p.tri(10, 13, 16, 11, 11, 4, W); p.tri(24, 11, 30, 13, 29, 4, W);
    p.tri(11.5, 11, 14.5, 10.5, 12, 6, Bl); p.tri(25.5, 10.5, 28.5, 11, 28, 6, Bl);
    p.ell(20, 17, 9, 7.5, W);
    p.ell(20, 20, 3.5, 2.2, '#ffffff');
    bigEye(p, 14, 15, '#3a6aa8'); bigEye(p, 23, 15, '#3a6aa8');
    p.set(20, 19, P);
    p.set(18, 21, K); p.set(19, 21, K); p.set(21, 21, K); p.set(22, 21, K);
    p.line(8, 19, 12, 20, Ws); p.line(32, 19, 28, 20, Ws);
  },
  seolpyo(p) {
    const W = '#eef2f8', G = '#b8c4d8', Sp = '#5a6a88', Ic = '#a8e8f8', Ey = '#58c8f0';
    p.rect(14, 27, 3, 10, G); p.rect(29, 27, 3, 10, G);
    chain(p, [[33, 22], [38, 18], [38, 11]], 2, W);
    p.tri(36, 10, 40, 10, 38, 4, Ic); p.tri(35, 13, 37, 9, 32, 7, Ic);
    p.ell(25, 23, 11, 5.5, W);
    for (const [x, y] of [[20, 20], [25, 19], [30, 21], [22, 24], [28, 25], [33, 23]] as const) { p.ell(x, y, 1.4, 1.1, Sp); p.set(x, y, W); }
    p.ell(11, 18, 6, 5, W);
    p.tri(3, 20, 8, 17, 8, 22, W);
    p.tri(10, 14, 13, 14, 12, 9, W); p.tri(14, 14, 17, 15, 17, 10, W);
    p.rect(7, 17, 3, 1, Ey); p.set(10, 16, Ey);
    p.line(6, 15, 10, 16, Sp);
    p.set(3, 20, K);
    p.set(13, 20, Sp); p.set(15, 19, Sp);
    p.rect(11, 27, 3, 11, W); p.rect(26, 27, 3, 11, W);
  },

  // ── 페어리: 솜뭉치 강아지 2단 ──────────────────────────────
  mongmong(p) {
    const F = '#fff4e0', Fd = '#f0d8b0', Rb = '#ff7aa8', N = '#3a2a2a';
    for (const [x, y, r] of [[20, 24, 11], [11, 18, 5], [29, 18, 5], [12, 30, 5], [28, 30, 5], [20, 33, 5]] as const) p.ell(x, y, r, r * 0.9, F);
    p.ell(12, 12, 3.5, 3, Fd); p.ell(28, 12, 3.5, 3, Fd);
    p.ell(20, 21, 7.5, 6.5, F);
    p.ell(15, 26, 1.6, 1.2, Fd); p.ell(26, 27, 1.6, 1.2, Fd);
    bigEye(p, 15, 19); bigEye(p, 23, 19);
    p.ell(20, 24, 1.6, 1.1, N);
    p.set(19, 26, N); p.set(21, 26, N);
    p.set(13, 24, '#ffa8b8'); p.set(27, 24, '#ffa8b8');
    p.tri(25, 9, 30, 6, 30, 12, Rb); p.tri(35, 9, 30, 6, 30, 12, Rb); p.ell(30, 9, 1.4, 1.4, '#ff4a88');
    p.ell(14, 37, 2.6, 1.4, Fd); p.ell(26, 37, 2.6, 1.4, Fd);
  },
  wangmong(p) {
    const F = '#fff0d8', Fd = '#e8c890', G = '#ffd040', Ht = '#ff5a8a', N = '#3a2a2a';
    p.ell(34, 22, 4, 6, F);
    p.rect(12, 30, 5, 8, Fd); p.rect(23, 30, 5, 8, Fd);
    for (const [x, y, r] of [[20, 24, 12], [9, 22, 5], [31, 22, 5]] as const) p.ell(x, y, r, r * 0.9, F);
    p.tri(10, 9, 14, 9, 11, 1, F); p.tri(17, 7, 23, 7, 20, -1, F); p.tri(26, 9, 30, 9, 29, 1, F);
    p.set(11, 2, G); p.set(20, 0, G); p.set(29, 2, G);
    p.ell(9, 13, 4, 3.5, Fd); p.ell(31, 13, 4, 3.5, Fd);
    p.ell(20, 15, 9, 7, F);
    p.rect(14, 13, 3, 3, K); p.rect(23, 13, 3, 3, K); p.set(14, 13, '#ffffff'); p.set(23, 13, '#ffffff');
    p.ell(20, 18, 1.8, 1.2, N); p.rect(19, 20, 3, 1, N);
    p.rect(11, 23, 18, 2, '#e85a7a');
    p.ell(20, 27, 2.5, 2.2, Ht); p.ell(18.8, 26, 1.3, 1.3, Ht); p.ell(21.2, 26, 1.3, 1.3, Ht); p.set(19, 26, '#ffffff');
  },

  // ── 독: 전갈 2단 ───────────────────────────────────────────
  ggorichim(p) {
    const B = '#9a5ac8', D = '#6a3a98', L = '#d0a8f0', St = '#ffe060';
    chain(p, [[26, 28], [32, 26], [35, 19], [33, 12], [28, 10]], 2.2, B);
    p.tri(26, 8, 30, 10, 25, 12, St);
    for (const [x0, y0, x1, y1] of [[14, 30, 9, 36], [18, 31, 15, 37], [24, 31, 26, 37], [28, 30, 32, 36]] as const) p.line(x0, y0, x1, y1, D);
    p.ell(10, 24, 3.5, 2.6, B); p.ell(6, 22, 2.5, 2, B);
    p.tri(4, 20, 7, 18, 5, 24, L);
    p.ell(20, 28, 8, 5, B);
    p.ell(14, 26, 4.5, 4, B);
    p.ell(19, 26, 2, 1.2, L); p.ell(24, 27, 1.6, 1, L);
    bigEye(p, 11, 23); bigEye(p, 16, 23);
    p.set(13, 29, K); p.set(14, 30, K); p.set(15, 29, K);
  },
  dokjeongal(p) {
    const B = '#7a4a9a', D = '#4e2a68', Sa = '#c8a050', St = '#e8f070', L = '#b890d8';
    chain(p, [[28, 26], [35, 22], [38, 13], [35, 5], [28, 3]], 3, B);
    p.tri(25, 1, 30, 3, 25, 7, St); p.set(25, 4, '#ffffff');
    for (const [x0, y0, x1, y1] of [[12, 28, 6, 37], [17, 30, 13, 38], [24, 30, 27, 38], [29, 28, 34, 36]] as const) { p.line(x0, y0, x1, y1, D); p.line(x0 + 1, y0, x1 + 1, y1, D); }
    p.ell(8, 19, 5, 4, B); p.ell(3, 15, 3.5, 3, B);
    p.tri(0, 11, 5, 10, 1, 18, Sa); p.tri(5, 12, 9, 13, 3, 17, Sa);
    p.ell(20, 26, 11, 6.5, B);
    for (const x of [17, 22, 27]) paint(p, x, 0, 1, 40, D);
    p.ell(12, 23, 6, 5, B);
    p.ell(10, 20, 2.5, 1.4, L);
    p.rect(8, 22, 3, 2, '#ff4a4a'); p.rect(13, 22, 3, 2, '#ff4a4a');
    p.line(7, 20, 11, 21, D); p.line(17, 20, 13, 21, D);
  },

  // ── 비행/에스퍼: 부엉이 2단 ────────────────────────────────
  bueong(p) {
    const B = '#a8784a', D = '#7a5028', L = '#f4e0c0', Ey = '#ffd040', Kb = '#f0a030';
    p.tri(9, 12, 14, 12, 10, 4, D); p.tri(26, 12, 31, 12, 30, 4, D);
    p.ell(20, 23, 12, 13, B);
    p.ell(8, 25, 3.5, 7, D); p.ell(32, 25, 3.5, 7, D);
    p.ell(20, 28, 7, 7, L);
    for (const [x, y] of [[17, 26], [23, 26], [20, 30], [17, 33], [23, 33]] as const) { p.set(x, y, D); p.set(x + 1, y + 1, D); }
    p.ell(15, 18, 5, 5, L); p.ell(25, 18, 5, 5, L);
    p.ell(15, 18, 3.5, 3.5, Ey); p.ell(25, 18, 3.5, 3.5, Ey);
    p.rect(14, 17, 3, 3, K); p.rect(24, 17, 3, 3, K); p.set(14, 17, '#ffffff'); p.set(24, 17, '#ffffff');
    p.tri(18.5, 21, 21.5, 21, 20, 24, Kb);
    p.rect(15, 36, 3, 2, Kb); p.rect(22, 36, 3, 2, Kb);
  },
  olppaemi(p) {
    const B = '#4a3a7a', D = '#2e2250', L = '#c8b8f0', Mn = '#ffe070', Ey = '#7ae0ff', Kb = '#f0b030';
    p.tri(2, 30, 10, 14, 13, 26, D); p.tri(38, 30, 30, 14, 27, 26, D);
    p.line(3, 29, 10, 16, L); p.line(37, 29, 30, 16, L);
    p.tri(10, 10, 15, 11, 9, 1, D); p.tri(25, 11, 30, 10, 31, 1, D);
    p.ell(20, 22, 10, 15, B);
    p.ell(20, 26, 6, 9, L);
    p.ell(20, 26, 3.5, 3.5, Mn); p.ell(21.5, 25, 3, 3, L);
    p.ell(15, 14, 4.5, 4, D); p.ell(25, 14, 4.5, 4, D);
    p.rect(13, 13, 4, 3, Ey); p.rect(23, 13, 4, 3, Ey);
    p.rect(14, 14, 2, 2, K); p.rect(24, 14, 2, 2, K);
    p.tri(18.5, 17, 21.5, 17, 20, 21, Kb);
    p.rect(15, 37, 3, 2, Kb); p.rect(22, 37, 3, 2, Kb);
    for (const [x, y] of [[4, 6], [36, 5], [6, 36], [34, 37]] as const) { p.set(x, y, Mn); p.set(x + 1, y, Mn); }
  },

  // ── 파스텔: 마카롱 2단 ─────────────────────────────────────
  makarong(p) {
    const Pk = '#ffbcd2', Pd = '#f090b0', Cr = '#fff8f0', Cd = '#f0e0d0';
    p.ell(14, 37, 3, 1.4, Pd); p.ell(26, 37, 3, 1.4, Pd);
    p.ell(20, 30, 14, 6, Pk);
    for (let x = 7; x <= 33; x += 2) p.set(x, 25, Pd);
    p.ell(20, 24, 13.5, 2.8, Cr);
    p.ell(20, 17, 14, 8, Pk);
    for (let x = 7; x <= 33; x += 2) p.set(x, 22, Pd);
    p.ell(14, 12, 3.5, 1.6, '#ffe0ea');
    bigEye(p, 14, 16, '#6a3a5a'); bigEye(p, 23, 16, '#6a3a5a');
    p.set(19, 21, '#6a3a5a'); p.set(20, 21, '#6a3a5a');
    p.set(12, 20, '#ff8ab0'); p.set(28, 20, '#ff8ab0');
    p.ell(29, 9, 2, 2, '#ff6a8a'); p.set(29, 7, '#58b048');
    p.ell(20, 24, 1.5, 0.8, Cd);
  },
  makatop(p) {
    const Pk = '#ffbcd2', Pd = '#f090b0', Mt = '#b8f0dc', Md = '#80d0b8', Lv = '#d8c8f8', Ld = '#a898d8', Cr = '#fff8f0', St = '#ff5a7a';
    p.ell(20, 33, 14, 5, Lv); p.ell(20, 29, 13.5, 2, Cr); p.ell(20, 26, 14, 4.5, Lv);
    for (let x = 7; x <= 33; x += 2) { p.set(x, 30, Ld); p.set(x, 28, Ld); }
    p.ell(20, 22, 12, 4, Mt); p.ell(20, 19, 11.5, 1.8, Cr); p.ell(20, 16, 12, 4, Mt);
    for (let x = 9; x <= 31; x += 2) { p.set(x, 20, Md); p.set(x, 18, Md); }
    p.ell(20, 12, 10, 3.5, Pk); p.ell(20, 9.5, 9.5, 1.6, Cr); p.ell(20, 7, 10, 3.5, Pk);
    for (let x = 11; x <= 29; x += 2) { p.set(x, 11, Pd); p.set(x, 9, Pd); }
    p.ell(20, 2.5, 3.5, 3, St); p.set(19, 1, '#ffffff'); p.tri(18, 0, 22, 0, 20, -2, '#58b048');
    bigEye(p, 14, 15, '#3a6a5a'); bigEye(p, 23, 15, '#3a6a5a');
    p.set(19, 20, '#3a6a5a'); p.set(20, 21, '#3a6a5a'); p.set(21, 20, '#3a6a5a');
    p.line(6, 26, 1, 22, Cr); p.line(34, 26, 39, 22, Cr); p.ell(1, 21, 1.6, 1.6, Cr); p.ell(39, 21, 1.6, 1.6, Cr);
  },

  // ── 파스텔: 해파리 2단 ─────────────────────────────────────
  jelly(p) {
    const Bl = '#f8c8e8', Bd = '#e0a0d0', Rm = '#fff0fa', R1 = '#b8f0dc', R2 = '#ffe8a0', R3 = '#c8d8ff';
    for (const [x, c] of [[12, R1], [17, R2], [23, R3], [28, R1]] as const) {
      chain(p, [[x, 22], [x - 2, 27], [x + 1, 31], [x - 1, 36]], 1.2, c);
    }
    p.ell(20, 15, 13, 10, Bl);
    p.ell(20, 22, 13, 2.5, Rm);
    for (let x = 8; x <= 32; x += 3) p.set(x, 23, Bd);
    p.ell(14, 9, 4, 2.5, Rm);
    bigEye(p, 14, 14, '#7a4a8a'); bigEye(p, 23, 14, '#7a4a8a');
    p.set(19, 19, '#7a4a8a'); p.set(20, 20, '#7a4a8a'); p.set(21, 19, '#7a4a8a');
    p.set(11, 18, '#ff90c0'); p.set(29, 18, '#ff90c0');
  },
  aurora(p) {
    const P = '#ffc8e4', M = '#b8f0dc', L = '#d4c8ff', Rm = '#fff6fc', R2 = '#ffe8a0', Sp = '#ffffff';
    for (const [x, c] of [[7, M], [12, L], [17, R2], [23, P], [28, M], [33, L]] as const) {
      chain(p, [[x, 22], [x - 3, 28], [x + 1, 33], [x - 2, 39]], 1.1, c);
    }
    p.ell(20, 14, 16, 11, P);
    paint(p, 0, 8, 40, 4, M); paint(p, 0, 13, 40, 4, L); paint(p, 0, 18, 40, 3, P);
    p.ell(20, 22, 16, 2.6, Rm);
    for (const x of [6, 13, 20, 27, 34]) p.tri(x - 2, 4, x + 2, 4, x, -1, Rm);
    p.ell(13, 7, 4, 2, Rm);
    p.rect(13, 13, 3, 4, '#6a4a9a'); p.rect(24, 13, 3, 4, '#6a4a9a'); p.set(13, 13, Sp); p.set(24, 13, Sp);
    p.set(19, 18, '#6a4a9a'); p.set(20, 19, '#6a4a9a'); p.set(21, 18, '#6a4a9a');
    for (const [x, y] of [[2, 6], [38, 8], [3, 30], [37, 32]] as const) { p.set(x, y, Sp); p.set(x - 1, y, Sp); p.set(x + 1, y, Sp); p.set(x, y - 1, Sp); p.set(x, y + 1, Sp); }
  },

  // ── 파스텔: 유니콘 3단 ─────────────────────────────────────
  agiyuni(p) {
    const W = '#fffaff', Ws = '#e8e0f4', M1 = '#ffc0d8', M2 = '#c8e8ff', M3 = '#d8f8c8', Hn = '#ffe8a0', Hf = '#e0c8f0';
    p.rect(15, 28, 3, 8, Ws); p.rect(27, 28, 3, 8, Ws);
    p.ell(33, 22, 3, 3.5, M1); p.ell(35, 25, 2, 2.5, M2);
    p.ell(23, 24, 10, 6, W);
    p.ell(14, 17, 4, 6, W);
    p.ell(11, 12, 6, 5.5, W);
    p.ell(7, 14.5, 3.5, 2.8, '#fff0f6');
    p.ell(15, 7, 3, 2.5, M1); p.ell(18, 10, 2.8, 2.5, M2); p.ell(18, 15, 2.6, 2.5, M3); p.ell(16, 19, 2.2, 2.2, M1);
    p.tri(9, 7, 12, 7, 11, 1, Hn); p.set(10, 5, '#ffffff');
    p.tri(13, 8, 16, 7, 15, 3, W);
    bigEye(p, 8, 10, '#8a5ab0');
    p.set(5, 15, '#c890b0'); p.set(11, 15, '#ffa8c8');
    p.rect(12, 28, 3, 9, W); p.rect(24, 28, 3, 9, W);
    p.rect(12, 36, 3, 1, Hf); p.rect(24, 36, 3, 1, Hf); p.rect(15, 35, 3, 1, Hf); p.rect(27, 35, 3, 1, Hf);
  },
  mujigae(p) {
    const W = '#fffaff', Ws = '#e8e0f4', R = ['#ffb0c8', '#ffd8a8', '#fff0a0', '#c8f0c0', '#b8d8ff', '#d8c0ff'], Hn = '#ffd860', Hf = '#d8c0f0';
    p.rect(16, 25, 3, 12, Ws); p.rect(30, 25, 3, 12, Ws);
    R.forEach((c, i) => p.ell(35 + i * 0.6, 17 + i * 2.6, 2.6, 2.2, c));
    p.ell(25, 21, 11, 6.5, W);
    p.ell(14, 15, 4, 7, W);
    p.ell(10, 9, 6, 5, W);
    p.ell(5.5, 11.5, 3.5, 2.8, '#fff0f6');
    R.forEach((c, i) => p.ell(15 + (i % 2) * 2, 4 + i * 3, 3, 2.2, c));
    p.tri(7, 5, 10, 5, 7, -2, Hn); p.line(8, 4, 8, 1, '#fff6c8');
    bigEye(p, 7, 7, '#7a4ab0');
    p.set(4, 12, '#c890b0');
    p.rect(12, 25, 3, 13, W); p.rect(26, 25, 3, 13, W);
    p.rect(12, 37, 3, 1, Hf); p.rect(26, 37, 3, 1, Hf);
  },
  byeolkkum(p) {
    const W = '#f8f6ff', Ws = '#d8d4f0', Mn = '#5a6ad8', Md = '#3a4aa8', St = '#fff6a8', Hn = '#ffe070', Wg = '#e8e4ff';
    p.tri(18, 14, 34, 0, 32, 14, Wg); p.tri(22, 15, 38, 4, 34, 17, Wg);
    p.line(30, 4, 22, 14, Ws); p.line(35, 7, 25, 15, Ws);
    p.rect(17, 25, 3, 12, Ws); p.rect(31, 25, 3, 12, Ws);
    chain(p, [[34, 20], [38, 25], [37, 32]], 2.4, Mn);
    p.ell(26, 22, 11, 6.5, W);
    p.ell(15, 15, 4, 7, W);
    p.ell(10, 9, 6, 5, W);
    p.ell(5.5, 11.5, 3.5, 2.8, '#f8f0ff');
    chain(p, [[13, 3], [17, 8], [17, 14], [15, 20]], 2.6, Mn);
    for (const [x, y] of [[14, 4], [17, 10], [16, 16], [37, 26], [36, 31]] as const) p.set(x, y, St);
    p.tri(7, 5, 10, 5, 7, -2, Hn);
    p.set(7, -1, '#ffffff'); p.ell(7, 0, 1.4, 1.4, St);
    p.rect(6, 8, 3, 2, Md); p.set(6, 8, '#ffffff');
    p.line(5, 7, 9, 7, Md);
    p.rect(13, 25, 3, 13, W); p.rect(27, 25, 3, 13, W);
    p.rect(13, 37, 3, 1, St); p.rect(27, 37, 3, 1, St);
    for (const [x, y] of [[2, 22], [22, 3], [38, 38], [3, 33]] as const) { p.set(x, y, St); p.set(x - 1, y, St); p.set(x + 1, y, St); p.set(x, y - 1, St); p.set(x, y + 1, St); }
  },

  // ── 파스텔: 아기오리 2단 ───────────────────────────────────
  pongduck(p) {
    const Y = '#fff0a0', Yd = '#f0d070', Bk = '#ffb060', Bt = '#9ad0f8', Wt = '#c8ecff';
    p.ell(20, 37, 12, 2, Wt);
    p.rect(13, 32, 5, 5, Bt); p.rect(22, 32, 5, 5, Bt); p.rect(13, 32, 5, 1, '#c8e8ff'); p.rect(22, 32, 5, 1, '#c8e8ff');
    p.ell(20, 25, 10, 8, Y);
    p.ell(29, 22, 3.5, 2.5, Y);
    p.ell(11, 25, 3, 4, Yd);
    p.ell(18, 14, 7.5, 7, Y);
    p.tri(17, 6, 19, 6, 18, 3, Yd); p.tri(19, 7, 21, 7, 22, 4, Yd);
    bigEye(p, 13, 12, '#5a4a3a'); bigEye(p, 20, 12, '#5a4a3a');
    p.ell(17, 18, 4.5, 2, Bk); p.line(13, 18, 21, 18, '#e8904a');
    p.set(11, 16, '#ffb0b0'); p.set(24, 16, '#ffb0b0');
    for (const [x, y] of [[5, 35], [35, 35], [7, 33]] as const) p.set(x, y, Wt);
  },
  ubiduck(p) {
    const Y = '#fff0a0', Co = '#ffd860', Cd = '#e8b840', Bk = '#ffb060', Um = '#b8dcff', Ud = '#80b8e8', Bt = '#9ad0f8';
    p.tri(24, 4, 40, 4, 32, -2, Um); p.ell(32, 4, 8, 2, Um);
    for (const x of [26, 32, 38]) p.set(x, 5, Ud);
    p.line(32, 5, 32, 22, '#8a6a4a'); p.line(32, 22, 30, 23, '#8a6a4a');
    p.rect(12, 33, 5, 4, Bt); p.rect(21, 33, 5, 4, Bt);
    p.ell(18, 26, 10, 9, Co);
    p.rect(17, 19, 2, 14, Cd);
    for (const y of [22, 26, 30]) p.ell(20, y, 1, 1, '#ffffff');
    p.ell(29, 22, 3, 2.5, Co);
    p.ell(8, 25, 3, 5, Cd);
    p.ell(17, 13, 8, 7, Co);
    p.ell(16, 14, 6, 5.5, Y);
    p.rect(9, 9, 16, 2, Cd);
    bigEye(p, 12, 12, '#5a4a3a'); bigEye(p, 18, 12, '#5a4a3a');
    p.ell(15, 18, 4.5, 2, Bk); p.line(11, 18, 19, 18, '#e8904a');
    for (const [x, y] of [[4, 8], [8, 3], [2, 15], [38, 12]] as const) { p.set(x, y, Ud); p.set(x, y + 1, Ud); }
  },

  // ── 파스텔: 벚꽃새 2단 ─────────────────────────────────────
  kkotip(p) {
    const B = '#ffd0e0', D = '#f0a0c0', L = '#fff6fa', Pt = '#ffb8d0', Kb = '#ffb060';
    p.tri(28, 22, 37, 19, 34, 27, D);
    p.ell(20, 24, 9, 8, B);
    p.ell(18, 27, 5.5, 4.5, L);
    p.ell(24, 23, 5.5, 4, D);
    p.ell(15, 15, 6.5, 6, B);
    p.ell(13, 8, 2.5, 3.5, Pt); p.ell(17, 7, 2.5, 3.5, Pt); p.ell(15, 9, 1, 1, '#ffe060');
    bigEye(p, 11, 13, '#7a4a6a');
    p.set(10, 18, '#ff90b0');
    p.tri(6, 16, 9, 14, 9, 18, Kb);
    p.line(18, 31, 17, 37, Kb); p.line(22, 31, 23, 37, Kb);
    p.line(15, 37, 19, 37, Kb); p.line(21, 37, 25, 37, Kb);
  },
  beotkkot(p) {
    const B = '#ffd8e8', D = '#f0a8c8', L = '#fff8fc', Pt = '#ffb0cc', Pc = '#ffe060', Kb = '#ffa860';
    for (const [x, y] of [[26, 26], [31, 29], [35, 33], [38, 37]] as const) { p.ell(x, y, 2.4, 1.8, Pt); p.set(x, y, Pc); }
    p.tri(14, 20, 2, 4, 20, 16, D); p.tri(22, 18, 34, 2, 28, 20, D);
    for (const [x, y] of [[5, 7], [10, 11], [31, 5], [27, 11]] as const) { p.ell(x, y, 2, 1.6, Pt); p.set(x, y, Pc); }
    p.ell(19, 22, 8, 6, B);
    p.ell(17, 24.5, 5, 3, L);
    p.ell(12, 15, 5.5, 5, B);
    p.ell(10, 8, 2.2, 3, Pt); p.ell(14, 7, 2.2, 3, Pt); p.ell(12, 9, 1, 1, Pc);
    p.rect(9, 13, 2, 2, '#6a3a5a'); p.set(9, 13, '#ffffff');
    p.tri(3, 16, 7, 14, 7, 18, Kb);
    p.line(17, 28, 16, 33, Kb); p.line(21, 28, 22, 33, Kb);
  },

  // ── 파스텔: 수국달팽이 2단 ─────────────────────────────────
  suguk(p) {
    const Bd = '#c8e8b0', Bdd = '#98c880', H1 = '#b8d0ff', H2 = '#d8c0f8', H3 = '#ffc8e8', Lf = '#78c068';
    p.ell(18, 33, 15, 4.5, Bd);
    p.ell(7, 26, 5, 6, Bd);
    p.line(5, 21, 3, 15, Bdd); p.line(9, 21, 10, 15, Bdd);
    p.ell(3, 14, 1.6, 1.6, Bdd); p.ell(10, 14, 1.6, 1.6, Bdd);
    p.ell(24, 22, 11, 10, H1);
    const flowers: [number, number, string][] = [[18, 17, H2], [24, 14, H3], [30, 18, H2], [21, 23, H3], [28, 25, H1], [33, 23, H3], [17, 27, H2], [25, 29, H2], [31, 30, H3]];
    for (const [x, y, c] of flowers) {
      p.ell(x, y, 2.6, 2.6, c);
      p.set(x, y, '#ffffff');
    }
    p.ell(14, 13, 3, 1.6, Lf);
    bigEye(p, 4, 24, '#4a6a3a'); bigEye(p, 8, 24, '#4a6a3a');
    p.set(6, 29, '#4a6a3a'); p.set(7, 30, '#4a6a3a'); p.set(8, 29, '#4a6a3a');
  },
  jangma(p) {
    const Bd = '#b8e0a0', Bdd = '#88b870', H1 = '#a8c4ff', H2 = '#ccb0f8', H3 = '#ffbce0', Lf = '#5ab058', Rd = '#a8e0ff';
    p.ell(19, 34, 17, 5, Bd);
    p.ell(6, 26, 6, 7, Bd);
    p.line(4, 20, 1, 12, Bdd); p.line(9, 20, 11, 12, Bdd);
    p.ell(1, 11, 1.8, 2.4, Rd); p.ell(11, 11, 1.8, 2.4, Rd); p.set(1, 10, '#ffffff'); p.set(11, 10, '#ffffff');
    p.ell(25, 20, 14, 13, H1);
    const fl: [number, number, string][] = [[17, 13, H2], [24, 9, H3], [31, 12, H2], [36, 18, H3], [20, 19, H3], [27, 16, H1], [33, 24, H2], [18, 26, H2], [25, 24, H3], [30, 30, H1], [22, 31, H3], [36, 30, H2], [14, 20, H1]];
    for (const [x, y, c] of fl) { p.ell(x, y, 3, 3, c); p.set(x, y, '#ffffff'); }
    p.ell(12, 7, 6, 2.6, Lf); p.line(12, 7, 15, 13, '#3a8a3a');
    p.rect(3, 24, 2, 3, '#3a5a2a'); p.rect(8, 24, 2, 3, '#3a5a2a'); p.set(3, 24, '#ffffff'); p.set(8, 24, '#ffffff');
    p.rect(5, 29, 3, 1, '#3a5a2a');
  },

  // ── 파스텔: 빙수 2단 ───────────────────────────────────────
  bingsu(p) {
    const Cup = '#c8e8ff', Cd = '#90c0e8', Ic = '#ffffff', Is = '#e8f0f8', Sy = '#ffb0c8', Rb = '#a8585a';
    p.tri(8, 26, 32, 26, 26, 38, Cup); p.tri(8, 26, 14, 38, 26, 38, Cup);
    p.rect(9, 26, 22, 2, Cd); p.rect(13, 36, 14, 2, Cd);
    p.ell(20, 19, 12, 9, Ic);
    p.ell(14, 14, 4, 3, Is); p.ell(26, 15, 3, 2.5, Is);
    p.ell(20, 12, 7, 3, Sy); p.tri(14, 13, 16, 13, 15, 20, Sy); p.tri(23, 13, 25, 13, 24, 18, Sy);
    for (const [x, y] of [[13, 21], [27, 20], [20, 24], [17, 23]] as const) p.ell(x, y, 1.2, 1, Rb);
    bigEye(p, 14, 17, '#4a5a7a'); bigEye(p, 23, 17, '#4a5a7a');
    p.set(19, 22, '#4a5a7a'); p.set(20, 23, '#4a5a7a'); p.set(21, 22, '#4a5a7a');
    p.set(12, 21, '#ffa0b8'); p.set(28, 21, '#ffa0b8');
  },
  wangbingsu(p) {
    const Gl = '#d8f0ff', Gd = '#a0c8e8', Ic = '#ffffff', Is = '#e8f0f8', Sb = '#ff6a8a', Mg = '#ffc860', Mc = '#f8e0e8', Rb = '#a8585a', Sp = '#c8d0e0';
    p.ell(20, 36, 12, 2.5, Gd);
    p.rect(17, 31, 6, 5, Gl);
    p.ell(20, 27, 16, 5.5, Gl);
    p.ell(20, 23, 16, 2.5, Gd);
    p.ell(20, 16, 14, 10, Ic);
    p.ell(13, 11, 4, 3, Is);
    p.ell(14, 6, 3, 3, Sb); p.set(13, 5, '#ffffff'); p.tri(12, 3, 16, 3, 14, 1, '#58b048');
    p.rect(22, 3, 5, 4, Mg); p.rect(28, 6, 4, 4, Mg); p.rect(18, 2, 3, 3, Mg);
    p.ell(9, 13, 2.5, 2.2, Mc); p.ell(30, 13, 2.5, 2.2, Mc);
    for (const [x, y] of [[10, 18], [28, 19], [19, 22], [24, 21]] as const) p.ell(x, y, 1.3, 1, Rb);
    bigEye(p, 14, 14, '#4a5a7a'); bigEye(p, 23, 14, '#4a5a7a');
    p.rect(18, 19, 4, 1, '#4a5a7a');
    p.line(34, 30, 38, 18, Sp); p.ell(38, 17, 1.8, 2.4, Sp);
  },

  // ── 얼음/격투: 북극곰 2단 ──────────────────────────────────
  agibuk(p) {
    const W = '#f8fbff', Ws = '#d4e4f4', N = '#2a2a3a', P = '#ffb8c8', Ic = '#a8e8f8';
    p.ell(12, 13, 3, 3, W); p.ell(28, 13, 3, 3, W); p.ell(12, 13, 1.5, 1.5, Ws); p.ell(28, 13, 1.5, 1.5, Ws);
    p.ell(14, 35, 4, 2.5, Ws); p.ell(26, 35, 4, 2.5, Ws);
    p.ell(20, 27, 10, 9, W);
    p.ell(9, 26, 3.5, 4.5, W); p.ell(31, 26, 3.5, 4.5, W);
    p.ell(20, 18, 9, 7.5, W);
    p.ell(20, 22, 4.5, 3, '#ffffff'); p.ell(20, 20.5, 2, 1.4, N);
    bigEye(p, 14, 16); bigEye(p, 23, 16);
    p.set(19, 23, N); p.set(21, 23, N);
    p.set(12, 21, P); p.set(28, 21, P);
    p.rect(14, 10, 12, 2, '#4a7ad8'); p.ell(26, 9, 2, 2, '#e84a4a');
    p.tri(16, 30, 20, 30, 18, 26, Ic);
  },
  bingsan(p) {
    const W = '#eef4fc', Ws = '#c4d4e8', N = '#2a2a3a', Ic = '#a8e8f8', Id = '#68c0d8';
    p.rect(10, 31, 7, 7, Ws); p.rect(23, 31, 7, 7, Ws);
    p.ell(4, 20, 4.5, 8, W); p.ell(36, 20, 4.5, 8, W);
    p.ell(4, 29, 4, 3.5, Ws); p.ell(36, 29, 4, 3.5, Ws);
    p.tri(10, 16, 18, 16, 14, 3, Ic); p.tri(16, 14, 26, 14, 21, 0, Ic); p.tri(23, 16, 31, 16, 27, 4, Ic);
    p.line(14, 6, 14, 14, Id); p.line(21, 3, 21, 13, Id); p.line(27, 7, 27, 14, Id);
    p.ell(20, 23, 14, 12, W);
    p.ell(20, 26, 8, 8, '#ffffff');
    p.ell(11, 10, 3, 3, W); p.ell(29, 10, 3, 3, W);
    p.ell(20, 14, 8, 6.5, W);
    p.ell(20, 17.5, 4, 2.6, '#ffffff'); p.ell(20, 16, 1.8, 1.2, N);
    p.rect(14, 12, 3, 2, N); p.rect(23, 12, 3, 2, N); p.set(14, 12, Ic); p.set(23, 12, Ic);
    p.line(13, 10, 17, 11, Ws); p.line(27, 10, 23, 11, Ws);
    p.rect(17, 19, 6, 1, N);
    p.tri(1, 26, 7, 26, 4, 34, Ic); p.tri(33, 26, 39, 26, 36, 34, Ic);
  },

  // ── 물/드래곤: 현무 2단 ────────────────────────────────────
  hyeonmuk(p) {
    const Sh = '#3a6a5a', Sd = '#26483c', Sk = '#8ac8a8', L = '#e8f4d8', Sn = '#2a2a3a', Y = '#ffd040';
    p.ell(8, 30, 3, 2.5, Sk); p.ell(32, 30, 3, 2.5, Sk); p.ell(12, 35, 3, 2, Sk); p.ell(28, 35, 3, 2, Sk);
    p.tri(31, 28, 38, 31, 32, 32, Sk);
    p.ell(20, 26, 13, 9, Sh);
    for (const [x, y] of [[14, 23], [20, 20], [26, 23], [17, 29], [23, 29]] as const) { p.ell(x, y, 2.6, 2.2, Sd); p.set(x, y, '#5a8a7a'); }
    chain(p, [[8, 22], [13, 18], [20, 18], [27, 19], [31, 23]], 1.1, Sn);
    p.set(31, 22, Y);
    p.ell(20, 33.5, 10, 2.5, L);
    p.ell(9, 22, 6, 5.5, Sk);
    bigEye(p, 5, 19); bigEye(p, 10, 19);
    p.set(7, 25, '#2a5a3a'); p.set(8, 26, '#2a5a3a'); p.set(9, 25, '#2a5a3a');
  },
  hyeonmu(p) {
    const Sh = '#2a4a5a', Sd = '#18303c', Sk = '#6aa890', L = '#dceccc', Sn = '#1e1e2e', Sb = '#5a4a8a', Y = '#ffd040', Wv = '#a8dcff';
    p.ell(4, 31, 4, 3, Sk); p.ell(36, 31, 4, 3, Sk); p.ell(10, 37, 4, 2, Sk); p.ell(30, 37, 4, 2, Sk);
    p.ell(20, 26, 17, 11, Sh);
    for (const [x, y] of [[11, 22], [20, 18], [29, 22], [15, 30], [25, 30], [20, 25]] as const) { p.ell(x, y, 3.2, 2.6, Sd); p.set(x, y, '#4a7a8a'); }
    chain(p, [[30, 30], [36, 22], [34, 13], [27, 9], [22, 12]], 2, Sb);
    p.ell(21, 11, 3.5, 3, Sb); p.rect(19, 10, 2, 1, Y); p.tri(17, 12, 19, 11, 19, 13, '#e84a4a');
    p.ell(20, 35, 13, 2.5, L);
    p.ell(7, 22, 7, 6, Sk);
    p.tri(5, 16, 8, 16, 5, 11, '#e8e0c0'); p.tri(9, 16, 12, 16, 12, 11, '#e8e0c0');
    p.rect(3, 20, 3, 2, Y); p.rect(9, 20, 3, 2, Y); p.set(3, 20, '#ffffff'); p.set(9, 20, '#ffffff');
    p.line(4, 25, 10, 25, '#1e3a2a');
    for (const [x, y] of [[1, 36], [39, 35], [20, 39]] as const) { p.set(x, y, Wv); p.set(x + 1, y, Wv); }
  },

  // ── 특별: 산군 (흰 호랑이 정령) ────────────────────────────
  sangun(p) {
    const W = '#f6f6fa', G = '#c8ccd8', St = '#3a4a6a', Ey = '#7ae0ff', Mi = '#a8d0e8', Gd = '#ffd040';
    p.ell(20, 38, 18, 2.5, Mi);
    p.rect(15, 27, 4, 10, G); p.rect(30, 27, 4, 10, G);
    chain(p, [[34, 22], [38, 16], [36, 9]], 1.8, W);
    p.ell(36, 8, 2, 2.5, Mi);
    p.ell(25, 23, 12, 7.5, W);
    for (const x of [20, 25, 30, 34]) { p.line(x, 16, x - 2, 21, St); p.line(x + 1, 25, x - 1, 29, St); }
    p.ell(15, 21, 5, 6.5, W);
    p.tri(8, 11, 12, 11, 9, 6, W); p.tri(14, 11, 18, 12, 17, 6, W);
    p.set(9, 9, G); p.set(16, 9, G);
    p.ell(11, 16, 7.5, 6.5, W);
    p.ell(5, 19.5, 4, 3.2, W);
    p.line(10, 11, 11, 13, St); p.line(13, 10, 13, 13, St); p.line(16, 14, 18, 15, St); p.line(15, 18, 18, 18, St);
    p.rect(7, 15, 4, 2, Ey); p.set(7, 15, WHITE);
    p.line(6, 13, 11, 14, St);
    p.set(2, 18, '#e85a5a'); p.set(3, 18, '#e85a5a');
    p.line(2, 21, 6, 22, St); p.set(4, 23, WHITE);
    p.rect(11, 27, 4, 11, W); p.rect(26, 27, 4, 11, W);
    p.rect(11, 32, 4, 1, Gd); p.rect(26, 32, 4, 1, Gd);
  },

  // ── 전설: 은하고래 ─────────────────────────────────────────
  eunha(p) {
    const B = '#2a3a8a', Bd = '#1a2460', L = '#8ab0f0', St = '#fff8c8', G = '#7ae0ff';
    p.tri(29, 18, 40, 6, 38, 20, B); p.tri(29, 20, 38, 20, 40, 32, B);
    p.set(39, 6, G); p.set(39, 32, G); p.set(38, 7, G); p.set(38, 31, G);
    p.ell(17, 20, 16, 11, B);
    p.ell(15, 25.5, 12, 4, L);
    p.tri(12, 27, 20, 27, 13, 36, Bd);
    for (const [x, y] of [[9, 14], [17, 11], [23, 15], [27, 12], [21, 19], [13, 17], [29, 18], [6, 18]] as const) p.set(x, y, St);
    p.set(17, 10, WHITE); p.set(16, 11, WHITE); p.set(18, 11, WHITE); p.set(17, 12, WHITE);
    p.ell(7, 13, 2.6, 2.6, St); p.ell(8.2, 12.3, 2.2, 2.2, B);
    eye(p, 5, 18, 2);
    p.rect(2, 23, 4, 1, Bd);
  },

  // ── 붕붕이 (통통한 꼬마벌, 벌레) ──────────────────────────────
  bungbung(p) {
    const Y = '#ffd040', Yd = '#d8a020', B = '#2a2a30', Wg = '#e0f4ff', Wd = '#a8d0e8';
    p.ell(26, 12, 6, 5, Wg); p.ell(13, 12, 5, 4, Wg); p.ell(26, 12, 4, 3, Wd);
    p.ell(20, 24, 12, 11, Y);
    for (const y of [20, 26, 31]) p.rect(9, y, 23, 2, B);
    p.ell(20, 24, 12, 11, Y); for (const y of [21, 27]) paint(p, 9, y, 23, 2, B);
    p.tri(30, 26, 37, 24, 31, 29, B);
    p.ell(14, 22, 7, 7, Y);
    eye(p, 10, 19, 3); eye(p, 15, 19, 3);
    p.set(12, 25, K); p.set(13, 26, K); p.set(14, 25, K);
    p.set(9, 23, '#ff9a7a'); p.set(17, 23, '#ff9a7a');
    p.line(10, 15, 7, 9, B); p.line(15, 15, 16, 9, B); p.ell(7, 9, 1.5, 1.5, B); p.ell(16, 9, 1.5, 1.5, B);
    p.rect(14, 34, 2, 3, Yd); p.rect(22, 34, 2, 3, Yd);
  },
  // ── 꿀단지벌 (꿀 항아리 속 번데기벌, 벌레) ────────────────────────
  kkuldanji(p) {
    const Pot = '#c87a3a', Pd = '#8a4a1e', H = '#ffc020', Hl = '#ffe880', Y = '#ffd040', B = '#2a2a30';
    p.ell(20, 26, 13, 11, Pot);
    p.rect(11, 13, 18, 4, Pd); p.rect(9, 12, 22, 2, Pot);
    p.ell(20, 26, 10, 8, Pd); p.ell(20, 25, 9, 7, Pot);
    p.ell(14, 28, 3, 4, H); p.ell(14, 27, 1.5, 2, Hl);
    p.ell(20, 9, 7, 6, Y);
    for (const y of [8, 12]) paint(p, 13, y, 14, 1, B);
    eye(p, 16, 8, 2); eye(p, 22, 8, 2);
    p.rect(19, 12, 2, 1, K);
    p.tri(8, 14, 12, 14, 10, 22, H); p.tri(28, 14, 31, 14, 30, 20, H);
    p.ell(10, 22, 1.5, 2, H); p.ell(30, 20, 1.2, 1.6, H);
  },
  // ── 여왕벌 (왕관 쓴 여왕벌, 벌레+페어리) ──────────────────────────
  yeowangbeol(p) {
    const Y = '#ffd040', Yd = '#d8a020', B = '#2a2a30', Wg = '#f4e8ff', Wd = '#d0b8f8', Cr = '#ffe060', Pk = '#ff8ac8', Gem = '#e8405a';
    p.ell(30, 12, 8, 6, Wg); p.ell(30, 20, 6, 4, Wg); p.ell(30, 12, 6, 4, Wd);
    p.ell(10, 13, 7, 5, Wg); p.ell(10, 13, 5, 3, Wd);
    p.ell(24, 28, 9, 10, Y); for (const y of [25, 30, 35]) paint(p, 15, y, 20, 2, B);
    p.tri(28, 34, 34, 38, 27, 39, B);
    p.ell(18, 20, 7, 7, Y); paint(p, 11, 22, 14, 2, Yd);
    p.ell(16, 12, 7, 6, Y);
    p.rect(11, 3, 11, 4, Cr); p.tri(11, 3, 13, 3, 12, 0, Cr); p.tri(15, 3, 18, 3, 16.5, -1, Cr); p.tri(20, 3, 22, 3, 21, 0, Cr); p.set(16, 4, Gem);
    eye(p, 12, 10, 3); eye(p, 18, 10, 3);
    p.set(15, 15, K); p.set(16, 16, K); p.set(17, 15, K);
    p.set(11, 14, Pk); p.set(21, 14, Pk);
    for (const [x, y] of [[4, 24], [36, 28], [8, 33], [33, 6]] as const) { p.set(x, y, Pk); p.set(x + 1, y, Cr); }
  },
  // ── 멍뭉이 (동네 강아지, 노말) ────────────────────────────────
  meongmeong(p) {
    const T = '#e8b878', Td = '#b87e48', W = '#fff4e0', N = '#3a2a20', Tg = '#ff7a8a';
    p.rect(13, 30, 4, 7, T); p.rect(25, 30, 4, 7, T);
    p.ell(24, 26, 10, 7, T);
    p.tri(32, 22, 38, 14, 35, 24, T);
    p.rect(17, 30, 4, 7, Td); p.rect(29, 30, 4, 7, Td);
    p.ell(14, 17, 9, 8, T);
    p.ell(10, 21, 5, 4, W);
    p.tri(5, 10, 10, 8, 6, 19, Td); p.tri(18, 8, 23, 10, 22, 18, Td);
    eye(p, 10, 15, 3); eye(p, 16, 15, 3);
    p.ell(9, 19, 1.8, 1.3, N);
    p.ell(11, 24, 1.5, 2, Tg);
    p.set(20, 18, '#ff9a7a');
  },
  // ── 백구 (하얀 진돗개, 노말) ──────────────────────────────────
  baekgu(p) {
    const W = '#f8f6f0', Wd = '#d8d0c0', N = '#2a2a30', Pk = '#f0b0a8';
    p.rect(12, 28, 4, 10, W); p.rect(28, 28, 4, 10, Wd);
    p.ell(24, 24, 12, 8, W);
    chain(p, [[34, 20], [37, 14], [33, 11]], 2.2, W);
    p.rect(16, 28, 4, 10, Wd); p.rect(32, 28, 4, 10, W);
    p.ell(14, 14, 8, 7, W);
    p.ell(8, 18, 5, 3.5, W);
    p.tri(8, 9, 12, 7, 9, 1, W); p.tri(16, 7, 20, 9, 19, 1, W); p.set(10, 4, Pk); p.set(18, 4, Pk);
    eye(p, 11, 12, 3); eye(p, 16, 12, 3);
    p.ell(4, 17, 1.8, 1.3, N);
    p.line(5, 20, 9, 21, Wd);
    p.rect(13, 21, 9, 2, '#3a7ad8');
  },
  // ── 진도대장 (붉은 목도리의 대장개, 노말+격투) ────────────────────
  jindodaejang(p) {
    const W = '#f4ecd8', Wd = '#c8b898', N = '#2a2a30', Sc = '#d8323a', Scd = '#9a1a22', Gd = '#ffd040';
    p.rect(11, 27, 5, 11, W); p.rect(27, 27, 5, 11, Wd);
    p.ell(23, 22, 13, 9, W);
    chain(p, [[35, 18], [39, 11], [35, 7]], 2.6, W);
    p.rect(15, 27, 5, 11, Wd); p.rect(31, 27, 5, 11, W);
    p.ell(13, 12, 9, 8, W);
    p.ell(6, 16, 5, 4, W);
    p.tri(7, 6, 11, 4, 7, -1, W); p.tri(15, 4, 20, 6, 19, -1, W);
    p.rect(9, 10, 4, 3, K); p.set(9, 10, WHITE); p.rect(15, 10, 4, 3, K); p.set(15, 10, WHITE);
    p.line(8, 8, 12, 9, N); p.line(19, 8, 15, 9, N);
    p.ell(2, 15, 1.8, 1.3, N);
    p.rect(10, 19, 14, 3, Sc); p.tri(22, 20, 30, 25, 26, 28, Sc); p.tri(24, 21, 31, 22, 29, 27, Scd);
    p.ell(17, 21, 1.5, 1.5, Gd);
  },
  // ── 도토리람쥐 (도토리 문 다람쥐, 노말) ─────────────────────────
  dotori(p) {
    const Br = '#c8783a', Bd = '#8a4a22', Bl = '#f4d0a0', St = '#3a2418', Ac = '#9a6a30', Acc = '#5a3a1a';
    chain(p, [[28, 32], [34, 26], [34, 16], [29, 10]], 4.5, Br);
    chain(p, [[30, 30], [33, 24], [33, 16]], 2, Bl);
    p.ell(19, 27, 8, 9, Br);
    p.ell(18, 29, 5, 6, Bl);
    p.line(16, 20, 22, 34, St);
    p.ell(16, 16, 8, 7, Br);
    p.tri(10, 11, 14, 10, 11, 5, Br); p.tri(18, 10, 22, 11, 21, 5, Br);
    p.ell(12, 19, 3, 2.5, Bl);
    eye(p, 12, 14, 3); eye(p, 18, 14, 3);
    p.set(11, 19, K);
    p.ell(15, 33, 3, 3.5, Ac); p.rect(12, 29, 6, 2, Acc); p.set(15, 28, Acc);
    p.rect(13, 35, 3, 3, Bd); p.rect(20, 35, 3, 3, Bd);
  },
  // ── 청설모 (회색 날쌘 청설모, 노말) ─────────────────────────────
  cheongseolmo(p) {
    const G = '#7a7a8a', Gd = '#4a4a5a', Gl = '#c8c8d4', Ac = '#9a6a30';
    chain(p, [[26, 34], [36, 28], [38, 16], [32, 6], [26, 8]], 5, G);
    chain(p, [[29, 32], [35, 26], [36, 16]], 2, Gl);
    p.ell(18, 26, 8, 10, G);
    p.ell(17, 29, 5, 6, Gl);
    p.ell(15, 13, 8, 7, G);
    p.tri(9, 8, 13, 7, 9, 0, G); p.tri(17, 7, 21, 8, 21, 0, G); p.line(9, 0, 8, -1, Gd); p.line(21, 0, 22, -1, Gd);
    p.ell(10, 16, 3, 2.5, Gl);
    p.rect(10, 10, 3, 4, K); p.set(10, 10, WHITE); p.rect(17, 10, 3, 4, K); p.set(17, 10, WHITE);
    p.set(8, 16, K);
    p.rect(12, 35, 4, 3, Gd); p.rect(20, 35, 4, 3, Gd);
    p.ell(10, 25, 2.5, 3, Ac); p.rect(8, 22, 5, 1, '#5a3a1a');
  },
  // ── 반디 (꼬리에 불 켜진 반딧불, 벌레) ───────────────────────────
  bandi(p) {
    const B = '#3a4a3a', Bl = '#5a6a5a', Gl = '#d8ff70', G2 = '#a8f040', Wg = '#e8f8f0';
    p.ell(26, 15, 6, 4, Wg); p.ell(16, 14, 5, 3.5, Wg);
    p.ell(28, 28, 8, 7, G2); p.ell(28, 28, 6, 5, Gl);
    p.ell(20, 23, 8, 7, B);
    p.ell(12, 20, 7, 6.5, B);
    p.ell(12, 22, 4.5, 3.5, Bl);
    eye(p, 8, 18, 3); eye(p, 13, 18, 3);
    p.set(10, 23, K); p.set(11, 24, K);
    p.line(9, 14, 6, 8, B); p.line(13, 14, 15, 8, B); p.set(6, 8, Gl); p.set(15, 8, Gl);
    for (const [x, y] of [[36, 22], [34, 36], [38, 30]] as const) p.set(x, y, Gl);
    p.rect(14, 29, 2, 4, B); p.rect(19, 29, 2, 4, B);
  },
  // ── 반짝반디 (전기 꼬리 반디, 벌레+전기) ─────────────────────────
  banjjakbandi(p) {
    const B = '#2a3a5a', Bl = '#4a5a8a', Gl = '#fff870', Y = '#ffd020', Wg = '#e8f4ff';
    p.ell(28, 12, 8, 5, Wg); p.ell(14, 11, 6, 4, Wg);
    p.ell(29, 27, 9, 8, Y); p.ell(29, 27, 6, 5, Gl);
    p.line(36, 20, 39, 16, Y); p.line(39, 16, 37, 16, Y); p.line(37, 16, 40, 12, Y);
    p.ell(20, 22, 9, 7, B);
    p.ell(12, 18, 7, 6.5, B);
    p.ell(12, 20, 4.5, 3.5, Bl);
    p.rect(8, 15, 3, 3, K); p.set(8, 15, Gl); p.rect(13, 15, 3, 3, K); p.set(13, 15, Gl);
    p.line(9, 22, 13, 22, K);
    p.line(9, 12, 5, 5, B); p.line(14, 12, 17, 5, B); p.tri(4, 5, 7, 5, 5, 2, Y); p.tri(16, 5, 19, 5, 18, 2, Y);
    p.rect(15, 28, 2, 6, B); p.rect(21, 28, 2, 6, B);
  },
  // ── 별빛반디 (은하수처럼 빛나는 반디, 벌레+전기) ───────────────────
  byeolbitbandi(p) {
    const B = '#1a2448', Bl = '#3a4a8a', Gl = '#fffad0', Y = '#ffe040', Wg = '#d8e8ff', Wl = '#a8c0ff';
    p.ell(30, 10, 10, 6, Wg); p.ell(30, 10, 8, 4, Wl); p.ell(10, 9, 8, 5, Wg); p.ell(10, 9, 6, 3, Wl);
    for (const [x, y] of [[27, 9], [33, 11], [8, 8], [12, 10]] as const) p.set(x, y, WHITE);
    p.ell(28, 28, 10, 9, Y); p.ell(28, 28, 7, 6, Gl);
    for (const [x, y] of [[36, 36], [38, 22], [20, 36], [3, 26]] as const) { p.set(x, y, Gl); p.set(x - 1, y, Y); p.set(x + 1, y, Y); p.set(x, y - 1, Y); p.set(x, y + 1, Y); }
    p.ell(19, 22, 9, 7, B);
    p.ell(12, 17, 7, 7, B);
    p.ell(12, 19, 4.5, 3.5, Bl);
    p.rect(8, 14, 3, 4, K); p.set(8, 14, Gl); p.rect(13, 14, 3, 4, K); p.set(13, 14, Gl);
    p.line(10, 22, 13, 21, K);
    p.line(9, 11, 6, 3, B); p.line(14, 11, 17, 3, B);
    p.tri(4, 4, 8, 4, 6, 0, Y); p.tri(15, 4, 19, 4, 17, 0, Y);
  },
  // ── 집게사슴 (집게 큰 사슴벌레, 벌레+격투) ───────────────────────
  jipgesasum(p) {
    const Br = '#6a3a1e', Bd = '#3a1e10', Bl = '#9a5a30', Ho = '#c8823a';
    p.ell(22, 27, 11, 9, Br); p.line(22, 18, 22, 36, Bd); p.ell(18, 24, 3, 2, Bl); p.ell(26, 24, 3, 2, Bl);
    for (const y of [24, 29, 34]) { p.line(11, y, 6, y + 3, Bd); p.line(33, y, 38, y + 3, Bd); }
    p.ell(15, 15, 8, 6, Br);
    chain(p, [[11, 11], [6, 6], [4, 1], [8, 3]], 1.6, Ho); chain(p, [[18, 10], [20, 4], [24, 1], [21, 4]], 1.6, Ho);
    p.set(6, 4, Bd); p.set(21, 3, Bd);
    eye(p, 11, 14, 2); eye(p, 17, 14, 2);
    p.line(13, 19, 16, 19, Bd);
  },
  // ── 장수사슴벌레 (거대한 집게의 장수, 벌레+격투) ───────────────────
  jangsu(p) {
    const Bk = '#2a1a14', Bl = '#5a3a28', Sh = '#8a6a50', Ho = '#d8902a', Hd = '#9a5a10', Rd = '#e8402a';
    p.ell(22, 28, 13, 10, Bk); p.line(22, 18, 22, 38, '#000000'); p.ell(17, 24, 4, 3, Bl); p.ell(27, 24, 4, 3, Bl); p.set(16, 23, Sh); p.set(26, 23, Sh);
    for (const y of [25, 30, 35]) { p.line(9, y, 3, y + 3, Bk); p.line(35, y, 40, y + 3, Bk); }
    p.ell(14, 16, 9, 7, Bk);
    chain(p, [[9, 11], [4, 6], [2, 0], [7, 2]], 2.2, Ho); chain(p, [[18, 9], [21, 3], [27, 0], [23, 3]], 2.2, Ho);
    p.tri(4, 5, 7, 5, 6, 8, Hd); p.tri(21, 4, 24, 4, 22, 7, Hd);
    p.rect(9, 14, 3, 3, Rd); p.set(9, 14, WHITE); p.rect(16, 14, 3, 3, Rd); p.set(16, 14, WHITE);
    p.line(8, 12, 12, 13, '#000000'); p.line(19, 12, 15, 13, '#000000');
    p.rect(11, 20, 7, 1, Sh);
  },
  // ── 꼬마두껍 (연잎 위 꼬마 두꺼비, 독) ─────────────────────────
  dukeop(p) {
    const G = '#7aa84a', Gd = '#4a7a2a', Wt = '#e8f0c8', Pu = '#9a5ad8', Lf = '#3aa85a';
    p.ell(20, 34, 16, 4, Lf); p.ell(20, 34, 12, 2.5, '#5ac87a');
    p.ell(20, 26, 12, 9, G);
    p.ell(20, 30, 9, 4, Wt);
    for (const [x, y] of [[13, 21], [25, 20], [19, 19], [28, 25]] as const) p.ell(x, y, 1.6, 1.4, Pu);
    p.ell(13, 17, 4, 4, G); p.ell(27, 17, 4, 4, G);
    eye(p, 12, 16, 3); eye(p, 26, 16, 3);
    p.line(15, 25, 25, 25, Gd);
    p.rect(8, 31, 5, 3, G); p.rect(28, 31, 5, 3, G);
  },
  // ── 독두꺼비 (보랏빛 거품 두꺼비, 독) ───────────────────────────
  dokdukeop(p) {
    const G = '#5a8a3a', Gd = '#3a5a22', Pu = '#8a3ac8', Pl = '#c88aff', Wt = '#d8e8a8', Bb = '#e0c8ff';
    p.ell(20, 25, 14, 11, G);
    p.ell(20, 30, 10, 5, Wt);
    for (const [x, y] of [[11, 20], [27, 19], [19, 17], [30, 25], [9, 26]] as const) { p.ell(x, y, 2.2, 2, Pu); p.set(x, y - 1, Pl); }
    p.ell(12, 15, 5, 4.5, G); p.ell(28, 15, 5, 4.5, G);
    p.rect(10, 13, 4, 4, '#ffd040'); p.rect(11, 14, 2, 3, K); p.rect(26, 13, 4, 4, '#ffd040'); p.rect(27, 14, 2, 3, K);
    p.line(12, 24, 28, 24, Gd); p.line(12, 24, 10, 22, Gd); p.line(28, 24, 30, 22, Gd);
    p.ell(33, 9, 3, 3, Bb); p.ell(37, 5, 2, 2, Bb); p.ell(6, 8, 2.5, 2.5, Bb);
    p.rect(6, 32, 7, 4, G); p.rect(27, 32, 7, 4, G);
  },
  // ── 두꺼비왕 (늪의 왕 두꺼비, 독+땅) ────────────────────────────
  dukeopwang(p) {
    const G = '#4a6a2a', Gd = '#2a4218', Br = '#8a6a3a', Pu = '#7a2ab8', Pl = '#b87aff', Wt = '#c8c890', Cr = '#ffd040';
    p.ell(20, 26, 18, 12, G);
    p.ell(20, 31, 13, 6, Wt);
    for (const [x, y] of [[8, 21], [32, 20], [20, 17], [14, 18], [27, 17], [36, 27], [4, 27]] as const) { p.ell(x, y, 2.6, 2.3, Pu); p.set(x, y - 1, Pl); }
    p.ell(11, 14, 6, 5, G); p.ell(29, 14, 6, 5, G);
    p.rect(8, 12, 5, 4, '#ff6a2a'); p.rect(9, 13, 3, 3, K); p.rect(27, 12, 5, 4, '#ff6a2a'); p.rect(28, 13, 3, 3, K);
    p.rect(14, 4, 12, 4, Cr); p.tri(14, 4, 16, 4, 15, 1, Cr); p.tri(19, 4, 21, 4, 20, 0, Cr); p.tri(24, 4, 26, 4, 25, 1, Cr);
    p.line(10, 24, 30, 24, Gd); p.line(10, 24, 7, 21, Gd); p.line(30, 24, 33, 21, Gd);
    p.rect(2, 33, 10, 5, Br); p.rect(28, 33, 10, 5, Br);
  },
  // ── 꼬마거미 (이슬 거미줄의 꼬마 거미, 벌레) ─────────────────────
  geomi(p) {
    const B = '#5a4a6a', Bl = '#8a7a9a', Wb = '#e8e8f4', Dw = '#a8d8ff';
    p.line(2, 2, 38, 2, Wb); p.line(2, 2, 20, 18, Wb); p.line(38, 2, 20, 18, Wb); p.line(20, 2, 20, 18, Wb);
    p.set(10, 2, Dw); p.set(30, 2, Dw); p.set(14, 8, Dw);
    for (const [y, d] of [[22, -1], [25, 0], [28, 1]] as const) { p.line(12, y, 4, y + d * 3 - 2, B); p.line(28, y, 36, y + d * 3 - 2, B); }
    p.ell(20, 29, 8, 7, B); p.ell(20, 29, 5, 4, Bl);
    p.ell(20, 21, 7, 6, B);
    eye(p, 16, 19, 3); eye(p, 22, 19, 3);
    p.set(18, 24, '#ff9aa8'); p.set(22, 24, '#ff9aa8');
    p.line(20, 15, 20, 18, Wb);
  },
  // ── 그물거미 (웃는 얼굴 무늬의 그물거미, 벌레+악) ─────────────────
  geumul(p) {
    const B = '#2a2238', Bl = '#4a3a5a', Y = '#ffd040', R = '#e84a4a', Wb = '#d8d8e8';
    for (let i = 0; i < 5; i++) p.line(20, 20, 2 + i * 9, 0, Wb);
    p.line(8, 6, 32, 6, Wb); p.line(12, 12, 28, 12, Wb);
    for (const [y, d] of [[22, -2], [26, 0], [30, 2]] as const) { p.line(13, y, 3, y + d * 2 - 3, B); p.line(27, y, 37, y + d * 2 - 3, B); }
    p.ell(20, 30, 10, 8, B);
    p.ell(16, 29, 2, 2, Y); p.ell(24, 29, 2, 2, Y); p.line(15, 33, 25, 33, Y); p.set(14, 32, Y); p.set(26, 32, Y);
    p.ell(20, 20, 7, 6, Bl);
    for (const [x, y] of [[16, 18], [19, 17], [22, 17], [25, 18]] as const) p.rect(x, y, 2, 2, R);
    p.tri(17, 23, 19, 23, 18, 26, WHITE); p.tri(21, 23, 23, 23, 22, 26, WHITE);
  },
  // ── 왕거미 (붉은 여덟 눈의 왕거미, 벌레+악) ───────────────────────
  wanggeomi(p) {
    const B = '#1a1424', Bl = '#3a2a48', R = '#ff3a4a', Rd = '#a81a2a', Gd = '#ffd040', Wb = '#c8c8d8';
    for (const [y, d] of [[20, -4], [24, -1], [28, 1], [32, 4]] as const) { p.line(12, y, 1, y + d * 2 - 2, B); p.line(1, y + d * 2 - 2, 0, y + d * 2 + 3, B); p.line(28, y, 39, y + d * 2 - 2, B); p.line(39, y + d * 2 - 2, 40, y + d * 2 + 3, B); }
    p.ell(20, 29, 12, 9, B);
    p.tri(14, 26, 26, 26, 20, 36, Rd); p.tri(16, 27, 24, 27, 20, 33, R);
    p.ell(20, 17, 9, 7, Bl);
    for (const [x, y] of [[14, 15], [17, 13], [23, 13], [26, 15], [15, 18], [18, 17], [22, 17], [25, 18]] as const) p.rect(x, y, 2, 2, R);
    p.tri(15, 21, 18, 21, 16, 26, Gd); p.tri(22, 21, 25, 21, 24, 26, Gd);
    p.line(20, 1, 20, 10, Wb); p.line(18, 3, 22, 3, Wb);
  },
  // ── 땅콩두지 (땅콩 머리 두더지, 땅) ─────────────────────────────
  dujji(p) {
    const Pn = '#d8b070', Pd = '#a8783a', Br = '#6a4a3a', Pk = '#ff9aa8', Dt = '#8a6a4a';
    p.ell(20, 36, 16, 3, Dt);
    p.ell(20, 28, 11, 9, Br);
    p.ell(20, 16, 9, 10, Pn);
    for (const y of [10, 15, 20]) { p.set(15, y, Pd); p.set(20, y - 2, Pd); p.set(25, y, Pd); }
    p.line(11, 16, 29, 16, Pd);
    p.line(16, 21, 17, 22, K); p.line(23, 21, 24, 22, K);
    p.ell(20, 25, 3, 2, Pk);
    p.rect(8, 30, 6, 3, '#f4d0b0'); p.rect(26, 30, 6, 3, '#f4d0b0');
    for (const x of [8, 10, 12, 26, 28, 30]) p.set(x, 33, '#e8e0d0');
  },
  // ── 굴착두지 (강철 드릴 두더지, 땅+강철) ─────────────────────────
  gulchak(p) {
    const St = '#9aa2b4', Sd = '#5a6278', Sl = '#d8dce8', Br = '#5a3a2a', Bd = '#3a2418', Pk = '#ff8a98', Dt = '#8a6a4a';
    p.ell(20, 37, 18, 2.5, Dt);
    p.ell(22, 26, 13, 10, Br);
    p.ell(14, 18, 9, 8, Br);
    p.tri(6, 14, 6, 24, -2, 19, St); p.line(4, 15, 4, 23, Sd); p.line(1, 17, 1, 21, Sd); p.set(-1, 19, Sl);
    p.set(11, 15, K); p.set(12, 15, K); p.set(16, 14, K); p.set(17, 14, K);
    p.ell(9, 22, 2, 1.5, Pk);
    p.rect(26, 15, 12, 6, St); p.rect(26, 15, 12, 2, Sl); p.set(36, 16, '#ff4040');
    for (const [x, y] of [[8, 30], [28, 32]] as const) { p.rect(x, y, 8, 5, St); p.rect(x, y, 8, 1, Sl); for (const k of [0, 3, 6]) p.tri(x + k, y + 5, x + k + 2, y + 5, x + k + 1, y + 8, Sl); }
    p.rect(14, 24, 16, 2, Bd);
  },
  // ── 고대조개 (껍질화석에서 되살아난 고대 갑각류, 바위+벌레) ─────────
  jogae(p) {
    const S = '#a88a5a', Sd = '#6a5232', Sl = '#d8c098', Lg = '#8a3a2a', Ey = '#ffe040';
    for (const x of [9, 14, 26, 31]) { p.line(x, 28, x - 2, 35, Lg); p.line(x - 2, 35, x - 3, 37, Lg); }
    p.ell(20, 24, 16, 11, S);
    p.ell(20, 22, 13, 8, Sl);
    for (const x of [12, 17, 22, 27]) p.line(x, 14, x + 1, 31, Sd);
    p.line(5, 26, 35, 26, Sd);
    p.rect(13, 27, 4, 3, K); p.set(14, 28, Ey); p.rect(23, 27, 4, 3, K); p.set(24, 28, Ey);
    p.ell(20, 14, 5, 3, '#c8a878');
  },
  // ── 고대투구 (낫 앞발의 고대 사냥꾼, 바위+벌레) ───────────────────
  godaetugu(p) {
    const S = '#8a6a3a', Sd = '#4a3a20', Sl = '#c8a878', Bl = '#e0d0a8', R = '#e84a3a', Lg = '#5a3a20';
    p.rect(16, 30, 3, 8, Lg); p.rect(23, 30, 3, 8, Lg); p.rect(14, 37, 6, 1, Sd); p.rect(22, 37, 6, 1, Sd);
    p.ell(21, 24, 9, 9, S); p.ell(21, 26, 6, 6, Sl);
    for (const y of [20, 24, 28]) p.line(15, y, 27, y, Sd);
    p.ell(20, 12, 11, 8, S);
    p.tri(9, 12, 31, 12, 20, 0, S); p.tri(12, 10, 28, 10, 20, 2, Sl);
    p.rect(13, 13, 14, 3, Sd); p.rect(14, 14, 3, 2, R); p.rect(23, 14, 3, 2, R);
    chain(p, [[11, 22], [5, 18], [2, 10]], 1.8, Bl); p.tri(0, 4, 4, 10, 1, 12, Bl);
    chain(p, [[30, 22], [36, 18], [38, 10]], 1.8, Bl); p.tri(40, 4, 36, 10, 39, 12, Bl);
  },
  // ── 꼬마시조 (날개화석의 꼬마 고대새, 바위+비행) ───────────────────
  kkomasijo(p) {
    const B = '#7a8aa0', Bd = '#4a5a70', Fe = '#e8a040', Fl = '#ffd080', Ft = '#c86a20', Bk = '#e8e0c8';
    p.rect(16, 30, 2, 7, Ft); p.rect(22, 30, 2, 7, Ft);
    chain(p, [[26, 26], [32, 30], [37, 28]], 2, B);
    p.tri(34, 26, 40, 24, 39, 31, Fe);
    p.ell(20, 24, 8, 8, B); p.ell(19, 27, 5, 4, '#a8b8c8');
    p.tri(24, 20, 33, 18, 28, 28, Fe); p.tri(25, 21, 31, 20, 27, 26, Fl);
    p.ell(14, 14, 7, 6, B);
    p.tri(8, 14, 2, 15, 8, 18, Bk); p.set(5, 16, Bd); p.tri(3, 15, 5, 15, 4, 17, WHITE);
    eye(p, 12, 12, 3);
    p.tri(14, 8, 18, 8, 15, 3, Fe); p.tri(17, 9, 20, 10, 21, 5, Fl);
  },
  // ── 시조새 (바위 날개의 고대새, 바위+비행) ───────────────────────
  sijosae(p) {
    const B = '#5a6a80', Bd = '#2a3a50', Fe = '#e8822a', Fl = '#ffc060', St = '#9aa0a8', Bk = '#e8e0c8', R = '#e83a3a';
    p.tri(14, 20, 0, 4, 6, 26, St); p.tri(12, 22, 2, 10, 8, 26, Fe);
    p.tri(26, 18, 40, 0, 36, 22, St); p.tri(27, 20, 38, 6, 34, 22, Fe); p.tri(30, 18, 39, 2, 37, 10, Fl);
    chain(p, [[24, 30], [30, 34], [36, 36]], 2.2, B); p.tri(34, 33, 40, 34, 37, 40, Fe);
    p.rect(16, 32, 2, 6, Bd); p.rect(22, 32, 2, 6, Bd);
    p.ell(20, 26, 8, 8, B); p.ell(20, 28, 5, 5, '#8a9ab0');
    p.ell(15, 14, 7, 6, B);
    p.tri(9, 13, 0, 15, 9, 18, Bk); for (const x of [3, 5, 7]) p.tri(x, 15, x + 1, 15, x + 0.5, 17, WHITE);
    p.rect(12, 11, 3, 3, K); p.set(12, 11, R);
    p.tri(15, 9, 20, 9, 17, 2, Fe); p.tri(18, 10, 22, 11, 24, 4, Fl);
  },
  // ── 깍깍이 (반짝이를 좋아하는 꼬마 까마귀, 악+비행) ─────────────────
  kkakkak(p) {
    const B = '#2a2a3a', Bl = '#4a4a6a', Bk = '#ffb020', Gl = '#ffe060';
    p.rect(17, 31, 2, 6, Bk); p.rect(22, 31, 2, 6, Bk);
    p.tri(24, 26, 36, 32, 28, 34, B);
    p.ell(21, 24, 9, 9, B); p.ell(21, 27, 5, 5, Bl);
    p.tri(24, 18, 34, 22, 26, 30, Bl);
    p.ell(15, 14, 7, 7, B);
    p.tri(8, 13, 2, 15, 8, 17, Bk);
    eye(p, 12, 12, 3);
    p.ell(5, 21, 2, 2, Gl); p.set(5, 20, WHITE); p.line(5, 18, 6, 16, Bk);
    p.tri(14, 8, 18, 8, 13, 3, B);
  },
  // ── 까마귀왕 (별빛 깃털의 까마귀 왕, 악+비행) ─────────────────────
  kkamagwi(p) {
    const B = '#1a1a2a', Bl = '#3a3a5a', Pu = '#6a4aa8', Bk = '#ffb020', Gl = '#fff0a0', R = '#e83a5a';
    p.tri(12, 18, 0, 2, 4, 26, B); p.tri(11, 20, 2, 8, 6, 26, Pu);
    p.tri(28, 16, 40, 0, 38, 24, B); p.tri(28, 18, 38, 6, 36, 22, Pu);
    for (const [x, y] of [[3, 6], [39, 4], [2, 14], [38, 14]] as const) p.set(x, y, Gl);
    p.tri(22, 30, 36, 40, 26, 40, B);
    p.rect(16, 32, 2, 6, Bk); p.rect(22, 32, 2, 6, Bk);
    p.ell(20, 25, 9, 9, B); p.ell(20, 28, 5, 5, Bl);
    p.ell(16, 13, 7, 7, B);
    p.tri(9, 12, 1, 14, 9, 17, Bk);
    p.rect(13, 10, 3, 3, R); p.set(13, 10, WHITE);
    p.line(11, 8, 16, 9, Bl);
    p.tri(14, 7, 17, 7, 13, 0, B); p.tri(17, 7, 20, 7, 21, 1, Bl);
    p.ell(20, 19, 4, 2, Pu);
  },
  // ── 숯돌이 (해변 모닥불의 숯 덩어리, 바위) ───────────────────────
  sutdol(p) {
    const C = '#2a2a30', Cl = '#4a4a54', Em = '#ff6a2a', Ey = '#ffd040', Sa = '#e8d4a0';
    p.ell(20, 37, 14, 2.5, Sa);
    p.ell(20, 26, 12, 11, C);
    for (const [x, y] of [[14, 20], [25, 22], [18, 30], [27, 29]] as const) p.ell(x, y, 2.5, 1.5, Cl);
    for (const [x, y] of [[11, 27], [29, 24], [22, 33]] as const) { p.set(x, y, Em); p.set(x + 1, y, Ey); }
    p.rect(14, 22, 3, 3, Ey); p.rect(23, 22, 3, 3, Ey); p.set(15, 23, K); p.set(24, 23, K);
    p.line(17, 28, 22, 28, Em);
    p.tri(18, 14, 22, 14, 21, 9, Em); p.set(20, 11, Ey);
  },
  // ── 화롯돌 (숯불을 품은 화로, 불+바위) ──────────────────────────
  hwarotdol(p) {
    const St = '#8a7a6a', Sd = '#5a4a3a', Sl = '#b8a890', F = '#ff6a2a', Fy = '#ffd040', C = '#2a2a30';
    p.rect(10, 34, 4, 4, Sd); p.rect(26, 34, 4, 4, Sd);
    p.ell(20, 26, 14, 10, St); p.ell(20, 26, 14, 10, St);
    p.rect(6, 16, 28, 6, Sl); p.rect(6, 16, 28, 1, '#d8c8b0');
    p.ell(20, 16, 12, 3, C);
    p.tri(10, 16, 16, 16, 12, 4, F); p.tri(16, 16, 24, 16, 20, 1, F); p.tri(24, 16, 30, 16, 28, 5, F);
    p.tri(13, 16, 15, 16, 14, 9, Fy); p.tri(18, 16, 22, 16, 20, 6, Fy); p.tri(25, 16, 27, 16, 27, 10, Fy);
    p.rect(13, 25, 4, 3, F); p.rect(23, 25, 4, 3, F); p.set(14, 26, K); p.set(24, 26, K);
    p.line(16, 31, 24, 31, Sd);
    p.rect(2, 22, 5, 4, St); p.rect(33, 22, 5, 4, St);
  },
  // ── 가마솥대장 (무쇠 가마솥의 대장, 불+바위) ───────────────────────
  gamasot(p) {
    const I = '#3a3a44', Il = '#5a5a68', Ih = '#8a8a98', F = '#ff6a2a', Fy = '#ffd040', Sm = '#e8e8f0', R = '#ff3a2a';
    p.rect(8, 33, 5, 5, I); p.rect(27, 33, 5, 5, I);
    p.ell(20, 26, 17, 11, I);
    p.rect(2, 22, 36, 4, Il); p.rect(2, 22, 36, 1, Ih);
    p.ell(20, 14, 14, 5, Il); p.ell(20, 12, 4, 2, Ih); p.rect(18, 7, 4, 4, I);
    p.ell(9, 6, 3, 3, Sm); p.ell(5, 3, 2, 2, Sm); p.ell(31, 6, 3, 3, Sm); p.ell(35, 2, 2, 2, Sm);
    p.rect(11, 27, 5, 4, R); p.rect(24, 27, 5, 4, R); p.rect(12, 28, 2, 2, Fy); p.rect(25, 28, 2, 2, Fy);
    p.line(10, 25, 16, 26, Ih); p.line(30, 25, 24, 26, Ih);
    p.tri(14, 33, 26, 33, 20, 38, F); p.tri(17, 33, 23, 33, 20, 36, Fy);
  },
  // ── 초롱이 (종이 초롱, 불) ────────────────────────────────
  chorong(p) {
    const R = '#e8402a', Rd = '#a82418', G = '#ffb84a', Gl = '#fff0a0', Cap = '#3a2a20', T = '#ffd040';
    p.line(20, 4, 20, 9, Cap); p.ell(20, 3.5, 3, 2, Cap); p.ell(20, 3.5, 1.5, 1, '#6a4a30');
    p.rect(13, 9, 14, 3, Cap);
    p.ell(20, 22, 11, 11, R);
    p.ell(20, 22, 7.5, 9, G);
    p.ell(20, 21, 4, 5, Gl);
    for (const y of [15, 22, 29]) p.rect(10, y, 21, 1, Rd);
    p.rect(14, 32, 12, 3, Cap);
    p.rect(19, 35, 2, 3, T); p.rect(18, 37, 4, 2, T);
    eye(p, 15, 19, 3); eye(p, 23, 19, 3);
    p.set(19, 25, K); p.set(20, 26, K); p.set(21, 25, K);
    p.set(13, 23, '#ff8a7a'); p.set(27, 23, '#ff8a7a');
    p.tri(29, 14, 34, 9, 31, 17, '#ff8a3a');
  },
  // ── 청사초롱 (푸른·붉은 비단 초롱, 불+고스트) ───────────────────
  cheongsa(p) {
    const B = '#2a5ac8', Bd = '#1a3a88', R = '#d8323a', Gl = '#8ad8ff', Cap = '#2a2030', Ws = '#9ab8ff';
    chain(p, [[20, 33], [24, 36], [29, 37], [33, 35]], 2, Ws);
    p.ell(34, 34, 2, 2, '#cfe0ff');
    p.line(20, 1, 20, 6, Cap); p.rect(12, 6, 16, 3, Cap);
    p.ell(20, 19, 11, 11, B);
    paint(p, 8, 19, 26, 12, R);
    p.ell(20, 19, 7, 8, Gl);
    p.ell(20, 18, 3.5, 4.5, '#ffffff');
    p.rect(9, 18, 22, 1, Bd);
    p.rect(13, 29, 14, 3, Cap);
    p.rect(17, 32, 6, 2, '#ffd040');
    p.rect(14, 15, 3, 4, K); p.set(14, 15, Gl); p.rect(23, 15, 3, 4, K); p.set(23, 15, Gl);
    p.line(17, 23, 23, 23, K); p.set(18, 24, K); p.set(22, 24, K);
    p.tri(6, 14, 1, 10, 7, 20, Ws); p.tri(34, 14, 39, 10, 33, 20, Ws);
  },
  // ── 도깨비초롱 (뿔 달린 큰 초롱, 불+고스트) ────────────────────
  dokkaechorong(p) {
    const R = '#c8282a', Rd = '#8a1418', O = '#ff7a2a', Bf = '#5ab8ff', Bl = '#d8f4ff', Cap = '#2a1a1a', Hn = '#f4e8c8';
    p.ell(8, 30, 4, 5, Bf); p.ell(32, 30, 4, 5, Bf); p.ell(8, 30, 2, 3, Bl); p.ell(32, 30, 2, 3, Bl);
    p.tri(11, 9, 15, 9, 9, 1, Hn); p.tri(25, 9, 29, 9, 31, 1, Hn);
    p.rect(9, 8, 22, 4, Cap);
    p.ell(20, 23, 14, 13, R);
    p.ell(20, 23, 10, 10, O);
    for (const y of [16, 23, 30]) p.rect(6, y, 29, 1, Rd);
    p.rect(11, 35, 18, 3, Cap);
    p.rect(12, 17, 5, 4, '#ffe040'); p.set(13, 18, K); p.set(14, 18, K);
    p.rect(23, 17, 5, 4, '#ffe040'); p.set(25, 18, K); p.set(26, 18, K);
    p.line(11, 16, 16, 17, K); p.line(29, 16, 24, 17, K);
    p.rect(13, 25, 14, 4, K);
    for (const x of [14, 17, 20, 23, 25]) p.tri(x, 25, x + 2, 25, x + 1, 27, WHITE);
    p.tri(4, 22, 1, 16, 7, 18, Bf); p.tri(36, 22, 39, 16, 33, 18, Bf);
  },
  // ── 물귀신 (젖은 머리 물의 혼, 물+고스트) ───────────────────────
  mulgwi(p) {
    const W = '#c8e8f4', Wd = '#8ac0d8', Hr = '#1a2a3a', Hl = '#2a4a5a', Dr = '#5ab8e8';
    chain(p, [[20, 28], [17, 33], [21, 36], [26, 38]], 3, W);
    p.ell(20, 22, 10, 11, W);
    p.ell(20, 27, 8, 4, Wd);
    p.ell(20, 13, 10, 8, Hr);
    p.rect(10, 13, 4, 16, Hr); p.rect(26, 13, 4, 16, Hr);
    p.rect(11, 14, 1, 12, Hl); p.rect(28, 14, 1, 12, Hl);
    p.ell(20, 19, 6, 5, W);
    p.ell(17, 18, 1.8, 2.4, '#2a3a5a'); p.ell(23, 18, 1.8, 2.4, '#2a3a5a');
    p.set(17, 17, WHITE); p.set(23, 17, WHITE);
    p.line(18, 23, 22, 23, '#5a7a8a');
    for (const [x, y] of [[9, 30], [31, 31], [13, 33], [28, 35]] as const) { p.set(x, y, Dr); p.set(x, y + 1, Dr); }
    p.ell(6, 22, 2.5, 3.5, W); p.ell(34, 22, 2.5, 3.5, W);
  },
  // ── 유령선장 (선장 모자의 바다 혼, 물+고스트) ───────────────────
  yuseon(p) {
    const W = '#b8dcf0', Wd = '#7aa8c8', Ct = '#2a3a6a', Ctl = '#3a5a9a', Gd = '#ffd040', Ht = '#1a1a2a';
    chain(p, [[20, 30], [16, 35], [22, 38], [30, 37]], 3.5, W);
    p.ell(20, 25, 11, 9, Ct);
    p.rect(19, 18, 2, 14, Gd);
    for (const y of [21, 25, 29]) { p.set(16, y, Gd); p.set(24, y, Gd); }
    p.ell(20, 14, 8, 7, W);
    p.ell(20, 16, 6, 3, Wd);
    p.tri(8, 9, 32, 9, 20, 1, Ht); p.rect(9, 8, 22, 3, Ht); p.ell(20, 6, 3, 2, Gd);
    p.rect(15, 12, 3, 3, '#1a2a4a'); p.set(15, 12, '#8ad8ff'); p.rect(22, 12, 3, 3, '#1a2a4a'); p.set(22, 12, '#8ad8ff');
    p.line(14, 18, 26, 18, WHITE); p.line(15, 19, 25, 19, '#e8f4ff');
    p.ell(7, 25, 3, 5, Ctl); p.ell(33, 25, 3, 5, Ctl);
    // anchor
    p.line(36, 20, 36, 32, '#8a9ab0'); p.line(33, 22, 39, 22, '#8a9ab0'); p.line(32, 30, 36, 33, '#8a9ab0'); p.line(40, 30, 36, 33, '#8a9ab0');
  },
  // ── 해골앵무 (해골 얼굴 앵무새, 고스트+비행) ─────────────────────
  haegol(p) {
    const P = '#7a4ab8', Pd = '#4a2a78', Sk = '#f4f0e4', Sd = '#c8c0a8', Bk = '#ffb020', G = '#5ae0a0';
    p.rect(20, 32, 2, 5, Bk); p.rect(24, 32, 2, 5, Bk); p.rect(17, 37, 12, 1, '#6a4a30');
    p.tri(26, 26, 36, 36, 30, 38, Pd); p.tri(24, 27, 33, 38, 26, 38, P);
    p.ell(22, 25, 8, 9, P);
    p.ell(23, 27, 5, 5, '#9a6ad8');
    p.tri(26, 20, 37, 26, 28, 30, Pd);
    for (const y of [23, 26, 29]) p.line(28, y, 34, y + 2, Sd);
    p.ell(16, 13, 7, 7, Sk);
    p.ell(16, 15, 6, 4, Sd);
    p.ell(14, 12, 2, 2.2, K); p.set(14, 12, G);
    p.tri(8, 12, 3, 16, 9, 17, Bk); p.tri(8, 15, 4, 17, 9, 18, '#c88010');
    p.set(13, 17, K); p.set(15, 17, K); p.set(17, 17, K);
    p.tri(15, 6, 18, 6, 17, 1, '#e8402a'); p.tri(18, 7, 21, 7, 22, 2, '#3a9ae8');
  },
  // ── 유령앵무 (안개 깃털의 유령 앵무, 고스트+비행) ─────────────────
  yuaeng(p) {
    const P = '#5a3a9a', Pl = '#9a7ae0', Mi = '#c8b8f8', Sk = '#f0ecf8', G = '#5ae8c8', Bk = '#ffb020';
    p.tri(6, 24, 1, 6, 16, 18, Pl); p.tri(8, 24, 4, 12, 15, 21, Mi);
    p.tri(30, 22, 40, 4, 26, 16, Pl); p.tri(29, 23, 38, 10, 26, 19, Mi);
    chain(p, [[20, 30], [24, 35], [30, 38]], 2.5, P);
    p.tri(26, 34, 38, 39, 30, 40, Mi);
    p.ell(20, 23, 8, 10, P);
    p.ell(20, 26, 5, 6, Pl);
    p.ell(19, 11, 7, 6.5, Sk);
    p.ell(19, 13, 5, 3.5, '#d8d0e8');
    p.ell(16, 10, 2, 2.5, K); p.ell(22, 10, 2, 2.5, K); p.set(16, 10, G); p.set(22, 10, G);
    p.tri(17, 14, 22, 14, 19, 19, Bk);
    p.tri(14, 5, 17, 5, 13, 0, Pl); p.tri(19, 5, 22, 5, 21, 0, Mi); p.tri(23, 6, 26, 7, 28, 1, Pl);
  },
  // ── 보물상자도깨비 (보물상자 도깨비, 고스트) ─────────────────────
  bomulgoe(p) {
    const Wd = '#8a5630', Wl = '#b8804a', Ir = '#d8a840', Ird = '#a87820', M = '#4a1a2a', Tg = '#e8507a', Co = '#ffe060';
    p.rect(6, 22, 28, 15, Wd);
    p.rect(6, 22, 28, 2, Ir); p.rect(6, 35, 28, 2, Ir); p.rect(6, 22, 2, 15, Ir); p.rect(32, 22, 2, 15, Ir);
    for (const y of [27, 31]) p.rect(8, y, 24, 1, Wl);
    p.rect(17, 26, 6, 5, Ird); p.rect(19, 28, 2, 2, K);
    p.rect(6, 12, 28, 9, M);
    p.tri(6, 21, 34, 21, 20, 30, M);
    for (const x of [8, 12, 16, 20, 24, 28]) p.tri(x, 21, x + 3, 21, x + 1.5, 24, WHITE);
    for (const x of [9, 13, 17, 21, 25, 29]) p.tri(x, 14, x + 3, 14, x + 1.5, 11, WHITE);
    p.ell(20, 17, 6, 2.5, Tg);
    p.rect(5, 3, 30, 9, Wd);
    p.rect(5, 3, 30, 2, Ir); p.rect(5, 10, 30, 2, Ir);
    p.rect(12, 5, 4, 4, '#ffe040'); p.set(13, 6, K); p.set(14, 6, K);
    p.rect(24, 5, 4, 4, '#ffe040'); p.set(25, 6, K); p.set(26, 6, K);
    p.ell(37, 36, 2, 1.5, Co); p.ell(3, 37, 2, 1.5, Co); p.ell(36, 33, 1.5, 1, Co);
  },

  // ── 전설: 설화 (눈꽃 사슴, 얼음+페어리) ─────────────────────
  seolhwa(p) {
    const W = '#f4fbff', S = '#c8e0f4', Ic = '#8ad8ff', Ib = '#4aa8e8', Pk = '#ffb0d8', Pd = '#e878b0';
    p.ell(20, 38, 14, 2, '#d8f0ff');
    p.rect(13, 27, 3, 11, S); p.rect(27, 27, 3, 11, S);
    p.ell(22, 24, 11, 6.5, W);
    p.ell(22, 28, 8, 2.5, S);
    p.rect(9, 27, 3, 11, W); p.rect(23, 27, 3, 11, W);
    p.rect(9, 36, 3, 2, Ib); p.rect(23, 36, 3, 2, Ib); p.rect(13, 36, 3, 2, Ib); p.rect(27, 36, 3, 2, Ib);
    p.ell(33, 20, 2.5, 3.5, W); p.set(34, 17, Pk);
    chain(p, [[13, 20], [10, 13]], 3, W);
    p.ell(8, 11, 5, 4.5, W);
    p.ell(3.5, 13, 3, 2.2, W);
    // crystal antlers with snow blossoms
    p.line(9, 7, 7, 1, Ic); p.line(8, 4, 4, 2, Ic); p.line(11, 7, 14, 1, Ic); p.line(13, 3, 17, 2, Ic); p.line(6, 2, 5, 0, Ib); p.line(15, 1, 17, 0, Ib);
    for (const [x, y] of [[4, 2], [17, 2], [14, 1]] as const) { p.set(x, y, Pk); p.set(x - 1, y, Pd); p.set(x + 1, y, Pd); p.set(x, y + 1, Pd); }
    p.ell(11, 9, 1.8, 1.2, Pk);
    // snowflake marks on the body
    for (const [x, y] of [[18, 21], [25, 20], [28, 24]] as const) { p.set(x, y, Ic); p.set(x - 1, y, S); p.set(x + 1, y, S); p.set(x, y - 1, S); p.set(x, y + 1, S); }
    eye(p, 6, 10, 2);
    p.set(1, 13, K);
  },

  // ── 전설: 철산 (무쇠 매머드, 땅+강철) ────────────────────────
  cheolsan(p) {
    const St = '#9aa2b4', Sd = '#6a7286', Sl = '#c8d0e0', Br = '#8a5a34', Bd = '#5e3a20', Tk = '#fff4dc';
    p.rect(9, 28, 6, 10, Sd); p.rect(27, 28, 6, 10, Sd);
    p.ell(23, 21, 15, 11, Br);
    p.ell(24, 17, 13, 7, St);
    for (const x of [16, 22, 28, 33]) p.rect(x, 12, 3, 4, Sl);
    p.rect(13, 28, 6, 10, St); p.rect(31, 28, 6, 10, St);
    p.rect(13, 36, 6, 2, Sl); p.rect(31, 36, 6, 2, Sl);
    p.ell(11, 16, 8, 8, Br);
    p.ell(12, 14, 6, 5, St);
    p.ell(16, 18, 4.5, 6, Bd);
    // trunk and tusks
    chain(p, [[6, 19], [4, 25], [5, 31], [8, 33]], 2.2, Br);
    p.line(8, 22, 2, 28, Tk); p.line(9, 23, 3, 29, Tk); p.line(2, 28, 1, 25, Tk);
    p.set(8, 34, Bd);
    eye(p, 8, 13, 2);
    p.line(6, 11, 10, 12, Sd);
  },

  // ── 전설: 주작 (붉은 불새, 불+비행) ──────────────────────────
  jujak(p) {
    const R = '#e8402a', Rd = '#a82418', O = '#ff8a2a', Y = '#ffd84a', Fl = '#fff0a0';
    // flame tail
    chain(p, [[24, 26], [31, 31], [38, 30]], 2.6, R);
    chain(p, [[26, 27], [33, 35], [39, 37]], 2, O);
    p.tri(34, 26, 40, 22, 39, 31, Y); p.tri(36, 34, 40, 33, 38, 39, Y);
    // wings spread
    p.tri(18, 18, 38, 4, 30, 20, R); p.tri(20, 19, 36, 10, 32, 21, O); p.tri(26, 16, 39, 2, 34, 12, Y);
    p.tri(14, 20, 2, 8, 10, 22, Rd); p.tri(12, 21, 4, 13, 11, 23, R);
    // body and head
    p.ell(19, 23, 7, 8, R);
    p.ell(18, 26, 4.5, 5, O);
    chain(p, [[16, 17], [13, 11]], 2.6, R);
    p.ell(12, 9, 4.5, 4, R);
    p.tri(8, 9, 3, 11, 8, 11, Y);
    // flame crest
    p.tri(12, 6, 15, 6, 14, 0, Y); p.tri(10, 6, 12, 6, 9, 1, O); p.tri(14, 7, 17, 7, 18, 2, O);
    p.set(14, 2, Fl); p.set(9, 3, Fl);
    p.rect(17, 31, 2, 6, Y); p.rect(21, 31, 2, 6, Y); p.rect(16, 36, 4, 1, Y); p.rect(20, 36, 4, 1, Y);
    p.rect(10, 8, 2, 2, '#ffe060'); p.set(10, 8, K);
  },

  // ── 전설: 청룡 (푸른 번개 용, 전기+드래곤) ───────────────────
  cheongryong(p) {
    const B = '#2a7ae0', Bd = '#1a4aa0', Bl = '#8ad0ff', Y = '#ffe040', Yd = '#e8b020', Wh = '#e8f8ff';
    p.ell(20, 37.5, 16, 2, '#cfe0f8');
    chain(p, [[38, 10], [35, 20], [27, 26], [20, 32], [12, 30], [8, 22], [10, 14]], 3, B);
    chain(p, [[35, 21], [27, 27.5], [20, 33.5], [12, 31.5]], 1.2, Bl);
    // lightning mane and spikes
    for (const [x, y] of [[33, 15], [29, 21], [22, 27], [14, 25]] as const) { p.line(x, y, x + 3, y - 4, Y); p.line(x + 3, y - 4, x + 1, y - 4, Y); p.line(x + 1, y - 4, x + 4, y - 8, Yd); }
    p.tri(36, 6, 40, 4, 39, 12, Y);
    // claws
    p.ell(16, 34, 2.5, 1.5, Bd); p.ell(27, 30, 2.5, 1.5, Bd);
    // head
    p.ell(9, 11, 6, 5, B);
    p.ell(4, 13, 4, 2.8, B);
    p.ell(4.5, 14.8, 3, 1.1, Bl);
    p.tri(10, 7, 13, 7, 17, 1, Wh); p.tri(7, 7, 9, 7, 6, 1, Wh);
    p.ell(13, 9, 3, 4, Y);
    p.line(1, 12, -1, 17, Y); p.line(3, 15, 1, 20, Yd);
    p.rect(6, 9, 3, 2, Y); p.set(6, 9, K);
    p.set(1, 12, K);
  },

  // ── 전설: 천지 (하늘과 땅을 잇는 태초의 용, 드래곤+에스퍼) ─────────
  cheonji(p) {
    const W = '#fbf7ec', S = '#d8ccb0', Gd = '#ffd24a', Go = '#e8a020', M = '#8a5ad8', Ml = '#c0a0f8', Cl = '#cfe8ff';
    const Sun = '#ff8a3a', Moon = '#2a3470', Ey = '#ff4a5a';
    // clouds it rides on
    p.ell(14, 37, 10, 2.5, Cl); p.ell(28, 37.5, 9, 2.2, Cl);
    // coiled body: tail → loop → neck
    chain(p, [[38, 33], [37, 25], [31, 20], [24, 23], [20, 30], [13, 30], [10, 23], [11, 16]], 3.2, W);
    chain(p, [[37, 26], [31, 21.5], [24, 24.5], [20, 31.5], [13, 31.5], [10.5, 24]], 1.3, Gd);
    // tail flame (purple) and back fins
    p.tri(36, 34, 40, 38, 35, 39, M); p.tri(37, 32, 40, 30, 39, 36, Ml);
    for (const [x, y] of [[33, 17], [26, 19], [19, 26], [12, 26]] as const) p.tri(x - 2, y + 2, x + 2, y + 2, x, y - 3, M);
    // mane
    p.ell(14, 12, 5, 6, M); p.ell(15, 10, 3.5, 4, Ml);
    // head
    p.ell(9, 13, 6, 5, W);
    p.ell(4, 15.5, 4, 2.8, W);
    p.ell(4.5, 17, 3.2, 1.2, S);
    // golden horns
    p.tri(10, 9, 13, 9, 15, 1, Gd); p.tri(7, 9, 9, 9, 7, 3, Gd); p.set(15, 2, Go); p.set(7, 4, Go);
    // whiskers
    p.line(1, 15, -1, 19, Gd); p.line(3, 17, 2, 22, Gd);
    // glowing eye and nostril
    p.rect(7, 11, 3, 2, Ey); p.set(7, 11, WHITE);
    p.set(1, 14, K);
    // claws holding the orb of sun and moon
    p.ell(27, 9, 5.5, 5.5, Sun);
    for (let y = 4; y <= 14; y++) for (let x = 27; x <= 33; x++) if (p.get(x, y) === Sun) p.set(x, y, Moon);
    p.set(25, 7, '#ffe0a0'); p.set(29, 7, '#fff8c8'); p.set(30, 11, '#fff8c8');
    p.ell(22, 14, 2.2, 1.6, Gd); p.ell(32, 14, 2.2, 1.6, Gd);
    chain(p, [[13, 18], [20, 15]], 1.2, W);
  },
};
