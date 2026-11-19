import { say, yesNo } from '../engine/ui';
import { wait } from '../engine/timing';
import { fadeTo, flashes } from '../engine/scene';
import { SPECIES, SPECIES_LIST } from '../data/species';
import { game, markCaught, itemCount, removeItem } from './state';
import { createMon } from './monster';
import { j } from './common';
import { world, healParty, setLastHeal, giveItem, giveMon, trainerBattle, wildBattle } from './api';
import { chooseStarter } from './menus';
import type { NPC } from './overworld';
import type { Pal } from './sprites';
import type { TrainerDef } from './maps';

export const PAL = {
  mom: { hair: '#7a4a2a', shirt: '#f0a0b0', pants: '#6a6aa0' },
  prof: { hair: '#c8c8d0', shirt: '#f4f4f8', pants: '#6a5a48' },
  aide: { hair: '#3a3040', shirt: '#7ac8e0', pants: '#404860' },
  rival: { hair: '#d05a2a', shirt: '#4a5ad0', pants: '#2a2a3a' },
  girl: { hair: '#6a3a2a', shirt: '#f080a0', pants: '#5060a0' },
  oldman: { hair: '#e0e0e0', shirt: '#8a9a6a', pants: '#5a4a3a' },
  granny: { hair: '#f0f0f0', shirt: '#8a6a9a', pants: '#5a4a5a' },
  bugkid: { hair: '#303030', shirt: '#60b060', pants: '#a07040', hat: '#f0d040' },
  picnic: { hair: '#e0a040', shirt: '#ffffff', pants: '#e07070' },
  hiker: { hair: '#4a3020', shirt: '#b06a30', pants: '#5a6a40', hat: '#7a5a3a' },
  man: { hair: '#2a2a3a', shirt: '#5a8ad0', pants: '#3a3a4a' },
  nurse: { hair: '#4a3a3a', shirt: '#ffffff', pants: '#5aa898', hat: '#ffffff' },
  clerk: { hair: '#3a2a20', shirt: '#4ab0a0', pants: '#3a4a5a' },
  kid: { hair: '#2a2a2a', shirt: '#f0c040', pants: '#4a6ab0' },
  lady: { hair: '#a05a3a', shirt: '#b0d0f0', pants: '#7a5a8a' },
  pupil: { hair: '#2a2a2a', shirt: '#f0f0f0', pants: '#3a3a3a' },
  leader: { hair: '#5a5a64', shirt: '#8a6a4a', pants: '#3a3a44' },
  birder: { hair: '#5a3a1a', shirt: '#7aa04a', pants: '#6a5a3a', hat: '#c8a050' },
  fisher: { hair: '#3a3a3a', shirt: '#4a7ab0', pants: '#3a4a3a', hat: '#e8d070' },
  swimmer: { hair: '#2a4a8a', shirt: '#38b0e0', pants: '#2a6ab0' },
  maru: { hair: '#2a6ab0', shirt: '#e8f4ff', pants: '#2a4a7a' },
  engineer: { hair: '#4a3a2a', shirt: '#e8a030', pants: '#4a4a5a', hat: '#f0d040' },
  haram: { hair: '#f0d040', shirt: '#3a3a5a', pants: '#2a2a3a' },
  guard: { hair: '#2a2a2a', shirt: '#4a6a4a', pants: '#3a3a3a', hat: '#4a6a4a' },
  grunt: { hair: '#2a2a30', shirt: '#2e2e3a', pants: '#1e1e28', hat: '#4a4a5a' },
  admin: { hair: '#c0c0c8', shirt: '#6a6a7a', pants: '#2a2a34' },
  boss: { hair: '#5a3a8a', shirt: '#1a1a24', pants: '#2a1a3a', hat: '#3a2a4a' },
} satisfies Record<string, Pal>;

// ---------------------------------------------------------------------------
// Rival

const LINES: Record<string, [string, string, string]> = {
  modak: ['modak', 'hwaro', 'hwasan'],
  pong: ['pong', 'mulbora', 'haeil'],
  saesun: ['saesun', 'kkot', 'supji'],
};
const COUNTER: Record<string, string> = { modak: 'pong', pong: 'saesun', saesun: 'modak' };

