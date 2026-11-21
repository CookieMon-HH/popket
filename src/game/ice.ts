import { say } from '../engine/ui';
import { game } from './state';
import { world } from './api';

// ---------------------------------------------------------------------------
// 6장 「서리마을의 눈보라」: 눈송이's dropped mitten leads deeper into the ice cave,
// to a frozen lake whose walls hold ancient murals about the 여의주 and 설화.

export async function mittenTalk() {
  if (game.flags.mitten) return;
  game.flags.mitten = true;
  world.refreshNPCs();
  await say('얼음 위에 작은 벙어리장갑이 떨어져 있다. 눈송이 것 같다.');
  await say('장갑 옆으로 작은 발자국과 아기곰 발자국이 나란히,\n굴 더 깊은 곳으로 이어져 있다…');
}

const MURALS = [
  ['얼음 벽에 오래된 벽화가 새겨져 있다.', '커다란 용이 빛나는 구슬을 하늘 높이 띄우고 있다.\n구름과 비와 눈이 구슬 둘레를 얌전히 맴돈다.'],
  ['얼음 벽에 오래된 벽화가 새겨져 있다.', '구슬이 땅으로 떨어지자, 북쪽 하늘에서 눈보라가 끝없이 쏟아진다.\n사람들이 얼음 속에 웅크리고 있다.'],
  ['얼음 벽에 오래된 벽화가 새겨져 있다.', '눈꽃이 핀 뿔을 가진 하얀 사슴이 눈보라 앞을 막아서서\n아이들을 지키고 있다. 옆에 「설화」라는 옛 글자가 보인다.'],
];
export async function mural(i: number) {
  for (const line of MURALS[i]) await say(line);
  game.flags['mural' + i] = true;
}
export const allMurals = () => [0, 1, 2].every((i) => game.flags['mural' + i]);

/** Weather over the snowy north: a blizzard until the 여의주 is back. */
export const northWeather = () => (game.flags.pearlReturned ? 'snow' : 'blizzard') as 'snow' | 'blizzard';
