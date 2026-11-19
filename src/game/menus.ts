import { W as SW, BW as W, OX, H, box, text, hpBar, panel, cursor, typeChip, drawSprite, wrap, centered, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { ui, Widget, Menu, MessageBox, say, yesNo } from '../engine/ui';
import { silhouette } from '../engine/pix';
import { SPECIES, SPECIES_LIST } from '../data/species';
import { MOVES, STATUS_LABEL } from '../data/moves';
import { ITEMS, ITEM_ORDER } from '../data/items';
import { TYPE_COLOR } from '../data/types';
import { game, itemCount, addItem, removeItem } from './state';
import { monName, maxHp, calcStats, expFor, expRatio, type Mon } from './monster';
import { monSprite } from './sprites';
import { j } from './common';

function statusTag(ctx: Ctx, m: Mon, x: number, y: number) {
  if (m.hp <= 0) return typeChip(ctx, '기절', '#606070', x, y);
  if (m.status) return typeChip(ctx, STATUS_LABEL[m.status].name, STATUS_LABEL[m.status].color, x, y);
  return 0;
}

// ---------------------------------------------------------------------------
// Party

export class PartyView extends Widget<number> {
  idx = 0;
  swapFrom = -1;

  constructor(public prompt: string, public cancel = true) {
    super();
  }

  update() {
    const n = game.party.length;
    if (input.repeat('up')) this.idx = (this.idx + n - 1) % n;
    if (input.repeat('down')) this.idx = (this.idx + 1) % n;
    if (input.pressed('a')) this.finish(this.idx, false);
    else if (input.pressed('b') && this.cancel) this.finish(-1, false);
  }

  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    panel(ctx, '#dfe8f4');
    game.party.forEach((m, i) => {
      const y = 4 + i * 26;
      const sel = i === this.idx && !this.done;
      ctx.beginPath();
      ctx.roundRect(4, y, W - 8, 24, 5);
      ctx.fillStyle = i === this.swapFrom ? '#ffe3a8' : sel ? '#ffffff' : m.hp <= 0 ? '#e6d0d4' : '#f2f6fc';
      ctx.fill();
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeStyle = sel ? '#e0605a' : '#9aabcc';
      ctx.stroke();
      drawSprite(ctx, monSprite(m.species), 3, y - 11, 40, 40);
      text(ctx, monName(m), 46, y + 2, { size: 10 });
      text(ctx, `Lv${m.level}`, 46, y + 13, { size: 8 });
      statusTag(ctx, m, 76, y + 12);
      const mh = maxHp(m);
      text(ctx, 'HP', 132, y + 3, { size: 8, color: '#e0605a', shadow: false });
      hpBar(ctx, 146, y + 6, 100, m.hp / mh);
      text(ctx, `${m.hp}/${mh}`, 246, y + 12, { size: 8, align: 'right' });
    });
    box(ctx, 0, 162, W, 30);
    text(ctx, this.prompt, 12, 170);
  }
}

/** Shows the party and returns the chosen index (-1 on cancel). `validate` returns an error message or null. */
export async function pickPartyMember(prompt: string, validate?: (m: Mon) => string | null, cancel = true): Promise<number> {
  const pv = new PartyView(prompt, cancel);
  ui.run(pv);
  for (;;) {
    const i = await pv.promise;
    if (i < 0) {
      pv.close();
      return -1;
    }
    const err = validate?.(game.party[i]);
    if (err) {
      await say(err);
      pv.rerun();
      continue;
    }
    pv.close();
    return i;
  }
}