export function playerStarter(): string {
  for (const id of Object.keys(LINES)) if (game.flags['starter_' + id]) return id;
  for (const id of Object.keys(LINES)) if (game.caught.includes(id)) return id;
  return 'modak';
}

const rivalLine = () => LINES[COUNTER[playerStarter()]];

function rivalDef(stage: 1 | 2 | 3): TrainerDef {
  const line = rivalLine();
  const team: [string, number][] =
    stage === 1
      ? [[line[0], 5]]
      : stage === 2
        ? [['baramsae', 14], ['pojani', 13], [line[1], 16]]
        : [['hoeori', 28], ['nalgae', 27], ['jeolgu', 27], [line[1], 30]];
  return {
    id: 'rival' + stage,
    cls: '라이벌',
    name: '은재',
    pal: PAL.rival,
    team,
    reward: stage * 400,
    intro: '',
    defeat: ['쳇, 처음이라 봐준 거야!', '…역시 너 대단하다.', '최고의 승부였어. 인정할게!'][stage - 1],
    after: '',
  };
}

async function rivalBattle(stage: 1 | 2 | 3) {
  const res = await trainerBattle(rivalDef(stage), true);
  if (res === 'lose') {
    await say(['은재: 봤지? 내가 더 세다고!', '은재: 아직은 내가 한 수 위인걸!', '은재: 휴, 이번엔 내가 이겼네!'][stage - 1]);
  }
  game.flags['rival' + stage] = true;
}

/** Rival steps up to the player (used by map triggers). */
async function rivalApproach(id: string) {
  const n = world.npcs.find((x) => x.def.id === id);
  if (!n) return;
  n.bubble = 36;
  await wait(40);
  await world.approachAny(n);
}

// ---------------------------------------------------------------------------
// 솔빛마을

export async function momTalk() {
  if (!game.flags.gotStarter) {
    await say('엄마: {name}, 한별 박사님이 연구소로 와 달라고 하셨단다.\n연구소는 집을 나가서 오른쪽에 있어!');
    return;
  }
  await say('엄마: 어머, {name}! 피곤해 보이는구나.\n잠깐 쉬었다 가렴.');
  await healParty();
  setLastHeal('home', 6, 3);
  if (game.flags.badge3) await say('엄마: 세 번째 배지까지 모았다며? 우리 {name}, 정말 자랑스럽구나!');
  else if (game.flags.forestCleared) await say('엄마: 검은안개단이라는 무서운 사람들이 있다던데… 너무 무리하지 마렴.');
  else await say('엄마: 자, 다들 기운이 났지? 조심해서 다녀오렴!');
}

export async function rivalLabTalk() {
  await say('은재: {name}, 늦었잖아! 박사님이 우리한테 몬스터를 주신대.\n너부터 골라도 돼. 그다음에 내가 고를게!');
}

