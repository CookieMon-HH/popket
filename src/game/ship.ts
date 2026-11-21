import { say, yesNo } from '../engine/ui';
import { wait } from '../engine/timing';
import { fadeTo, flashes } from '../engine/scene';
import { game } from './state';
import { world, healParty, trainerBattle, giveItem, giveMon, warpTo } from './api';
import { PAL } from './story';
import type { TrainerDef } from './maps';

// ---------------------------------------------------------------------------
// 제4장 — 유람선 은파호의 수수께끼
//
// The "ghost ship" is the cruise liner 은파호, lost in a storm thirty years
// ago. 검은안개단 uses frightened 도깨비불 to fake hauntings, but a real ghost
// sleeps aboard: Captain 해월. The player moves between the deck, cabins,
// ballroom, engine room and bridge, solving small puzzles on the way.

const f = (k: string) => !!game.flags[k];

// --- boarding ---------------------------------------------------------------

export async function boardShip() {
  game.flags.ship_intro = true;
  await say('끼이익… 발을 딛자 낡은 갑판이 비명을 질렀다.\n짙은 안개 사이로 「은파호」라는 금빛 글자가 희미하게 보인다.');
  await say('…30년 전 폭풍 속에 사라졌다는 바로 그 유람선이다.\n어디선가 피아노 소리가 아주 작게 들려온다.');
  await say('관장 달님의 모습은 보이지 않는다.\n선실 쪽에서 누군가 문을 두드리는 소리가 났다…!');
}

export async function lockedBridge() {
  const power = f('ship_power');
  const watch = f('ship_watch');
  await say('조종실로 올라가는 문이다. 굳게 잠겨 있다.');
  if (!watch) await say('자물쇠 가운데에 회중시계 모양의 홈이 파여 있다.');
  if (!power) await say('문 옆의 전등도 꺼져 있다. 배에 전기가 들어오지 않는 것 같다.');
  if (watch && power) await say('…회중시계를 홈에 맞추자 찰칵 소리와 함께 문이 열렸다!');
}

export async function lockedEngine() {
  if (f('ship_key')) return;
  await say('「기관실 — 관계자 외 출입 금지」\n두꺼운 자물쇠가 채워져 있다. 열쇠가 필요하다.');
}

// --- cabins ------------------------------------------------------------------

export async function logPage1() {
  if (!f('ship_log1')) {
    game.flags.ship_log1 = true;
    await say('책상 위에 낡은 항해일지가 펼쳐져 있다.');
  }
  await say('「은파호 항해일지 — 선장 해월」\n폭풍이 오는 밤이면 나는 연회장의 네 촛대에 불을 밝힌다.');
  await say('「언제나 순서는 같다. 파도, 달, 별, 그리고 해.\n승객들은 그 불빛을 보며 안심하곤 했다.」');
  await say('…일지의 마지막 장에는 젖은 글씨로 이렇게 적혀 있다.\n「모두 보트에 태웠다. 도깨비불들아, 미안하다. 나는 배와 함께…」');
}

export async function portraitTalk() {
  const n = (game.flags.ship_portrait_n ? 1 : 0) + (game.flags.ship_portrait_n2 ? 1 : 0);
  if (n === 0) {
    game.flags.ship_portrait_n = true;
    await say('제복을 입은 선장의 초상화다. 붉은 눈이 이쪽을 보고 있는 것 같다…');
  } else if (n === 1) {
    game.flags.ship_portrait_n2 = true;
    await say('…방금 초상화의 눈이 움직인 것 같다.\n액자 아래에 「선장 해월」이라고 새겨져 있다.');
  } else {
    await say(f('shipDone') ? '초상화 속 선장이 부드럽게 웃고 있는 것 같다.' : '초상화 속 선장의 눈빛이 어딘가 슬퍼 보인다…');
  }
}

export async function dalnimCabin() {
  if (f('shipDone')) return;
  if (!f('ship_dalnim')) {
    game.flags.ship_dalnim = true;
    await say('관장 달님: 누, 누구세요…! 아, 트레이너군요. 다행이다…');
    await say('관장 달님: 저는 파도 수련관의 관장 달님이에요. 유령선 소문을 조사하러 왔다가\n검은 옷의 사람들에게 이 선실에 갇혀 버렸어요.');
    await say('관장 달님: 갑판의 도깨비불은 가짜예요. 그 사람들이 붙잡은 도깨비불에게\n억지로 불을 피우게 하고 있어요. 하지만…');
    await say('관장 달님: 이 배에는 진짜 무언가가 있어요. 밤마다 연회장에서 피아노 소리가 나고,\n선장실 쪽에서 누군가 우는 소리도 들렸어요.');
    await say('관장 달님: 지친 몬스터들은 제가 돌봐 줄게요. 조심해서 다녀오세요!');
  } else await say('관장 달님: 쉬었다 가세요. 이 배의 비밀을 꼭 밝혀 주세요!');
  await healParty();
}

