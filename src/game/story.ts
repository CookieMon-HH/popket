import { say, yesNo, choose } from '../engine/ui';
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
import { professorLegends, minerPost, elderPost } from './legends';

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
  sailor: { hair: '#3a2a20', shirt: '#ffffff', pants: '#2a4a8a', hat: '#ffffff' },
  dalnim: { hair: '#d8d0f8', shirt: '#3a2a5a', pants: '#2a2040' },
  hwaryeon: { hair: '#e84a2a', shirt: '#f0a030', pants: '#7a2a1a' },
  monk: { hair: '#2a2a2a', shirt: '#c8a060', pants: '#6a5030' },
  shadow: { hair: '#2a2a34', shirt: '#4a3a5a', pants: '#1e1e28' },
  yongyeon: { hair: '#3aa890', shirt: '#2a4a6a', pants: '#1e2a3a', hat: '#e8c860' },
  champ: { hair: '#d05a2a', shirt: '#f4f4f8', pants: '#2a2a3a', hat: '#ffd040' },
  seori: { hair: '#e8f4ff', shirt: '#7ac0e8', pants: '#3a5a8a' },
  yongha: { hair: '#2a4a3a', shirt: '#c83a3a', pants: '#2a2a3a', hat: '#e8c040' },
  elder: { hair: '#f4f4f4', shirt: '#6a4a8a', pants: '#3a2a4a' },
  sutgeom: { hair: '#3a2a22', shirt: '#7a3a2a', pants: '#2a1e1a', hat: '#a04a2a' },
  haesol: { hair: '#f0f0f8', shirt: '#f4e8c8', pants: '#6a4a9a', hat: '#ffd24a' },
  cloud: { hair: '#8a94c8', shirt: '#2e2e3a', pants: '#1e1e28', hat: '#626aa0' },
  skier: { hair: '#3a2a20', shirt: '#e84a6a', pants: '#3a4a7a', hat: '#ffffff' },
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