export async function labProfessor() {
  if (!game.flags.gotStarter) {
    await say('한별 박사: 오, {name}! 기다리고 있었단다.');
    await say('이 해솔 지방에는 몬스터라고 불리는 신비한 생물들이 살고 있지.\n사람과 몬스터는 서로 도우며 함께 살아간단다.');
    await say('내 앞의 캡슐에 몬스터 세 마리가 들어 있단다.\n마음에 드는 아이를 한 마리 골라 보렴!');
    const id = await chooseStarter(['modak', 'pong', 'saesun']);
    game.party.push(createMon(id, 5));
    markCaught(id);
    game.flags.gotStarter = true;
    game.flags['starter_' + id] = true;
    await say(`{name}은(는) 한별 박사에게서 ${j(SPECIES[id].name, '을/를')} 받았다!`);
    const rid = rivalLine()[0];
    await say(`은재: 그럼 난… ${j(SPECIES[rid].name, '으로/로')} 할래! 네 몬스터한테 강한 녀석이지?`);
    await say('은재: 몬스터를 받았으면 바로 승부지!\n덤벼, {name}!');
    await rivalBattle(1);
    await say('한별 박사: 둘 다 훌륭했단다. 몬스터들을 회복시켜 주마.');
    await healParty();
    await say('은재: 난 먼저 들꽃마을로 간다! 누가 먼저 배지를 받는지 시합이야!');
    await fadeTo(1, 8);
    world.refreshNPCs();
    await fadeTo(0, 8);
    await say('한별 박사: 하하, 성격 급한 건 여전하구나.\n{name}, 몬스터를 잡을 때 쓰는 포획구도 가져가렴.');
    await giveItem('ball', 5);
    await say('한별 박사: 북쪽 1번 도로를 지나면 들꽃마을이 나온단다.\n그곳 수련관의 관장에게 도전해 보렴!');
    await say('한별 박사: 지칠 땐 집에 들러 쉬거나 회복소를 찾아가렴.\nB 버튼(X 키)으로 메뉴를 열어 저장하는 것도 잊지 말고!');
    return;
  }
  const total = SPECIES_LIST.length;
  if (game.flags.ending) {
    await say('한별 박사: 세 개의 배지에, 검은안개단까지 막아 내다니…\n{name}, 넌 이 지방의 자랑이란다!');
    await say(`한별 박사: 도감은 ${game.caught.length}/${total}종류까지 채웠구나.\n해솔 리그가 열리면 꼭 도전해 보렴!`);
    return;
  }
  if (!game.flags.badge1) {
    await say('한별 박사: 북쪽으로 가면 들꽃마을이 있단다.\n수련관의 관장 단단에게 도전해 보렴!');
  } else if (!game.flags.forestCleared) {
    await say('한별 박사: 속삭임숲에 검은안개단이 나타났다고?\n숲지기 할머니가 걱정이구나… 부디 조심하렴.');
  } else {
    await say('한별 박사: 검은안개단이 별빛결정을 모으고 있다니…\n옛 기록에 따르면 별빛결정은 은하고래를 깨우는 열쇠란다.');
  }
  await say(`한별 박사: 지금까지 ${game.caught.length}종류의 몬스터를 잡았구나.\n${total}종류를 모두 채우면 정말 대단할 거야!`);
}

// ---------------------------------------------------------------------------
// 들꽃마을 → 2장 시작

export async function chapter2Scene() {
  await rivalApproach('rival_t2');
  await say('은재: {name}! 관장님을 이겼구나! 나도 방금 배지를 받았어.');
  await say('은재: 그보다 큰일이야. 북쪽 2번 도로 너머 속삭임숲에서\n검은안개단이라는 녀석들이 몬스터를 마구 잡아가고 있대!');
  await say('은재: 숲지기 할머니가 도움을 청하셨어.\n난 먼저 가 볼게. 너도 꼭 와!');
  game.flags.ch2 = true;
  await fadeTo(1, 8);
  world.refreshNPCs();
  await fadeTo(0, 8);
}

export const leader1Win = async () => {
  game.flags.badge1 = true;
  await say('관장 단단: 이 바위배지를 받아라.\n내 수련관을 이겨 낸 증표다.');
  await say('{name}은(는) 관장 단단에게서 바위배지를 받았다!');
  await giveItem('superpotion', 2);
  await say('관장 단단: 요즘 북쪽에서 수상한 무리가 돌아다닌다는 소문이 있다.\n배지를 가진 트레이너라면 2번 도로를 지나갈 수 있지. 조심해라!');
};

// ---------------------------------------------------------------------------
// 속삭임숲

