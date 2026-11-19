import type { Dir } from './common';
import type { Pal } from './sprites';
import { say, yesNo } from '../engine/ui';
import { game } from './state';
import { healParty, giveItem, setLastHeal, labProfessor, momTalk, world } from './api';
import { shopMenu } from './menus';

export interface Warp {
  x: number;
  y: number;
  to: string;
  tx: number;
  ty: number;
  dir: Dir;
}

export interface TrainerDef {
  id: string;
  cls: string;
  name: string;
  pal: Pal;
  team: [string, number][];
  reward: number;
  intro: string;
  defeat: string;
  after: string;
  afterWin?: () => Promise<void>;
}

export interface NPCDef {
  id: string;
  x: number;
  y: number;
  dir: Dir;
  pal?: Pal;
  move?: 'still' | 'wander' | 'look';
  talk?: string | (() => Promise<void>);
  trainer?: TrainerDef;
  sight?: number;
  item?: { id: string; qty: number };
  hidden?: () => boolean;
}

export interface MapDef {
  id: string;
  name: string;
  indoor?: boolean;
  tiles: string[];
  warps: Warp[];
  npcs: NPCDef[];
  signs?: { x: number; y: number; text: string }[];
  encounters?: { rate: number; table: [string, number, number, number][] };
  triggers?: { x: number; y: number; when?: () => boolean; run: () => Promise<void> }[];
}

// ---------------------------------------------------------------------------
// Palettes

const PAL = {
  mom: { hair: '#7a4a2a', shirt: '#f0a0b0', pants: '#6a6aa0' },
  prof: { hair: '#c8c8d0', shirt: '#f4f4f8', pants: '#6a5a48' },
  aide: { hair: '#3a3040', shirt: '#7ac8e0', pants: '#404860' },
  girl: { hair: '#6a3a2a', shirt: '#f080a0', pants: '#5060a0' },
  oldman: { hair: '#e0e0e0', shirt: '#8a9a6a', pants: '#5a4a3a' },
  bugkid: { hair: '#303030', shirt: '#60b060', pants: '#a07040', hat: '#f0d040' },
  picnic: { hair: '#e0a040', shirt: '#ffffff', pants: '#e07070' },
  hiker: { hair: '#4a3020', shirt: '#b06a30', pants: '#5a6a40', hat: '#7a5a3a' },
  man: { hair: '#2a2a3a', shirt: '#5a8ad0', pants: '#3a3a4a' },
  nurse: { hair: '#f0a0c0', shirt: '#ffffff', pants: '#f0c0d0' },
  clerk: { hair: '#3a2a20', shirt: '#4ab0a0', pants: '#3a4a5a' },
  kid: { hair: '#2a2a2a', shirt: '#f0c040', pants: '#4a6ab0' },
  lady: { hair: '#a05a3a', shirt: '#b0d0f0', pants: '#7a5a8a' },
  pupil: { hair: '#2a2a2a', shirt: '#f0f0f0', pants: '#3a3a3a' },
  leader: { hair: '#5a5a64', shirt: '#8a6a4a', pants: '#3a3a44' },
} satisfies Record<string, Pal>;

// ---------------------------------------------------------------------------

const home: MapDef = {
  id: 'home',
  name: '우리 집',
  indoor: true,
  tiles: [
    'XXXXXXXXXX',
    'XkkooooTTX',
    'XooooooooX',
    'XooTTooooX',
    'XooTTooobX',
    'XooooooooX',
    'XooooooooX',
    'XXXXeeXXXX',
  ],
  warps: [
    { x: 4, y: 7, to: 'town1', tx: 4, ty: 5, dir: 'down' },
    { x: 5, y: 7, to: 'town1', tx: 4, ty: 5, dir: 'down' },
  ],
  npcs: [{ id: 'mom', x: 6, y: 2, dir: 'down', pal: PAL.mom, talk: () => momTalk() }],
};

