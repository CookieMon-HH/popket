import { W, H, drawSprite, type Ctx } from '../engine/draw';
import { ui, Backdrop, Menu, say, yesNo, choose } from '../engine/ui';
import { wait, tween } from '../engine/timing';
import { scenes, fadeTo, flashes, fx } from '../engine/scene';
import { silhouette } from '../engine/pix';
import { SPECIES } from '../data/species';
import { ITEMS } from '../data/items';
import { world, type NPC } from './overworld';
import { game, runtime, addItem, saveGame, markCaught } from './state';
import { createMon, healMon, monName, maxHp, type Mon } from './monster';
import { runBattle, type BattleResult } from './battle';
import { monSprite } from './sprites';
import { partyMenu, bagMenu, DexView, TrainerCard, pickPartyMember, chooseStarter } from './menus';
import { learnMove, movesLearnedAt } from './learn';
import { OPP, j, rand } from './common';
import type { TrainerDef } from './maps';

export { world };

export function runScript(fn: () => Promise<void>) {
  runtime.busy++;
  fn()
    .catch((e) => console.error(e))
    .finally(() => runtime.busy--);
}

export async function healParty() {
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
  const name = ITEMS[id].name;
  const obj = n > 1 ? `${name} ${n}개를` : j(name, '을/를');
  await say(`{name}은(는) ${obj} ${found ? '찾았다' : '받았다'}!`);
}

export async function warpTo(to: string, x: number, y: number, dir: Parameters<typeof world.load>[3]) {
  await fadeTo(1, 10);
  world.load(to, x, y, dir);
  await wait(2);
  await fadeTo(0, 10);
}

// ---------------------------------------------------------------------------
// Battles

async function battle(opts: Parameters<typeof runBattle>[0]): Promise<BattleResult> {
  await flashes(3);
  await fadeTo(1, 14);
  const result = await runBattle(opts);
  scenes.current = world;
  if (result === 'lose') {
    await whiteout();
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
  const lost = Math.floor(game.money / 2);
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
  await battle({ kind: 'wild', enemies: [createMon(row[0], rand(row[1], row[2]))] });
}

async function trainerBattle(t: TrainerDef) {
  const res = await battle({
    kind: 'trainer',
    enemies: t.team.map(([s, lv]) => createMon(s, lv)),
    trainer: { cls: t.cls, name: t.name, reward: t.reward, defeat: t.defeat, pal: t.pal },
  });
  if (res === 'win') {
    game.flags['tr_' + t.id] = true;
    if (t.afterWin) await t.afterWin();
  }
}

export async function trainerSpotted(npc: NPC) {
  npc.bubble = 40;
  await wait(44);
  await world.approach(npc);
  const t = npc.def.trainer!;
  await say(`${t.name}: ${t.intro}`);
  await trainerBattle(t);
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
    drawSprite(ctx, st.white > 0 ? silhouette(spr, '#ffffff') : spr, W / 2 - 48, 26, 96, 96);
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

export async function momTalk() {
  if (!game.flags.gotStarter) {
    await say('엄마: {name}, 한별 박사님이 연구소로 와 달라고 하셨단다.\n연구소는 집을 나가서 오른쪽에 있어!');
    return;
  }
  await say('엄마: 어머, {name}! 피곤해 보이는구나.\n잠깐 쉬었다 가렴.');
  await healParty();
  setLastHeal('home', 6, 3);
  await say('엄마: 자, 다들 기운이 났지? 조심해서 다녀오렴!');
}

export async function labProfessor() {
  if (!game.flags.gotStarter) {
    await say('한별 박사: 오, {name}! 기다리고 있었단다.');
    await say('이 세상에는 몬스터라고 불리는 신비한 생물들이 살고 있지.\n사람과 몬스터는 서로 도우며 함께 살아간단다.');
    await say('내 앞의 캡슐에 몬스터 세 마리가 들어 있단다.\n마음에 드는 아이를 한 마리 골라 보렴!');
    const id = await chooseStarter(['modak', 'pong', 'saesun']);
    const mon = createMon(id, 5);
    game.party.push(mon);
    markCaught(id);
    game.flags.gotStarter = true;
    await say(`{name}은(는) 한별 박사에게서 ${j(SPECIES[id].name, '을/를')} 받았다!`);
    await say(`한별 박사: ${j(SPECIES[id].name, '은/는')} 벌써 너를 마음에 들어 하는 것 같구나!`);
    await say('한별 박사: 몬스터를 잡을 때 쓰는 포획구도 가져가렴.');
    await giveItem('ball', 5);
    await say('한별 박사: 북쪽 1번 도로를 지나면 들꽃마을이 나온단다.\n그곳 수련관의 관장에게 도전해 보렴!');
    await say('한별 박사: 지칠 땐 집에 들러 쉬거나 회복소를 찾아가렴.\nX 키로 메뉴를 열어 저장하는 것도 잊지 말고!');
    return;
  }
  if (!game.flags.badge1) {
    await say('한별 박사: 북쪽으로 가면 들꽃마을이 있단다.\n수련관의 관장 단단에게 도전해 보렴!');
    await say(`한별 박사: 지금까지 ${game.caught.length}종류의 몬스터를 잡았구나.\n도감을 채워 주면 연구에 큰 도움이 된단다!`);
    return;
  }
  await say('한별 박사: 바위배지를 받았다고? 정말 대단하구나, {name}!');
  await say(`한별 박사: 도감은 ${game.caught.length}/16종류까지 채웠구나.\n앞으로의 모험도 기대하고 있으마!`);
}

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
      const items = game.box.map((m) => `${monName(m)}  Lv${m.level}`);
      const k = await ui.run(new Menu({ items, cancel: true, x: 8, y: 8, maxRows: 7 }));
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
  if (ch === 'P') {
    if (world.map.id === 'center') await pcScript();
    else await say('연구 자료가 잔뜩 들어 있는 컴퓨터다.');
  } else if (ch === 'k') await say('책이 빼곡하게 꽂혀 있다.\n「몬스터와 친해지는 100가지 방법」…');
  else if (ch === 'c') await say(game.flags.gotStarter ? '빈 캡슐이다.' : '캡슐 안에 몬스터가 들어 있다!\n박사님께 말을 걸어 보자.');
  else if (ch === 'r') await say('바위처럼 단단한 마음을 새긴 조각상이다.');
  else if (ch === 'b') await say('포근한 침대다.');
}

export async function startMenu() {
  let idx = 0;
  for (;;) {
    const items = ['도감', '동료', '가방', game.name, '저장', '닫기'];
    idx = await ui.run(new Menu({ items, cancel: true, x: W - 80, y: 4, w: 76, index: idx }));
    if (idx < 0 || idx === 5) return;
    if (idx === 0) {
      if (!game.flags.gotStarter) await say('아직 도감을 받지 않았다.');
      else await ui.run(new DexView());
    } else if (idx === 1) await partyMenu();
    else if (idx === 2) await bagMenu();
    else if (idx === 3) await ui.run(new TrainerCard());
    else if (idx === 4) {
      if (await yesNo('지금까지의 모험을 기록할까요?')) {
        world.syncState();
        if (saveGame()) await say('{name}은(는) 모험을 기록했다!');
        else await say('기록하지 못했다… 브라우저 저장소를 확인해 주세요.');
      }
    }
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
    run: runScript,
  };
}

export { fx };
