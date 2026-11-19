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
};
