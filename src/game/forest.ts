import { say } from '../engine/ui';
import { wait } from '../engine/timing';
import { flashes } from '../engine/scene';
import { jingle, sfx } from '../engine/audio';
import { game } from './state';
import { world, warpTo, giveItem } from './api';

// ---------------------------------------------------------------------------
// 2장 「속삭임숲」: after the Black Fog is driven out, a baby 몽몽이 is still lost
// in the deep grove, where paths knot together. Only the way a firefly lights up
// leads on; the old tree at the heart of the forest holds the nest the egg came from.

const ORDER: ('up' | 'left' | 'right')[] = ['right', 'up', 'left', 'up'];
const step = () => [0, 1, 2, 3].filter((i) => game.flags['grove' + i]).length;
/** Which exit the firefly lights for the current step (hidden once solved). */
export const fireflyAt = (dir: 'up' | 'left' | 'right') => step() < ORDER.length && ORDER[step()] === dir;

export async function groveExit(dir: 'up' | 'left' | 'right') {
  const s = step();
  if (ORDER[s] !== dir) {
    for (let i = 0; i < 4; i++) game.flags['grove' + i] = false;
    await say('…같은 나무를 몇 번이나 지난 것 같다.\n정신을 차려 보니 처음 들어왔던 숲길이다.');
    await warpTo('forest', 1, 24, 'right');
    return;
  }
  game.flags['grove' + s] = true;
  sfx('door');
  if (s + 1 >= ORDER.length) {
    await say('반딧불이 한데 모여 둥글게 춤추더니, 나무들이 스르르 길을 비켜 준다…');
    await warpTo('forest_tree', 6, 8, 'up');
    return;
  }
  const lines = ['…이쪽…  이쪽이야…', '…조금만 더…', '…거의 다 왔어…'];
  await warpTo('forest_grove', 7, 6, 'up');
  await say(`어디선가 속삭임이 들린다.\n「${lines[s] ?? '…'}」`);
}

export async function groveEnter() {
  for (let i = 0; i < 4; i++) game.flags['grove' + i] = false;
}

export async function fireflyTalk() {
  await say('반디가 반짝반짝 빛나며 숲길 한쪽을 비추고 있다.');
}

export async function whisper(flag: string, text: string) {
  if (game.flags[flag]) return;
  game.flags[flag] = true;
  await say(`어디선가 속삭이는 소리가 들린다…\n「${text}」`);
}

export async function oldTree() {
  await say('하늘을 가릴 만큼 커다란 고목이다. 줄기에 손을 대자 따뜻한 기운이 느껴진다.');
  if (!game.flags.treeBlessing) {
    game.flags.treeBlessing = true;
    await flashes(1);
    await say('나뭇잎 사이로 초록빛 가루가 쏟아져 내린다…\n「숲을 지켜 줘서 고마워」 하고 속삭이는 것 같다.');
    await giveItem('revive', 1, true);
  }
}

export async function nestTalk() {
  await say('고목 뿌리 사이에 커다란 둥지가 있다. 깨진 알껍데기가 남아 있다.');
  await say('껍데기에 비늘 같은 무늬가 있다. 할머니가 주웠다는 알은\n이곳에서 굴러 나온 모양이다.');
}

export async function lostMong() {
  if (game.flags.groveMong) return;
  await say('아기 몽몽이가 둥지 옆에 웅크린 채 바들바들 떨고 있다…');
  await say('손을 내밀자 몽몽이가 코를 킁킁대더니, 품 안으로 폴짝 뛰어들었다!');
  jingle('item');
  game.flags.groveMong = true;
  world.refreshNPCs();
  await wait(10);
  await say('몽몽이를 숲지기 할머니에게 데려다주자.');
}
