import { W, H, box, text, hpBar, typeChip, drawSprite, cursor, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { ui, Widget, Menu, MessageBox, say } from '../engine/ui';
import { tween, wait } from '../engine/timing';
import { scenes, fadeTo, type Scene } from '../engine/scene';
import { MOVES, STATUS_LABEL, STAT_NAME, type MoveDef, type StatKey, type Effect } from '../data/moves';
import { SPECIES } from '../data/species';
import { ITEMS } from '../data/items';
import { effectiveness, TYPE_COLOR } from '../data/types';
import { game, removeItem, markSeen, markCaught, addMon } from './state';
import { monName, maxHp, calcStats, expFor, expRatio, type Mon } from './monster';
import { monSprite, personSprite, capsuleSprite, type Pal } from './sprites';
import { BagView, pickPartyMember, useItemOn } from './menus';
import { learnMove, movesLearnedAt } from './learn';
import { j, pick, rand, clamp } from './common';

export type BattleResult = 'win' | 'lose' | 'run' | 'caught';

export interface BattleOpts {
  kind: 'wild' | 'trainer';
  enemies: Mon[];
  trainer?: { cls: string; name: string; reward: number; defeat: string; pal: Pal };
}

class BMon {
  stages: Record<StatKey, number> = { atk: 0, def: 0, spe: 0, acc: 0 };
  constructor(public mon: Mon, public side: 'me' | 'foe') {}
}

const stageMul = (s: number) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));

class View {
  enemy: Mon | null = null;
  player: Mon | null = null;
  eX = 0; eY = 0; eAlpha = 1; eScale = 1; eVis = false; eBlink = false;
  pX = 0; pY = 0; pAlpha = 1; pVis = false; pBlink = false;
  eHp = 0; pHp = 0; pExp = 0;
  eBox = false; pBox = false;
  trainer: Pal | null = null; tX = 0;
  ball = { x: 0, y: 0, vis: false, rot: 0 };
  shake = 0;
}

class BattleScene implements Scene {
  constructor(public v: View) {}
  update() {}