export async function grannyTalk() {
  if (!game.flags.forestCleared) {
    await say('숲지기 할머니: 아이고, 트레이너구나… 숲 한가운데 공터에\n검은 옷을 입은 녀석들이 숲의 아이들을 가둬 두고 있단다.');
    await say('숲지기 할머니: 숲을 빠져나가는 북쪽 길도 녀석들이 막고 있어.\n제발 저 아이들을 구해 주렴…');
    return;
  }
  if (!game.flags.gotTal) {
    await say('숲지기 할머니: 고맙구나, 정말 고마워…\n숲의 아이들이 모두 무사히 돌아왔단다.');
    await say('숲지기 할머니: 며칠 전 숲 깊은 곳에서 커다란 알을 하나 주웠는데,\n방금 깨어났지 뭐니. 글쎄 아기 용이지 뭐야!');
    await say('숲지기 할머니: 이 녀석이 너를 졸졸 따라다니는구나.\n숲을 구해 준 답례로 데려가 주렴.');
    await giveMon('kkomaryong', 12);
    game.flags.gotTal = true;
    return;
  }
  if (game.flags.quest && !game.flags.bellForest) {
    if (inParty('beoseot', 'beoseotking')) {
      await say('숲지기 할머니: 오오, 이 향긋한 포자 냄새…\n버섯돌이가 이렇게 건강하게 자랐구나. 숲이 다시 살아났다는 증거란다.');
      await say('숲지기 할머니: 산군님 이야기를 들었구나. 이 방울을 가져가렴.\n옛날부터 우리 집안이 지켜 온 숲의 방울이란다.');
      await giveItem('bell_forest');
      game.flags.bellForest = true;
    } else {
      await say('숲지기 할머니: 숲의 방울 말이니? 그건 숲이 건강하다는 걸\n보여 주는 사람에게만 줄 수 있단다.');
      await say('숲지기 할머니: 포자니를 버섯돌이까지 키워서 데려와 보렴.\n버섯돌이의 포자 향기를 맡으면 숲이 건강한지 알 수 있거든.');
    }
    return;
  }
  await say('숲지기 할머니: 꼬마룡은 아직 알껍데기를 못 벗었지?\n크면 하늘을 나는 멋진 용이 될 거란다.');
}

function inParty(...ids: string[]) {
  return game.party.some((m) => ids.includes(m.species));
}

export const forestAdminWin = async () => {
  await say('간부 잿빛: 칫… 꼬마 주제에 제법이군.');
  await say('간부 잿빛: 하지만 늦었다. 흑영 님의 계획은 이미 시작됐어.\n별빛결정만 모이면… 별빛동굴의 은하고래가 깨어난다!');
  await say('간부 잿빛: 모두 철수한다! 숲에서 손 떼!');
  await fadeTo(1, 10);
  game.flags.forestCleared = true;
  world.refreshNPCs();
  await wait(10);
  await fadeTo(0, 10);
  await say('검은안개단이 숲에서 물러났다!\n갇혀 있던 몬스터들이 기쁜 듯이 숲으로 돌아갔다.');
};

// ---------------------------------------------------------------------------
// 물안개마을

export async function rival2Scene() {
  await rivalApproach('rival_t3');
  await say('은재: {name}! 숲에서 검은안개단을 쫓아냈다며? 나도 소문 들었어.');
  await say('은재: 나도 그동안 엄청 강해졌다고!\n얼마나 강해졌는지 확인해 볼래?');
  await rivalBattle(2);
  await say('은재: 이 마을 수련관의 관장 마루 님은 물 타입의 달인이래.\n전기나 풀 기술을 준비해 두라고!');
  await say('은재: 그럼 다음에 또 보자!');
  await fadeTo(1, 8);
  world.refreshNPCs();
  await fadeTo(0, 8);
}

export async function fisherTalk() {
  if (!game.flags.rod) {
    await say('낚시꾼: 이봐, 낚시 좋아하나? 이 호수엔 반짝피라가 잔뜩 산다네.\n오래 산 녀석은 은빛잉어가 되지.');
    await say('낚시꾼: 내 낡은 낚싯대를 줄 테니 써 보게!');
    await giveItem('rod');
    game.flags.rod = true;
    await say('낚시꾼: 물가를 바라보고 A 버튼을 누르면 낚싯대를 던질 수 있다네.');
    return;
  }
  if (game.flags.quest && !game.flags.bellWater) {
    if (inParty('eungeo')) {
      await say('낚시꾼: 이, 이건 은빛잉어 아닌가! 금빛 지느러미까지…\n자네, 진정한 낚시꾼이로구먼!');
      await say('낚시꾼: 우리 마을 호수 바닥에서 건진 방울이라네.\n산군님께 가져간다면 기꺼이 주지.');
      await giveItem('bell_water');
      game.flags.bellWater = true;
    } else {
      await say('낚시꾼: 물의 방울? 허허, 그건 호수의 보물이라네.\n은빛잉어를 데려와서 보여 준다면 생각해 보지!');
      await say('낚시꾼: 반짝피라를 낚아서 키우면 은빛잉어가 된다네.\n동굴 호수나 산속 연못에선 처음부터 은빛잉어가 걸리기도 하지.');
    }
    return;
  }
  await say('낚시꾼: 강이나 바다, 동굴 호수에서도 낚시를 해 보게.\n어떤 녀석이 걸릴지 모르는 게 낚시의 재미지!');
}