const town1: MapDef = {
  id: 'town1',
  name: '솔빛마을',
  tiles: [
    '########==##########',
    '#ff.....==........f#',
    '#.RRRR..==..GGGGG..#',
    '#.RRRR..==..GGGGG..#',
    '#.WwDW..==..WwWDW..#',
    '#...============...#',
    '#.......==.........#',
    '#......S==...fff...#',
    '#.......==.........#',
    '#~~~~...==....FFFF.#',
    '#~~~~...==....F..F.#',
    '#~~~~...==....FFFF.#',
    '#.......==.........#',
    '#.ff....==......ff.#',
    '####################',
  ],
  warps: [
    { x: 4, y: 4, to: 'home', tx: 4, ty: 6, dir: 'up' },
    { x: 15, y: 4, to: 'lab', tx: 4, ty: 6, dir: 'up' },
    { x: 8, y: 0, to: 'route1', tx: 8, ty: 22, dir: 'up' },
    { x: 9, y: 0, to: 'route1', tx: 9, ty: 22, dir: 'up' },
  ],
  signs: [{ x: 7, y: 7, text: '솔빛마을\n햇살이 가장 먼저 닿는 시작의 마을' }],
  npcs: [
    {
      id: 't1girl', x: 12, y: 8, dir: 'down', pal: PAL.girl, move: 'wander',
      talk: '풀숲에 들어가면 야생 몬스터가 튀어나와!\n몬스터 친구가 있어야 안전하게 지나갈 수 있어.',
    },
    {
      id: 't1old', x: 5, y: 12, dir: 'up', pal: PAL.oldman, move: 'look',
      talk: '연못에 비친 햇살이 참 곱지?\n그래서 이 마을 이름이 솔빛마을이라네.',
    },
  ],
  triggers: [8, 9].map((x) => ({
    x,
    y: 1,
    when: () => !game.flags.gotStarter,
    run: async () => {
      await say('한별 박사: 잠깐, {name}! 몬스터 없이 풀숲에 들어가면 위험해!');
      await say('먼저 오른쪽 연구소에 들러 주렴.');
      await world.walk(world.player, 'down');
    },
  })),
};

const lab: MapDef = {
  id: 'lab',
  name: '한별 연구소',
  indoor: true,
  tiles: [
    'XXXXXXXXXX',
    'XkkkoookkX',
    'XooooooooX',
    'XoocccoooX',
    'XooooooooX',
    'XPoooooooX',
    'XooooooooX',
    'XXXXeeXXXX',
  ],
  warps: [
    { x: 4, y: 7, to: 'town1', tx: 15, ty: 5, dir: 'down' },
    { x: 5, y: 7, to: 'town1', tx: 15, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'prof', x: 4, y: 2, dir: 'down', pal: PAL.prof, talk: () => labProfessor() },
    {
      id: 'aide', x: 7, y: 5, dir: 'left', pal: PAL.aide, move: 'wander',
      talk: async () => {
        if (!game.flags.gotStarter) await say('박사님 앞에 있는 캡슐에 몬스터가 들어 있어요.\n박사님께 말을 걸어 보세요!');
        else await say('몬스터를 약하게 만든 다음 포획구를 던지면 잡기 쉬워요.\n잠들거나 마비된 몬스터는 더 잘 잡혀요!');
      },
    },
  ],
};

const route1: MapDef = {
  id: 'route1',
  name: '1번 도로',
  tiles: [
    '########==##########',
    '#,,,,,..==..,,,,,,,#',
    '#,,,,,..==..,,,,,,,#',
    '#,,,,,..==..,,,,,,,#',
    '#.......==.........#',
    '###.....==.....#####',
    '#.......==.........#',
    '#.,,,,,,==,,,,,,,..#',
    '#.,,,,,,==,,,,,,,..#',
    '#.......==.........#',
    '#.......=======....#',
    '#............==....#',
    '#.,,,,,......==,,,,#',
    '#.,,,,,......==,,,,#',
    '#.,,,,,......==,,,,#',
    '#............==....#',
    '#.......=======....#',
    '#.......==.........#',
    '#..fff..==..~~~~~..#',
    '#.......==..~~~~~..#',
    '#,,,,,,.==.........#',
    '#,,,,,,.==.........#',
    '#......S==.........#',
    '########==##########',
  ],
  warps: [
    { x: 8, y: 23, to: 'town1', tx: 8, ty: 1, dir: 'down' },
    { x: 9, y: 23, to: 'town1', tx: 9, ty: 1, dir: 'down' },
    { x: 8, y: 0, to: 'town2', tx: 8, ty: 13, dir: 'up' },
    { x: 9, y: 0, to: 'town2', tx: 9, ty: 13, dir: 'up' },
  ],
  signs: [{ x: 7, y: 22, text: '1번 도로\n북쪽: 들꽃마을   남쪽: 솔빛마을' }],
  encounters: {
    rate: 0.12,
    table: [
      ['tosil', 2, 4, 35],
      ['jjaek', 2, 4, 30],
      ['kkomul', 2, 4, 25],
      ['jjirit', 3, 5, 7],
      ['doldol', 3, 5, 3],
    ],
  },
  npcs: [
    {
      id: 'r1tip', x: 11, y: 4, dir: 'down', pal: PAL.man, move: 'look',
      talk: '들꽃마을 수련관의 관장은 바위 타입을 쓴다더군.\n바위 타입은 물과 풀 기술에 약하지!',
    },
    {
      id: 'r1minsu', x: 4, y: 9, dir: 'right', pal: PAL.bugkid, sight: 4,
      trainer: {
        id: 'minsu', cls: '곤충소년', name: '민수', pal: PAL.bugkid,
        team: [['kkomul', 3], ['kkomul', 4]], reward: 120,
        intro: '풀숲에서 직접 잡은 내 벌레 몬스터를 봐라!',
        defeat: '으아, 내 꼬물이들이…!',
        after: '꼬물이는 금방 진화한다고! 진짜야!',
      },
    },
    {
      id: 'r1haneul', x: 17, y: 11, dir: 'left', pal: PAL.picnic, sight: 4,
      trainer: {
        id: 'haneul', cls: '소풍소녀', name: '하늘', pal: PAL.picnic,
        team: [['jjaek', 4], ['tosil', 5]], reward: 160,
        intro: '눈이 마주쳤으니 승부야!',
        defeat: '에이, 졌다~',
        after: '짹짹이는 언젠가 회오리를 일으키는 큰 새가 된대.',
      },
    },
    {
      id: 'r1hiker', x: 3, y: 17, dir: 'right', pal: PAL.hiker, sight: 5,
      trainer: {
        id: 'cheolho', cls: '등산가', name: '철호', pal: PAL.hiker,
        team: [['doldol', 6]], reward: 240,
        intro: '하하! 산에서 단련한 내 돌돌이를 이길 수 있겠나?',
        defeat: '튼튼한 돌돌이가 지다니!',
        after: '돌돌이처럼 단단한 몬스터에겐 물이나 풀 기술이 잘 통하지.',
      },
    },
    { id: 'r1potion', x: 18, y: 2, dir: 'down', item: { id: 'potion', qty: 1 } },
    { id: 'r1ball', x: 1, y: 21, dir: 'down', item: { id: 'ball', qty: 2 } },
    { id: 'r1cure', x: 18, y: 13, dir: 'down', item: { id: 'cure', qty: 1 } },
  ],
};

