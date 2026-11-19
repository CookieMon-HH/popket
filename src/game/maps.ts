import type { Dir } from './common';
import type { Pal } from './sprites';
import { say, yesNo } from '../engine/ui';
import { game } from './state';
import { healParty, setLastHeal, world } from './api';
import { shopMenu } from './menus';
import {
  PAL, momTalk, labProfessor, rivalLabTalk, chapter2Scene, leader1Win, grannyTalk, forestAdminWin,
  rival2Scene, fisherTalk, leader2Win, bossScene, whaleTalk, rival3Scene, leader3Win, minerTalk, sanjiTalk, potatoTalk,
} from './story';

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
  /** Draw as a monster instead of a person. */
  mon?: string;
  move?: 'still' | 'wander' | 'look';
  talk?: string | (() => Promise<void>);
  trainer?: TrainerDef;
  sight?: number;
  item?: { id: string; qty: number };
  hidden?: () => boolean;
}

type Table = [string, number, number, number][];

export interface MapDef {
  id: string;
  name: string;
  indoor?: boolean;
  dark?: boolean;
  tiles: string[];
  warps: Warp[];
  npcs: NPCDef[];
  signs?: { x: number; y: number; text: string }[];
  /** Name tags drawn over buildings (x, y in tile units; x is the tag's center). */
  labels?: { x: number; y: number; text: string; color?: string; ink?: string }[];
  encounters?: { rate: number; table: Table; tiles?: string };
  fishing?: Table;
  triggers?: { x: number; y: number; when?: () => boolean; run: () => Promise<void> }[];
}

const f = (k: string) => !!game.flags[k];

function pushBack(text: string[], dir: Dir) {
  return async () => {
    for (const t of text) await say(t);
    await world.walk(world.player, dir);
  };
}

function grunt(id: string, x: number, y: number, dir: Dir, sight: number, team: [string, number][], intro: string, defeat: string, after: string): NPCDef {
  return {
    id, x, y, dir, pal: PAL.grunt, sight,
    trainer: { id, cls: '검은안개단', name: '조무래기', pal: PAL.grunt, team, reward: 300, intro, defeat, after },
  };
}

// ---------------------------------------------------------------------------
// Shared interiors

function makeCenter(id: string, name: string, town: string, tx: number, ty: number, visitor: string): MapDef {
  return {
    id, name, indoor: true,
    tiles: [
      'qqqqQqqqqq',
      'qvuuuummvq',
      'qnnnnnnnnq',
      'quuuuuuuuq',
      'qssuuuuuPq',
      'quuuuuuuuq',
      'qyuuuuuuyq',
      'qqqqeeqqqq',
    ],
    warps: [
      { x: 4, y: 7, to: town, tx, ty, dir: 'down' },
      { x: 5, y: 7, to: town, tx, ty, dir: 'down' },
    ],
    npcs: [
      {
        id: id + '_nurse', x: 4, y: 1, dir: 'down', pal: PAL.nurse,
        talk: async () => {
          if (!game.party.length) {
            await say('어서 오세요! 몬스터 회복소입니다.\n몬스터를 데려오시면 회복시켜 드려요.');
            return;
          }
          if (await yesNo('어서 오세요! 몬스터 회복소입니다.\n동료들의 체력을 회복시킬까요?')) {
            await say('그럼 잠시 맡아 둘게요…');
            await healParty();
            setLastHeal(id, 4, 3);
            await say('기다리셨습니다! 모두 건강해졌어요.\n또 오세요!');
          } else await say('또 오세요!');
        },
      },
      { id: id + '_visitor', x: 2, y: 5, dir: 'right', pal: PAL.man, move: 'look', talk: visitor },
    ],
  };
}

function makeShop(id: string, name: string, town: string, tx: number, ty: number, stock: string[], customer: string): MapDef {
  return {
    id, name, indoor: true,
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
      { x: 4, y: 7, to: town, tx, ty, dir: 'down' },
      { x: 5, y: 7, to: town, tx, ty, dir: 'down' },
    ],
    npcs: [
      { id: id + '_clerk', x: 2, y: 1, dir: 'down', pal: PAL.clerk, talk: () => shopMenu(stock) },
      { id: id + '_customer', x: 7, y: 5, dir: 'left', pal: PAL.lady, move: 'wander', talk: customer },
    ],
  };
}

// ---------------------------------------------------------------------------
// 제1장 — 솔빛마을 · 1번 도로 · 들꽃마을

const home: MapDef = {
  id: 'home', name: '우리 집', indoor: true,
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
  id: 'town1', name: '솔빛마을',
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
  labels: [{ x: 4, y: 2.2, text: '우리 집' }, { x: 14.5, y: 2.2, text: '한별 연구소', color: '#e0f4e4', ink: '#2a6a3a' }],
  npcs: [
    {
      id: 't1girl', x: 12, y: 8, dir: 'down', pal: PAL.girl, move: 'wander',
      talk: '풀숲에 들어가면 야생 몬스터가 튀어나와!\n몬스터 친구가 있어야 안전하게 지나갈 수 있어.',
    },
    {
      id: 't1old', x: 5, y: 12, dir: 'up', pal: PAL.oldman, move: 'look',
      talk: async () => {
        if (f('rod')) await say('오, 낚싯대를 얻었구먼! 이 연못에도 반짝피라가 산다네.');
        else await say('연못에 비친 햇살이 참 곱지?\n그래서 이 마을 이름이 솔빛마을이라네.');
      },
    },
  ],
  triggers: [8, 9].map((x) => ({
    x, y: 1,
    when: () => !f('gotStarter'),
    run: pushBack(['한별 박사: 잠깐, {name}! 몬스터 없이 풀숲에 들어가면 위험해!', '먼저 오른쪽 연구소에 들러 주렴.'], 'down'),
  })),
};

const lab: MapDef = {
  id: 'lab', name: '한별 연구소', indoor: true,
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
    { id: 'rival_lab', x: 6, y: 2, dir: 'down', pal: PAL.rival, hidden: () => f('gotStarter'), talk: () => rivalLabTalk() },
    {
      id: 'aide', x: 7, y: 5, dir: 'left', pal: PAL.aide, move: 'wander',
      talk: async () => {
        if (!f('gotStarter')) await say('박사님 앞에 있는 캡슐에 몬스터가 들어 있어요.\n박사님께 말을 걸어 보세요!');
        else await say('몬스터를 약하게 만든 다음 포획구를 던지면 잡기 쉬워요.\n잠들거나 마비된 몬스터는 더 잘 잡혀요!');
      },
    },
  ],
};

