import { say, choose } from '../engine/ui';
import { flashes } from '../engine/scene';
import { sfx, jingle } from '../engine/audio';
import { game } from './state';
import { world } from './api';

// ---------------------------------------------------------------------------
// 7장 「용의 마을과 여의주」: the altar where the 여의주 floats is sealed. A star
// mural shows the dragon constellation; lighting the braziers for its three bright
// stars (머리·심장·꼬리) opens the gate.

export const BRAZIERS = ['머리', '날개', '심장', '발톱', '꼬리'];
const ANSWER = [0, 2, 4];
const lit = (i: number) => !!game.flags['brz' + i];
export const altarOpen = () => !!game.flags.altarOpen || !!game.flags.denDone;
export const brazierProp = (i: number) => () => (lit(i) || altarOpen() ? 'ⓒ' : 'ⓑ');

export async function brazier(i: number) {
  if (altarOpen()) {
    await say(`용의 ${BRAZIERS[i]}가 새겨진 화로다. 푸른 불꽃이 고요히 타오르고 있다.`);
    return;
  }
  await say(`용의 ${BRAZIERS[i]} 모양이 새겨진 돌 화로다. ${lit(i) ? '푸른 불꽃이 타오르고 있다.' : '불이 꺼져 있다.'}`);
  if ((await choose(lit(i) ? '불을 끌까?' : '불을 붙일까?', ['그렇게 한다', '그만둔다'])) !== 0) return;
  game.flags['brz' + i] = !lit(i);
  sfx('door');
  const on = BRAZIERS.map((_, k) => k).filter(lit);
  world.refreshNPCs();
  if (on.length < ANSWER.length) return;
  if (on.length === ANSWER.length && ANSWER.every((k) => lit(k))) {
    game.flags.altarOpen = true;
    world.refreshNPCs();
    await flashes(2);
    jingle('item');
    await say('세 개의 불꽃이 별처럼 밝게 빛나더니,\n쿠르릉… 제단으로 가는 돌문이 천천히 열렸다!');
    return;
  }
  for (let k = 0; k < BRAZIERS.length; k++) game.flags['brz' + k] = false;
  world.refreshNPCs();
  await say('휘이잉… 둥지 안으로 찬바람이 불어 들어와 불꽃이 모두 꺼져 버렸다.\n별자리와 맞지 않는 것 같다.');
}

export async function starMural() {
  await say('천장 가까이 별자리 그림이 새겨져 있다. 몸을 길게 늘인 용의 모습이다.');
  await say('용의 머리, 가슴 한가운데의 심장, 그리고 꼬리 끝에\n유난히 큰 별 세 개가 박혀 있다.');
  await say('그 아래 옛 글귀: 「세 별에 불을 밝히는 자에게 하늘의 문이 열리리라.」');
}

export async function cloudNote() {
  game.flags.cloudNote = true;
  await say('구겨진 쪽지가 떨어져 있다. 먹구름의 글씨 같다.');
  await say('「흑영 님은 해산을 선언하셨다. 하지만 우리 같은 녀석들은 갈 곳이 없다.\n 숯골이 사라진 뒤로, 검은안개단이 유일한 집이었으니까.」');
  await say('「여의주로 하늘을 손에 넣으면, 다시는 누구에게도 쫓겨나지 않겠지.」');
}

export async function pearlAltar() {
  if (game.flags.denDone) {
    await say('텅 빈 제단 위에 희미한 빛의 잔상이 남아 있다.');
    return;
  }
  await say('제단 위에 여의주가 떠 있다. 주위로 먹구름이 소용돌이치고 있어 손이 닿지 않는다.');
}
