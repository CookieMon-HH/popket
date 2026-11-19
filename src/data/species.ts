import type { MonType } from './types';

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spe: number;
}

export interface SpeciesDef {
  id: string;
  no: number;
  name: string;
  types: MonType[];
  base: Stats;
  catchRate: number;
  baseExp: number;
  evolve?: { level: number; to: string };
  learnset: [number, string][];
  kind: string;
  desc: string;
}

const MODAK_MOVES: [number, string][] = [
  [1, 'scratch'], [1, 'growl'], [6, 'ember'], [10, 'focus'], [13, 'dash'], [17, 'flamedash'], [25, 'press'], [30, 'firestorm'],
];
const PONG_MOVES: [number, string][] = [
  [1, 'tackle'], [1, 'glare'], [6, 'splash'], [9, 'bubble'], [13, 'curl'], [17, 'wave'], [25, 'press'], [30, 'tide'],
];
const SAESUN_MOVES: [number, string][] = [
  [1, 'tackle'], [1, 'growl'], [6, 'vine'], [9, 'absorb'], [12, 'sleeppowder'], [16, 'leafcut'], [24, 'press'], [30, 'bloom'],
];
const TOSIL_MOVES: [number, string][] = [
  [1, 'tackle'], [3, 'glare'], [7, 'dash'], [12, 'focus'], [17, 'press'],
];
const JJAEK_MOVES: [number, string][] = [
  [1, 'peck'], [3, 'growl'], [7, 'gust'], [12, 'dash'], [18, 'wingcut'], [27, 'dive'],
];
const KKOMUL_MOVES: [number, string][] = [
  [1, 'tackle'], [1, 'silk'], [5, 'sting'], [9, 'gust'], [12, 'sleeppowder'], [15, 'bugbite'], [19, 'glitter'],
];
const JJIRIT_MOVES: [number, string][] = [
  [1, 'zap'], [1, 'glare'], [6, 'paralyze'], [11, 'dash'], [16, 'bolt'],
];
const DOLDOL_MOVES: [number, string][] = [
  [1, 'tackle'], [1, 'curl'], [6, 'pebble'], [11, 'glare'], [15, 'rockdrop'], [22, 'press'],
];

