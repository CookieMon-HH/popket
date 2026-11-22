import { questReady, floristTalk, lighthouseTalk, smithTalk, oldFisherTalk, astronomerTalk, chiefTalk, seodangTalk } from './sidequests';
import type { Dir } from './common';
import type { Pal } from './sprites';
import { say, yesNo } from '../engine/ui';
import { game, beatenAll, runtime } from './state';
import { healParty, setLastHeal, world } from './api';
import { shopMenu } from './menus';
import {
  PAL, momTalk, labProfessor, rivalLabTalk, chapter2Scene, leader1Win, grannyTalk, forestAdminWin,
  rival2Scene, fisherTalk, leader2Win, bossScene, whaleTalk, rival3Scene, leader3Win, minerTalk, sanjiTalk, potatoTalk,
  port1Scene, leader4Win, leader5Win, volcanoBossScene, 
  iceIntroScene, iceCaveScene, beachAdminWin, haesolMeet, haesolTalk, cheonjiTalk, summitMonk, leader6Win, dragonIntroScene, elderTalk, denEntranceScene, cloudWin, leader7Win, lever, toggleSwitch, quiz,
} from './story';
import { keeperTalk, escapeeTalk, safariExitTile, specialGate } from './safari';
import { windTamerTalk } from './fly';
import { chestProp, chestTalk, fossilSite } from './chests';
import { fireflyAt, groveExit, fireflyTalk, whisper, oldTree, nestTalk, lostMong } from './forest';
import { brazier, brazierProp, altarOpen, starMural, cloudNote, pearlAltar } from './den';
import { mittenTalk, mural, northWeather } from './ice';
import { forgeValve, forgeSchematic, channelCool, volcanoNote1, volcanoNote2, volcanoNote3, heartChest } from './volcano';
import { antiqueOwner, musicBox, foxGirl, shipwright, moonCrystal, moonCrystalProp, moonPad, moonRiddle } from './events';
import { boardShip, lockedBridge, lockedEngine, logPage1, portraitTalk, dalnimCabin, wardrobe, candleProp, candleTalk, pianoTalk, valveTalk, generatorTalk, shipAdminWinV2, wheelTalk, captainTalk, shipExitCheck } from './ship';
import { receptionTalk } from './tournament';
import { legendEncounter, snowMomPost, hwaryeonPost } from './legends';

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
  /** Post-game bosses: perfect stats on every monster. */
  elite?: boolean;
  /** How many 만능회복약 the trainer may use when a monster is low. */
  heals?: number;
  /** Fought in the league stadium. */
  arena?: boolean;
}

export interface NPCDef {
  id: string;
  x: number;
  y: number;
  dir: Dir;
  pal?: Pal;
  /** Draw as a monster instead of a person. */
  mon?: string;
  /** Draw the monster as a grey stone statue. */
  statue?: boolean;
  move?: 'still' | 'wander' | 'look';
  talk?: string | (() => Promise<void>);
  trainer?: TrainerDef;
  sight?: number;
  /** Trainer ids that must be beaten before this boss will battle (or be talked into a scene). */
  requires?: string[];
  /** What the boss says while the player has not beaten `requires` yet. */
  waitText?: string;
  item?: { id: string; qty: number };
  /** A rock the player can push. */
  boulder?: boolean;
  /** Draw as a map object (a tile character), e.g. a candle or a ship's wheel. */
  prop?: string | (() => string);
  /** Shows a "!" bubble while this returns true (a side quest has something new). */
  quest?: () => boolean;
  /** Draw the person see-through and flickering. */
  ghost?: boolean;
  /** A gate drawn as an object; give it `hidden` to open it. */
  barrier?: 'water' | 'electric' | 'stone' | 'lava' | 'flame';
  /** Timed barrier: active (blocking) for the first half of every `period` frames, shifted by `offset`. */
  pulse?: { period: number; offset: number };
  hidden?: () => boolean;
}

type Table = [string, number, number, number][];

export type Ambience = 'ship' | 'shipdeck' | 'volcano' | 'volcanoheart' | 'forest' | 'snow' | 'blizzard' | 'icecave' | 'den' | 'mist' | 'sky';

export interface MapDef {
  /** Safari rules: timer, safari balls and safari-style battles. */
  safari?: boolean;
  id: string;
  name: string;
  indoor?: boolean;
  dark?: boolean | (() => boolean);
  /** Tile drawn beyond the map edge (outdoor maps default to trees). */
  edge?: string;
  tiles: string[];
  warps: Warp[];
  npcs: NPCDef[];
  signs?: { x: number; y: number; text: string }[];
  /** Name tags drawn over buildings (x, y in tile units; x is the tag's center). */
  labels?: { x: number; y: number; text: string; color?: string; ink?: string }[];
  /** Where a burnt player is sent back to (timed flame jets). */
  respawn?: [number, number];
  /** Tiles to use instead once something has happened (e.g. the volcano calms down). */
  after?: { when: () => boolean; tiles: string[] };
  /** Default ground under street furniture when no plain ground tile is nearby. */
  ground?: string;
  /** Atmosphere overlay: tint, particles and weather drawn over the map. */
  ambience?: Ambience | (() => Ambience);
  encounters?: { rate: number; table: Table; tiles?: string; /** extra monsters after the ending */ post?: Table };
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

function makeShop(id: string, name: string, town: string, tx: number, ty: number, customer: string): MapDef {
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
      { id: id + '_clerk', x: 2, y: 1, dir: 'down', pal: PAL.clerk, talk: () => shopMenu() },
      { id: id + '_customer', x: 7, y: 5, dir: 'left', pal: PAL.lady, move: 'wander', talk: customer },
    ],
  };
}

// ---------------------------------------------------------------------------
// 제1장 — 솔빛마을 · 1번 도로 · 들꽃마을

const home: MapDef = {
  id: 'home', name: '우리 집', indoor: true,
  tiles: [
    'ㄲㄲㄲㄲㄲㄲㄲㄲㄲㄲ',
    'ㄲkkㄲㄲㄲㄲㅭㅦㄲ',
    'ㄲooooooooㄲ',
    'ㄲooTToooㅨㄲ',
    'ㄲooTTooobㄲ',
    'ㄲㅨoㆅㆅooooㄲ',
    'ㄲooㆅㆅooooㄲ',
    'ㄲㄲㄲㄲeeㄲㄲㄲㄲ',
  ],
  warps: [
    { x: 4, y: 7, to: 'town1', tx: 11, ty: 8, dir: 'down' },
    { x: 5, y: 7, to: 'town1', tx: 11, ty: 8, dir: 'down' },
  ],
  npcs: [{ id: 'mom', x: 6, y: 2, dir: 'down', pal: PAL.mom, talk: () => momTalk() }],
};

const town1: MapDef = {
  id: 'town1', name: '솔빛마을',
  tiles: [
    '###############==#################',
    '#.#.#.#.#.ε....==..εε.#.#.#.#.ε..#',
    '#..............==................#',
    '#ζζζζζζ........==...........ΠΠΠΠ.#',
    '#.στ....ff.....==........f..ΠΠΠΠ.#',
    '#.υχ.....RRRR..==..GGGGG....WwDW.#',
    '#........RRRR..==..GGGGG......=..#',
    '#........WwDW..==..WwWDW......=..#',
    '#.=====================....θ..=.ι#',
    '#....=.........==.............=..#',
    '#φφφφ=........S==...fff.......=..#',
    '#φφφφ=.........===================',
    '#ωφφφ=..~~~~...==....FFFF........#',
    '#φφφφ=..~~~~...==....F..F........#',
    '#ςς..=..~~~~...==....FFFF..ε.ε...#',
    '#....=.........==................#',
    '#....=...ff....==......ff..ζζζ...#',
    '#....=......θ....................#',
    '#.ΠΠΠΠΠ..........................#',
    '#.ΠΠΠΠΠ..ζζζζζζζζ..εε.εε.........#',
    '#.WwDwW..........................#',
    '#....=...........................#',
    '##################################',
  ],
  warps: [
    { x: 30, y: 5, to: 'house1a', tx: 5, ty: 7, dir: 'up' },
    { x: 4, y: 20, to: 'house1b', tx: 5, ty: 7, dir: 'up' },
    { x: 11, y: 7, to: 'home', tx: 4, ty: 6, dir: 'up' },
    { x: 22, y: 7, to: 'lab', tx: 4, ty: 6, dir: 'up' },
    { x: 15, y: 0, to: 'route1', tx: 15, ty: 32, dir: 'up' },
    { x: 16, y: 0, to: 'route1', tx: 16, ty: 32, dir: 'up' },
    { x: 33, y: 11, to: 'plateau', tx: 1, ty: 11, dir: 'right' },
  ],
  signs: [{ x: 14, y: 10, text: '솔빛마을\n햇살이 가장 먼저 닿는 시작의 마을' }],
  labels: [ { x: 30, y: 3.2, text: '이웃집', color: '#ffe8d0', ink: '#8a4a1a' }, { x: 4, y: 18.2, text: '마을회관', color: '#ffe8d0', ink: '#8a4a1a' }, { x: 3, y: 2.2, text: '풍차', color: '#fff6d8', ink: '#7a5a20' },{ x: 11, y: 5.2, text: '우리 집' }, { x: 21.5, y: 5.2, text: '한별 연구소', color: '#e0f4e4', ink: '#2a6a3a' }],
  npcs: [
    { id: 't1farmer', x: 5, y: 12, dir: 'left', pal: PAL.hiker, move: 'look', talk: '농부: 올해 감자 농사는 풍년이야! 허수아비 덕분인지,\n밭을 망치는 몬스터도 없었다니까.' },
    { id: 't1girl2', x: 24, y: 17, dir: 'up', pal: PAL.girl, move: 'wander', talk: '연구소 앞 울타리 텃밭은 한별 박사님 거야.\n몬스터들이 좋아하는 열매를 키우신대.' },
    {
      id: 't1girl', x: 19, y: 11, dir: 'down', pal: PAL.girl, move: 'wander',
      talk: '풀숲에 들어가면 야생 몬스터가 튀어나와!\n몬스터 친구가 있어야 안전하게 지나갈 수 있어.',
    },
    {
      id: 't1old', x: 12, y: 15, dir: 'up', pal: PAL.oldman, move: 'look',
      talk: async () => {
        if (f('rod')) await say('오, 낚싯대를 얻었구먼! 이 연못에도 반짝피라가 산다네.');
        else await say('연못에 비친 햇살이 참 곱지?\n그래서 이 마을 이름이 솔빛마을이라네.');
      },
    },
  ],
  triggers: [
    {
      x: 32, y: 11, when: () => !f('badge7'),
      run: pushBack(['동쪽은 해솔고원으로 가는 길이다.', '「이 앞 해솔고원 — 배지 일곱 개를 모은 트레이너만 지나갈 수 있습니다」\n아직은 지나갈 수 없을 것 같다.'], 'left'),
    },
    ...[15, 16].map((x) => ({
      x, y: 1,
      when: () => !f('gotStarter'),
      run: pushBack(['한별 박사: 잠깐, {name}! 몬스터 없이 풀숲에 들어가면 위험해!', '먼저 오른쪽 연구소에 들러 주렴.'], 'down'),
    })),
  ],
};

const lab: MapDef = {
  id: 'lab', name: '한별 연구소', indoor: true,
  tiles: [
    'ㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅ',
    'ㅅkkkoookkㅅ',
    'ㅅooooooooㅅ',
    'ㅅoocccooㅮㅅ',
    'ㅅooooooooㅅ',
    'ㅅPooooooㆈㅅ',
    'ㅅPooooooㅨㅅ',
    'ㅅㅅㅅㅅeeㅅㅅㅅㅅ',
  ],
  warps: [
    { x: 4, y: 7, to: 'town1', tx: 22, ty: 8, dir: 'down' },
    { x: 5, y: 7, to: 'town1', tx: 22, ty: 8, dir: 'down' },
  ],
  npcs: [
    { id: 'prof', x: 4, y: 2, dir: 'down', pal: PAL.prof, talk: () => labProfessor() },
    { id: 'rival_lab', x: 6, y: 2, dir: 'down', pal: PAL.rival, hidden: () => f('gotStarter'), talk: () => rivalLabTalk() },
    {
      id: 'aide', x: 7, y: 5, dir: 'left', pal: PAL.aide, move: 'wander',
      talk: async () => {
        if (!f('gotStarter')) await say('박사님 앞에 있는 캡슐에 몬스터가 들어 있어요.\n박사님께 말을 걸어 보세요!');
        else await say('몬스터를 약하게 만든 다음 팜팜볼을 던지면 잡기 쉬워요.\n잠들거나 마비된 몬스터는 더 잘 잡혀요!');
      },
    },
  ],
};

const route1: MapDef = {
  id: 'route1', name: '1번 도로 햇살 언덕길',
  tiles: [
    '###########==###########',
    '#,,,,,,....==....,,,,,,#',
    '#,,,,,,....==....,,,,,,#',
    '#..#.......==.......#..#',
    '#..........==..........#',
    '#▽▽▽▽▽▽▽▽▽▤▤▽▽▽▽▽▽▽▽▽▽▽#',
    '#..........==.....f....#',
    '#.,,,,,,...==...,,,,,,.#',
    '#.,,,,,,...==...,,,,,,.#',
    '#..........==..........#',
    '#~~~~~~~~~~γγ~~~~~~~~~~#',
    '#~~~~~~~~~~γγ~~~~~~~~~~#',
    '#....f.....==......f...#',
    '#.,,,,.....=====.......#',
    '#.,,,,.........==..,,,.#',
    '#▓▓▓▓▓▓▓▓▓▓▓▓▓▤▤▓▓▓▓▓▓▓#',
    '#..............==......#',
    '#..,,,,,,......==..,,,.#',
    '#..,,,,,,..=====...,,,.#',
    '#..........==..........#',
    '#.#..,,,,..==..,,,,..#.#',
    '#....,,,,..==..,,,,....#',
    '#..........==..........#',
    '#▽▽▽▽▽▽▽▽▤▤▽▽▽▽▽▽▽▽▽▽▽▽#',
    '#.........==...........#',
    '#.,,,,,...==.....~~~~..#',
    '#.,,,,,...==.....~~~~..#',
    '#.........==...........#',
    '#..fff....======.......#',
    '#..............==.,,,,.#',
    '#.,,,,,,,......==.,,,,.#',
    '#.,,,,,,,......==......#',
    '#.............S==......#',
    '###############==#######',
  ],
  warps: [
    { x: 15, y: 33, to: 'town1', tx: 15, ty: 1, dir: 'down' },
    { x: 16, y: 33, to: 'town1', tx: 16, ty: 1, dir: 'down' },
    { x: 11, y: 0, to: 'town2', tx: 15, ty: 21, dir: 'up' },
    { x: 12, y: 0, to: 'town2', tx: 16, ty: 21, dir: 'up' },
  ],
  signs: [{ x: 7, y: 22, text: '1번 도로\n북쪽: 들꽃마을   남쪽: 솔빛마을' }],
  encounters: {
    rate: 0.12,
    table: [['tosil', 2, 4, 30], ['jjaek', 2, 4, 26], ['kkomul', 2, 4, 22], ['monsil', 3, 4, 7], ['ddakkum', 3, 4, 7], ['jjirit', 3, 5, 5], ['doldol', 3, 5, 3], ['bungbung', 2, 4, 20], ['dotori', 2, 4, 18]],
  },
  npcs: [
    { id: 'r1ledgetip', x: 8, y: 24, dir: 'down', pal: PAL.kid, move: 'look', talk: '언덕의 턱에서는 아래로 폴짝 뛰어내릴 수 있어!\n올라갈 땐 돌계단을 이용해야 하지만, 내려갈 땐 지름길이야.' },
    {
      id: 'r1tip', x: 13, y: 30, dir: 'down', pal: PAL.man, move: 'look',
      talk: '들꽃마을 체육관의 관장은 바위 타입을 쓴다더군.\n바위 타입은 물과 풀, 땅 기술에 약하지!',
    },
    {
      id: 'r1minsu', x: 4, y: 9, dir: 'right', pal: PAL.bugkid, sight: 4,
      trainer: {
        id: 'minsu', cls: '곤충소년', name: '민수', pal: PAL.bugkid, team: [['kkomul', 3], ['bungbung', 4]], reward: 120,
        intro: '풀숲에서 직접 잡은 내 벌레 몬스터를 봐라!', defeat: '으아, 내 꼬물이들이…!',
        after: '꼬물이는 고치가 됐다가 금방 나풀이로 변해! 진짜야!',
      },
    },
    {
      id: 'r1haneul', x: 20, y: 16, dir: 'left', pal: PAL.picnic, sight: 4,
      trainer: {
        id: 'haneul', cls: '소풍소녀', name: '하늘', pal: PAL.picnic, team: [['jjaek', 4], ['tosil', 5]], reward: 160,
        intro: '눈이 마주쳤으니 승부야!', defeat: '에이, 졌다~', after: '짹짹이는 바람새를 거쳐 회오리매가 된대.',
      },
    },
    {
      id: 'r1hiker', x: 2, y: 19, dir: 'right', pal: PAL.hiker, sight: 5,
      trainer: {
        id: 'cheolho', cls: '등산가', name: '철호', pal: PAL.hiker, team: [['doldol', 6]], reward: 240,
        intro: '하하! 산에서 단련한 내 돌돌이를 이길 수 있겠나?', defeat: '튼튼한 돌돌이가 지다니!',
        after: '돌돌이처럼 단단한 몬스터에겐 물이나 풀 기술이 잘 통하지.',
      },
    },
    {
      id: 'r1doyun', x: 14, y: 6, dir: 'left', pal: PAL.kid, sight: 3,
      trainer: {
        id: 'r1kid', cls: '반바지소년', name: '현우', pal: PAL.kid, team: [['tosil', 4], ['jjaek', 5]], reward: 100,
        intro: '반바지는 사계절 내내 입어야 제맛이지! 승부다!', defeat: '으, 다리가 시려…',
        after: '들꽃마을 체육관에도 수련생들이 잔뜩 있대. 미리 연습해 둬!',
      },
    },
    {
      id: 'r1lass', x: 18, y: 24, dir: 'left', pal: PAL.girl, sight: 7,
      trainer: {
        id: 'r1lass', cls: '꼬마아가씨', name: '예린', pal: PAL.girl, team: [['kkomul', 4], ['ddakkum', 5]], reward: 110,
        intro: '나랑 놀자! 몬스터 승부로!', defeat: '힝, 재밌었는데 졌다~',
        after: '따끔이는 풀숲에 아주 가끔 나와. 운이 좋았지!',
      },
    },
    { id: 'r1potion', x: 22, y: 1, dir: 'down', item: { id: 'potion', qty: 1 } },
    { id: 'r1ball', x: 1, y: 24, dir: 'down', item: { id: 'ball', qty: 2 } },
    { id: 'r1cure', x: 22, y: 14, dir: 'down', item: { id: 'cure', qty: 1 } },
  ],
};

const town2: MapDef = {
  id: 'town2', name: '들꽃마을',
  tiles: [
    '#####################=############',
    '#.ζζ.εε.ζζ...........=..εε.ζζζ.εε#',
    '#....................=...........#',
    '#ΘΘΘΘ................=......ΡΡΡΡ.#',
    '#ΘΘΘΘ...f..KKKKKK....=.f....ΡΡΡΡ.#',
    '#WwDW......KKKKKK....=......WwDW.#',
    '#..........WwWDWW....=........=..#',
    '#..=..........=......=........=..#',
    '#..=......BBBB=..MMMM=......κ.λ..#',
    '#..=......BHBB=..MMMM=........=..#',
    '#..=====..WEwW=..WwDW=........=..#',
    '#..........===========.....====..#',
    '#ff.ff.........==.....S..........#',
    '#ff.ff...ff....==.......ff.ff.ff.#',
    '#ψ.ψ.ψ..~~~....==..........ff.ff.#',
    '#.......~~~....==....fff.........#',
    '#εεεεε.........==..........ε.ε.ε.#',
    '#ff.ff.........==................#',
    '#..............==..θααααααα......#',
    '#ff.ff.ffε..ε..==εεααανξααα......#',
    '#fff.ff.ff.....==αααααοπααα......#',
    '#..............==..αααααααθ......#',
    '###############==#################',
  ],
  warps: [
    { x: 3, y: 5, to: 'house2a', tx: 5, ty: 7, dir: 'up' },
    { x: 30, y: 5, to: 'house2b', tx: 5, ty: 7, dir: 'up' },
    { x: 15, y: 22, to: 'route1', tx: 11, ty: 1, dir: 'down' },
    { x: 16, y: 22, to: 'route1', tx: 12, ty: 1, dir: 'down' },
    { x: 14, y: 6, to: 'dojo', tx: 6, ty: 12, dir: 'up' },
    { x: 11, y: 10, to: 'center', tx: 4, ty: 6, dir: 'up' },
    { x: 19, y: 10, to: 'shop', tx: 4, ty: 6, dir: 'up' },
    { x: 21, y: 0, to: 'route2', tx: 15, ty: 30, dir: 'up' },
  ],
  labels: [ { x: 3, y: 3.2, text: '온실', color: '#e0fff4', ink: '#2a7a5a' }, { x: 30, y: 3.2, text: '꽃집', color: '#ffe8f0', ink: '#b03a6a' }, { x: 23, y: 18.1, text: '꽃 광장', color: '#fff6d8', ink: '#8a6a20' },{ x: 12, y: 8.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 19, y: 8.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' }, { x: 14, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' }],
  signs: [{ x: 22, y: 12, text: '들꽃마을\n바람에 꽃향기가 실려 오는 마을  ·  북쪽: 2번 도로' }],
  npcs: [
    { id: 't2beekeeper', x: 4, y: 15, dir: 'up', pal: PAL.hiker, move: 'look', talk: '양봉가: 이 벌통엔 붕붕이들이 살아. 꿀단지벌로 자라면\n꿀을 한가득 모아 온다니까!' },
    { id: 't2girl', x: 25, y: 20, dir: 'left', pal: PAL.girl, move: 'wander', talk: '분수에 동전을 던지면 몬스터 친구가 생긴대!\n…나는 벌써 세 번이나 던졌는데.' },
    { id: 't2vendor', x: 29, y: 9, dir: 'down', pal: PAL.lady, talk: '꽃 노점: 오늘의 꽃은 들장미예요!\n…트레이너는 꽃보다 회복약이 필요하려나요?' },
    { id: 't2foxgirl', x: 20, y: 15, dir: 'down', pal: PAL.girl, move: 'look', talk: () => foxGirl() },
    {
      id: 't2kid', x: 18, y: 13, dir: 'down', pal: PAL.kid, move: 'wander',
      talk: '파란 지붕은 회복소, 노란 지붕은 상점이야!\n보라색 지붕은 체육관이고.',
    },
    {
      id: 't2lady', x: 23, y: 7, dir: 'down', pal: PAL.lady, move: 'look',
      talk: '봄이 되면 이 마을은 온통 들꽃으로 뒤덮여요.\n그때 꼭 다시 놀러 오세요.',
    },
    {
      id: 't2old', x: 12, y: 15, dir: 'right', pal: PAL.oldman,
      talk: '체육관 관장 단단은 바위처럼 흔들림이 없지.\n관장의 바위갑옷은 방어가 아주 높다네. 꾹 버텨야 해!',
    },
    { id: 't2potato', x: 24, y: 14, dir: 'left', pal: PAL.hiker, talk: () => potatoTalk() },
    { id: 'rival_t2', x: 16, y: 9, dir: 'left', pal: PAL.rival, hidden: () => !f('badge1') || f('ch2') },
  ],
  triggers: [
    { x: 21, y: 1, when: () => !f('badge1'), run: pushBack(['북쪽은 2번 도로다. 길목에 안내문이 붙어 있다.', '「이 앞은 야생 몬스터가 강합니다.\n체육관 배지를 가진 트레이너만 지나가 주세요.」'], 'down') },
    { x: 14, y: 8, when: () => f('badge1') && !f('ch2'), run: chapter2Scene },
    { x: 14, y: 9, when: () => f('badge1') && !f('ch2'), run: chapter2Scene },
  ],
};

const center = makeCenter('center', '들꽃마을 회복소', 'town2', 11, 11, '오른쪽 PC로 몬스터를 맡기거나 찾을 수 있어.\n동료는 여섯 마리까지만 데리고 다닐 수 있거든.');
const shop = makeShop('shop', '들꽃마을 상점', 'town2', 19, 11, '체육관에 가기 전에 회복약을 넉넉히 사 두는 게 좋아요.');

