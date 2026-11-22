import { say, choose } from '../engine/ui';
import { wait } from '../engine/timing';
import { flashes } from '../engine/scene';
import { sfx, jingle } from '../engine/audio';
import { game, itemCount, removeItem } from './state';
import { world, giveItem } from './api';

// ---------------------------------------------------------------------------
// 5장 「불꽃산의 심장」: the hideout spans the outer caverns, the forge (cooling-valve
// puzzle) and the volcano's heart. Diary pages tell 흑영's story; the old photo
// found in the forge changes the ending of the boss fight.

const f = (k: string) => !!game.flags[k];

// --- forge cooling valves -----------------------------------------------------
// Three lava channels cross the forge (C bottom, B middle, A top). Each valve flips
// the channels it is piped to; a channel is solid (walkable) while it is cooled.
//   valve 1 → C        valve 2 → C, B        valve 3 (on the island) → B, A
// Solution: valve 1 (cross C), then valve 3 on the island (cools B and A).
const V = (i: number) => f('vv' + i);
export const channelCool = {
  C: () => V(1) !== V(2),
  B: () => V(2) !== V(3),
  A: () => V(3),
};

export async function forgeValve(i: number) {
  await say(`${i}번 냉각수 밸브다. 녹슨 손잡이가 뜨겁게 달아올라 있다.`);
  if ((await choose('밸브를 돌릴까?', ['돌린다', '그만둔다'])) !== 0) return;
  game.flags['vv' + i] = !V(i);
  sfx('door');
  await say('끼이익…  쉬이이익——!');
  world.refreshNPCs();
  const st = (k: 'A' | 'B' | 'C', name: string) => `${name}: ${channelCool[k]() ? '식어서 굳었다' : '펄펄 끓는다'}`;
  await say(`증기 속으로 수로들이 보인다.\n${st('C', '아래 수로')} · ${st('B', '가운데 수로')} · ${st('A', '위 수로')}`);
}

export async function forgeSchematic() {
  await say('벽에 냉각수 계통도가 붙어 있다. 절반쯤 불에 그을렸다.');
  await say('「1번 밸브 — 아래 수로」\n「2번 밸브 — 아래 수로, ▒▒▒ 수로」');
  await say('「3번 밸브 — 가운데 수로, ▒▒ 수로」\n「※ 밸브는 돌릴 때마다 수로를 식히거나 다시 데운다.」');
}

// --- story pages --------------------------------------------------------------

export async function volcanoNote1() {
  game.flags.vnote1 = true;
  await say('바닥에 검은안개단 단원의 수첩이 떨어져 있다.');
  await say('「작전명: 심장 봉인.\n 별빛결정을 화산의 심장에 꽂아, 불꽃산을 영원히 잠재운다.」');
  await say('「두목님 특별 지시: 작전 전에 산의 몬스터들을 모두 대피시킬 것.\n 한 마리도 다치게 하지 마라.」');
  await say('…악당의 작전 지시서치고는 이상하다.');
}

export async function volcanoNote2() {
  game.flags.vnote2 = true;
  await say('불에 그을린 일기장이 놓여 있다. 표지에 「흑영」이라고 적혀 있다.');
  await say('「십 년 전 오늘. 산 너머 숯골 마을이 하룻밤 사이에 용암에 잠겼다.\n 연기 속에서 동생의 손을 놓쳤다.」');
  await say('「사람들은 화산이 노했다고 했다. 나는 그 말이 싫었다.\n 산이 화를 낸다면, 화를 낼 수 없게 만들면 된다.」');
}

export async function volcanoNote3() {
  game.flags.vnote3 = true;
  await say('일기장의 마지막 장이 바위틈에 끼어 있다.');
  await say('「결정이 심장에 닿으면, 이 산은 다시는 불을 뿜지 못한다.\n 대신 산에 사는 것들도 온기를 잃겠지.」');
  await say('「…그래도 괜찮다. 다시는 누구도 잃지 않을 수 있다면.」');
  if (!f('gotPhoto')) {
    game.flags.gotPhoto = true;
    await say('일기장 사이에서 낡은 사진 한 장이 떨어졌다.');
    await giveItem('oldphoto', 1, true);
  }
}

// --- the boss and the photo ---------------------------------------------------

/** Extra lines after the boss fight when the player found the old photo. */
export async function photoEpilogue() {
  if (!itemCount('oldphoto')) return;
  await say('…가방 속 낡은 사진이 눈에 밟힌다. 흑영에게 사진을 건넸다.');
  removeItem('oldphoto');
  game.flags.photoReturned = true;
  await flashes(1);
  await say('사진 속에는 숯골 마을 앞에서 웃고 있는 소년과 어린 여자아이,\n그리고 아기 모닥뿔 한 마리가 있다.');
  await say('흑영: …이걸, 어디서. 그날 다 타 버린 줄 알았는데.');
  await say('흑영: 동생은 불을 무서워하지 않았다. 모닥뿔을 안고서\n「오빠, 불은 따뜻한 거야」라고 했었지.');
  await wait(10);
  await say('흑영: 나는 산을 잠재우는 대신… 숯골에 다시 불을 지펴야겠다.\n사람과 몬스터가 함께 쬘 수 있는 따뜻한 불을.');
  await say('흑영: 고맙다, {name}. 이건… 이 산에서 주운 돌이다. 너라면 잘 쓰겠지.');
  jingle('item');
  await giveItem('firestone', 1);
}

// --- after the battle ------------------------------------------------------------

/** 흑영's parting gift, left on the ledge that appears when the heart cools. */
export async function heartChest() {
  if (game.flags.heartChest) {
    await say('텅 빈 상자다. 바닥에 「고맙다」라고 새겨져 있다.');
    return;
  }
  game.flags.heartChest = true;
  world.refreshNPCs();
  sfx('door');
  await say('굳은 용암 위에 낡은 상자가 놓여 있다. 뚜껑에 쪽지가 붙어 있다.');
  await say('「검은안개단이 이 산에서 모은 것들이다. 이제는 필요 없지.\n 산이 다시 숨 쉬게 해 준 답례다. — 흑영」');
  await giveItem('hyperball', 5);
  await giveItem('pphoney', 2);
  await giveItem('maxrevive', 1);
}

/** Played right after the boss fight while still standing in the heart. */
export async function heartCalms() {
  sfx('thunder');
  await flashes(1);
  await say('쿠르르르… 화산의 심장이 마지막으로 크게 고동치더니,\n이글거리던 불빛이 천천히 가라앉는다.');
  await flashes(1);
  await say('심장을 둘러싼 용암이 식어 검은 바위로 굳었다.\n안쪽 바위턱으로 건너갈 수 있는 길이 생겼다!');
}
