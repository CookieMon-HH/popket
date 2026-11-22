import { say, choose } from '../engine/ui';
import { jingle } from '../engine/audio';
import { SPECIES } from '../data/species';
import type { MonType } from '../data/types';
import { game, itemCount, removeItem, addItem, badgeCount } from './state';
import { giveItem } from './api';

// ---------------------------------------------------------------------------
// Small side quests from townsfolk. Each NPC keeps its plain line for when there is
// nothing to do; `questReady` lights the "!" bubble over NPCs with something new.

const f = (k: string) => !!game.flags[k];
const set = (k: string) => { game.flags[k] = true; };
const hasType = (t: MonType) => game.party.some((m) => SPECIES[m.species]?.types.includes(t));
const hasSpecies = (id: string) => game.party.some((m) => m.species === id);

async function gifts(list: [string, number][]) {
  for (const [id, n] of list) await giveItem(id, n);
}

// --- 꽃다발 배달: 들꽃마을 꽃집 → 파도항구 등대지기 → 꽃집 ----------------------------

export async function floristTalk() {
  if (f('sq_bouquetDone')) {
    await say('꽃집 주인: 등대지기 할아버지가 올해도 꽃을 받으셨다니 다행이에요.\n봄 축제 때는 광장 분수 둘레가 꽃으로 가득 차요.');
    return;
  }
  if (itemCount('keeperletter')) {
    removeItem('keeperletter');
    set('sq_bouquetDone');
    await say('꽃집 주인: 등대지기 할아버지의 편지네요! …「올해도 고맙네.\n 바다가 조용한 건 자네 꽃 덕분일세.」');
    await say('꽃집 주인: 매년 엄마가 하던 심부름이었는데, 올해는 {name} 덕분에\n제때 꽃을 보낼 수 있었어요. 정말 고마워요!');
    await gifts([['pphoney', 1], ['fullrestore', 1]]);
    return;
  }
  if (itemCount('bouquet')) {
    await say('꽃집 주인: 꽃다발은 파도항구 등대 옆, 등대지기 할아버지 댁으로요!\n남쪽 4번 도로 절벽길을 내려가면 항구가 나와요.');
    return;
  }
  await say('꽃집 주인: 어서 오세요! 들꽃마을 꽃은 해솔 지방 최고랍니다.');
  if (!f('badge2')) return;
  await say('꽃집 주인: 저… 혹시 남쪽으로 여행 가세요? 매년 이맘때면\n파도항구 등대지기 할아버지께 하얀 들국화를 보내 드리거든요.');
  if ((await choose('꽃다발을 전해 줄까?', ['전해 준다', '다음에'])) !== 0) {
    await say('꽃집 주인: 괜찮아요. 혹시 마음 바뀌면 다시 들러 주세요!');
    return;
  }
  addItem('bouquet', 1);
  jingle('item');
  await say('{name}는 하얀 들국화 꽃다발을 받았다!');
}

export async function lighthouseTalk() {
  if (itemCount('bouquet')) {
    removeItem('bouquet');
    addItem('keeperletter', 1);
    await say('등대지기: 하얀 들국화… 들꽃마을 꽃집에서 왔구먼.');
    await say('등대지기: 은파호가 사라지던 밤, 내 동생도 그 배에 타고 있었지.\n꽃집 아가씨 어머니가 그 뒤로 해마다 이 꽃을 보내 준다네.');
    await say('등대지기: 고맙네, 젊은이. 답장을 써 두었으니 꽃집에 전해 주게.\n그리고 이건 수고비일세.');
    jingle('item');
    await say('{name}는 등대지기의 편지를 받았다!');
    await giveItem('hyperball', 3);
    return;
  }
  if (itemCount('keeperletter')) {
    await say('등대지기: 편지는 들꽃마을 꽃집 아가씨에게 부탁하네.');
    return;
  }
  await say('등대지기: 삼십 년째 저 등대 불을 지키고 있지.\n은파호가 사라지던 폭풍의 밤에도… 나는 불을 끄지 않았다네.');
}

// --- 대장간: 쇠 몬스터 보여 주기 ------------------------------------------------------

export async function smithTalk() {
  if (f('sq_smithDone')) {
    await say('대장장이: 네 강철 몬스터 덕분에 좋은 영감을 얻었지.\n화산의 열기로 쇠를 달구면 아주 단단해진다네.');
    return;
  }
  await say('대장장이: 화산의 열기로 쇠를 달구면 아주 단단해지지.\n…요즘 통 좋은 쇠를 못 봤어. 강철 몸을 가진 몬스터라도 한번 보고 싶구먼.');
  if (!hasType('강철')) {
    await say('대장장이: 강철 타입 몬스터를 데리고 오면 내 솜씨로 보답하지.');
    return;
  }
  set('sq_smithDone');
  await say('대장장이: 오오! 이 광택, 이 단단함! 좋은 몬스터를 데리고 다니는구먼.\n잠깐만… 땅, 땅, 땅!');
  await say('대장장이: 이걸 가져가게. 쇳물 데우다 생긴 귀한 것들이야.');
  await gifts([['maxrevive', 1], ['ppjar', 2]]);
}

// --- 어부: 은빛잉어 보여 주기 ---------------------------------------------------------

