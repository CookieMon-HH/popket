import { BW, OX, H, text, box, centered, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { ui, Widget, say, yesNo } from '../engine/ui';
import { clock, wait } from '../engine/timing';
import { flashes } from '../engine/scene';
import { game, runtime } from './state';
import { world, healParty, trainerBattle, warpTo, giveItem } from './api';
import type { TrainerDef } from './maps';

// ---------------------------------------------------------------------------
// 해솔 리그 토너먼트: 16강 → 8강 → 4강 → 결승.
// The party is healed before every match, opponents get stronger each round,
// and one loss knocks the player out (start again from 16강).

export const ROUND_NAMES = ['16강', '8강', '4강', '결승'];

/** Bracket slots. 0 is the player; the player's opponents are 1 (16강), 2 (8강), 4 (4강), 12 (결승). */
const SLOT_NAMES = ['', '한결', '그림자', '바람', '용연', '모래', '파도', '서리꽃', '새봄', '하늬', '고요', '태양', '은재', '보라', '무명', '불돌이'];
/** Winners of every bracket node after each round, for the slots the player is not in. */
const WINNERS: number[][] = [
  [0, 2, 4, 7, 9, 10, 12, 15], // after 16강
  [0, 4, 10, 12], // after 8강
  [0, 12], // after 4강
  [0], // champion
];

export class BracketView extends Widget<void> {
  constructor(public round: number, public won: boolean) {
    super();
  }
  update() {
    if (input.pressed('a') || input.pressed('b')) this.finish();
  }
  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }
  private paint(ctx: Ctx) {
    const W = BW;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1c2250');
    g.addColorStop(1, '#3a2a6a');
    ctx.fillStyle = g;
    ctx.fillRect(-OX - 16, 0, W + OX * 2 + 32, H);
    const done = this.won ? this.round + 1 : this.round; // rounds finished
    text(ctx, '해솔 리그 토너먼트', W / 2, 4, { size: 11, weight: 900, align: 'center', color: '#ffd24a', shadow: '#000' });
    const sub = done >= 4 ? '우승!' : `다음 경기: ${ROUND_NAMES[done]}`;
    text(ctx, sub, W / 2, 18, { size: 8, align: 'center', color: '#ffffff', shadow: '#000' });

    const name = (i: number) => (i === 0 ? game.name : SLOT_NAMES[i]);
    const ys = Array.from({ length: 8 }, (_, i) => 36 + i * 17);
    const colX = [4, 54, 78, 100]; // left side: names, r1 join, r2 join, r3 join
    const pathCol = '#ff9a3a';
    const winCol = '#ffd24a';
    const lineCol = 'rgba(255,255,255,0.35)';

    const drawSide = (side: 0 | 1) => {
      const base = side * 8;
      const mx = (x: number) => (side ? W - x : x);
      const nodeY: number[][] = [ys];
      for (let r = 1; r <= 3; r++) {
        const prev = nodeY[r - 1];
        nodeY.push(prev.filter((_, i) => i % 2 === 0).map((y, i) => (y + prev[i * 2 + 1]) / 2));
      }
      // names
      for (let i = 0; i < 8; i++) {
        const slot = base + i;
        const alive = done === 0 || WINNERS[Math.min(done, 4) - 1].includes(slot);
        const me = slot === 0;
        const bx = side ? W - 4 - 46 : 4;
        ctx.fillStyle = me ? 'rgba(255,154,58,0.35)' : 'rgba(255,255,255,0.10)';
        ctx.fillRect(bx, ys[i] - 6, 46, 12);
        text(ctx, name(slot), side ? W - 8 : 8, ys[i] - 5, { size: 7, align: side ? 'right' : 'left', color: alive ? '#ffffff' : '#8a8aa8', shadow: false });
      }
      // lines per round
      for (let r = 0; r < 3; r++) {
        const n = nodeY[r].length;
        for (let i = 0; i < n; i += 2) {
          const y1 = nodeY[r][i];
          const y2 = nodeY[r][i + 1];
          const yj = nodeY[r + 1][i / 2];
          const x0 = mx(r === 0 ? 50 : colX[r]);
          const x1 = mx(colX[r + 1]);
          // which slot won this node, if decided
          const decided = done > r;
          const winners = decided ? WINNERS[r] : [];
          const groupSize = 2 ** (r + 1);
          const groupStart = base + (i / 2) * groupSize;
          const winner = winners.find((w) => w >= groupStart && w < groupStart + groupSize);
          const topWon = winner !== undefined && winner < groupStart + groupSize / 2;
          const color = (top: boolean) => {
            if (!decided || winner === undefined) return lineCol;
            if (top !== topWon) return lineCol;
            return winner === 0 ? pathCol : winCol;
          };
          ctx.lineWidth = 1.5;
          for (const [y, top] of [[y1, true], [y2, false]] as const) {
            ctx.strokeStyle = color(top);
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x1, y);
            ctx.lineTo(x1, yj);
            ctx.stroke();
          }
        }
      }
      // final link to the centre
      const yF = nodeY[3][0];
      const sideWinner = done >= 3 ? WINNERS[2][side] : undefined;
      const lostFinal = done >= 4 && sideWinner !== 0;
      ctx.strokeStyle = sideWinner === undefined || lostFinal ? lineCol : sideWinner === 0 ? pathCol : winCol;
      ctx.beginPath();
      ctx.moveTo(mx(colX[3]), yF);
      ctx.lineTo(mx(W / 2 - 14), yF);
      ctx.stroke();
    };
    drawSide(0);
    drawSide(1);

    // trophy in the middle
    const cx = W / 2;
    const ty = 96;
    const shine = done >= 4 ? 0.6 + Math.sin(clock.frame / 8) * 0.4 : 0.25;
    ctx.fillStyle = `rgba(255,210,74,${shine})`;
    ctx.beginPath();
    ctx.arc(cx, ty, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(cx - 8, ty - 10, 16, 10);
    ctx.fillRect(cx - 2, ty, 4, 7);
    ctx.fillRect(cx - 7, ty + 7, 14, 3);
    ctx.fillStyle = '#e8a020';
    ctx.fillRect(cx - 11, ty - 8, 3, 6);
    ctx.fillRect(cx + 8, ty - 8, 3, 6);
    if (done >= 4) text(ctx, game.name, cx, ty + 21, { size: 8, weight: 900, align: 'center', color: '#ffd24a', shadow: '#000' });

    box(ctx, 40, H - 22, W - 80, 18, 'dark');
    text(ctx, done >= 4 ? '축하합니다! A 버튼' : '경기장으로 — A 버튼', W / 2, H - 19, { size: 8, align: 'center', color: '#fff', shadow: false });
  }
}