const route1: MapDef = {
  id: 'route1', name: '1번 도로',
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
    table: [['tosil', 2, 4, 30], ['jjaek', 2, 4, 26], ['kkomul', 2, 4, 22], ['monsil', 3, 4, 7], ['ddakkum', 3, 4, 7], ['jjirit', 3, 5, 5], ['doldol', 3, 5, 3]],
  },
  npcs: [
    {
      id: 'r1tip', x: 11, y: 4, dir: 'down', pal: PAL.man, move: 'look',
      talk: '들꽃마을 수련관의 관장은 바위 타입을 쓴다더군.\n바위 타입은 물과 풀, 땅 기술에 약하지!',
    },
    {
      id: 'r1minsu', x: 4, y: 9, dir: 'right', pal: PAL.bugkid, sight: 4,
      trainer: {
        id: 'minsu', cls: '곤충소년', name: '민수', pal: PAL.bugkid, team: [['kkomul', 3], ['kkomul', 4]], reward: 120,
        intro: '풀숲에서 직접 잡은 내 벌레 몬스터를 봐라!', defeat: '으아, 내 꼬물이들이…!',
        after: '꼬물이는 고치가 됐다가 금방 나풀이로 변해! 진짜야!',
      },
    },
    {
      id: 'r1haneul', x: 17, y: 11, dir: 'left', pal: PAL.picnic, sight: 4,
      trainer: {
        id: 'haneul', cls: '소풍소녀', name: '하늘', pal: PAL.picnic, team: [['jjaek', 4], ['tosil', 5]], reward: 160,
        intro: '눈이 마주쳤으니 승부야!', defeat: '에이, 졌다~', after: '짹짹이는 바람새를 거쳐 회오리매가 된대.',
      },
    },
    {
      id: 'r1hiker', x: 3, y: 17, dir: 'right', pal: PAL.hiker, sight: 5,
      trainer: {
        id: 'cheolho', cls: '등산가', name: '철호', pal: PAL.hiker, team: [['doldol', 6]], reward: 240,
        intro: '하하! 산에서 단련한 내 돌돌이를 이길 수 있겠나?', defeat: '튼튼한 돌돌이가 지다니!',
        after: '돌돌이처럼 단단한 몬스터에겐 물이나 풀 기술이 잘 통하지.',
      },
    },
    {
      id: 'r1doyun', x: 12, y: 6, dir: 'left', pal: PAL.kid, sight: 3,
      trainer: {
        id: 'r1kid', cls: '반바지소년', name: '현우', pal: PAL.kid, team: [['tosil', 4], ['jjaek', 5]], reward: 100,
        intro: '반바지는 사계절 내내 입어야 제맛이지! 승부다!', defeat: '으, 다리가 시려…',
        after: '들꽃마을 수련관에도 수련생들이 잔뜩 있대. 미리 연습해 둬!',
      },
    },
    {
      id: 'r1lass', x: 15, y: 20, dir: 'left', pal: PAL.girl, sight: 7,
      trainer: {
        id: 'r1lass', cls: '꼬마아가씨', name: '예린', pal: PAL.girl, team: [['kkomul', 4], ['ddakkum', 5]], reward: 110,
        intro: '나랑 놀자! 몬스터 승부로!', defeat: '힝, 재밌었는데 졌다~',
        after: '따끔이는 풀숲에 아주 가끔 나와. 운이 좋았지!',
      },
    },
    { id: 'r1potion', x: 18, y: 2, dir: 'down', item: { id: 'potion', qty: 1 } },
    { id: 'r1ball', x: 1, y: 21, dir: 'down', item: { id: 'ball', qty: 2 } },
    { id: 'r1cure', x: 18, y: 13, dir: 'down', item: { id: 'cure', qty: 1 } },
  ],
};