export async function partyMenu() {
  if (!game.party.length) {
    await say('아직 함께하는 몬스터가 없다.');
    return;
  }
  const pv = new PartyView('몬스터를 선택하세요.');
  ui.run(pv);
  for (;;) {
    const i = await pv.promise;
    if (i < 0) break;
    const c = await ui.run(new Menu({ items: ['상태 보기', '순서 바꾸기', '닫기'], cancel: true, x: OX + W - 92, y: 100 }));
    if (c === 0) await ui.run(new SummaryView(i));
    else if (c === 1 && game.party.length > 1) {
      pv.swapFrom = i;
      pv.prompt = '어디로 옮길까요?';
      const k = await pv.rerun();
      if (k >= 0 && k !== i) [game.party[i], game.party[k]] = [game.party[k], game.party[i]];
      pv.swapFrom = -1;
      pv.prompt = '몬스터를 선택하세요.';
    }
    pv.rerun();
  }
  pv.close();
}

export class SummaryView extends Widget<void> {
  constructor(public idx: number) {
    super();
  }

  update() {
    const n = game.party.length;
    if (input.repeat('up')) this.idx = (this.idx + n - 1) % n;
    if (input.repeat('down')) this.idx = (this.idx + 1) % n;
    if (input.pressed('a') || input.pressed('b')) this.finish();
  }

  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    const m = game.party[this.idx];
    const sp = SPECIES[m.species];
    const st = calcStats(m);
    panel(ctx, '#f0ead8');
    ctx.fillStyle = '#d8ceb0';
    ctx.fillRect(0, 0, W, 22);
    text(ctx, `No.${String(sp.no).padStart(3, '0')}  ${sp.name}`, 8, 5);
    text(ctx, `Lv${m.level}`, W - 8, 5, { align: 'right' });
    ctx.beginPath();
    ctx.ellipse(44, 84, 34, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dccfa8';
    ctx.fill();
    drawSprite(ctx, monSprite(m.species), 4, 12, 80, 80);
    let x = 8;
    for (const t of sp.types) x += typeChip(ctx, t, TYPE_COLOR[t], x, 96) + 3;
    statusTag(ctx, m, x + 2, 96);

    const sx = 98;
    text(ctx, `HP`, sx, 30, { size: 10 });
    hpBar(ctx, sx + 26, 34, 100, m.hp / st.hp);
    text(ctx, `${m.hp} / ${st.hp}`, W - 10, 40, { size: 9, align: 'right' });
    const rows: [string, number][] = [['공격', st.atk], ['방어', st.def], ['스피드', st.spe]];
    rows.forEach(([k, v], i) => {
      text(ctx, k, sx, 54 + i * 13, { size: 10 });
      text(ctx, String(v), W - 10, 54 + i * 13, { size: 10, align: 'right' });
    });
    const toNext = m.level >= 100 ? 0 : expFor(m.level + 1) - m.exp;
    text(ctx, `다음 레벨까지 ${toNext}`, sx, 95, { size: 9 });
    ctx.fillStyle = '#3a3e52';
    ctx.fillRect(sx, 108, 148, 4);
    ctx.fillStyle = '#4ab0e8';
    ctx.fillRect(sx + 1, 109, 146 * expRatio(m), 2);

    box(ctx, 0, 116, W, 76);
    m.moves.forEach((s, i) => {
      const mv = MOVES[s.id];
      const y = 124 + i * 15;
      typeChip(ctx, mv.type, TYPE_COLOR[mv.type], 12, y + 1);
      text(ctx, mv.name, 50, y, { size: 10 });
      text(ctx, `PP ${s.pp}/${mv.pp}`, W - 14, y, { size: 10, align: 'right' });
    });
    text(ctx, '▲▼ 다른 몬스터', W - 14, 2 + 176, { size: 7, align: 'right', color: '#8a8ca0', shadow: false });
  }
}

// ---------------------------------------------------------------------------
// Bag

export class BagView extends Widget<string | null> {
  idx = 0;
  ids: string[] = [];

  constructor(public filter?: (id: string) => boolean) {
    super();
    this.refresh();
  }

  refresh() {
    this.ids = ITEM_ORDER.filter((id) => itemCount(id) > 0 && (!this.filter || this.filter(id)));
    this.idx = Math.min(this.idx, this.ids.length);
  }