const town2: MapDef = {
  id: 'town2',
  name: '들꽃마을',
  tiles: [
    '####################',
    '#f..KKKKKK......f..#',
    '#...KKKKKK.........#',
    '#...WwWDWW.........#',
    '#......=...........#',
    '#..BBBB=..MMMM.....#',
    '#..BBBB=..MMMM.....#',
    '#..WDwW=..WwDW.....#',
    '#...===========....#',
    '#.......==.....S...#',
    '#.ff....==.......ff#',
    '#~~~....==.........#',
    '#~~~....==....fff..#',
    '#.......==.........#',
    '########==##########',
  ],
  warps: [
    { x: 8, y: 14, to: 'route1', tx: 8, ty: 1, dir: 'down' },
    { x: 9, y: 14, to: 'route1', tx: 9, ty: 1, dir: 'down' },
    { x: 7, y: 3, to: 'dojo', tx: 5, ty: 8, dir: 'up' },
    { x: 4, y: 7, to: 'center', tx: 4, ty: 6, dir: 'up' },
    { x: 12, y: 7, to: 'shop', tx: 4, ty: 6, dir: 'up' },
  ],
  signs: [{ x: 15, y: 9, text: '들꽃마을\n바람에 꽃향기가 실려 오는 마을  ·  북쪽: 수련관' }],
  npcs: [
    {
      id: 't2kid', x: 11, y: 10, dir: 'down', pal: PAL.kid, move: 'wander',
      talk: '파란 지붕은 회복소, 노란 지붕은 상점이야!\n수련관은 저 위 보라색 지붕이고.',
    },
    {
      id: 't2lady', x: 15, y: 4, dir: 'down', pal: PAL.lady, move: 'look',
      talk: '봄이 되면 이 마을은 온통 들꽃으로 뒤덮여요.\n그때 꼭 다시 놀러 오세요.',
    },
    {
      id: 't2old', x: 5, y: 12, dir: 'right', pal: PAL.oldman,
      talk: '수련관 관장 단단은 바위처럼 흔들림이 없지.\n관장의 바위갑옷은 방어가 아주 높다네. 꾹 버텨야 해!',
    },
  ],
};

