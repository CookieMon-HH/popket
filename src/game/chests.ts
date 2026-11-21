import { say, yesNo } from '../engine/ui';
import { game } from './state';
import { createMon } from './monster';
import { world, wildBattle, giveItem } from './api';

// ---------------------------------------------------------------------------
// 보물상자: opening one gives an item, or a 보물상자도깨비 jumps out.

export const chestProp = (id: string) => () => (game.flags['chest_' + id] ? '¤' : '§');

export async function chestTalk(id: string, item: string, qty: number, mimicLevel: number) {
  const key = 'chest_' + id;
  if (game.flags[key]) {
    await say('텅 빈 보물상자다.');
    return;
  }
  if (!(await yesNo('낡은 보물상자가 놓여 있다. 열어 볼까?'))) return;
  // Some chests are 보물상자도깨비 in disguise.
  if (Math.random() < 0.35) {
    await say('뚜껑을 열자… 상자가 이빨을 드러냈다!\n보물상자도깨비다!');
    const res = await wildBattle(createMon('bomulgoe', mimicLevel));
    if (res === 'lose') return;
    if (res === 'run') {
      await say('보물상자도깨비는 다시 상자인 척하고 있다…');
      return;
    }
    await say('도깨비가 사라진 자리에 무언가 반짝인다.');
  }
  game.flags[key] = true;
  world.refreshNPCs();
  await giveItem(item, qty, true);
}