  update() {
    const n = this.ids.length + 1;
    if (input.repeat('up')) this.idx = (this.idx + n - 1) % n;
    if (input.repeat('down')) this.idx = (this.idx + 1) % n;
    if (input.pressed('a')) this.finish(this.ids[this.idx] ?? null, false);
    else if (input.pressed('b')) this.finish(null, false);
  }

  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    panel(ctx, '#f4e6cc');
    ctx.fillStyle = '#c89a5a';
    ctx.fillRect(0, 0, W, 22);
    text(ctx, '가방', 10, 5, { color: '#ffffff', shadow: '#8a5a2a' });
    text(ctx, `${game.money.toLocaleString()}원`, W - 10, 5, { color: '#ffffff', shadow: '#8a5a2a', align: 'right' });
    box(ctx, 4, 26, W - 8, 120);
    const rows = [...this.ids, null];
    const start = Math.max(0, Math.min(this.idx - 3, rows.length - 7));
    rows.slice(start, start + 7).forEach((id, k) => {
      const i = start + k;
      const y = 34 + k * 15;
      text(ctx, id ? ITEMS[id].name : '닫기', 24, y);
      if (id) text(ctx, `×${itemCount(id)}`, W - 16, y, { align: 'right' });
      if (i === this.idx && !this.done) cursor(ctx, 13, y + 2);
    });
    box(ctx, 0, 148, W, 44);
    const cur = this.ids[this.idx];
    const lines = wrap(cur ? ITEMS[cur].desc : '가방을 닫는다.', W - 24, 10);
    lines.slice(0, 2).forEach((l, i) => text(ctx, l, 12, 157 + i * 15, { size: 10 }));
  }
}

/** Apply a healing/cure/revive item. Returns true when consumed. */
export async function useItemOn(id: string, m: Mon): Promise<boolean> {
  const it = ITEMS[id];
  const n = monName(m);
  const mh = maxHp(m);
  if (it.kind === 'heal') {
    if (m.hp <= 0) return say(`${j(n, '은/는')} 기절해서 효과가 없다…`).then(() => false);
    if (m.hp >= mh) return say('효과가 없을 것 같다.').then(() => false);
    const before = m.hp;
    m.hp = Math.min(mh, m.hp + (it.amount ?? 20));
    removeItem(id);
    await say(`${n}의 체력이 ${m.hp - before} 회복되었다!`);
    return true;
  }
  if (it.kind === 'full') {
    if (m.hp <= 0) return say(`${j(n, '은/는')} 기절해서 효과가 없다…`).then(() => false);
    if (m.hp >= mh && !m.status) return say('효과가 없을 것 같다.').then(() => false);
    m.hp = mh;
    m.status = null;
    m.sleep = 0;
    removeItem(id);
    await say(`${n}의 체력이 모두 회복되고 몸이 가뿐해졌다!`);
    return true;
  }
  if (it.kind === 'cure') {
    if (!m.status || m.hp <= 0) return say('효과가 없을 것 같다.').then(() => false);
    m.status = null;
    m.sleep = 0;
    removeItem(id);
    await say(`${n}의 상태 이상이 깨끗이 나았다!`);
    return true;
  }
  if (it.kind === 'revive') {
    if (m.hp > 0) return say('효과가 없을 것 같다.').then(() => false);
    m.hp = it.fullRevive ? mh : Math.floor(mh / 2);
    m.status = null;
    removeItem(id);
    await say(`${j(n, '이/가')} 기운을 되찾았다!`);
    return true;
  }
  await say('지금은 쓸 수 없다.');
  return false;
}

