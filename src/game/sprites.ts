import { Pix } from '../engine/pix';
import type { Dir } from './common';

const OUT = '#26263a';
const EYE = '#1c1c28';

function eye(p: Pix, x: number, y: number, h = 3) {
  p.rect(x, y, 2, h, EYE);
  p.set(x, y, '#ffffff');
}

// ---------------------------------------------------------------------------
// Original monster designs (32x32)

const DRAW: Record<string, (p: Pix) => void> = {
  modak(p) {
    const B = '#f28a3a', D = '#c8601e', L = '#ffd8a0', R = '#e8402a', Y = '#ffd040';
    p.ell(26.5, 21, 3, 4.5, R); p.ell(26.5, 22.5, 1.5, 2.2, Y);
    p.ell(9.5, 12.5, 2.8, 2.8, B); p.ell(22.5, 12.5, 2.8, 2.8, B);
    p.ell(9.5, 12.5, 1.3, 1.3, D); p.ell(22.5, 12.5, 1.3, 1.3, D);
    p.ell(16, 9, 3.6, 4.2, R); p.ell(16, 5.5, 2, 2.6, R); p.ell(16, 10, 2, 2.4, Y);
    p.ell(16, 20, 9.5, 8.5, B);
    p.ell(16, 23.5, 5.5, 4.5, L);
    p.ell(7, 22, 2.2, 3, B); p.ell(25, 22, 2.2, 3, B);
    p.rect(10, 27, 4, 3, D); p.rect(18, 27, 4, 3, D);
    eye(p, 12, 16); eye(p, 18, 16);
    p.rect(15, 20, 2, 1, '#7a2a10');
    p.set(10, 19, '#ff9a7a'); p.set(21, 19, '#ff9a7a');
  },
  hwaro(p) {
    const B = '#e0702c', D = '#a84a18', L = '#ffd090', R = '#e8402a', Y = '#ffd040';
    p.ell(5.5, 9, 3, 5, R); p.ell(26.5, 9, 3, 5, R); p.ell(16, 4, 3.5, 4, R);
    p.ell(5.5, 10, 1.5, 2.5, Y); p.ell(26.5, 10, 1.5, 2.5, Y); p.ell(16, 5, 1.8, 2, Y);
    p.ell(9, 9, 3, 3, B); p.ell(23, 9, 3, 3, B);
    p.ell(16, 18.5, 12, 11, B);
    p.ell(16, 22, 7.5, 6.5, L);
    p.ell(4.5, 20, 3, 5, B); p.ell(27.5, 20, 3, 5, B);
    p.rect(3, 24, 3, 2, '#fff4e0'); p.rect(26, 24, 3, 2, '#fff4e0');
    p.rect(8, 28, 6, 3, D); p.rect(18, 28, 6, 3, D);
    eye(p, 11, 13); eye(p, 19, 13);
    p.rect(10, 12, 4, 1, D); p.rect(18, 12, 4, 1, D);
    p.rect(14, 17, 4, 1, '#7a2a10');
    p.ell(16, 22.5, 2, 2.6, R); p.ell(16, 23, 1, 1.4, Y);
  },
  pong(p) {
    const B = '#5aa8e8', D = '#3a78c0', L = '#e0f4ff', C = '#a8dcff';
    p.ell(16, 9.5, 2, 3, C); p.set(16, 6, C); p.set(15, 6, C);
    p.ell(26.5, 25.5, 4, 2.5, D);
    p.ell(16, 20, 10, 8.5, B);
    p.ell(16, 23, 6.5, 4.5, L);
    p.ell(6.5, 24.5, 3, 2, D); p.ell(25.5, 24.5, 3, 2, D);
    eye(p, 11, 16, 4); eye(p, 19, 16, 4);
    p.rect(15, 20, 2, 1, '#203050');
    p.set(9, 21, '#203050'); p.set(8, 20, '#203050'); p.set(22, 21, '#203050'); p.set(23, 20, '#203050');
    p.set(10, 19, '#ff9ab0'); p.set(21, 19, '#ff9ab0');
  },
  mulbora(p) {
    const B = '#4a96e0', D = '#2e68b0', L = '#e8f6ff', C = '#a8dcff';
    p.ell(9.5, 8, 4, 4, L); p.ell(16, 5.5, 4.5, 4, L); p.ell(22.5, 8, 4, 4, L);
    p.ell(9.5, 9, 2.5, 2.5, C); p.ell(16, 6.5, 3, 2.5, C); p.ell(22.5, 9, 2.5, 2.5, C);
    p.ell(27.5, 26, 4.5, 3, D); p.ell(29, 21.5, 2, 3, D);
    p.ell(16, 19, 12, 10, B);
    p.ell(16, 22.5, 7, 6, L);
    p.ell(4, 22, 3.5, 2.5, D); p.ell(28, 22, 3.5, 2.5, D);
    eye(p, 11, 14); eye(p, 19, 14);
    p.rect(10, 13, 3, 1, D); p.rect(19, 13, 3, 1, D);
    p.ell(16, 11, 1.5, 1.5, '#ffffff');
    p.rect(14, 18, 4, 1, '#203050');
  },
  saesun(p) {
    const B = '#78c858', D = '#4a9a3a', L = '#c8f0a0', F = '#3aa848';
    p.rect(16, 5, 1, 6, D);
    p.ell(13, 5.5, 3, 1.6, F); p.ell(20, 4.5, 3, 1.6, F);
    p.ell(7, 13.5, 3.5, 2, F); p.ell(25, 13.5, 3.5, 2, F);
    p.ell(16, 20, 9.5, 8.5, B);
    p.ell(16, 23.5, 5.5, 4.5, L);
    p.rect(10, 27, 4, 3, D); p.rect(18, 27, 4, 3, D);
    eye(p, 12, 16); eye(p, 18, 16);
    p.rect(15, 20, 2, 1, '#2a5020');
    p.set(10, 19, '#ffa8a0'); p.set(21, 19, '#ffa8a0');
    p.set(11, 24, D); p.set(21, 23, D);
  },
  kkot(p) {
    const B = '#5ab048', D = '#3a8030', L = '#c8f0a0', F = '#2e9a40', P = '#f088b8', Y = '#ffe060';
    p.ell(4.5, 17, 4, 2.5, F); p.ell(27.5, 17, 4, 2.5, F);
    p.ell(6.5, 10, 3.5, 2, F); p.ell(25.5, 10, 3.5, 2, F);
    p.ell(16, 19.5, 11.5, 10.5, B);
    p.ell(10, 12, 3.5, 3, D); p.ell(22, 12, 3.5, 3, D);
    p.ell(16, 23, 6.5, 5.5, L);
    p.ell(12.5, 5.5, 2.5, 2.5, P); p.ell(19.5, 5.5, 2.5, 2.5, P);
    p.ell(16, 2.8, 2.5, 2.5, P); p.ell(16, 8.2, 2.5, 2.5, P);
    p.ell(16, 5.5, 1.8, 1.8, Y);
    p.rect(8, 28, 6, 3, D); p.rect(18, 28, 6, 3, D);
    eye(p, 11, 15); eye(p, 19, 15);
    p.rect(14, 19, 4, 1, '#2a5020');
  },
  tosil(p) {
    const B = '#e0b078', D = '#b8844a', L = '#fff0d8', P = '#f8b8b0';
    p.ell(9, 10, 3, 3, B); p.ell(23, 10, 3, 3, B);
    p.ell(9, 10, 1.5, 1.5, P); p.ell(23, 10, 1.5, 1.5, P);
    p.ell(16, 19.5, 10, 9.5, B);
    p.ell(8.5, 21, 3.5, 3, L); p.ell(23.5, 21, 3.5, 3, L);
    p.ell(16, 24.5, 5, 4, L);
    eye(p, 12, 16); eye(p, 18, 16);
    p.rect(15, 19, 2, 1, '#6a3a2a');
    p.rect(15, 21, 2, 2, '#ffffff');
    p.rect(10, 27, 3, 2, D); p.rect(19, 27, 3, 2, D);
  },
  tongsil(p) {
    const B = '#d49a5e', D = '#9a6a34', L = '#fff0d8', P = '#f8b8b0';
    p.ell(27, 17, 4.5, 7, D); p.ell(27, 17, 3, 5.5, '#e8c490');
    p.ell(8.5, 8.5, 3.5, 3.5, B); p.ell(23.5, 8.5, 3.5, 3.5, B);
    p.ell(8.5, 8.5, 1.8, 1.8, P); p.ell(23.5, 8.5, 1.8, 1.8, P);
    p.ell(16, 19, 12, 11, B);
    p.rect(15, 9, 2, 4, D); p.rect(12, 10, 1, 3, D); p.rect(19, 10, 1, 3, D);
    p.ell(7.5, 21, 3.5, 3.5, L); p.ell(24.5, 21, 3.5, 3.5, L);
    p.ell(16, 24, 6, 5, L);
    eye(p, 11, 15); eye(p, 19, 15);
    p.rect(10, 14, 3, 1, D); p.rect(19, 14, 3, 1, D);
    p.rect(15, 18, 2, 1, '#6a3a2a');
    p.rect(14, 20, 4, 2, '#ffffff');
    p.rect(9, 28, 5, 3, D); p.rect(18, 28, 5, 3, D);
  },
  jjaek(p) {
    const B = '#b07848', D = '#7a4a28', L = '#f8e0b8', K = '#f0a030';
    p.ell(14, 7, 1.5, 3, D); p.ell(17.5, 6.5, 1.5, 3.5, D);
    p.ell(16, 18, 8.5, 9, B);
    p.ell(16, 21, 5, 5.5, L);
    p.ell(8, 19, 2.5, 5, D); p.ell(24, 19, 2.5, 5, D);
    eye(p, 12, 14); eye(p, 18, 14);
    p.tri(13.5, 17, 18.5, 17, 16, 20.5, K);
    p.rect(12, 27, 2, 3, K); p.rect(18, 27, 2, 3, K);
  },
  hoeori(p) {
    const B = '#8a6a4a', W = '#f4f0e8', D = '#5a3a20', K = '#f0b030', A = '#68a8d8';
    p.ell(5, 16, 5, 9, D); p.ell(27, 16, 5, 9, D);
    p.ell(3, 24, 2, 3, D); p.ell(29, 24, 2, 3, D);
    p.ell(5, 14, 3, 6, B); p.ell(27, 14, 3, 6, B);
    p.ell(16, 19.5, 8, 10, B);
    p.ell(16, 22, 4.5, 6, W);
    p.ell(16, 10, 6, 5.5, W);
    p.ell(14, 4, 2, 2.5, A); p.ell(18.5, 3.5, 2, 2.5, A); p.set(16, 2, A);
    p.rect(12, 9, 2, 2, EYE); p.rect(18, 9, 2, 2, EYE);
    p.rect(11, 8, 3, 1, D); p.rect(18, 8, 3, 1, D);
    p.tri(13.5, 12, 18.5, 12, 16, 16.5, K);
    p.rect(12, 28, 2, 3, K); p.rect(18, 28, 2, 3, K);
  },
  kkomul(p) {
    const B = '#a8d850', D = '#78a830', Y = '#ffe060', P = '#f07878';
    p.ell(6.5, 25.5, 4, 4, B); p.ell(12, 23.5, 4.5, 4.5, B); p.ell(18, 21.5, 5, 5, B);
    p.ell(22.5, 14, 6.5, 6, B);
    p.ell(6.5, 24.5, 1.3, 1.3, Y); p.ell(12, 22.5, 1.4, 1.4, Y); p.ell(18, 20.5, 1.6, 1.6, Y);
    p.line(20, 8, 18, 4, D); p.line(25, 8, 27, 4, D);
    p.ell(18, 3.5, 1.3, 1.3, P); p.ell(27, 3.5, 1.3, 1.3, P);
    p.rect(5, 29, 2, 1, D); p.rect(11, 28, 2, 1, D); p.rect(17, 26, 2, 1, D);
    eye(p, 19, 13); eye(p, 24, 13);
    p.rect(21, 17, 2, 1, '#305020');
  },
  naphul(p) {
    const Wg = '#c8a8f0', Wd = '#9a78d0', S = '#fff0a0', Bd = '#6a5a7a', F = '#f8f0ff';
    p.ell(7, 12, 7, 7, Wg); p.ell(25, 12, 7, 7, Wg);
    p.ell(9, 22, 5, 5, Wd); p.ell(23, 22, 5, 5, Wd);
    p.ell(6, 11, 2.4, 2.4, S); p.ell(26, 11, 2.4, 2.4, S);
    p.ell(6, 11, 1, 1, Wd); p.ell(26, 11, 1, 1, Wd);
    p.ell(9, 23, 1.5, 1.5, S); p.ell(23, 23, 1.5, 1.5, S);
    p.ell(16, 18, 3.5, 8, Bd);
    p.ell(16, 12.5, 4.5, 3, F);
    p.ell(16, 9, 3.5, 3, Bd);
    p.rect(14, 8, 1, 2, '#ffe060'); p.rect(17, 8, 1, 2, '#ffe060');
    p.line(15, 6, 11, 2, Bd); p.line(16, 6, 20, 2, Bd);
    p.set(10, 2, Bd); p.set(21, 2, Bd);
  },
  jjirit(p) {
    const Y = '#ffe04a', D = '#e0a820', W = '#fffbd0';
    p.line(12, 9, 10, 6, D); p.line(10, 6, 12, 4, D); p.line(12, 4, 10, 1, D);
    p.line(19, 9, 21, 6, D); p.line(21, 6, 19, 4, D); p.line(19, 4, 21, 1, D);
    p.tri(10.5, 21, 14.5, 21, 12.5, 28.5, D); p.tri(17.5, 21, 21.5, 21, 19.5, 28.5, D);
    p.ell(16, 16, 9, 9, Y);
    p.ell(12.5, 12, 3, 2, W);
    p.ell(6, 17, 2, 1.5, Y); p.ell(26, 17, 2, 1.5, Y);
    eye(p, 12, 14); eye(p, 18, 14);
    p.set(14, 19, EYE); p.set(15, 20, EYE); p.set(16, 19, EYE); p.set(17, 20, EYE);
  },
  beongae(p) {
    const C = '#8a94c8', Cd = '#626aa0', Cl = '#b8c0e8', Y = '#ffe04a';
    p.tri(7, 21, 12, 21, 8, 27, Y); p.tri(8, 26, 11, 26, 7, 31, Y);
    p.tri(20, 21, 25, 21, 22, 27, Y); p.tri(21, 26, 24, 26, 24, 31, Y);
    p.ell(8.5, 15, 6, 5.5, C); p.ell(23.5, 15, 6, 5.5, C);
    p.ell(16, 11, 7.5, 7, C); p.ell(16, 18, 10.5, 5, C);
    p.ell(13.5, 7.5, 3, 2, Cl); p.ell(7, 12.5, 2, 1.5, Cl);
    p.rect(11, 14, 3, 2, Y); p.rect(18, 14, 3, 2, Y);
    p.line(10, 12, 13, 13, Cd); p.line(21, 12, 18, 13, Cd);
    p.rect(14, 19, 4, 1, Cd);
  },
  doldol(p) {
    const S = '#9aa0a8', Sd = '#6a7078', Sl = '#c8ccd4', F = '#d8b890', Fd = '#a88a60';
    p.ell(16, 18, 12, 10, S);
    p.ell(12, 12, 4, 2.5, Sl);
    p.rect(8, 17, 2, 2, Sd); p.rect(14, 12, 2, 2, Sd); p.rect(20, 14, 2, 2, Sd); p.rect(23, 19, 2, 2, Sd); p.rect(18, 9, 2, 1, Sd);
    p.ell(16, 23, 6, 4.5, F);
    p.ell(11, 19.5, 1.5, 1.5, F); p.ell(21, 19.5, 1.5, 1.5, F);
    eye(p, 13, 21, 2); eye(p, 17, 21, 2);
    p.rect(15, 24, 2, 1, '#4a3020');
    p.rect(8, 27, 4, 3, Fd); p.rect(20, 27, 4, 3, Fd);
  },
  bawi(p) {
    const S = '#8a9098', Sd = '#5a6068', Sl = '#c0c4cc', F = '#d0ae84', Fd = '#a08058', Cr = '#78d8f0';
    p.tri(6, 13, 11, 13, 7.5, 3, Sd); p.tri(12.5, 9, 19.5, 9, 16, 0, Sd); p.tri(21, 13, 26, 13, 24.5, 3, Sd);
    p.ell(4, 22, 3, 4, Fd); p.ell(28, 22, 3, 4, Fd);
    p.ell(16, 17.5, 13.5, 11, S);
    p.ell(11, 11, 4, 2.5, Sl);
    p.rect(7, 18, 2, 2, Sd); p.rect(23, 17, 2, 2, Sd); p.rect(19, 10, 2, 2, Sd); p.rect(9, 13, 2, 1, Sd);
    p.ell(16, 23.5, 7, 5, F);
    p.tri(14, 15.5, 18, 15.5, 16, 10.5, Cr); p.set(15, 14, '#ffffff');
    eye(p, 12, 21, 2); eye(p, 18, 21, 2);
    p.rect(11, 20, 3, 1, Fd); p.rect(18, 20, 3, 1, Fd);
    p.rect(14, 25, 4, 1, '#4a3020');
    p.rect(7, 28, 5, 3, Fd); p.rect(20, 28, 5, 3, Fd);
  },

  // --- 3단 진화 추가분 ---
  hwasan(p) {
    const B = '#a8401c', D = '#6e2410', R = '#e8402a', Y = '#ffd040', G = '#5a5058', L = '#ff8a3a';
    p.ell(16, 4, 4, 4.5, R); p.ell(8, 6, 3, 4, R); p.ell(24, 6, 3, 4, R);
    p.ell(16, 5, 2, 2.5, Y); p.ell(8, 7, 1.4, 2, Y); p.ell(24, 7, 1.4, 2, Y);
    p.ell(5, 14, 4.5, 4, G); p.ell(27, 14, 4.5, 4, G);
    p.ell(16, 18, 12.5, 11.5, B);
    p.rect(3, 13, 3, 1, L); p.rect(26, 13, 3, 1, L); p.set(6, 15, L); p.set(25, 15, L);
    p.ell(16, 22, 7, 6.5, '#ff9a4a'); p.ell(16, 22.5, 3.5, 3.5, Y);
    p.ell(4, 21, 3.2, 5, B); p.ell(28, 21, 3.2, 5, B);
    p.rect(2, 25, 3, 2, '#fff4e0'); p.rect(27, 25, 3, 2, '#fff4e0');
    p.rect(7, 28, 7, 3, D); p.rect(18, 28, 7, 3, D);
    eye(p, 11, 12); eye(p, 19, 12);
    p.rect(10, 11, 4, 1, D); p.rect(18, 11, 4, 1, D);
    p.rect(13, 16, 6, 1, '#5a1a08'); p.set(13, 17, '#ffffff'); p.set(18, 17, '#ffffff');
  },
  haeil(p) {
    const B = '#3a6ec0', D = '#244a8a', L = '#e8f6ff', C = '#a8dcff', T = '#fff8e8';
    p.ell(7, 7, 4.5, 4.5, L); p.ell(16, 4, 5, 4.5, L); p.ell(25, 7, 4.5, 4.5, L);
    p.ell(7, 8, 3, 3, C); p.ell(16, 5, 3.5, 3, C); p.ell(25, 8, 3, 3, C);
    p.ell(28.5, 27, 3.5, 3, D);
    p.ell(16, 19, 13, 11, B);
    p.ell(16, 23.5, 8, 6, L);
    p.ell(3, 23, 3, 3, D); p.ell(29, 23, 3, 3, D);
    eye(p, 10, 13); eye(p, 20, 13);
    p.rect(9, 12, 4, 1, D); p.rect(19, 12, 4, 1, D);
    p.ell(16, 11, 1.8, 1.8, '#ffe060');
    p.rect(14, 17, 4, 2, D);
    p.rect(12, 19, 1, 4, T); p.rect(19, 19, 1, 4, T);
  },
  supji(p) {
    const Bk = '#8a6a40', Bd = '#6a4a28', Lf = '#2e9a40', Ll = '#48b858', M = '#5ab048', P = '#f088b8', Y = '#ffe060';
    p.ell(4, 21, 3, 6, Bk); p.ell(28, 21, 3, 6, Bk);
    p.ell(3, 15, 2.5, 1.6, Lf); p.ell(29, 15, 2.5, 1.6, Lf);
    p.ell(16, 20, 11, 10, Bk);
    p.rect(10, 18, 1, 6, Bd); p.rect(21, 18, 1, 5, Bd);
    p.ell(16, 7, 12, 6.5, Lf);
    p.ell(10, 5, 4, 3, Ll); p.ell(22, 6, 4, 3, Ll);
    for (const [x, y] of [[8, 8], [16, 3], [24, 9]]) {
      p.ell(x, y, 1.6, 1.6, P);
      p.set(x - 0.5, y - 0.5, Y);
    }
    p.ell(16, 15, 6, 4, '#b08a58');
    eye(p, 13, 14, 2); eye(p, 18, 14, 2);
    p.ell(16, 19.5, 5, 2.5, M);
    p.rect(8, 27, 6, 4, Bd); p.rect(18, 27, 6, 4, Bd);
  },
  baramsae(p) {
    const B = '#9a7050', D = '#6a4428', L = '#f4e0c0', K = '#f0a830', A = '#78b0e0';
    p.ell(13, 5, 1.6, 4, A); p.ell(16.5, 4, 1.6, 4.5, A); p.ell(20, 5.5, 1.4, 3.5, D);
    p.tri(13, 25, 19, 25, 16, 31, D);
    p.ell(6, 18, 4, 7, D); p.ell(26, 18, 4, 7, D);
    p.ell(6.5, 17, 2.5, 5, B); p.ell(25.5, 17, 2.5, 5, B);
    p.ell(16, 18.5, 8, 9, B);
    p.ell(16, 21, 4.5, 6, L);
    p.ell(16, 11, 5.5, 5, B);
    eye(p, 12, 10); eye(p, 18, 10);
    p.tri(13.5, 13, 18.5, 13, 16, 17, K);
    p.rect(12, 27, 2, 3, K); p.rect(18, 27, 2, 3, K);
  },
  dandan(p) {
    const S = '#b8c078', D = '#7a8a48', Bn = '#ecebd2';
    p.line(16, 0, 16, 4, Bn);
    p.ell(16, 17, 8, 13, S);
    for (const y of [8, 15, 22, 27]) for (let x = 0; x < 32; x++) if (p.get(x, y)) p.set(x, y, Bn);
    p.ell(13, 10, 2, 1.2, '#d0d890');
    p.rect(11, 12, 3, 2, EYE); p.rect(18, 12, 3, 2, EYE);
    p.set(11, 12, '#ffffff'); p.set(18, 12, '#ffffff');
    p.rect(11, 11, 3, 1, D); p.rect(18, 11, 3, 1, D);
  },
  geoam(p) {
    const S = '#7a8088', Sd = '#4a5058', Sn = '#f4f8ff', F = '#c89a70', Fd = '#946a48', Cr = '#78d8f0';
    p.tri(2, 16, 11, 16, 6, 2, Sd); p.tri(9, 14, 23, 14, 16, 0, S); p.tri(21, 16, 30, 16, 26, 2, Sd);
    p.tri(4.5, 6.5, 7.5, 6.5, 6, 2.5, Sn); p.tri(13.5, 4, 18.5, 4, 16, 0.5, Sn); p.tri(24.5, 6.5, 27.5, 6.5, 26, 2.5, Sn);
    p.rect(3, 27, 6, 4, Fd); p.rect(23, 27, 6, 4, Fd);
    p.ell(16, 19, 15, 10, S);
    p.ell(10, 14, 3, 1.5, '#a0a6ae');
    p.tri(7, 17, 11, 17, 9, 11, Cr); p.tri(21, 17, 25, 17, 23, 11, Cr);
    p.set(8, 15, '#ffffff'); p.set(22, 15, '#ffffff');
    p.ell(16, 24, 7.5, 5, F);
    eye(p, 12, 22, 2); eye(p, 18, 22, 2);
    p.rect(11, 21, 4, 1, Fd); p.rect(17, 21, 4, 1, Fd);
    p.rect(14, 26, 4, 1, '#4a3020');
  },

  // --- 숲 ---
  pojani(p) {
    const Cp = '#9a5ac8', Cd = '#6a3a98', Sp = '#ffe060', St = '#f4ead8', Sd = '#c8b8a0';
    p.rect(11, 28, 3, 2, Sd); p.rect(18, 28, 3, 2, Sd);
    p.ell(16, 23, 6.5, 6, St);
    p.ell(16, 13, 11, 7.5, Cp);
    p.ell(16, 17.5, 9, 2.5, Cd);
    p.ell(11, 10, 2, 1.6, Sp); p.ell(19, 8, 1.6, 1.4, Sp); p.ell(23, 13, 1.5, 1.3, Sp); p.ell(8, 14, 1.2, 1.2, Sp);
    eye(p, 13, 21, 2); eye(p, 17, 21, 2);
    p.rect(15, 25, 2, 1, '#5a3a2a');
    p.set(11, 24, '#ffa8c8'); p.set(20, 24, '#ffa8c8');
  },
  beoseot(p) {
    const Cp = '#9a5ac8', Cd = '#6a3a98', Sp = '#ffe060', St = '#f4ead8', Sd = '#c8b8a0', Pf = '#d8c8f0';
    p.ell(3, 7, 1.6, 1.6, Pf); p.ell(29, 5, 1.6, 1.6, Pf); p.ell(27, 1.5, 1, 1, Pf);
    p.rect(10, 28, 4, 3, Sd); p.rect(18, 28, 4, 3, Sd);
    p.ell(6, 22, 2.5, 3.5, St); p.ell(26, 22, 2.5, 3.5, St);
    p.ell(16, 23, 8, 7, St);
    p.ell(16, 11, 14, 8.5, Cp);
    p.ell(16, 16, 12, 3, Cd);
    p.ell(9, 9, 2.4, 2, Sp); p.ell(17, 6, 2.2, 1.8, Sp); p.ell(24, 10, 2, 1.8, Sp); p.ell(13, 12, 1.4, 1.2, Sp); p.ell(28, 13, 1.2, 1.2, Sp);
    eye(p, 12, 20); eye(p, 18, 20);
    p.rect(11, 19, 3, 1, Sd); p.rect(18, 19, 3, 1, Sd);
    p.rect(14, 25, 4, 1, '#5a3a2a');
  },
  beoseotking(p) {
    const Cp = '#7a3aa8', Cd = '#4a2068', Sp = '#ffe060', G = '#ffd040', St = '#f4ead8', Sd = '#c8b8a0', Ps = '#a050c0';
    p.rect(9, 28, 5, 3, Sd); p.rect(18, 28, 5, 3, Sd);
    p.ell(4, 22, 3, 4.5, St); p.ell(28, 22, 3, 4.5, St);
    p.ell(4, 27.5, 1, 1.5, Ps); p.ell(28, 27.5, 1, 1.5, Ps);
    p.ell(16, 23, 9, 8, St);
    p.ell(16, 9, 15.5, 8.5, Cp);
    p.ell(16, 14.5, 13, 3, Cd);
    for (let x = 3; x <= 29; x += 4) p.set(x, 14, G);
    p.ell(9, 7, 3, 2.4, Sp); p.ell(18, 4, 2.6, 2, Sp); p.ell(25, 8, 2.4, 2, Sp); p.ell(14, 10, 1.4, 1.2, Sp);
    eye(p, 12, 19); eye(p, 18, 19);
    p.line(10, 18, 13, 19, '#4a3020'); p.line(21, 18, 18, 19, '#4a3020');
    p.rect(13, 24, 6, 1, '#5a3a2a'); p.set(13, 23, '#5a3a2a'); p.set(18, 23, '#5a3a2a');
  },
  taldol(p) {
    const Wsp = '#a890d8', Mk = '#f8f0e0', R = '#e85a5a';
    p.ell(16, 24, 6, 6, Wsp); p.ell(20, 28, 3, 2.5, Wsp); p.ell(23.5, 30, 1.5, 1.2, Wsp);
    p.ell(16, 13, 10, 10, Mk);
    for (const [x, y] of [[10, 13], [11, 12], [12, 12], [13, 13], [18, 13], [19, 12], [20, 12], [21, 13]]) p.set(x, y, EYE);
    p.rect(9, 9, 4, 1, EYE); p.rect(19, 9, 4, 1, EYE);
    p.ell(10, 16, 2, 1.5, R); p.ell(22, 16, 2, 1.5, R);
    for (const [x, y] of [[13, 18], [14, 19], [15, 19], [16, 19], [17, 19], [18, 18]]) p.set(x, y, EYE);
    p.set(15, 6, R); p.set(16, 6, R);
  },
  talgwang(p) {
    const Sl = '#ffffff', Rb = '#7a5ab8', Mk = '#f8f0e0', R = '#e85a5a', Y = '#ffd040';
    p.ell(4, 18, 4, 9, Sl); p.ell(28, 18, 4, 9, Sl);
    p.ell(6, 12, 2.5, 2, '#4a8ad8'); p.ell(26, 12, 2.5, 2, R);
    p.ell(16, 23.5, 8, 7.5, Rb);
    p.rect(9, 22, 14, 2, Y);
    p.ell(16, 3, 4, 2, '#2a2a2a');
    p.ell(16, 11, 8.5, 8.5, Mk);
    for (const [x, y] of [[11, 10], [12, 9], [13, 9], [14, 10], [18, 10], [19, 9], [20, 9], [21, 10]]) p.set(x, y, EYE);
    p.ell(10.5, 13, 1.8, 1.3, R); p.ell(21.5, 13, 1.8, 1.3, R);
    p.rect(12, 15, 8, 1, EYE); p.rect(13, 16, 6, 1, '#c84a4a');
    p.rect(13, 30, 2, 1, Rb); p.rect(18, 30, 2, 1, Rb);
  },
  taldae(p) {
    const Rb = '#3a2a5a', Ws = '#6a5a9a', Mk = '#e8dcc0', H = '#1e1e28', R = '#d86a6a', Cl = '#f4f0e0';
    p.ell(4, 27, 3, 3, Ws); p.ell(28, 27, 3, 3, Ws);
    p.ell(16, 24.5, 12, 7.5, Rb);
    p.tri(12, 18, 20, 18, 16, 25, Cl);
    p.ell(16, 13.5, 8, 7.5, Mk);
    p.line(10, 11, 14, 12, EYE); p.line(22, 11, 18, 12, EYE);
    p.rect(11, 13, 3, 1, EYE); p.rect(18, 13, 3, 1, EYE);
    p.ell(10.5, 15.5, 1.5, 1, R); p.ell(21.5, 15.5, 1.5, 1, R);
    p.rect(13, 18, 6, 1, EYE); p.set(13, 17, EYE); p.set(18, 17, EYE);
    p.ell(16, 20, 2.5, 1.5, '#2a2a2a');
    p.ell(16, 3, 5, 3.5, H); p.rect(11, 3, 10, 4, H);
    p.ell(16, 7, 14.5, 2, H);
    p.set(8, 14, '#c8a050'); p.set(8, 16, '#c8a050'); p.set(23, 14, '#c8a050'); p.set(23, 16, '#c8a050');
  },

  // --- 물가 ---
  banjjak(p) {
    const B = '#9ac8e8', L = '#f0faff', F = '#78b0e0';
    p.tri(22, 17, 30, 9, 30, 25, F);
    p.tri(11, 12, 19, 12, 17, 6, F);
    p.tri(12, 22, 17, 22, 13, 27, F);
    p.ell(15, 17, 10, 6.5, B);
    p.ell(14, 20, 7, 2.5, L);
    eye(p, 8, 15, 2);
    p.set(5, 18, EYE);
    p.set(14, 14, '#ffffff'); p.set(18, 16, '#ffffff'); p.set(20, 13, '#ffffff');
  },
  eungeo(p) {
    const S = '#c8d4e0', Sd = '#8a9ab0', G = '#f0c040', L = '#ffffff';
    p.tri(23, 17, 31, 5, 31, 28, G);
    p.tri(8, 10, 21, 10, 17, 2, G);
    p.tri(10, 23, 16, 23, 11, 29, G);
    p.ell(14, 17, 12, 8.5, S);
    for (let y = 12; y <= 21; y += 3) for (let x = 11 + (y % 2) * 2; x <= 23; x += 4) p.set(x, y, Sd);
    p.ell(12, 21, 8.5, 3, L);
    eye(p, 5, 14, 2);
    p.rect(2, 18, 2, 1, EYE);
    p.line(3, 19, 0, 22, G); p.line(4, 20, 2, 25, G);
  },

  // --- 땅 ---
  jinheuk(p) {
    const M = '#9a6a40', Md = '#6a4424', Ml = '#c8946a', P = '#c8c0b0';
    p.rect(10, 28, 4, 2, Md); p.rect(18, 28, 4, 2, Md);
    p.ell(11, 13.5, 3.5, 3, M); p.ell(19, 12.5, 4, 3.5, M);
    p.ell(16, 21, 9.5, 8.5, M);
    p.ell(12, 16.5, 2.5, 1.5, Ml); p.ell(19, 11, 1.5, 1, Ml);
    p.ell(12.5, 19.5, 2, 2, P); p.ell(19.5, 19.5, 2, 2, P);
    p.set(12, 19, EYE); p.set(19, 19, EYE);
    p.rect(15, 23, 3, 1, Md);
    p.ell(7, 26, 1.4, 1.6, Md); p.ell(25, 25, 1.4, 1.6, Md);
  },
  heukjang(p) {
    const M = '#9a6a40', Md = '#6a4424', P = '#a8a098', Y = '#ffd040';
    p.rect(9, 27, 5, 4, Md); p.rect(18, 27, 5, 4, Md);
    p.ell(4.5, 17, 4, 6, M); p.ell(27.5, 17, 4, 6, M);
    p.ell(4.5, 24.5, 3.5, 3, Md); p.ell(27.5, 24.5, 3.5, 3, Md);
    p.ell(16, 19, 10, 10, M);
    p.ell(16, 8.5, 6, 5, M);
    p.line(12, 14, 14, 18, Md); p.line(20, 13, 18, 17, Md);
    p.ell(16, 22, 4.5, 4, P);
    p.rect(13, 7, 2, 2, Y); p.rect(18, 7, 2, 2, Y);
    p.rect(14, 11, 4, 1, Md);
  },
  daeji(p) {
    const M = '#8a5e38', Md = '#5a3a1e', St = '#8a8a90', Gr = '#58b048', Y = '#ffd040';
    p.rect(6, 27, 7, 5, Md); p.rect(19, 27, 7, 5, Md);
    p.ell(3, 19, 3, 7, Md); p.ell(29, 19, 3, 7, Md);
    p.ell(16, 19, 13, 10, M);
    p.ell(16, 8, 7, 5, M);
    p.ell(16, 3.5, 7, 2.5, Gr); p.set(11, 1, Gr); p.set(16, 0, Gr); p.set(20, 1, Gr);
    p.ell(9, 16, 4, 3, St); p.ell(23, 16, 4, 3, St); p.ell(16, 23, 5, 4, St);
    p.ell(8, 15, 1.5, 1, '#b0b0b8'); p.ell(22, 15, 1.5, 1, '#b0b0b8');
    p.rect(12, 7, 3, 2, Y); p.rect(18, 7, 3, 2, Y);
    p.rect(13, 11, 6, 1, Md);
  },

  // --- 전기 ---
  ddakkum(p) {
    const Y = '#f4c838', Yd = '#c89a20', F = '#f8e8c8', Sp = '#fff27a';
    p.tri(5, 15, 10, 15, 3, 8, Yd); p.tri(8, 12, 14, 12, 9, 4, Yd); p.tri(13, 11, 19, 11, 16, 2, Yd);
    p.tri(18, 12, 24, 12, 23, 4, Yd); p.tri(22, 15, 27, 15, 29, 8, Yd);
    for (const [x, y] of [[3, 8], [9, 4], [16, 2], [23, 4], [28, 8]]) p.set(x, y, Sp);
    p.rect(10, 27, 3, 2, Yd); p.rect(19, 27, 3, 2, Yd);
    p.ell(16, 19, 10, 9, Y);
    p.ell(16, 21, 6.5, 5.5, F);
    eye(p, 12, 18, 2); eye(p, 18, 18, 2);
    p.rect(15, 22, 2, 1, EYE);
    p.set(10, 22, '#ff9a7a'); p.set(21, 22, '#ff9a7a');
  },
  beonjjeok(p) {
    const Y = '#f0b828', Yd = '#b88818', F = '#f8e8c8', Sp = '#fff6a0';
    const bolt = (x: number, y: number, s: number) => {
      p.tri(x, y, x + 4 * s, y - 3, x + 2 * s, y - 5, Yd);
      p.tri(x + 2 * s, y - 5, x + 5 * s, y - 6, x + 3 * s, y - 10, Yd);
      p.set(x + 3 * s, y - 10, Sp);
    };
    bolt(6, 14, -1); bolt(10, 10, -1); bolt(15, 9, 1); bolt(21, 10, 1); bolt(25, 14, 1);
    p.rect(10, 27, 4, 4, Yd); p.rect(18, 27, 4, 4, Yd);
    p.ell(6, 20, 2.2, 3.5, Y); p.ell(26, 20, 2.2, 3.5, Y);
    p.ell(16, 18.5, 9, 10, Y);
    p.ell(16, 21, 6, 6.5, F);
    eye(p, 12, 15); eye(p, 18, 15);
    p.rect(11, 14, 3, 1, Yd); p.rect(18, 14, 3, 1, Yd);
    p.rect(14, 20, 4, 1, EYE);
  },
  noejeon(p) {
    const Y = '#e8a818', Yd = '#a87010', F = '#f8e8c8', Bl = '#7ad0ff', Wt = '#ffffff';
    const bolt = (x: number, y: number, s: number) => {
      p.tri(x, y, x + 5 * s, y - 4, x + 2 * s, y - 6, Bl);
      p.tri(x + 2 * s, y - 6, x + 6 * s, y - 7, x + 3 * s, y - 12, Bl);
      p.set(x + 3 * s, y - 11, Wt);
    };
    bolt(5, 15, -1); bolt(9, 11, -1); bolt(15, 10, 1); bolt(21, 11, 1); bolt(26, 15, 1);
    p.rect(8, 27, 6, 4, Yd); p.rect(18, 27, 6, 4, Yd);
    p.ell(4.5, 20, 3, 4.5, Y); p.ell(27.5, 20, 3, 4.5, Y);
    p.rect(2, 24, 3, 2, Wt); p.rect(27, 24, 3, 2, Wt);
    p.ell(16, 19, 11, 10.5, Y);
    p.ell(16, 21.5, 6.5, 6.5, F);
    p.ell(16, 21.5, 2, 2.5, Bl);
    eye(p, 11, 15); eye(p, 19, 15);
    p.line(10, 13, 13, 14, Yd); p.line(21, 13, 18, 14, Yd);
    p.rect(13, 18, 6, 1, EYE);
  },

  // --- 준전설 ---
  sangun(p) {
    const Wt = '#f4f4f8', G = '#c8ccd8', St = '#3a4a6a', Mist = '#a8d0e8', Eye = '#7ae0ff', R = '#e85a5a', Gd = '#ffd040';
    p.ell(4, 26, 4, 3, Mist); p.ell(28, 26, 4, 3, Mist); p.ell(16, 30, 9, 2, Mist);
    p.tri(24, 17, 31, 10, 29, 20, Wt);
    p.ell(16, 21, 11, 8, Wt);
    p.rect(7, 26, 5, 5, Wt); p.rect(20, 26, 5, 5, Wt);
    p.rect(7, 26, 5, 1, Gd); p.rect(20, 26, 5, 1, Gd);
    p.ell(6.5, 4.5, 3, 3, Wt); p.ell(25.5, 4.5, 3, 3, Wt);
    p.ell(6.5, 4.5, 1.5, 1.5, G); p.ell(25.5, 4.5, 1.5, 1.5, G);
    p.ell(16, 11, 10, 8, Wt);
    p.ell(10, 16, 4, 3, Wt); p.ell(22, 16, 4, 3, Wt);
    for (const [x0, y0, x1, y1] of [[14, 3, 15, 7], [18, 3, 17, 7], [16, 4, 16, 7], [7, 10, 10, 11], [25, 10, 22, 11], [7, 13, 9, 13], [25, 13, 23, 13], [9, 20, 11, 23], [23, 20, 21, 23], [13, 25, 14, 28], [19, 25, 18, 28]]) p.line(x0, y0, x1, y1, St);
    p.rect(11, 10, 3, 2, Eye); p.rect(18, 10, 3, 2, Eye);
    p.set(11, 10, '#ffffff'); p.set(18, 10, '#ffffff');
    p.line(10, 9, 13, 9, St); p.line(22, 9, 19, 9, St);
    p.ell(16, 15, 3, 2, G);
    p.rect(15, 14, 2, 1, R);
    p.rect(14, 17, 4, 1, St); p.set(13, 16, St); p.set(18, 16, St);
    p.set(14, 18, '#ffffff'); p.set(17, 18, '#ffffff');
    p.tri(14.5, 1, 17.5, 1, 16, -2, Mist);
  },

  // --- 전설 ---
  eunha(p) {
    const B = '#2a3a8a', Bd = '#1a2460', L = '#8ab0f0', St = '#fff8c8', G = '#7ae0ff';
    p.tri(23, 15, 31, 5, 30, 16, B); p.tri(23, 16, 30, 16, 31, 26, B);
    p.set(31, 5, G); p.set(31, 26, G); p.set(30, 6, G); p.set(30, 25, G);
    p.ell(14, 16, 13, 9, B);
    p.ell(13, 20.5, 10, 3.5, L);
    p.tri(10, 22, 17, 22, 11, 29, Bd);
    for (const [x, y] of [[8, 11], [14, 9], [19, 12], [22, 10], [17, 15], [11, 14], [24, 15]]) p.set(x, y, St);
    p.set(14, 8, '#ffffff');
    p.ell(6, 11, 2.2, 2.2, St); p.ell(7, 10.4, 1.8, 1.8, B);
    eye(p, 5, 15, 2);
    p.rect(2, 19, 3, 1, Bd);
  },
};

const monCache = new Map<string, HTMLCanvasElement>();
export function monSprite(species: string): HTMLCanvasElement {
  let c = monCache.get(species);
  if (!c) {
    const p = new Pix(32, 32);
    (DRAW[species] ?? DRAW.tosil)(p);
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
/** 포획구 — a lantern-shaped capture capsule. */
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