function rivalDef(stage: 1 | 2 | 3 | 4): TrainerDef {
  const line = rivalLine();
  const team: [string, number][] =
    stage === 1
      ? [[line[0], 5]]
      : stage === 2
        ? [['baramsae', 13], ['pojani', 12], [line[1], 15]]
        : stage === 3
          ? [['baramsae', 23], ['kkomaryong', 22], ['jeolgu', 22], [line[1], 25]]
          : [['hoeori', 53], ['wolgung', 53], ['cheonryong', 54], ['geosin', 53], ['bingsan', 54], [line[2], 57]];
  return {
    id: 'rival' + stage,
    cls: stage === 4 ? '챔피언' : '라이벌',
    name: '은재',
    pal: stage === 4 ? PAL.champ : PAL.rival,
    team,
    reward: stage === 4 ? 10000 : stage * 400,
    intro: '',
    defeat: ['쳇, 처음이라 봐준 거야!', '…역시 너 대단하다.', '최고의 승부였어. 인정할게!', '…졌다. 진짜 졌어. 넌 정말 최고야, 친구!'][stage - 1],
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
  if (game.flags.champion) await say('엄마: 우리 집 챔피언! 오늘 저녁은 네가 좋아하는 걸로 해 줄게.');
  else if (game.flags.badge7) await say('엄마: 배지를 일곱 개나 모았다며? 리그가 바로 옆 고원에 있다니, 응원하러 갈게!');
  if (game.flags.champion && !game.flags.haesolWin) await say('엄마: 고원 북쪽 구름 위에 엄청 강한 사람이 산다던데…\n우리 챔피언이라도 꼭 준비 단단히 하고 가렴!');
  else if (game.flags.haesolWin) await say('엄마: 태초의 챔피언까지 이겼다고? 세상에, 우리 {name}가 해솔 지방 최강이구나!');
  else if (game.flags.badge5) await say('엄마: 서리마을은 엄청 춥다던데, 따뜻하게 입고 다니렴!');
  else if (game.flags.badge3) await say('엄마: 세 번째 배지까지 모았다며? 우리 {name}, 정말 자랑스럽구나!');
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
    await say('한별 박사: 하하, 성격 급한 건 여전하구나.\n{name}, 몬스터를 잡을 때 쓰는 팜팜볼도 가져가렴.');
    await giveItem('ball', 5);
    await say('한별 박사: 북쪽 1번 도로를 지나면 들꽃마을이 나온단다.\n그곳 수련관의 관장에게 도전해 보렴!');
    await say('한별 박사: 지칠 땐 집에 들러 쉬거나 회복소를 찾아가렴.\nB 버튼(X 키)으로 메뉴를 열어 저장하는 것도 잊지 말고!');
    return;
  }
  const total = SPECIES_LIST.length;
  if (game.flags.champion) {
    await say('한별 박사: 챔피언 {name}! 이 연구소에서 첫 몬스터를 받던 날이 엊그제 같구나.');
    await say(`한별 박사: 도감은 ${game.caught.length}/${total}종류까지 채웠구나.\n해솔 지방의 모든 몬스터를 만나 보렴!`);
    await professorLegends();
    return;
  }
  if (game.flags.pearlReturned) {
    await say('한별 박사: 용의 마을의 여의주를 되찾았다고? 정말 장하구나!\n이제 해솔고원의 해솔 리그만 남았구나.');
    return;
  }
  if (game.flags.volcanoDone) {
    await say('한별 박사: 흑영이 별빛결정을 맡기고 갔단다. 검은안개단도 해산했다지.\n서리마을과 용의 마을을 지나면 해솔고원이란다. 배지는 일곱 개가 필요해!');
    return;
  }
  if (game.flags.ending) {
    await say('한별 박사: 별빛시 동쪽 4번 도로를 지나면 파도항구, 그 남쪽엔 불꽃마을이 있단다.\n길이 한 바퀴 돌아 솔빛마을 동쪽의 해솔고원으로 이어지지.');
    await say(`한별 박사: 도감은 ${game.caught.length}/${total}종류까지 채웠구나. 힘내렴!`);
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
    team: [['dodug', 22], ['heukjang', 21], ['beongae', 22], ['dokkae', 23]], reward: 3000,
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
  await say('은재: 하지만 세 번째 배지 앞에서 너만 앞서가게 둘 순 없지.\n진짜 실력으로 승부다!');
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
  await say('관장 하람: 벌써 배지가 세 개로군.\n해솔 리그에 가려면 일곱 개가 필요하니, 아직 갈 길이 멀다!');
  await ending();
};

async function ending() {
  await say('…그때, 한별 박사에게서 연락이 왔다!');
  await say('한별 박사: {name}! 소식 들었단다.\n검은안개단을 막고, 은하고래까지 지켜 내다니…');
  await say('한별 박사: 그런데 걱정되는 소식이 있구나. 동굴에서 달아난 흑영이\n동쪽 바다의 파도항구 쪽으로 향했다는구나.');
  await say('한별 박사: 그리고 해솔 리그에 도전하려면 배지가 일곱 개 필요하단다.\n별빛시 동쪽 4번 도로를 따라 남쪽으로 가 보렴!');
  await say('— 제3장 「별빛의 고래」 끝 —\n이야기는 4번 도로 너머로 계속됩니다.');
  game.flags.ending = true;
}

// ---------------------------------------------------------------------------
// 특별 퀘스트 — 산군의 세 방울

const bellCount = () => ['bell_forest', 'bell_water', 'bell_rock'].filter((b) => itemCount(b) > 0).length;

export async function sanjiTalk() {
  if (!game.flags.badge3) {
    await say('산지기 할아버지: 허허, 젊은 트레이너로구먼.\n배지를 세 개 모으면 이 늙은이를 다시 찾아오게.');
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
  if (await minerPost()) return;
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

// ---------------------------------------------------------------------------
// 제4장 — 파도항구의 유령선

export async function port1Scene() {
  game.flags.portIntro = true;
  await say('뱃사람: 이봐, 트레이너! 혹시 소문 들었나?\n밤마다 항구에 파란 불을 단 유령선이 나타난다네!');
  await say('뱃사람: 그 뒤로 항구의 몬스터들이 하나둘 사라지고 있어.\n수련관 관장 달님 님이 조사하러 배에 올라가셨는데… 아직 소식이 없다네.');
  await say('뱃사람: 유령선은 남쪽 부두 끝에 묶여 있어. 부탁하네!');
}

export async function dalnimShipTalk() {
  if (!game.flags.shipDone) {
    await say('관장 달님: 쉿… 이 배의 도깨비불은 진짜 유령이 아니에요.\n검은안개단이 몬스터들에게 도깨비불을 피우게 해서 사람들을 겁주고 있어요.');
    await say('관장 달님: 배 가운데에서 지휘하는 간부를 쓰러뜨려야 해요.\n저는 붙잡힌 아이들을 지킬게요. 부탁해요!');
    return;
  }
  await say('관장 달님: 고마워요. 수련관에서 기다릴게요!');
}

export const shipAdminWin = async () => {
  await say('간부 잿빛: 세 번이나… 정말 지긋지긋한 꼬마로군.');
  await say('간부 잿빛: …좋다, 알려 주지. 흑영 님은 남쪽 불꽃산으로 가셨다.\n화산의 심장에 남은 별빛결정을 꽂아 화산을 다스리시겠다고 하셨지.');
  await say('간부 잿빛: 그분은… 원래 나쁜 분이 아니야. 십 년 전 화산 폭발로\n고향을 잃으셨지. 다시는 그런 일이 없게 하겠다고…');
  await say('간부 잿빛: 난 이제 손 떼겠다. 붙잡은 몬스터들도 모두 풀어 주지.');
  await fadeTo(1, 10);
  game.flags.shipDone = true;
  world.refreshNPCs();
  await wait(10);
  await fadeTo(0, 10);
  await say('갇혀 있던 몬스터들이 풀려났다!\n관장 달님은 수련관으로 돌아갔다.');
};

export const leader4Win = async () => {
  game.flags.badge4 = true;
  await say('관장 달님: 달빛배지예요. 어둠 속에서도 길을 잃지 않는 마음의 증표랍니다.');
  await say('{name}은(는) 관장 달님에게서 달빛배지를 받았다!');
  await giveItem('hyperpotion', 3);
  await say('관장 달님: 흑영이 불꽃산으로 갔다면… 불꽃마을의 관장 화련 님이 위험해요.\n항구 서쪽 해변길을 따라 남쪽으로 가세요!');
};

// ---------------------------------------------------------------------------
// 제5장 — 불꽃산의 심장

/** 5번 도로: 불꽃석을 실어 나르던 간부 숯검정. 잿빛이 손을 뗀 뒤 흑영에게 남은 마지막 간부. */
export const beachAdminWin = async () => {
  await say('숯검정: 크윽… 잿빛 녀석이 왜 손을 뗐는지 이제야 알겠군.');
  await say('숯검정: 이 불꽃석은 화산의 심장을 누르는 데 쓸 거였다.\n흑영 님은 이미 불꽃산 깊은 곳에서 준비를 하고 계시지.');
  await say('숯검정: …흑영 님을 막을 수 있는 건 너뿐일지도 모르겠군.\n짐은 두고 가겠다. 마음대로 해라.');
  await fadeTo(1, 10);
  game.flags.beachDone = true;
  world.refreshNPCs();
  await wait(10);
  await fadeTo(0, 10);
  await say('검은안개단은 불꽃석 상자를 버려두고 떠났다.\n남쪽으로 가면 불꽃마을이다.');
  await giveItem('fullrestore', 1, true);
};

export const leader5Win = async () => {
  game.flags.badge5 = true;
  await say('관장 화련: 화염배지다! 꺼지지 않는 불꽃 같은 승부였어!');
  await say('{name}은(는) 관장 화련에게서 화염배지를 받았다!');
  await giveItem('fullrestore', 2);
  await say('관장 화련: 그런데 큰일이야. 조금 전 검은 옷의 남자가 화산 안으로 들어갔어.\n화산 입구는 마을 동쪽이야. 막아 줘, {name}!');
};

export async function volcanoBossScene() {
  const boss = world.npcs.find((n) => n.def.id === 'vboss');
  if (boss) world.faceEachOther(boss);
  await say('흑영: …또 너인가. 여기까지 따라오다니.');
  await say('흑영: 십 년 전, 이 산이 폭발해 내 고향이 사라졌다.\n은하고래의 힘이든, 별빛결정이든… 이 화산을 영원히 잠재울 힘이 필요했다.');
  await say('흑영: 이 결정을 화산의 심장에 꽂으면 모든 게 끝난다.\n비켜라. 이번엔 봐주지 않는다!');
  const t: TrainerDef = {
    id: 'boss2', cls: '검은안개단 두목', name: '흑영', pal: PAL.boss,
    team: [['dodug', 38], ['geosin', 38], ['daewang', 39], ['hwasan', 39], ['dokdae', 41]], reward: 6000,
    intro: '', defeat: '…졌군. 완전히.', after: '', afterWin: volcanoWin,
  };
  await trainerBattle(t);
}

async function volcanoWin() {
  await say('흑영: …네 몬스터들은 억지로 끌려온 게 아니라, 스스로 너를 지키려 하는구나.');
  await say('흑영: 나는 힘으로 산을 누르려고만 했다. 그런데 화산의 몬스터들은\n이 산과 함께 살아가고 있었지…');
  await flashes(1);
  await say('흑영은 손에 쥔 별빛결정을 화산의 심장에서 거두었다.\n화산의 떨림이 천천히 잦아든다…');
  await say('흑영: 결정은 한별 박사에게 맡기겠다. 그리고 나는… 죗값을 치르겠다.\n검은안개단은 오늘로 해산이다.');
  await say('흑영: …{name}. 해솔 리그에 간다면, 꼭 이겨라.');
  await fadeTo(1, 12);
  game.flags.volcanoDone = true;
  world.refreshNPCs();
  await wait(12);
  await fadeTo(0, 12);
  await say('검은안개단이 해산했다!\n불꽃마을 서쪽 6번 도로를 따라가면 눈 덮인 서리마을이 나온다고 한다.');
  await giveItem('maxrevive', 2);
}

// ---------------------------------------------------------------------------
// 해솔 리그

export const guardian1Win = async () => {
  await say('리그 수호자 그림자: 다음 방으로 가라. 문이 열렸다.');
};
export const guardian2Win = async () => {
  await say('리그 수호자 용연: 마지막 방에 챔피언이 기다린다. 후회 없는 승부를!');
};

export async function championScene() {
  const c = world.npcs.find((n) => n.def.id === 'champ');
  if (c) world.faceEachOther(c);
  await say('은재: 왔구나, {name}! 놀랐지? 조금 전에 내가 챔피언을 이겼어.\n그러니까 지금 해솔 리그의 챔피언은… 바로 나야!');
  await say('은재: 솔빛마을 연구소에서 처음 몬스터를 받은 날부터,\n언젠가 이 자리에서 너랑 싸우고 싶었어.');
  await say('은재: 그럼 시작하자. 해솔 지방 최고의 트레이너를 정하는 승부를!');
  const res = await trainerBattle(rivalDef(4), true);
  if (res !== 'win') {
    await say('은재: 하하, 아직 내가 챔피언이네! 언제든지 다시 도전해!');
    return;
  }
  game.flags.champion = true;
  await say('은재: …축하해, {name}. 오늘부터 네가 해솔 리그의 챔피언이야!');
  await flashes(2);
  await say('{name}과(와) 동료들의 이름이 명예의 전당에 새겨졌다!');
  await say('은재: 자, 이제 집에 가자. 솔빛마을까지는 금방이잖아.\n이 길이 한 바퀴 돌아서 우리 마을로 이어져 있었다니, 신기하지?');
  await fadeTo(1, 20);
  world.load('home', 5, 3, 'up');
  await wait(20);
  await fadeTo(0, 20);
  await say('엄마: 어서 오렴, {name}! 아니, 이제는 챔피언이라고 불러야 하나?');
  await say('엄마: 떠날 때는 몬스터 한 마리뿐이었는데… 이렇게 많은 친구들과 돌아왔구나.\n정말 자랑스럽단다.');
  await say('한별 박사: (전화) {name}! 챔피언 축하한다! 도감도 계속 채워 주렴.\n아직 만나지 못한 몬스터들이 해솔 지방 곳곳에 있단다.');
  await say('한별 박사: 아, 그리고… 요즘 이상한 소문이 돌고 있단다.\n해솔고원 북쪽, 구름 위로 이어진 「천공의 길」 끝에 누군가 있다는구나.');
  await say('한별 박사: 50년 전 해솔 리그를 세우고 사라진 태초의 챔피언이\n전설의 용 「천지」와 함께 아직도 그곳에서 수행하고 있다는 거야.');
  await say('한별 박사: 챔피언만 그 길을 오를 수 있다고 하더구나.\n…하지만 무리는 하지 마렴. 그 힘은 지금까지와는 차원이 다르다니까.');
  await say('— 팜팜몬 「해솔 지방 이야기」 끝 —\n하지만 모험은 아직 끝나지 않았어요. 해솔고원 북쪽 「천공의 길」에 도전해 보세요!');
  await healParty();
  setLastHeal('home', 6, 3);
}

// ---------------------------------------------------------------------------
// 제6장 — 서리마을의 눈보라

export async function iceIntroScene() {
  game.flags.iceIntro = true;
  await say('휘이잉… 매서운 눈보라가 마을을 휘감고 있다.');
  const r = world.npcs.find((n) => n.def.id === 'rival_t7');
  if (r) {
    r.bubble = 30;
    await wait(34);
    await world.approachAny(r);
  }
  await say('은재: {name}! 너도 왔구나. 이 눈보라, 벌써 열흘째래.\n원래 서리마을도 이렇게까지 춥진 않았대.');
  await say('은재: 마을 어르신 말로는 서쪽 용의 마을에서 무슨 일이 생긴 것 같대.\n용의 마을은 해솔 지방의 날씨를 지키는 곳이거든.');
  await say('은재: 그리고 큰일이야. 마을 아이 눈송이가 도망친 아기북곰을 쫓아서\n북쪽 얼음굴로 들어갔대. 관장 서리 님이 찾으러 가셨는데 아직 소식이 없어.');
  await say('은재: 난 마을 바깥쪽을 찾아볼게. 얼음굴은 네가 부탁해!\n얼음굴 입구는 마을 북동쪽이야.');
  await fadeTo(1, 8);
  world.refreshNPCs();
  await fadeTo(0, 8);
}

export async function iceCaveScene() {
  const seori = world.npcs.find((n) => n.def.id === 'seori_cave');
  if (seori) world.faceEachOther(seori);
  await say('관장 서리: 당신은… 트레이너군요! 눈송이는 무사해요. 저기 있어요.\n그런데 빙산곰이 눈보라에 겁을 먹고 길을 막고 있어요.');
  await say('관장 서리: 제 몬스터들은 아이를 지키느라 지쳐 버렸어요.\n부탁해요, 빙산곰을 진정시켜 주세요!');
  await say('빙산곰: 크오오오——!');
  const res = await wildBattle(createMon('bingsan', 42));
  if (res === 'lose') return;
  if (res === 'run') {
    await say('빙산곰이 여전히 길을 막고 있다…');
    return;
  }
  if (res === 'win') await say('빙산곰은 기운이 빠져 얌전해지더니,\n얼음굴 깊은 곳으로 천천히 걸어 들어갔다.');
  await say('눈송이: 으앙… 무서웠어요! 아기북곰도 무사해요!');
  await say('관장 서리: 정말 고마워요. 이 눈보라 때문에 얼음굴의 몬스터들까지 흥분했나 봐요.\n아이는 제가 데려갈게요. 수련관에서 기다릴게요!');
  await fadeTo(1, 12);
  game.flags.iceCaveDone = true;
  world.load('town7', 5, 4, 'down');
  await wait(12);
  await fadeTo(0, 12);
  await say('눈송이 엄마: 눈송이를 찾아 주셨군요! 정말… 정말 고마워요.\n이거, 얼마 안 되지만 받아 주세요.');
  await giveItem('fullrestore', 2);
  await say('관장 서리가 수련관으로 돌아갔다.\n이제 서리 수련관에 도전할 수 있다!');
}

export const leader6Win = async () => {
  game.flags.badge6 = true;
  await say('관장 서리: 얼음배지예요. 미끄러져도 다시 일어서는 마음의 증표랍니다.');
  await say('{name}은(는) 관장 서리에게서 얼음배지를 받았다!');
  await giveItem('hyperball', 5);
  await say('관장 서리: 이 눈보라는 자연의 것이 아니에요. 용의 마을의 여의주에\n무슨 일이 생긴 거예요. 서쪽 설원 산길을 지나 용의 마을로 가 주세요!');
};

// ---------------------------------------------------------------------------
// 제7장 — 용의 마을과 여의주

export async function dragonIntroScene() {
  game.flags.dragonIntro = true;
  await say('용의 마을 사람: 트레이너인가! 큰일이야, 마을의 보물 여의주가 도둑맞았어!');
  await say('용의 마을 사람: 여의주가 사라진 뒤로 해솔 지방 곳곳의 날씨가 엉망이야.\n촌장님께서 사당에 계시니 가 보게나!');
}

export async function elderTalk() {
  if (await elderPost()) return;
  if (!game.flags.dragonIntro) {
    await say('촌장: 이 사당은 해솔 지방의 하늘을 지키는 천룡님을 모신 곳이라네.');
    return;
  }
  if (game.flags.pearlReturned) {
    await say('촌장: 여의주가 돌아오니 하늘이 맑아졌구먼. 고맙네, 젊은이.\n천룡님도 자네를 지켜보고 계실 걸세.');
    return;
  }
  if (game.flags.denDone) {
    await say('촌장: 오오… 이 은은한 빛은! 여의주를 되찾아 왔구먼!');
    await flashes(2);
    await say('{name}은(는) 사당에 여의주를 바쳤다.\n하늘을 덮고 있던 먹구름이 거짓말처럼 걷혔다!');
    game.flags.pearlReturned = true;
    await say('촌장: 이 은혜를 어찌 갚을꼬… 그래, 사당 연못에서 깨어난 이 아이를 데려가게.\n천룡님과 함께 북쪽 바다를 지킨다는 현무의 새끼라네.');
    await giveMon('hyeonmuk', 38);
    await say('촌장: 수련관의 용하도 이제 돌아올 걸세. 마음껏 겨뤄 보게나!');
    return;
  }
  await say('촌장: 여의주를 훔쳐 간 자들은 마을 북쪽의 용의 둥지로 들어갔다네.\n먹구름이라 불리는 자가 우두머리라고 하더군…');
  await say('촌장: 수련관 관장 용하도 녀석들을 쫓아 둥지로 들어갔네. 부디 도와주게!');
}

export async function denEntranceScene() {
  game.flags.heukHelp = true;
  const h = world.npcs.find((n) => n.def.id === 'heuk_t8');
  if (h) world.faceEachOther(h);
  await say('흑영: …또 만났군, {name}.');
  await say('흑영: 여의주를 훔친 건 내 옛 부하였던 먹구름이다. 검은안개단의 해산을 받아들이지 못하고\n남은 자들을 모아 날씨를 마음대로 부리려 하고 있지.');
  await say('흑영: 이건 내가 남긴 빚이다. 둥지 밖으로 도망치는 녀석은 내가 막겠다.\n안쪽의 잔당들과 먹구름은… 네게 부탁한다.');
  await say('흑영: 둥지 안에는 커다란 바위가 길을 막고 있다. 잘 밀어서 길을 열어라.');
}

export const cloudWin = async () => {
  await say('먹구름: 마, 말도 안 돼… 여의주의 힘까지 썼는데…!');
  await say('그때, 둥지 입구 쪽에서 발소리가 들려왔다.');
  await say('흑영: 끝이다, 먹구름. 우리는 힘으로 하늘을 다스릴 수 없다.\n…나도 그걸 깨닫는 데 오래 걸렸지.');
  await say('먹구름: 두목님… 아니, 흑영 님… 죄송합니다…');
  await fadeTo(1, 12);
  game.flags.denDone = true;
  world.refreshNPCs();
  await wait(12);
  await fadeTo(0, 12);
  await say('{name}은(는) 여의주를 되찾았다!\n흑영은 먹구름과 잔당들을 데리고 떠났다.');
  await giveItem('pearl');
  await say('관장 용하: 고맙다, 트레이너. 덕분에 여의주를 되찾았군.\n촌장님께 여의주를 돌려 드린 뒤, 수련관으로 와라. 제대로 겨뤄 보자!');
};

export const leader7Win = async () => {
  game.flags.badge7 = true;
  await say('관장 용하: 용린배지다. 용의 시험을 모두 통과한 자의 증표!');
  await say('{name}은(는) 관장 용하에게서 용린배지를 받았다!');
  await giveItem('maxrevive', 2);
  await say('관장 용하: 배지 일곱 개를 모았으니 해솔 리그에 도전할 자격이 있다.\n마을 서쪽 8번 도로를 따라가면 해솔고원이다. 가라, 챔피언을 향해!');
};

// ---------------------------------------------------------------------------
// 수련관 퍼즐

/** A lever that opens something once. */
export function lever(flag: string, text: string) {
  return async () => {
    if (game.flags[flag]) return;
    game.flags[flag] = true;
    await say('철컥!');
    await say(text);
  };
}

/** A floor switch that flips a flag every time it is stepped on. */
export function toggleSwitch(flag: string) {
  return async () => {
    game.flags[flag] = !game.flags[flag];
    await say('찰칵! 스위치를 밟았다.\n지지직… 전기 울타리의 배치가 바뀌었다!');
  };
}

/** A dragon statue that asks a question; the right answer opens a gate. */
export function quiz(flag: string, question: string, options: string[], answer: number) {
  return async () => {
    if (game.flags[flag]) {
      await say('용 석상이 조용히 길을 비켜 주고 있다.');
      return;
    }
    await say('용 석상: 용의 시험에 도전하는 자여, 답하라.');
    const r = await choose(question, [...options, '그만두기'], options.length);
    if (r === options.length) return;
    if (r === answer) {
      game.flags[flag] = true;
      await say('용 석상: …옳도다. 길을 열어 주마.');
      await say('쿠구궁… 용의 문이 열렸다!');
    } else await say('용 석상: 틀렸도다. 다시 생각해 보거라.');
  };
}

export function npcById(id: string): NPC | undefined {
  return world.npcs.find((n) => n.def.id === id);
}

// ---------------------------------------------------------------------------
// 엔딩 이후 — 천공의 신전: 태초의 챔피언 해솔과 전설의 용 천지

export const HAESOL: TrainerDef = {
  id: 'haesol', cls: '태초의 챔피언', name: '해솔', pal: PAL.haesol,
  team: [['dokdae', 72], ['hwasan', 73], ['haeil', 73], ['geosin', 74], ['byeolkkum', 74], ['cheonji', 80]],
  reward: 30000, elite: true, heals: 3,
  intro: '', defeat: '…훌륭하다. 50년 만에 처음으로 졌구나.', after: '',
};

export async function haesolMeet() {
  game.flags.haesolMet = true;
  const n = world.npcs.find((x) => x.def.id === 'haesol');
  if (n) world.faceEachOther(n);
  await say('???: …구름을 뚫고 여기까지 올라온 자가 있다니.');
  await say('해솔: 나는 해솔. 50년 전 이 땅에 해솔 리그를 세운 첫 번째 챔피언이다.\n리그를 떠난 뒤로 줄곧 이곳에서 천지와 함께 수행해 왔지.');
  await say('해솔: 은재를 이기고 챔피언이 되었다고? 좋은 눈빛이로구나.\n하지만 리그의 승부는 시작에 불과하다.');
  await say('해솔: 내 동료들은 불과 물, 강철과 번개, 어둠과 별빛…\n그리고 하늘과 땅을 가른 천지의 힘까지 지니고 있다.');
  await say('해솔: 준비가 되면 말을 걸어라. 동료를 단단히 다지고,\n상성과 전략을 세워서 오너라. 어설픈 각오로는 한 마리도 쓰러뜨리지 못할 것이다.');
}

export async function haesolTalk() {
  if (!game.flags.haesolMet) {
    await haesolMeet();
    return;
  }
  if (game.flags.haesolWin) {
    if (!(await yesNo('해솔: 다시 겨뤄 보겠나? 나도 그동안 더 강해졌다.'))) {
      await say('해솔: 언제든 오너라. 천지도 너를 기다리고 있다.');
      return;
    }
  } else if (!(await yesNo('해솔: 준비는 되었나?\n(동료 6마리 · 최고 Lv80 · 만능회복약 3개를 사용하는 매우 강한 상대예요)'))) {
    await say('해솔: 서두를 것 없다. 신전 앞 수행자에게 쉬어 가거라.');
    return;
  }
  await say('해솔: 그럼 시작하자. 하늘과 땅이 지켜보는 승부를!');
  const res = await trainerBattle(HAESOL, true);
  if (res !== 'win') {
    await say('해솔: …아직이다. 하지만 좋은 승부였다.\n쓰러진 이유를 생각하고, 동료를 다시 다져서 오너라.');
    return;
  }
  if (game.flags.haesolWin) {
    await say('해솔: 역시 너는 진짜다. 또 오너라!');
    return;
  }
  game.flags.haesolWin = true;
  await say('해솔: 내가 리그를 떠난 건, 더 이상 나를 이길 자가 없었기 때문이었다.\n…50년을 기다린 보람이 있구나.');
  await say('해솔: 이제 해솔 지방 최강의 트레이너는 너다, {name}.');
  await flashes(2);
  await say('신전 안쪽에서 해와 달의 빛이 쏟아져 나왔다…!');
  await say('해솔: 천지가 너를 보고 있구나. 천지는 스스로 인정한 자에게만 마음을 연다.\n신전 안쪽으로 가 보거라. 천지가 직접 너를 시험할 것이다.');
  world.refreshNPCs();
}

export async function cheonjiTalk() {
  if (!(await yesNo('천지가 해와 달의 구슬을 쥐고 조용히 내려다보고 있다…\n다가가 볼까?'))) return;
  await say('천지: 크오오오——!');
  const res = await wildBattle(createMon('cheonji', 70));
  if (res === 'caught') {
    game.flags.cheonjiCaught = true;
    await say('해솔: …천지가 너를 택했구나. 부디 소중히 대해 다오.');
    world.refreshNPCs();
    return;
  }
  if (res === 'win') await say('천지는 빛이 되어 구름 위로 흩어졌다…\n잠시 후 다시 내려올 것 같다.');
  else if (res === 'run') await say('천지는 여전히 신전 안쪽에서 이쪽을 바라보고 있다.');
}

export async function summitMonk() {
  await say('수행자 노을: 여기까지 올라온 것만으로도 대단하구나. 잠시 쉬었다 가거라.');
  await healParty();
  await say('동료들이 모두 기운을 되찾았다!');
  if (!game.flags.haesolWin) await say('수행자 노을: 해솔 님의 동료는 저마다 타입이 다르다.\n한 마리에만 기대지 말고, 상성을 고루 갖춘 여섯 마리로 맞서야 한다.');
}