  drawWorld(g: Ctx) {
    const v = this.v;
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#f6f4dc');
    grad.addColorStop(0.55, '#e0f0c8');
    grad.addColorStop(1, '#b8dc98');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#a6d088';
    g.beginPath();
    g.ellipse(184, 76, 50, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c0e0a0';
    g.beginPath();
    g.ellipse(184, 74, 44, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#a6d088';
    g.beginPath();
    g.ellipse(64, 146, 62, 13, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c0e0a0';
    g.beginPath();
    g.ellipse(64, 144, 56, 10, 0, 0, Math.PI * 2);
    g.fill();

    const sx = v.shake ? Math.round(Math.sin(v.shake * 2) * 2) : 0;
    if (v.trainer) {
      drawSprite(g, personSprite(v.trainer, 'down', 0), 160 + v.tX, 16, 48, 60);
    }
    if (v.enemy && v.eVis && !v.eBlink) {
      const s = 64 * v.eScale;
      g.globalAlpha = v.eAlpha;
      drawSprite(g, monSprite(v.enemy.species), 152 + v.eX + (64 - s) / 2 + sx, 14 + v.eY + (64 - s), s, s);
      g.globalAlpha = 1;
    }
    if (v.player && v.pVis && !v.pBlink) {
      g.globalAlpha = v.pAlpha;
      drawSprite(g, monSprite(v.player.species), 16 + v.pX, 54 + v.pY, 96, 96, true);
      g.globalAlpha = 1;
    }
    if (v.ball.vis) {
      g.save();
      g.translate(v.ball.x, v.ball.y);
      g.rotate(v.ball.rot);
      g.drawImage(capsuleSprite(), -5, -5);
      g.restore();
    }
  }

  drawUI(ctx: Ctx) {
    const v = this.v;
    if (v.eBox && v.enemy) {
      box(ctx, 6, 8, 122, 36);
      text(ctx, monName(v.enemy), 14, 13, { size: 10 });
      text(ctx, `Lv${v.enemy.level}`, 120, 13, { size: 9, align: 'right' });
      statusChip(ctx, v.enemy, 14, 28);
      text(ctx, 'HP', 46, 27, { size: 8, color: '#e0605a', shadow: false });
      hpBar(ctx, 60, 30, 62, v.eHp / maxHp(v.enemy));
      if (game.caught.includes(v.enemy.species)) {
        ctx.fillStyle = '#3aa8a0';
        ctx.fillRect(116, 26, 5, 5);
      }
    }
    if (v.pBox && v.player) {
      const m = v.player;
      const mh = maxHp(m);
      box(ctx, 128, 96, 124, 46);
      text(ctx, monName(m), 136, 101, { size: 10 });
      text(ctx, `Lv${m.level}`, 244, 101, { size: 9, align: 'right' });
      statusChip(ctx, m, 136, 116);
      text(ctx, 'HP', 168, 115, { size: 8, color: '#e0605a', shadow: false });
      hpBar(ctx, 182, 118, 62, v.pHp / mh);
      text(ctx, `${Math.ceil(v.pHp)}/${mh}`, 244, 124, { size: 8, align: 'right' });
      ctx.fillStyle = '#3a3e52';
      ctx.fillRect(136, 136, 108, 3);
      ctx.fillStyle = '#4ab0e8';
      ctx.fillRect(137, 137, 106 * v.pExp, 1.5);
    }
  }
}

function statusChip(ctx: Ctx, m: Mon, x: number, y: number) {
  if (m.status) typeChip(ctx, STATUS_LABEL[m.status].name, STATUS_LABEL[m.status].color, x, y);
}

// ---------------------------------------------------------------------------

class MoveMenu extends Widget<number> {
  static last = new Map<number, number>();
  idx: number;
  constructor(public m: Mon) {
    super();
    this.idx = Math.min(MoveMenu.last.get(m.uid) ?? 0, m.moves.length - 1);
  }
  update() {
    const n = this.m.moves.length;
    let i = this.idx;
    if (input.repeat('up') && i >= 2) i -= 2;
    if (input.repeat('down') && i + 2 < n) i += 2;
    if (input.repeat('left') && i % 2 === 1) i -= 1;
    if (input.repeat('right') && i % 2 === 0 && i + 1 < n) i += 1;
    this.idx = i;
    if (input.pressed('a')) {
      MoveMenu.last.set(this.m.uid, i);
      this.finish(i);
    } else if (input.pressed('b')) this.finish(-1);
  }
  draw(ctx: Ctx) {
    box(ctx, 0, 144, 172, 48);
    this.m.moves.forEach((s, i) => {
      const x = 18 + (i % 2) * 78;
      const y = 152 + Math.floor(i / 2) * 18;
      text(ctx, MOVES[s.id].name, x, y, { size: 10, color: s.pp > 0 ? undefined : '#a0a2b0' });
      if (i === this.idx) cursor(ctx, x - 10, y + 2);
    });
    const s = this.m.moves[this.idx];
    const mv = MOVES[s.id];
    box(ctx, 172, 144, 84, 48);
    text(ctx, `PP ${s.pp}/${mv.pp}`, 248, 152, { size: 10, align: 'right', color: s.pp === 0 ? '#e04a4a' : undefined });
    typeChip(ctx, mv.type, TYPE_COLOR[mv.type], 182, 172);
    text(ctx, mv.power ? `위력 ${mv.power}` : '변화', 248, 172, { size: 8, align: 'right' });
  }
}

// ---------------------------------------------------------------------------

export async function runBattle(o: BattleOpts): Promise<BattleResult> {
  const v = new View();
  scenes.current = new BattleScene(v);
  const wild = o.kind === 'wild';
  const tr = o.trainer;
  let enemyIdx = 0;
  let enemy = new BMon(o.enemies[0], 'foe');
  let me = new BMon(game.party.find((m) => m.hp > 0)!, 'me');
  let participants = new Set<Mon>([me.mon]);
  let runAttempts = 0;
  let lastAction = 0;

  const L = (b: BMon) => (b.side === 'me' ? monName(b.mon) : `${wild ? '야생' : '상대'} ${monName(b.mon)}`);
  const trName = tr ? `${tr.cls} ${tr.name}` : '';
  const stat = (b: BMon, k: 'atk' | 'def' | 'spe') => {
    let s = calcStats(b.mon)[k] * stageMul(b.stages[k]);
    if (k === 'spe' && b.mon.status === 'par') s *= 0.5;
    if (k === 'atk' && b.mon.status === 'brn') s *= 0.5;
    return Math.max(1, s);
  };

  // --- animation helpers ---
  async function animHp(b: BMon) {
    const target = b.mon.hp;
    const from = b.side === 'me' ? v.pHp : v.eHp;
    const frames = clamp((Math.abs(target - from) / maxHp(b.mon)) * 50, 6, 40);
    await tween(frames, (p) => {
      const val = from + (target - from) * p;
      if (b.side === 'me') v.pHp = val;
      else v.eHp = val;
    });
  }
  async function lunge(b: BMon) {
    await tween(10, (p) => {
      const d = Math.sin(p * Math.PI) * 10;
      if (b.side === 'me') v.pX = d;
      else v.eX = -d;
    });
  }
  async function blink(b: BMon) {
    for (let i = 0; i < 4; i++) {
      if (b.side === 'me') v.pBlink = !v.pBlink;
      else v.eBlink = !v.eBlink;
      await wait(4);
    }
    v.pBlink = v.eBlink = false;
  }
  async function faintAnim(b: BMon) {
    await tween(16, (p) => {
      if (b.side === 'me') {
        v.pY = p * 50;
        v.pAlpha = 1 - p;
      } else {
        v.eY = p * 40;
        v.eAlpha = 1 - p;
      }
    });
    if (b.side === 'me') {
      v.pVis = false;
      v.pBox = false;
    } else {
      v.eVis = false;
      v.eBox = false;
    }
  }
  async function sendOutMe() {
    v.player = me.mon;
    v.pHp = me.mon.hp;
    v.pExp = expRatio(me.mon);
    v.pX = -130;
    v.pY = 0;
    v.pAlpha = 1;
    v.pVis = true;
    await say(`가랏! ${monName(me.mon)}!`);
    await tween(14, (p) => (v.pX = -130 * (1 - p)));
    v.pBox = true;
  }
  async function popEnemy() {
    v.enemy = enemy.mon;
    v.eHp = enemy.mon.hp;
    v.eX = 0;
    v.eY = 0;
    v.eAlpha = 1;
    v.eVis = true;
    markSeen(enemy.mon.species);
    await tween(12, (p) => (v.eScale = p));
    v.eBox = true;
  }

  // --- intro ---
  if (wild) {
    v.enemy = enemy.mon;
    v.eHp = enemy.mon.hp;
    v.eVis = true;
    v.eX = 140;
    markSeen(enemy.mon.species);
    await fadeTo(0, 12);
    await tween(30, (p) => (v.eX = 140 * (1 - p)));
    v.eBox = true;
    if (SPECIES[enemy.mon.species].catchRate <= 25) await say(`전설의 몬스터 ${j(monName(enemy.mon), '이/가')} 모습을 드러냈다!`);
    else await say(`앗! ${j(L(enemy), '이/가')} 튀어나왔다!`);
  } else {
    v.trainer = tr!.pal;
    v.tX = 120;
    await fadeTo(0, 12);
    await tween(24, (p) => (v.tX = 120 * (1 - p)));
    await say(`${j(trName, '이/가')} 승부를 걸어왔다!`);
    await tween(16, (p) => (v.tX = 110 * p));
    v.trainer = null;
    await say(`${j(trName, '은/는')} ${j(monName(enemy.mon), '을/를')} 내보냈다!`);
    v.eScale = 0;
    await popEnemy();
  }
  await sendOutMe();

  // --- core move execution ---
  async function applyEffect(e: Effect, user: BMon, target: BMon, primary: boolean) {
    if (e.kind === 'heal') {
      const mh = maxHp(user.mon);
      if (user.mon.hp >= mh) {
        await say(`그러나 ${L(user)}의 체력은 이미 가득하다!`);
        return;
      }
      user.mon.hp = Math.min(mh, user.mon.hp + Math.ceil(mh / 2));
      await animHp(user);
      await say(`${j(L(user), '은/는')} 숨을 고르며 체력을 회복했다!`);
      return;
    }
    if (e.kind === 'stat') {
      const who = e.target === 'self' ? user : target;
      if (who.mon.hp <= 0) return;
      const cur = who.stages[e.stat];
      const name = STAT_NAME[e.stat];
      if ((e.stages > 0 && cur >= 6) || (e.stages < 0 && cur <= -6)) {
        if (primary) await say(`${L(who)}의 ${j(name, '은/는')} 더 이상 ${e.stages > 0 ? '오르지' : '떨어지지'} 않는다!`);
        return;
      }
      who.stages[e.stat] = clamp(cur + e.stages, -6, 6);
      const big = Math.abs(e.stages) >= 2 ? '크게 ' : '';
      await say(`${L(who)}의 ${j(name, '이/가')} ${big}${e.stages > 0 ? '올랐다' : '떨어졌다'}!`);
      return;
    }
    if (e.kind === 'status') {
      const t = target.mon;
      if (t.hp <= 0) return;
      const types = SPECIES[t.species].types;
      const immune =
        (e.status === 'brn' && types.includes('불')) ||
        (e.status === 'par' && types.includes('전기')) ||
        (e.status === 'psn' && types.includes('독'));
      if (t.status || immune) {
        if (primary) await say(`그러나 ${L(target)}에게는 효과가 없었다!`);
        return;
      }
      t.status = e.status;
      const n = j(L(target), '은/는');
      if (e.status === 'brn') await say(`${n} 화상을 입었다!`);
      if (e.status === 'psn') await say(`${n} 독에 걸렸다!`);
      if (e.status === 'par') await say(`${n} 마비되어 기술이 나오기 어려워졌다!`);
      if (e.status === 'slp') {
        t.sleep = rand(2, 4);
        await say(`${n} 잠들어 버렸다!`);
      }
    }
  }

  async function doMove(user: BMon, target: BMon, slot: number | null) {
    const m = user.mon;
    if (m.status === 'slp') {
      m.sleep--;
      if (m.sleep > 0) {
        await say(`${j(L(user), '은/는')} 쿨쿨 잠들어 있다.`);
        return;
      }
      m.status = null;
      await say(`${j(L(user), '은/는')} 잠에서 깼다!`);
    }
    if (m.status === 'par' && Math.random() < 0.25) {
      await say(`${j(L(user), '은/는')} 몸이 저려서 움직일 수 없다!`);
      return;
    }
    const mv: MoveDef = slot === null ? MOVES.struggle : MOVES[m.moves[slot].id];
    if (slot !== null) m.moves[slot].pp = Math.max(0, m.moves[slot].pp - 1);
    await say(`${L(user)}의 ${mv.name}!`, { instant: false });

    const selfMove = mv.power === 0 && (mv.effect?.kind === 'heal' || (mv.effect?.kind === 'stat' && mv.effect.target === 'self'));
    if (!selfMove && mv.acc > 0 && Math.random() * 100 >= mv.acc * stageMul(user.stages.acc)) {
      await say(`그러나 ${L(user)}의 공격은 빗나갔다!`);
      return;
    }
    if (mv.power === 0) {
      if (mv.effect) await applyEffect(mv.effect, user, target, true);
      return;
    }

    await lunge(user);
    const eff = mv.id === 'struggle' ? 1 : effectiveness(mv.type, SPECIES[target.mon.species].types);
    if (eff === 0) {
      await say(`${L(target)}에게는 효과가 없는 것 같다…`);
      return;
    }
    const crit = Math.random() < 1 / 16;
    const stab = SPECIES[m.species].types.includes(mv.type) ? 1.5 : 1;
    const base = Math.floor(Math.floor(((2 * m.level) / 5 + 2) * mv.power * stat(user, 'atk') / stat(target, 'def')) / 50) + 2;
    const dmg = Math.max(1, Math.floor(base * (crit ? 1.5 : 1) * stab * eff * (0.85 + Math.random() * 0.15)));
    await blink(target);
    const before = target.mon.hp;
    target.mon.hp = Math.max(0, before - dmg);
    await animHp(target);
    if (crit) await say('급소에 맞았다!');
    if (eff > 1) await say('효과가 굉장했다!');
    else if (eff < 1) await say('효과가 별로인 듯하다…');
    const dealt = before - target.mon.hp;

    const e = mv.effect;
    if (e?.kind === 'drain' && dealt > 0 && m.hp > 0) {
      m.hp = Math.min(maxHp(m), m.hp + Math.max(1, Math.floor(dealt / 2)));
      await animHp(user);
      await say(`${L(target)}의 체력을 흡수했다!`);
    } else if (e?.kind === 'recoil') {
      m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(maxHp(m) / 4)));
      await animHp(user);
      await say(`${j(L(user), '은/는')} 반동으로 데미지를 입었다!`);
    } else if (e && (e.kind === 'status' || e.kind === 'stat') && e.chance && Math.random() * 100 < e.chance) {
      await applyEffect(e, user, target, false);
    }
  }

  async function gainExp(m: Mon, amount: number) {
    const active = m === me.mon;
    const n = monName(m);
    await say(`${j(n, '은/는')} ${amount} 경험치를 얻었다!`);
    m.exp += amount;
    while (m.level < 100 && m.exp >= expFor(m.level + 1)) {
      if (active) {
        const from = v.pExp;
        await tween(20, (p) => (v.pExp = from + (1 - from) * p));
      }
      const oldMax = maxHp(m);
      m.level++;
      if (m.hp > 0) m.hp += maxHp(m) - oldMax;
      if (active) {
        v.pExp = 0;
        v.pHp = m.hp;
      }
      await say(`${j(n, '은/는')} 레벨 ${j(String(m.level), '으로/로')} 올랐다!`);
      for (const id of movesLearnedAt(m.species, m.level)) await learnMove(m, id);
      const evo = SPECIES[m.species].evolve;
      if (evo && m.level >= evo.level) m.pendingEvo = true;
    }
    if (active) {
      const from = v.pExp;
      const to = expRatio(m);
      await tween(20, (p) => (v.pExp = from + (to - from) * p));
    }
  }

  async function handleFaints(): Promise<BattleResult | null> {
    if (enemy.mon.hp <= 0 && v.eVis) {
      await faintAnim(enemy);
      await say(`${j(L(enemy), '은/는')} 쓰러졌다!`);
      const sp = SPECIES[enemy.mon.species];
      const exp = Math.max(1, Math.floor(((sp.baseExp * enemy.mon.level) / 7) * (wild ? 1 : 1.5)));
      for (const m of game.party) if (m.hp > 0 && participants.has(m)) await gainExp(m, exp);
      participants = new Set(me.mon.hp > 0 ? [me.mon] : []);
      if (!wild && enemyIdx + 1 < o.enemies.length) {
        enemyIdx++;
        enemy = new BMon(o.enemies[enemyIdx], 'foe');
        await say(`${j(trName, '은/는')} ${j(monName(enemy.mon), '을/를')} 내보냈다!`);
        v.eScale = 0;
        await popEnemy();
      } else {
        if (!wild) {
          v.trainer = tr!.pal;
          v.tX = 110;
          await tween(18, (p) => (v.tX = 110 * (1 - p)));
          await say(`${j(trName, '과/와')}의 승부에서 이겼다!`);
          await say(`${tr!.name}: ${tr!.defeat}`);
          game.money += tr!.reward;
          await say(`{name}은(는) 상금으로 ${tr!.reward.toLocaleString()}원을 받았다!`);
        }
        return 'win';
      }
    }
    if (me.mon.hp <= 0 && v.pVis) {
      await faintAnim(me);
      await say(`${j(monName(me.mon), '은/는')} 쓰러졌다!`);
      participants.delete(me.mon);
      if (!game.party.some((m) => m.hp > 0)) {
        await say('{name}에게는 싸울 수 있는 몬스터가 없다!');
        await say('{name}은(는) 눈앞이 캄캄해졌다…');
        return 'lose';
      }
      const i = await pickPartyMember('다음은 누구를 내보낼까요?', (m) => (m.hp <= 0 ? '기운이 없어서 싸울 수 없다!' : null), false);
      me = new BMon(game.party[i], 'me');
      participants.add(me.mon);
      await sendOutMe();
    }
    return null;
  }

  // --- capture ---
  async function throwBall(mul: number): Promise<boolean> {
    v.ball = { x: 40, y: 130, vis: true, rot: 0 };
    await tween(24, (p) => {
      v.ball.x = 40 + (184 - 40) * p;
      v.ball.y = 130 + (44 - 130) * p - Math.sin(p * Math.PI) * 50;
      v.ball.rot = p * 12;
    });
    v.ball.rot = 0;
    await tween(10, (p) => (v.eScale = 1 - p));
    v.eVis = false;
    await tween(10, (p) => (v.ball.y = 44 + 28 * p));
    const m = enemy.mon;
    const mh = maxHp(m);
    const bonus = m.status === 'slp' ? 2 : m.status ? 1.5 : 1;
    const a = (((3 * mh - 2 * m.hp) * SPECIES[m.species].catchRate * mul) / (3 * mh)) * bonus;
    const p = Math.min(1, a / 255);
    const each = Math.pow(p, 1 / 4);
    let shakes = 0;
    while (shakes < 4 && Math.random() < each) shakes++;
    for (let i = 0; i < Math.min(3, shakes); i++) {
      await wait(14);
      await tween(14, (t) => (v.ball.rot = Math.sin(t * Math.PI * 2) * 0.5));
    }
    await wait(10);
    if (shakes >= 4) return true;
    v.ball.vis = false;
    v.eVis = true;
    await tween(10, (t) => (v.eScale = t));
    await say(['앗! 몬스터가 포획구에서 나와 버렸다!', '아깝다! 잡은 줄 알았는데!', '아아! 조금만 더 하면 됐는데!', '으악! 거의 잡았는데!'][Math.min(3, shakes)]);
    return false;
  }

  // --- player action selection ---
  type Act = { kind: 'move'; slot: number | null } | { kind: 'turn' } | { kind: 'end'; result: BattleResult };

  async function battleBag(): Promise<Act | null> {
    const bv = new BagView((id) => ITEMS[id].kind !== 'key');
    ui.run(bv);
    const id = await bv.promise;
    bv.close();
    if (!id) return null;
    const it = ITEMS[id];
    if (it.kind === 'ball') {
      if (!wild) {
        await say('트레이너의 몬스터는 잡을 수 없어!');
        return null;
      }
      if (game.party.length >= 6 && game.box.length >= 60) {
        await say('보관함이 가득 차서 더 잡을 수 없다!');
        return null;
      }
      removeItem(id);
      await say(`{name}은(는) ${j(it.name, '을/를')} 던졌다!`);
      if (await throwBall(it.ballMul ?? 1)) {
        const n = monName(enemy.mon);
        await say(`신난다! ${j(n, '을/를')} 잡았다!`);
        const isNew = markCaught(enemy.mon.species);
        if (isNew) await say(`${n}의 정보가 도감에 새로 기록되었다!`);
        enemy.mon.pendingEvo = false;
        if (addMon(enemy.mon) === 'box') await say(`동료가 가득 차서 ${j(n, '은/는')} 보관함으로 보내졌다.`);
        return { kind: 'end', result: 'caught' };
      }
      return { kind: 'turn' };
    }
    const i = await pickPartyMember(`누구에게 ${j(it.name, '을/를')} 쓸까요?`);
    if (i < 0) return null;
    const used = await useItemOn(id, game.party[i]);
    if (!used) return null;
    if (game.party[i] === me.mon) await animHp(me);
    return { kind: 'turn' };
  }

  async function chooseAction(): Promise<Act> {
    for (;;) {
      const msg = new MessageBox(`${j(monName(me.mon), '은/는')}\n무엇을 할까?`, { persist: true, instant: true });
      ui.run(msg);
      await msg.promise;
      const a = await ui.run(new Menu({ items: ['싸운다', '가방', '동료', '도망'], cols: 2, x: 132, y: 144, w: 124, h: 48, index: lastAction }));
      msg.close();
      lastAction = a;
      if (a === 0) {
        if (!me.mon.moves.some((s) => s.pp > 0)) {
          await say(`${j(monName(me.mon), '은/는')} 쓸 수 있는 기술이 없다!`);
          return { kind: 'move', slot: null };
        }
        const s = await ui.run(new MoveMenu(me.mon));
        if (s < 0) continue;
        if (me.mon.moves[s].pp <= 0) {
          await say('그 기술은 남은 PP가 없다!');
          continue;
        }
        return { kind: 'move', slot: s };
      }
      if (a === 1) {
        const r = await battleBag();
        if (r) return r;
        continue;
      }
      if (a === 2) {
        const i = await pickPartyMember('누구와 교체할까요?', (m) =>
          m.hp <= 0 ? '기운이 없어서 싸울 수 없다!' : m === me.mon ? `${j(monName(m), '은/는')} 이미 싸우고 있다!` : null,
        );
        if (i < 0) continue;
        await say(`돌아와, ${monName(me.mon)}!`);
        await tween(12, (p) => (v.pX = -130 * p));
        v.pVis = false;
        v.pBox = false;
        me = new BMon(game.party[i], 'me');
        participants.add(me.mon);
        await sendOutMe();
        return { kind: 'turn' };
      }
      if (!wild) {
        await say('안 돼! 트레이너와의 승부에서는 도망칠 수 없다!');
        continue;
      }
      runAttempts++;
      const ok = stat(me, 'spe') >= stat(enemy, 'spe') || Math.random() < 0.35 + runAttempts * 0.15;
      if (ok) {
        await say('무사히 도망쳤다!');
        return { kind: 'end', result: 'run' };
      }
      await say('도망칠 수 없었다!');
      return { kind: 'turn' };
    }
  }

  function enemyChoice(): number | null {
    const usable = enemy.mon.moves.map((s, i) => ({ s, i })).filter((x) => x.s.pp > 0);
    if (!usable.length) return null;
    if (wild || Math.random() < 0.25) return pick(usable).i;
    let best = usable[0].i;
    let score = -1;
    for (const { s, i } of usable) {
      const mv = MOVES[s.id];
      let sc: number;
      if (mv.power > 0) {
        sc = mv.power * effectiveness(mv.type, SPECIES[me.mon.species].types) * (SPECIES[enemy.mon.species].types.includes(mv.type) ? 1.5 : 1) * (mv.acc || 100) / 100;
      } else if (mv.effect?.kind === 'status') sc = me.mon.status ? 0 : 50;
      else if (mv.effect?.kind === 'heal') sc = enemy.mon.hp < maxHp(enemy.mon) / 2 ? 70 : 0;
      else sc = 25;
      sc *= 0.85 + Math.random() * 0.3;
      if (sc > score) {
        score = sc;
        best = i;
      }
    }
    return best;
  }

  // --- main loop ---
  let result: BattleResult | null = null;
  while (!result) {
    const act = await chooseAction();
    if (act.kind === 'end') {
      result = act.result;
      break;
    }
    const foeSlot = enemyChoice();
    const meB = me;
    const foeB = enemy;
    let order: ('me' | 'foe')[] = ['foe'];
    if (act.kind === 'move') {
      const pm = act.slot === null ? MOVES.struggle : MOVES[me.mon.moves[act.slot].id];
      const fm = foeSlot === null ? MOVES.struggle : MOVES[enemy.mon.moves[foeSlot].id];
      const pp = pm.priority ?? 0;
      const fp = fm.priority ?? 0;
      const ps = stat(me, 'spe');
      const fs = stat(enemy, 'spe');
      const meFirst = pp !== fp ? pp > fp : ps !== fs ? ps > fs : Math.random() < 0.5;
      order = meFirst ? ['me', 'foe'] : ['foe', 'me'];
    }
    for (const who of order) {
      const u = who === 'me' ? meB : foeB;
      const t = who === 'me' ? foeB : meB;
      if (u !== (who === 'me' ? me : enemy) || t !== (who === 'me' ? enemy : me)) continue;
      if (u.mon.hp <= 0 || t.mon.hp <= 0) continue;
      await doMove(u, t, who === 'me' ? (act as { slot: number | null }).slot : foeSlot);
      result = await handleFaints();
      if (result) break;
    }
    if (result) break;
    for (const b of [me, enemy]) {
      const m = b.mon;
      if (m.hp <= 0 || (m.status !== 'brn' && m.status !== 'psn')) continue;
      m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(maxHp(m) / (m.status === 'brn' ? 16 : 8))));
      await animHp(b);
      await say(`${j(L(b), '은/는')} ${m.status === 'brn' ? '화상' : '독'} 데미지를 입었다!`);
      result = await handleFaints();
      if (result) break;
    }
  }

  await fadeTo(1, 16);
  return result;
}