export const leader2Win = async () => {
  game.flags.badge2 = true;
  await say('관장 마루: 물결배지야. 흐르는 물처럼 유연한 승부였어!');
  await say('{name}은(는) 관장 마루에게서 물결배지를 받았다!');
  await giveItem('superball', 3);
  await say('관장 마루: 그리고… 나쁜 소식이 있어. 검은안개단이\n3번 도로 끝의 별빛동굴로 몰려 들어갔대.');
  await say('관장 마루: 동굴 깊은 곳 지하 호수에는 전설의 몬스터가\n잠들어 있다고 전해져. 녀석들의 목적은 분명 그거야.');
  await say('관장 마루: 마을 동쪽의 경비에게 말해 뒀어. 부탁할게, {name}!');
};

// ---------------------------------------------------------------------------
// 별빛동굴

export async function bossScene() {
  const boss = world.npcs.find((n) => n.def.id === 'boss');
  if (boss) world.faceEachOther(boss);
  await say('흑영: …누구냐. 숲과 마을에서 우리 일을 방해한 꼬마가 너로구나.');
  await say('흑영: 보아라. 별빛결정의 힘으로 은하고래의 잠이 얕아지고 있다.\n은하고래가 깨어나면, 이 지방의 하늘과 바다는 모두 내 것이 된다.');
  await say('흑영: 방해한다면… 힘으로 치워 주마!');
  const t: TrainerDef = {
    id: 'boss', cls: '검은안개단 두목', name: '흑영', pal: PAL.boss,
    team: [['dokdae', 26], ['dodug', 24], ['heukjang', 25], ['beongae', 25]], reward: 3000,
    intro: '', defeat: '…이 힘은, 대체…', after: '',
    afterWin: bossWin,
  };
  await trainerBattle(t);
}

async function bossWin() {
  await say('흑영: 말도 안 돼… 내 계획이 이런 꼬마에게…');
  await flashes(2);
  await say('우우우웅——!\n지하 호수 깊은 곳에서 거대한 울음소리가 울려 퍼졌다!');
  await say('은하고래가 몸에 박힌 별빛결정을 떨쳐 냈다!');
  await say('흑영: 결정의 힘을 스스로 거부하다니…!\n칫, 모두 철수한다! 이 빚은 반드시 갚아 주마!');
  await fadeTo(1, 12);
  game.flags.bossDone = true;
  world.refreshNPCs();
  await wait(12);
  await fadeTo(0, 12);
  await say('검은안개단은 동굴에서 달아났다.\n깨어난 은하고래가 조용히 이쪽을 바라보고 있다…');
}

export async function whaleTalk() {
  if (!game.flags.bossDone) {
    await say('호수 속에서 커다란 몬스터가 깊이 잠들어 있다.\n몸 곳곳에 별빛결정이 박혀 있다…');
    return;
  }
  if (!(await yesNo('은하고래가 별빛을 흩뿌리며 노래하고 있다…\n다가가 볼까?'))) return;
  await say('은하고래: 우우웅——!');
  const res = await wildBattle(createMon('eunha', 30));
  if (res === 'caught') {
    game.flags.whale = true;
    return;
  }
  if (res === 'win') await say('은하고래는 빛이 되어 호수 깊이 가라앉았다…\n잠시 후 다시 떠오를 것 같다.');
  else if (res === 'run') await say('은하고래는 여전히 이쪽을 바라보고 있다.');
}

// ---------------------------------------------------------------------------
// 별빛시

