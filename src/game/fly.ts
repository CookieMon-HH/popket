import { OX, BW } from '../engine/draw';
import { ui, Menu, say } from '../engine/ui';
import { game, itemCount } from './state';
import { world, warpTo, giveItem } from './api';
import { flashes } from '../engine/scene';
import { j } from './common';

// ---------------------------------------------------------------------------
// 날아가기: once the 바람피리 quest is done, the 회오리매 of 바람 조련사 솔바람
// carries the player to any town they have already visited.

/** [map id, name, landing x, landing y (in front of the 회복소), progress flag that implies a visit]. */
const TOWNS: [string, string, number, number, string][] = [
  ['town1', '솔빛마을', 4, 5, 'gotStarter'],
  ['town2', '들꽃마을', 4, 8, 'badge1'],
  ['town3', '물안개마을', 4, 8, 'badge2'],
  ['town4', '별빛시', 3, 8, 'badge3'],
  ['town5', '파도항구', 4, 9, 'badge4'],
  ['town6', '불꽃마을', 4, 9, 'badge5'],
  ['town7', '서리마을', 4, 9, 'badge6'],
  ['town8', '용의 마을', 4, 9, 'badge7'],
  ['plateau', '해솔고원', 4, 11, 'champion'],
];

const visited = (id: string, implied: string) => !!(game.flags['visit_' + id] || game.flags[implied]);

export const canFly = () => itemCount('windwhistle') > 0;

export async function flyMenu() {
  if (world.map.indoor || world.map.safari || world.map.dark) {
    await say('여기서는 바람피리를 불어도 회오리매가 들어올 수 없다.\n밖으로 나가서 불어 보자.');
    return false;
  }
  const list = TOWNS.filter(([id, , , , imp]) => visited(id, imp));
  const items = [...list.map((t) => t[1]), '그만두기'];
  const k = await ui.run(new Menu({ items, cancel: true, x: OX + BW - 92, y: 2, w: 88, rowH: 15 }));
  if (k < 0 || k >= list.length) return false;
  const [id, name, x, y] = list[k];
  await say(`{name}은(는) 바람피리를 불었다!\n회오리매가 날아와 ${j(name, '으로/로')} 데려다준다!`);
  await flashes(1);
  await warpTo(id, x, y, 'down');
  return true;
}

export async function windTamerTalk() {
  const f = game.flags;
  if (canFly()) {
    await say('바람 조련사 솔바람: 바람피리는 잘 쓰고 있니?\n밖에서 메뉴의 「날아가기」를 고르면 가 본 마을로 바로 날아갈 수 있어.');
    return;
  }
  if (!f.badge4) {
    await say('바람 조련사 솔바람: 나는 바다 바람을 타고 나는 새 몬스터를 길러.\n…달빛배지를 받은 트레이너라면 재미있는 걸 부탁해 볼 텐데.');
    return;
  }
  if (!f.windQuest) {
    f.windQuest = true;
    await say('바람 조련사 솔바람: 달빛배지를 받았구나! 그럼 부탁 하나 할게.');
    await say('바람 조련사 솔바람: 바람새를 키우면 회오리매가 돼. 하늘의 왕이라 불리는 녀석이지.\n회오리매를 데려와서 보여 주면, 내 보물을 줄게!');
    await say('바람 조련사 솔바람: 4번 도로 풀숲에서 회오리매를 만날 수 있어.\n짹짹이나 바람새를 키워도 되고!');
    return;
  }
  if (!game.party.some((m) => m.species === 'hoeori')) {
    await say('바람 조련사 솔바람: 회오리매는 아직이야?\n4번 도로 풀숲이나, 바람새를 레벨 28까지 키우면 만날 수 있어!');
    return;
  }
  await say('바람 조련사 솔바람: 와아, 멋진 회오리매다! 깃털에 윤기가 흐르네.\n너라면 하늘 친구들이 믿고 따라갈 거야.');
  await giveItem('windwhistle');
  await say('바람 조련사 솔바람: 이 바람피리를 불면 내 회오리매 친구들이 와서\n한 번 가 본 마을이라면 어디든 데려다줄 거야.');
  await say('바람 조련사 솔바람: 메뉴에서 「날아가기」를 골라 봐.\n건물 안이나 동굴에서는 쓸 수 없으니 밖에서 불어야 해!');
}
