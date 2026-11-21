import { say, yesNo, choose } from '../engine/ui';
import { game } from './state';
import { createMon } from './monster';
import { world, wildBattle, giveItem, giveMon } from './api';
import { itemCount, removeItem } from './state';
import { wait } from '../engine/timing';
import { flashes } from '../engine/scene';

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

// ---------------------------------------------------------------------------
// 화석: dig one of two fossils in 별빛동굴, then 한별 박사 revives it.

export async function fossilSite() {
  const c = await choose('바위 틈에 화석 두 개가 박혀 있다.\n하나만 조심스럽게 꺼낼 수 있을 것 같다.', ['껍질화석', '날개화석', '그만두기']);
  if (c === 2) return;
  game.flags.fossilTaken = true;
  world.refreshNPCs();
  await giveItem(c === 0 ? 'fossil_shell' : 'fossil_wing', 1, true);
  await say('남은 화석은 바위째 무너져 내렸다…\n한별 박사님이라면 이 화석을 되살릴 수 있을지도 모른다.');
}

/** Called from 한별 박사's talk; returns true when a fossil was revived. */
export async function reviveFossil(): Promise<boolean> {
  const shell = itemCount('fossil_shell') > 0;
  const wing = itemCount('fossil_wing') > 0;
  if (!shell && !wing) return false;
  const name = shell ? '껍질화석' : '날개화석';
  if (!(await yesNo(`한별 박사: 오오, 그건 ${name}가 아니니! 별빛동굴에서 찾았구나.\n연구소 장비로 되살려 볼까?`))) return true;
  removeItem(shell ? 'fossil_shell' : 'fossil_wing');
  await say('한별 박사: 자, 복원 장치에 넣고… 스위치를 켜면…');
  await wait(20);
  await flashes(2);
  await say('한별 박사: 성공이다! 수억 년 전의 몬스터가 다시 눈을 떴구나!');
  await giveMon(shell ? 'jogae' : 'kkomasijo', 18);
  return true;
}