export async function rival3Scene() {
  await rivalApproach('rival_t4');
  await say('은재: {name}! 별빛동굴에서 검은안개단 두목을 이겼다며!\n정말 굉장하다… 이제 너를 따라잡기도 힘들겠어.');
  await say('은재: 하지만 마지막 배지 앞에서 너만 앞서가게 둘 순 없지.\n진짜 실력으로 승부다!');
  await rivalBattle(3);
  await say('은재: 별빛 수련관의 관장 하람 님은 전기 타입을 써.\n땅 타입 몬스터가 있으면 훨씬 유리할 거야!');
  await say('은재: 난 해솔 리그를 목표로 계속 수련할 거야. 거기서 다시 만나자!');
  await fadeTo(1, 8);
  world.refreshNPCs();
  await fadeTo(0, 8);
}

export const leader3Win = async () => {
  game.flags.badge3 = true;
  await say('관장 하람: 번개배지다. 번개보다 빠른 판단이었어!');
  await say('{name}은(는) 관장 하람에게서 번개배지를 받았다!');
  await giveItem('hyperpotion', 3);
  await say('관장 하람: 세 수련관을 모두 이겨 냈구나.\n이제 해솔 리그에 도전할 자격이 생긴 거다.');
  await ending();
};

async function ending() {
  await say('…그때, 한별 박사에게서 연락이 왔다!');
  await say('한별 박사: {name}! 소식 들었단다.\n검은안개단을 막고, 은하고래까지 지켜 내다니…');
  await say('한별 박사: 해솔 리그는 다음 봄에 열린단다.\n그때까지 동료들과 함께 더 강해지렴!');
  await say('— 팜팜몬 제3장 「별빛의 고래」 끝 —\n플레이해 줘서 고마워요!');
  game.flags.ending = true;
}

// ---------------------------------------------------------------------------
// 특별 퀘스트 — 산군의 세 방울

const bellCount = () => ['bell_forest', 'bell_water', 'bell_rock'].filter((b) => itemCount(b) > 0).length;

export async function sanjiTalk() {
  if (!game.flags.badge3) {
    await say('산지기 할아버지: 허허, 젊은 트레이너로구먼.\n세 수련관의 배지를 모두 모으면 이 늙은이를 다시 찾아오게.');
    return;
  }
  if (!game.flags.quest) {
    await say('산지기 할아버지: 오, 배지 셋을 모은 트레이너라…\n자네라면 이 이야기를 들려줘도 되겠구먼.');
    await say('산지기 할아버지: 3번 도로 북쪽, 늘 안개에 덮인 운무봉이라는 산이 있지.\n그 정상에는 산군님을 모신 서낭당이 있다네.');
    await say('산지기 할아버지: 산군님은 아주 먼 옛날부터 해솔 지방의 산을 지켜 온\n흰 호랑이의 정령이라네. 평소엔 안개 속에 숨어 모습을 보이지 않지.');
    await say('산지기 할아버지: 하지만 숲·물·바위, 세 방울의 소리를 한꺼번에 들으면\n서낭당으로 내려와 방울 주인의 힘을 시험한다고 전해진다네.');
    await say('산지기 할아버지: 숲의 방울은 속삭임숲의 숲지기 할머니가,\n물의 방울은 물안개마을의 낚시꾼이 가지고 있을 걸세.');
    await say('산지기 할아버지: 바위의 방울은… 별빛동굴의 광부들이 캐냈다는 소문이 있지.\n세 방울을 모아 운무봉 서낭당에 가 보게!');
    game.flags.quest = true;
    return;
  }
  if (game.flags.sangun) {
    await say('산지기 할아버지: 산군님이 자네를 인정하셨다고?\n허허, 살다 보니 이런 날이 오는구먼… 부디 잘 모시게.');
    return;
  }
  await say(`산지기 할아버지: 방울은 ${bellCount()}개 모았구먼.\n숲지기 할머니, 물안개마을 낚시꾼, 별빛동굴 광부를 찾아가 보게.`);
}