export async function bagMenu() {
  const bv = new BagView();
  ui.run(bv);
  for (;;) {
    const id = await bv.promise;
    if (!id) break;
    if (ITEMS[id].kind === 'key') {
      await say(ITEMS[id].desc);
    } else if (ITEMS[id].kind === 'ball') {
      await say('여기서는 쓸 수 없다. 야생 몬스터와 싸울 때 던지자!');
    } else if (!game.party.length) {
      await say('사용할 몬스터가 없다.');
    } else {
      const c = await ui.run(new Menu({ items: ['사용한다', '그만둔다'], cancel: true, x: OX + W - 90, y: 100 }));
      if (c === 0) {
        const i = await pickPartyMember(`누구에게 ${j(ITEMS[id].name, '을/를')} 쓸까요?`);
        if (i >= 0) await useItemOn(id, game.party[i]);
      }
    }
    bv.refresh();
    bv.rerun();
  }
  bv.close();
}

// ---------------------------------------------------------------------------
// Dex

export class DexView extends Widget<void> {
  idx = 0;

  update() {
    const n = SPECIES_LIST.length;
    if (input.repeat('up')) this.idx = (this.idx + n - 1) % n;
    if (input.repeat('down')) this.idx = (this.idx + 1) % n;
    if (input.pressed('b') || input.pressed('a')) this.finish();
  }

  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    panel(ctx, '#e04a4a');
    ctx.fillStyle = '#b8323a';
    ctx.fillRect(0, 0, W, 22);
    text(ctx, '몬스터 도감', 10, 5, { color: '#fff', shadow: '#7a1a20' });
    text(ctx, `발견 ${game.seen.length}  포획 ${game.caught.length}`, W - 10, 5, { color: '#fff', shadow: '#7a1a20', align: 'right' });

    box(ctx, 4, 26, 112, 162);
    const start = Math.max(0, Math.min(this.idx - 4, SPECIES_LIST.length - 10));
    SPECIES_LIST.slice(start, start + 10).forEach((sp, k) => {
      const i = start + k;
      const y = 33 + k * 15;
      const seen = game.seen.includes(sp.id);
      if (game.caught.includes(sp.id)) {
        ctx.fillStyle = '#3aa8a0';
        ctx.fillRect(16, y + 3, 5, 5);
      }
      text(ctx, String(sp.no).padStart(3, '0'), 25, y, { size: 9 });
      text(ctx, seen ? sp.name : '－－－', 50, y, { size: 10 });
      if (i === this.idx) cursor(ctx, 8, y + 1);
    });

    const sp = SPECIES_LIST[this.idx];
    const seen = game.seen.includes(sp.id);
    const caught = game.caught.includes(sp.id);
    box(ctx, 120, 26, 132, 162);
    ctx.fillStyle = '#e8f0f8';
    ctx.fillRect(126, 32, 120, 82);
    if (seen) {
      const spr = monSprite(sp.id);
      drawSprite(ctx, caught ? spr : silhouette(spr, '#4a5068'), 146, 33, 80, 80);
      text(ctx, sp.name, 128, 117);
      text(ctx, `${sp.kind} 몬스터`, 246, 119, { size: 8, align: 'right' });
    } else {
      text(ctx, '?', 186, 52, { size: 30, align: 'center', color: '#9aa4c0', shadow: false });
    }
    if (caught) {
      let x = 128;
      for (const t of sp.types) x += typeChip(ctx, t, TYPE_COLOR[t], x, 132) + 3;
      wrap(sp.desc, 118, 8).slice(0, 3).forEach((l, i) => text(ctx, l, 128, 147 + i * 11, { size: 8 }));
    } else if (seen) {
      text(ctx, '아직 잡지 못했다.', 128, 134, { size: 9 });
    }
  }
}

// ---------------------------------------------------------------------------
// Shop

class Quantity extends Widget<number> {
  n = 1;
  constructor(private price: number, private max: number) {
    super();
  }
  update() {
    const step = (d: number) => (this.n = Math.max(1, Math.min(this.max, this.n + d)));
    if (input.repeat('up')) step(1);
    if (input.repeat('down')) step(-1);
    if (input.repeat('right')) step(10);
    if (input.repeat('left')) step(-10);
    if (input.pressed('a')) this.finish(this.n);
    else if (input.pressed('b')) this.finish(0);
  }
  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    box(ctx, W - 124, 100, 120, 40);
    text(ctx, `× ${String(this.n).padStart(2, '0')}`, W - 112, 113);
    text(ctx, `${(this.n * this.price).toLocaleString()}원`, W - 14, 113, { align: 'right' });
  }
}

