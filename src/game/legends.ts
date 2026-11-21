import { say, yesNo } from '../engine/ui';
import { flashes } from '../engine/scene';
import { game } from './state';
import { createMon } from './monster';
import { world, wildBattle, trainerBattle, giveItem } from './api';
import { PAL } from './story';
import type { TrainerDef } from './maps';

// ---------------------------------------------------------------------------
// 엔딩 이후 — 수호신 전설 퀘스트
//
// Four guardian legends wake once the player is champion. Each one counters
// part of 태초의 챔피언 해솔's team, so catching and raising them is one way
// to prepare for the final post-game battle.

export const LEGENDS: { id: string; name: string; type: string; where: string }[] = [
  { id: 'seolhwa', name: '설화', type: '얼음·페어리', where: '서리마을 — 얼음굴 깊은 곳' },
  { id: 'cheolsan', name: '철산', type: '땅·강철', where: '별빛동굴 — 가장 깊은 갱도' },
  { id: 'jujak', name: '주작', type: '불·비행', where: '불꽃마을 — 불꽃산의 심장' },
  { id: 'cheongryong', name: '청룡', type: '전기·드래곤', where: '용의 마을 — 용의 둥지 꼭대기' },
];

export const caught = (id: string) => !!game.flags['lg_' + id];
const guardiansCaught = () => ['seolhwa', 'cheolsan', 'jujak'].filter(caught).length;

/** Battle (and maybe catch) a legend standing on the map. */
export async function legendEncounter(id: string, level: number, approach: string, roar: string) {
  if (!(await yesNo(approach))) return;
  await say(roar);
  const res = await wildBattle(createMon(id, level));
  if (res === 'caught') {
    game.flags['lg_' + id] = true;
    world.refreshNPCs();
    const left = LEGENDS.filter((l) => !caught(l.id)).length;
    await say(left ? `수호신을 동료로 맞이했다! (남은 수호신 ${left})` : '네 수호신을 모두 동료로 맞이했다!\n이제 천공의 신전에서 해솔과 겨룰 준비가 된 것 같다…');
    return;
  }
  if (res === 'win') await say('수호신은 빛이 되어 흩어졌다…\n잠시 후 다시 모습을 드러낼 것 같다.');
  else if (res === 'run') await say('수호신은 여전히 그 자리에서 이쪽을 지켜보고 있다.');
}

// --- 한별 박사: the legend notebook ----------------------------------------

export async function professorLegends() {
  if (!game.flags.legendNote) {
    game.flags.legendNote = true;
    await say('한별 박사: 그리고 {name}, 챔피언이 된 너에게 꼭 보여 주고 싶은 게 있단다.');
    await say('한별 박사: 해솔 지방에는 네 수호신의 전설이 전해진단다.\n얼음의 설화, 땅의 철산, 남쪽 하늘의 주작, 그리고 동쪽 하늘의 청룡.');
    await say('한별 박사: 챔피언이 탄생하면 수호신들이 깨어난다는 기록이 있어.\n각 마을 사람들에게 이야기를 들어 보렴. 실마리를 줄 거야.');
    await say('한별 박사: 천공의 신전의 해솔 님은 하늘과 땅의 모든 힘을 쓴다지.\n수호신의 힘이라면 그에 맞설 수 있을지도 몰라!');
  }
  const lines = LEGENDS.map((l) => `${caught(l.id) ? '★' : '☆'} ${l.name}(${l.type}) — ${l.where}`);
  await say('— 수호신 전설 수첩 —\n' + lines.slice(0, 2).join('\n'));
  await say(lines.slice(2).join('\n'));
  if (guardiansCaught() >= 3 && !caught('cheongryong')) await say('한별 박사: 세 수호신이 모였구나! 청룡은 용의 마을 촌장님이 알고 계실 거야.');
}

// --- 설화: 서리마을 -----------------------------------------------------------

export async function snowMomPost() {
  if (caught('seolhwa')) {
    await say('눈송이 엄마: 눈꽃사슴을 데려갔다고요? 그래서 오늘따라 눈송이가 반짝였구나!');
    return;
  }
  game.flags.lg_hint_seolhwa = true;
  world.refreshNPCs();
  await say('눈송이 엄마: 챔피언이 되셨다고요? 사실 눈송이가 이상한 말을 해요.\n얼음굴 깊은 곳에서 뿔에 꽃이 핀 하얀 사슴을 봤대요.');
  await say('눈송이 엄마: 옛날이야기에 나오는 수호신 「설화」일까요…?\n얼음굴 맨 위쪽, 눈송이가 갇혀 있던 곳이래요.');
}