export async function minerTalk() {
  if (!game.flags.quest) {
    await say('광부 대장 석두: 검은안개단을 쫓아내 줘서 고맙네!\n덕분에 다시 별빛결정을 캘 수 있게 됐지.');
    return;
  }
  if (game.flags.bellRock) {
    await say('광부 대장 석두: 그 방울, 소중히 쓰게나. 산군님께 안부 전해 주게!');
    return;
  }
  await say('광부 대장 석두: 바위의 방울 말인가? 확실히 갱도 깊은 곳에서 캐낸 게 있지.\n하지만 바위의 방울은 바위보다 단단한 자만이 가질 수 있어!');
  const t: TrainerDef = {
    id: 'miner', cls: '광부 대장', name: '석두', pal: PAL.hiker,
    team: [['heukjang', 31], ['bawi', 32], ['daeji', 33]], reward: 2000,
    intro: '', defeat: '허허, 내 몬스터들보다 단단하구먼!', after: '',
  };
  const res = await trainerBattle(t);
  if (res !== 'win') return;
  await say('광부 대장 석두: 약속대로 이 방울을 주지.\n산군님도 자네라면 반겨 주실 걸세.');
  await giveItem('bell_rock');
  game.flags.bellRock = true;
}

export async function shrineTalk() {
  if (!game.flags.quest) {
    await say('돌을 쌓아 만든 오래된 서낭당이다.\n오색 천이 안개 속에서 조용히 나부끼고 있다.');
    return;
  }
  if (game.flags.sangun) {
    await say('서낭당에 오색 천이 나부끼고 있다.\n어디선가 산군의 숨결이 느껴지는 것 같다.');
    return;
  }
  const n = bellCount();
  if (n < 3) {
    await say(`서낭당 앞에 방울을 걸어 두는 자리가 세 군데 있다.\n(가지고 있는 방울: ${n}/3)`);
    return;
  }
  if (!(await yesNo('서낭당 앞에 방울을 걸어 두는 자리가 세 군데 있다.\n세 방울을 걸어 볼까?'))) return;
  await say('{name}은(는) 숲의방울, 물의방울, 바위의방울을 서낭당에 걸었다.');
  await say('딸랑… 딸랑…\n바람도 없는데 세 방울이 저절로 울리기 시작했다!');
  await flashes(2);
  await say('짙은 안개가 산꼭대기를 뒤덮었다…\n안개 속에서 두 개의 푸른 눈이 빛난다!');
  await say('산군: 크르르릉…\n방울을 울린 자여. 숲과 물과 바위가 그대를 인정하였구나.');
  await say('산군: 이 산을 지켜 온 천 년의 힘으로 그대를 시험하겠다.\n그대의 동료들과 함께 맞서라!');
  const res = await wildBattle(createMon('sangun', 38));
  if (res === 'caught') {
    game.flags.sangun = true;
    for (const b of ['bell_forest', 'bell_water', 'bell_rock']) removeItem(b);
    await say('세 개의 방울이 빛이 되어 사라졌다.\n산군이 {name}의 동료가 되었다!');
    return;
  }
  if (res === 'lose') return;
  await say('산군은 안개 속으로 모습을 감췄다…\n방울은 아직 서낭당에 걸려 있다. 다시 울리면 돌아올 것 같다.');
}

export async function potatoTalk() {
  if (game.flags.gotGungo) {
    await say('군고구마 아저씨: 군고미는 잘 지내나?\n추운 날엔 군고미 옆에 꼭 붙어 있으라고!');
    return;
  }
  if (!game.flags.badge1) {
    await say('군고구마 아저씨: 군고구마 사세요~ 따끈따끈 군고구마!\n…어라, 드럼통 속에서 뭔가 꼼지락거리는데?');
    return;
  }
  await say('군고구마 아저씨: 이봐, 트레이너! 글쎄 군고구마 하나가\n눈을 뜨고 꼼지락거리지 뭔가. 몬스터였어!');
  await say('군고구마 아저씨: 수련관 배지를 가진 자네라면 잘 키워 주겠지.\n데려가 주게!');
  await giveMon('gungo', 10);
  game.flags.gotGungo = true;
}

export function npcById(id: string): NPC | undefined {
  return world.npcs.find((n) => n.def.id === id);
}