class ShopView extends Widget<number> {
  idx = 0;
  constructor(public stock: string[]) {
    super();
  }
  update() {
    const n = this.stock.length + 1;
    if (input.repeat('up')) this.idx = (this.idx + n - 1) % n;
    if (input.repeat('down')) this.idx = (this.idx + 1) % n;
    if (input.pressed('a')) this.finish(this.idx < this.stock.length ? this.idx : -1, false);
    else if (input.pressed('b')) this.finish(-1, false);
  }
  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    box(ctx, 4, 4, 100, 24);
    text(ctx, `${game.money.toLocaleString()}원`, 96, 10, { align: 'right' });
    const rows = [...this.stock, null];
    const VIS = 8;
    const vis = Math.min(VIS, rows.length);
    const start = Math.max(0, Math.min(this.idx - VIS + 2, rows.length - vis));
    box(ctx, 108, 4, 144, vis * 15 + 14);
    rows.slice(start, start + vis).forEach((id, k) => {
      const i = start + k;
      const y = 11 + k * 15;
      text(ctx, id ? ITEMS[id].name : '그만두기', 126, y);
      if (id) text(ctx, `${ITEMS[id].price}`, 244, y, { align: 'right' });
      if (i === this.idx && !this.done) cursor(ctx, 115, y + 2);
    });
    ctx.fillStyle = '#e04a5a';
    if (start > 0) ctx.fillRect(178, 6, 6, 2);
    if (start + vis < rows.length) ctx.fillRect(178, vis * 15 + 14, 6, 2);
    box(ctx, 0, 144, W, 48);
    const id = this.stock[this.idx];
    const lines = id ? [...wrap(ITEMS[id].desc, W - 24, 10).slice(0, 1), `가지고 있는 수: ${itemCount(id)}`] : ['또 오세요!'];
    lines.forEach((l, i) => text(ctx, l, 12, 153 + i * 16, { size: 10 }));
  }
}

/** Shop stock grows as the story progresses. Returns [stock, newest tier]. */
export function shopStock(): [string[], number] {
  const f = game.flags;
  const tiers = [
    ['ball', 'potion'],
    f.badge1 ? ['superball', 'superpotion', 'cure'] : [],
    f.badge2 ? ['revive', 'hyperpotion'] : [],
    f.badge3 ? ['hyperball', 'fullrestore'] : [],
    f.ending ? ['maxrevive'] : [],
  ];
  const tier = tiers.reduce((t, list, i) => (list.length ? i : t), 0);
  const ids = new Set(tiers.flat());
  return [ITEM_ORDER.filter((id) => ids.has(id)), tier];
}

export async function shopMenu() {
  const [stock, tier] = shopStock();
  const seen = Object.keys(game.flags).filter((k) => k.startsWith('shopTier') && game.flags[k]).length;
  if (tier > 0 && !game.flags['shopTier' + tier]) {
    for (let t = 1; t <= tier; t++) game.flags['shopTier' + t] = true;
    await say(seen < tier ? '어서 오세요! 마침 새로운 물건이 들어왔어요.\n천천히 구경하세요!' : '어서 오세요! 필요한 물건이 있으신가요?');
  } else await say('어서 오세요! 필요한 물건이 있으신가요?');
  const sv = new ShopView(stock);
  ui.run(sv);
  for (;;) {
    const i = await sv.promise;
    if (i < 0) break;
    const it = ITEMS[stock[i]];
    const max = Math.min(99 - itemCount(it.id), Math.floor(game.money / it.price));
    if (max <= 0) {
      await say(game.money < it.price ? '돈이 모자라요!' : '더 이상 가질 수 없어요.');
    } else {
      const n = await ui.run(new Quantity(it.price, max));
      if (n > 0 && (await yesNo(`${it.name} ${n}개, ${(it.price * n).toLocaleString()}원입니다.\n구입하시겠어요?`))) {
        game.money -= it.price * n;
        addItem(it.id, n);
        await say('감사합니다!');
        if (it.kind === 'ball' && n >= 10) {
          addItem('superball', 1);
          await say('많이 사 주셔서 슈퍼팜팜볼 하나를 덤으로 드릴게요!');
        }
      }
    }
    sv.rerun();
  }
  sv.close();
  await say('또 오세요!');
}

