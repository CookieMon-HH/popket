import type { MonType } from './types';

export type StatKey = 'atk' | 'def' | 'spe' | 'acc';
export type Status = 'brn' | 'psn' | 'par' | 'slp';

export const STATUS_LABEL: Record<Status, { name: string; color: string }> = {
  brn: { name: '화상', color: '#e8603a' },
  psn: { name: '독', color: '#a050c0' },
  par: { name: '마비', color: '#d8a820' },
  slp: { name: '수면', color: '#8890a8' },
};

export const STAT_NAME: Record<StatKey, string> = { atk: '공격', def: '방어', spe: '스피드', acc: '명중률' };

export type Effect =
  | { kind: 'stat'; target: 'self' | 'foe'; stat: StatKey; stages: number; chance?: number }
  | { kind: 'status'; status: Status; chance?: number }
  | { kind: 'drain' }
  | { kind: 'recoil' }
  | { kind: 'heal' };

export interface MoveDef {
  id: string;
  name: string;
  type: MonType;
  /** 0 = status move */
  power: number;
  /** 0 = never misses */
  acc: number;
  pp: number;
  priority?: number;
  effect?: Effect;
  desc: string;
}

const list: MoveDef[] = [
  // 노말
  { id: 'tackle', name: '몸통치기', type: '노말', power: 40, acc: 100, pp: 35, desc: '몸을 날려 부딪친다.' },
  { id: 'scratch', name: '할퀴기', type: '노말', power: 40, acc: 100, pp: 35, desc: '날카로운 발톱으로 할퀸다.' },
  { id: 'dash', name: '재빠른돌진', type: '노말', power: 40, acc: 100, pp: 30, priority: 1, desc: '눈 깜짝할 새 먼저 공격한다.' },
  { id: 'growl', name: '으르렁', type: '노말', power: 0, acc: 100, pp: 40, effect: { kind: 'stat', target: 'foe', stat: 'atk', stages: -1 }, desc: '상대의 공격을 떨어뜨린다.' },
  { id: 'glare', name: '노려보기', type: '노말', power: 0, acc: 100, pp: 30, effect: { kind: 'stat', target: 'foe', stat: 'def', stages: -1 }, desc: '상대의 방어를 떨어뜨린다.' },
  { id: 'focus', name: '기합넣기', type: '노말', power: 0, acc: 0, pp: 20, effect: { kind: 'stat', target: 'self', stat: 'atk', stages: 1 }, desc: '기합을 넣어 공격을 올린다.' },
  { id: 'curl', name: '웅크리기', type: '노말', power: 0, acc: 0, pp: 30, effect: { kind: 'stat', target: 'self', stat: 'def', stages: 1 }, desc: '몸을 웅크려 방어를 올린다.' },
  { id: 'press', name: '힘껏누르기', type: '노말', power: 70, acc: 100, pp: 15, effect: { kind: 'status', status: 'par', chance: 30 }, desc: '온몸으로 누른다. 마비될 때가 있다.' },
  { id: 'struggle', name: '발버둥', type: '노말', power: 50, acc: 0, pp: 1, effect: { kind: 'recoil' }, desc: '쓸 기술이 없을 때 발버둥 친다.' },
  // 불
  { id: 'ember', name: '불티', type: '불', power: 40, acc: 100, pp: 25, effect: { kind: 'status', status: 'brn', chance: 10 }, desc: '작은 불티를 날린다. 화상을 입힐 때가 있다.' },
  { id: 'flamedash', name: '불꽃돌진', type: '불', power: 60, acc: 100, pp: 20, effect: { kind: 'status', status: 'brn', chance: 10 }, desc: '불꽃을 두르고 돌진한다.' },
  { id: 'firestorm', name: '화염폭풍', type: '불', power: 85, acc: 90, pp: 10, effect: { kind: 'status', status: 'brn', chance: 20 }, desc: '거센 불길을 소용돌이치게 한다.' },
  // 물
  { id: 'splash', name: '물튀기기', type: '물', power: 40, acc: 100, pp: 25, desc: '물을 세게 튀긴다.' },
  { id: 'bubble', name: '거품방울', type: '물', power: 40, acc: 100, pp: 30, effect: { kind: 'stat', target: 'foe', stat: 'spe', stages: -1, chance: 15 }, desc: '거품을 쏜다. 스피드를 떨어뜨릴 때가 있다.' },
  { id: 'wave', name: '물결치기', type: '물', power: 65, acc: 100, pp: 15, desc: '물결을 일으켜 덮친다.' },
  { id: 'tide', name: '해일', type: '물', power: 85, acc: 90, pp: 10, desc: '거대한 파도로 휩쓴다.' },
  // 풀
  { id: 'vine', name: '덩굴채찍', type: '풀', power: 45, acc: 100, pp: 25, desc: '덩굴로 후려친다.' },
  { id: 'absorb', name: '생기흡수', type: '풀', power: 40, acc: 100, pp: 20, effect: { kind: 'drain' }, desc: '준 데미지의 절반만큼 회복한다.' },
  { id: 'sleeppowder', name: '잠가루', type: '풀', power: 0, acc: 75, pp: 15, effect: { kind: 'status', status: 'slp' }, desc: '졸음을 부르는 가루를 뿌린다.' },
  { id: 'leafcut', name: '잎새베기', type: '풀', power: 60, acc: 95, pp: 20, desc: '날카로운 잎으로 벤다.' },
  { id: 'bloom', name: '꽃잎폭풍', type: '풀', power: 85, acc: 90, pp: 10, desc: '꽃잎을 폭풍처럼 흩날린다.' },
  // 전기
  { id: 'zap', name: '찌릿', type: '전기', power: 40, acc: 100, pp: 30, effect: { kind: 'status', status: 'par', chance: 10 }, desc: '약한 전기를 흘린다. 마비될 때가 있다.' },
  { id: 'paralyze', name: '마비파동', type: '전기', power: 0, acc: 90, pp: 20, effect: { kind: 'status', status: 'par' }, desc: '약한 전류로 상대를 마비시킨다.' },
  { id: 'bolt', name: '번개꽂기', type: '전기', power: 75, acc: 100, pp: 15, effect: { kind: 'status', status: 'par', chance: 10 }, desc: '번개를 내리꽂는다.' },
  // 바위
  { id: 'pebble', name: '돌멩이', type: '바위', power: 40, acc: 100, pp: 25, desc: '돌멩이를 던진다.' },
  { id: 'rockdrop', name: '바위떨구기', type: '바위', power: 75, acc: 90, pp: 10, desc: '커다란 바위를 떨어뜨린다.' },
  // 벌레
  { id: 'sting', name: '독바늘', type: '벌레', power: 20, acc: 100, pp: 35, effect: { kind: 'status', status: 'psn', chance: 30 }, desc: '독이 있는 바늘로 찌른다.' },
  { id: 'silk', name: '실뿜기', type: '벌레', power: 0, acc: 95, pp: 40, effect: { kind: 'stat', target: 'foe', stat: 'spe', stages: -2 }, desc: '실을 감아 스피드를 크게 떨어뜨린다.' },
  { id: 'bugbite', name: '깨물기', type: '벌레', power: 55, acc: 100, pp: 20, desc: '작은 턱으로 깨문다.' },
  { id: 'glitter', name: '반짝가루', type: '벌레', power: 60, acc: 100, pp: 15, effect: { kind: 'stat', target: 'foe', stat: 'acc', stages: -1, chance: 20 }, desc: '반짝이는 가루를 날린다.' },
  // 바람
  { id: 'peck', name: '콕쪼기', type: '바람', power: 35, acc: 100, pp: 35, desc: '부리로 콕 쪼아 댄다.' },
  { id: 'gust', name: '돌개바람', type: '바람', power: 40, acc: 100, pp: 35, desc: '세찬 바람을 일으킨다.' },
  { id: 'wingcut', name: '날개베기', type: '바람', power: 60, acc: 100, pp: 20, desc: '날개를 칼처럼 휘두른다.' },
  { id: 'dive', name: '급강하', type: '바람', power: 85, acc: 90, pp: 10, desc: '하늘 높이서 내리꽂힌다.' },
  { id: 'storm', name: '폭풍날개', type: '바람', power: 100, acc: 85, pp: 5, desc: '날개로 폭풍을 일으켜 휩쓴다.' },
  // 강화 기술
  { id: 'breathe', name: '숨고르기', type: '노말', power: 0, acc: 0, pp: 10, effect: { kind: 'heal' }, desc: '숨을 고르며 체력을 절반 회복한다.' },
  { id: 'fullcharge', name: '전력돌격', type: '노말', power: 90, acc: 100, pp: 10, desc: '온 힘을 다해 들이받는다.' },
  { id: 'lava', name: '용암분출', type: '불', power: 100, acc: 85, pp: 5, effect: { kind: 'status', status: 'brn', chance: 30 }, desc: '끓는 용암을 뿜어낸다.' },
  { id: 'bigwave', name: '대해일', type: '물', power: 100, acc: 85, pp: 5, desc: '바다를 통째로 일으켜 덮친다.' },
  { id: 'forestwrath', name: '숲의분노', type: '풀', power: 100, acc: 85, pp: 5, desc: '숲 전체의 힘을 모아 내리친다.' },
  { id: 'thunder', name: '천둥벼락', type: '전기', power: 95, acc: 85, pp: 10, effect: { kind: 'status', status: 'par', chance: 20 }, desc: '거대한 벼락을 떨어뜨린다.' },
  { id: 'sparkspike', name: '전기가시', type: '전기', power: 60, acc: 100, pp: 20, effect: { kind: 'status', status: 'par', chance: 20 }, desc: '전기를 두른 가시로 찌른다.' },
  { id: 'rockstorm', name: '암석폭풍', type: '바위', power: 100, acc: 85, pp: 5, desc: '바위 조각을 폭풍처럼 퍼붓는다.' },
  // 땅
  { id: 'mudthrow', name: '진흙뿌리기', type: '땅', power: 40, acc: 100, pp: 25, effect: { kind: 'stat', target: 'foe', stat: 'acc', stages: -1, chance: 30 }, desc: '진흙을 뿌린다. 명중률을 떨어뜨릴 때가 있다.' },
  { id: 'quake', name: '땅울림', type: '땅', power: 65, acc: 100, pp: 15, desc: '땅을 울려 충격을 준다.' },
  { id: 'earthsplit', name: '대지가르기', type: '땅', power: 90, acc: 90, pp: 10, desc: '대지를 갈라 상대를 삼킨다.' },
  // 독
  { id: 'poisonspore', name: '독포자', type: '독', power: 0, acc: 80, pp: 20, effect: { kind: 'status', status: 'psn' }, desc: '독이 든 포자를 뿌려 독에 걸리게 한다.' },
  { id: 'toxshot', name: '독물총', type: '독', power: 45, acc: 100, pp: 25, effect: { kind: 'status', status: 'psn', chance: 30 }, desc: '독액을 쏜다. 독에 걸릴 때가 있다.' },
  { id: 'toxblast', name: '맹독폭발', type: '독', power: 85, acc: 90, pp: 10, effect: { kind: 'status', status: 'psn', chance: 30 }, desc: '독 포자를 한꺼번에 터뜨린다.' },
  // 영혼
  { id: 'spook', name: '놀래기', type: '영혼', power: 40, acc: 100, pp: 25, desc: '갑자기 나타나 상대를 놀래 준다.' },
  { id: 'bewitch', name: '홀리기', type: '영혼', power: 0, acc: 90, pp: 15, effect: { kind: 'stat', target: 'foe', stat: 'atk', stages: -2 }, desc: '기묘한 춤으로 홀려 공격을 크게 떨어뜨린다.' },
  { id: 'soulwave', name: '혼령파동', type: '영혼', power: 70, acc: 100, pp: 15, desc: '혼령의 힘을 파동으로 쏜다.' },
  { id: 'nightdance', name: '한밤의춤', type: '영혼', power: 95, acc: 90, pp: 10, desc: '한밤중의 탈춤으로 혼을 흔든다.' },
  // 전설
  { id: 'galaxy', name: '은하파동', type: '물', power: 110, acc: 90, pp: 5, desc: '별빛을 머금은 파도를 일으킨다.' },
];

export const MOVES: Record<string, MoveDef> = Object.fromEntries(list.map((m) => [m.id, m]));
