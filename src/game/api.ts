import { W, H, drawSprite, type Ctx, OX, BW } from '../engine/draw';
import { ui, Backdrop, Menu, say, yesNo, choose } from '../engine/ui';
import { wait, tween, clock } from '../engine/timing';
import { scenes, fadeTo, flashes, fx } from '../engine/scene';
import { silhouette } from '../engine/pix';
import { SPECIES } from '../data/species';
import { ITEMS } from '../data/items';
import { world, type NPC } from './overworld';
import { game, runtime, addItem, saveGame, markCaught, addMon, itemCount, beatenAll, badgeCount } from './state';
import { createMon, healMon, monName, maxHp, type Mon } from './monster';
import { runBattle, type BattleResult } from './battle';
import { monSprite } from './sprites';
import { partyMenu, bagMenu, DexView, TrainerCard, pickPartyMember, BoxView } from './menus';
import { learnMove, movesLearnedAt } from './learn';
import { OPP, j, rand } from './common';
import type { TrainerDef } from './maps';
import { shrineTalk } from './story';
import { safariEnd, safariLevel } from './safari';
import { canFly, flyMenu } from './fly';
import { signedIn, uploadSave } from './cloud';
import { offerServerSave, accountMenu, accountLabel } from './account';
import { settings, setControls, setSound } from './settings';
import { playMusic, sfx, jingle } from '../engine/audio';
import { musicForMap, musicForBattle } from './music';

export { world };

/** Set by main.ts: returns to the title screen. */
export const appHooks = { toTitle: () => {} };

export function runScript(fn: () => Promise<void>) {
  runtime.busy++;
  fn()
    .catch((e) => console.error(e))
    .finally(() => {
      runtime.busy--;
      world.refreshNPCs();
    });
}

export async function healParty() {
  jingle('heal');
  await fadeTo(0.6, 10);
  for (const m of game.party) healMon(m);
  await wait(30);
  await fadeTo(0, 10);
}

export function setLastHeal(map: string, x: number, y: number) {
  game.lastHeal = { map, x, y };
}

export async function giveItem(id: string, n = 1, found = false) {
  addItem(id, n);
  jingle('item');
  const name = ITEMS[id].name;
  const obj = n > 1 ? `${name} ${n}개를` : j(name, '을/를');
  await say(`{name}은(는) ${obj} ${found ? '찾았다' : '받았다'}!`);
}

export async function warpTo(to: string, x: number, y: number, dir: Parameters<typeof world.load>[3]) {
  sfx('door');
  await fadeTo(1, 10);
  world.load(to, x, y, dir);
  await wait(2);
  await fadeTo(0, 10);
}

// ---------------------------------------------------------------------------
// Battles

async function battle(opts: Parameters<typeof runBattle>[0], canLose = false): Promise<BattleResult> {
  playMusic(musicForBattle(opts));
  sfx('encounter');
  await flashes(3);
  await fadeTo(1, 14);
  const result = await runBattle(opts);
  scenes.current = world;
  if (result !== 'lose') playMusic(musicForMap(world.map.id));
  if (result === 'lose') {
    if (canLose) {
      for (const m of game.party) healMon(m);
      await fadeTo(0, 12);
    } else await whiteout();
    return result;
  }
  for (const m of game.party) {
    if (m.pendingEvo) {
      m.pendingEvo = false;
      if (m.hp > 0) await evolve(m);
    }
  }
  await fadeTo(0, 12);
  return result;
}

async function whiteout() {
  jingle('lose');
  // A small penalty only: 10% of your money, capped by progress.
  const lost = Math.min(Math.floor(game.money / 10), 200 + badgeCount() * 100);
  game.safari = undefined; // fainting ends a safari visit
  game.money -= lost;
  for (const m of game.party) healMon(m);
  const h = game.lastHeal;
  world.load(h.map, h.x, h.y, 'down');
  await wait(20);
  await fadeTo(0, 20);
  if (lost > 0) await say(`허둥지둥 돌아오다가 ${lost.toLocaleString()}원을 잃어버렸다…`);
  await say('동료들은 푹 쉬고 기운을 되찾았다.\n다음에는 꼭 이기자!');
}