const list: SpeciesDef[] = [
  {
    id: 'modak', no: 1, name: '모닥이', types: ['불'], base: { hp: 44, atk: 56, def: 42, spe: 58 },
    catchRate: 45, baseExp: 62, evolve: { level: 14, to: 'hwaro' }, learnset: MODAK_MOVES,
    kind: '불씨곰', desc: '머리 위의 불꽃은 기분이 좋으면 크게 타오른다. 추운 밤에는 친구들과 붙어서 잔다.',
  },
  {
    id: 'hwaro', no: 2, name: '화로곰', types: ['불'], base: { hp: 68, atk: 84, def: 64, spe: 74 },
    catchRate: 45, baseExp: 142, learnset: MODAK_MOVES,
    kind: '화로곰', desc: '등에 세 갈래의 불꽃이 타오른다. 겨울 산에서 길 잃은 사람을 따뜻하게 지켜 준다고 한다.',
  },
  {
    id: 'pong', no: 3, name: '퐁당이', types: ['물'], base: { hp: 48, atk: 48, def: 56, spe: 48 },
    catchRate: 45, baseExp: 63, evolve: { level: 14, to: 'mulbora' }, learnset: PONG_MOVES,
    kind: '물방울물범', desc: '이마의 물방울 볏으로 물의 온도를 느낀다. 미끄럼 타기를 아주 좋아한다.',
  },
  {
    id: 'mulbora', no: 4, name: '물보라', types: ['물'], base: { hp: 76, atk: 70, def: 82, spe: 66 },
    catchRate: 45, baseExp: 143, learnset: PONG_MOVES,
    kind: '파도물범', desc: '파도 모양의 갈기를 휘날리며 헤엄친다. 꼬리 한 번으로 작은 파도를 일으킨다.',
  },
  {
    id: 'saesun', no: 5, name: '새순이', types: ['풀'], base: { hp: 50, atk: 50, def: 52, spe: 46 },
    catchRate: 45, baseExp: 64, evolve: { level: 14, to: 'kkot' }, learnset: SAESUN_MOVES,
    kind: '새싹', desc: '햇볕을 쬐면 머리의 새싹이 쑥쑥 자란다. 비 오는 날에는 신이 나서 뛰어다닌다.',
  },
  {
    id: 'kkot', no: 6, name: '꽃덤불', types: ['풀'], base: { hp: 78, atk: 72, def: 78, spe: 58 },
    catchRate: 45, baseExp: 142, learnset: SAESUN_MOVES,
    kind: '꽃덤불', desc: '머리의 꽃이 피면 달콤한 향기가 숲에 퍼진다. 그 향기를 맡으면 마음이 편안해진다.',
  },
  {
    id: 'tosil', no: 7, name: '토실이', types: ['노말'], base: { hp: 50, atk: 44, def: 40, spe: 52 },
    catchRate: 255, baseExp: 50, evolve: { level: 15, to: 'tongsil' }, learnset: TOSIL_MOVES,
    kind: '볼주머니', desc: '양 볼에 씨앗을 잔뜩 넣고 다닌다. 놀라면 씨앗을 우르르 쏟아 버린다.',
  },
  {
    id: 'tongsil', no: 8, name: '통실이', types: ['노말'], base: { hp: 82, atk: 72, def: 62, spe: 72 },
    catchRate: 127, baseExp: 120, learnset: TOSIL_MOVES,
    kind: '볼주머니', desc: '복슬복슬한 꼬리로 몸의 균형을 잡는다. 겨울을 대비해 굴에 먹이를 산더미처럼 모은다.',
  },
  {
    id: 'jjaek', no: 9, name: '짹짹이', types: ['노말', '바람'], base: { hp: 40, atk: 45, def: 38, spe: 62 },
    catchRate: 255, baseExp: 50, evolve: { level: 16, to: 'hoeori' }, learnset: JJAEK_MOVES,
    kind: '꼬마새', desc: '아침마다 큰 소리로 지저귄다. 무리 지어 다니며 서로의 깃털을 다듬어 준다.',
  },
  {
    id: 'hoeori', no: 10, name: '회오리매', types: ['노말', '바람'], base: { hp: 66, atk: 74, def: 60, spe: 90 },
    catchRate: 90, baseExp: 130, learnset: JJAEK_MOVES,
    kind: '돌개바람', desc: '날갯짓 한 번에 회오리를 일으킨다. 아주 먼 곳의 먹잇감도 놓치지 않는다.',
  },
  {
    id: 'kkomul', no: 11, name: '꼬물이', types: ['벌레'], base: { hp: 42, atk: 34, def: 40, spe: 40 },
    catchRate: 255, baseExp: 39, evolve: { level: 8, to: 'naphul' }, learnset: KKOMUL_MOVES,
    kind: '애벌레', desc: '하루 종일 잎을 갉아 먹는다. 몸의 노란 점무늬로 천적을 놀라게 한다.',
  },
  {
    id: 'naphul', no: 12, name: '나풀이', types: ['벌레', '바람'], base: { hp: 60, atk: 58, def: 52, spe: 72 },
    catchRate: 120, baseExp: 118, learnset: KKOMUL_MOVES,
    kind: '보랏빛나방', desc: '달밤에 날개의 가루를 반짝이며 춤춘다. 그 모습을 보면 행운이 온다는 말이 있다.',
  },
  {
    id: 'jjirit', no: 13, name: '찌릿이', types: ['전기'], base: { hp: 40, atk: 62, def: 36, spe: 80 },
    catchRate: 120, baseExp: 80, evolve: { level: 18, to: 'beongae' }, learnset: JJIRIT_MOVES,
    kind: '불꽃방울', desc: '공중에 둥실 떠다니는 전기 덩어리. 번개 치는 날에는 더 밝게 빛난다.',
  },
  {
    id: 'beongae', no: 14, name: '번개구름', types: ['전기'], base: { hp: 62, atk: 88, def: 58, spe: 98 },
    catchRate: 60, baseExp: 150, learnset: JJIRIT_MOVES,
    kind: '먹구름', desc: '화가 나면 몸에서 번개가 떨어진다. 비구름 속에 숨어 하늘을 떠돈다.',
  },
  {
    id: 'doldol', no: 15, name: '돌돌이', types: ['바위'], base: { hp: 48, atk: 58, def: 80, spe: 24 },
    catchRate: 150, baseExp: 70, evolve: { level: 16, to: 'bawi' }, learnset: DOLDOL_MOVES,
    kind: '조약돌', desc: '단단한 껍질 속에 몸을 숨기고 데굴데굴 굴러다닌다. 몸을 말면 바위와 구분하기 어렵다.',
  },
  {
    id: 'bawi', no: 16, name: '바위갑옷', types: ['바위'], base: { hp: 72, atk: 88, def: 106, spe: 34 },
    catchRate: 60, baseExp: 150, learnset: DOLDOL_MOVES,
    kind: '바위갑옷', desc: '등의 가시와 이마의 수정은 수백 년 동안 자란다. 산사태에도 꿈쩍하지 않는다.',
  },
];

export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(list.map((s) => [s.id, s]));
export const SPECIES_LIST = list;