export async function wardrobe() {
  if (f('ship_key')) {
    await say('텅 빈 옷장이다. 좀약 냄새가 난다.');
    return;
  }
  await say('덜컹—! 옷장 문을 열자 안에서 차가운 바람이 훅 불어왔다.');
  await say('…낡은 선원복 주머니에 무언가 묵직한 것이 들어 있다.');
  game.flags.ship_key = true;
  world.refreshNPCs();
  await giveItem('enginekey', 1, true);
  await say('기관실 열쇠다! 갑판 뒤쪽의 기관실 문을 열 수 있을 것 같다.');
}

// --- ballroom: the candle puzzle -------------------------------------------------

const CANDLE_ORDER = ['파도', '달', '별', '해'];
let lit = 0;

export const candleProp = (sym: string) => () => (f('ship_watch') || CANDLE_ORDER.indexOf(sym) < lit ? '>' : '<');

export async function candleTalk(sym: string) {
  if (f('ship_watch')) {
    await say(`「${sym}」 촛대에 따뜻한 불이 일렁이고 있다.`);
    return;
  }
  const idx = CANDLE_ORDER.indexOf(sym);
  if (idx < lit) {
    await say(`「${sym}」 촛대에는 이미 불이 켜져 있다.`);
    return;
  }
  if (!(await yesNo(`받침에 「${sym}」 모양이 새겨진 촛대다. 불을 붙여 볼까?`))) return;
  if (idx !== lit) {
    lit = 0;
    await flashes(1);
    await say('후욱——! 차가운 바람이 불어 촛불이 모두 꺼져 버렸다.\n…어디선가 낮게 웃는 소리가 들린다.');
    if (!f('ship_log1')) await say('순서가 있는 것 같다. 어딘가에 실마리가 있지 않을까?');
    return;
  }
  lit++;
  await say(`「${sym}」 촛대에 불이 붙었다.`);
  if (lit < CANDLE_ORDER.length) return;
  game.flags.ship_watch = true;
  await wait(20);
  await say('네 촛불이 모두 켜지자… 아무도 없는 피아노가 저절로 연주를 시작했다!');
  await flashes(2);
  await say('♪ 잔잔한 뱃노래가 연회장을 가득 채운다…\n노래가 끝나자 피아노 뚜껑 위에 회중시계 하나가 놓여 있었다.');
  await giveItem('captainwatch', 1, true);
  await say('뚜껑 안쪽에 「해월」이라고 새겨진 선장의 회중시계다.\n조종실 자물쇠의 홈과 모양이 똑같다!');
}

export async function pianoTalk() {
  if (f('ship_watch')) await say('피아노 건반이 스스로 아주 작게 눌렸다 올라왔다…');
  else await say('먼지 쌓인 그랜드 피아노다. 건반 하나가 차갑게 젖어 있다.');
}

// --- engine room: the valve puzzle ------------------------------------------------

const VALVE_START = [false, true, false, true];
const VALVE_LINKS = [[0, 1], [0, 1, 2], [1, 2, 3], [2, 3]];
const valveOpen = (i: number) => VALVE_START[i] !== f('ship_v' + i);
const gauge = () => VALVE_START.map((_, i) => (valveOpen(i) ? '●' : '○')).join(' ');

export async function valveTalk(i: number) {
  if (f('ship_power')) {
    await say('밸브가 활짝 열려 있다. 증기가 힘차게 흐른다.');
    return;
  }
  if (!(await yesNo(`${i + 1}번 밸브다. 돌려 볼까?\n(지금 상태: ${gauge()})`))) return;
  for (const k of VALVE_LINKS[i]) game.flags['ship_v' + k] = !f('ship_v' + k);
  await say(`끼기긱… ${i + 1}번 밸브를 돌리자 이어진 배관의 밸브도 함께 돌아갔다.\n(지금 상태: ${gauge()})`);
  if (VALVE_START.every((_, k) => valveOpen(k))) await say('쉬이익——! 모든 배관에 증기가 흐르기 시작했다.\n이제 발전기를 켤 수 있을 것 같다.');
}

export async function generatorTalk() {
  if (f('ship_power')) {
    await say('발전기가 웅웅 소리를 내며 힘차게 돌아가고 있다.');
    return;
  }
  if (!VALVE_START.every((_, k) => valveOpen(k))) {
    await say(`발전기다. 증기가 부족해서 돌아가지 않는다.\n벽에 붙은 안내문: 「네 밸브를 모두 열 것 — 밸브는 옆 배관과 이어져 있음」\n(지금 상태: ${gauge()})`);
    return;
  }
  game.flags.ship_power = true;
  await say('발전기 스위치를 올렸다…');
  await flashes(2);
  await say('윙——! 은파호 전체에 불이 들어왔다!\n갑판의 안개 사이로 따뜻한 불빛이 번져 나간다.');
}

// --- bridge -------------------------------------------------------------------

