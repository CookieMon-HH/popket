import { say, yesNo, choose } from '../engine/ui';
import { game, itemCount, removeItem } from './state';
import { world, giveItem, warpTo } from './api';
import { j } from './common';

// ---------------------------------------------------------------------------
// 팜팜 사파리 (파도항구)
//
// Quest: three baby monsters escaped through a broken fence. Bring them all
// back and the park opens (with free tickets). Each visit uses one ticket and
// lasts 10 minutes of walking time with 30 safari balls.

export const SAFARI_FRAMES = 60 * 60 * 10;
export const SAFARI_BALLS = 30;
export const TICKET_PRICE = 1500;

/** The escaped monsters: flag id, species name for dialogue. */
export const ESCAPEES: [string, string][] = [
  ['lost_yuni', '아기유니'],
  ['lost_mong', '몽몽이'],
  ['lost_gom', '아기곰돌'],
];

const foundCount = () => ESCAPEES.filter(([id]) => game.flags[id]).length;

export async function escapeeTalk(id: string, name: string) {
  await say(`${j(name, '이/가')} 반가운 듯 다가와 몸을 비볐다!\n목에 「팜팜 사파리」 이름표가 달려 있다.`);
  game.flags[id] = true;
  world.refreshNPCs();
  const n = foundCount();
  if (n < ESCAPEES.length) await say(`${j(name, '은/는')} 얌전히 뒤를 따라오기로 했다.\n(찾은 아이들 ${n}/${ESCAPEES.length})`);
  else await say(`${j(name, '은/는')} 얌전히 뒤를 따라오기로 했다.\n도망친 아이들을 모두 찾았다! 사파리 관리인에게 돌아가자.`);
}

export async function keeperTalk() {
  const f = game.flags;
  if (!f.safariQuest) {
    await say('사파리 관리인 초원: 어서 와요! 여기는 팜팜 사파리 입구예요.\n…라고 말하고 싶지만, 지금은 문을 닫았어요.');
    await say('사파리 관리인 초원: 어젯밤 폭풍에 울타리가 부서져서\n아기 몬스터 셋이 밖으로 도망쳤거든요. 아기유니, 몽몽이, 아기곰돌이에요.');
    await say('사파리 관리인 초원: 항구 근처나 북쪽 4번 도로 어딘가에 숨어 있을 거예요.\n찾아서 말을 걸어 주면 따라올 거예요. 부탁해요!');
    f.safariQuest = true;
    world.refreshNPCs();
    return;
  }
  if (!f.safariOpen) {
    const n = foundCount();
    if (n < ESCAPEES.length) {
      await say(`사파리 관리인 초원: 아직 ${ESCAPEES.length - n}마리가 돌아오지 않았어요.\n항구 근처와 4번 도로 풀숲을 잘 살펴봐 주세요!`);
      return;
    }
    await say('사파리 관리인 초원: 어머나, 세 마리 모두 데려와 줬군요!\n울타리도 방금 다 고쳤어요. 정말 고마워요!');
    f.safariOpen = true;
    await say('사파리 관리인 초원: 오늘부터 팜팜 사파리를 열게요.\n고마운 마음을 담아 입장권을 드릴게요!');
    await giveItem('safariticket', 3);
    await say('사파리 관리인 초원: 사파리 안에서는 내 몬스터로 싸울 수 없어요.\n사파리볼을 던지거나, 먹이나 진흙으로 몬스터의 마음을 흔들어 보세요.');
    await say('사파리 관리인 초원: 먹이를 주면 잘 도망가지 않지만 잡기 어려워지고,\n진흙을 던지면 잡기 쉬워지지만 금방 도망가요. 이용 시간은 10분이에요!');
  }
  for (;;) {
    const c = await choose(`사파리 관리인 초원: 팜팜 사파리에 어서 오세요!\n(입장권 ${itemCount('safariticket')}장 · 소지금 ${game.money.toLocaleString()}원)`, ['입장하기', `입장권 사기 (${TICKET_PRICE}원)`, '설명 듣기', '그만두기']);
    if (c === 0) {
      if (itemCount('safariticket') <= 0) {
        await say('사파리 관리인 초원: 입장권이 없네요. 여기서 한 장 사 가세요!');
        continue;
      }
      if (!(await yesNo('입장권 1장을 사용해서 사파리에 들어갈까요?\n(제한 시간 10분 · 사파리볼 30개)'))) continue;
      removeItem('safariticket');
      game.safari = { balls: SAFARI_BALLS, left: SAFARI_FRAMES };
      await say('사파리 관리인 초원: 사파리볼 30개를 드릴게요. 즐거운 시간 보내세요!');
      await warpTo('safari', 17, 21, 'up');
      return;
    }
    if (c === 1) {
      if (game.money < TICKET_PRICE) {
        await say('사파리 관리인 초원: 앗, 돈이 조금 모자라네요…');
        continue;
      }
      game.money -= TICKET_PRICE;
      await giveItem('safariticket', 1);
      continue;
    }
    if (c === 2) {
      await say('사파리에서는 풀숲과 물가에서 다양한 몬스터를 만날 수 있어요.\n다른 곳에서는 보기 힘든 귀한 몬스터도 살고 있답니다!');
      await say('사파리볼: 던져서 잡아요.\n먹이: 도망을 잘 안 가지만, 잡기는 조금 어려워져요.\n진흙: 잡기 쉬워지지만, 화가 나서 금방 도망가요.');
      await say('제한 시간 10분이 지나거나 사파리볼을 다 쓰면 입구로 돌아와요.\n시간은 걷고 있을 때만 흘러가요. 낚싯대가 있다면 연못에서 낚시도 해 보세요!');
      continue;
    }
    await say('사파리 관리인 초원: 또 오세요!');
    return;
  }
}

/** Leave the park: time up, out of balls, or by choice. */
export async function safariEnd(reason: 'time' | 'balls' | 'leave') {
  if (reason === 'time') await say('삐——! 사파리 이용 시간이 끝났습니다!');
  else if (reason === 'balls') await say('삐——! 사파리볼을 모두 사용했습니다!');
  game.safari = undefined;
  await warpTo('safarigate', 4, 5, 'down');
  await say('사파리 관리인 초원: 수고하셨어요! 좋은 몬스터를 만나셨나요?\n다음에 또 놀러 오세요!');
}

export async function safariExitTile() {
  if (!game.safari) {
    await warpTo('safarigate', 4, 5, 'down');
    return;
  }
  if (await yesNo('사파리를 나갈까요?\n남은 시간과 사파리볼은 없어져요.')) {
    await safariEnd('leave');
    return;
  }
  await world.walk(world.player, 'up');
}