async function showBracket(round: number, won: boolean) {
  await ui.run(new BracketView(round, won));
}

// --- opponents -------------------------------------------------------------

let opponentDefs: (() => TrainerDef)[] = [];
/** story.ts registers the four opponents (it owns the palettes and the rival). */
export function setOpponents(defs: (() => TrainerDef)[]) {
  opponentDefs = defs;
}
export const opponent = (round: number) => opponentDefs[round]();

const PRIZES: [string, number][] = [['hyperball', 3], ['maxrevive', 1], ['fullrestore', 2], ['trophy', 1]];

let finalHooks: { intro: () => Promise<void>; win: () => Promise<void> } | null = null;
export function setFinalHooks(h: { intro: () => Promise<void>; win: () => Promise<void> }) {
  finalHooks = h;
}

async function announce(lines: string[]) {
  for (const l of lines) await say(`아나운서: ${l}`);
}

async function placeForMatch(round: number) {
  runtime.tourneyRound = round;
  await warpTo('league', 7, 9, 'up');
}

/** 접수원: entry point of the tournament. */
export async function receptionTalk() {
  const wins = game.leagueWins ?? 0;
  await say(wins ? `접수원: 해솔 리그 토너먼트에 다시 오셨군요! (우승 ${wins}회)` : '접수원: 해솔 리그 토너먼트에 오신 걸 환영합니다!');
  await say('접수원: 16강부터 결승까지 네 번 연속으로 이기면 우승이에요.\n경기마다 동료들은 회복되지만, 한 번이라도 지면 그 자리에서 탈락이에요.');
  if (!(await yesNo('접수원: 토너먼트에 참가하시겠어요?'))) {
    await say('접수원: 준비되시면 언제든 말씀해 주세요!');
    return;
  }
  await say('접수원: 등록 완료! 대진표를 확인하세요.');
  for (let round = 0; round < 4; round++) {
    await showBracket(round, false);
    await healParty();
    await placeForMatch(round);
    world.confetti = 0;
    const opp = opponent(round);
    if (round === 0) await announce(['해솔 리그 토너먼트, 지금부터 시작합니다!', `16강 첫 경기! ${game.name} 선수 대 ${opp.name} 선수!`]);
    else if (round < 3) await announce([`${ROUND_NAMES[round]}! 관중석이 뜨겁습니다!`, `${game.name} 선수 대 ${opp.cls} ${opp.name}!`]);
    else {
      await announce(['드디어 결승전입니다! 관중석이 터질 것 같아요!', `${game.name} 선수 대… ${opp.name} 선수!`]);
      if (finalHooks) await finalHooks.intro();
    }
    if (round < 3) await say(`${opp.name}: ${opp.intro}`);
    const res = await trainerBattle(opp, true);
    if (res !== 'win') {
      runtime.tourneyRound = -1;
      world.refreshNPCs();
      await announce([`아쉽습니다! ${game.name} 선수, ${ROUND_NAMES[round]}에서 탈락!`]);
      await say('관중: 잘 싸웠어! 다음엔 꼭 우승해!');
      await warpTo('league', 7, 12, 'down');
      return;
    }
    // Celebration
    world.confetti = 150;
    await flashes(1);
    if (round < 3) {
      await announce([`${game.name} 선수 승리! ${ROUND_NAMES[round + 1]} 진출입니다!`]);
      await say('관중: 와아아아——!');
    } else {
      await announce(['우승! 우승입니다! 새로운 챔피언의 탄생입니다!!']);
      await say('관중: 와아아아아아——!!');
    }
    const [item, qty] = PRIZES[round];
    if (item !== 'trophy' || !game.bag.trophy) await giveItem(item, qty);
    runtime.tourneyRound = -1;
    world.refreshNPCs();
    await showBracket(round, true);
    if (round < 3) {
      await healParty();
      await say('다음 경기를 위해 동료들이 모두 회복되었다!');
    }
  }
  game.leagueWins = (game.leagueWins ?? 0) + 1;
  await wait(10);
  if (finalHooks) await finalHooks.win();
}