export async function randomEncounter(table: [string, number, number, number][]) {
  const total = table.reduce((s, r) => s + r[3], 0);
  let roll = Math.random() * total;
  let row = table[0];
  for (const r of table) {
    roll -= r[3];
    if (roll < 0) {
      row = r;
      break;
    }
  }
  // Safari monsters grow with the player's badges.
  const level = world.map.safari ? safariLevel() : rand(row[1], row[2]);
  await battle({ kind: 'wild', enemies: [createMon(row[0], level)] });
}

export async function trainerBattle(t: TrainerDef, canLose = false): Promise<BattleResult> {
  const res = await battle(
    {
      kind: 'trainer',
      enemies: t.team.map(([s, lv]) => {
        const m = createMon(s, lv);
        if (t.elite) {
          m.ivs = { hp: 15, atk: 15, def: 15, spe: 15 };
          m.hp = maxHp(m);
        }
        return m;
      }),
      trainer: { cls: t.cls, name: t.name, reward: t.reward, defeat: t.defeat, pal: t.pal, heals: t.heals },
      arena: t.arena,
    },
    canLose,
  );
  if (res === 'win') {
    game.flags['tr_' + t.id] = true;
    if (t.afterWin) await t.afterWin();
  }
  return res;
}

export async function wildBattle(mon: Mon): Promise<BattleResult> {
  return battle({ kind: 'wild', enemies: [mon] });
}

export async function giveMon(species: string, level: number) {
  const m = createMon(species, level);
  const isNew = markCaught(species);
  const where = addMon(m);
  const n = SPECIES[species].name;
  await say(`{name}은(는) ${j(n, '을/를')} 받았다!`);
  if (isNew) await say(`${n}의 정보가 도감에 새로 기록되었다!`);
  if (where === 'box') await say(`동료가 가득 차서 ${j(n, '은/는')} 보관함으로 보내졌다.`);
}

const DEFAULT_FISH: [string, number, number, number][] = [
  ['banjjak', 5, 12, 75],
  ['munu', 5, 10, 20],
  ['eungeo', 15, 17, 5],
];

async function fish() {
  const phase = (p: 'cast' | 'wait' | 'bite' | 'reel') => {
    world.fishing = { t0: clock.frame, phase: p };
  };
  try {
    phase('cast');
    await wait(24);
    phase('wait');
    await wait(rand(70, 160));
    if (Math.random() < 0.7) {
      phase('bite');
      await wait(28);
      await say('앗! 뭔가 걸렸다!');
      phase('reel');
      await wait(12);
      world.fishing = null;
      await randomEncounter(world.map.fishing ?? DEFAULT_FISH);
    } else {
      await say('…아무것도 걸리지 않았다.');
      phase('reel');
      await wait(12);
    }
  } finally {
    world.fishing = null;
  }
}

export async function trainerSpotted(npc: NPC) {
  npc.bubble = 40;
  await wait(44);
  await world.approach(npc);
  const t = npc.def.trainer!;
  await say(`${t.name}: ${t.intro}`);
  const res = await trainerBattle(t);
  if (res !== 'lose' && world.npcs.includes(npc)) await world.returnHome(npc);
}

export async function talkTo(npc: NPC) {
  const d = npc.def;
  if (d.item) {
    game.flags['item_' + d.id] = true;
    world.refreshNPCs();
    await giveItem(d.item.id, d.item.qty, true);
    return;
  }
  npc.dir = OPP[world.player.dir];
  if (!beatenAll(d.requires)) {
    await say(d.waitText ?? '…');
    return;
  }
  if (d.trainer) {
    const t = d.trainer;
    if (game.flags['tr_' + t.id]) await say(`${t.name}: ${t.after}`);
    else {
      if (!game.party.some((m) => m.hp > 0)) {
        await say(`${t.name}: 몬스터가 없잖아? 몬스터를 데려와서 다시 도전해!`);
        return;
      }
      await say(`${t.name}: ${t.intro}`);
      await trainerBattle(t);
    }
    return;
  }
  if (typeof d.talk === 'string') await say(d.talk);
  else if (d.talk) await d.talk();
}

