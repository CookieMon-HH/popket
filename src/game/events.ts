import { say, choose } from '../engine/ui';
import { wait } from '../engine/timing';
import { flashes } from '../engine/scene';
import { jingle } from '../engine/audio';
import { game } from './state';
import { world, giveMon } from './api';

// ---------------------------------------------------------------------------
// 별빛시 골동품 가게: the music box that plays by itself at night.

const TUNE = ['도', '미', '솔', '높은 도'];

export async function antiqueOwner() {
  if (game.flags.orgolDone) {
    await say('골동품 가게 할머니: 그 아이는 잘 지내니? 오르골이 조용해져서 조금 쓸쓸하지만…\n그래도 이제 마음껏 춤출 수 있겠구나.');
    return;
  }
  game.flags.orgolHint = true;
  await say('골동품 가게 할머니: 어서 오렴. 저 오르골이 궁금하니?\n돌아가신 영감이 나를 위해 만들어 준 거란다.');
  await say('골동품 가게 할머니: 그런데 영감이 떠난 뒤로 밤마다 저절로 울리기 시작했어.\n노래가 늘 끝을 맺지 못하고 중간에 뚝 끊기지 뭐니…');
  await say('골동품 가게 할머니: 영감은 그 노래를 흥얼거릴 때마다\n「도, 미, 솔… 그리고 높은 도」로 끝을 맺곤 했지.');
}

export async function musicBox() {
  if (game.flags.orgolDone) {
    await say('텅 빈 오르골이다. 받침 위에 작은 발자국 자국만 남아 있다.');
    return;
  }
  await say('발레리나 인형이 올라간 낡은 오르골이다.\n…인형이 살짝 고개를 돌린 것 같다.');
  if (!game.flags.orgolHint) {
    await say('태엽을 감아 보았지만 멜로디가 중간에 멈춰 버렸다.\n가게 주인에게 이야기를 들어 보자.');
    return;
  }
  await say('끊긴 멜로디의 마지막 네 음을 이어서 눌러 보자.');
  const picked: string[] = [];
  for (let i = 0; i < 4; i++) {
    const c = await choose(`${i + 1}번째 음은?  (${picked.join(' · ') || '…'})`, [...TUNE, '그만두기']);
    if (c === 4) return;
    picked.push(TUNE[c]);
  }
  if (picked.join() !== TUNE.join()) {
    await say(`♪ ${picked.join(' · ')}…\n멜로디가 어긋나 오르골이 덜컹 멈춰 버렸다.`);
    return;
  }
  jingle('heal');
  await say('♪ 도 · 미 · 솔 · 높은 도…\n처음으로 노래가 끝까지 울려 퍼졌다!');
  await flashes(2);
  await say('발레리나 인형이 받침에서 사뿐히 내려와 한 바퀴 빙그르르 돌았다…!');
  await say('골동품 가게 할머니: 어머나… 영감, 거기 있었구려.\n이 아이는 노래를 끝까지 들려줄 사람을 기다리고 있었나 보구나.');
  await say('골동품 가게 할머니: 그 아이가 너를 따라가고 싶어 하는구나.\n부디 데려가서 많은 사람 앞에서 춤추게 해 주렴.');
  await wait(10);
  game.flags.orgolDone = true;
  world.refreshNPCs();
  await giveMon('orgol', 24);
}