export async function shipAdminWinV2() {
  await say('간부 잿빛: 세 번이나… 정말 지긋지긋한 꼬마로군.');
  await say('간부 잿빛: …좋다, 알려 주지. 흑영 님은 남쪽 불꽃산으로 가셨다.\n화산의 심장에 남은 별빛결정을 꽂아 화산을 다스리시겠다고 하셨지.');
  await say('간부 잿빛: 그분은… 원래 나쁜 분이 아니야. 십 년 전 화산 폭발로\n고향을 잃으셨지. 다시는 그런 일이 없게 하겠다고…');
  await say('간부 잿빛: 그리고 경고해 두지. 이 배엔 진짜가 있어.\n우리가 키를 건드릴 때마다 배 전체가 울었다고! 난 이제 손 떼겠다.');
  await fadeTo(1, 10);
  game.flags.ship_admin = true;
  world.refreshNPCs();
  await wait(10);
  await fadeTo(0, 10);
  await say('검은안개단은 배에서 달아났다.\n붙잡혀 있던 도깨비불들이 조종실 안을 맴돌며 키를 가리키고 있다…');
}

export async function wheelTalk() {
  if (!f('ship_admin')) {
    await say('커다란 조타륜이다. 지금은 검은안개단이 지키고 있다.');
    return;
  }
  if (f('ship_wheel')) {
    await say('조타륜이 천천히 저절로 돌아가고 있다…');
    return;
  }
  if (!(await yesNo('도깨비불들이 조타륜 주위를 맴돈다. 키를 돌려 볼까?'))) return;
  game.flags.ship_wheel = true;
  await say('끼이이익…');
  await flashes(2);
  await say('부우우웅——! 30년 만에 은파호의 뱃고동이 울려 퍼졌다!');
  await say('조종실 뒤쪽 벽이 스르르 열리고, 숨겨져 있던 문이 나타났다.\n문틈으로 푸른 불빛이 새어 나온다…');
  world.refreshNPCs();
}

// --- the captain --------------------------------------------------------------------

const captainTeam = (): TrainerDef => ({
  id: 'captain_haewol', cls: '은파호 선장', name: '해월', pal: PAL.captain,
  team: [['mulgwi', 31], ['haegol', 31], ['dokkae', 33]],
  reward: 3000, intro: '', defeat: '…훌륭하구나. 몬스터들이 너를 믿고 있어.', after: '',
});

export async function captainTalk() {
  if (f('shipDone')) {
    await say('…선장실은 고요하다. 책상 위 항해일지가 마지막 장에서 덮여 있다.');
    return;
  }
  await say('???: …누구냐. 내 배의 키를 돌린 자는.');
  await say('푸르스름한 빛에 둘러싸인 선원 차림의 남자가 천천히 돌아섰다.\n발끝이 바닥에 닿아 있지 않다…!');
  await say('해월: 나는 이 배의 선장, 해월. 30년 전 폭풍의 밤,\n승객들을 모두 구명보트에 태우고 나는 배와 함께 가라앉았지.');
  await say('해월: 도깨비불들은 나를 혼자 둘 수 없다며 이 배를 떠나지 않았다.\n그런데 검은 옷의 무리가 그 아이들을 붙잡아 사람들을 겁주는 데 썼더구나.');
  await say('해월: 아이들을 구해 준 게 너로구나. 고맙다…\n하지만 아이들을 맡길 사람인지, 이 늙은 선장이 직접 확인해야겠다!');
  const res = await trainerBattle(captainTeam(), true);
  if (res !== 'win') {
    await say('해월: 아직은 아이들을 맡길 수 없겠구나. 다시 오거라.');
    return;
  }
  await say('해월: …그래, 너라면 괜찮겠다.');
  await say('해월: 도깨비불들아, 이제 그만 나를 놓아주렴.\n너희는 이 젊은이와 함께 넓은 바다를 보러 가거라.');
  await flashes(2);
  await say('선장의 몸이 따뜻한 빛으로 흩어지기 시작했다…');
  await say('해월: 항해일지를 마저 써야겠군.\n「은파호, 마지막 항해를 무사히 마침.」…고맙다, 트레이너.');
  await fadeTo(1, 16);
  game.flags.shipDone = true;
  world.refreshNPCs();
  await wait(16);
  await fadeTo(0, 16);
  await say('선장은 사라지고, 선장실에는 고요한 빛만 남았다.\n도깨비불 한 마리가 떠나지 않고 곁을 맴돈다.');
  await giveMon('dokbul', 30);
  await say('갑판 쪽에서 관장 달님의 목소리가 들려왔다.\n「고마워요! 수련관에서 기다릴게요!」');
}

export async function shipExitCheck() {
  // leaving the ship before the end: just a little scare
  if (!f('shipDone') && f('ship_intro') && !f('ship_left_once')) {
    game.flags.ship_left_once = true;
    await say('…등 뒤에서 누군가 속삭였다. 「돌아… 와…」');
  }
  await warpTo('town5', 19, 12, 'down');
}
