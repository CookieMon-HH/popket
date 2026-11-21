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

// ---------------------------------------------------------------------------
// 들꽃마을: a girl whose fox kit keeps sneaking out to look at the stars.

export async function foxGirl() {
  if (game.flags.foxGift) {
    await say('여우를 좋아하는 소녀: 꼬리별여우는 잘 지내? 어떤 돌을 보여 주느냐에 따라\n불여우도, 그늘여우도, 가시여우도 된대. 천천히 골라 줘!');
    return;
  }
  if (!game.flags.badge1) {
    await say('여우를 좋아하는 소녀: 우리 집 꼬리별여우가 새끼를 낳았어!\n그런데 이 아이는 자꾸 밤마다 별을 보러 나가 버려…');
    return;
  }
  await say('여우를 좋아하는 소녀: 앗, 그 배지! 수련관에서 이긴 트레이너구나!');
  await say('여우를 좋아하는 소녀: 이 꼬리별여우는 마을 밖 넓은 세상을 보고 싶어 해.\n너라면 맡겨도 될 것 같아. 데려가 줄래?');
  if ((await choose('꼬리별여우를 데려갈까?', ['데려간다', '나중에'])) !== 0) {
    await say('여우를 좋아하는 소녀: 그래… 마음이 바뀌면 언제든 말해 줘!');
    return;
  }
  game.flags.foxGift = true;
  await giveMon('kkoribyeol', 12);
  await say('여우를 좋아하는 소녀: 꼬리별여우는 진화의 돌로 진화해.\n불꽃의돌, 그늘의돌, 가시의돌… 별빛시를 지나면 상점에서 팔 거야!');
}

// ---------------------------------------------------------------------------
// 파도항구: the old shipwright rebuilds an ironclad after the ghost ship is calmed.

export async function shipwright() {
  if (game.flags.geobukGift) {
    await say('늙은 배목수: 거북선은 잘 크고 있나? 철갑은 녹슬지 않게 가끔 닦아 주게.');
    return;
  }
  if (!game.flags.shipDone) {
    await say('늙은 배목수: 남쪽 부두의 유령선 때문에 바다에 나가질 못하네.\n내 오랜 짝꿍도 겁을 먹고 등껍질 속에 숨어 버렸어.');
    return;
  }
  await say('늙은 배목수: 자네가 유령선을 잠재웠다고? 덕분에 이 녀석이 다시 고개를 내밀었다네!');
  await say('늙은 배목수: 내가 평생 배를 고치며 함께한 거북선이야.\n이제 나는 늙어서 바다에 못 나가니… 자네와 함께 넓은 바다를 보게 해 주게.');
  await wait(10);
  game.flags.geobukGift = true;
  await giveMon('geobukseon', 30);
}