export async function oldFisherTalk() {
  if (f('sq_fisherDone')) {
    await say('늙은 어부: 은빛잉어를 다시 보다니, 오래 산 보람이 있구먼.\n물안개가 짙은 새벽엔 잉어가 수면 위로 뛰어오른다네.');
    return;
  }
  await say('늙은 어부: 물안개가 짙은 새벽에 호수 한가운데로 배를 띄우면\n은빛잉어가 수면 위로 뛰어오르는 걸 볼 수 있지.');
  if (!hasSpecies('eungeo')) {
    await say('늙은 어부: 죽기 전에 은빛잉어를 가까이서 한 번만 더 봤으면…\n반짝피라를 잘 키우면 은빛잉어가 된다던데.');
    return;
  }
  set('sq_fisherDone');
  await say('늙은 어부: …! 은빛잉어 아닌가! 이 지느러미 좀 보게.\n고맙네. 늙은이 소원을 들어줬으니 이걸 받게.');
  await gifts([['hyperball', 3], ['pphoney', 1]]);
}

// --- 천문대: 도감 기록 -------------------------------------------------------------

const DEX_GOALS: [number, string, [string, number][]][] = [
  [30, 'sq_dex30', [['superball', 5]]],
  [60, 'sq_dex60', [['hyperball', 5]]],
  [100, 'sq_dex100', [['maxrevive', 2], ['pphoney', 2]]],
];

export async function astronomerTalk() {
  const n = game.caught.length;
  const due = DEX_GOALS.filter(([need, flag]) => !f(flag) && n >= need);
  if (due.length) {
    await say(`천문학자: 별자리를 새로 찾듯 몬스터를 기록하고 있구먼! 벌써 ${n}종이라니.\n별을 세는 사람끼리 주는 선물일세.`);
    for (const [, flag, list] of due) { set(flag); await gifts(list); }
    return;
  }
  await say('천문학자: 별빛시라는 이름은 이 천문대에서 시작됐다네.\n밤마다 별빛동굴 위로 별똥별이 쏟아지는 걸 관측했거든.');
  const next = DEX_GOALS.find(([, flag]) => !f(flag));
  if (next) await say(`천문학자: 도감에 ${next[0]}종을 기록하면 다시 찾아오게. (지금 ${n}종)`);
}

// --- 마을회관 이장: 배지 축하 ---------------------------------------------------------

const BADGE_GOALS: [number, string, [string, number][], string][] = [
  [2, 'sq_chief2', [['superpotion', 5]], '벌써 배지가 두 개라니! 솔빛마을의 자랑일세.'],
  [4, 'sq_chief4', [['hyperpotion', 3], ['revive', 2]], '배지 넷! 마을 사람들이 다들 자네 얘기뿐이라네.'],
  [7, 'sq_chief7', [['fullrestore', 2], ['maxrevive', 1]], '배지 일곱 개를 모두 모았구먼! 이제 리그만 남았군.'],
];

export async function chiefTalk() {
  const due = BADGE_GOALS.filter(([need, flag]) => !f(flag) && badgeCount() >= need);
  if (due.length) {
    await say(`이장: 오, {name}! ${due[due.length - 1][3]}\n마을에서 모은 작은 선물이니 받아 주게.`);
    for (const [, flag, list] of due) { set(flag); await gifts(list); }
    return;
  }
  await say('이장: 솔빛마을 마을회관에 온 걸 환영하네.\n해솔 지방 여행은 1번 도로 북쪽에서 시작된다네.');
  const next = BADGE_GOALS.find(([, flag]) => !f(flag));
  if (next) await say(`이장: 배지를 ${next[0]}개 모으면 꼭 들러 주게. 마을에서 축하해 주고 싶으니.`);
}

// --- 서당 훈장: 상성 문답 -------------------------------------------------------------

const QUIZ: [string, string[], number][] = [
  ['물 기술은 어느 타입에 효과가 굉장한가?', ['풀', '불', '전기'], 1],
  ['땅 타입 몬스터에게 통하지 않는 기술은?', ['전기', '얼음', '물'], 0],
  ['드래곤 기술을 전혀 받지 않는 타입은?', ['강철', '페어리', '얼음'], 1],
];

export async function seodangTalk() {
  if (f('sq_quizDone')) {
    await say('훈장님: 상성을 아는 자는 승부를 아는 법. 잘 익혀 두었구나.\n천룡님은 여의주를 하늘에 띄워 비와 눈과 바람을 다스리셨지.');
    return;
  }
  await say('훈장님: 오늘은 천룡님 이야기를 배우겠다… 아니, 마침 잘 왔다.\n아이들 앞에서 문답 하나 해 보겠느냐? 세 문제를 모두 맞히면 상을 주마.');
  if ((await choose('문답에 응할까?', ['응한다', '다음에'])) !== 0) return;
  for (const [q, opts, ans] of QUIZ) {
    if ((await choose(`훈장님: ${q}`, opts)) !== ans) {
      await say('훈장님: 허허, 틀렸느니라. 체육관에서 상성을 다시 익히고 오너라.');
      return;
    }
    await say('훈장님: 옳거니!');
  }
  set('sq_quizDone');
  await say('훈장님: 세 문제 모두 맞혔구나! 학동들아, 이 트레이너를 본받거라.');
  await gifts([['pphoney', 2], ['fullrestore', 1]]);
}

// --- "!" bubbles ---------------------------------------------------------------------

export const questReady: Record<string, () => boolean> = {
  h2b_florist: () => !f('sq_bouquetDone') && (itemCount('keeperletter') > 0 || (f('badge2') && !itemCount('bouquet'))),
  h5a_keeper: () => itemCount('bouquet') > 0,
  h6a_smith: () => !f('sq_smithDone'),
  h3a_fisher: () => !f('sq_fisherDone') && hasSpecies('eungeo'),
  h4a_astro: () => DEX_GOALS.some(([need, flag]) => !f(flag) && game.caught.length >= need),
  h1b_chief: () => BADGE_GOALS.some(([need, flag]) => !f(flag) && badgeCount() >= need),
  h8b_teacher: () => !f('sq_quizDone'),
};