const dojo: MapDef = {
  id: 'dojo', name: '들꽃 체육관', indoor: true,
  tiles: [
    'ζζζζζζζζζζζζζζζζ',
    'ζεζdddddddddζεrζ',
    'ζdddddddddddddρζ',
    'ζrrrrrrrrrddrrrζ',
    'ζddddddddddddddζ',
    'ζddddddddddddddζ',
    'ζrrrdrrrrrrrrrrζ',
    'ζddddddddddddddζ',
    'ζddddddddddddddζ',
    'ζrrrrrrrrrrrdrrζ',
    'ζddddddddddddddζ',
    'ζεdddddddddddεdζ',
    'ζddddddddddddddζ',
    'ζζζζζζeeζζζζζζζζ',
  ],
  warps: [
    { x: 6, y: 13, to: 'town2', tx: 14, ty: 7, dir: 'down' },
    { x: 7, y: 13, to: 'town2', tx: 14, ty: 7, dir: 'down' },
  ],
  npcs: [
    {
      id: 'pupil', x: 14, y: 8, dir: 'left', pal: PAL.pupil, sight: 2,
      trainer: {
        id: 'donghyun', cls: '수련생', name: '동현', pal: PAL.pupil, team: [['tosil', 7], ['doldol', 8]], reward: 400,
        intro: '관장님께 도전하려면 나부터 넘어서야지!', defeat: '으윽, 아직 수련이 부족했다…',
        after: '관장님의 바위갑옷은 정말 단단해.\n체력을 꼭 회복하고 도전해!',
      },
    },
    {
      id: 'pupil2', x: 1, y: 5, dir: 'right', pal: PAL.pupil, sight: 3,
      trainer: {
        id: 'seoyeon', cls: '수련생', name: '서연', pal: PAL.pupil, team: [['jjaek', 6], ['doldol', 7]], reward: 280,
        intro: '체육관에서는 기합이 생명이야! 이얍!', defeat: '기합이 모자랐나…',
        after: '돌돌이는 몸을 웅크리면 방어가 더 올라가. 빨리 쓰러뜨리는 게 좋아!',
      },
    },
    { id: 'dojorock1', x: 12, y: 10, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    { id: 'dojorock3', x: 11, y: 4, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    { id: 'dojorock4', x: 4, y: 7, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    { id: 'dojorock2', x: 10, y: 4, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    { id: 'dojohint', x: 14, y: 12, dir: 'left', pal: PAL.pupil, talk: '수련생: 이 체육관에서는 바위를 밀어서 길을 열어야 해!\n잘못 밀어서 막혔다면 밖에 나갔다 들어오면 바위가 제자리로 돌아와.' },
    {
      id: 'pupil3', x: 13, y: 2, dir: 'left', pal: PAL.pupil, sight: 3,
      trainer: {
        id: 'jiho', cls: '수련생', name: '지호', pal: PAL.pupil, team: [['tosil', 7], ['kkomul', 6]], reward: 260,
        intro: '관장님 바로 앞이니까 마지막 시험이다!', defeat: '좋아, 지나가도 좋다!',
        after: '관장님은 바위 타입이지만, 마음은 따뜻한 분이야.',
      },
    },
    {
      id: 'leader', requires: ['donghyun', 'seoyeon', 'jiho'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 7, y: 1, dir: 'down', pal: PAL.leader,
      trainer: {
        id: 'leader1', cls: '관장', name: '단단', pal: PAL.leader, team: [['doldol', 8], ['bawi', 10]], reward: 1200,
        intro: '체육관에 잘 왔다! 나는 관장 단단.\n바위처럼 흔들리지 않는 마음으로 수련하고 있지.\n자, 네 실력을 보여 봐라!',
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
  id: 'route2', name: '2번 도로 개울 계단밭',
  tiles: [
    '###########==###########',
    '#,,,,,,,...==...,,,,,,,#',
    '#,,,,,,,...==...,,,,,,,#',
    '#####......==......#####',
    '#..........==..........#',
    '#.,,,,,....==....,,,,,.#',
    '#.,,,,,....=====.,,,,,.#',
    '#..........==.==.......#',
    '#▽▽▽▽▽▽▽▽▽▽▽▽▽▤▤▽▽▽▽▽▽▽#',
    '#.............==.......#',
    '#~ⓖ~~~~~~~~~~~γγ~~~~~~~#',
    '#~~~~~~~~~~~~~γγ~~~~ⓛ~~#',
    '#.............==.......#',
    '#.φφφφφ.ω.....==...φφφ.#',
    '#.φφφφφ.......==...φφφ.#',
    '#.........======.......#',
    '#..,,,,,..==...........#',
    '#..,,,,,..==.....,,,,,,#',
    '#..,,,,,..==.....,,,,,,#',
    '#.........==...........#',
    '#~~~~~~~~~γγ~~~~~~~~~~~#',
    '#~~~~~~~~~γγ~~~~~~~~~~~#',
    '#.........==...........#',
    '#.ς..ς....==.....,,,,,.#',
    '#.........==.....,,,,,.#',
    '#▽▽▽▽▽▽▽▽▽▤▤▽▽▽▽▽▽▽▽▽▽▽#',
    '#.........==...........#',
    '#.,,,,,,..=======......#',
    '#.,,,,,,.......==..fff.#',
    '#..............==......#',
    '#..#..........S==...#..#',
    '###############==#######',
  ],
  warps: [
    { x: 15, y: 31, to: 'town2', tx: 21, ty: 1, dir: 'down' },
    { x: 16, y: 31, to: 'town2', tx: 21, ty: 1, dir: 'down' },
    { x: 11, y: 0, to: 'forest', tx: 10, ty: 24, dir: 'up' },
    { x: 12, y: 0, to: 'forest', tx: 10, ty: 24, dir: 'up' },
  ],
  signs: [{ x: 14, y: 30, text: '2번 도로\n북쪽: 속삭임숲   남쪽: 들꽃마을' }],
  encounters: {
    rate: 0.12,
    table: [['tosil', 6, 8, 18], ['jjaek', 6, 8, 16], ['pojani', 6, 8, 22], ['jinheuk', 6, 8, 16], ['ddakkum', 6, 8, 16], ['kkomul', 5, 7, 5], ['doldol', 7, 8, 4], ['kkaeng', 6, 8, 8], ['monsil', 6, 8, 5], ['dalto', 7, 8, 4], ['mongmong', 6, 8, 5], ['agigom', 7, 8, 4], ['chorong', 5, 7, 6], ['bungbung', 5, 7, 12], ['meongmeong', 5, 8, 14], ['dotori', 5, 7, 10]],
  },
  npcs: [
    {
      id: 'r2birder', x: 6, y: 4, dir: 'right', pal: PAL.birder, sight: 5,
      trainer: {
        id: 'taeo', cls: '새관찰가', name: '태오', pal: PAL.birder, team: [['jjaek', 10], ['baramsae', 12]], reward: 360,
        intro: '쉿! 지금 바람새를 관찰하는 중이었다고!', defeat: '날아가 버렸네…', after: '바람새는 볏으로 바람 방향을 읽는대. 신기하지?',
      },
    },
    {
      id: 'r2sua', x: 17, y: 13, dir: 'left', pal: PAL.lady, sight: 5,
      trainer: {
        id: 'sua', cls: '아가씨', name: '수아', pal: PAL.lady, team: [['ddakkum', 10], ['monsil', 10]], reward: 340,
        intro: '어머, 마침 심심했는데 잘됐다!', defeat: '어머머, 강하시네요.', after: '따끔이를 쓰다듬으면 따끔하지만 정말 귀여워요.',
      },
    },
    grunt('r2grunt', 13, 17, 'left', 5, [['maekae', 9], ['pojani', 10]],
      '뭘 봐? 검은안개단 일에 끼어들지 마라!', '이, 이럴 수가!', '흥, 숲에 가 봤자 소용없을걸. 간부님이 계시거든!'),
    {
      id: 'r2junho', x: 6, y: 23, dir: 'right', pal: PAL.kid, sight: 4,
      trainer: {
        id: 'junho', cls: '꼬마', name: '준호', pal: PAL.kid, team: [['jinheuk', 8], ['kkaeng', 9]], reward: 200,
        intro: '진흙 놀이 하다가 잡은 내 몬스터 볼래?', defeat: '으앙, 옷만 버렸어!', after: '진흙이는 전기 기술을 맞아도 끄떡없어!',
      },
    },
    { id: 'r2super', x: 21, y: 4, dir: 'down', item: { id: 'superpotion', qty: 1 } },
    { id: 'r2ball', x: 22, y: 14, dir: 'down', item: { id: 'ball', qty: 3 } },
    { id: 'r2potion', x: 2, y: 29, dir: 'down', item: { id: 'potion', qty: 2 } },
  ],
};

const forest: MapDef = {
  id: 'forest', name: '속삭임숲', ambience: 'forest',
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
    '.....................#',
    '##########=###########',
  ],
  warps: [
    { x: 10, y: 25, to: 'route2', tx: 11, ty: 1, dir: 'down' },
    { x: 10, y: 0, to: 'town3', tx: 17, ty: 22, dir: 'up' },
    { x: 0, y: 24, to: 'forest_grove', tx: 7, ty: 10, dir: 'up' },
  ],
  encounters: {
    rate: 0.13,
    table: [['pojani', 8, 10, 22], ['dokbul', 8, 10, 12], ['soejip', 8, 10, 12], ['kkwae', 8, 10, 12], ['kkomul', 8, 9, 8], ['dandan', 8, 9, 6], ['ddakkum', 8, 10, 10], ['baramsae', 10, 11, 8], ['naphul', 10, 11, 4], ['beoseot', 11, 12, 6], ['bueong', 8, 10, 10], ['agigom', 9, 10, 5], ['bandi', 8, 11, 16], ['kkuldanji', 9, 11, 6]],
  },
  npcs: [
    { id: 'granny', x: 5, y: 21, dir: 'down', pal: PAL.granny, talk: () => grannyTalk() },
    {
      id: 'fguard', x: 10, y: 2, dir: 'down', pal: PAL.grunt, hidden: () => f('forestCleared'),
      talk: '검은안개단: 여긴 못 지나간다! 숲은 우리가 접수했다고.\n간부님은 숲 한가운데 공터에 계시지. 감히 갈 수 있으면 가 보시든가!',
    },
    grunt('fgrunt1', 1, 16, 'right', 4, [['pojani', 11], ['kkomul', 11]],
      '숲의 몬스터는 전부 우리 차지다!', '크윽…', '간부님께 혼나겠군…'),
    grunt('fgrunt2', 20, 16, 'left', 5, [['maekae', 12], ['kkwae', 12]],
      '꼬마가 여긴 왜 왔어? 썩 돌아가!', '말도 안 돼!', '간부 잿빛 님은 우리랑은 차원이 다르다고.'),
    grunt('fgrunt3', 9, 6, 'right', 2, [['jinheuk', 12], ['pojani', 12]],
      '여기서부터는 검은안개단 구역이다!', '쳇, 방심했다…', '별빛결정이라나 뭐라나… 높은 분들 생각은 잘 모르겠어.'),
    {
      id: 'fadmin', x: 10, y: 14, dir: 'down', pal: PAL.admin, sight: 3, hidden: () => f('forestCleared'),
      requires: ['fgrunt1', 'fgrunt2', 'fgrunt3'],
      waitText: '잿빛: …흥, 꼬마 하나가 숲에 들어왔다고? 내가 직접 나설 것도 없지.\n숲 곳곳에 있는 내 부하들부터 상대해 보시지!',
      trainer: {
        id: 'admin1', cls: '검은안개단 간부', name: '잿빛', pal: PAL.admin, team: [['maekae', 13], ['kkwae', 13], ['beoseot', 14]], reward: 1000,
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
  triggers: [
    { x: 10, y: 19, when: () => !f('forestCleared'), run: () => whisper('whisperA', '…검은 옷… 무서워… 친구들을 데려갔어…') },
    { x: 5, y: 10, when: () => !f('forestCleared'), run: () => whisper('whisperB', '…공터… 우리 친구들이 갇혀 있어… 도와줘…') },
    { x: 1, y: 24, when: () => !f('forestCleared'), run: pushBack(['서쪽은 나무가 빽빽한 깊은 숲이다.', '안쪽에서 무섭게 웅웅거리는 소리가 들린다…\n지금은 들어가지 않는 게 좋겠다.'], 'right') },
  ],
};

const forest_grove: MapDef = {
  id: 'forest_grove', name: '속삭임숲 — 깊은 숲', ambience: 'forest',
  tiles: [
    '#######.######',
    '#,,,,##.##,,,#',
    '#,,,,#...#,,,#',
    '##.,,.....,.##',
    '#,,,.......,,#',
    '#,,...,,,...,#',
    '..............',
    '#,,...,,,...,#',
    '#,,,.......,,#',
    '##.,,.....,.##',
    '#,,,,#...#,,,#',
    '#######.######',
  ],
  warps: [{ x: 7, y: 11, to: 'forest', tx: 1, ty: 24, dir: 'right' }],
  encounters: { rate: 0.06, table: [['bandi', 9, 11, 30], ['bueong', 9, 11, 20], ['beoseot', 10, 12, 15], ['monsil', 9, 11, 15], ['kkwae', 9, 11, 10]] },
  npcs: [
    { id: 'ffly_up', x: 6, y: 1, dir: 'down', mon: 'bandi', hidden: () => !fireflyAt('up'), talk: () => fireflyTalk() },
    { id: 'ffly_left', x: 1, y: 5, dir: 'down', mon: 'bandi', hidden: () => !fireflyAt('left'), talk: () => fireflyTalk() },
    { id: 'ffly_right', x: 12, y: 5, dir: 'down', mon: 'bandi', hidden: () => !fireflyAt('right'), talk: () => fireflyTalk() },
  ],
  triggers: [
    { x: 7, y: 0, run: () => groveExit('up') },
    { x: 0, y: 6, run: () => groveExit('left') },
    { x: 13, y: 6, run: () => groveExit('right') },
  ],
};
const forest_tree: MapDef = {
  id: 'forest_tree', name: '속삭임숲 — 고목 공터', ambience: 'forest',
  tiles: [
    '############',
    '#,,,.┏┓.,,,#',
    '#,,..┗┛..,,#',
    '#,ⓝ.......,#',
    '#..........#',
    '#.f......f.#',
    '#..........#',
    '#,........,#',
    '#,,......,,#',
    '######.#####',
  ],
  warps: [{ x: 6, y: 9, to: 'forest', tx: 1, ty: 24, dir: 'right' }],
  npcs: [
    { id: 'oldtree1', x: 5, y: 2, dir: 'down', prop: '┗', talk: () => oldTree() },
    { id: 'oldtree2', x: 6, y: 2, dir: 'down', prop: '┛', talk: () => oldTree() },
    { id: 'nest', x: 2, y: 3, dir: 'down', prop: 'ⓝ', talk: () => nestTalk() },
    { id: 'grovemong', x: 4, y: 4, dir: 'down', mon: 'mongmong', hidden: () => f('groveMong'), talk: () => lostMong() },
  ],
};
const town3: MapDef = {
  id: 'town3', name: '물안개마을', ambience: 'mist',
  tiles: [
    '####################################',
    '#...................~~~~~ⓛ~~~~AAAAⓖ#',
    '#AAAA...............~~ⓛ~~~~~~~AAAA~#',
    '#AAAA...............ⓖ.......ⓖ~ϜϝDϜ~#',
    '#ϜϝDϜ.......AAAAAA...~~~~~~~~~~~γ~ⓛ#',
    '#..=........AAAAAA...~~~~~~~~Ⅳ~~γ~~#',
    '#..=........WwWDWW...~~~~~~~~~~~γ~~#',
    '#..=...........=.....+++~~~~~γγγγγγ#',
    '#ⓖ~δ~~ⓖ...BBBB.=..MMMM.~~~~~~~~~γ~Ⅳ#',
    '#~~δ~~~...BHBB.=..MMMM.~~~~~~ⓛ~~γ~~#',
    '#~~δ~~~...WEwW.=..WwDW.~~~~~ⓖ~~~γⓛⓖ#',
    '#ⓛ~δ~ⓖ~....=========================',
    '#~~δ~~~..........=......S..........#',
    '#..=....~~~~.....=.................#',
    '#..=....~~~~..ff.=...,,,,..........#',
    '#..=....~~~~.....=...,,,,..........#',
    '#..=.............=.................#',
    '==================.................#',
    '#................=........ⓣ...ⓣ....#',
    '##.#.#...Ϙ...Ϙ...=...Ϙ...Ϙ.........#',
    '#.#.#.....θ......θ........εε.εε....#',
    '##.#.#...........=.................#',
    '#................=.................#',
    '#################=##################',
  ],
  warps: [
    { x: 32, y: 3, to: 'house3a', tx: 5, ty: 7, dir: 'up' },
    { x: 3, y: 4, to: 'house3b', tx: 5, ty: 7, dir: 'up' },
    { x: 0, y: 17, to: 'pastel', tx: 20, ty: 10, dir: 'left' },
    { x: 17, y: 23, to: 'forest', tx: 10, ty: 1, dir: 'down' },
    { x: 15, y: 6, to: 'gym2', tx: 7, ty: 12, dir: 'up' },
    { x: 11, y: 10, to: 'center3', tx: 4, ty: 6, dir: 'up' },
    { x: 20, y: 10, to: 'shop3', tx: 4, ty: 6, dir: 'up' },
    { x: 35, y: 11, to: 'route3', tx: 1, ty: 9, dir: 'right' },
  ],
  labels: [ { x: 32, y: 1.2, text: '어부의 집', color: '#e0f4ff', ink: '#2a5a8a' }, { x: 2.5, y: 2.2, text: '안개 찻집', color: '#e8fff4', ink: '#2a6a5a' },{ x: 12, y: 8.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 20, y: 8.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' }, { x: 15, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' }],
  signs: [{ x: 24, y: 12, text: '물안개마을\n새벽마다 호수에 안개가 피어오르는 마을\n동쪽: 3번 도로  ·  서쪽: 솜사탕언덕' }],
  encounters: { rate: 0.1, table: [['pojani', 9, 11, 25], ['jinheuk', 9, 11, 20], ['baramsae', 10, 12, 20], ['dalto', 9, 11, 18], ['kkwae', 9, 11, 17], ['mongmong', 9, 11, 12], ['dukeop', 9, 11, 18]] },
  fishing: [['banjjak', 8, 12, 55], ['munu', 8, 11, 25], ['mulgwi', 9, 12, 12], ['eungeo', 15, 17, 8]],
  npcs: [
    { id: 't3boatman', x: 31, y: 7, dir: 'right', pal: PAL.fisher, talk: '뱃사공: 호수 건너편까진 못 가지만, 데크 끝에서 낚시는 할 수 있지.\n물안개 속에서 낚싯대를 드리우면 마음이 차분해진다네.' },
    { id: 't3lantern', x: 22, y: 20, dir: 'up', pal: PAL.lady, move: 'wander', talk: '밤이 되면 이 등불들이 안개 속에서 반딧불처럼 번져 보여요.\n물안개마을에서 제일 좋아하는 길이에요.' },
    { id: 'fisher', x: 22, y: 7, dir: 'right', pal: PAL.fisher, talk: () => fisherTalk() },
    {
      id: 't3guard', x: 34, y: 11, dir: 'left', pal: PAL.guard, hidden: () => f('badge2'),
      talk: '경비: 동쪽 3번 도로는 지금 위험해. 검은안개단이 들락거리거든.\n체육관 관장 마루 님께 인정받은 트레이너만 보내 줄 수 있어.',
    },
    {
      id: 't3kid', x: 13, y: 16, dir: 'up', pal: PAL.kid, move: 'wander',
      talk: '물안개 체육관은 안에 물웅덩이가 가득해!\n나무 다리를 따라가야 관장님한테 갈 수 있어.',
    },
    {
      id: 't3old', x: 10, y: 12, dir: 'down', pal: PAL.oldman, move: 'look',
      talk: '옛날이야기 하나 해 줄까? 동쪽 별빛동굴 깊은 곳에는\n별을 삼킨 고래가 잠들어 있다네. 그 고래가 깨면 밤하늘에 별비가 내린다지.',
    },
    { id: 'rival_t3', x: 17, y: 14, dir: 'down', pal: PAL.rival, hidden: () => f('rival2') || !f('forestCleared') },
  ],
  triggers: [{ x: 17, y: 16, when: () => !f('rival2') && f('forestCleared'), run: rival2Scene }],
};

const center3 = makeCenter('center3', '물안개마을 회복소', 'town3', 11, 11, '물 타입 몬스터는 전기 기술에 약해.\n관장님께 도전하기 전에 잘 준비해!');
const shop3 = makeShop('shop3', '물안개마을 상점', 'town3', 20, 11, '물가에서는 낚싯대로 물속 몬스터를 낚을 수 있대요.');

const gym2: MapDef = {
  id: 'gym2', name: '물안개 체육관', indoor: true,
  tiles: [
    'XXXXXXXXXXXXXXXX',
    'X~~~oooooooo~~~X',
    'X~ⓛ~oooooooo~ⓛ~X',
    'X~~~~~~γγ~~~~~~X',
    'X~~~~~~γγ~~~~~~X',
    'X^oγγγγγγγγγγo~X',
    'X~~~~~~γγ~~~~ⓖ~X',
    'X~ⓖ~~~~γγ~~~~~~X',
    'Xoo~~~~γγ~~~~ooX',
    'X^oγγγγγγγγγγooX',
    'Xoo~~~~γγ~~~~o^X',
    'X~~~~~~γγ~~~~~~X',
    'X~ⓛ~~ooooooo~ⓛ~X',
    'XXXXXXXeeXXXXXXX',
  ],
  warps: [
    { x: 7, y: 13, to: 'town3', tx: 15, ty: 7, dir: 'down' },
    { x: 8, y: 13, to: 'town3', tx: 15, ty: 7, dir: 'down' },
  ],
  fishing: [['banjjak', 10, 14, 65], ['munu', 10, 13, 25], ['eungeo', 17, 18, 10]],
  triggers: [
    { x: 14, y: 10, run: lever('g2a', '덜컹! 서쪽 데크의 수문이 열렸다!') },
    { x: 1, y: 9, run: lever('g2b', '덜컹! 북쪽 수로의 수문이 열렸다!') },
    { x: 1, y: 5, run: lever('g2c', '덜컹! 관장님 앞 수문이 열렸다!') },
  ],
  npcs: [
    { id: 'g2gateA', x: 3, y: 9, dir: 'down', barrier: 'water', hidden: () => f('g2a'), talk: '수문이 굳게 닫혀 있다. 어딘가의 레버로 열 수 있을 것 같다.' },
    { id: 'g2gateB1', x: 7, y: 7, dir: 'down', barrier: 'water', hidden: () => f('g2b'), talk: '수문이 굳게 닫혀 있다. 어딘가의 레버로 열 수 있을 것 같다.' },
    { id: 'g2gateB2', x: 8, y: 7, dir: 'down', barrier: 'water', hidden: () => f('g2b'), talk: '수문이 굳게 닫혀 있다. 어딘가의 레버로 열 수 있을 것 같다.' },
    { id: 'g2gateC1', x: 7, y: 4, dir: 'down', barrier: 'water', hidden: () => f('g2c'), talk: '수문이 굳게 닫혀 있다. 어딘가의 레버로 열 수 있을 것 같다.' },
    { id: 'g2gateC2', x: 8, y: 4, dir: 'down', barrier: 'water', hidden: () => f('g2c'), talk: '수문이 굳게 닫혀 있다. 어딘가의 레버로 열 수 있을 것 같다.' },
    { id: 'g2guide', x: 10, y: 12, dir: 'left', pal: PAL.swimmer, talk: '물안개 체육관은 수문 세 개를 차례로 열어야 해!\n레버를 밟으면 어딘가의 수문이 열리지. 데크를 따라 잘 살펴봐.' },
    {
      id: 'swimA', x: 14, y: 9, dir: 'left', pal: PAL.swimmer, sight: 6,
      trainer: {
        id: 'swimA', cls: '수영선수', name: '바다', pal: PAL.swimmer, team: [['banjjak', 15], ['agipeng', 15]], reward: 600,
        intro: '물 위에서 나를 이길 수 있을까?', defeat: '꼬르륵…', after: '관장님은 물처럼 유연하게 싸우셔.',
      },
    },
    {
      id: 'swimB', x: 13, y: 5, dir: 'left', pal: PAL.swimmer, sight: 11,
      trainer: {
        id: 'swimB', cls: '수영선수', name: '여울', pal: PAL.swimmer, team: [['banjjak', 16], ['munu', 16]], reward: 640,
        intro: '관장님께 가려면 나를 넘어가야 해!', defeat: '파도에 휩쓸렸어…', after: '관장님의 은빛잉어는 정말 아름다워!',
      },
    },
    {
      id: 'maru', requires: ['swimA', 'swimB'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 7, y: 1, dir: 'down', pal: PAL.maru,
      trainer: {
        id: 'leader2', cls: '관장', name: '마루', pal: PAL.maru, team: [['banjjak', 15], ['mulbora', 16], ['eungeo', 18]], reward: 1900,
        intro: '물안개 체육관에 온 걸 환영해! 나는 관장 마루.\n물은 막으면 돌아가고, 고이면 깊어지지.\n네 몬스터들이 얼마나 깊은지 보여 줘!',
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
  id: 'route3', name: '3번 도로 바위 단층길',
  tiles: [
    '####################=###################',
    '#.,,,,,,,.#.........=...,,,,,,,,,......#',
    '#.,,,,,,,....~~~~~..=...,,,,,,,,,......#',
    '#............~~~~~..=...,,,,,,,,,..#.#.#',
    '#...................=..................#',
    '#▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▤▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓#',
    '#..,,,,,,...........=..,,,,,,.....CCCCC#',
    '#..,,,,,,#..........=..,,,,,,.....CCCCC#',
    '#...............S...=.............CCCCC#',
    '==================================CCOCC#',
    '#...........,,,,,,,..............====..#',
    '#...........,,,,,,,...........#........#',
    '#▽▽▽▽▽▤▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽#',
    '#.,,,,,,,,.....................,,,,,,..#',
    '#.,,,,,,,,..............~~~~~~.,,,,,,..#',
    '#...........#..#........~~~~~~.........#',
    '#......................................#',
    '########################################',
  ],
  warps: [
    { x: 0, y: 9, to: 'town3', tx: 34, ty: 11, dir: 'left' },
    { x: 36, y: 9, to: 'cave', tx: 1, ty: 18, dir: 'up' },
    { x: 20, y: 0, to: 'peak', tx: 9, ty: 19, dir: 'up' },
  ],
  triggers: [{
    x: 20, y: 1, when: () => !f('badge3'),
    run: pushBack(['북쪽은 운무봉으로 가는 산길이다.\n입구에 금줄이 쳐져 있다.', '「신성한 산입니다. 배지 세 개를 모은 분만 오르세요.」'], 'down'),
  }],
  signs: [{ x: 16, y: 8, text: '3번 도로\n동쪽: 별빛동굴  서쪽: 물안개마을  북쪽: 운무봉' }],
  encounters: {
    rate: 0.13,
    table: [['jinheuk', 12, 14, 15], ['ddakkum', 12, 14, 13], ['baramsae', 13, 14, 12], ['beoseot', 13, 14, 10], ['jjirit', 12, 14, 10], ['tongsil', 13, 14, 9], ['kkaeng', 13, 14, 10], ['dalto', 12, 14, 9], ['kkwae', 13, 14, 6], ['beonjjeok', 14, 14, 4], ['soejip', 13, 14, 2], ['agigom', 13, 14, 7], ['ggorichim', 13, 14, 7], ['ggangtong', 12, 14, 5], ['meongmeong', 12, 14, 12], ['dukeop', 12, 13, 10], ['geomi', 12, 14, 14]],
  },
  fishing: [['banjjak', 12, 17, 55], ['munu', 13, 15, 25], ['eungeo', 17, 20, 15], ['meokmul', 16, 18, 5]],
  npcs: [
    grunt('r3grunt', 32, 8, 'down', 2, [['ggorichim', 16], ['baramsae', 16]],
      '동굴 쪽으로는 못 간다! 두목님의 중요한 작전 중이다!', '두, 두목님께 알려야 해!', '두목 흑영 님은 동굴 지하 호수에 계신다… 아, 말해 버렸다.'),
    {
      id: 'r3hiker', x: 21, y: 7, dir: 'left', pal: PAL.hiker, sight: 2,
      trainer: {
        id: 'dongsu', cls: '등산가', name: '동수', pal: PAL.hiker, team: [['agigom', 16], ['doldol', 16], ['jinheuk', 17]], reward: 700,
        intro: '별빛동굴에 가려고? 그럼 나부터 넘어 봐라!', defeat: '허허, 제법인걸.', after: '동굴 안은 어두우니 발밑을 조심하게.',
      },
    },
    {
      id: 'r3girl', x: 8, y: 11, dir: 'up', pal: PAL.picnic, sight: 3,
      trainer: {
        id: 'nari', cls: '소풍소녀', name: '나리', pal: PAL.picnic, team: [['mongmong', 15], ['ddakkum', 15], ['pojani', 16]], reward: 480,
        intro: '도시락 먹기 전에 한판 어때?', defeat: '배고파서 졌다…', after: '동쪽 동굴을 지나면 별빛시가 나와. 엄청 큰 도시래!',
      },
    },
    { id: 'r3hyper', x: 3, y: 3, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
    { id: 'r3revive', x: 2, y: 16, dir: 'down', item: { id: 'revive', qty: 1 } },
    { id: 'r3ball', x: 37, y: 15, dir: 'down', item: { id: 'superball', qty: 2 } },
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
    { x: 1, y: 19, to: 'route3', tx: 36, ty: 10, dir: 'down' },
    { x: 21, y: 0, to: 'town4', tx: 17, ty: 22, dir: 'up' },
  ],
  encounters: {
    rate: 0.1,
    tiles: '_',
    table: [['doldol', 14, 16, 20], ['jinheuk', 14, 16, 17], ['dokbul', 14, 16, 15], ['agipeng', 14, 16, 13], ['heukjang', 15, 17, 9], ['jjirit', 14, 16, 9], ['bawi', 16, 17, 5], ['beoseot', 15, 16, 5], ['dokkae', 16, 17, 4], ['kkomaryong', 15, 16, 3], ['ggangtong', 14, 16, 8], ['ggorichim', 14, 16, 6], ['nunnyang', 14, 16, 7], ['bandi', 14, 16, 8], ['banjjakbandi', 15, 16, 3], ['geomi', 14, 16, 8], ['dujji', 14, 16, 10], ['geumul', 16, 17, 3]],
  },
  fishing: [['banjjak', 15, 19, 40], ['eungeo', 18, 20, 30], ['munu', 15, 17, 15], ['meokmul', 18, 20, 15]],
  npcs: [
    { id: 'fossilsite', x: 1, y: 6, dir: 'down', prop: '¶', hidden: () => f('fossilTaken'), talk: () => fossilSite() },
    { id: 'cavechest1', x: 2, y: 6, dir: 'down', prop: chestProp('cave1'), talk: () => chestTalk('cave1', 'superpotion', 2, 17) },
    { id: 'cavechest2', x: 12, y: 11, dir: 'down', prop: chestProp('cave2'), talk: () => chestTalk('cave2', 'superball', 3, 18) },
    { id: 'cavechest3', x: 10, y: 5, dir: 'down', prop: chestProp('cave3'), talk: () => chestTalk('cave3', 'revive', 1, 18) },
    grunt('cgrunt1', 7, 16, 'down', 1, [['maekae', 18], ['meokmul', 18]],
      '침입자다! 여기서 끝장내 주마!', '으악!', '이 동굴의 별빛결정은 전부 두목님 거다.'),
    grunt('cgrunt2', 9, 8, 'down', 1, [['beoseot', 19], ['dokbul', 19]],
      '두목님의 의식을 방해하게 둘 순 없지!', '크윽…', '의식이 끝나면 은하고래가 우리 편이 될 거다…'),
    {
      id: 'cadmin', x: 5, y: 8, dir: 'right', pal: PAL.admin, sight: 2, hidden: () => f('bossDone'),
      requires: ['cgrunt1', 'cgrunt2'],
      waitText: '잿빛: 또 너냐… 하지만 동굴 곳곳의 부하들을 두고 나한테 왔다고?\n그 녀석들부터 이기고 와라!',
      trainer: {
        id: 'admin2', cls: '검은안개단 간부', name: '잿빛', pal: PAL.admin, team: [['kkwae', 20], ['heukjang', 20], ['yeongi', 21]], reward: 1600,
        intro: '또 너냐! 숲에서 당한 빚, 여기서 갚아 주지!', defeat: '두 번이나… 말도 안 돼…',
        after: '흑영 님은 호수 앞에 계신다… 하지만 넌 절대 못 이길 거다.',
      },
    },
    { id: 'boss', x: 6, y: 5, dir: 'up', pal: PAL.boss, hidden: () => f('bossDone'), requires: ['cgrunt1', 'cgrunt2', 'admin2'], waitText: '흑영은 호수를 바라본 채 꼼짝도 하지 않는다.\n간부 잿빛이 버티고 있는 한 다가갈 수 없을 것 같다…', talk: () => bossScene() },
    { id: 'whale', x: 6, y: 4, dir: 'down', mon: 'eunha', hidden: () => f('whale'), talk: () => whaleTalk() },
    {
      id: 'cguard', x: 21, y: 2, dir: 'down', pal: PAL.grunt, hidden: () => f('bossDone'),
      talk: '검은안개단: 출구는 봉쇄했다! 두목님의 의식이 끝날 때까지\n아무도 못 나간다고!',
    },
    { id: 'lg_cheolsan', x: 19, y: 13, dir: 'down', mon: 'cheolsan', hidden: () => !f('lg_hint_cheolsan') || f('lg_cheolsan'),
      talk: () => legendEncounter('cheolsan', 65, '무쇠 같은 거대한 몬스터가 갱도를 막고 서 있다. 땅이 울린다…\n다가가 볼까?', '철산: 쿠우우우웅——!') },
    { id: 'miner', x: 17, y: 5, dir: 'down', pal: PAL.hiker, hidden: () => !f('bossDone'), talk: () => minerTalk() },
    { id: 'csuperball', x: 1, y: 15, dir: 'down', item: { id: 'superball', qty: 3 } },
    { id: 'chyper', x: 22, y: 11, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
    { id: 'crevive', x: 3, y: 11, dir: 'down', item: { id: 'revive', qty: 1 } },
  ],
  triggers: [1, 2, 4, 5, 6, 7, 8, 10, 11].map((x) => ({
    x, y: 7,
    when: () => !f('bossDone') && beatenAll(['cgrunt1', 'cgrunt2', 'admin2']),
    run: bossScene,
  })),
};

const town4: MapDef = {
  id: 'town4', name: '별빛시',
  tiles: [
    '####################################',
    '#ααααααααⓣααϘααⓣααϘααⓣααϘααⓣααααααα#',
    '#αⓐⓓαααααααααααααααααααααααααΣΣΣΣΣα#',
    '#αⓔⓕαααααααααααααααααααααααααΣΣΣΣΣα#',
    '#αββααααααYYYYYYααααYYYYYYαααWwDwWα#',
    '#ββββββαααYYYYYYααααYYYYYYαααααβααα#',
    '#αααααβαααWwWDWWααααWwWDwWαααααβααα#',
    '#ΣΣΣΣΣβαϘααααβαααααααϘαααααααααβααα#',
    '#ΣΣΣΣΣβααBBBBβααMMMMαααααααααραβαρα#',
    '#WwwwWβααBHBBβααMMMMαααααααααααβααα#',
    '#.....βααWEwWβααWwDWαααααααααααβααα#',
    '#ⓣ.ⓣ.ⓣβααβββββββββββααααααϘααααβααα#',
    '#αααααβααααααααααβαααααSαααααααβααα#',
    '#αααααβααffααααααβααααααααϘααααβααα#',
    '#αααααβαϘααααααααβββββββββββββββββββ',
    '#αααααβααααααααααβααfffαααααααααααα#',
    '#αααααβααααααααααβααααααααααακαλακα#',
    '#ββββββααααααααααβααααααααααααααααα#',
    '#ααααααα........αβαααααααααα......α#',
    '#ΣΣΣΣααα........αβαϘϖϖνξϖϖϖϘ.ⓣ...ⓣα#',
    '#ΣΣΣΣαααε.ε.ε.ε.αβαϖϖϖοπϖϖϖϖ......α#',
    '#WwwWααα........αβαθϖϖϖϖϖϖϖθ.ⓣ...ⓣα#',
    '#ααααααααααααααααβααααααααααααααααα#',
    '#################β##################',
  ],
  warps: [
    { x: 2, y: 3, to: 'house4a', tx: 5, ty: 7, dir: 'up' },
    { x: 3, y: 3, to: 'house4a', tx: 6, ty: 7, dir: 'up' },
    { x: 31, y: 4, to: 'house4b', tx: 5, ty: 7, dir: 'up' },
    { x: 17, y: 23, to: 'cave', tx: 21, ty: 1, dir: 'down' },
    { x: 13, y: 6, to: 'gym3', tx: 7, ty: 12, dir: 'up' },
    { x: 10, y: 10, to: 'center4', tx: 4, ty: 6, dir: 'up' },
    { x: 18, y: 10, to: 'shop4', tx: 4, ty: 6, dir: 'up' },
    { x: 23, y: 6, to: 'antique', tx: 4, ty: 6, dir: 'up' },
    { x: 35, y: 14, to: 'route4', tx: 1, ty: 3, dir: 'right' },
  ],
  labels: [ { x: 3, y: 1.2, text: '천문대', color: '#e0e8ff', ink: '#2a3a7a' }, { x: 31, y: 2.2, text: '트레이너 학원', color: '#e0e8ff', ink: '#2a3a7a' }, { x: 3, y: 7.2, text: '별빛 아파트', color: '#e0e8ff', ink: '#2a3a7a' }, { x: 23.5, y: 18.1, text: '별빛 광장', color: '#fff6c8', ink: '#6a5a20' },{ x: 11, y: 8.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' }, { x: 18, y: 8.1, text: '백화점', color: '#fff2c8', ink: '#8a5a10' }, { x: 13, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' }, { x: 23, y: 4.1, text: '골동품 가게', color: '#f4e8d8', ink: '#6a4a2a' }],
  signs: [{ x: 23, y: 12, text: '별빛시\n밤에도 별처럼 불빛이 반짝이는 도시  ·  별빛 체육관' }],
  npcs: [
    { id: 't4busker', x: 26, y: 20, dir: 'left', pal: PAL.man, talk: '거리 악사: ♪ 별빛 광장에 밤이 오면~ 분수에 별이 잠기네~\n…박수 좀 쳐 주겠나?' },
    { id: 't4vendor', x: 30, y: 17, dir: 'up', pal: PAL.clerk, talk: '노점 상인: 별빛시 명물, 별사탕 꼬치 있어요!\n…몬스터한테 먹이면 안 돼요. 이빨 상해요.' },
    { id: 't4jogger', x: 6, y: 13, dir: 'down', pal: PAL.swimmer, move: 'wander', talk: '아침마다 벽돌길을 따라 도시를 한 바퀴 뛰어.\n천문대 앞 언덕에서 보는 해돋이가 최고야!' },
    {
      id: 't4man', x: 22, y: 8, dir: 'down', pal: PAL.man, move: 'wander',
      talk: '오른쪽 큰 건물은 오래된 골동품 가게야.\n밤마다 가게 안에서 오르골 소리가 들린다던데… 좀 으스스하지?',
    },
    {
      id: 't4lady', x: 11, y: 15, dir: 'right', pal: PAL.lady, move: 'look',
      talk: async () => {
        if (f('bossDone')) await say('별빛동굴에서 검은안개단을 쫓아낸 게 당신이에요?\n요즘 밤하늘에 별똥별이 부쩍 많아졌대요!');
        else await say('별빛동굴 쪽이 요즘 시끄러워서 걱정이에요.');
      },
    },
    {
      id: 't4eng', x: 25, y: 13, dir: 'left', pal: PAL.engineer, move: 'look',
      talk: '별빛 체육관 관장 하람 님은 발전소 기술자 출신이야.\n전기 타입은 땅 타입 몬스터한테 기술이 통하지 않아!',
    },
    { id: 'sanji', x: 27, y: 16, dir: 'left', pal: PAL.oldman, talk: () => sanjiTalk() },
    { id: 'rival_t4', x: 17, y: 13, dir: 'down', pal: PAL.rival, hidden: () => f('rival3') },
  ],
  triggers: [
    { x: 17, y: 15, when: () => !f('rival3'), run: rival3Scene },
    { x: 34, y: 14, when: () => !f('ending'), run: pushBack(['동쪽 4번 도로 입구다.', '경비: 이 앞은 험한 길이야.\n별빛 체육관 배지를 받으면 지나가게 해 줄게.'], 'left') },
  ],
};

const center4: MapDef = makeCenter('center4', '별빛시 회복소', 'town4', 10, 11, '해솔 리그에 나가려면 배지 일곱 개가 필요하대.\n동쪽 4번 도로 너머에도 체육관이 더 있다던데?');
const antique: MapDef = {
  id: 'antique', name: '별빛시 골동품 가게', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱkkㄱㆁㄱㄱkkㄱ',
    'ㄱㅃㅃㅃㅃㅃㅃㅃㆂㄱ',
    'ㄱㅺㅺㅃㅃㅃㅺㅺㅃㄱ',
    'ㄱㅃㅃㅃㅃㅃㅃㅃㅃㄱ',
    'ㄱㅧㅃㅃㅃㅃㅃㅃㅡㄱ',
    'ㄱㅜㅃㅃㅃㅃㅃㅃㅝㄱ',
    'ㄱㄱㄱㄱeeㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 4, y: 7, to: 'town4', tx: 23, ty: 7, dir: 'down' },
    { x: 5, y: 7, to: 'town4', tx: 23, ty: 7, dir: 'down' },
  ],
  npcs: [
    { id: 'antiqueowner', x: 2, y: 2, dir: 'down', pal: PAL.granny, talk: () => antiqueOwner() },
    { id: 'musicbox', x: 7, y: 2, dir: 'down', prop: 'µ', talk: () => musicBox() },
  ],
};

const shop4 = makeShop('shop4', '별빛시 백화점', 'town4', 18, 11, '상점 물건은 배지를 모을수록 점점 좋아진대요.\n관장님께 도전하기 전에 꼭 둘러보세요!');

const gym3: MapDef = {
  id: 'gym3', name: '별빛 체육관', indoor: true,
  tiles: [
    'XXXXXXXXXXXXXXXX',
    'XPϖϖϖϖϖϖϖϖϖϖϖϖPX',
    'XϖϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'XPPPPPPPPPPPϖPPX',
    'XϖϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'X^ϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'XPPPϖPPPPPPPPPPX',
    'XϖϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'Xϖϖϖϖϖϖϖϖϖϖϖϖϖ^X',
    'XPPPPPPPPPPϖPPPX',
    'XϖϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'X^ϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'XϖϖϖϖϖϖϖϖϖϖϖϖϖϖX',
    'XXXXXXXeeXXXXXXX',
  ],
  warps: [
    { x: 7, y: 13, to: 'town4', tx: 13, ty: 7, dir: 'down' },
    { x: 8, y: 13, to: 'town4', tx: 13, ty: 7, dir: 'down' },
  ],
  triggers: [[1, 11], [14, 8], [1, 5]].map(([x, y]) => ({ x, y, run: toggleSwitch('g3') })),
  npcs: [
    { id: 'g3guide', x: 10, y: 12, dir: 'left', pal: PAL.engineer, talk: '별빛 체육관의 시험은 「전류의 흐름」이야.\n스위치를 밟을 때마다 빨간 울타리와 파란 울타리가 번갈아 켜져. 층마다 잘 바꿔 가며 올라가!' },
    {
      id: 'g3fenceA1', x: 11, y: 9, dir: 'down', barrier: 'electric', hidden: () => f('g3'), talk: '전기 울타리가 지지직거린다. 스위치로 끌 수 있을 것 같다.',
    },
    { id: 'g3fenceA2', x: 12, y: 3, dir: 'down', barrier: 'electric', hidden: () => f('g3'), talk: '전기 울타리가 지지직거린다. 스위치로 끌 수 있을 것 같다.' },
    { id: 'g3fenceB', x: 4, y: 6, dir: 'down', barrier: 'electric', hidden: () => !f('g3'), talk: '전기 울타리가 지지직거린다. 스위치로 끌 수 있을 것 같다.' },
    {
      id: 'eng1', x: 14, y: 7, dir: 'left', pal: PAL.engineer, sight: 13,
      trainer: {
        id: 'eng1', cls: '기술자', name: '건우', pal: PAL.engineer, team: [['ggangtong', 22], ['jjirit', 22], ['cheolgap', 23]], reward: 900,
        intro: '찌릿찌릿! 전압 검사 시작이다!', defeat: '퓨즈가 나갔다…', after: '기계들 사이로 길을 찾아 올라가 봐.',
      },
    },
    {
      id: 'eng2', x: 14, y: 4, dir: 'left', pal: PAL.engineer, sight: 13,
      trainer: {
        id: 'eng2', cls: '기술자', name: '미르', pal: PAL.engineer, team: [['beongae', 23], ['beonjjeok', 24]], reward: 960,
        intro: '하람 님께 가는 길은 내가 지킨다!', defeat: '합선이야…', after: '하람 님의 뇌전고슴은 정말 빨라. 각오해!',
      },
    },
    {
      id: 'haram', requires: ['eng1', 'eng2'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 7, y: 1, dir: 'down', pal: PAL.haram,
      trainer: {
        id: 'leader3', cls: '관장', name: '하람', pal: PAL.haram, team: [['jjirit', 24], ['beonjjeok', 25], ['beongae', 25], ['noejeon', 27]], reward: 2900,
        intro: '별빛 체육관에 온 걸 환영한다. 나는 관장 하람.\n이 도시의 불빛은 전부 내 몬스터들의 전기로 켜지지.\n너의 번뜩임을 보여 줘!',
        defeat: '번개보다 빠른 판단… 완벽한 패배다.',
        after: '4번 도로 너머에도 강한 관장들이 기다린다. 계속 나아가라!',
        afterWin: leader3Win,
      },
    },
  ],
};

// center4's door is at x=3, so arrivals land one tile to the right of the usual spot.
center4.warps = [
  { x: 4, y: 7, to: 'town4', tx: 10, ty: 11, dir: 'down' },
  { x: 5, y: 7, to: 'town4', tx: 10, ty: 11, dir: 'down' },
];

const peak: MapDef = {
  id: 'peak', name: '운무봉', ambience: 'mist',
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
  warps: [{ x: 9, y: 20, to: 'route3', tx: 20, ty: 1, dir: 'down' }],
  signs: [],
  encounters: {
    rate: 0.13,
    table: [['baramsae', 23, 26, 14], ['hoeori', 25, 26, 8], ['bawi', 24, 26, 12], ['heukjang', 24, 26, 12], ['dokkae', 24, 26, 10], ['jeolgu', 23, 26, 10], ['eolpeng', 24, 26, 9], ['kwontu', 24, 26, 9], ['beonjjeok', 24, 26, 8], ['nalgae', 24, 26, 4], ['monggeul', 23, 25, 4], ['seolpyo', 24, 26, 6], ['satba', 24, 26, 6], ['cheolgap', 23, 26, 5], ['olppaemi', 24, 26, 5], ['dokjeongal', 24, 26, 5], ['wangmong', 23, 25, 3]],
  },
  fishing: [['banjjak', 21, 26, 40], ['eungeo', 24, 27, 30], ['meokmul', 23, 26, 20], ['daewang', 29, 31, 10]],
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

const pastel: MapDef = {
  id: 'pastel', name: '솜사탕언덕', edge: 'g',
  tiles: [
    'gggggggggggggggggggggg',
    'g;;;;;::::ff::::;;;;;g',
    'g;;;;;::::::::::;;;;;g',
    'g::::gg::;;;;::gg::::g',
    'g::::gg::;;;;::gg::::g',
    'g::f:::::::~~:::::f::g',
    'g;;;:::::::~~::::::;;g',
    'g;;;::ff::::::::::;;;g',
    'g::::::::;;;;::::::::g',
    'g::gg::::;;;;::::gg::g',
    'g::::::::::::::::::::=',
    'g;;;;;::ff::::;;;;;;;g',
    'g;;;;;::::::::;;;;;;;g',
    'gggggggggggggggggggggg',
  ],
  warps: [{ x: 21, y: 10, to: 'town3', tx: 1, ty: 17, dir: 'right' }],
  signs: [],
  encounters: {
    rate: 0.13,
    tiles: ';',
    table: [['makarong', 10, 13, 16], ['kkotip', 10, 13, 16], ['pongduck', 10, 13, 14], ['suguk', 10, 13, 14], ['bingsu', 10, 13, 12], ['agiyuni', 11, 13, 8], ['monsil', 10, 12, 10], ['mongmong', 10, 12, 10]],
  },
  fishing: [['jelly', 10, 14, 60], ['pongduck', 10, 13, 25], ['banjjak', 10, 13, 15]],
  npcs: [
    {
      id: 'patissier', x: 6, y: 10, dir: 'right', pal: { hair: '#f8f0f0', shirt: '#ffffff', pants: '#f0b8d0', hat: '#ffffff' }, sight: 4,
      trainer: {
        id: 'patissier', cls: '파티시에', name: '달콤', pal: { hair: '#f8f0f0', shirt: '#ffffff', pants: '#f0b8d0', hat: '#ffffff' },
        team: [['makarong', 15], ['bingsu', 15]], reward: 520,
        intro: '갓 구운 마카롱처럼 달콤한 승부를 보여 줄게!', defeat: '어머, 크림이 다 녹아 버렸네…',
        after: '이 언덕의 몬스터들은 모두 파스텔빛이야. 아기유니는 정말 드물게 나타난대!',
      },
    },
    {
      id: 'pastelkid', x: 15, y: 7, dir: 'down', pal: { hair: '#c8a0e0', shirt: '#ffd8e8', pants: '#b8d8ff' }, sight: 3,
      trainer: {
        id: 'pastelkid', cls: '꼬마아가씨', name: '봄이', pal: { hair: '#c8a0e0', shirt: '#ffd8e8', pants: '#b8d8ff' },
        team: [['kkotip', 14], ['pongduck', 14], ['suguk', 15]], reward: 300,
        intro: '꽃잎새랑 퐁퐁오리랑 수국달팽이랑 놀자!', defeat: '힝, 다들 지쳐 버렸어~',
        after: '연못에서 낚시를 하면 몽글해파리가 올라온대!',
      },
    },
    { id: 'pastelcafe', x: 11, y: 3, dir: 'down', pal: { hair: '#8a5a4a', shirt: '#b8f0dc', pants: '#f0d0e0' }, move: 'look',
      talk: '여기는 솜사탕언덕이에요. 하늘도 풀도 몬스터도 모두 파스텔빛이죠.\n물안개마을에서 서쪽으로 오면 되니까 자주 놀러 오세요!' },
    { id: 'pastelpotion', x: 1, y: 1, dir: 'down', item: { id: 'superpotion', qty: 2 } },
    { id: 'pastelball', x: 20, y: 12, dir: 'down', item: { id: 'superball', qty: 2 } },
  ],
};

// ---------------------------------------------------------------------------
// 제4장 — 4번 도로 · 파도항구 · 유령선

const PAL2 = {
  sailor: { hair: '#3a2a20', shirt: '#ffffff', pants: '#2a4a8a', hat: '#ffffff' },
  ace: { hair: '#2a2a3a', shirt: '#e84a4a', pants: '#2a2a3a' },
  beauty: { hair: '#f0c040', shirt: '#f088b0', pants: '#ffffff' },
  medium: { hair: '#4a3a6a', shirt: '#6a5a8a', pants: '#3a2a4a' },
  firefighter: { hair: '#2a2a2a', shirt: '#e8c040', pants: '#5a3a2a', hat: '#e84a2a' },
  surfer: { hair: '#f0c040', shirt: '#38b0e0', pants: '#f0a030' },
  ranger: { hair: '#5a3a20', shirt: '#6aa84a', pants: '#8a6a3a', hat: '#c8a860' },
} satisfies Record<string, Pal>;

function tr(id: string, cls: string, name: string, pal: Pal, team: [string, number][], reward: number, intro: string, defeat: string, after: string, afterWin?: () => Promise<void>): TrainerDef {
  return { id, cls, name, pal, team, reward, intro, defeat, after, afterWin };
}

const route4: MapDef = {
  id: 'route4', name: '4번 도로 등대 절벽길',
  tiles: [
    '############################',
    '#.,,,,,,......,,,,,.dd~~~~~#',
    '#.,,,,,,......,,,,,.dd~~~~~#',
    '=============.......dd~~~~~#',
    '#...........=.......dd~~~~~#',
    '#.......#...=..,,,,.dd~~~~~#',
    '#...........=..,,,,.dd~~Ⅳ~~#',
    '#...........=.......dd~~~~~#',
    '#▽▽▽▽▽▽▓▓▓▓▓▤▓▓▓▓▓▓▓▓▓~~~~~#',
    '#...=========.......dd~~~~~#',
    '#...=.........,,,,..dⅠ~~~~~#',
    '#...=.,,,,,,..,,,,..dⅡ~~~~~#',
    '#...=.,,,,,,..,,,,..dⅢ~~~~~#',
    '#.#.=...............dd~~~~~#',
    '#...=...............dd~~~~~#',
    '#...=...............dd~~~~~#',
    '#▓▓▓▤▓▓▓▓▓▓▓▓▓▽▽▽▽▽▽▓▓~~~~~#',
    '#...============....dd~~~~~#',
    '#..............=....dd~~~~~#',
    '#.,,,,,,,,.....=.,,,dd~~~~~#',
    '#.,,,,,,,,.....=.,,,dd~Ⅳ~~~#',
    '#.........#....=....dd~~~~~#',
    '#..............=....dd~~~~~#',
    '#..............=....dd~~~~~#',
    '#▽▽▽▽▽▽▓▓▓▓▓▓▓▓▤▓▓▓▓▓▓~~~~~#',
    '#.............==....dd~~~~~#',
    '#.............==....dd~~~~~#',
    '#.,,,,,,,,....==....dd~~~~~#',
    '#.,,,,,,,,....==.,,,dd~~~~~#',
    '#.,,,,,,,,....==.,,,dd~~~~~#',
    '#.............==....dd~~~Ⅳ~#',
    '#.............==....dd~~~~~#',
    '#...........S.==....dd~~~~~#',
    '#.............==....dd~~~~~#',
    '#.............==....dd~~~~~#',
    '##############==############',
  ],
  warps: [
    { x: 0, y: 3, to: 'town4', tx: 34, ty: 14, dir: 'left' },
    { x: 14, y: 35, to: 'town5', tx: 18, ty: 1, dir: 'down' },
    { x: 15, y: 35, to: 'town5', tx: 18, ty: 1, dir: 'down' },
  ],
  signs: [{ x: 12, y: 32, text: '4번 도로\n북쪽: 별빛시   남쪽: 파도항구' }],
  encounters: {
    rate: 0.12,
    table: [['hoeori', 24, 26, 10], ['tongsil', 24, 26, 10], ['beonjjeok', 24, 26, 10], ['heukjang', 24, 26, 10], ['jeolgu', 24, 26, 8], ['kwontu', 23, 25, 8], ['satba', 24, 26, 8], ['seolpyo', 24, 25, 6], ['cheolgap', 24, 26, 8], ['beoseot', 24, 26, 8], ['mujigae', 24, 25, 4], ['olppaemi', 24, 26, 8], ['chorong', 23, 25, 8], ['kkakkak', 23, 25, 10]],
  },
  fishing: [['banjjak', 22, 26, 40], ['meokmul', 23, 26, 30], ['eungeo', 24, 26, 30]],
  npcs: [
    { id: 'r4ace', x: 2, y: 9, dir: 'right', pal: PAL2.ace, sight: 9, trainer: tr('r4ace', '엘리트트레이너', '태양', PAL2.ace, [['kwontu', 29], ['olppaemi', 29], ['cheolgap', 30]], 1500, '배지 셋을 모은 트레이너라고? 실력 좀 볼까!', '역시 소문대로군!', '파도항구엔 요즘 이상한 소문이 돌더라.') },
    { id: 'r4beauty', x: 13, y: 13, dir: 'left', pal: PAL2.beauty, sight: 9, trainer: tr('r4beauty', '아가씨', '보라', PAL2.beauty, [['wangmong', 29], ['monggeul', 30]], 900, '어머, 승부할래요?', '멋진 승부였어요~', '항구의 유령선 얘기 들었어요? 으으, 무서워!') },
    { id: 'r4hiker', x: 16, y: 21, dir: 'left', pal: PAL.hiker, sight: 5, trainer: tr('r4hiker', '등산가', '바위', PAL.hiker, [['geoam', 31], ['heukjang', 30]], 1100, '하하! 산사나이의 힘을 보여 주지!', '허허, 젊은 사람이 대단해!', '항구까지 조금만 더 가면 된다네.') },
    { id: 'r4hyper', x: 19, y: 2, dir: 'down', item: { id: 'hyperball', qty: 2 } },
    { id: 'lost_yuni', x: 3, y: 15, dir: 'down', mon: 'agiyuni', hidden: () => !f('safariQuest') || f('lost_yuni'), talk: () => escapeeTalk('lost_yuni', '아기유니') },
    { id: 'lost_gom', x: 13, y: 7, dir: 'down', mon: 'agigom', hidden: () => !f('safariQuest') || f('lost_gom'), talk: () => escapeeTalk('lost_gom', '아기곰돌') },
    { id: 'r4full', x: 1, y: 33, dir: 'down', item: { id: 'fullrestore', qty: 1 } },
  ],
};

const town5: MapDef = {
  id: 'town5', name: '파도항구',
  tiles: [
    '##################=########################',
    '#........ζζ..ε.ε..=ζ................ΦΦΦΦΦ.#',
    '#ΦΦΦΦΦ............=.................ΦΦΦΦΦ.#',
    '#ΦΦΦΦΦ............=.................WwDwW.#',
    '#ϜϜϝϜϜ....KKKKK...=...MMMM.....GGGG...=...#',
    '#.........KKKKK...=...MMMM.....GGGG...=...#',
    '#κ.λ.κ....WwDwW...=...WDwW.....WDwW.ΦΦΦΦ..#',
    '#...........=.....=....=........=...ΦΦΦΦ..#',
    '#μ...μ......=====================...ϜϝDϜ..#',
    '#.........BBBB....=...................α.Ⅰ.#',
    '#αααααααααBHBBαααα=ααααϘαααααααμαμααααααⅡα#',
    '#αααααααααWEwWαααα=αααααααααααααααααααααⅢα#',
    '===========================ααααααααααααααα#',
    '#ααααααααααααααααααααααααα+αααααααααααγγαα#',
    '#~~γγ~~~~~~~~~~~~♡~~~♥~~♥~+~♡~~~~~~~~~γγ~~#',
    '#~~γγ~~~~~~~~~~~♣♣♣♣♣♣♣♣♣♣+♣♣♣~~~~~~~~γγ~~#',
    '#Ⅳ~γγ~~~~~~~~~~~♠♠♠♠♠♠♠♠♠♠♢♠♠♠~~~~~~~~γγ~~#',
    '#~~γγ~~~~~~~~~~♤♦♦♦♦♦♦♦♦♦♦♦♦♦♦♧~~~~~~~γγ~Ⅳ#',
    '#~~γγⅣ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~γγ~~#',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Ⅳ~γγ~~#',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
  ],
  warps: [
    { x: 38, y: 8, to: 'house5a', tx: 5, ty: 7, dir: 'up' },
    { x: 38, y: 3, to: 'house5b', tx: 5, ty: 7, dir: 'up' },
    { x: 18, y: 0, to: 'route4', tx: 14, ty: 34, dir: 'up' },
    { x: 12, y: 6, to: 'gym4', tx: 6, ty: 11, dir: 'up' },
    { x: 23, y: 6, to: 'shop5', tx: 4, ty: 6, dir: 'up' },
    { x: 11, y: 11, to: 'center5', tx: 4, ty: 6, dir: 'up' },
    { x: 26, y: 16, to: 'ship', tx: 2, ty: 11, dir: 'right' },
    { x: 0, y: 12, to: 'route5', tx: 28, ty: 3, dir: 'left' },
    { x: 32, y: 6, to: 'safarigate', tx: 4, ty: 6, dir: 'up' },
  ],
  labels: [ { x: 38, y: 6.2, text: '등대지기의 집', color: '#e0f0ff', ink: '#2a4a7a' }, { x: 38.5, y: 1.2, text: '파도 식당', color: '#e0f0ff', ink: '#2a4a7a' }, { x: 3, y: 2.2, text: '창고', color: '#f0e8d8', ink: '#6a4a2a' }, { x: 3, y: 5.3, text: '수산시장', color: '#fff2c8', ink: '#8a5a10' },
    { x: 12, y: 9.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' },
    { x: 24, y: 4.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' },
    { x: 33, y: 4.1, text: '사파리', color: '#e0f8d0', ink: '#2a6a2a' },
    { x: 12.5, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' },
    { x: 23, y: 12.9, text: '유령선 은파호', color: '#d8d0f8', ink: '#3a2a6a' },
  ],
  signs: [],
  fishing: [['meokmul', 24, 27, 40], ['munu', 22, 26, 20], ['eungeo', 24, 27, 25], ['daewang', 29, 30, 5], ['jelly', 24, 26, 10], ['mulgwi', 22, 25, 14]],
  npcs: [
    { id: 't5fishmonger', x: 2, y: 7, dir: 'down', pal: PAL.hiker, talk: '생선 장수: 싱싱한 은빛잉어 있어요! 오늘 새벽에 잡은 거라고요!\n…아, 몬스터는 팔지 않아요. 진짜 생선이에요.' },
    { id: 't5angler', x: 4, y: 18, dir: 'down', pal: PAL.fisher, talk: '부두 끝에서 낚싯대를 드리우면 먹물이가 잘 물어.\n먹물을 뒤집어쓰는 건 각오해야 하지만!' },
    { id: 't5keeperkid', x: 39, y: 15, dir: 'up', pal: PAL.kid, move: 'look', talk: '등대 불빛은 밤마다 바다 끝까지 닿는대!\n나도 커서 등대지기가 될 거야.' },
    { id: 't5shipwright', x: 29, y: 13, dir: 'left', pal: PAL.oldman, talk: () => shipwright() },
    { id: 't5sailor', x: 20, y: 5, dir: 'left', pal: PAL2.sailor, talk: '뱃사람: 유령선은 남쪽 부두 끝에 있다네.\n파란 도깨비불이 둥둥 떠다니니 조심하게!' },
    { id: 't5old', x: 27, y: 9, dir: 'down', pal: PAL.oldman, move: 'look', talk: '이 항구에서 서쪽 해변길을 따라 남쪽으로 가면 불꽃마을이 나온다네.\n뜨끈한 온천이 아주 좋지!' },
    { id: 't5kid', x: 15, y: 13, dir: 'right', pal: PAL.kid, move: 'wander', talk: '아빠가 그러는데, 바다 깊은 곳엔 배만 한 대왕문어가 산대!' },
    { id: 't5safarifan', x: 30, y: 9, dir: 'down', pal: PAL.girl, move: 'look', talk: async () => {
      if (f('safariOpen')) await say('사파리에는 꼬마룡이나 무지개유니 같은 귀한 몬스터도 산대!\n연못에서 낚시를 하면 신기한 게 걸린다던데?');
      else await say('저기 초록 지붕이 팜팜 사파리 입구야.\n그런데 요즘 문을 닫았대. 무슨 일이 있나 봐.');
    } },
    { id: 't5windtamer', x: 28, y: 9, dir: 'down', pal: PAL2.surfer, move: 'look', talk: () => windTamerTalk() },
    { id: 'lost_mong', x: 34, y: 12, dir: 'down', mon: 'mongmong', hidden: () => !f('safariQuest') || f('lost_mong'), talk: () => escapeeTalk('lost_mong', '몽몽이') },
  ],
  triggers: [
    { x: 18, y: 5, when: () => !f('portIntro'), run: port1Scene },
    { x: 1, y: 12, when: () => !f('badge4'), run: pushBack(['경비: 미안하지만 서쪽 해변길은 파도가 거세서 막아 두었어.', '체육관 관장 달님 님께 인정받으면 지나갈 수 있단다!'], 'right') },
  ],
};

const center5 = makeCenter('center5', '파도항구 회복소', 'town5', 11, 12, '바다 몬스터는 전기 기술에 약한 경우가 많아.\n고스트 타입에는 악 타입 기술이 잘 통하고!');
const shop5 = makeShop('shop5', '파도항구 상점', 'town5', 23, 7, '뱃사람들은 늘 회복약을 넉넉히 챙긴대요.');

const safarigate: MapDef = {
  id: 'safarigate', name: '팜팜 사파리 입구', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱㆁㄱooooㄱㅾㄱ',
    'ㄱoㅦㅦㅦㅦㅦㅦoㄱ',
    'ㄱooooooooㄱ',
    'ㄱㅨooooooㅨㄱ',
    'ㄱooooooooㄱ',
    'ㄱㅙooooooㅙㄱ',
    'ㄱㄱㄱㄱeeㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 4, y: 7, to: 'town5', tx: 32, ty: 7, dir: 'down' },
    { x: 5, y: 7, to: 'town5', tx: 32, ty: 7, dir: 'down' },
  ],
  npcs: [
    { id: 'keeper', x: 4, y: 1, dir: 'down', pal: PAL2.ranger, talk: () => keeperTalk() },
    { id: 'sgvisitor', x: 7, y: 5, dir: 'left', pal: PAL.hiker, move: 'wander', talk: '사파리 안에서는 내 몬스터로 싸울 수 없어.\n대신 진흙을 던지면 몬스터가 잡히기 쉬워지지!' },
  ],
};

/** 팜팜 사파리 광장: 여섯 존과 전설의 초원으로 이어지는 중앙 광장. */
const safari: MapDef = {
  id: 'safari', name: '팜팜 사파리 광장', safari: true,
  tiles: [
    '########=######=######=########',
    '#.......=......=......=.......#',
    '#...#...=.##...=...##.=...#...#',
    '#.......=......=......=.......#',
    '#.......=......=......=.......#',
    '===============================',
    '#..............=..............#',
    '#..............=..............#',
    '#..fff......=======......fff..#',
    '#..~~~~.....=======.....~~~~..#',
    '#..~~~~.....=======.S...~~~~..#',
    '#..~~~~.....=======.....~~~~..#',
    '#..............=..............#',
    '#..............=..............#',
    '===============================',
    '#..............=..............#',
    '#..............=..............#',
    '#...ff....#....=....#....ff...#',
    '#..............=..............#',
    '###############=###############',
  ],
  warps: [
    { x: 0, y: 5, to: 'safari_fire', tx: 22, ty: 8, dir: 'left' },
    { x: 0, y: 14, to: 'safari_canyon', tx: 22, ty: 8, dir: 'left' },
    { x: 8, y: 0, to: 'safari_fairy', tx: 12, ty: 14, dir: 'up' },
    { x: 15, y: 0, to: 'safari_special', tx: 12, ty: 14, dir: 'up' },
    { x: 22, y: 0, to: 'safari_ice', tx: 12, ty: 14, dir: 'up' },
    { x: 30, y: 5, to: 'safari_water', tx: 1, ty: 8, dir: 'right' },
    { x: 30, y: 14, to: 'safari_jungle', tx: 1, ty: 8, dir: 'right' },
  ],
  labels: [
    { x: 2.5, y: 4.1, text: '화산지대', color: '#ffd8c8', ink: '#8a2a10' },
    { x: 2.5, y: 13.1, text: '번개 협곡', color: '#fff2b0', ink: '#6a5a10' },
    { x: 8, y: 1.1, text: '꿈빛 숲', color: '#f8d8ff', ink: '#6a3a8a' },
    { x: 15, y: 1.1, text: '전설의 초원', color: '#fff0a0', ink: '#7a5a00' },
    { x: 22, y: 1.1, text: '하얀 설원', color: '#e0f4ff', ink: '#2a5a8a' },
    { x: 28.5, y: 4.1, text: '푸른 호수', color: '#d0f0ff', ink: '#1a5a8a' },
    { x: 28.5, y: 13.1, text: '깊은 밀림', color: '#d8f4c8', ink: '#2a6a2a' },
  ],
  signs: [{ x: 20, y: 10, text: '팜팜 사파리 광장\n서: 화산지대·번개 협곡   동: 푸른 호수·깊은 밀림\n북: 꿈빛 숲·전설의 초원·하얀 설원   남: 출구' }],
  npcs: [
    { id: 'safguide', x: 13, y: 9, dir: 'down', pal: PAL2.ranger, talk: async () => {
      await say('사파리 가이드: 존마다 사는 몬스터가 달라요! 원하는 타입이 있는 존으로 가 보세요.\n몬스터 레벨은 배지 수에 맞춰져요.');
      if (await yesNo('사파리 가이드: 동료들을 쉬게 해 줄까요? (시간은 계속 흘러가요)')) await healParty();
    } },
  ],
  triggers: [
    { x: 15, y: 19, run: safariExitTile },
    { x: 15, y: 1, run: specialGate },
  ],
};

const safari_fire: MapDef = {
  id: 'safari_fire', name: '사파리 — 화산지대', safari: true,
  tiles: [
    'CCCCCCCCCCCCCCCCCCCCCCCC',
    'C____1______________1__C',
    'C__11111_1________11111C',
    'C_1111111111_____111111C',
    'C__1C11CC1________11111C',
    'C____1C1111__L______1__C',
    'C_____1_1___LLLL_______C',
    'C___1111L__11L11_1_C___C',
    'C__1__L_LLL111111CCC___=',
    'C11111__LCC1111111LC___C',
    'C111111_CCCCC1L1LLL_L__C',
    'C11111____C__111L1L1___C',
    'C111111_______11111____C',
    'C11111__________1______C',
    'C__1___________________C',
    'CCCCCCCCCCCCCCCCCCCCCCCC',
  ],
  warps: [{ x: 23, y: 8, to: 'safari', tx: 1, ty: 5, dir: 'right' }],
  encounters: { rate: 0.14, tiles: '1', table: [['gungo', 1, 1, 20], ['jinheuk', 1, 1, 18], ['ggorichim', 1, 1, 14], ['jangjak', 1, 1, 8], ['heukjang', 1, 1, 8], ['dokjeongal', 1, 1, 6], ['modak', 1, 1, 4], ['hwaro', 1, 1, 2], ['sutdol', 1, 1, 10], ['chorong', 1, 1, 8]] },
  npcs: [
    { id: 'safari_fire_item0', x: 1, y: 1, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
  ],
};

const safari_canyon: MapDef = {
  id: 'safari_canyon', name: '사파리 — 번개 협곡', safari: true,
  tiles: [
    'CCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCddddddddd4dddddddddC',
    'CCCCCCdddddz44444dd4dddC',
    'CCCCCCdddzzzzz444444z4dC',
    'CCCCCCdzd4dz44444z4zzzzC',
    'CddCdzzzzz44444zzCzzz4dC',
    'Cddddd4z444444zzzCzzz4dC',
    'Cdddddd44444dd4zzzzz4ddC',
    'Cdddddd4d4ddCCCCCz44ddd=',
    'Cdddd44444dddCCdd4444ddC',
    'Cddd4444444CCCCC444444dC',
    'Cdd4444444CCCCCCC44444dC',
    'Cd4444444ddCCCCC4444dddC',
    'Cdd44444dddddd44444ddddC',
    'Cdddd4dddddddddd4ddddddC',
    'CCCCCCCCCCCCCCCCCCCCCCCC',
  ],
  warps: [{ x: 23, y: 8, to: 'safari', tx: 1, ty: 14, dir: 'right' }],
  encounters: { rate: 0.14, tiles: '4', table: [['jjirit', 1, 1, 18], ['ddakkum', 1, 1, 18], ['ggangtong', 1, 1, 16], ['doldol', 1, 1, 16], ['cheolgap', 1, 1, 8], ['bawi', 1, 1, 8], ['beonjjeok', 1, 1, 6], ['beongae', 1, 1, 3], ['geosin', 1, 1, 1], ['dujji', 1, 1, 10], ['kkakkak', 1, 1, 8]] },
  npcs: [
    { id: 'safari_canyon_item0', x: 1, y: 14, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
  ],
};

const safari_fairy: MapDef = {
  id: 'safari_fairy', name: '사파리 — 꿈빛 숲', safari: true,
  tiles: [
    'gggggggggggggggggggggggg',
    'g::::::::;~ggggggg:::::g',
    'g:::;:f;~~g~~ggggggg:::g',
    'g:;;;;;~~~~~~~ggggggg::g',
    'g;;;;;;;;~~~~;;ggg:g:::g',
    'g:;;;;;::;~;;;;;;g:::::g',
    'g:::;::;;;;;;;;;::::ff:g',
    'g:;;;;;;;;;;;;ggggg::::g',
    'g;;;;;g;;;;;;;::::;::::g',
    'g:;;ggggg;;;;;;:;;;;;::g',
    'g:::;:g:;;;;;;;;;;;~;;:g',
    'g:f:::::::;;;g~~~~~;;~:g',
    'g::::::::::::ggg;:;~:::g',
    'g:::::::::::::;:f::::::g',
    'g::::::::::::::::::::::g',
    'gggggggggggg=ggggggggggg',
  ],
  warps: [{ x: 12, y: 15, to: 'safari', tx: 8, ty: 1, dir: 'down' }],
  encounters: { rate: 0.14, tiles: ';', table: [['monsil', 1, 1, 18], ['mongmong', 1, 1, 18], ['dalto', 1, 1, 16], ['makarong', 1, 1, 14], ['bueong', 1, 1, 12], ['agiyuni', 1, 1, 8], ['jeolgu', 1, 1, 6], ['mujigae', 1, 1, 3], ['monggeul', 1, 1, 3], ['kkoribyeol', 1, 1, 8], ['bandi', 1, 1, 8]] },
  fishing: [['banjjak', 1, 1, 30], ['munu', 1, 1, 25], ['eungeo', 1, 1, 15], ['jelly', 1, 1, 15], ['daewang', 1, 1, 6], ['hyeonmuk', 1, 1, 4], ['aurora', 1, 1, 5]],
  npcs: [
    { id: 'safari_fairy_item0', x: 1, y: 1, dir: 'down', item: { id: 'safariticket', qty: 1 } },
  ],
};

const safari_special: MapDef = {
  id: 'safari_special', name: '사파리 — 전설의 초원', safari: true,
  tiles: [
    '########################',
    '#.......5...........5..#',
    '#..5..555555......55555#',
    '#5555555555555...555555#',
    '#55555555555555...55555#',
    '#55555555555#5....~~~~~#',
    '#..55~~~~~####....f.~..#',
    '#.5555####55#..........#',
    '#...#.#####555#........#',
    '#...555##~555####...5..#',
    '#.....5~~~~~..#...55555#',
    '#.....~~~~#~~5555555555#',
    '#...~~~~~~~~.5555555555#',
    '#....~f..~....555...5..#',
    '#......................#',
    '############=###########',
  ],
  warps: [{ x: 12, y: 15, to: 'safari', tx: 15, ty: 1, dir: 'down' }],
  encounters: { rate: 0.14, tiles: '5', table: [['kkomaryong', 1, 1, 14], ['agiyuni', 1, 1, 12], ['kkaeng', 1, 1, 10], ['kkwae', 1, 1, 10], ['dokbul', 1, 1, 10], ['mujigae', 1, 1, 8], ['nalgae', 1, 1, 6], ['seolpyo', 1, 1, 6], ['bingsan', 1, 1, 5], ['olppaemi', 1, 1, 5], ['wangmong', 1, 1, 5], ['cheonryong', 1, 1, 2], ['kkoribyeol', 1, 1, 6], ['kkomadorong', 1, 1, 5], ['geumdukeop', 1, 1, 2]] },
  fishing: [['banjjak', 1, 1, 30], ['munu', 1, 1, 25], ['eungeo', 1, 1, 15], ['jelly', 1, 1, 15], ['daewang', 1, 1, 6], ['hyeonmuk', 1, 1, 4], ['aurora', 1, 1, 5]],
  npcs: [
    { id: 'safari_special_item0', x: 1, y: 1, dir: 'down', item: { id: 'hyperball', qty: 1 } },
    { id: 'safari_special_item1', x: 1, y: 2, dir: 'down', item: { id: 'fullrestore', qty: 1 } },
    { id: 'safari_special_item2', x: 2, y: 1, dir: 'down', item: { id: 'safariticket', qty: 1 } },
  ],
};

const safari_ice: MapDef = {
  id: 'safari_ice', name: '사파리 — 하얀 설원', safari: true,
  tiles: [
    'hhhhhhhhhhhhhhhhhhhhhhhh',
    'h```j`j````````````````h',
    'h`jjjjjjjj`````````````h',
    'hjjjjjjjjjjj```````````h',
    'h`jjjjjjjj``h`j````````h',
    'h``hj`j```hhhhhjjh`````h',
    'hhhhhh`````jhjjhhhhh```h',
    'h``hj```````jjjjjhh````h',
    'hjjjjjh``````jjjhhhhh``h',
    'hjjjjhhhh```jjjjjjhjj``h',
    'h`jjjjh`j``h`jjjjjjjjj`h',
    'h```j`jjjhhhhh`jjjjjj``h',
    'h```````j``h```jjjjjjj`h',
    'h```````````````jjjjj``h',
    'h`````````````````j````h',
    'hhhhhhhhhhhh=hhhhhhhhhhh',
  ],
  warps: [{ x: 12, y: 15, to: 'safari', tx: 22, ty: 1, dir: 'down' }],
  encounters: { rate: 0.14, tiles: 'j', table: [['agipeng', 1, 1, 22], ['nunnyang', 1, 1, 20], ['bingsu', 1, 1, 18], ['agibuk', 1, 1, 14], ['eolpeng', 1, 1, 8], ['seolpyo', 1, 1, 4], ['wangbingsu', 1, 1, 4], ['dotori', 1, 1, 8]] },
  npcs: [
    { id: 'safari_ice_item0', x: 1, y: 1, dir: 'down', item: { id: 'hyperball', qty: 1 } },
  ],
};

const safari_water: MapDef = {
  id: 'safari_water', name: '사파리 — 푸른 호수', safari: true,
  tiles: [
    '########################',
    '#dddddddddddd2ddddddddd#',
    '#dd2ddddddd22222ddddddd#',
    '#22222~ddd2222222ddd2dd#',
    '#dd2~~~~d2d22222dd22222#',
    '#ddddd~22222d2ddd222222#',
    '#ddd222222222d~d2222222#',
    '#dd222222222~~#~~22222d#',
    '=ddd~~~~~2d~#~~~ddd2ddd#',
    '#ddddd~2d22~~~~~~ddd~dd#',
    '#dd2d222222~~~~~dd~~~~~#',
    '#222222222dd~~~~~ddd~dd#',
    '#222222222dddd~dddddddd#',
    '#22222222dddddddddddddd#',
    '#dd2dd2dddddddddddddddd#',
    '########################',
  ],
  warps: [{ x: 0, y: 8, to: 'safari', tx: 29, ty: 5, dir: 'left' }],
  encounters: { rate: 0.14, tiles: '2', table: [['pongduck', 1, 1, 20], ['munu', 1, 1, 18], ['jelly', 1, 1, 14], ['banjjak', 1, 1, 14], ['ubiduck', 1, 1, 8], ['meokmul', 1, 1, 8], ['pong', 1, 1, 4], ['aurora', 1, 1, 3], ['dukeop', 1, 1, 8], ['mulgwi', 1, 1, 6]] },
  fishing: [['banjjak', 1, 1, 30], ['munu', 1, 1, 25], ['eungeo', 1, 1, 15], ['jelly', 1, 1, 15], ['daewang', 1, 1, 6], ['hyeonmuk', 1, 1, 4], ['aurora', 1, 1, 5]],
  npcs: [
    { id: 'safari_water_item0', x: 22, y: 1, dir: 'down', item: { id: 'hyperball', qty: 1 } },
  ],
};

const safari_jungle: MapDef = {
  id: 'safari_jungle', name: '사파리 — 깊은 밀림', safari: true,
  tiles: [
    '########################',
    '#..............3.......#',
    '#..........#.33333.3...#',
    '#......3.#####33333333.#',
    '#....#33333#333333.3f..#',
    '#..#####33333333.......#',
    '#.#######33333..3..3...#',
    '#..######..3..33333333.#',
    '=..f.######....33..3...#',
    '#....#######.33333.3...#',
    '#..33########..3.33333.#',
    '#.33333##.#####33333333#',
    '#..33333..#####3333333.#',
    '#....3......#..33333...#',
    '#................3.....#',
    '########################',
  ],
  warps: [{ x: 0, y: 8, to: 'safari', tx: 29, ty: 14, dir: 'left' }],
  encounters: { rate: 0.14, tiles: '3', table: [['kkotip', 1, 1, 18], ['suguk', 1, 1, 16], ['pojani', 1, 1, 16], ['kkomul', 1, 1, 14], ['soejip', 1, 1, 10], ['beoseot', 1, 1, 8], ['naphul', 1, 1, 6], ['saesun', 1, 1, 4], ['beotkkot', 1, 1, 3], ['jipgesasum', 1, 1, 10], ['jangsu', 1, 1, 2], ['geomi', 1, 1, 8], ['bungbung', 1, 1, 8]] },
  npcs: [
    { id: 'safari_jungle_item0', x: 22, y: 1, dir: 'down', item: { id: 'fullrestore', qty: 1 } },
  ],
};

// 유람선 은파호 — 갑판 (안개가 짙고, 전기가 들어오면 밝아진다)
const ship: MapDef = {
  id: 'ship', name: '은파호 — 갑판', dark: () => !f('ship_power') && !f('shipDone'),
  tiles: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~8888888888888888888888888888~',
    '~866{{6666666666666666{{66668~',
    '~8666666666666666666666666668~',
    '~86666666677777D7777766666668~',
    '~86666}}667777777777766666668~',
    '~86666}}667777777777766666668~',
    '~8666666667777777777766666668~',
    '~86666666677D77777D7766666668~',
    '~866666666666666666666667D768~',
    '~8666666666666666666666677768~',
    '~6666666666666666666666677768~',
    '~8666666666666666666666666668~',
    '~866{{6666666666666666{{66668~',
    '~8888888888888888888888888888~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  warps: [
    { x: 12, y: 8, to: 'ship_cabins', tx: 1, ty: 6, dir: 'right' },
    { x: 18, y: 8, to: 'ship_ballroom', tx: 8, ty: 11, dir: 'up' },
    { x: 15, y: 4, to: 'ship_bridge', tx: 6, ty: 7, dir: 'up' },
    { x: 25, y: 9, to: 'ship_engine', tx: 8, ty: 10, dir: 'up' },
  ],
  labels: [{ x: 15.5, y: 6.3, text: '은파호', color: '#f4e8c0', ink: '#6a4a10' }],
  encounters: { rate: 0.07, tiles: '6', table: [['chorong', 24, 26, 18], ['cheongsa', 25, 27, 4], ['mulgwi', 24, 26, 16], ['haegol', 24, 26, 16], ['dokbul', 24, 26, 16], ['dokkae', 25, 27, 6], ['bomulgoe', 26, 27, 2]] },
  npcs: [
    { id: 'shiplock_bridge', x: 15, y: 4, dir: 'down', prop: '"', hidden: () => (f('ship_watch') && f('ship_power')) || f('shipDone'), talk: () => lockedBridge() },
    { id: 'shiplock_engine', x: 25, y: 9, dir: 'down', prop: '"', hidden: () => f('ship_key') || f('shipDone'), talk: () => lockedEngine() },
    grunt('sgrunt1', 9, 10, 'right', 4, [['chorong', 28], ['meokmul', 29]], '도깨비불이 무섭지 않냐? 흐흐흐…', '으악, 진짜 유령보다 무서운 녀석이다!', '유령선은 우리가 꾸며 낸 거였어… 그런데 가끔 진짜 소리가 나.'),
    { id: 'sghost1', x: 4, y: 9, dir: 'down', mon: 'dokbul', move: 'wander', hidden: () => f('shipDone'), talk: '도깨비불이 슬픈 눈으로 흔들리고 있다…\n누군가를 기다리는 것 같다.' },
    { id: 'sghost2', x: 21, y: 11, dir: 'down', mon: 'dokbul', move: 'wander', hidden: () => f('shipDone'), talk: '도깨비불이 억지로 불을 피우고 있다…' },
    { id: 'deckitem', x: 26, y: 3, dir: 'down', item: { id: 'superpotion', qty: 2 } },
  ],
  triggers: [
    { x: 1, y: 11, run: shipExitCheck },
    { x: 3, y: 11, when: () => !f('ship_intro'), run: boardShip },
  ],
};

const ship_cabins: MapDef = {
  id: 'ship_cabins', name: '은파호 — 선실 복도', indoor: true, dark: () => !f('ship_power') && !f('shipDone'),
  tiles: [
    '77777777777777777777777777',
    '7øøøøb7øøøøb7øøøøb7øøøøb77',
    '7øøøøø7øøøøø7øøøøø7øøøøø77',
    '7øøøøø7øøøøø7øøøøø7øøøøø77',
    '7øøøøø7øøøøø7øøøøø7øøøøø77',
    '77797777797777797777797777',
    'e9999999999999999999999997',
    '79999999999999999999999997',
    '77777777777777777777777777',
  ],
  warps: [{ x: 0, y: 6, to: 'ship', tx: 12, ty: 9, dir: 'down' }],
  encounters: { rate: 0.07, tiles: '9', table: [['chorong', 24, 26, 18], ['cheongsa', 25, 27, 4], ['mulgwi', 24, 26, 16], ['haegol', 24, 26, 16], ['dokbul', 24, 26, 16], ['dokkae', 25, 27, 6], ['bomulgoe', 26, 27, 2]] },
  npcs: [
    { id: 'shipshadestone', x: 9, y: 2, dir: 'down', item: { id: 'shadestone', qty: 1 } },
    { id: 'shiplog1', x: 2, y: 1, dir: 'down', prop: '(', talk: () => logPage1() },
    grunt('sgrunt2', 9, 2, 'down', 2, [['yeongi', 30], ['dodug', 30]], '여기서 한 발짝도 못 지나간다!', '크윽…', '간부님은 조종실을 차지하고 계셔. 문은 잠겨 있지만.'),
    { id: 'sdalnim', x: 15, y: 2, dir: 'down', pal: PAL.dalnim, hidden: () => f('shipDone'), talk: () => dalnimCabin() },
    grunt('sgrunt3', 21, 3, 'up', 1, [['dokkae', 30], ['kkwae', 30], ['meokmul', 30]], '그 옷장엔 손대지 마! 열쇠가… 아, 아니 아무것도 없어!', '열쇠를 지키라고 했는데…', '…'),
    { id: 'swardrobe', x: 22, y: 1, dir: 'down', prop: ']', requires: ['sgrunt3'], waitText: '옷장 앞을 검은안개단이 지키고 있다.', talk: () => wardrobe() },
    { id: 'sportrait', x: 12, y: 8, dir: 'up', prop: '|', talk: () => portraitTalk() },
    { id: 'cabinitem', x: 5, y: 4, dir: 'down', item: { id: 'revive', qty: 1 } },
  ],
};

const ship_ballroom: MapDef = {
  id: 'ship_ballroom', name: '은파호 — 연회장', indoor: true, dark: () => !f('ship_power') && !f('shipDone') && !f('ship_watch'),
  tiles: [
    '777777777777777777',
    '7TøøøøøøøøøøøøøøT7',
    '7øøøøøøøøøøøøøøøø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øø999999999999øø7',
    '7øøøøTøøøøøøTøøøø7',
    '7TøøøøøøøøøøøøøøT7',
    '77777777ee77777777',
  ],
  warps: [
    { x: 8, y: 12, to: 'ship', tx: 18, ty: 9, dir: 'down' },
    { x: 9, y: 12, to: 'ship', tx: 18, ty: 9, dir: 'down' },
  ],
  encounters: { rate: 0.07, tiles: '9', table: [['chorong', 24, 26, 18], ['cheongsa', 25, 27, 4], ['mulgwi', 24, 26, 16], ['haegol', 24, 26, 16], ['dokbul', 24, 26, 16], ['dokkae', 25, 27, 6], ['bomulgoe', 26, 27, 2]] },
  npcs: [
    { id: 'spiano', x: 9, y: 2, dir: 'down', prop: '[', talk: () => pianoTalk() },
    { id: 'candle_star', x: 2, y: 5, dir: 'down', prop: candleProp('별'), talk: () => candleTalk('별') },
    { id: 'candle_sun', x: 15, y: 5, dir: 'down', prop: candleProp('해'), talk: () => candleTalk('해') },
    { id: 'candle_wave', x: 2, y: 9, dir: 'down', prop: candleProp('파도'), talk: () => candleTalk('파도') },
    { id: 'candle_moon', x: 15, y: 9, dir: 'down', prop: candleProp('달'), talk: () => candleTalk('달') },
    grunt('sgrunt4', 12, 6, 'left', 3, [['haegol', 30], ['dodug', 31]], '연회장은 우리 구역이다! 촛불은 건드리지 마라!', '촛불… 켜면 안 된다니까…', '촛불을 아무렇게나 켜면 바람이 불어서 다 꺼져. 무섭다고!'),
    { id: 'sghost3', x: 6, y: 4, dir: 'down', mon: 'dokbul', move: 'wander', hidden: () => f('shipDone'), talk: '도깨비불이 피아노 주위를 빙글빙글 돈다…' },
  ],
};

const ship_engine: MapDef = {
  id: 'ship_engine', name: '은파호 — 기관실', indoor: true, dark: () => !f('ship_power') && !f('shipDone'),
  tiles: [
    '------------------',
    '-0000000000000000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '-00000--000--0000-',
    '-0000000000000000-',
    '-0000000000000000-',
    '--------ee--------',
  ],
  warps: [
    { x: 8, y: 11, to: 'ship', tx: 25, ty: 8, dir: 'down' },
    { x: 9, y: 11, to: 'ship', tx: 25, ty: 8, dir: 'down' },
  ],
  encounters: { rate: 0.07, tiles: '0', table: [['chorong', 24, 26, 18], ['cheongsa', 25, 27, 4], ['mulgwi', 24, 26, 16], ['haegol', 24, 26, 16], ['dokbul', 24, 26, 16], ['dokkae', 25, 27, 6], ['bomulgoe', 26, 27, 2]] },
  npcs: [
    { id: 'sgenerator', x: 9, y: 2, dir: 'down', prop: ')', talk: () => generatorTalk() },
    ...[0, 1, 2, 3].map((i) => ({ id: 'svalve' + i, x: 3 + i * 4, y: 5, dir: 'down' as Dir, prop: '!', talk: () => valveTalk(i) })),
    grunt('sgrunt5', 14, 8, 'left', 4, [['ggangtong', 30], ['cheolgap', 31]], '전기를 켜면 안 돼! 어둠 속이어야 유령 연출이 된다고!', '불이… 켜져 버리겠어…', '밸브 하나를 돌리면 옆 배관도 같이 돌아가. 복잡하다고!'),
    { id: 'engineitem', x: 1, y: 1, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
  ],
};

const ship_bridge: MapDef = {
  id: 'ship_bridge', name: '은파호 — 조종실', indoor: true,
  tiles: [
    '77777777777D77',
    '7T6666666666T7',
    '76666666666667',
    '76666666666667',
    '76666666666667',
    '76666666666667',
    '76666666666667',
    '76666666666667',
    '777777ee777777',
  ],
  warps: [
    { x: 6, y: 8, to: 'ship', tx: 15, ty: 3, dir: 'down' },
    { x: 7, y: 8, to: 'ship', tx: 15, ty: 3, dir: 'down' },
    { x: 11, y: 0, to: 'ship_ghost', tx: 5, ty: 8, dir: 'up' },
  ],
  npcs: [
    { id: 'swheel', x: 7, y: 2, dir: 'down', prop: '@', talk: () => wheelTalk() },
    { id: 'shiplock_ghost', x: 11, y: 0, dir: 'down', prop: '"', hidden: () => f('ship_wheel') || f('shipDone'), talk: '벽에 문 모양의 이음매가 보인다. 하지만 열리지 않는다.' },
    grunt('sgrunt6', 3, 4, 'right', 3, [['dokkae', 31], ['dokjeongal', 31]], '간부님께 가려면 나부터 쓰러뜨려라!', '간부님, 죄송합니다…', '키를 돌리면… 배가 울어. 진짜라고.'),
    {
      id: 'sadmin', x: 7, y: 4, dir: 'down', pal: PAL.admin, sight: 2, hidden: () => f('ship_admin') || f('shipDone'),
      requires: ['sgrunt1', 'sgrunt2', 'sgrunt3', 'sgrunt4', 'sgrunt5', 'sgrunt6'],
      waitText: '잿빛: 흥, 배 곳곳의 부하들도 못 넘은 주제에.\n그 녀석들부터 이기고 오면 상대해 주지.',
      trainer: tr('admin3', '검은안개단 간부', '잿빛', PAL.admin, [['yeongi', 32], ['meokmul', 32], ['geosin', 33]], 2500,
        '또 너냐…! 전기까지 켜고 여기까지 오다니. 이번 유령선 작전만큼은 방해하게 두지 않겠다!', '세 번째… 이젠 할 말도 없군.', '…', shipAdminWinV2),
    },
  ],
};

const ship_ghost: MapDef = {
  id: 'ship_ghost', name: '은파호 — 선장실', indoor: true, dark: true,
  tiles: [
    'ZZZZZZZZZZZZ',
    'ZT99999999TZ',
    'Z9999999999Z',
    'Z9999999999Z',
    'Z9999999999Z',
    'Z9999999999Z',
    'Z9999999999Z',
    'Z9999999999Z',
    'ZT99999999TZ',
    'ZZZZZeeZZZZZ',
  ],
  warps: [
    { x: 5, y: 9, to: 'ship_bridge', tx: 11, ty: 1, dir: 'down' },
    { x: 6, y: 9, to: 'ship_bridge', tx: 11, ty: 1, dir: 'down' },
  ],
  npcs: [
    { id: 'scaptain', x: 5, y: 2, dir: 'down', pal: PAL.captain, ghost: true, hidden: () => f('shipDone'), talk: () => captainTalk() },
    { id: 'scaptaindesk', x: 8, y: 2, dir: 'down', prop: '(', talk: '선장의 책상이다. 항해일지의 마지막 장이 비어 있다.' },
    { id: 'sghost4', x: 3, y: 4, dir: 'down', mon: 'dokbul', hidden: () => f('shipDone'), talk: '도깨비불이 선장 곁을 떠나지 않으려 한다…' },
    { id: 'sghost5', x: 8, y: 5, dir: 'down', mon: 'dokbul', hidden: () => f('shipDone'), talk: '도깨비불이 조용히 깜빡인다.' },
    { id: 'shipitem', x: 10, y: 7, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
  ],
};

const gym4: MapDef = {
  id: 'gym4', name: '파도 체육관', indoor: true, dark: true,
  tiles: [
    'XXXXXXXXXXXXXX',
    'XooooooooooooX',
    'XooooooooooooX',
    'Xo*ooooooooooX',
    'XXXXXXXXXXXXXX',
    'XoooooXooooooX',
    'Xo*oooXoooo*oX',
    'Xooo*oXo*ooooX',
    'XXXXXXXXXXXXXX',
    'XooooooooooooX',
    'Xo*ooooooo*ooX',
    'XooooooooooooX',
    'XXXXXXeeXXXXXX',
  ],
  warps: [
    { x: 6, y: 12, to: 'town5', tx: 12, ty: 7, dir: 'down' },
    { x: 7, y: 12, to: 'town5', tx: 12, ty: 7, dir: 'down' },
    { x: 2, y: 3, to: 'gym4', tx: 6, ty: 10, dir: 'down' },
  ],
  // Moon pads: destination = [초승달, 반달, 보름달]. Solution: west room crystal → 보름달,
  // west pad → back to the hall, east hall pad → east room, east pad → 달님.
  triggers: [
    { x: 2, y: 10, run: moonPad([[10, 7, 'down'], [3, 6, 'right'], [3, 6, 'right']]) },
    { x: 10, y: 10, run: moonPad([[3, 6, 'right'], [10, 7, 'down'], [10, 7, 'down']]) },
    { x: 2, y: 6, run: moonPad([[3, 10, 'right']]) },
    { x: 4, y: 7, run: moonPad([[9, 6, 'right'], [9, 10, 'down'], [9, 10, 'down']]) },
    { x: 8, y: 7, run: moonPad([[9, 10, 'down']]) },
    { x: 11, y: 6, run: moonPad([[3, 11, 'right'], [3, 11, 'right'], [3, 2, 'right']], '발판이 희미하게 깜빡이더니… 달빛이 모자라 입구 쪽으로 튕겨 나왔다!') },
  ],
  npcs: [
    { id: 'g4crystal', x: 1, y: 5, dir: 'down', prop: moonCrystalProp, talk: () => moonCrystal() },
    { id: 'g4riddle', x: 12, y: 9, dir: 'down', prop: 'ⓡ', talk: () => moonRiddle() },
    { id: 'g4note', x: 9, y: 10, dir: 'left', pal: PAL.pupil, hidden: () => f('shipDone'), talk: '수련생: 관장님은 항구의 유령선을 조사하러 가셨어요.\n이 체육관은 어둠 속 순간이동 발판을 찾아 관장님께 가야 해요.' },
    { id: 'g4medium1', x: 5, y: 6, dir: 'left', pal: PAL2.medium, sight: 2, hidden: () => !f('shipDone'), trainer: tr('g4m1', '무녀', '은하', PAL2.medium, [['haegol', 31], ['dokkae', 32]], 1200, '어둠 속에서 무엇이 보이나요…?', '당신 뒤에서 빛이 보여요.', '관장님의 고스트 몬스터에겐 노말 기술이 통하지 않아요.') },
    { id: 'g4medium2', x: 12, y: 7, dir: 'left', pal: PAL2.medium, sight: 2, hidden: () => !f('shipDone'), trainer: tr('g4m2', '무녀', '새벽', PAL2.medium, [['mulgwi', 31], ['jeolgu', 31]], 1200, '달빛이 당신을 시험할 거예요.', '달빛이 당신 편이군요.', '관장님은 악 타입 기술을 조심하신대요.') },
    {
      id: 'dalnim', requires: ['g4m1', 'g4m2'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 6, y: 1, dir: 'down', pal: PAL.dalnim, hidden: () => !f('shipDone'),
      trainer: tr('leader4', '관장', '달님', PAL.dalnim, [['cheongsa', 31], ['meokmul', 32], ['wolgung', 32], ['dokdae', 34]], 3500,
        '유령선에서는 정말 고마웠어요. 저는 파도 체육관의 관장 달님.\n하지만 승부는 승부예요. 달빛 아래 그림자를 보여 드릴게요!',
        '당신의 빛이 제 그림자를 모두 비췄네요…', '흑영은 불꽃산에 있어요. 부디 조심하세요.', leader4Win),
    },
  ],
};

// ---------------------------------------------------------------------------
// 제5장 — 5번 도로(해변) · 불꽃마을 · 불꽃산 아지트

const route5: MapDef = {
  id: 'route5', name: '5번 도로 해변길',
  tiles: [
    '##############################',
    '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~ddddddddddddddddddddd#',
    '#~~~~~~~d▓▓dd,,,,,dd==========',
    '#~~~~~~~d▓▓dd,,,,,dd=dddddddd#',
    '#~Ⅳ~~~~~dddddddddddd=dd,,,,dd#',
    '#γγγγγγγdddddddddddd=dd,,,,dd#',
    '#~~~Ⅳ~~~dddddddddddd=dddddddd#',
    '#~~~~~~~dddd=========dddddddd#',
    '#~~~~~~~dddd=dddddddddSdddddd#',
    '#~~~~~~~dddd=d,,,,,,ddddddddd#',
    '#~~~~~~~dddd=d,,,,,,ddddd,,,d#',
    '#~~~~~~~dddd=ddddd~~~dddd,,,d#',
    '#~~~~~~~~~dd=ddddd~~~dddd,,,d#',
    '#~~~~~~~~~dd=dddddddddddddddd#',
    '#~~~~~~~dddd============ddddd#',
    '#~~~~~~~ddddddddddddddd=ddddd#',
    '#~~~~~~~dddddd,,,,,dddd=ddddd#',
    '#γγγγγ~~dddddd,,,,,dddd=d▓▓dd#',
    '#~~Ⅳ~~~~ddddddddddddddd=d▓▓dd#',
    '#~~~~~~~ddddddddddddddd=ddddd#',
    '#~~~~~~~dd==============ddddd#',
    '#~~~~~~~dd=dddddddddddddddddd#',
    '#~~~~~~~dd=d,,,,,,ddddddddddd#',
    '#~~~~~~~dd=d,,,,,,ddddddd~~~d#',
    '#~~~~~~~dd=dddddddddddddd~~~d#',
    '#~~~~~~~dd=ddddd▓▓▓dddddddddd#',
    '#~~~~~=====dddddddddddddddddd#',
    '#~~~~~=~ddddddddddddddddddddd#',
    '######=#######################',
  ],
  warps: [
    { x: 29, y: 3, to: 'town5', tx: 1, ty: 12, dir: 'left' },
    { x: 6, y: 29, to: 'town6', tx: 16, ty: 1, dir: 'down' },
  ],
  signs: [{ x: 22, y: 9, text: '5번 도로 해변길\n북동쪽: 파도항구   남쪽: 불꽃마을' }],
  encounters: {
    rate: 0.13,
    table: [['ubiduck', 26, 28, 14], ['meokmul', 26, 28, 10], ['eolpeng', 26, 28, 10], ['dokjeongal', 26, 28, 10], ['jangjak', 26, 28, 8], ['jangma', 26, 28, 10], ['beotkkot', 26, 28, 10], ['wangmong', 26, 28, 8], ['aurora', 27, 28, 4], ['eungeo', 26, 28, 8], ['haegol', 26, 28, 14], ['kkakkak', 26, 27, 6], ['sutdol', 26, 28, 12]],
  },
  fishing: [['meokmul', 26, 28, 40], ['aurora', 26, 28, 20], ['eungeo', 26, 28, 30], ['daewang', 30, 31, 10]],
  npcs: [
    { id: 'r5firestone', x: 27, y: 26, dir: 'down', item: { id: 'firestone', qty: 1 } },
    { id: 'r5surf1', x: 9, y: 9, dir: 'right', pal: PAL2.surfer, sight: 3, trainer: tr('r5s1', '서퍼', '파랑', PAL2.surfer, [['ubiduck', 32], ['aurora', 33]], 1300, '파도를 타듯 승부를 타 볼까!', '와이프아웃이다…', '해변의 풀숲엔 우비오리가 자주 나와.') },
    { id: 'r5beauty', x: 19, y: 6, dir: 'right', pal: PAL2.beauty, sight: 12, trainer: tr('r5b', '아가씨', '모래', PAL2.beauty, [['beotkkot', 32], ['jangma', 33]], 1300, '선탠을 방해하다니! 승부예요!', '피부가 다 탔잖아요~', '불꽃마을 온천은 피부에 정말 좋대요.') },
    { id: 'r5fire', x: 19, y: 19, dir: 'right', pal: PAL2.firefighter, sight: 4, trainer: tr('r5f', '소방관', '불돌이', PAL2.firefighter, [['jangjak', 33], ['eolpeng', 32]], 1400, '불꽃마을로 가려면 내 시험을 통과해라!', '훌륭한 판단력이다!', '화련 관장님의 불꽃은 물 타입으로 맞서는 게 좋아.') },
    grunt('r5grunt1', 13, 11, 'left', 1, [['yeongi', 33], ['meokmul', 33]],
      '거기 서! 불꽃석 운반을 방해하지 마라!', '끄악!', '이 불꽃석은 전부 불꽃산으로 가져가는 거다.'),
    grunt('r5grunt2', 22, 17, 'right', 1, [['dokkae', 33], ['heukjang', 34]],
      '숯검정 님께는 한 발짝도 못 간다!', '으윽, 너무 세…', '흑영 님은 불꽃산의 심장에 뭘 하려는 걸까…'),
    {
      id: 'r5admin', x: 6, y: 28, dir: 'up', pal: PAL.sutgeom, sight: 3, hidden: () => f('beachDone') || f('badge5'),
      requires: ['r5grunt1', 'r5grunt2'],
      waitText: '숯검정: 흥, 내 부하들도 안 거치고 나한테 오겠다고?\n해변의 부하들부터 상대하고 와라!',
      trainer: tr('r5admin', '검은안개단 간부', '숯검정', PAL.sutgeom, [['dodug', 34], ['daewang', 34], ['geosin', 35]], 2800,
        '네가 잿빛을 손 떼게 만든 꼬마로군.\n흑영 님께 보낼 불꽃석은 절대 못 넘긴다!',
        '불꽃석이… 내 불꽃이…', '', beachAdminWin),
    },
    { id: 'r5crate', x: 11, y: 27, dir: 'down', pal: PAL.grunt, hidden: () => f('beachDone') || f('badge5'), talk: '검은안개단: 상자에는 손대지 마! 숯검정 님의 명령이다!' },
    { id: 'r5hyper', x: 27, y: 4, dir: 'down', item: { id: 'hyperball', qty: 3 } },
    { id: 'r5full', x: 9, y: 2, dir: 'down', item: { id: 'fullrestore', qty: 1 } },
  ],
};

const volcano_forge: MapDef = {
  id: 'volcano_forge', name: '불꽃산 아지트 — 제련소', dark: true, ambience: 'volcano', edge: 'C',
  tiles: [
    'CCCCCCCCC__CCCCCCCCC',
    'C__________________C',
    'C______________ⓟ___C',
    'CLLLLLLLLLLLLⓚLLLLLC',
    'C__________________C',
    'C__________________C',
    'CLLLLⓚLLLLLLLLLLLLLC',
    'C__________________C',
    'C__ⓥ______ⓟ________C',
    'C__________________C',
    'CLLLLLLLLLLLLLLⓚLLLC',
    'C__________________C',
    'C__ⓥ___ⓢ___ⓥ_______C',
    'CCCCCCCCC__CCCCCCCCC',
  ],
  warps: [
    { x: 9, y: 13, to: 'volcano', tx: 12, ty: 1, dir: 'down' },
    { x: 10, y: 13, to: 'volcano', tx: 12, ty: 1, dir: 'down' },
    { x: 9, y: 0, to: 'volcano_heart', tx: 7, ty: 10, dir: 'up' },
    { x: 10, y: 0, to: 'volcano_heart', tx: 8, ty: 10, dir: 'up' },
  ],
  encounters: {
    rate: 0.08, tiles: '_',
    table: [['jangjak', 30, 32, 20], ['hwaro', 30, 31, 8], ['heukjang', 30, 31, 15], ['sutdol', 30, 31, 14], ['hwarotdol', 31, 32, 8], ['dokjeongal', 30, 32, 12]],
  },
  npcs: [
    // valves: 1 and 2 in the entrance hall, 3 on the island between the channels
    { id: 'vvalve1', x: 3, y: 12, dir: 'down', prop: 'ⓥ', talk: () => forgeValve(1) },
    { id: 'vvalve2', x: 11, y: 12, dir: 'down', prop: 'ⓥ', talk: () => forgeValve(2) },
    { id: 'vvalve3', x: 3, y: 8, dir: 'down', prop: 'ⓥ', talk: () => forgeValve(3) },
    { id: 'vschem', x: 7, y: 12, dir: 'down', prop: 'ⓢ', talk: () => forgeSchematic() },
    { id: 'vlavaC', x: 15, y: 10, dir: 'down', barrier: 'lava', hidden: () => channelCool.C() || f('volcanoDone'), talk: '용암이 펄펄 끓고 있다. 냉각수로 식히면 건널 수 있을 것 같다.' },
    { id: 'vlavaB', x: 5, y: 6, dir: 'down', barrier: 'lava', hidden: () => channelCool.B() || f('volcanoDone'), talk: '용암이 펄펄 끓고 있다. 냉각수로 식히면 건널 수 있을 것 같다.' },
    { id: 'vlavaA', x: 13, y: 3, dir: 'down', barrier: 'lava', hidden: () => channelCool.A() || f('volcanoDone'), talk: '용암이 펄펄 끓고 있다. 냉각수로 식히면 건널 수 있을 것 같다.' },
    { id: 'vnote2', x: 10, y: 8, dir: 'down', prop: 'ⓟ', hidden: () => f('vnote2'), talk: () => volcanoNote2() },
    { id: 'vnote3', x: 15, y: 2, dir: 'down', prop: 'ⓟ', hidden: () => f('vnote3'), talk: () => volcanoNote3() },
    grunt('vgrunt3', 12, 5, 'left', 4, [['amheuk', 36], ['hwarotdol', 35]], '제련소까지 들어오다니! 냉각 설비는 손대지 마라!', '밸브를… 이미 다 돌려 놨잖아…', '두목님은 산을 미워하시는 게 아니야. 산이 무서우신 거지.'),
  ],
};
const volcano_heart: MapDef = {
  id: 'volcano_heart', name: '불꽃산 — 화산의 심장', dark: true, edge: 'C',
  ambience: () => (f('volcanoDone') ? 'volcano' : 'volcanoheart'),
  // Once 흑영 withdraws the crystal the heart cools: the core settles and the lava around it
  // hardens into black rock, opening a ledge where his parting gift waits.
  after: { when: () => f('volcanoDone'), tiles: [
      'CCCCCCCCCCCCCCCC',
      'CLLLLLⓚⓚⓚⓚLLLLLC',
      'CLLLⓚⓚ____ⓚⓚLLLC',
      'CLLⓚ___▛▜___ⓚLLC',
      'CLⓚ____▙▟____ⓚLC',
      'Cⓚ____________ⓚC',
      'Cⓚ____________ⓚC',
      'CLⓚ__________ⓚLC',
      'CLLⓚ________ⓚLLC',
      'CLLLⓚⓚ____ⓚⓚLLLC',
      'CLLLLLⓚ__ⓚLLLLLC',
      'CCCCCCC__CCCCCCC',
  ] },
  tiles: [
    'CCCCCCCCCCCCCCCC',
    'CLLLLLLLLLLLLLLC',
    'CLLLLL____LLLLLC',
    'CLLL___◰◳___LLLC',
    'CLL____◱◲____LLC',
    'CL____________LC',
    'CL____________LC',
    'CLL__________LLC',
    'CLLL________LLLC',
    'CLLLLL____LLLLLC',
    'CLLLLLL__LLLLLLC',
    'CCCCCCC__CCCCCCC',
  ],
  warps: [
    { x: 7, y: 11, to: 'volcano_forge', tx: 9, ty: 1, dir: 'down' },
    { x: 8, y: 11, to: 'volcano_forge', tx: 10, ty: 1, dir: 'down' },
  ],
  npcs: [
    { id: 'heartchest', x: 8, y: 1, dir: 'down', prop: () => (f('heartChest') ? '¤' : '§'), hidden: () => !f('volcanoDone'), talk: () => heartChest() },
    { id: 'lg_jujak', x: 7, y: 5, dir: 'down', mon: 'jujak', hidden: () => !f('lg_jujak_ok') || f('lg_jujak'),
      talk: () => legendEncounter('jujak', 65, '붉은 불꽃의 새가 화산의 심장 위에 내려앉아 있다…\\n다가가 볼까?', '주작: 끼아아아——!') },
    { id: 'vboss', x: 8, y: 5, dir: 'down', pal: PAL.boss, hidden: () => f('volcanoDone'), requires: ['vgrunt1', 'vgrunt2', 'vgrunt3'], waitText: '흑영: …아직 내 부하들이 남아 있다. 그들을 넘어서지 못한다면\\n나와 겨룰 자격도 없다.', talk: () => volcanoBossScene() },
  ],
  triggers: [7, 8].map((x) => ({ x, y: 8, when: () => !f('volcanoDone') && beatenAll(['vgrunt1', 'vgrunt2', 'vgrunt3']), run: volcanoBossScene })),
};
const town6: MapDef = {
  id: 'town6', name: '불꽃마을',
  tiles: [
    '################=###################',
    '#ϑϑϑϑϑϑϑϑϑϑϑⅥϑϑⅥ=ϑϑⅥϑⅥϑϑϑϑϑϑϑΔΔΔΔΔϑ#',
    '#ΔΔΔΔΔϑϑϑϑϑϑϑϑϑϑ=ϑϑϑϑϑϑϑϑϑϑϑϑΔΔΔΔΔϑ#',
    '#ΔΔΔΔΔϑϑϑϑϑϑϑϑϑϑ=ϑϑϑϑϑϑϑϑϑϑϑϑWwDwWϑ#',
    '#ϜϝDϜϜϑϑϑϑRRRRRϑ=ϑϑϑϑϑMMMMϑϑϑϑϑ=ϑϑϑ#',
    '#ϑϑ=ϑϑϑϑϑϑRRRRRϑ=ϑϑϑϑϑMMMMϑϑϑϑϑ=ϑϑϑ#',
    '#μϑ=ϑⅦϑϑϑϑWwDwWϑ=ϑϑϑϑϑWDwWϑ=========',
    '#ϑϑ=ϑϑϑϑϑϑϑϑ=ϑϑϑ=ϑϑϑϑϑϑ=====ϑϑϑϑϑϑϑ#',
    '#ϑϑ=ϑϑϑϑϑϑϑϑ============ϑϑϑϑϑϑϑϑϑϑϑ#',
    '#ⅥⅥ=ϑϑϑϑϑϑBBBBϑϑ=ϑϑϑϑϑϑϑϑϑϑϑϑⅥⅥⅥⅥⅥⅥ#',
    '#Ⅴϑ=ϑϑϑϑϑϑBHBBϑϑ=ϑϑϑⅤⅤⅤⅤϑϑϑϑϑⅥⅤⅤⅤⅤⅥ#',
    '#ⅥⅥ=ϑϑϑϑϑϑWEwWϑϑ=ϑϑϑⅤⅤⅤⅤϑϑϑϑϑⅥⅤⅤⅤⅤⅥ#',
    '#ϑϑ=ϑϑϑϑϑϑϑ======ϑϑϑϑϑϑϑϑϑϑϑϑⅥⅤⅤⅤⅤⅥ#',
    '#ϑϑ=ϑϑϑϑϑϑϑϑϑϑϑϑ=ϑϑϑϑϑϑϑϑϑϑϑϑⅥⅥϑϑⅥⅥ#',
    '#ϑϑ=ϑϑϑϑϑϑffϑϑϑϑ=ϑϑϑϑϑϑffϑϑϑϑϑϑϑϑϑϑ#',
    '================ϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#ϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϘϑϑϑϘ#',
    '#ϑϑϑϑϑϑϑϑϑLLLϑϑϑϑϑϑϑLLLϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#ϑϑϑϑⅥⅤⅥϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#ϑϑϑϑϑϑϑⅥϑϑⅥⅥⅥϑⅥⅥϑⅥⅥⅥϑϑⅥⅤϑϑϑϑϑϑϑϑϑϑ#',
    '#ϑϑϑϘϑϑϑϑϑϘϑϑϑϑϑϘϑϑϑϑϑϘϑϑϑϑϑϘϑϑϑϑϑϑ#',
    '#ϑϑϑϑϑϑθϑϑϑϑϑϑϑϑϑϑϑθϑϑϑϑϑθϑϑϑϑϑϑϑϑϑ#',
    '####################################',
  ],
  warps: [
    { x: 3, y: 4, to: 'house6a', tx: 5, ty: 7, dir: 'up' },
    { x: 31, y: 3, to: 'house6b', tx: 5, ty: 7, dir: 'up' },
    { x: 16, y: 0, to: 'route5', tx: 6, ty: 28, dir: 'up' },
    { x: 12, y: 6, to: 'gym5', tx: 8, ty: 12, dir: 'up' },
    { x: 23, y: 6, to: 'shop6', tx: 4, ty: 6, dir: 'up' },
    { x: 11, y: 11, to: 'center6', tx: 4, ty: 6, dir: 'up' },
    { x: 35, y: 6, to: 'volcano', tx: 1, ty: 9, dir: 'right' },
    { x: 0, y: 15, to: 'route6', tx: 44, ty: 10, dir: 'left' },
  ],
  labels: [ { x: 3, y: 2.2, text: '대장간', color: '#ffe0d0', ink: '#8a2a1a' }, { x: 31, y: 1.2, text: '온천장', color: '#ffe0d0', ink: '#8a2a1a' }, { x: 31.5, y: 9.1, text: '노천 온천', color: '#d8f0ff', ink: '#2a5a8a' },
    { x: 12, y: 9.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' },
    { x: 24, y: 4.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' },
    { x: 12.5, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' },
    { x: 22, y: 9.6, text: '온천', color: '#d8f0ff', ink: '#2a5a8a' },
  ],
  signs: [],
  npcs: [
    { id: 't6bather', x: 31, y: 14, dir: 'up', pal: PAL.swimmer, talk: '노천 온천은 무료야! …몬스터는 출입 금지래.\n불 타입 몬스터가 들어가면 물이 끓어 버린다나.' },
    { id: 't6miner', x: 6, y: 9, dir: 'left', pal: PAL.hiker, move: 'look', talk: '광부: 화산 근처 돌은 열을 오래 머금어서 대장간에서 귀하게 쓰지.\n담장도 전부 화산석으로 쌓았다네.' },
    { id: 't6old', x: 19, y: 12, dir: 'down', pal: PAL.oldman, move: 'look', talk: '십 년 전 불꽃산이 크게 터졌을 때, 산 너머 마을 하나가 사라졌지…\n그 마을에서 살아남은 아이가 있었다는데, 지금은 어디서 뭘 하는지.' },
    { id: 't6spa', x: 25, y: 11, dir: 'left', pal: PAL.lady, talk: async () => {
      await say('온천지기: 어서 오세요! 불꽃마을 온천에 몸을 담그고 가세요~');
      await healParty();
      await say('온천지기: 동료들이 모두 기운을 되찾았어요!');
    } },
  ],
  triggers: [
    { x: 34, y: 6, when: () => !f('badge5'), run: pushBack(['소방관: 잠깐! 화산 입구는 출입 금지야.', '체육관 관장 화련 님께 먼저 가 봐!'], 'left') },
    { x: 1, y: 15, when: () => !f('volcanoDone'), run: pushBack(['서쪽 6번 도로 입구다.', '화산이 계속 흔들려서 길이 위험해 보인다…\n먼저 화산의 소동을 해결해야 할 것 같다.'], 'right') },
  ],
};

const center6 = makeCenter('center6', '불꽃마을 회복소', 'town6', 11, 12, '불 타입은 물·땅·바위 기술에 약해.\n화련 관장님께 가기 전에 꼭 챙겨 둬!');
const shop6 = makeShop('shop6', '불꽃마을 상점', 'town6', 23, 7, '화산에 들어간다면 만능회복약을 꼭 챙기세요!');

const gym5: MapDef = {
  id: 'gym5', name: '불꽃 체육관', indoor: true, ambience: 'volcano', respawn: [8, 12],
  tiles: [
    'ⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥⅥ',
    'ⅥLLLLLLϑϑϑϑLLLLLLⅥ',
    'ⅥLⓤϑϑϑϑϑϑϑϑϑϑϑϑⓤLⅥ',
    'ⅥLLLLLLLϑϑLLLLLLLⅥ',
    'ⅥϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑⅥ',
    'ⅥϑLLLLLLLLLLLLLLLⅥ',
    'ⅥϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑⅥ',
    'ⅥLLLLLLLLLLLLLLLϑⅥ',
    'ⅥϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑⅥ',
    'ⅥϑLLLLLLLLLLLLLLLⅥ',
    'ⅥϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑϑⅥ',
    'ⅥϑϑⅥϑϑϑϑϑϑϑϑϑϑⅥϑϑⅥ',
    'ⅥⓤϑϑϑϑϑϑϑϑϑϑϑϑϑϑⓤⅥ',
    'ⅥⅥⅥⅥⅥⅥⅥⅥeeⅥⅥⅥⅥⅥⅥⅥⅥ',
  ],
  warps: [
    { x: 8, y: 13, to: 'town6', tx: 12, ty: 7, dir: 'down' },
    { x: 9, y: 13, to: 'town6', tx: 12, ty: 7, dir: 'down' },
  ],
  npcs: [
    { id: 'g5jet0', x: 4, y: 8, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 0 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet1', x: 7, y: 8, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 24 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet2', x: 10, y: 8, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 48 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet3', x: 13, y: 8, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 72 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet4', x: 13, y: 6, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 10 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet5', x: 10, y: 6, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 40 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet6', x: 7, y: 6, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 70 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet7', x: 4, y: 6, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 30 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet8', x: 3, y: 4, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 0 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet9', x: 6, y: 4, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 48 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet10', x: 12, y: 4, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 20 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5jet11', x: 15, y: 4, dir: 'down', barrier: 'flame', pulse: { period: 96, offset: 66 }, talk: '화염 분사구다. 불길이 일정한 박자로 치솟았다가 꺼진다.' },
    { id: 'g5sign', x: 9, y: 11, dir: 'down', pal: PAL2.firefighter, talk: '불꽃 체육관의 시험은 「불길의 박자」야.\n분사구가 꺼진 틈을 노려 한 칸씩 지나가! 불길 위에 서 있다간 입구로 돌아오게 돼.' },
    { id: 'g5f1', x: 16, y: 10, dir: 'left', pal: PAL2.firefighter, sight: 15, trainer: tr('g5f1', '불꽃수련생', '지글', PAL2.firefighter, [['jangjak', 34], ['hwaro', 34]], 1500, '용암처럼 뜨거운 승부다!', '불이 꺼졌다…', '관장님의 화산뿔은 땅 타입도 가지고 있어.') },
    { id: 'g5f2', x: 13, y: 2, dir: 'left', pal: PAL2.firefighter, sight: 5, trainer: tr('g5f2', '불꽃수련생', '활활', PAL2.firefighter, [['dokjeongal', 34], ['jangjak', 35]], 1500, '관장님 앞에서 질 수는 없지!', '앗 뜨거!', '물 기술이 있으면 훨씬 수월할 거야.') },
    {
      id: 'hwaryeon', requires: ['g5f1', 'g5f2'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 8, y: 1, dir: 'down', pal: PAL.hwaryeon, hidden: () => f('champion'),
      trainer: tr('leader5', '관장', '화련', PAL.hwaryeon, [['jangjak', 36], ['hwaro', 36], ['seolpyo', 36], ['hwasan', 39]], 4000,
        '불꽃 체육관에 온 걸 환영해! 나는 관장 화련.\n이 마을은 화산과 함께 살아왔지. 그 뜨거운 마음을 보여 줄게!',
        '하하, 내 불꽃이 완전히 꺼졌네!', '화산이 요즘 이상해… 부탁할게.', leader5Win),
    },
    { id: 'hwaryeon_post', x: 8, y: 1, dir: 'down', pal: PAL.hwaryeon, hidden: () => !f('champion'), talk: () => hwaryeonPost() },
  ],
};

const volcano: MapDef = {
  id: 'volcano', name: '불꽃산 아지트', dark: true, ambience: 'volcano', edge: 'C',
  tiles: [
    'CCCCCCCCCCCC_CCCCCCCCCCC',
    'C__________L_L_________C',
    'C_LLLL_____L_L___LLLL__C',
    'C_LLLL___z_____z_LLLL__C',
    'C______________________C',
    'CCCCCCC_CCCCCCCCC_CCCCCC',
    'C______________________C',
    'C__LLL____LLLL____LLL__C',
    'C__LLL____LLLL____LLL__C',
    '_______________________C',
    'C______________________C',
    'CCCC_CCCCCCCCCCCCCC_CCCC',
    'C______LLL____LLL______C',
    'C______________________C',
    'CCCCCCCCCCCCCCCCCCCCCCCC',
  ],
  warps: [{ x: 0, y: 9, to: 'town6', tx: 34, ty: 6, dir: 'left' }, { x: 12, y: 0, to: 'volcano_forge', tx: 9, ty: 12, dir: 'up' }],
  encounters: {
    rate: 0.1, tiles: '_',
    table: [['jangjak', 29, 31, 20], ['hwaro', 29, 30, 8], ['dokjeongal', 29, 31, 15], ['geoam', 30, 31, 6], ['daeji', 29, 31, 8], ['heukjang', 29, 30, 15], ['geosin', 29, 30, 6], ['dokdae', 29, 30, 6], ['sutdol', 29, 30, 14], ['hwarotdol', 30, 31, 6]], post: [['maekae', 30, 31, 10], ['yeongi', 31, 32, 6], ['amheuk', 36, 38, 2]],
  },
  npcs: [
    grunt('vgrunt1', 3, 10, 'right', 6, [['yeongi', 35], ['dokjeongal', 35]], '두목님의 마지막 작전이다! 물러서라!', '이럴 수가…', '두목님은 제련소 너머, 화산의 심장에 계신다.'),
    grunt('vgrunt2', 20, 6, 'left', 6, [['geosin', 35], ['dokdae', 35]], '여기까지 왔다고? 대단하군. 하지만 끝이다!', '크으…', '두목님은… 사실 이 산을 지키고 싶어 하셔.'),
    { id: 'vnote1', x: 6, y: 13, dir: 'down', prop: 'ⓟ', hidden: () => f('vnote1'), talk: () => volcanoNote1() },
    { id: 'vitem1', x: 1, y: 13, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
    { id: 'vitem2', x: 22, y: 13, dir: 'down', item: { id: 'hyperball', qty: 3 } },
  ],
};

// ---------------------------------------------------------------------------
// 6번 도로 · 해솔고원 · 해솔 리그

const route6: MapDef = {
  id: 'route6', name: '6번 도로 불과 눈의 고개',
  tiles: [
    '##############################################',
    '#``hh.h````````▒....,,,,.....▓.ϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#``````````````▒....,,,,.....▓.ϑϑ1111ϑϑϑϑϑϑϑϑ#',
    '#▒▤▒▒▒▒▒▒▒▒▒▒▒▒▒.............▓.ϑϑ1111ϑϑϑϑϑϑϑϑ#',
    '#``````````````==============▤==ϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '===````````````=.............▓.=ϑϑϑϑϑϑϑϑϑⅤϑⅥϑ#',
    '#`=````````````=▒............▓.=ϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#`=`jjjj```````=▒.,,,,,,.....▓.=ϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#`=`jjjj```````=▒.,,,,,,.....▓.=ϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#`=````````````=▒............▓.=ϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#`=```````h`h``=▒...~~~~~....▓.===============',
    '#`=````````h```=▒...~~~~~....▓.ϑϑϑϑϑϑϑϑϑϑϑϑSϑ#',
    '#`=````````````=▒............▓.ϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#`=````````````=▒............◁.ϑϑϑϑϑϑϑ11111ϑϑ#',
    '#`=````````````=▒....,,,,,,,.◁.ϑϑϑϑϑϑϑ11111ϑϑ#',
    '#`==============▤....,,,,,,,.◁.ϑϑϑⅤϑϑϑϑϑϑϑϑϑϑ#',
    '#``````````````.▒............◁.ϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#``````jjjjj```.▒............◁.ϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '#``````````````.▒............◁.ϑϑϑϑϑϑϑϑϑϑϑϑϑϑ#',
    '##############################################',
  ],
  warps: [
    { x: 45, y: 10, to: 'town6', tx: 1, ty: 15, dir: 'right' },
    { x: 0, y: 5, to: 'town7', tx: 34, ty: 11, dir: 'left' },
  ],
  signs: [{ x: 43, y: 11, text: '6번 도로\n서쪽: 서리마을   동쪽: 불꽃마을' }],
  encounters: {
    rate: 0.12, tiles: ',1j',
    table: [['hoeori', 31, 32, 10], ['beonjjeok', 31, 32, 8], ['noejeon', 31, 32, 4], ['satba', 31, 32, 10], ['seolpyo', 31, 32, 8], ['olppaemi', 31, 32, 10], ['wangmong', 31, 32, 8], ['byeolkkum', 31, 32, 2], ['gangjip', 31, 32, 8], ['dodug', 31, 32, 10], ['nalgae', 31, 32, 6], ['beoseotking', 31, 32, 6], ['kkakkak', 31, 32, 8], ['kkamagwi', 32, 32, 2], ['geumdukeop', 31, 32, 1]],
  },
  fishing: [['eungeo', 29, 32, 50], ['aurora', 29, 31, 30], ['daewang', 31, 32, 20]],
  npcs: [
    { id: 'r6thornstone', x: 24, y: 1, dir: 'down', item: { id: 'thornstone', qty: 1 } },
    { id: 'r6ace1', x: 3, y: 8, dir: 'left', pal: PAL2.ace, sight: 1, trainer: tr('r6a1', '엘리트트레이너', '바람', PAL2.ace, [['hoeori', 38], ['noejeon', 38], ['jangsa', 38]], 2200, '리그로 가는 길이라면 나를 넘어가라!', '이 정도라면 리그에서도 통하겠어.', '리그 수호자는 악과 드래곤 타입을 쓴대.') },
    { id: 'r6ace2', x: 14, y: 10, dir: 'right', pal: PAL.lady, sight: 1, trainer: tr('r6a2', '엘리트트레이너', '구름', PAL.lady, [['byeolkkum', 38], ['aurora', 38], ['wangbingsu', 38]], 2200, '파스텔빛 몬스터의 진짜 힘을 보여 줄게!', '정말 강하구나…', '페어리 기술은 드래곤 타입에 아주 잘 통해!') },
    { id: 'r6ace3', x: 24, y: 5, dir: 'up', pal: PAL2.surfer, sight: 1, trainer: tr('r6a3', '엘리트트레이너', '파도', PAL2.surfer, [['daewang', 38], ['eolpeng', 38], ['ubiduck', 38]], 2200, '해솔 리그를 꿈꾸는 건 너만이 아니야!', '꿈은 너에게 맡길게.', '고원의 회복소에서 꼭 쉬어 가.') },
    { id: 'r6monk', x: 32, y: 8, dir: 'left', pal: PAL.monk, sight: 1, trainer: tr('r6m', '수행자', '고요', PAL.monk, [['geoam', 39], ['wolgung', 39]], 2000, '마음을 비우고 승부에 임하라.', '훌륭한 마음가짐이다.', '리그에서는 동료를 믿는 마음이 가장 중요하다.') },
    { id: 'r6item1', x: 1, y: 1, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
    { id: 'r6item2', x: 44, y: 17, dir: 'down', item: { id: 'fullrestore', qty: 2 } },
  ],
};

const plateau: MapDef = {
  id: 'plateau', name: '해솔고원',
  tiles: [
    '####################=#',
    '#....YYYYYYYYYYYY...=#',
    '#....YYYYYYYYYYYY...=#',
    '#....WwWwWDDWwWwW...=#',
    '#l........==.......l=#',
    '#.........==........=#',
    '#..fff....==....fff.=#',
    '#.........==........=#',
    '#..BBBB...==........=#',
    '#..BHBB...==........=#',
    '#..WEwW...==........=#',
    '======================',
    '#.....,,,,,,,,,,.....#',
    '#..fff.,,,,,,,,.fff..#',
    '#.....,,,,,,,,,,.....#',
    '######################',
  ],
  warps: [
    { x: 0, y: 11, to: 'town1', tx: 32, ty: 11, dir: 'left' },
    { x: 21, y: 11, to: 'route8', tx: 1, ty: 4, dir: 'right' },
    { x: 10, y: 3, to: 'league', tx: 7, ty: 13, dir: 'up' },
    { x: 11, y: 3, to: 'league', tx: 8, ty: 13, dir: 'up' },
    { x: 4, y: 10, to: 'center7', tx: 4, ty: 6, dir: 'up' },
    { x: 20, y: 0, to: 'skyroad', tx: 9, ty: 26, dir: 'up' },
  ],
  labels: [
    { x: 11, y: 1.1, text: '해솔 리그', color: '#fff2a8', ink: '#7a5a10' },
    { x: 18.5, y: 0.3, text: '천공의 길', color: '#e8f0ff', ink: '#3a4a8a' },
    { x: 5, y: 8.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' },
  ],
  signs: [],
  encounters: { rate: 0.12, table: [['jangseung', 44, 47, 30], ['cheonha', 47, 50, 4], ['yeolgigu', 44, 47, 10], ['kkamagwi', 44, 46, 10], ['hoeori', 44, 46, 10]] },
  npcs: [
    { id: 'pguide', x: 13, y: 5, dir: 'left', pal: PAL.guard, talk: async () => {
      if (f('champion')) await say('안내원: 챔피언님! 고원 북쪽 「천공의 길」이 열렸어요.\n구름 위 신전에 태초의 챔피언이 있다는 소문이… 정말 강하대요. 꼭 준비하고 가세요!');
      else await say('안내원: 해솔 리그에 오신 걸 환영합니다!\n일곱 개의 배지를 모은 트레이너만 도전할 수 있어요.\n서쪽 길로 가면 바로 솔빛마을이에요.');
    } },
  ],
  triggers: [
    ...[10, 11].map((x) => ({
      x, y: 4, when: () => !(f('badge7') && f('pearlReturned')),
      run: pushBack(['안내원: 죄송하지만 배지 일곱 개가 필요해요.', '배지를 모두 모아서 다시 와 주세요!'], 'down'),
    })),
    { x: 20, y: 1, when: () => !f('champion'), run: pushBack(['북쪽으로 구름에 덮인 길이 이어져 있다.', '경비: 이 앞은 「천공의 길」. 해솔 리그 챔피언만 오를 수 있어.'], 'down') },
  ],
};

const center7 = makeCenter('center7', '해솔고원 회복소', 'plateau', 4, 11, '리그 안에는 상점이 없어.\n들어가기 전에 회복약을 충분히 챙겨!');

const TOURNEY_OPP_IDS = ['opp16', 'opp8', 'opp4', 'oppfinal'];
const TOURNEY_PALS: Pal[] = [{ hair: '#2a2a3a', shirt: '#3ab0b0', pants: '#2a2a3a' }, PAL.shadow, PAL.yongyeon, PAL.champ];

const league: MapDef = {
  id: 'league', name: '해솔 리그 경기장', indoor: true,
  tiles: [
    '%&$%&$%&$%&$%&$%',
    '$%&$%&$%&$%&$%&$',
    '&$............%&',
    '%&............$%',
    '$%............&$',
    '&$............%&',
    '%&............$%',
    '$%============&$',
    '&$............%&',
    '%&............$%',
    '$%............&$',
    '&$%&$%....%&$%&$',
    'XXXXXooooooXXXXX',
    'XXXXXooooooXXXXX',
    'XXXXXXXeeXXXXXXX',
  ],
  warps: [
    { x: 7, y: 14, to: 'plateau', tx: 10, ty: 4, dir: 'down' },
    { x: 8, y: 14, to: 'plateau', tx: 11, ty: 4, dir: 'down' },
  ],
  labels: [{ x: 8, y: 0.3, text: '해솔 리그 토너먼트', color: '#ffd24a', ink: '#5a3a00' }],
  npcs: [
    { id: 'reception', x: 5, y: 12, dir: 'right', pal: PAL.lady, talk: () => receptionTalk() },
    { id: 'announcer', x: 2, y: 7, dir: 'right', pal: { hair: '#2a2a3a', shirt: '#ffffff', pants: '#2a2a3a', hat: '#c8323a' }, talk: '아나운서: 해솔 리그 토너먼트! 16강부터 결승까지,\n네 번을 내리 이기는 선수만이 트로피를 들 수 있습니다!' },
    { id: 'lobbyfan', x: 10, y: 13, dir: 'left', pal: PAL.kid, move: 'look', talk: '꼬마 팬: 이번 대회엔 리그 수호자 그림자랑 용연도 나온대!\n결승까지 가면 엄청 멋질 거야!' },
    ...TOURNEY_OPP_IDS.map((id, r) => ({ id, x: 7, y: 4, dir: 'down' as Dir, pal: TOURNEY_PALS[r], hidden: () => runtime.tourneyRound !== r })),
  ],
};

// ---------------------------------------------------------------------------
// 제6장 — 서리마을 · 서리 체육관(얼음 미끄럼 퍼즐)

const icecave_deep: MapDef = {
  id: 'icecave_deep', name: '얼음굴 — 얼어붙은 호수', dark: true, ambience: 'icecave', edge: 'C',
  tiles: [
    'CCCCCCCCCCCCCCCCCCCC',
    'CCCCCC________CCCCCC',
    'CCCCCC________CCCCCC',
    'CCCCCCCCC__CCCCCCCCC',
    'CiiiiiiiiiiiziiiiiiC',
    'CiiiiiiziziiiiziiiiC',
    'CzziiiiiiiiiiiiiiiiC',
    'CiiiiiiiiiiiiiiiiiiC',
    'CiiiiiiiiiiiiiiiiziC',
    'CiiiiiiiiiiiiziiiiiC',
    'CiziiiiiiiiiiziiiiiC',
    'CiiiiiziiiziziiziiiC',
    'C__________________C',
    'C__________________C',
    'CCCⓦCCⓦCC__CCCCⓦCCCC',
  ],
  warps: [
    { x: 9, y: 14, to: 'icecave', tx: 10, ty: 1, dir: 'down' },
    { x: 10, y: 14, to: 'icecave', tx: 10, ty: 1, dir: 'down' },
  ],
  npcs: [
    { id: 'mural0', x: 3, y: 14, dir: 'down', prop: 'ⓦ', talk: () => mural(0) },
    { id: 'mural1', x: 6, y: 14, dir: 'down', prop: 'ⓦ', talk: () => mural(1) },
    { id: 'mural2', x: 15, y: 14, dir: 'down', prop: 'ⓦ', talk: () => mural(2) },
    { id: 'icdeepitem', x: 18, y: 4, dir: 'down', item: { id: 'pphoney', qty: 1 } },
    { id: 'seori_cave', x: 8, y: 2, dir: 'down', pal: PAL.seori, hidden: () => f('iceCaveDone') || f('badge6'), talk: () => iceCaveScene() },
    { id: 'icebear', x: 10, y: 1, dir: 'down', mon: 'bingsan', hidden: () => f('iceCaveDone') || f('badge6'), talk: () => iceCaveScene() },
    { id: 'snowkid', x: 12, y: 1, dir: 'down', pal: PAL.kid, hidden: () => f('iceCaveDone') || f('badge6'), talk: '눈송이: 무서워… 빙산곰이 너무 화가 났어…' },
  ],
  triggers: [9, 10].map((x) => ({ x, y: 3, when: () => !f('iceCaveDone') && !f('badge6'), run: iceCaveScene })),
};
const town7: MapDef = {
  id: 'town7', name: '서리마을', edge: 'h', ambience: northWeather,
  tiles: [
    'hhhhhhhhhhhhhhhhhhhhhhhhhhOhhhhhhhhh',
    'h```````````h``Ⅷ``h````````````````h',
    'hΛΛΛΛΛ```````````````````````ΛΛΛΛΛ`h',
    'hΛΛΛΛΛ```````````````````````ΛΛΛΛΛ`h',
    'hϜϝDϜϜ````ΛΛΛΛΛ`````MMMM`````WwDwW`h',
    'h``=``````ΛΛΛΛΛ`````MMMM```````=```h',
    'h``=``````WwDwW`````WDwW```````=```h',
    'h``=`Ⅸ``````=````````=```````h`=`h`h',
    'h``=````````==========`````````=```h',
    'h``=``````BBBB``=``````ii``````=```h',
    'h``=``````BHBB``=``````ii``````=```h',
    '==========WEwW``====================',
    'h```````=======````````````````````h',
    'hⅩⅪ`ⅩⅪ``````````````jjjj```````````h',
    'h`````````````S`````jjjj```````````h',
    'hⅧ```Ⅷ`````````````````````````````h',
    'h```````````````````````Ϙ````````Ϙ`h',
    'h````````````````````````iiiiiiii``h',
    'hh`h`````````````````````iiiiiiii``h',
    'h`h``````Ϙ`Ⅸ`Ϙ`Ⅸ`Ϙ`Ⅸ`Ϙ```iiiiiiii``h',
    'hh`h`````````````````````iiiiiiii``h',
    'h```````````````````````θ````````θ`h',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  ],
  warps: [
    { x: 3, y: 4, to: 'house7a', tx: 5, ty: 7, dir: 'up' },
    { x: 31, y: 4, to: 'house7b', tx: 5, ty: 7, dir: 'up' },
    { x: 35, y: 11, to: 'route6', tx: 1, ty: 5, dir: 'right' },
    { x: 0, y: 11, to: 'route7', tx: 38, ty: 12, dir: 'left' },
    { x: 12, y: 6, to: 'gym6', tx: 6, ty: 12, dir: 'up' },
    { x: 21, y: 6, to: 'shop8', tx: 4, ty: 6, dir: 'up' },
    { x: 11, y: 11, to: 'center8', tx: 4, ty: 6, dir: 'up' },
    { x: 26, y: 0, to: 'icecave', tx: 10, ty: 13, dir: 'up' },
  ],
  labels: [ { x: 3, y: 2.2, text: '얼음 공방', color: '#e8f4ff', ink: '#2a4a7a' }, { x: 31, y: 2.2, text: '코코아 찻집', color: '#fff0e0', ink: '#7a4a2a' }, { x: 29, y: 16.1, text: '스케이트장', color: '#e8f4ff', ink: '#2a4a7a' }, { x: 15, y: 18.1, text: '얼음 조각 정원', color: '#e8f4ff', ink: '#2a4a7a' },
    { x: 12, y: 9.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' },
    { x: 22, y: 4.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' },
    { x: 26, y: 1.2, text: '얼음굴', color: '#e0f4ff', ink: '#2a5a8a' },
    { x: 12.5, y: 4.1, text: '체육관', color: '#e8e0ff', ink: '#4a3a8a' },
  ],
  signs: [{ x: 14, y: 14, text: '서리마을\n일 년 내내 눈이 내리는 마을  ·  서쪽: 설원 산길' }],
  encounters: { rate: 0.1, tiles: 'j', table: [['agibuk', 32, 34, 40], ['nunnyang', 32, 34, 30], ['agipeng', 32, 34, 30]] },
  npcs: [
    { id: 't7igloo', x: 3, y: 14, dir: 'down', pal: PAL.oldman, move: 'look', talk: '이글루 할아버지: 옛날엔 서리마을 사람들 모두 이글루에서 살았지.\n얼음집이 생각보다 훨씬 따뜻하다네.' },
    { id: 't7skater', x: 28, y: 19, dir: 'right', pal: PAL.skier, move: 'look', talk: '스케이트장에선 한 방향으로 쭉 미끄러져!\n눈밭 가장자리에 닿아야 멈춘다고.' },
    { id: 't7old', x: 18, y: 13, dir: 'down', pal: PAL.oldman, move: 'look', talk: '이렇게 지독한 눈보라는 처음일세.\n용의 마을의 여의주가 하늘을 다스린다는 옛말이 있는데… 무슨 일이 있는 게야.' },
    { id: 't7kid', x: 24, y: 15, dir: 'left', pal: PAL.kid, move: 'wander', talk: '마을 연못은 꽁꽁 얼어서 미끄럼을 탈 수 있어! 체육관 바닥도 다 얼음이래!' },
    { id: 'rival_t7', x: 22, y: 13, dir: 'down', pal: PAL.rival, hidden: () => f('iceIntro') },
    { id: 't7mom', x: 15, y: 7, dir: 'down', pal: PAL.lady, move: 'look', talk: async () => {
      if (f('champion')) await snowMomPost();
      else if (f('iceCaveDone')) await say('눈송이 엄마: 눈송이가 아기북곰이랑 꼭 붙어서 안 떨어져요.\n정말 고마웠어요!');
      else await say('눈송이 엄마: 우리 눈송이가 아기북곰을 쫓아서 얼음굴에 들어갔어요…\n얼음굴은 마을 북동쪽이에요. 제발 찾아 주세요!');
    } },
  ],
  triggers: [
    { x: 12, y: 7, when: () => f('iceIntro') && !f('iceCaveDone') && !f('badge6'), run: pushBack(['체육관 문에 쪽지가 붙어 있다.', '「관장 서리는 얼음굴에 들어간 아이를 찾으러 갔습니다.」'], 'down') },
    { x: 33, y: 11, when: () => !f('iceIntro'), run: iceIntroScene },
    { x: 1, y: 11, when: () => !f('badge6'), run: pushBack(['서쪽 설원 산길은 눈보라가 너무 심하다…', '마을 사람: 체육관 관장 서리 님께 인정받으면 길을 안내해 줄 거야.'], 'right') },
  ],
};

const center8 = makeCenter('center8', '서리마을 회복소', 'town7', 11, 12, '얼음 타입은 불·격투·바위·강철 기술에 약해.\n체육관 바닥은 얼음이라 미끄러우니 조심해!');
const shop8 = makeShop('shop8', '서리마을 상점', 'town7', 21, 7, '따뜻한 핫초코는 안 팔지만, 회복약은 넉넉하답니다!');

const gym6: MapDef = {
  id: 'gym6', name: '서리 체육관', indoor: true, ambience: 'icecave',
  tiles: [
    'XXXXXXXXXXXXXXX',
    'XXXXXoooooXXXXX',
    'XiiiiiiiiiiiiiX',
    'XiiiiiiⅧiiiiiiX',
    'XiiiiiiiiⅨiiiiX',
    'XiiiiiⅨiiiiiiiX',
    'XiiiiiiⅨⅨiiiiiX',
    'XⅨiiiiiiiiⅨiiiX',
    'XiiⅨiⅧiiiⅧiiiiX',
    'XiiiiiiiiiiiiiX',
    'XiiiiiiiiiiiiiX',
    'XoooooooooooooX',
    'XoooooooooooooX',
    'XXXXXXeeXXXXXXX',
  ],
  warps: [
    { x: 6, y: 13, to: 'town7', tx: 12, ty: 7, dir: 'down' },
    { x: 7, y: 13, to: 'town7', tx: 12, ty: 7, dir: 'down' },
  ],
  npcs: [
    { id: 'g6ski1', x: 1, y: 12, dir: 'right', pal: PAL.skier, sight: 12, trainer: tr('g6s1', '스키어', '설아', PAL.skier, [['nunnyang', 40], ['eolpeng', 40]], 1800, '얼음 위에서는 멈추고 싶은 곳에서 멈출 수 없어. 그게 이 체육관의 시험이지!', '미끄러졌다…', '바위에 부딪혀야 멈출 수 있어. 어디서 멈출지 잘 생각해 봐!') },
    { id: 'g6ski2', x: 13, y: 11, dir: 'left', pal: PAL.skier, sight: 12, trainer: tr('g6s2', '스키어', '한겨울', PAL.skier, [['agibuk', 40], ['wangbingsu', 41]], 1800, '관장님께 가는 길은 얼음판 너머야!', '쌩하고 졌네…', '힌트? 오른쪽 벽을 따라가 봐.') },
    {
      id: 'seori', requires: ['g6s1', 'g6s2'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 7, y: 1, dir: 'down', pal: PAL.seori, hidden: () => !f('iceCaveDone') && !f('badge6'),
      trainer: tr('leader6', '관장', '서리', PAL.seori, [['eolpeng', 43], ['seolpyo', 44], ['wangbingsu', 44], ['bingsan', 47]], 4400,
        '얼음판을 건너왔군요. 저는 서리 체육관의 관장 서리.\n차갑지만 투명한 얼음처럼, 거짓 없는 승부를 해요!',
        '얼음이 녹듯… 졌네요.', '눈보라의 원인은 용의 마을에 있어요.', leader6Win),
    },
  ],
};

/** 서리마을 북쪽 얼음굴 — 서리 체육관에 가기 전의 이야기. 미끄러운 얼음판을 건너야 한다. */
const icecave: MapDef = {
  id: 'icecave', name: '얼음굴', dark: true, ambience: 'icecave',
  tiles: [
    'CCCCCCCCCC_CCCCCCCCC',
    'CCCCCC________CCCCCC',
    'CCCCCC________CCCCCC',
    'CCCCCCCCC__CCCCCCCCC',
    'C___iiiiiiiiiiii___C',
    'C___iiiiiiiiiizi___C',
    'C___iziiiiiiiiii___C',
    'C___iiiiiiiiiiii___C',
    'C___iiiiiiiziiii___C',
    'C___iiiiiiiiiiii___C',
    'C__CCCCCCCCCCCCCC__C',
    'C__________________C',
    'C_z____CCCCCC____z_C',
    'C__________________C',
    'CCCCCCCCCCOCCCCCCCCC',
  ],
  warps: [{ x: 10, y: 14, to: 'town7', tx: 26, ty: 1, dir: 'down' }, { x: 10, y: 0, to: 'icecave_deep', tx: 9, ty: 13, dir: 'up' }],
  encounters: {
    rate: 0.1,
    tiles: '_',
    table: [['agibuk', 33, 35, 26], ['nunnyang', 33, 35, 20], ['eolpeng', 34, 35, 14], ['wangbingsu', 34, 35, 12], ['bawi', 33, 35, 12], ['seolpyo', 35, 36, 6], ['bingsan', 35, 36, 4], ['heukjang', 33, 35, 6]],
  },
  npcs: [
    { id: 'icski', x: 1, y: 11, dir: 'down', pal: PAL.skier, sight: 3, trainer: tr('icski', '스키어', '눈보라', PAL.skier, [['seolpyo', 40], ['eolpeng', 41]], 2000, '얼음굴은 내 전용 스키장이라고!', '꽈당!', '얼음판에서는 바위에 부딪혀야 멈출 수 있어. 위쪽 굴로 가려면 바위를 잘 이용해 봐.') },
    { id: 'ichiker', x: 18, y: 11, dir: 'down', pal: PAL.hiker, sight: 3, trainer: tr('ichiker', '등산가', '얼음산', PAL.hiker, [['bawi', 40], ['agibuk', 40], ['heukjang', 41]], 2000, '눈보라에 갇혀서 몸이 근질근질했다!', '하하, 몸이 다 풀렸다!', '빙산곰 울음소리가 안쪽에서 계속 들려…') },
    { id: 'lg_seolhwa', x: 12, y: 2, dir: 'down', mon: 'seolhwa', hidden: () => !f('lg_hint_seolhwa') || f('lg_seolhwa'),
      talk: () => legendEncounter('seolhwa', 65, '뿔에 눈꽃이 핀 하얀 사슴이 조용히 이쪽을 바라보고 있다…\n다가가 볼까?', '설화: 히이이잉——!') },
    { id: 'mitten', x: 8, y: 2, dir: 'down', prop: 'ⓜ', hidden: () => f('mitten') || f('iceCaveDone') || f('badge6'), talk: () => mittenTalk() },
    { id: 'icitem1', x: 1, y: 4, dir: 'down', item: { id: 'hyperpotion', qty: 2 } },
    { id: 'icitem2', x: 18, y: 4, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
  ],
};

// ---------------------------------------------------------------------------
// 제7장 — 7번 도로 설원 산길 · 용의 마을 · 용의 둥지 · 용의 체육관(퀴즈)

const route7: MapDef = {
  id: 'route7', name: '7번 도로 설원 산길', ambience: northWeather, edge: 'h',
  tiles: [
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'h`jjjjjj```````h`h`h````````jjjjjj`````h',
    'h`jjjjjj````````````````````jjjjjj`````h',
    'h``````````````````````````````````````h',
    'h▒▒▒▤▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▤▒▒▒▒h',
    'h``````````````````````````▒```````````h',
    'h```````````````````=======▤=====``````h',
    'h```````````````````=``````▒````=``````h',
    '=======`````````````=`jjjj`▒````=```h`hh',
    'h`````=```iiiiiiii``=`jjjj`▒````=``````h',
    'h`jjj`=```iiihiiii``=``````▒````=``````h',
    'h`jjj`=```iiiiiiii``=``````▒````=``````h',
    'h`jjj`=```iiiiiiii``=``````▒````========',
    'h`````=`````````````=``````▒```````S```h',
    'h`````=`````````````=``````▒```````````h',
    'h`````===============``````▒``jjjjjj```h',
    'h``````````````````````````◁``jjjjjj```h',
    'h```````jjjjjjjj``````iiii`◁```````````h',
    'h```````jjjjjjjj``````iiii`◁```````````h',
    'hhh```````````````````iiii`◁```````````h',
    'h``````````````````````````◁```````````h',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  ],
  warps: [
    { x: 39, y: 12, to: 'town7', tx: 1, ty: 11, dir: 'right' },
    { x: 0, y: 8, to: 'town8', tx: 36, ty: 11, dir: 'left' },
  ],
  signs: [{ x: 35, y: 13, text: '7번 도로 설원 산길\n서쪽: 용의 마을   동쪽: 서리마을' }],
  encounters: {
    rate: 0.13, tiles: 'j',
    table: [['agibuk', 34, 36, 14], ['nunnyang', 34, 36, 10], ['seolpyo', 34, 36, 10], ['eolpeng', 34, 36, 10], ['wangbingsu', 34, 36, 8], ['bingsan', 35, 36, 4], ['olppaemi', 34, 36, 10], ['hoeori', 34, 36, 8], ['jangsa', 34, 36, 6], ['geoam', 34, 36, 6], ['jeolgu', 34, 36, 8], ['kkomadorong', 34, 36, 6]],
  },
  npcs: [
    grunt('r7grunt1', 22, 5, 'down', 1, [['beongae', 41], ['dodug', 41]], '먹구름 님의 명령이다! 여기는 못 지나간다!', '으윽, 추운데 졌다…', '여의주의 힘이면 날씨도 마음대로라고! …였는데.'),
    grunt('r7grunt2', 7, 10, 'left', 1, [['geosin', 41], ['meokmul', 42]], '흑영 님이 해산하셨다고? 우린 인정 못 해!', '크윽…', '먹구름 님은 용의 둥지에 계신다.'),
    { id: 'r7ski', x: 15, y: 3, dir: 'down', pal: PAL.skier, sight: 3, trainer: tr('r7s', '스키어', '눈꽃', PAL.skier, [['seolpyo', 41], ['bingsan', 42]], 1900, '설원의 스피드를 보여 주지!', '눈 속에 파묻혔다…', '용의 마을 사람들은 용 몬스터를 정말 아낀대.') },
    { id: 'r7item1', x: 1, y: 1, dir: 'down', item: { id: 'hyperball', qty: 3 } },
    { id: 'r7item2', x: 38, y: 20, dir: 'down', item: { id: 'fullrestore', qty: 2 } },
  ],
};

const den_altar: MapDef = {
  id: 'den_altar', name: '용의 둥지 — 하늘의 제단', dark: true, ambience: 'den', edge: 'C',
  tiles: [
    'CCCCCCCCCCCCCC',
    'CCCC______CCCC',
    'CCC___ⓠ____CCC',
    'CC__________CC',
    'C____________C',
    'C____________C',
    'CC__________CC',
    'CCC________CCC',
    'CCCC______CCCC',
    'CCCCCCC_CCCCCC',
  ],
  warps: [{ x: 7, y: 9, to: 'den', tx: 10, ty: 1, dir: 'down' }],
  npcs: [
    { id: 'pearlaltar', x: 6, y: 2, dir: 'down', prop: () => (f('denDone') ? 'ⓘ' : 'ⓠ'), talk: () => pearlAltar() },
    {
      id: 'lg_cheongryong', x: 8, y: 3, dir: 'left', mon: 'cheongryong', hidden: () => !f('lg_call_cheongryong') || f('lg_cheongryong'),
      talk: () => legendEncounter('cheongryong', 70, '푸른 번개를 두른 용이 제단 위에서 하늘을 올려다보고 있다…\\n다가가 볼까?', '청룡: 쿠르르릉——!'),
    },
    {
      id: 'cloud', x: 7, y: 4, dir: 'down', pal: PAL.cloud, sight: 4, hidden: () => f('denDone'),
      requires: ['dgrunt1', 'dgrunt2'],
      waitText: '먹구름: 부하들은 어쩌고 여기까지 왔지? …녀석들부터 쓰러뜨리고 와라.\\n그래야 상대해 줄 맛이 나지!',
      trainer: tr('cloud', '검은안개단 잔당', '먹구름', PAL.cloud, [['beongae', 43], ['amheuk', 44], ['geosin', 44], ['daewang', 44]], 4500,
        '흑영 님은 약해지셨다. 여의주의 힘으로 하늘을 다스리면 아무도 우릴 막지 못해!\\n방해하는 녀석은 번개로 날려 주마!', '…여의주가, 나를 거부한다…', '…', cloudWin),
    },
  ],
};
const town8: MapDef = {
  id: 'town8', name: '용의 마을',
  tiles: [
    '##################O###################',
    '#...............Ⅻ.ϱ.Ⅻ................#',
    '#ⓛ~~~~ⓛ..........ⅰⅲⅱ............ΓΓΓΓΓ#',
    '#~ⅶⅷ~~~.........ⅳ.ϱ.ⅳ...........ΓΓΓΓΓ#',
    '#~ⅸⅹ~ⓛ~...ΓΓΓΓΓ...ϱ...MMMM......ϜϝDϝϜ#',
    '#~γγ~~~...ΓΓΓΓΓ...ϱ...MMMM........ϱ..#',
    '#ⓛγ~~~~...WwDwW...ϱ...WDwW......ⅵ.ϱ.ⅵ#',
    '#~γ~ⓖ~ⓛ.....ϱ.....ϱ....ϱ..........ϱ..#',
    '#...........ϱϱϱϱϱϱϱϱϱϱϱϱ..........ϱ..#',
    '#ⅴⅴ.ⅴⅴⅴ...BBBB....ϱ....~~~~.......ϱ..#',
    '#ⅴ.ⅴ.ⅴ....BHBB....ϱ....~~~~.J.....ϱ..#',
    '#.........WEwW....ϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱ',
    'ϱϱϱϱϱϱϱϱϱϱϱϱϱϱϱ...ϱ..................#',
    '#..ϱ..............ϱ......ff..........#',
    '#..ϱ......ff......ϱ.............ⅴ.ⅴ.ⅴ#',
    '#ΓΓΓΓΓ............ϱ......,,,,........#',
    '#ΓΓΓΓΓ............ϱ......,,,,...ⅴ.ⅴ.ⅴ#',
    '#ϜϝDϝϜⅵ.................ⓛ~~ⓛ~ⓖ.......#',
    '#..ϱ....................δδδδδδ.......#',
    '#..ϱ....................ⓖ~ⓛ~~ⓛ.......#',
    '#..ϱ......Ⅻ....Ⅻ....Ⅻ....Ⅻ....Ⅻ......#',
    '#..ϱ.................................#',
    '######################################',
  ],
  warps: [
    { x: 34, y: 4, to: 'house8a', tx: 5, ty: 7, dir: 'up' },
    { x: 3, y: 17, to: 'house8b', tx: 5, ty: 7, dir: 'up' },
    { x: 37, y: 11, to: 'route7', tx: 1, ty: 8, dir: 'right' },
    { x: 0, y: 12, to: 'route8', tx: 38, ty: 9, dir: 'left' },
    { x: 18, y: 0, to: 'den', tx: 9, ty: 13, dir: 'up' },
    { x: 12, y: 6, to: 'gym7', tx: 7, ty: 17, dir: 'up' },
    { x: 23, y: 6, to: 'shop9', tx: 4, ty: 6, dir: 'up' },
    { x: 11, y: 11, to: 'center9', tx: 4, ty: 6, dir: 'up' },
  ],
  labels: [ { x: 34, y: 2.2, text: '공예방', color: '#f4f0e0', ink: '#4a3a2a' }, { x: 3, y: 15.2, text: '서당', color: '#f4f0e0', ink: '#4a3a2a' }, { x: 3, y: 2.3, text: '정자', color: '#f4f0e0', ink: '#4a3a2a' },
    { x: 12, y: 9.1, text: '회복소', color: '#ffe0ea', ink: '#c83a6a' },
    { x: 24, y: 4.1, text: '상점', color: '#fff2c8', ink: '#8a5a10' },
    { x: 12.5, y: 4.1, text: '용의 체육관', color: '#e8e0ff', ink: '#4a3a8a' },
    { x: 28.5, y: 9.2, text: '사당', color: '#fff2a8', ink: '#7a5a10' },
  ],
  signs: [],
  encounters: { rate: 0.12, table: [['kkomaryong', 34, 36, 20], ['nalgae', 35, 37, 10], ['hyeonmuk', 34, 36, 12], ['beotkkot', 34, 36, 14], ['wolgung', 34, 36, 10], ['mujigae', 34, 36, 10], ['jangma', 34, 36, 12], ['eungeo', 34, 36, 12], ['kkomadorong', 34, 36, 10]] },
  fishing: [['hyeonmuk', 32, 36, 35], ['eungeo', 34, 37, 45], ['aurora', 34, 37, 20]],
  npcs: [
    { id: 't8poet', x: 2, y: 4, dir: 'down', pal: PAL.oldman, talk: '정자에 앉은 선비: 연못에 비친 달을 보며 시 한 수 짓는 중이라네.\n「용이 잠든 마을에 연꽃이 피니, 하늘도 고요하구나」' },
    { id: 't8jar', x: 33, y: 7, dir: 'down', pal: PAL.granny, move: 'look', talk: '장독대 항아리마다 된장, 간장, 고추장이 익어 간다오.\n용의 마을 장맛은 해솔 지방에서 제일이지.' },
    { id: 't8kid', x: 19, y: 18, dir: 'down', pal: PAL.kid, move: 'wander', talk: '징검다리 건너는 거 무섭지 않아! 꼬마룡이랑 같이 건너면 하나도 안 무서워.' },
    { id: 'elder', x: 27, y: 10, dir: 'right', pal: PAL.elder, talk: () => elderTalk() },
    { id: 't8lady', x: 15, y: 14, dir: 'right', pal: PAL.lady, move: 'wander', talk: '용의 마을 아이들은 꼬마룡과 함께 자란대요.\n체육관의 용 석상은 문제를 낸다던데, 타입 상성을 잘 알아야 한대요!' },
    { id: 'heuk_t8', x: 19, y: 4, dir: 'left', pal: PAL.boss, hidden: () => !f('dragonIntro') || f('denDone'), talk: async () => {
      if (!f('heukHelp')) await denEntranceScene();
      else await say('흑영: 입구는 내가 지키겠다. 서둘러라.');
    } },
  ],
  triggers: [
    { x: 35, y: 11, when: () => !f('dragonIntro'), run: dragonIntroScene },
    { x: 18, y: 4, when: () => f('dragonIntro') && !f('heukHelp'), run: denEntranceScene },
    { x: 12, y: 7, when: () => !f('pearlReturned'), run: pushBack(['체육관 문에 쪽지가 붙어 있다.', '「관장 용하는 여의주를 찾으러 나갔습니다. — 수련생 일동」'], 'down') },
    { x: 1, y: 12, when: () => !f('badge7'), run: pushBack(['서쪽 8번 도로 입구다.', '마을 사람: 여의주가 없어서 서쪽 길에 먹구름이 잔뜩 끼었어.\n지금은 위험해!'], 'right') },
  ],
};

const center9 = makeCenter('center9', '용의 마을 회복소', 'town8', 11, 12, '드래곤 타입은 얼음·드래곤·페어리 기술에 약해.\n용하 관장님께 도전한다면 기억해 둬!');
const shop9 = makeShop('shop9', '용의 마을 상점', 'town8', 23, 7, '해솔 리그에 가기 전 마지막 상점이에요. 넉넉히 챙기세요!');

const den: MapDef = {
  id: 'den', name: '용의 둥지', dark: true, ambience: 'den',
  tiles: [
    'CCCCCCCCCC_CCCCCCCCC',
    'C__________________C',
    'C___z__________z___C',
    'C__________________C',
    'CCCCCCCCC_CCCCCCCCCC',
    'C__________________C',
    'C__________________C',
    'C__CCCCC____CCCCC__C',
    'C__C___C____C___C__C',
    'C__C_z_C____C_z_C__C',
    'C__C___C____C___C__C',
    'C__CCC_C____C_CCC__C',
    'C__________________C',
    'C__________________C',
    'CCCCCCCCCOCCCCCCCCCC',
  ],
  warps: [{ x: 9, y: 14, to: 'town8', tx: 18, ty: 1, dir: 'down' }, { x: 10, y: 0, to: 'den_altar', tx: 7, ty: 8, dir: 'up' }],
  encounters: {
    rate: 0.1, tiles: '_',
    table: [['nalgae', 36, 37, 18], ['dokdae', 36, 37, 12], ['geosin', 36, 37, 10], ['daeji', 36, 37, 10], ['geoam', 36, 37, 10], ['beongae', 36, 37, 10], ['cheonryong', 37, 37, 2], ['hyeonmu', 37, 37, 4], ['dokjeongal', 36, 37, 10], ['kkomaryong', 36, 37, 14]],
  },
  npcs: [
    { id: 'denrock1', x: 9, y: 5, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    { id: 'denrock2', x: 9, y: 6, dir: 'down', boulder: true, talk: '커다란 바위다. 밀어서 움직일 수 있을 것 같다.' },
    grunt('dgrunt1', 2, 12, 'right', 6, [['nalgae', 43], ['amheuk', 43]], '여기까지 왔다고?! 먹구름 님께 가게 둘 순 없지!', '이럴 수가…', '바위를 잘못 밀었으면 둥지를 나갔다 오면 돼. …아, 이걸 왜 알려 줬지.'),
    grunt('dgrunt2', 17, 6, 'left', 5, [['geosin', 43], ['beongae', 43]], '여의주는 우리 거다!', '크으…', '먹구름 님은 저 위에 계셔.'),
    { id: 'yongha_den', x: 4, y: 9, dir: 'down', pal: PAL.yongha, hidden: () => f('denDone'), talk: '관장 용하: 녀석들이 길을 바위로 막아 버렸다.\n아래쪽 바위부터 옆으로 밀어 두고, 위쪽 바위를 밀어 올려라!' },
    { id: 'brz0', x: 2, y: 1, dir: 'down', prop: brazierProp(0), talk: () => brazier(0) },
    { id: 'brz1', x: 5, y: 1, dir: 'down', prop: brazierProp(1), talk: () => brazier(1) },
    { id: 'brz2', x: 7, y: 1, dir: 'down', prop: brazierProp(2), talk: () => brazier(2) },
    { id: 'brz3', x: 13, y: 1, dir: 'down', prop: brazierProp(3), talk: () => brazier(3) },
    { id: 'brz4', x: 16, y: 1, dir: 'down', prop: brazierProp(4), talk: () => brazier(4) },
    { id: 'starmural', x: 18, y: 0, dir: 'down', prop: 'ⓨ', talk: () => starMural() },
    { id: 'altargate', x: 10, y: 1, dir: 'down', barrier: 'stone', hidden: () => altarOpen(), talk: '용의 비늘 무늬가 새겨진 돌문이 굳게 닫혀 있다.\n옆 벽의 별자리 그림과 돌 화로들이 무언가 관련이 있어 보인다.' },
    { id: 'cloudnote', x: 13, y: 12, dir: 'down', prop: 'ⓟ', hidden: () => f('cloudNote'), talk: () => cloudNote() },
    { id: 'denitem1', x: 5, y: 8, dir: 'down', item: { id: 'maxrevive', qty: 1 } },
    { id: 'denitem2', x: 14, y: 10, dir: 'down', item: { id: 'hyperball', qty: 3 } },
  ],
};

const gym7: MapDef = {
  id: 'gym7', name: '용의 체육관', indoor: true,
  tiles: [
    'ϟϟϟϟϟϟϟϟϟϟϟϟϟϟϟϟ',
    'ϟⅴⅫϱϱϱϱϱϱϱϱϱϱⅫⅴϟ',
    'ϟⅴϱϱϱϱϱϱϱϱϱϱϱϱⅴϟ',
    'ϟϟϟϟϟϟϟⅲϟϟϟϟϟϟϟϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟⅳϱϱⅴϱϱϱϱϱϱⅴϱϱⅳϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟϟϟϟϟϟϟϟϟϟϟϟϱϟϟϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟϱⅫϱϱϱϱϱϱϱϱϱⅫϱϱϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟϟϟϱϟϟϟϟϟϟϟϟϟϟϟϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟⅴϱϱϱⅳϱϱϱϱⅳϱϱϱⅴϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟϟϟϟϟϟϟϟϟϱϟϟϟϟϟϟ',
    'ϟϱϱϱϱϱϱϱϱϱϱϱϱϱϱϟ',
    'ϟⅫϱϱϱϱϱϱϱϱϱϱϱϱⅫϟ',
    'ϟϟϟϟϟϟϟeeϟϟϟϟϟϟϟ',
  ],
  warps: [
    { x: 7, y: 18, to: 'town8', tx: 12, ty: 7, dir: 'down' },
    { x: 8, y: 18, to: 'town8', tx: 12, ty: 7, dir: 'down' },
  ],
  npcs: [
    { id: 'gate7d', x: 7, y: 3, dir: 'down', barrier: 'stone', hidden: () => f('quiz4'), talk: '홍살문 아래 돌문이 굳게 닫혀 있다. 용 석상이 마지막 문제를 낼 것 같다.' },
    { id: 'statue4', statue: true, x: 9, y: 4, dir: 'down', mon: 'mireudorong', talk: () => quiz('quiz4', '진짜 마지막 문제!\n천룡님이 여의주로 다스리지 않는 것은?', ['비', '바람', '땅의 흔들림'], 2)() },
    { id: 'g7guide', x: 4, y: 16, dir: 'down', pal: PAL.pupil, talk: '용의 체육관은 네 개의 시험을 통과해야 해.\n층마다 용 석상에게 말을 걸어 문제를 풀면 돌문이 열려!' },
    { id: 'gate7a', x: 9, y: 15, dir: 'down', barrier: 'stone', hidden: () => f('quiz1'), talk: '용의 문이 굳게 닫혀 있다. 옆의 석상에게 말을 걸어 보자.' },
    { id: 'statue1', statue: true, x: 11, y: 16, dir: 'down', mon: 'kkomaryong', talk: () => quiz('quiz1', '첫 번째 문제!\n드래곤 타입 기술이 전혀 통하지 않는 타입은?', ['강철', '페어리', '불'], 1)() },
    { id: 'gate7b', x: 3, y: 11, dir: 'down', barrier: 'stone', hidden: () => f('quiz2'), talk: '용의 문이 굳게 닫혀 있다. 옆의 석상에게 말을 걸어 보자.' },
    { id: 'statue2', statue: true, x: 5, y: 12, dir: 'down', mon: 'nalgae', talk: () => quiz('quiz2', '두 번째 문제!\n드래곤 타입에게 효과가 굉장한 기술 타입은?', ['얼음', '물', '불'], 0)() },
    { id: 'gate7c', x: 12, y: 7, dir: 'down', barrier: 'stone', hidden: () => f('quiz3'), talk: '용의 문이 굳게 닫혀 있다. 옆의 석상에게 말을 걸어 보자.' },
    { id: 'statue3', statue: true, x: 13, y: 8, dir: 'down', mon: 'cheonryong', talk: () => quiz('quiz3', '마지막 문제!\n천룡이 손에 쥐고 있는 보물의 이름은?', ['별빛결정', '여의주', '바다진주'], 1)() },
    { id: 'g7tamer1', x: 14, y: 14, dir: 'left', pal: PAL.yongha, sight: 13, trainer: tr('g7t1', '용사냥꾼', '비늘', PAL.yongha, [['nalgae', 44], ['hyeonmu', 44]], 2000, '용의 시험은 머리와 힘 모두 필요하지!', '훌륭한 판단이다.', '석상의 문제는 타입 상성과 이 마을의 전설에서 나온다.') },
    { id: 'g7tamer2', x: 14, y: 10, dir: 'left', pal: PAL.yongha, sight: 13, trainer: tr('g7t2', '용사냥꾼', '여울', PAL.yongha, [['cheonryong', 44]], 2000, '관장님 앞의 마지막 시험이다!', '용이 고개를 숙였다…', '용하 관장님은 마을 최고의 용 조련사야.') },
    {
      id: 'yongha', requires: ['g7t1', 'g7t2'], waitText: '관장님께 도전하려면 체육관의 트레이너들을 먼저 모두 이겨야 해요.\n시험을 거쳐 온 도전자만 받는 것이 체육관의 규칙이랍니다.', x: 7, y: 1, dir: 'down', pal: PAL.yongha, hidden: () => !f('pearlReturned'),
      trainer: tr('leader7', '관장', '용하', PAL.yongha, [['nalgae', 48], ['eungeo', 48], ['hyeonmu', 49], ['cheonryong', 52]], 5000,
        '용의 시험을 모두 통과했군. 나는 용의 체육관 관장 용하.\n여의주를 되찾아 준 은혜는 잊지 않겠다. 하지만 승부에서는 봐주지 않는다!',
        '…용의 마음을 가진 트레이너로군.', '해솔고원은 8번 도로 너머다.', leader7Win),
    },
  ],
};

// ---------------------------------------------------------------------------
// 8번 도로 → 해솔고원

const route8: MapDef = {
  id: 'route8', name: '8번 도로 용의 협곡',
  tiles: [
    '########################################',
    '#.,,,,,,,,....▓~~~~~~~~~~▓..,,,,,,.....#',
    '#.,,,,,,,,....▓~~~~~~~~~~▓..,,,,,,.....#',
    '#.............▓~~~~~~~~~~▓..........#..#',
    '=====.........▓~~~~~~~~~~▓.............#',
    '#...=.........▓~~~~~~~~~~▓▓▓▓▓▓▓▤▓▓▓▓▓▓#',
    '#▓▓▓▤▓▓▓▽▽▽▽▽▓▓~~~~~~~~~~▓.............#',
    '#...=.........▓~~~~~~~~~~▓.............#',
    '#...=.........▓~~~~~~~~~~▓....S........#',
    '#...==========γγγγγγγγγγγγ==============',
    '#.............▓~~~~~~~~~~▓.............#',
    '#.....,,,,,,,.▓~~~~~~~~~~▓...,,,,,,....#',
    '#.....,,,,,,,.▓~~~~~~~~~~▓...,,,,,,....#',
    '#.............▓~~~~~~~~~~▓.............#',
    '#.............▓~~~~~~~~~~▓▽▽▽▽▽▽▽▽▽▽▤▽▽#',
    '#.#.#.#.......▓~~~~~~~~~~▓.............#',
    '#.............▓~~~~~~~~~~▓..,,,,,,,,...#',
    '#.............▓~~~~~~~~~~▓..,,,,,,,,...#',
    '#.............▓~~~~~~~~~~▓.............#',
    '########################################',
  ],
  warps: [
    { x: 39, y: 9, to: 'town8', tx: 1, ty: 12, dir: 'right' },
    { x: 0, y: 4, to: 'plateau', tx: 20, ty: 11, dir: 'left' },
  ],
  signs: [{ x: 30, y: 8, text: '8번 도로\n서쪽: 해솔고원 · 솔빛마을   동쪽: 용의 마을' }],
  encounters: {
    rate: 0.12,
    table: [['hoeori', 39, 41, 10], ['noejeon', 39, 41, 8], ['jangsa', 39, 41, 8], ['bingsan', 39, 41, 6], ['byeolkkum', 39, 41, 6], ['geosin', 39, 41, 8], ['cheonryong', 40, 41, 2], ['hyeonmu', 39, 41, 6], ['wangbingsu', 39, 41, 8], ['daewang', 39, 41, 8], ['beoseotking', 39, 41, 8], ['wolgung', 39, 41, 8], ['jangseung', 40, 43, 10], ['geumdukeop', 39, 41, 1]],
  },
  fishing: [['eungeo', 36, 39, 50], ['daewang', 37, 39, 30], ['aurora', 36, 39, 20]],
  npcs: [
    { id: 'r8ace1', x: 5, y: 7, dir: 'left', pal: PAL2.ace, sight: 1, trainer: tr('r8a1', '엘리트트레이너', '새봄', PAL2.ace, [['jangsa', 48], ['wolgung', 48], ['geosin', 49]], 2600, '리그 직전의 마지막 관문이다!', '이 실력이면 챔피언도 꿈이 아니겠어.', '해솔고원 회복소에서 꼭 쉬고 가.') },
    { id: 'r8ace2', x: 27, y: 8, dir: 'down', pal: PAL.lady, sight: 1, trainer: tr('r8a2', '엘리트트레이너', '하늬', PAL.lady, [['byeolkkum', 48], ['bingsan', 48], ['cheonryong', 49]], 2600, '배지 일곱 개? 그럼 나도 진심으로 간다!', '정말 강하다…', '챔피언은 요즘 새로 바뀌었다던데?') },
    { id: 'r8item', x: 38, y: 1, dir: 'down', item: { id: 'maxrevive', qty: 2 } },
  ],
};

// ---------------------------------------------------------------------------
// 엔딩 이후 — 천공의 길 · 천공의 신전

const skyroad: MapDef = {
  id: 'skyroad', name: '천공의 길', ambience: 'sky', edge: 'h',
  tiles: [
    'hhhhhhhhh==hhhhhhhhh',
    'h```jjjj`==`jjjj```h',
    'h```jjjj`==`jjjj```h',
    'h``hhhhh`==`hhhhh``h',
    'h``h````````````h``h',
    'h``h`jjjjjjjjjj`h``h',
    'h````jjjjjjjjjj````h',
    'hhhhh``````````hhhhh',
    'h````````hh````````h',
    'h`jjjjj``hh``jjjjj`h',
    'h`jjjjj``hh``jjjjj`h',
    'h``````````````````h',
    'hhhhhhh``````hhhhhhh',
    'h``````````````````h',
    'h`jjjjjjj``jjjjjjj`h',
    'h`jjjjjjj``jjjjjjj`h',
    'h``````````````````h',
    'h``hhhhhhhhhhhhh```h',
    'h```````````````jj`h',
    'h`jjjj``````````jj`h',
    'h`jjjj````hh````jj`h',
    'h`````````hh```````h',
    'hhhhhhhh````hhhhhhhh',
    'h``````````````````h',
    'h`jjjj``````````jjjh',
    'h`jjjj``````````jjjh',
    'h````````==````````h',
    'hhhhhhhhh==hhhhhhhhh',
  ],
  warps: [
    { x: 9, y: 27, to: 'plateau', tx: 20, ty: 1, dir: 'down' },
    { x: 10, y: 27, to: 'plateau', tx: 20, ty: 1, dir: 'down' },
    { x: 9, y: 0, to: 'summit', tx: 7, ty: 10, dir: 'up' },
    { x: 10, y: 0, to: 'summit', tx: 8, ty: 10, dir: 'up' },
  ],
  signs: [],
  encounters: {
    rate: 0.12, tiles: 'j',
    table: [['seolpyo', 52, 58, 12], ['hoeori', 52, 58, 12], ['bingsan', 53, 58, 10], ['geoam', 53, 58, 10], ['wolgung', 53, 58, 10], ['noejeon', 53, 58, 10], ['jangsa', 54, 59, 8], ['byeolkkum', 54, 59, 8], ['daeji', 54, 59, 8], ['eolpeng', 52, 57, 8], ['cheonryong', 56, 60, 4], ['amheuk', 54, 58, 5], ['geumdukeop', 54, 58, 2], ['dolharubang', 54, 58, 4]],
  },
  npcs: [
    { id: 'skychest1', x: 18, y: 9, dir: 'down', prop: chestProp('sky1'), talk: () => chestTalk('sky1', 'maxrevive', 1, 58) },
    { id: 'skychest2', x: 1, y: 23, dir: 'down', prop: chestProp('sky2'), talk: () => chestTalk('sky2', 'fullrestore', 2, 58) },
    { id: 'sky1', x: 9, y: 13, dir: 'down', pal: PAL.monk, sight: 3, trainer: tr('sky1', '천공의 수행자', '바람결', PAL.monk, [['hoeori', 64], ['olppaemi', 64], ['beotkkot', 64], ['cheonryong', 66]], 5200, '이 길은 하늘과 가장 가까운 수행의 길. 각오는 되었나!', '바람이 너의 편이었군…', '정상의 해솔 님은 여섯 가지 다른 힘을 쓰신다.') },
    { id: 'sky2', x: 4, y: 11, dir: 'right', pal: PAL.hiker, sight: 4, trainer: tr('sky2', '천공의 수행자', '무쇠', PAL.hiker, [['geoam', 65], ['jangsa', 65], ['gangjip', 65], ['geosin', 67]], 5400, '단단함이야말로 최고의 힘이다!', '내 무쇠가 부서지다니!', '강철과 땅만으로는 해솔 님께 닿지 못하더군.') },
    { id: 'sky3', x: 15, y: 6, dir: 'left', pal: PAL.skier, sight: 4, trainer: tr('sky3', '천공의 수행자', '서릿발', PAL.skier, [['bingsan', 66], ['seolpyo', 66], ['wangbingsu', 66], ['haeil', 68]], 5600, '구름 위의 냉기를 맛보아라!', '얼음이 녹아내린다…', '천지는 얼음과 페어리 기술을 싫어한다던데.') },
    { id: 'sky4', x: 9, y: 2, dir: 'down', pal: PAL.lady, sight: 2, trainer: tr('sky4', '천공의 수행자', '꿈별', PAL.lady, [['byeolkkum', 67], ['wolgung', 67], ['aurora', 67], ['monggeul', 68]], 5800, '정상 바로 앞이야. 마지막 시험은 나!', '별이 지는구나…', '해솔 님은 위험해지면 만능회복약을 쓰셔. 한 번에 몰아쳐!') },
    { id: 'skyitem1', x: 1, y: 13, dir: 'down', item: { id: 'maxrevive', qty: 2 } },
    { id: 'skyitem2', x: 18, y: 18, dir: 'down', item: { id: 'fullrestore', qty: 2 } },
    { id: 'skyitem3', x: 18, y: 1, dir: 'down', item: { id: 'hyperball', qty: 5 } },
  ],
};

const summit: MapDef = {
  id: 'summit', name: '천공의 신전', ambience: 'sky', edge: 'h',
  tiles: [
    'hhhhhhhhhhhhhhhh',
    'h``````````````h',
    'h``````````````h',
    'h``````````````h',
    'h``````==``````h',
    'h``````==``````h',
    'h``````==``````h',
    'h``````==``````h',
    'h``````==``````h',
    'h``````==``````h',
    'h``````==``````h',
    'hhhhhhh==hhhhhhh',
  ],
  warps: [
    { x: 7, y: 11, to: 'skyroad', tx: 9, ty: 1, dir: 'down' },
    { x: 8, y: 11, to: 'skyroad', tx: 10, ty: 1, dir: 'down' },
  ],
  signs: [],
  npcs: [
    { id: 'sumstatue1', x: 4, y: 4, dir: 'down', statue: true, mon: 'cheonryong', talk: '하늘을 나는 용의 석상이다. 구름 사이로 은은한 빛이 감돈다.' },
    { id: 'sumstatue2', x: 11, y: 4, dir: 'down', statue: true, mon: 'eunha', talk: '은하고래의 석상이다. 별빛이 새겨져 있다.' },
    { id: 'haesol', x: 7, y: 3, dir: 'down', pal: PAL.haesol, talk: () => haesolTalk() },
    { id: 'cheonji', x: 8, y: 1, dir: 'down', mon: 'cheonji', hidden: () => !f('haesolWin') || f('cheonjiCaught'), talk: () => cheonjiTalk() },
    { id: 'summonk', x: 3, y: 8, dir: 'right', pal: PAL.monk, talk: () => summitMonk() },
  ],
  triggers: [7, 8].map((x) => ({ x, y: 5, when: () => !f('haesolMet'), run: haesolMeet })),
};

const house1a: MapDef = {
  id: 'house1a', name: '솔빛마을 이웃집', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱㅀㄱㄾㄱㄱㅬㄱㄱㄱㅀㄱ',
    'ㄱㄿoooooooㅨbㄱ',
    'ㄱooㆅㆅoㆆooooㄱ',
    'ㄱooㆅㆅoooTToㄱ',
    'ㄱooooooooooㄱ',
    'ㄱㅨooooooooㄿㄱ',
    'ㄱooooooooooㄱ',
    'ㄱㄱㄱㄱㄱeeㄱㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town1', tx: 30, ty: 6, dir: 'down' },
    { x: 6, y: 8, to: 'town1', tx: 30, ty: 6, dir: 'down' },
  ],
  npcs: [
    { id: 'h1a_grandpa', x: 3, y: 2, dir: 'down', pal: PAL.oldman, talk: '이웃 할아버지: 마을 서쪽 풍차는 내가 젊을 때 직접 세운 거라네.\n바람이 좋은 날엔 날개가 하루 종일 돌아가지.' },
    { id: 'h1a_kid', x: 8, y: 6, dir: 'left', pal: PAL.kid, move: 'wander', talk: '할아버지 밭에서 딴 감자, 진짜 맛있어!\n나중에 크면 나도 몬스터랑 같이 농사지을 거야.' },
    { id: 'h1a_item', x: 9, y: 3, dir: 'down', item: { id: 'potion', qty: 3 } },
  ],
};

const house1b: MapDef = {
  id: 'house1b', name: '솔빛 마을회관', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱkkㄱㆀㄱㄱㆀㄱㅾㄱㄱ',
    'ㄱoooooooooㆂㄱ',
    'ㄱooㅿㅿㅿㅿㅿㅿooㄱ',
    'ㄱooooooooooㄱ',
    'ㄱㅨoㆅㆅooㆅㆅoㅨㄱ',
    'ㄱooooooooooㄱ',
    'ㄱooooooooooㄱ',
    'ㄱㄱㄱㄱㄱeeㄱㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town1', tx: 4, ty: 21, dir: 'down' },
    { x: 6, y: 8, to: 'town1', tx: 4, ty: 21, dir: 'down' },
  ],
  npcs: [
    { id: 'h1b_chief', x: 5, y: 2, dir: 'down', pal: PAL.elder, quest: questReady.h1b_chief, talk: () => chiefTalk() },
    { id: 'h1b_board', x: 9, y: 1, dir: 'down', prop: 'ㅾ', talk: '마을 게시판\n「몬스터가 기절하면 회복소에서 쉬게 해 주세요」\n「풀숲이 깊을수록 다른 몬스터가 나와요」' },
    { id: 'h1b_lady', x: 2, y: 5, dir: 'right', pal: PAL.lady, talk: '요즘 동쪽 해솔고원 쪽에서 별똥별이 자주 떨어진대요.\n소원 빌어 봤어요?' },
  ],
};

const house2a: MapDef = {
  id: 'house2a', name: '들꽃마을 온실', indoor: true,
  tiles: [
    'ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ',
    'ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ',
    'ㄷㅪㅪㅪㅋㅋㅋㅋㅪㅪㅪㄷ',
    'ㄷㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㄷ',
    'ㄷㅪㅪㅋㅋㅩㅩㅋㅋㅪㅪㄷ',
    'ㄷㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㄷ',
    'ㄷㅨㅋㅋㅋㅋㅋㅋㅋㅋㅨㄷ',
    'ㄷㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㄷ',
    'ㄷㄷㄷㄷㄷeeㄷㄷㄷㄷㄷ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town2', tx: 3, ty: 6, dir: 'down' },
    { x: 6, y: 8, to: 'town2', tx: 3, ty: 6, dir: 'down' },
  ],
  npcs: [
    { id: 'h2a_botanist', x: 5, y: 3, dir: 'down', pal: PAL.birder, talk: '식물학자: 이 온실에선 사계절 내내 꽃이 피어요.\n풀 타입 몬스터들이 햇볕 쬐러 자주 놀러 온답니다.' },
    { id: 'h2a_item', x: 8, y: 5, dir: 'down', item: { id: 'superpotion', qty: 2 } },
    { id: 'h2a_mon', x: 2, y: 3, dir: 'down', mon: 'kkotip', talk: '꽃잎새가 꽃 사이를 기분 좋게 폴짝폴짝 뛰어다닌다.' },
  ],
};

const house2b: MapDef = {
  id: 'house2b', name: '들꽃마을 꽃집', indoor: true,
  tiles: [
    'ㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸ',
    'ㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸㄸ',
    'ㄸㅥooㅦㅦㅦㅦooㅥㄸ',
    'ㄸㅥooooooooㅥㄸ',
    'ㄸooooooooooㄸ',
    'ㄸㅧooㆅㆅooooㅧㄸ',
    'ㄸㅨooooooooㅥㄸ',
    'ㄸooooooooooㄸ',
    'ㄸㄸㄸㄸㄸeeㄸㄸㄸㄸㄸ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town2', tx: 30, ty: 6, dir: 'down' },
    { x: 6, y: 8, to: 'town2', tx: 30, ty: 6, dir: 'down' },
  ],
  npcs: [
    { id: 'h2b_florist', x: 5, y: 3, dir: 'down', pal: PAL.girl, quest: questReady.h2b_florist, talk: () => floristTalk() },
    { id: 'h2b_old', x: 9, y: 5, dir: 'left', pal: PAL.granny, talk: '꽃말 알려 줄까? 해바라기는 「기다림」, 들국화는 「소박한 행복」.\n몬스터와 함께하는 하루하루가 꼭 들국화 같지.' },
  ],
};

const house3a: MapDef = {
  id: 'house3a', name: '어부의 집', indoor: true,
  tiles: [
    'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
    'ㅇㅗㅇㅘㅇㅇㅇㅞㅇㅗㅇㅇ',
    'ㅇㅙㅙㅃㅃㅃㅃㅃㅃㅃbㅇ',
    'ㅇㅃㅃㅃㅃㅚㅚㅃㅃㅃㅃㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅝㅃㅃㆃㆃㅃㅃㅃㅃㅙㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅇㅇㅇㅇeeㅇㅇㅇㅇㅇ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town3', tx: 32, ty: 4, dir: 'down' },
    { x: 6, y: 8, to: 'town3', tx: 32, ty: 4, dir: 'down' },
  ],
  npcs: [
    { id: 'h3a_fisher', x: 4, y: 2, dir: 'down', pal: PAL.fisher, quest: questReady.h3a_fisher, talk: () => oldFisherTalk() },
    { id: 'h3a_wife', x: 8, y: 4, dir: 'left', pal: PAL.lady, talk: '우리 집은 물 위에 지어서 밤에는 물소리를 들으며 자요.\n가끔 물귀신이 창문을 두드린다던데… 농담이에요!' },
    { id: 'h3a_item', x: 1, y: 4, dir: 'down', item: { id: 'superball', qty: 3 } },
  ],
};

const house3b: MapDef = {
  id: 'house3b', name: '안개 찻집', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱㅬㄱㄱㅬㄱㄱㅬㄱㄱㅬㄱ',
    'ㄱㅫㅫㅫㅌㅌㅌㅌㅌㅌㅨㄱ',
    'ㄱㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㄱ',
    'ㄱㄺㄶㄺㅌㅌㅌㄺㄶㄺㅌㄱ',
    'ㄱㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㄱ',
    'ㄱㄺㄶㄺㅌㅌㅌㄺㄶㄺㅌㄱ',
    'ㄱㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㄱ',
    'ㄱㄱㄱㄱㄱeeㄱㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town3', tx: 3, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town3', tx: 3, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h3b_owner', x: 4, y: 2, dir: 'down', pal: PAL.granny, talk: '찻집 주인: 안개가 걷힐 때까지 차 한잔 하고 가요.\n…몬스터들도 따뜻한 걸 마시면 기운이 난답니다.', },
    { id: 'h3b_guest', x: 1, y: 4, dir: 'right', pal: PAL.man, talk: '이 찻집 창문으로 보면 습지 징검다리가 안개 속에 둥둥 떠 있는 것 같아.\n그림 그리러 매일 온다네.' },
    { id: 'h3b_guest2', x: 9, y: 6, dir: 'left', pal: PAL.swimmer, talk: '마루 관장님 체육관 바닥이 물웅덩이투성이라서\n수영 연습 삼아 매일 가요!' },
  ],
};

const house4a: MapDef = {
  id: 'house4a', name: '별빛 천문대', indoor: true,
  tiles: [
    'ㅂㅂㅂㅂㅂㅂㅂㅂㅂㅂㅂㅂ',
    'ㅂㅠㅂㅂㅠㅂㅂㅂㅠㅂㅂㅂ',
    'ㅂkkㅍㅍㅍㅍㅍㅍㅍㅍㅂ',
    'ㅂㅍㅍㅍㆈㆈㅍㅍㅍㅍㅍㅂ',
    'ㅂㅡㅍㅍㅍㅍㅍㆉㆉㅍㅍㅂ',
    'ㅂㅍㅍㅍㅍㅍㅍㆉㆉㅍㅍㅂ',
    'ㅂㅍㅍㅍㅍㅍㅍㅍㅍㅍㅍㅂ',
    'ㅂㅍㅍㅍㅍㅍㅍㅍㅍㅍㅍㅂ',
    'ㅂㅂㅂㅂㅂeeㅂㅂㅂㅂㅂ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town4', tx: 2, ty: 4, dir: 'down' },
    { x: 6, y: 8, to: 'town4', tx: 2, ty: 4, dir: 'down' },
  ],
  npcs: [
    { id: 'h4a_astro', x: 5, y: 2, dir: 'down', pal: PAL.prof, quest: questReady.h4a_astro, talk: () => astronomerTalk() },
    { id: 'h4a_scope', x: 9, y: 2, dir: 'down', prop: 'ㅟ', talk: '망원경을 들여다보았다… 용의 모양을 한 별자리가 보인다.\n머리, 심장, 꼬리에 유난히 밝은 별이 박혀 있다.' },
    { id: 'h4a_kid', x: 2, y: 5, dir: 'right', pal: PAL.kid, talk: '은하고래가 밤하늘을 헤엄치면 별비가 내린대!\n천문학자 아저씨는 그걸 꼭 한번 보고 싶대.' },
  ],
};

const house4b: MapDef = {
  id: 'house4b', name: '별빛 트레이너 학원', indoor: true,
  tiles: [
    'ㄲㄲㄲㄲㄲㄲㄲㄲㄲㄲㄲㄲ',
    'ㄲkkㄲㅢㅢㅢㅢㄲㄵㄲㄲ',
    'ㄲooooㄳoooooㄲ',
    'ㄲooooooooooㄲ',
    'ㄲoㅣoㅣooㅣoㅣoㄲ',
    'ㄲooooooooooㄲ',
    'ㄲoㅣoㅣooㅣoㅣoㄲ',
    'ㄲooooooooooㄲ',
    'ㄲㄲㄲㄲㄲeeㄲㄲㄲㄲㄲ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town4', tx: 31, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town4', tx: 31, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h4b_teacher', x: 6, y: 2, dir: 'down', pal: PAL.man, talk: '강사: 오늘의 수업! 같은 타입의 기술을 쓰면 위력이 1.5배가 된단다.\n몬스터와 같은 타입의 기술을 하나쯤은 꼭 익혀 두렴.' },
    { id: 'h4b_s1', x: 2, y: 5, dir: 'up', pal: PAL.pupil, talk: '학생: 상태 이상은 확률로 걸리고, 이미 다른 상태 이상이면 안 걸린대요.\n노트에 적어 둬야지.' },
    { id: 'h4b_s2', x: 9, y: 5, dir: 'up', pal: PAL.girl, talk: '학생: 기술사탕이랑 기술단지로 PP를 회복할 수 있어요!\n긴 동굴 들어가기 전엔 꼭 챙기래요.' },
    { id: 'h4b_board', x: 5, y: 1, dir: 'down', prop: 'ㅢ', talk: '칠판: 「불 → 풀·얼음·벌레·강철에 강함」 「물 → 불·땅·바위에 강함」\n「전기 → 물·비행에 강함, 땅에는 통하지 않음」' },
  ],
};

const house5a: MapDef = {
  id: 'house5a', name: '등대지기의 집', indoor: true,
  tiles: [
    'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
    'ㅇㅛㅇㅇㅞㅇㅇㅇㅇㅛㅇㅇ',
    'ㅇㅜㅃㅃㅃㅃㅃㅃㅃㅃbㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅃㅃㆃㆃㅃㅃㅃㅃㅃㅝㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅙㅃㅃㅃㅃㅃㅃㅃㅃㅜㅇ',
    'ㅇㅃㅃㅃㅃㅃㅃㅃㅃㅃㅃㅇ',
    'ㅇㅇㅇㅇㅇeeㅇㅇㅇㅇㅇ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town5', tx: 38, ty: 9, dir: 'down' },
    { x: 6, y: 8, to: 'town5', tx: 38, ty: 9, dir: 'down' },
  ],
  npcs: [
    { id: 'h5a_keeper', x: 5, y: 2, dir: 'down', pal: PAL.captain, quest: questReady.h5a_keeper, talk: () => lighthouseTalk() },
    { id: 'h5a_log', x: 7, y: 2, dir: 'down', prop: '(', talk: '등대 일지가 펼쳐져 있다.\n「오늘도 바다는 조용함. 남쪽 부두 너머로 낡은 배 한 척이 보임.」' },
    { id: 'h5a_item', x: 2, y: 5, dir: 'down', item: { id: 'hyperpotion', qty: 1 } },
  ],
};

const house5b: MapDef = {
  id: 'house5b', name: '파도 식당', indoor: true,
  tiles: [
    'ㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅ',
    'ㅅㅯㅅㅅㅅㅅㅅㅅㅅㅯㅅㅅ',
    'ㅅㅭㅭㅦㅆㅆㅆㅆㅆㅮㅮㅅ',
    'ㅅㅆㅆㅆㅆㅆㅆㅆㅆㅆㅆㅅ',
    'ㅅㅆㆃㆃㅆㅆㅆㆃㆃㅆㅆㅅ',
    'ㅅㅆㅆㅆㅆㅆㅆㅆㅆㅆㅆㅅ',
    'ㅅㅆㆃㆃㅆㅆㅆㆃㆃㅆㅆㅅ',
    'ㅅㅆㅆㅆㅆㅆㅆㅆㅆㅆㅆㅅ',
    'ㅅㅅㅅㅅㅅeeㅅㅅㅅㅅㅅ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town5', tx: 38, ty: 4, dir: 'down' },
    { x: 6, y: 8, to: 'town5', tx: 38, ty: 4, dir: 'down' },
  ],
  npcs: [
    { id: 'h5b_cook', x: 4, y: 2, dir: 'down', pal: PAL.clerk, talk: '주방장: 오늘의 메뉴는 먹물 듬뿍 해물 볶음밥!\n…아, 먹물이는 안 넣었어요. 진짜예요.' },
    { id: 'h5b_sailor', x: 1, y: 4, dir: 'right', pal: PAL2.sailor, talk: '뱃사람: 바다 몬스터는 대개 전기 기술에 약하지.\n그래서 우리 배엔 늘 찌릿이 한 마리가 같이 탄다네.' },
    { id: 'h5b_sailor2', x: 9, y: 4, dir: 'left', pal: PAL2.surfer, talk: '서핑하다 배고파서 왔어! 파도항구 앞바다는 파도가 딱 좋아.' },
  ],
};

const house6a: MapDef = {
  id: 'house6a', name: '불꽃 대장간', indoor: true,
  tiles: [
    'ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ',
    'ㄴㅓㄴㄴㄴㅖㄴㄴㅓㄴㅖㄴ',
    'ㄴㅏㅐㅊㅊㅊㅊㅊㅔㅔㅒㄴ',
    'ㄴㅊㅊㅊㅊㅊㅊㅊㅊㅊㅊㄴ',
    'ㄴㅊㅊㅊㅊㅊㅊㅊㅊㅊㅊㄴ',
    'ㄴㅊㅊㅊㅊㅊㅊㅕㅊㅊㅙㄴ',
    'ㄴㅙㅊㅊㅊㅊㅊㅊㅊㅊㅊㄴ',
    'ㄴㅊㅊㅊㅊㅊㅊㅊㅊㅊㅊㄴ',
    'ㄴㄴㄴㄴㄴeeㄴㄴㄴㄴㄴ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town6', tx: 3, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town6', tx: 3, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h6a_smith', x: 4, y: 3, dir: 'down', pal: PAL.hiker, quest: questReady.h6a_smith, talk: () => smithTalk() },
    { id: 'h6a_anvil', x: 3, y: 4, dir: 'down', prop: 'ㅑ', talk: '모루 위에서 쇳덩이가 벌겋게 달아올라 있다. 뜨거워서 만질 수 없다.' },
    { id: 'h6a_apprentice', x: 8, y: 6, dir: 'left', pal: PAL.kid, talk: '견습생: 사부님은 흑영이란 사람이 어릴 때 이 마을에 자주 왔었대요.\n숯골에서 온 아이였다나…' },
  ],
};

const house6b: MapDef = {
  id: 'house6b', name: '불꽃 온천장', indoor: true,
  tiles: [
    'ㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅㅅ',
    'ㅅㅱㅅㅅㅅㅅㅅㅅㅅㅱㅅㅅ',
    'ㅅㅰㅎㅎㅎㅎㅎㅎㅎㅎㅰㅅ',
    'ㅅㅎⅤⅤⅤㅎㅎⅤⅤⅤㅎㅅ',
    'ㅅㅎⅤⅤⅤㅎㅎⅤⅤⅤㅎㅅ',
    'ㅅㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅅ',
    'ㅅㅲㅎㅎㅎㅎㅎㅎㅎㅎㅲㅅ',
    'ㅅㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅅ',
    'ㅅㅅㅅㅅㅅeeㅅㅅㅅㅅㅅ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town6', tx: 31, ty: 4, dir: 'down' },
    { x: 6, y: 8, to: 'town6', tx: 31, ty: 4, dir: 'down' },
  ],
  npcs: [
    { id: 'h6b_owner', x: 5, y: 2, dir: 'down', pal: PAL.lady, talk: async () => {
      await say('온천장 주인: 어서 오세요! 불꽃산 온천물로 데운 탕이에요.\n동료들도 푹 쉬고 가세요.');
      await healParty();
      await say('동료들이 모두 기운을 되찾았다!');
    } },
    { id: 'h6b_guest', x: 10, y: 5, dir: 'left', pal: PAL.oldman, talk: '어이구 시원하다~ 화산 덕분에 이 마을 온천은 일 년 내내 뜨끈하다네.\n가끔 숯돌이가 몰래 들어와서 몸을 녹이고 가지.' },
  ],
};

const house7a: MapDef = {
  id: 'house7a', name: '서리 얼음 공방', indoor: true,
  tiles: [
    'ㅈㅈㅈㅈㅈㅈㅈㅈㅈㅈㅈㅈ',
    'ㅈㅵㅈㅈㅈㅵㅈㅈㅈㅈㅵㅈ',
    'ㅈㅳㅳㅉㅉㅉㅉㅉㅉㅴㅴㅈ',
    'ㅈㅳㅉㅉㅉㅉㅉㅉㅉㅉㅉㅈ',
    'ㅈㅉㅉㅉㅉㅉㅉㅉㅉㅉㅉㅈ',
    'ㅈㅉㅉㅉㅉㅉㅉㅉㅉㅉㅉㅈ',
    'ㅈㅳㅉㅉㅉㅉㅉㅉㅉㅉㅴㅈ',
    'ㅈㅉㅉㅉㅉㅉㅉㅉㅉㅉㅉㅈ',
    'ㅈㅈㅈㅈㅈeeㅈㅈㅈㅈㅈ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town7', tx: 3, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town7', tx: 3, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h7a_sculptor', x: 5, y: 3, dir: 'down', pal: PAL.seori, talk: '얼음 조각가: 마을 남쪽 조각 정원은 전부 내 작품이야.\n눈꽃 뿔을 가진 하얀 사슴, 설화를 새기는 게 평생의 꿈이지.' },
    { id: 'h7a_piece', x: 7, y: 4, dir: 'down', prop: 'ㅴ', talk: '만들다 만 얼음 조각이다. 날개를 펼친 새의 모습 같다.' },
    { id: 'h7a_item', x: 2, y: 6, dir: 'down', item: { id: 'ppjar', qty: 1 } },
  ],
};

const house7b: MapDef = {
  id: 'house7b', name: '눈꽃 코코아 찻집', indoor: true,
  tiles: [
    'ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ',
    'ㄱㅸㄱㄱㄾㄱㄱㄱㅸㄱㅸㄱ',
    'ㄱㅶㅶㅶooooooㅨㄱ',
    'ㄱoooㅹㅹoooooㄱ',
    'ㄱoTToㅹㅹoTToㄱ',
    'ㄱooooooooooㄱ',
    'ㄱooooooooooㄱ',
    'ㄱㅨoooooooooㄱ',
    'ㄱㄱㄱㄱㄱeeㄱㄱㄱㄱㄱ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town7', tx: 31, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town7', tx: 31, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h7b_owner', x: 2, y: 3, dir: 'down', pal: PAL.lady, talk: '찻집 주인: 눈보라를 뚫고 오셨군요! 따뜻한 코코아 한 잔 드릴게요.\n…상점에선 안 판다던 핫초코, 사실 여기서 팔아요.' },
    { id: 'h7b_skater', x: 1, y: 5, dir: 'right', pal: PAL.skier, talk: '남쪽 스케이트장은 한번 미끄러지면 멈출 수가 없어!\n가장자리 눈밭에 닿아야 서는 거, 체육관 바닥이랑 똑같지?' },
    { id: 'h7b_kid', x: 9, y: 5, dir: 'left', pal: PAL.kid, talk: '눈송이: 아기북곰이 코코아를 엄청 좋아해!\n빙산곰도 사실은 단 걸 좋아한대.' },
  ],
};

const house8a: MapDef = {
  id: 'house8a', name: '용 비늘 공예방', indoor: true,
  tiles: [
    'ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ',
    'ㅁㅻㅁㅁㅻㅁㅁㅻㅁㅁㅻㅁ',
    'ㅁㅺㅺㅌㅌㅌㅌㅌㅌㅌㅺㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅼㅌㅌㅽㅽㅌㅌㅌㅌㅼㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅁㅁㅁㅁeeㅁㅁㅁㅁㅁ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town8', tx: 34, ty: 5, dir: 'down' },
    { x: 6, y: 8, to: 'town8', tx: 34, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'h8a_artisan', x: 5, y: 3, dir: 'down', pal: PAL.yongha, talk: '공예 장인: 꼬마룡이 허물을 벗을 때 떨어진 비늘로 장신구를 만든다네.\n비늘 한 장 한 장에 하늘빛이 담겨 있지.' },
    { id: 'h8a_work', x: 9, y: 2, dir: 'down', prop: 'ㅺ', talk: '작업대 위에 푸른 비늘로 만든 노리개가 놓여 있다. 은은하게 반짝인다.' },
    { id: 'h8a_item', x: 2, y: 6, dir: 'down', item: { id: 'pphoney', qty: 1 } },
  ],
};

const house8b: MapDef = {
  id: 'house8b', name: '용의 마을 서당', indoor: true,
  tiles: [
    'ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ',
    'ㅁkkㅁㄼㄼㄼㅁㄻㅁㄻㅁ',
    'ㅁㅌㅌㅌㅌㄽㅌㅌㅌㅌㅌㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅌㄶㅌㄶㅌㅌㄶㅌㄶㅌㅁ',
    'ㅁㅌㄺㅌㄺㅌㅌㄺㅌㄺㅌㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅌㅌㅌㅌㅌㅌㅌㅌㅌㅌㅁ',
    'ㅁㅁㅁㅁㅁeeㅁㅁㅁㅁㅁ',
  ],
  warps: [
    { x: 5, y: 8, to: 'town8', tx: 3, ty: 18, dir: 'down' },
    { x: 6, y: 8, to: 'town8', tx: 3, ty: 18, dir: 'down' },
  ],
  npcs: [
    { id: 'h8b_teacher', x: 5, y: 3, dir: 'down', pal: PAL.elder, quest: questReady.h8b_teacher, talk: () => seodangTalk() },
    { id: 'h8b_s1', x: 2, y: 5, dir: 'up', pal: PAL.pupil, talk: '학동: 여의주가 사라지면 북쪽에 눈보라가 그치지 않는대요.\n서리마을이 그래서 그렇게 추웠던 거래요!' },
    { id: 'h8b_s2', x: 9, y: 5, dir: 'up', pal: PAL.kid, talk: '학동: 용 석상 수수께끼 정답, 나는 다 외웠어!\n…타입 상성만 알면 쉬워.' },
  ],
};

export const MAPS: Record<string, MapDef> = {
  house8b,
  house8a,
  house7b,
  house7a,
  house6b,
  house6a,
  house5b,
  house5a,
  house4b,
  house4a,
  house3b,
  house3a,
  house2b,
  house2a,
  house1b,
  house1a,
  home, town1, lab, route1, town2, center, shop, dojo,
  route2, forest, forest_grove, forest_tree, town3, center3, shop3, gym2,
  route3, cave, town4, center4, shop4, antique, gym3, peak, pastel,
  route4, town5, center5, shop5, safarigate, safari, safari_fire, safari_canyon, safari_fairy, safari_special, safari_ice, safari_water, safari_jungle, ship, ship_cabins, ship_ballroom, ship_engine, ship_bridge, ship_ghost, gym4, route5, town6, center6, shop6, gym5, volcano, volcano_forge, volcano_heart, route6, plateau, center7, league,
  town7, center8, shop8, gym6, icecave, icecave_deep, skyroad, summit, route7, town8, center9, shop9, den, den_altar, gym7, route8,
};

// Validate map rows and warp targets in development.
for (const m of Object.values(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) console.error(`map ${m.id} row ${y} has width ${row.length}, expected ${w}`);
  });
  for (const wp of m.warps) if (!MAPS[wp.to]) console.error(`map ${m.id} warps to unknown ${wp.to}`);
}