// ---------------------------------------------------------------------------
// Evolution

async function evolve(m: Mon) {
  const from = SPECIES[m.species];
  const to = SPECIES[from.evolve!.to];
  const st = { showNew: false, white: 0, bg: 0 };
  const bd = new Backdrop((ctx: Ctx) => {
    ctx.fillStyle = '#1e2436';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,255,255,${st.bg})`;
    ctx.fillRect(0, 0, W, H);
    const spr = monSprite(st.showNew ? to.id : from.id);
    drawSprite(ctx, st.white > 0 ? silhouette(spr, '#ffffff') : spr, W / 2 - 60, 12, 120, 120);
  });
  ui.run(bd);
  await fadeTo(0, 12);
  const oldName = monName(m);
  await say(`어라…? ${oldName}의 모습이…!`);
  st.white = 1;
  for (let i = 0; i < 16; i++) {
    st.showNew = i % 2 === 1;
    await wait(Math.max(3, 22 - i * 1.3));
  }
  st.showNew = true;
  await tween(16, (p) => (st.bg = p));
  st.white = 0;
  const oldMax = maxHp(m);
  m.species = to.id;
  m.hp += maxHp(m) - oldMax;
  await tween(16, (p) => (st.bg = 1 - p));
  const isNew = markCaught(to.id);
  await say(`축하합니다! ${j(oldName, '은/는')} ${j(to.name, '으로/로')} 진화했다!`);
  if (isNew) await say(`${to.name}의 정보가 도감에 새로 기록되었다!`);
  for (const id of movesLearnedAt(to.id, m.level)) await learnMove(m, id);
  await fadeTo(1, 12);
  bd.close();
}

// ---------------------------------------------------------------------------
// Place scripts

export async function pcScript() {
  await say('{name}은(는) PC를 켰다.');
  for (;;) {
    const r = await choose('무엇을 할까요?', ['맡기기', '찾기', '그만두기']);
    if (r === 0) {
      if (game.party.length <= 1) {
        await say('마지막 남은 동료는 맡길 수 없다!');
        continue;
      }
      const i = await pickPartyMember('어느 몬스터를 맡길까요?');
      if (i < 0) continue;
      const [m] = game.party.splice(i, 1);
      game.box.push(m);
      await say(`${j(monName(m), '을/를')} 보관함에 맡겼다.`);
    } else if (r === 1) {
      if (!game.box.length) {
        await say('보관함에 맡긴 몬스터가 없다.');
        continue;
      }
      if (game.party.length >= 6) {
        await say('동료가 가득 차 있다! 먼저 한 마리를 맡겨 주세요.');
        continue;
      }
      const k = await ui.run(new BoxView(game.box, '보관함 — 데려올 몬스터를 고르세요'));
      if (k < 0) continue;
      const [m] = game.box.splice(k, 1);
      healMon(m);
      game.party.push(m);
      await say(`${j(monName(m), '을/를')} 데려왔다.`);
    } else {
      await say('PC를 껐다.');
      return;
    }
  }
}

export async function tileTalk(ch: string) {
  if (ch === '~') {
    if (itemCount('rod') > 0 && game.party.some((m) => m.hp > 0)) await fish();
    return;
  }
  if (ch === 'J') {
    await shrineTalk();
    return;
  }
  if (ch === 'm') await say('몬스터 회복 장치다.\n캡슐 여섯 개를 한꺼번에 회복시킬 수 있다.');
  else if (ch === 'Q') await say('회복소의 초록 십자 마크다.\n「몬스터의 건강을 책임집니다」');
  else if (ch === 'v') await say('잘 가꿔진 화분이다.');
  else if (ch === 's') await say('대기실 의자다. 차례를 기다리는 트레이너들이 앉는다.');
  else if (ch === 'y') await say('깨끗하게 정돈된 침대다.\n많이 다친 몬스터가 쉬어 가는 곳이다.');
  if ('mQvsy'.includes(ch)) return;
  if (ch === 'P') {
    if (world.map.id.startsWith('center')) await pcScript();
    else await say('연구 자료가 잔뜩 들어 있는 컴퓨터다.');
  } else if (ch === 'k') await say('책이 빼곡하게 꽂혀 있다.\n「몬스터와 친해지는 100가지 방법」…');
  else if (ch === 'c') await say(game.flags.gotStarter ? '빈 캡슐이다.' : '캡슐 안에 몬스터가 들어 있다!\n박사님께 말을 걸어 보자.');
  else if (ch === 'r') await say('바위처럼 단단한 마음을 새긴 조각상이다.');
  else if (ch === 'b') await say('포근한 침대다.');
}

/** Save to this browser and, when signed in, to the cloud too. */
async function saveWithMessage(): Promise<boolean> {
  world.syncState();
  if (!saveGame()) {
    await say('기록하지 못했다… 브라우저 저장소를 확인해 주세요.');
    return false;
  }
  if (signedIn()) {
    if (await uploadSave(game)) await say('{name}은(는) 모험을 기록했다!\n(서버에도 저장했어요)');
    else await say('{name}은(는) 모험을 기록했다!\n서버 저장은 실패했지만, 이 기기에는 저장되었어요.');
  } else {
    await say('{name}은(는) 모험을 기록했다!');
    await offerServerSave();
  }
  return true;
}

export async function startMenu() {
  let idx = 0;
  for (;;) {
    const items = ['도감', '동료', '가방', ...(canFly() ? ['날아가기'] : []), game.name, '저장', '설정', '그만하기', '닫기'];
    idx = await ui.run(new Menu({ items, cancel: true, x: OX + BW - 80, y: 2, w: 76, rowH: 15, index: idx }));
    const pick = items[idx];
    if (idx < 0 || pick === '닫기') return;
    if (pick === '날아가기') {
      if (await flyMenu()) return;
      continue;
    }
    if (pick === '설정') {
      await settingsMenu();
      continue;
    }
    if (pick === '그만하기') {
      const unsaved = game.frames - runtime.savedAt > 60;
      const r = await choose(
        unsaved ? '그만하기 전에 지금까지의 모험을 저장할까요?' : '타이틀 화면으로 돌아갈까요?',
        unsaved ? ['저장하고 그만하기', '저장하지 않고 그만하기', '취소'] : ['그만하기', '취소'],
      );
      const quit = unsaved ? r === 0 || r === 1 : r === 0;
      if (!quit) continue;
      if (unsaved && r === 0 && !(await saveWithMessage())) continue;
      appHooks.toTitle();
      return;
    }
    if (pick === '도감') {
      if (!game.flags.gotStarter) await say('아직 도감을 받지 않았다.');
      else await ui.run(new DexView());
    } else if (pick === '동료') await partyMenu();
    else if (pick === '가방') await bagMenu();
    else if (pick === game.name) await ui.run(new TrainerCard());
    else if (pick === '저장') {
      if (await yesNo('지금까지의 모험을 기록할까요?')) await saveWithMessage();
    }
  }
}

async function settingsMenu() {
  let i = 0;
  for (;;) {
    const label = settings.controls === 'dpad' ? '방향키' : '조이스틱';
    i = await ui.run(new Menu({ items: [`조작 방식: ${label}`, `소리: ${settings.sound === false ? '꺼짐' : '켜짐'}`, accountLabel(), '닫기'], cancel: true, x: OX + BW - 166, y: 40, w: 162, index: i }));
    if (i === 1) {
      setSound(settings.sound === false);
      continue;
    }
    if (i === 2) {
      await accountMenu();
      continue;
    }
    if (i !== 0) return;
    setControls(settings.controls === 'dpad' ? 'stick' : 'dpad');
    await say(settings.controls === 'dpad' ? '조작 방식을 방향키로 바꿨어요.' : '조작 방식을 조이스틱으로 바꿨어요.\n화면 왼쪽을 누르고 끌어서 움직여요.');
  }
}

export function installHooks() {
  world.hooks = {
    interact: talkTo,
    sign: (t) => say(t),
    tile: tileTalk,
    warp: warpTo,
    spotted: trainerSpotted,
    encounter: randomEncounter,
    menu: startMenu,
    safariEnd: () => safariEnd('time'),
    run: runScript,
  };
}

export { fx };