// --- 철산: 별빛동굴 -----------------------------------------------------------

export async function minerPost(): Promise<boolean> {
  if (!game.flags.champion || caught('cheolsan')) return false;
  game.flags.lg_hint_cheolsan = true;
  world.refreshNPCs();
  await say('광부 대장 석두: 오, 챔피언! 마침 잘 왔네. 요즘 갱도 깊은 곳에서\n산이 통째로 울리는 소리가 나서 아무도 못 들어가고 있다네.');
  await say('광부 대장 석두: 옛 광부들은 그걸 수호신 「철산」의 발소리라고 했지.\n동굴 아래쪽 막다른 갱도에 가 보게. 무쇠 같은 몸에 조심하고!');
  return true;
}

// --- 주작: 불꽃마을 — 화련의 시험 -------------------------------------------------

// Built lazily: PAL comes from story.ts, which imports this module.
const hwaryeonRe = (): TrainerDef => ({
  id: 'hwaryeon_re', cls: '관장', name: '화련', pal: PAL.hwaryeon,
  team: [['jangjak', 67], ['seolpyo', 67], ['dokjeongal', 68], ['hwasan', 70]],
  reward: 9000, elite: true, heals: 1,
  intro: '', defeat: '…이 불꽃이라면 주작도 인정하겠지!', after: '',
});

export async function hwaryeonPost() {
  if (caught('jujak')) {
    await say('관장 화련: 주작이 네 곁에 있다니… 불꽃산도 기뻐하고 있을 거야!');
    return;
  }
  if (game.flags.lg_jujak_ok) {
    await say('관장 화련: 불꽃산의 심장으로 가 봐. 주작이 너를 기다리고 있어!');
    return;
  }
  await say('관장 화련: 챔피언이 된 {name}! 불꽃산에는 남쪽 하늘의 수호신\n「주작」이 잠들어 있다는 전설이 있어. 화산의 심장에서 깨어난대.');
  await say('관장 화련: 하지만 주작은 꺼지지 않는 불꽃을 가진 자만 만나 준다지.\n…내 진짜 실력과 겨뤄서 이긴다면, 길을 열어 줄게!');
  if (!(await yesNo('관장 화련: 진심으로 붙어 볼래?\n(Lv67~70 · 화련의 진짜 실력)'))) {
    await say('관장 화련: 준비되면 언제든 와!');
    return;
  }
  const res = await trainerBattle(hwaryeonRe(), true);
  if (res !== 'win') {
    await say('관장 화련: 아직이야! 불꽃을 더 키워서 와!');
    return;
  }
  game.flags.lg_jujak_ok = true;
  world.refreshNPCs();
  await say('관장 화련: 인정할게. 화산의 심장으로 가 봐!\n지금쯤 주작이 깨어났을 거야.');
  await giveItem('fullrestore', 2);
}

// --- 청룡: 용의 마을 촌장 -------------------------------------------------------

export async function elderPost(): Promise<boolean> {
  if (!game.flags.champion) return false;
  if (caught('cheongryong')) {
    await say('촌장: 청룡까지 함께하다니… 네 수호신이 모두 너를 인정했구먼.\n천공의 신전의 해솔도 놀랄 걸세.');
    return true;
  }
  if (game.flags.lg_call_cheongryong) {
    await say('촌장: 용의 둥지 꼭대기로 가 보게. 청룡이 내려와 있을 걸세!');
    return true;
  }
  const n = guardiansCaught();
  if (n < 3) {
    await say('촌장: 동쪽 하늘의 수호신 청룡은 설화·철산·주작,\n세 수호신이 한자리에 모일 때 번개와 함께 내려온다고 전해지네.');
    await say(`촌장: 지금 자네 곁에는 수호신이 ${n}마리… 세 수호신을 모두 데려오게나.`);
    return true;
  }
  await say('촌장: 오오… 자네에게서 세 수호신의 기운이 느껴지는구먼!');
  await flashes(2);
  await say('콰르릉——! 맑은 하늘에 푸른 번개가 내리쳤다!');
  game.flags.lg_call_cheongryong = true;
  world.refreshNPCs();
  await say('촌장: 청룡이 응답했네! 용의 둥지 꼭대기로 가 보게.\n먹구름이 서 있던 바로 그 자리일세.');
  return true;
}