// ---------------------------------------------------------------------------
// Starter select

export class StarterView extends Widget<number> {
  idx = 1;
  constructor(public ids: string[]) {
    super();
  }
  update() {
    if (input.repeat('left')) this.idx = (this.idx + 2) % 3;
    if (input.repeat('right')) this.idx = (this.idx + 1) % 3;
    if (input.pressed('a')) this.finish(this.idx, false);
  }
  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    ctx.fillStyle = 'rgba(20,24,40,0.55)';
    ctx.fillRect(-OX, 0, SW, H);
    box(ctx, 6, 4, W - 12, 136);
    text(ctx, '함께 모험할 몬스터를 골라 주세요', W / 2, 11, { align: 'center' });
    this.ids.forEach((id, i) => {
      const sp = SPECIES[id];
      const cx = 48 + i * 80;
      const sel = i === this.idx;
      ctx.beginPath();
      ctx.roundRect(cx - 38, 26, 76, 108, 6);
      ctx.fillStyle = sel ? '#fff4d8' : '#eef2fa';
      ctx.fill();
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeStyle = sel ? '#e0605a' : '#b0bcd8';
      ctx.stroke();
      const bob = sel ? Math.round(Math.sin(performance.now() / 160) * 2) : 0;
      drawSprite(ctx, monSprite(id), cx - 40, 24 + bob, 80, 80);
      text(ctx, sp.name, cx, 104, { align: 'center', size: 10 });
      const t = sp.types[0];
      typeChip(ctx, t, TYPE_COLOR[t], cx - 10, 119);
    });
  }
}

export async function chooseStarter(ids: string[]): Promise<string> {
  const v = new StarterView(ids);
  ui.run(v);
  for (;;) {
    const i = await v.promise;
    const sp = SPECIES[ids[i]];
    if (await yesNo(`${sp.types[0]} 타입의 ${sp.name}!\n${j(sp.name, '으로/로')} 할까?`)) {
      v.close();
      return sp.id;
    }
    v.rerun();
  }
}

// ---------------------------------------------------------------------------

export class TrainerCard extends Widget<void> {
  update() {
    if (input.pressed('a') || input.pressed('b')) this.finish();
  }
  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    panel(ctx, '#d8e4f4');
    box(ctx, 16, 20, W - 32, 140);
    text(ctx, '트레이너 카드', W / 2, 30, { align: 'center' });
    const secs = Math.floor(game.frames / 60);
    const rows: [string, string][] = [
      ['이름', game.name],
      ['소지금', `${game.money.toLocaleString()}원`],
      ['도감', `${game.caught.length}마리 포획 / ${game.seen.length}마리 발견`],
      ['플레이 시간', `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}`],
      ['배지', `${['badge1', 'badge2', 'badge3', 'badge4', 'badge5'].filter((b) => game.flags[b]).length}개 / 5개${game.flags.champion ? '  ★챔피언' : ''}`],
    ];
    rows.forEach(([k, v], i) => {
      text(ctx, k, 32, 54 + i * 19, { size: 10, color: '#5a6080' });
      text(ctx, v, W - 32, 54 + i * 19, { size: 10, align: 'right' });
    });
  }
}

export { MessageBox };