const center: MapDef = {
  id: 'center',
  name: '들꽃마을 회복소',
  indoor: true,
  tiles: [
    'XXXXXXXXXX',
    'XkooooookX',
    'XTTTTTTTTX',
    'XooooooooX',
    'XoooooooPX',
    'XooooooooX',
    'XooooooooX',
    'XXXXeeXXXX',
  ],
  warps: [
    { x: 4, y: 7, to: 'town2', tx: 4, ty: 8, dir: 'down' },
    { x: 5, y: 7, to: 'town2', tx: 4, ty: 8, dir: 'down' },
  ],
  npcs: [
    {
      id: 'nurse', x: 4, y: 1, dir: 'down', pal: PAL.nurse,
      talk: async () => {
        if (!game.party.length) {
          await say('어서 오세요! 몬스터 회복소입니다.\n몬스터를 데려오시면 회복시켜 드려요.');
          return;
        }
        if (await yesNo('어서 오세요! 몬스터 회복소입니다.\n동료들의 체력을 회복시킬까요?')) {
          await say('그럼 잠시 맡아 둘게요…');
          await healParty();
          setLastHeal('center', 4, 3);
          await say('기다리셨습니다! 모두 건강해졌어요.\n또 오세요!');
        } else await say('또 오세요!');
      },
    },
    {
      id: 'cvisitor', x: 2, y: 5, dir: 'right', pal: PAL.man, move: 'look',
      talk: '오른쪽 PC로 몬스터를 맡기거나 찾을 수 있어.\n동료는 여섯 마리까지만 데리고 다닐 수 있거든.',
    },
  ],
};

const shop: MapDef = {
  id: 'shop',
  name: '들꽃마을 상점',
  indoor: true,
  tiles: [
    'XXXXXXXXXX',
    'XookkkkkkX',
    'XTTToooooX',
    'XooooooooX',
    'XooookkooX',
    'XooooooooX',
    'XooooooooX',
    'XXXXeeXXXX',
  ],
  warps: [
    { x: 4, y: 7, to: 'town2', tx: 12, ty: 8, dir: 'down' },
    { x: 5, y: 7, to: 'town2', tx: 12, ty: 8, dir: 'down' },
  ],
  npcs: [
    { id: 'clerk', x: 2, y: 1, dir: 'down', pal: PAL.clerk, talk: () => shopMenu(['ball', 'superball', 'potion', 'superpotion', 'cure', 'revive']) },
    {
      id: 'customer', x: 7, y: 5, dir: 'left', pal: PAL.lady, move: 'wander',
      talk: '수련관에 가기 전에 회복약을 넉넉히 사 두는 게 좋아요.',
    },
  ],
};

const leaderDef: TrainerDef = {
  id: 'leader1', cls: '관장', name: '단단', pal: PAL.leader,
  team: [['doldol', 10], ['bawi', 12]], reward: 1200,
  intro: '수련관에 잘 왔다! 나는 관장 단단.\n바위처럼 흔들리지 않는 마음으로 수련하고 있지.\n자, 네 실력을 보여 봐라!',
  defeat: '훌륭하다…! 바위를 깎아 내는 물방울 같은 끈기였다.',
  after: '더 넓은 세상이 너를 기다리고 있다.\n(Popket 첫 번째 버전은 여기까지! 즐겁게 플레이해 줘서 고마워요)',
  afterWin: async () => {
    game.flags.badge1 = true;
    await say('관장 단단: 이 바위배지를 받아라.\n내 수련관을 이겨 낸 증표다.');
    await say('{name}은(는) 관장 단단에게서 바위배지를 받았다!');
    await giveItem('superpotion', 2);
    await say('관장 단단: 배지를 모으며 계속 강해져라.\n언젠가 다시 겨뤄 보자!');
  },
};

const dojo: MapDef = {
  id: 'dojo',
  name: '들꽃 수련관',
  indoor: true,
  tiles: [
    'XXXXXXXXXXXX',
    'XroooooooorX',
    'XooooooooooX',
    'XroooooooorX',
    'XooooooooooX',
    'XroooooooorX',
    'XooooooooooX',
    'XroooooooorX',
    'XooooooooooX',
    'XXXXXeeXXXXX',
  ],
  warps: [
    { x: 5, y: 9, to: 'town2', tx: 7, ty: 4, dir: 'down' },
    { x: 6, y: 9, to: 'town2', tx: 7, ty: 4, dir: 'down' },
  ],
  npcs: [
    {
      id: 'pupil', x: 2, y: 6, dir: 'right', pal: PAL.pupil, sight: 4,
      trainer: {
        id: 'donghyun', cls: '수련생', name: '동현', pal: PAL.pupil,
        team: [['tosil', 8], ['doldol', 9]], reward: 400,
        intro: '관장님께 도전하려면 나부터 넘어서야지!',
        defeat: '으윽, 아직 수련이 부족했다…',
        after: '관장님의 바위갑옷은 정말 단단해.\n체력을 꼭 회복하고 도전해!',
      },
    },
    { id: 'leader', x: 5, y: 1, dir: 'down', pal: PAL.leader, trainer: leaderDef },
  ],
};

export const MAPS: Record<string, MapDef> = { home, town1, lab, route1, town2, center, shop, dojo };

// Validate map rows in development.
for (const m of Object.values(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) console.error(`map ${m.id} row ${y} has width ${row.length}, expected ${w}`);
  });
}