const town2: MapDef = {
  id: 'town2', name: '들꽃마을',
  tiles: [
    '##############=#####',
    '#f..KKKKKK....=.f..#',
    '#...KKKKKK....=....#',
    '#...WwWDWW....=....#',
    '#......=......=....#',
    '#..BBBB=..MMMM=....#',
    '#..BHBB=..MMMM=....#',
    '#..WEwW=..WwDW=....#',
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
    { x: 14, y: 0, to: 'route2', tx: 9, ty: 26, dir: 'up' },
  ],
  labels: [{ x: 5, y: 5.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 12, y: 5.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' }, { x: 7, y: 1.1, text: '수련관', color: '#e8e0ff', ink: '#4a3a8a' }],
  signs: [{ x: 15, y: 9, text: '들꽃마을\n바람에 꽃향기가 실려 오는 마을  ·  북쪽: 2번 도로' }],
  npcs: [
    {
      id: 't2kid', x: 11, y: 10, dir: 'down', pal: PAL.kid, move: 'wander',
      talk: '파란 지붕은 회복소, 노란 지붕은 상점이야!\n보라색 지붕은 수련관이고.',
    },
    {
      id: 't2lady', x: 16, y: 4, dir: 'down', pal: PAL.lady, move: 'look',
      talk: '봄이 되면 이 마을은 온통 들꽃으로 뒤덮여요.\n그때 꼭 다시 놀러 오세요.',
    },
    {
      id: 't2old', x: 5, y: 12, dir: 'right', pal: PAL.oldman,
      talk: '수련관 관장 단단은 바위처럼 흔들림이 없지.\n관장의 바위갑옷은 방어가 아주 높다네. 꾹 버텨야 해!',
    },
    { id: 't2potato', x: 17, y: 11, dir: 'left', pal: PAL.hiker, talk: () => potatoTalk() },
    { id: 'rival_t2', x: 9, y: 6, dir: 'left', pal: PAL.rival, hidden: () => !f('badge1') || f('ch2') },
  ],
  triggers: [
    { x: 14, y: 1, when: () => !f('badge1'), run: pushBack(['북쪽은 2번 도로다. 길목에 안내문이 붙어 있다.', '「이 앞은 야생 몬스터가 강합니다.\n수련관 배지를 가진 트레이너만 지나가 주세요.」'], 'down') },
    { x: 7, y: 5, when: () => f('badge1') && !f('ch2'), run: chapter2Scene },
    { x: 7, y: 6, when: () => f('badge1') && !f('ch2'), run: chapter2Scene },
  ],
};

const center = makeCenter('center', '들꽃마을 회복소', 'town2', 4, 8, '오른쪽 PC로 몬스터를 맡기거나 찾을 수 있어.\n동료는 여섯 마리까지만 데리고 다닐 수 있거든.');
const shop = makeShop('shop', '들꽃마을 상점', 'town2', 12, 8, ['ball', 'superball', 'potion', 'superpotion', 'cure', 'revive'], '수련관에 가기 전에 회복약을 넉넉히 사 두는 게 좋아요.');

const dojo: MapDef = {
  id: 'dojo', name: '들꽃 수련관', indoor: true,
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
        id: 'donghyun', cls: '수련생', name: '동현', pal: PAL.pupil, team: [['tosil', 7], ['doldol', 8]], reward: 400,
        intro: '관장님께 도전하려면 나부터 넘어서야지!', defeat: '으윽, 아직 수련이 부족했다…',
        after: '관장님의 바위갑옷은 정말 단단해.\n체력을 꼭 회복하고 도전해!',
      },
    },
    {
      id: 'pupil2', x: 9, y: 4, dir: 'left', pal: PAL.pupil, sight: 4,
      trainer: {
        id: 'seoyeon', cls: '수련생', name: '서연', pal: PAL.pupil, team: [['jjaek', 6], ['doldol', 7]], reward: 280,
        intro: '수련관에서는 기합이 생명이야! 이얍!', defeat: '기합이 모자랐나…',
        after: '돌돌이는 몸을 웅크리면 방어가 더 올라가. 빨리 쓰러뜨리는 게 좋아!',
      },
    },
    {
      id: 'pupil3', x: 2, y: 2, dir: 'right', pal: PAL.pupil, sight: 3,
      trainer: {
        id: 'jiho', cls: '수련생', name: '지호', pal: PAL.pupil, team: [['tosil', 7], ['kkomul', 6]], reward: 260,
        intro: '관장님 바로 앞이니까 마지막 시험이다!', defeat: '좋아, 지나가도 좋다!',
        after: '관장님은 바위 타입이지만, 마음은 따뜻한 분이야.',
      },
    },
    {
      id: 'leader', x: 5, y: 1, dir: 'down', pal: PAL.leader,
      trainer: {
        id: 'leader1', cls: '관장', name: '단단', pal: PAL.leader, team: [['doldol', 9], ['bawi', 11]], reward: 1200,
        intro: '수련관에 잘 왔다! 나는 관장 단단.\n바위처럼 흔들리지 않는 마음으로 수련하고 있지.\n자, 네 실력을 보여 봐라!',
        defeat: '훌륭하다…! 바위를 깎아 내는 물방울 같은 끈기였다.',
        after: '북쪽 2번 도로 너머엔 더 넓은 세상이 있다.\n흔들리지 말고 나아가라!',
        afterWin: leader1Win,
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// 제2장 — 2번 도로 · 속삭임숲 · 물안개마을

const route2: MapDef = {
  id: 'route2', name: '2번 도로',
  tiles: [
    '#########=##########',
    '#,,,,....=....,,,,,#',
    '#,,,,....=....,,,,,#',
    '#........=.........#',
    '#..####..=..####...#',
    '#..####..=..####...#',
    '#........=.........#',
    '#,,,,,,,,=,,,,,,,,,#',
    '#,,,,,,,,=,,,,,,,,,#',
    '#........=.........#',
    '#...fff..=.........#',
    '#........=====.....#',
    '#~~~~~.......=.....#',
    '#~~~~~.......=..,,,#',
    '#~~~~~.......=..,,,#',
    '#........=====..,,,#',
    '#........=.........#',
    '#.,,,,,,,=.........#',
    '#.,,,,,,,=..####...#',
    '#.,,,,,,,=..####...#',
    '#........=.........#',
    '#........=....fff..#',
    '#..,,,,..=..,,,,,..#',
    '#..,,,,..=..,,,,,..#',
    '#........=.........#',
    '#.......S=.........#',
    '#........=.........#',
    '#########=##########',
  ],
  warps: [
    { x: 9, y: 27, to: 'town2', tx: 14, ty: 1, dir: 'down' },
    { x: 9, y: 0, to: 'forest', tx: 10, ty: 24, dir: 'up' },
  ],
  signs: [{ x: 8, y: 25, text: '2번 도로\n북쪽: 속삭임숲   남쪽: 들꽃마을' }],
  encounters: {
    rate: 0.12,
    table: [['tosil', 7, 9, 18], ['jjaek', 7, 9, 16], ['pojani', 7, 9, 22], ['jinheuk', 7, 9, 16], ['ddakkum', 7, 9, 16], ['kkomul', 6, 8, 5], ['doldol', 8, 9, 4], ['kkaeng', 7, 9, 8], ['monsil', 7, 9, 5], ['dalto', 8, 9, 4], ['mongmong', 7, 9, 5], ['agigom', 8, 9, 4]],
  },
  npcs: [
    {
      id: 'r2birder', x: 4, y: 3, dir: 'right', pal: PAL.birder, sight: 5,
      trainer: {
        id: 'taeo', cls: '새관찰가', name: '태오', pal: PAL.birder, team: [['jjaek', 10], ['baramsae', 12]], reward: 360,
        intro: '쉿! 지금 바람새를 관찰하는 중이었다고!', defeat: '날아가 버렸네…', after: '바람새는 볏으로 바람 방향을 읽는대. 신기하지?',
      },
    },
    {
      id: 'r2sua', x: 14, y: 9, dir: 'left', pal: PAL.lady, sight: 5,
      trainer: {
        id: 'sua', cls: '아가씨', name: '수아', pal: PAL.lady, team: [['ddakkum', 10], ['monsil', 10]], reward: 340,
        intro: '어머, 마침 심심했는데 잘됐다!', defeat: '어머머, 강하시네요.', after: '따끔이를 쓰다듬으면 따끔하지만 정말 귀여워요.',
      },
    },
    grunt('r2grunt', 14, 16, 'left', 5, [['tosil', 9], ['pojani', 10]],
      '뭘 봐? 검은안개단 일에 끼어들지 마라!', '이, 이럴 수가!', '흥, 숲에 가 봤자 소용없을걸. 간부님이 계시거든!'),
    {
      id: 'r2junho', x: 5, y: 20, dir: 'right', pal: PAL.kid, sight: 4,
      trainer: {
        id: 'junho', cls: '꼬마', name: '준호', pal: PAL.kid, team: [['jinheuk', 8], ['kkaeng', 9]], reward: 200,
        intro: '진흙 놀이 하다가 잡은 내 몬스터 볼래?', defeat: '으앙, 옷만 버렸어!', after: '진흙이는 전기 기술을 맞아도 끄떡없어!',
      },
    },
    { id: 'r2super', x: 18, y: 1, dir: 'down', item: { id: 'superpotion', qty: 1 } },
    { id: 'r2ball', x: 17, y: 13, dir: 'down', item: { id: 'ball', qty: 3 } },
    { id: 'r2potion', x: 1, y: 22, dir: 'down', item: { id: 'potion', qty: 2 } },
  ],
};

const forest: MapDef = {
  id: 'forest', name: '속삭임숲',
  tiles: [
    '##########=###########',
    '##,,,,,,,#=#,,,,,,,,##',
    '##,,,,,,,#=#,,,,,,,,##',
    '##....###...###.....##',
    '####..###...###..#####',
    '#.......#...#........#',
    '#.,,,,,.#...#.,,,,,,.#',
    '#.,,,,,.#...#.,,,,,,.#',
    '#.......#...#........#',
    '#####.###...###.######',
    '#,,,,.,,,...,,,.,,,,,#',
    '#,,,,.,,,...,,,.,,,,,#',
    '#.........f.........##',
    '###...#########...####',
    '#.....#.......#......#',
    '#.,,,.#.......#.,,,,.#',
    '#.,,,.#.......#.,,,,.#',
    '#.....##.....##......#',
    '####.####...####.#####',
    '#,,,,,,,,...,,,,,,,,,#',
    '#,,,,,,,,...,,,,,,,,,#',
    '#...........#........#',
    '#..###......#...###..#',
    '#..###......#...###..#',
    '#....................#',
    '##########=###########',
  ],
  warps: [
    { x: 10, y: 25, to: 'route2', tx: 9, ty: 1, dir: 'down' },
    { x: 10, y: 0, to: 'town3', tx: 10, ty: 14, dir: 'up' },
  ],
  encounters: {
    rate: 0.13,
    table: [['pojani', 10, 12, 22], ['dokbul', 10, 12, 12], ['soejip', 10, 12, 12], ['kkwae', 10, 12, 12], ['kkomul', 9, 11, 8], ['dandan', 10, 11, 6], ['ddakkum', 10, 12, 10], ['baramsae', 12, 13, 8], ['naphul', 12, 13, 4], ['beoseot', 13, 14, 6], ['bueong', 10, 12, 10], ['agigom', 11, 12, 5]],
  },
  npcs: [
    { id: 'granny', x: 5, y: 21, dir: 'down', pal: PAL.granny, talk: () => grannyTalk() },
    {
      id: 'fguard', x: 10, y: 2, dir: 'down', pal: PAL.grunt, hidden: () => f('forestCleared'),
      talk: '검은안개단: 여긴 못 지나간다! 숲은 우리가 접수했다고.\n간부님은 숲 한가운데 공터에 계시지. 감히 갈 수 있으면 가 보시든가!',
    },
    grunt('fgrunt1', 1, 16, 'right', 4, [['pojani', 11], ['kkomul', 11]],
      '숲의 몬스터는 전부 우리 차지다!', '크윽…', '간부님께 혼나겠군…'),
    grunt('fgrunt2', 20, 16, 'left', 5, [['kkwae', 12], ['dokbul', 12]],
      '꼬마가 여긴 왜 왔어? 썩 돌아가!', '말도 안 돼!', '간부 잿빛 님은 우리랑은 차원이 다르다고.'),
    grunt('fgrunt3', 9, 6, 'right', 2, [['jinheuk', 12], ['pojani', 12]],
      '여기서부터는 검은안개단 구역이다!', '쳇, 방심했다…', '별빛결정이라나 뭐라나… 높은 분들 생각은 잘 모르겠어.'),
    {
      id: 'fadmin', x: 10, y: 14, dir: 'down', pal: PAL.admin, sight: 3, hidden: () => f('forestCleared'),
      trainer: {
        id: 'admin1', cls: '검은안개단 간부', name: '잿빛', pal: PAL.admin, team: [['dokbul', 13], ['kkwae', 13], ['beoseot', 15]], reward: 1000,
        intro: '흠, 조무래기들을 뚫고 여기까지 왔나.\n숲의 몬스터들은 우리 계획에 쓸 귀한 재료다. 돌려줄 순 없지!',
        defeat: '이 내가… 꼬마에게…!', after: '…', afterWin: forestAdminWin,
      },
    },
    { id: 'cage1', x: 8, y: 14, dir: 'down', mon: 'pojani', hidden: () => f('forestCleared'), talk: '포자니가 겁에 질려 떨고 있다…' },
    { id: 'cage2', x: 12, y: 14, dir: 'down', mon: 'monsil', hidden: () => f('forestCleared'), talk: '몽실이가 털을 잔뜩 웅크리고 떨고 있다…' },
    { id: 'cage3', x: 12, y: 16, dir: 'down', mon: 'kkomul', hidden: () => f('forestCleared'), talk: '꼬물이가 몸을 웅크리고 있다…' },
    { id: 'fsuperball', x: 2, y: 1, dir: 'down', item: { id: 'superball', qty: 2 } },
    { id: 'fpotion', x: 19, y: 6, dir: 'down', item: { id: 'superpotion', qty: 1 } },
    { id: 'frevive', x: 20, y: 22, dir: 'down', item: { id: 'revive', qty: 1 } },
  ],
};

const town3: MapDef = {
  id: 'town3', name: '물안개마을',
  tiles: [
    '######################',
    '#....AAAAAA...~~~~~~~#',
    '#....AAAAAA...~~~~~~~#',
    '#....WwWDWW...~~~~~~~#',
    '#.......=.....+++~~~~#',
    '#..BBBB.=..MMMM.~~~~~#',
    '#..BHBB.=..MMMM.~~~~~#',
    '#..WEwW.=..WwDW.~~~~~#',
    '#...==========........',
    '#.........=......S...#',
    '#~~~~.....=..........#',
    '#~~~~..ff.=...,,,,...#',
    '#~~~~.....=...,,,,...#',
    '#.........=..........#',
    '#.........=..........#',
    '##########=###########',
  ],
  warps: [
    { x: 10, y: 15, to: 'forest', tx: 10, ty: 1, dir: 'down' },
    { x: 8, y: 3, to: 'gym2', tx: 5, ty: 10, dir: 'up' },
    { x: 4, y: 7, to: 'center3', tx: 4, ty: 6, dir: 'up' },
    { x: 13, y: 7, to: 'shop3', tx: 4, ty: 6, dir: 'up' },
    { x: 21, y: 8, to: 'route3', tx: 1, ty: 6, dir: 'right' },
  ],
  labels: [{ x: 5, y: 5.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 13, y: 5.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' }, { x: 8, y: 1.1, text: '수련관', color: '#e8e0ff', ink: '#4a3a8a' }],
  signs: [{ x: 17, y: 9, text: '물안개마을\n새벽마다 호수에 안개가 피어오르는 마을  ·  동쪽: 3번 도로' }],
  encounters: { rate: 0.1, table: [['pojani', 11, 13, 25], ['jinheuk', 11, 13, 20], ['baramsae', 12, 14, 20], ['dalto', 11, 13, 18], ['kkwae', 11, 13, 17], ['mongmong', 11, 13, 12]] },
  npcs: [
    { id: 'fisher', x: 15, y: 4, dir: 'right', pal: PAL.fisher, talk: () => fisherTalk() },
    {
      id: 't3guard', x: 20, y: 8, dir: 'left', pal: PAL.guard, hidden: () => f('badge2'),
      talk: '경비: 동쪽 3번 도로는 지금 위험해. 검은안개단이 들락거리거든.\n수련관 관장 마루 님께 인정받은 트레이너만 보내 줄 수 있어.',
    },
    {
      id: 't3kid', x: 6, y: 13, dir: 'up', pal: PAL.kid, move: 'wander',
      talk: '물안개 수련관은 안에 물웅덩이가 가득해!\n나무 다리를 따라가야 관장님한테 갈 수 있어.',
    },
    {
      id: 't3old', x: 3, y: 9, dir: 'down', pal: PAL.oldman, move: 'look',
      talk: '옛날이야기 하나 해 줄까? 동쪽 별빛동굴 깊은 곳에는\n별을 삼킨 고래가 잠들어 있다네. 그 고래가 깨면 밤하늘에 별비가 내린다지.',
    },
    { id: 'rival_t3', x: 10, y: 11, dir: 'down', pal: PAL.rival, hidden: () => f('rival2') || !f('forestCleared') },
  ],
  triggers: [{ x: 10, y: 13, when: () => !f('rival2') && f('forestCleared'), run: rival2Scene }],
};

const center3 = makeCenter('center3', '물안개마을 회복소', 'town3', 4, 8, '물 타입 몬스터는 전기 기술에 약해.\n관장님께 도전하기 전에 잘 준비해!');
const shop3 = makeShop('shop3', '물안개마을 상점', 'town3', 13, 8, ['ball', 'superball', 'potion', 'superpotion', 'cure', 'revive'], '물가에서는 낚싯대로 물속 몬스터를 낚을 수 있대요.');

const gym2: MapDef = {
  id: 'gym2', name: '물안개 수련관', indoor: true,
  tiles: [
    'XXXXXXXXXXXX',
    'X~~ooooo~~~X',
    'X~~ooooo~~~X',
    'X~~~~+~~~~~X',
    'X~~~~+~~~~~X',
    'Xooo~+~~oooX',
    'Xooo+++++ooX',
    'X~~~~~~~+~~X',
    'X~~~~~~~+~~X',
    'Xooooooo+ooX',
    'XooooooooooX',
    'XXXXXeeXXXXX',
  ],
  warps: [
    { x: 5, y: 11, to: 'town3', tx: 8, ty: 4, dir: 'down' },
    { x: 6, y: 11, to: 'town3', tx: 8, ty: 4, dir: 'down' },
  ],
  fishing: [['banjjak', 12, 16, 65], ['munu', 12, 15, 25], ['eungeo', 20, 21, 10]],
  npcs: [
    {
      id: 'swimA', x: 1, y: 6, dir: 'right', pal: PAL.swimmer, sight: 3,
      trainer: {
        id: 'swimA', cls: '수영선수', name: '바다', pal: PAL.swimmer, team: [['banjjak', 15], ['agipeng', 15]], reward: 600,
        intro: '물 위에서 나를 이길 수 있을까?', defeat: '꼬르륵…', after: '관장님은 물처럼 유연하게 싸우셔.',
      },
    },
    {
      id: 'swimB', x: 3, y: 2, dir: 'right', pal: PAL.swimmer, sight: 3,
      trainer: {
        id: 'swimB', cls: '수영선수', name: '여울', pal: PAL.swimmer, team: [['banjjak', 16], ['munu', 16]], reward: 640,
        intro: '관장님께 가려면 나를 넘어가야 해!', defeat: '파도에 휩쓸렸어…', after: '관장님의 은빛잉어는 정말 아름다워!',
      },
    },
    {
      id: 'maru', x: 5, y: 1, dir: 'down', pal: PAL.maru,
      trainer: {
        id: 'leader2', cls: '관장', name: '마루', pal: PAL.maru, team: [['banjjak', 16], ['mulbora', 17], ['eungeo', 19]], reward: 1900,
        intro: '물안개 수련관에 온 걸 환영해! 나는 관장 마루.\n물은 막으면 돌아가고, 고이면 깊어지지.\n네 몬스터들이 얼마나 깊은지 보여 줘!',
        defeat: '흐르는 물을 멈추게 하다니… 대단해!',
        after: '검은안개단은 별빛동굴에 있어. 부디 조심해.',
        afterWin: leader2Win,
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// 제3장 — 3번 도로 · 별빛동굴 · 별빛시

const route3: MapDef = {
  id: 'route3', name: '3번 도로',
  tiles: [
    '#############=################',
    '#,,,,,....##....,,,,,..CCCCCC#',
    '#,,,,,....##....,,,,,..CCCCCC#',
    '#.........##...........CCCCCC#',
    '#...,,,,......,,,,.....CCCCCC#',
    '#...,,,,......,,,,.....CCOCCC#',
    '==========================...#',
    '#...,,,,......,,,,......~~~~~#',
    '#...,,,,......,,,,......~~~~~#',
    '#.......##.........S....~~~~~#',
    '#,,,,,,.##..,,,,,,,.....~~~~~#',
    '##############################',
  ],
  warps: [
    { x: 0, y: 6, to: 'town3', tx: 20, ty: 8, dir: 'left' },
    { x: 25, y: 5, to: 'cave', tx: 1, ty: 18, dir: 'up' },
    { x: 13, y: 0, to: 'peak', tx: 9, ty: 19, dir: 'up' },
  ],
  triggers: [{
    x: 13, y: 1, when: () => !f('badge3'),
    run: pushBack(['북쪽은 운무봉으로 가는 산길이다.\n입구에 금줄이 쳐져 있다.', '「신성한 산입니다. 세 수련관의 배지를 모은 분만 오르세요.」'], 'down'),
  }],
  signs: [{ x: 19, y: 9, text: '3번 도로\n동쪽: 별빛동굴  서쪽: 물안개마을  북쪽: 운무봉' }],
  encounters: {
    rate: 0.13,
    table: [['jinheuk', 14, 17, 15], ['ddakkum', 14, 17, 13], ['baramsae', 15, 17, 12], ['beoseot', 15, 17, 10], ['jjirit', 14, 16, 10], ['tongsil', 15, 17, 9], ['kkaeng', 15, 16, 10], ['dalto', 14, 16, 9], ['kkwae', 15, 17, 6], ['beonjjeok', 16, 17, 4], ['soejip', 15, 17, 2], ['agigom', 15, 17, 7], ['ggorichim', 15, 17, 7], ['ggangtong', 14, 16, 5]],
  },
  fishing: [['banjjak', 14, 20, 55], ['munu', 15, 18, 25], ['eungeo', 20, 23, 15], ['meokmul', 19, 21, 5]],
  npcs: [
    grunt('r3grunt', 12, 4, 'down', 2, [['ggorichim', 16], ['baramsae', 16]],
      '동굴 쪽으로는 못 간다! 두목님의 중요한 작전 중이다!', '두, 두목님께 알려야 해!', '두목 흑영 님은 동굴 지하 호수에 계신다… 아, 말해 버렸다.'),
    {
      id: 'r3hiker', x: 20, y: 8, dir: 'up', pal: PAL.hiker, sight: 2,
      trainer: {
        id: 'dongsu', cls: '등산가', name: '동수', pal: PAL.hiker, team: [['agigom', 16], ['doldol', 16], ['jinheuk', 17]], reward: 700,
        intro: '별빛동굴에 가려고? 그럼 나부터 넘어 봐라!', defeat: '허허, 제법인걸.', after: '동굴 안은 어두우니 발밑을 조심하게.',
      },
    },
    {
      id: 'r3girl', x: 6, y: 9, dir: 'up', pal: PAL.picnic, sight: 3,
      trainer: {
        id: 'nari', cls: '소풍소녀', name: '나리', pal: PAL.picnic, team: [['mongmong', 15], ['ddakkum', 15], ['pojani', 16]], reward: 480,
        intro: '도시락 먹기 전에 한판 어때?', defeat: '배고파서 졌다…', after: '동쪽 동굴을 지나면 별빛시가 나와. 엄청 큰 도시래!',
      },
    },
    { id: 'r3hyper', x: 1, y: 1, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
    { id: 'r3revive', x: 1, y: 10, dir: 'down', item: { id: 'revive', qty: 1 } },
    { id: 'r3ball', x: 28, y: 6, dir: 'down', item: { id: 'superball', qty: 2 } },
  ],
};

const cave: MapDef = {
  id: 'cave', name: '별빛동굴', dark: true,
  tiles: [
    'CCCCCCCCCCCCCCCCCCCCCOCC',
    'C~~~~~~~~~~~CCCCCCCCC_CC',
    'C~~~~~~~~~~~CCCCCCCCC_CC',
    'C~~~~~~~~~~~C__________C',
    'C~~~~~~~~~~~C_CCCCCCCC_C',
    'C___________C_C______C_C',
    'C___________C_C_CCCC_C_C',
    'C__z_____z__C__________C',
    'CCCCC___C_CCCCCCC__CCCCC',
    'C______________________C',
    'C_CCCCC____CCCC___CCCC_C',
    'C_C___C_z__C__C___C____C',
    'C_C_C_C____C__C_C_C_CC_C',
    'C___C______C__C_C___CC_C',
    'CCCCCCCC_CCC__C_CCCCCC_C',
    'C_z___________C________C',
    'C_CCCCC_CCCCC_CCCCCCCC_C',
    'C_____________z________C',
    'C___CCCCCCCCCCCCCCCCCCCC',
    'COCCCCCCCCCCCCCCCCCCCCCC',
  ],
  warps: [
    { x: 1, y: 19, to: 'route3', tx: 25, ty: 6, dir: 'down' },
    { x: 21, y: 0, to: 'town4', tx: 10, ty: 14, dir: 'up' },
  ],
  encounters: {
    rate: 0.1,
    tiles: '_',
    table: [['doldol', 17, 19, 20], ['jinheuk', 17, 19, 17], ['dokbul', 17, 19, 15], ['agipeng', 17, 19, 13], ['heukjang', 18, 20, 9], ['jjirit', 17, 19, 9], ['bawi', 19, 20, 5], ['beoseot', 18, 19, 5], ['dokkae', 19, 20, 4], ['kkomaryong', 18, 19, 3], ['ggangtong', 17, 19, 8], ['ggorichim', 17, 19, 6], ['nunnyang', 17, 19, 7]],
  },
  fishing: [['banjjak', 18, 22, 40], ['eungeo', 21, 24, 30], ['munu', 18, 20, 15], ['meokmul', 21, 23, 15]],
  npcs: [
    grunt('cgrunt1', 7, 16, 'down', 1, [['ggorichim', 18], ['meokmul', 18]],
      '침입자다! 여기서 끝장내 주마!', '으악!', '이 동굴의 별빛결정은 전부 두목님 거다.'),
    grunt('cgrunt2', 9, 8, 'down', 1, [['beoseot', 19], ['dokbul', 19]],
      '두목님의 의식을 방해하게 둘 순 없지!', '크윽…', '의식이 끝나면 은하고래가 우리 편이 될 거다…'),
    {
      id: 'cadmin', x: 5, y: 8, dir: 'right', pal: PAL.admin, sight: 2, hidden: () => f('bossDone'),
      trainer: {
        id: 'admin2', cls: '검은안개단 간부', name: '잿빛', pal: PAL.admin, team: [['dokkae', 20], ['kkwae', 20], ['heukjang', 21]], reward: 1600,
        intro: '또 너냐! 숲에서 당한 빚, 여기서 갚아 주지!', defeat: '두 번이나… 말도 안 돼…',
        after: '흑영 님은 호수 앞에 계신다… 하지만 넌 절대 못 이길 거다.',
      },
    },
    { id: 'boss', x: 6, y: 5, dir: 'up', pal: PAL.boss, hidden: () => f('bossDone'), talk: () => bossScene() },
    { id: 'whale', x: 6, y: 4, dir: 'down', mon: 'eunha', hidden: () => f('whale'), talk: () => whaleTalk() },
    {
      id: 'cguard', x: 21, y: 2, dir: 'down', pal: PAL.grunt, hidden: () => f('bossDone'),
      talk: '검은안개단: 출구는 봉쇄했다! 두목님의 의식이 끝날 때까지\n아무도 못 나간다고!',
    },
    { id: 'miner', x: 17, y: 5, dir: 'down', pal: PAL.hiker, hidden: () => !f('bossDone'), talk: () => minerTalk() },
    { id: 'csuperball', x: 1, y: 15, dir: 'down', item: { id: 'superball', qty: 3 } },
    { id: 'chyper', x: 22, y: 11, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
    { id: 'crevive', x: 3, y: 11, dir: 'down', item: { id: 'revive', qty: 1 } },
  ],
  triggers: [1, 2, 4, 5, 6, 7, 8, 10, 11].map((x) => ({
    x, y: 7,
    when: () => !f('bossDone'),
    run: bossScene,
  })),
};

const town4: MapDef = {
  id: 'town4', name: '별빛시',
  tiles: [
    '######################',
    '#..YYYYYY....YYYYYY..#',
    '#..YYYYYY....YYYYYY..#',
    '#..WwWDWW....WwWWwW..#',
    '#l....=.......l......#',
    '#.BBBB=..MMMM........#',
    '#.BHBB=..MMMM........#',
    '#.WEwW=..WwDW........#',
    '#.===========......l.#',
    '#.........=.....S....#',
    '#.ff......=..........#',
    '#l........=........l.#',
    '#.........=..fff.....#',
    '#.........=..........#',
    '#.........=..........#',
    '##########=###########',
  ],
  warps: [
    { x: 10, y: 15, to: 'cave', tx: 21, ty: 1, dir: 'down' },
    { x: 6, y: 3, to: 'gym3', tx: 5, ty: 10, dir: 'up' },
    { x: 3, y: 7, to: 'center4', tx: 4, ty: 6, dir: 'up' },
    { x: 11, y: 7, to: 'shop4', tx: 4, ty: 6, dir: 'up' },
  ],
  labels: [{ x: 4, y: 5.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 11, y: 5.1, text: '백화점', color: '#fff2c8', ink: '#8a5a10' }, { x: 6, y: 1.1, text: '수련관', color: '#e8e0ff', ink: '#4a3a8a' }, { x: 16, y: 1.1, text: '리그 사무국' }],
  signs: [{ x: 16, y: 9, text: '별빛시\n밤에도 별처럼 불빛이 반짝이는 도시  ·  별빛 수련관' }],
  npcs: [
    {
      id: 't4man', x: 15, y: 5, dir: 'down', pal: PAL.man, move: 'wander',
      talk: '오른쪽 큰 건물은 해솔 리그 사무국이야.\n리그는 다음 봄에 열린다던데… 아직은 문이 닫혀 있어.',
    },
    {
      id: 't4lady', x: 4, y: 12, dir: 'right', pal: PAL.lady, move: 'look',
      talk: async () => {
        if (f('bossDone')) await say('별빛동굴에서 검은안개단을 쫓아낸 게 당신이에요?\n요즘 밤하늘에 별똥별이 부쩍 많아졌대요!');
        else await say('별빛동굴 쪽이 요즘 시끄러워서 걱정이에요.');
      },
    },
    {
      id: 't4eng', x: 18, y: 10, dir: 'left', pal: PAL.engineer, move: 'look',
      talk: '별빛 수련관 관장 하람 님은 발전소 기술자 출신이야.\n전기 타입은 땅 타입 몬스터한테 기술이 통하지 않아!',
    },
    { id: 'sanji', x: 20, y: 13, dir: 'left', pal: PAL.oldman, talk: () => sanjiTalk() },
    { id: 'rival_t4', x: 10, y: 10, dir: 'down', pal: PAL.rival, hidden: () => f('rival3') },
  ],
  triggers: [{ x: 10, y: 12, when: () => !f('rival3'), run: rival3Scene }],
};

const center4: MapDef = makeCenter('center4', '별빛시 회복소', 'town4', 3, 8, '해솔 리그에 나가려면 배지 여덟 개가 필요하대.\n이 지방에 있는 건 셋뿐이니… 다른 지방도 가 봐야겠지?');
const shop4 = makeShop('shop4', '별빛시 백화점', 'town4', 11, 8, ['ball', 'superball', 'potion', 'superpotion', 'hyperpotion', 'cure', 'revive'], '특급회복약은 여기서만 팔아요. 관장님께 가기 전에 챙겨 두세요!');

const gym3: MapDef = {
  id: 'gym3', name: '별빛 수련관', indoor: true,
  tiles: [
    'XXXXXXXXXXXX',
    'XPooooooooPX',
    'XooooooooooX',
    'XPPPPoPPPPPX',
    'XooooooooooX',
    'XPPoPPPPPPPX',
    'XooooooooooX',
    'XPPPPPPPoPPX',
    'XooooooooooX',
    'XooooooooooX',
    'XooooooooooX',
    'XXXXXeeXXXXX',
  ],
  warps: [
    { x: 5, y: 11, to: 'town4', tx: 6, ty: 4, dir: 'down' },
    { x: 6, y: 11, to: 'town4', tx: 6, ty: 4, dir: 'down' },
  ],
  npcs: [
    {
      id: 'eng1', x: 1, y: 8, dir: 'right', pal: PAL.engineer, sight: 7,
      trainer: {
        id: 'eng1', cls: '기술자', name: '건우', pal: PAL.engineer, team: [['ggangtong', 23], ['jjirit', 23], ['cheolgap', 24]], reward: 900,
        intro: '찌릿찌릿! 전압 검사 시작이다!', defeat: '퓨즈가 나갔다…', after: '기계들 사이로 길을 찾아 올라가 봐.',
      },
    },
    {
      id: 'eng2', x: 10, y: 4, dir: 'left', pal: PAL.engineer, sight: 6,
      trainer: {
        id: 'eng2', cls: '기술자', name: '미르', pal: PAL.engineer, team: [['beongae', 24], ['beonjjeok', 25]], reward: 960,
        intro: '하람 님께 가는 길은 내가 지킨다!', defeat: '합선이야…', after: '하람 님의 뇌전고슴은 정말 빨라. 각오해!',
      },
    },
    {
      id: 'haram', x: 5, y: 1, dir: 'down', pal: PAL.haram,
      trainer: {
        id: 'leader3', cls: '관장', name: '하람', pal: PAL.haram, team: [['jjirit', 25], ['beonjjeok', 26], ['beongae', 27], ['noejeon', 29]], reward: 2900,
        intro: '별빛 수련관에 온 걸 환영한다. 나는 관장 하람.\n이 도시의 불빛은 전부 내 몬스터들의 전기로 켜지지.\n너의 번뜩임을 보여 줘!',
        defeat: '번개보다 빠른 판단… 완벽한 패배다.',
        after: '배지 셋을 모은 너라면 리그에서도 통할 거다.',
        afterWin: leader3Win,
      },
    },
  ],
};

// center4's door is at x=3, so arrivals land one tile to the right of the usual spot.
center4.warps = [
  { x: 4, y: 7, to: 'town4', tx: 3, ty: 8, dir: 'down' },
  { x: 5, y: 7, to: 'town4', tx: 3, ty: 8, dir: 'down' },
];

const peak: MapDef = {
  id: 'peak', name: '운무봉',
  tiles: [
    'CCCCCCCCCCCCCCCCCC',
    'CCCCCC..J...CCCCCC',
    'CCCCC........CCCCC',
    'CCCC..ffffff..CCCC',
    'CCCC..........CCCC',
    'CCCCCCC..CCCCCCCCC',
    'C,,,,,...,,,,,,,,C',
    'C,,,,,...,,,,,,,,C',
    'C.......CCCCC....C',
    'C.CCCC..CCCCC.CC.C',
    'C......,,,,,.....C',
    'C......,,,,,.....C',
    'CCCCC.......CCCCCC',
    'C,,,,.......,,,,,C',
    'C,,,,..CCC..,,,,,C',
    'C......CCC.......C',
    'CCC.............CC',
    'C.......~~~......C',
    'C.......~~~......C',
    'C................C',
    'CCCCCCCCC=CCCCCCCC',
  ],
  warps: [{ x: 9, y: 20, to: 'route3', tx: 13, ty: 1, dir: 'down' }],
  signs: [],
  encounters: {
    rate: 0.13,
    table: [['baramsae', 27, 30, 14], ['hoeori', 29, 31, 8], ['bawi', 28, 31, 12], ['heukjang', 28, 30, 12], ['dokkae', 28, 31, 10], ['jeolgu', 27, 30, 10], ['eolpeng', 28, 30, 9], ['kwontu', 28, 30, 9], ['beonjjeok', 28, 30, 8], ['nalgae', 28, 30, 4], ['monggeul', 27, 29, 4], ['seolpyo', 28, 30, 6], ['satba', 28, 30, 6], ['cheolgap', 27, 30, 5], ['olppaemi', 28, 30, 5], ['dokjeongal', 28, 30, 5], ['wangmong', 27, 29, 3]],
  },
  fishing: [['banjjak', 25, 30, 40], ['eungeo', 28, 32, 30], ['meokmul', 27, 31, 20], ['daewang', 34, 36, 10]],
  npcs: [
    {
      id: 'monk1', x: 2, y: 10, dir: 'right', pal: PAL.pupil, sight: 4,
      trainer: {
        id: 'monk1', cls: '수행자', name: '무명', pal: PAL.pupil, team: [['jeolgu', 29], ['kwontu', 30]], reward: 1100,
        intro: '산을 오르는 자여, 마음을 시험하겠다.', defeat: '마음이 맑구나…', after: '정상의 서낭당은 산군님을 모시는 곳이다.',
      },
    },
    {
      id: 'monk2', x: 15, y: 13, dir: 'left', pal: PAL.pupil, sight: 3,
      trainer: {
        id: 'monk2', cls: '수행자', name: '청운', pal: PAL.pupil, team: [['hoeori', 30], ['heukjang', 30], ['beoseot', 31]], reward: 1200,
        intro: '안개 속에서 길을 잃지 않으려면, 강해져야 한다!', defeat: '안개가 걷히는구나.',
        after: '세 개의 방울이 함께 울릴 때, 산군님이 내려오신다고 하지.',
      },
    },
    { id: 'phyper', x: 16, y: 10, dir: 'down', item: { id: 'hyperpotion', qty: 2 } },
    { id: 'pball', x: 1, y: 19, dir: 'down', item: { id: 'superball', qty: 3 } },
  ],
};

export const MAPS: Record<string, MapDef> = {
  home, town1, lab, route1, town2, center, shop, dojo,
  route2, forest, town3, center3, shop3, gym2,
  route3, cave, town4, center4, shop4, gym3, peak,
};

// Validate map rows and warp targets in development.
for (const m of Object.values(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) console.error(`map ${m.id} row ${y} has width ${row.length}, expected ${w}`);
  });
  for (const wp of m.warps) if (!MAPS[wp.to]) console.error(`map ${m.id} warps to unknown ${wp.to}`);
}
