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
  rank?: '전설' | '준전설';
}

type L = [number, string][];

const MODAK: L = [[1, 'scratch'], [1, 'growl'], [6, 'ember'], [10, 'focus'], [13, 'dash'], [17, 'flamedash'], [22, 'press'], [28, 'firestorm'], [32, 'quake'], [38, 'lava']];
const PONG: L = [[1, 'tackle'], [1, 'glare'], [6, 'splash'], [9, 'bubble'], [13, 'curl'], [17, 'wave'], [22, 'press'], [28, 'tide'], [32, 'breathe'], [38, 'bigwave']];
const SAESUN: L = [[1, 'tackle'], [1, 'growl'], [6, 'vine'], [9, 'absorb'], [12, 'sleeppowder'], [16, 'leafcut'], [22, 'press'], [28, 'bloom'], [32, 'quake'], [38, 'forestwrath']];
const TOSIL: L = [[1, 'tackle'], [3, 'glare'], [7, 'dash'], [12, 'focus'], [17, 'press'], [24, 'breathe'], [30, 'fullcharge']];
const JJAEK: L = [[1, 'peck'], [3, 'growl'], [7, 'gust'], [12, 'dash'], [18, 'wingcut'], [24, 'focus'], [30, 'dive'], [36, 'storm']];
const KKOMUL: L = [[1, 'tackle'], [1, 'silk'], [5, 'sting'], [7, 'curl'], [10, 'gust'], [12, 'sleeppowder'], [15, 'bugbite'], [19, 'glitter'], [25, 'breathe']];
const JJIRIT: L = [[1, 'zap'], [1, 'glare'], [6, 'paralyze'], [11, 'dash'], [16, 'bolt'], [24, 'focus'], [30, 'thunder']];
const DOLDOL: L = [[1, 'tackle'], [1, 'curl'], [6, 'pebble'], [11, 'glare'], [15, 'rockdrop'], [20, 'mudthrow'], [25, 'press'], [34, 'earthsplit'], [40, 'rockstorm']];
const POJA: L = [[1, 'tackle'], [4, 'poisonspore'], [8, 'absorb'], [12, 'toxshot'], [16, 'sleeppowder'], [20, 'leafcut'], [26, 'toxblast'], [34, 'forestwrath']];
const TAL: L = [[1, 'spook'], [1, 'glare'], [6, 'bewitch'], [11, 'toxshot'], [18, 'soulwave'], [26, 'breathe'], [33, 'nightdance']];
const PIRA: L = [[1, 'splash'], [1, 'tackle'], [5, 'bubble'], [10, 'dash'], [15, 'wave'], [20, 'gust'], [24, 'focus'], [30, 'tide']];
const JINHEUK: L = [[1, 'tackle'], [1, 'curl'], [5, 'mudthrow'], [10, 'pebble'], [15, 'quake'], [21, 'press'], [27, 'breathe'], [33, 'earthsplit'], [40, 'rockstorm']];
const DDAKKUM: L = [[1, 'scratch'], [1, 'growl'], [5, 'zap'], [9, 'dash'], [13, 'paralyze'], [17, 'sparkspike'], [23, 'focus'], [29, 'bolt'], [35, 'thunder']];
const SANGUN: L = [[1, 'rockdrop'], [1, 'soulwave'], [30, 'focus'], [35, 'mountainroar'], [38, 'rockstorm']];
const EUNHA: L = [[1, 'wave'], [1, 'gust'], [20, 'breathe'], [25, 'tide'], [30, 'galaxy'], [35, 'storm']];

type Def = Omit<SpeciesDef, 'no'>;

const list: Def[] = [
  // 스타터 — 불
  { id: 'modak', name: '모닥이', types: ['불'], base: { hp: 44, atk: 56, def: 42, spe: 58 }, catchRate: 45, baseExp: 62, evolve: { level: 14, to: 'hwaro' }, learnset: MODAK,
    kind: '불씨곰', desc: '머리 위의 불꽃은 기분이 좋으면 크게 타오른다. 추운 밤에는 친구들과 붙어서 잔다.' },
  { id: 'hwaro', name: '화로곰', types: ['불'], base: { hp: 68, atk: 84, def: 64, spe: 74 }, catchRate: 45, baseExp: 142, evolve: { level: 32, to: 'hwasan' }, learnset: MODAK,
    kind: '화로곰', desc: '등에 세 갈래의 불꽃이 타오른다. 겨울 산에서 길 잃은 사람을 따뜻하게 지켜 준다고 한다.' },
  { id: 'hwasan', name: '화산곰', types: ['불', '땅'], base: { hp: 92, atk: 112, def: 88, spe: 86 }, catchRate: 45, baseExp: 236, learnset: MODAK,
    kind: '화산곰', desc: '어깨의 바위 틈으로 용암이 흐른다. 화가 나면 땅이 흔들릴 만큼 크게 포효한다.' },
  // 스타터 — 물
  { id: 'pong', name: '퐁당이', types: ['물'], base: { hp: 48, atk: 48, def: 56, spe: 48 }, catchRate: 45, baseExp: 63, evolve: { level: 14, to: 'mulbora' }, learnset: PONG,
    kind: '물방울물범', desc: '이마의 물방울 볏으로 물의 온도를 느낀다. 미끄럼 타기를 아주 좋아한다.' },
  { id: 'mulbora', name: '물보라', types: ['물'], base: { hp: 76, atk: 70, def: 82, spe: 66 }, catchRate: 45, baseExp: 143, evolve: { level: 32, to: 'haeil' }, learnset: PONG,
    kind: '파도물범', desc: '파도 모양의 갈기를 휘날리며 헤엄친다. 꼬리 한 번으로 작은 파도를 일으킨다.' },
  { id: 'haeil', name: '해일왕', types: ['물'], base: { hp: 104, atk: 94, def: 106, spe: 80 }, catchRate: 45, baseExp: 238, learnset: PONG,
    kind: '해일물범', desc: '바다의 왕으로 불린다. 엄니를 한 번 휘두르면 집채만 한 해일이 일어난다.' },
  // 스타터 — 풀
  { id: 'saesun', name: '새순이', types: ['풀'], base: { hp: 50, atk: 50, def: 52, spe: 46 }, catchRate: 45, baseExp: 64, evolve: { level: 14, to: 'kkot' }, learnset: SAESUN,
    kind: '새싹', desc: '햇볕을 쬐면 머리의 새싹이 쑥쑥 자란다. 비 오는 날에는 신이 나서 뛰어다닌다.' },
  { id: 'kkot', name: '꽃덤불', types: ['풀'], base: { hp: 78, atk: 72, def: 78, spe: 58 }, catchRate: 45, baseExp: 142, evolve: { level: 32, to: 'supji' }, learnset: SAESUN,
    kind: '꽃덤불', desc: '머리의 꽃이 피면 달콤한 향기가 숲에 퍼진다. 그 향기를 맡으면 마음이 편안해진다.' },
  { id: 'supji', name: '숲지기', types: ['풀', '땅'], base: { hp: 106, atk: 100, def: 104, spe: 68 }, catchRate: 45, baseExp: 236, learnset: SAESUN,
    kind: '숲지킴이', desc: '머리 위에 작은 숲을 이고 다닌다. 숲지기가 지나간 자리에는 새싹이 돋아난다.' },
  // 들판
  { id: 'tosil', name: '토실이', types: ['노말'], base: { hp: 50, atk: 44, def: 40, spe: 52 }, catchRate: 255, baseExp: 50, evolve: { level: 15, to: 'tongsil' }, learnset: TOSIL,
    kind: '볼주머니', desc: '양 볼에 씨앗을 잔뜩 넣고 다닌다. 놀라면 씨앗을 우르르 쏟아 버린다.' },
  { id: 'tongsil', name: '통실이', types: ['노말'], base: { hp: 82, atk: 72, def: 62, spe: 72 }, catchRate: 127, baseExp: 120, learnset: TOSIL,
    kind: '볼주머니', desc: '복슬복슬한 꼬리로 몸의 균형을 잡는다. 겨울을 대비해 굴에 먹이를 산더미처럼 모은다.' },
  { id: 'jjaek', name: '짹짹이', types: ['노말', '바람'], base: { hp: 40, atk: 45, def: 38, spe: 62 }, catchRate: 255, baseExp: 50, evolve: { level: 12, to: 'baramsae' }, learnset: JJAEK,
    kind: '꼬마새', desc: '아침마다 큰 소리로 지저귄다. 무리 지어 다니며 서로의 깃털을 다듬어 준다.' },
  { id: 'baramsae', name: '바람새', types: ['노말', '바람'], base: { hp: 58, atk: 62, def: 54, spe: 78 }, catchRate: 120, baseExp: 110, evolve: { level: 28, to: 'hoeori' }, learnset: JJAEK,
    kind: '바람타기', desc: '하늘색 볏으로 바람의 방향을 읽는다. 날갯짓 없이 바람만 타고 하루 종일 날 수 있다.' },
  { id: 'hoeori', name: '회오리매', types: ['노말', '바람'], base: { hp: 80, atk: 90, def: 72, spe: 104 }, catchRate: 45, baseExp: 200, learnset: JJAEK,
    kind: '돌개바람', desc: '날갯짓 한 번에 회오리를 일으킨다. 아주 먼 곳의 먹잇감도 놓치지 않는다.' },
  { id: 'kkomul', name: '꼬물이', types: ['벌레'], base: { hp: 42, atk: 34, def: 40, spe: 40 }, catchRate: 255, baseExp: 39, evolve: { level: 7, to: 'dandan' }, learnset: KKOMUL,
    kind: '애벌레', desc: '하루 종일 잎을 갉아 먹는다. 몸의 노란 점무늬로 천적을 놀라게 한다.' },
  { id: 'dandan', name: '단단고치', types: ['벌레'], base: { hp: 48, atk: 22, def: 72, spe: 20 }, catchRate: 120, baseExp: 72, evolve: { level: 10, to: 'naphul' }, learnset: KKOMUL,
    kind: '고치', desc: '단단한 실로 몸을 감싸고 꼼짝하지 않는다. 고치 안에서는 날개가 조금씩 자라고 있다.' },
  { id: 'naphul', name: '나풀이', types: ['벌레', '바람'], base: { hp: 66, atk: 70, def: 58, spe: 82 }, catchRate: 45, baseExp: 160, learnset: KKOMUL,
    kind: '보랏빛나방', desc: '달밤에 날개의 가루를 반짝이며 춤춘다. 그 모습을 보면 행운이 온다는 말이 있다.' },
  { id: 'jjirit', name: '찌릿이', types: ['전기'], base: { hp: 40, atk: 62, def: 36, spe: 80 }, catchRate: 120, baseExp: 80, evolve: { level: 20, to: 'beongae' }, learnset: JJIRIT,
    kind: '전기방울', desc: '공중에 둥실 떠다니는 전기 덩어리. 번개 치는 날에는 더 밝게 빛난다.' },
  { id: 'beongae', name: '번개구름', types: ['전기'], base: { hp: 64, atk: 90, def: 60, spe: 100 }, catchRate: 60, baseExp: 160, learnset: JJIRIT,
    kind: '먹구름', desc: '화가 나면 몸에서 번개가 떨어진다. 비구름 속에 숨어 하늘을 떠돈다.' },
  { id: 'doldol', name: '돌돌이', types: ['바위'], base: { hp: 48, atk: 58, def: 80, spe: 24 }, catchRate: 150, baseExp: 70, evolve: { level: 16, to: 'bawi' }, learnset: DOLDOL,
    kind: '조약돌', desc: '단단한 껍질 속에 몸을 숨기고 데굴데굴 굴러다닌다. 몸을 말면 바위와 구분하기 어렵다.' },
  { id: 'bawi', name: '바위갑옷', types: ['바위'], base: { hp: 72, atk: 88, def: 106, spe: 34 }, catchRate: 60, baseExp: 150, evolve: { level: 34, to: 'geoam' }, learnset: DOLDOL,
    kind: '바위갑옷', desc: '등의 가시와 이마의 수정은 수백 년 동안 자란다. 산사태에도 꿈쩍하지 않는다.' },
  { id: 'geoam', name: '거암대왕', types: ['바위', '땅'], base: { hp: 100, atk: 112, def: 130, spe: 40 }, catchRate: 45, baseExp: 240, learnset: DOLDOL,
    kind: '산봉우리', desc: '등의 세 봉우리에는 일 년 내내 눈이 쌓여 있다. 잠든 모습은 작은 산맥처럼 보인다.' },
  // 숲
  { id: 'pojani', name: '포자니', types: ['풀', '독'], base: { hp: 46, atk: 48, def: 50, spe: 30 }, catchRate: 220, baseExp: 55, evolve: { level: 13, to: 'beoseot' }, learnset: POJA,
    kind: '꼬마버섯', desc: '축축한 나무 그늘을 좋아한다. 머리를 흔들면 반짝이는 포자가 흩날린다.' },
  { id: 'beoseot', name: '버섯돌이', types: ['풀', '독'], base: { hp: 66, atk: 70, def: 70, spe: 42 }, catchRate: 120, baseExp: 125, evolve: { level: 28, to: 'beoseotking' }, learnset: POJA,
    kind: '버섯', desc: '갓 아래에 독 포자를 모아 둔다. 친구에게는 좋은 냄새가 나는 포자를 뿌려 준다.' },
  { id: 'beoseotking', name: '버섯대왕', types: ['풀', '독'], base: { hp: 94, atk: 98, def: 96, spe: 56 }, catchRate: 45, baseExp: 220, learnset: POJA,
    kind: '버섯대왕', desc: '우산처럼 큰 갓의 가장자리에 금빛 무늬가 있다. 숲속 버섯들의 왕이라고 전해진다.' },
  { id: 'taldol', name: '탈돌이', types: ['영혼'], base: { hp: 42, atk: 50, def: 42, spe: 62 }, catchRate: 150, baseExp: 66, evolve: { level: 18, to: 'talgwang' }, learnset: TAL,
    kind: '탈정령', desc: '오래된 탈에 깃든 정령. 늘 웃는 얼굴이지만 장난이 지나쳐 사람을 깜짝 놀래 준다.' },
  { id: 'talgwang', name: '탈광대', types: ['영혼'], base: { hp: 62, atk: 76, def: 58, spe: 86 }, catchRate: 90, baseExp: 140, evolve: { level: 33, to: 'taldae' }, learnset: TAL,
    kind: '탈춤', desc: '긴 소매를 휘날리며 밤새 춤을 춘다. 그 춤을 본 사람은 넋을 잃고 따라 춤춘다고 한다.' },
  { id: 'taldae', name: '탈대감', types: ['영혼', '독'], base: { hp: 82, atk: 104, def: 76, spe: 100 }, catchRate: 45, baseExp: 230, learnset: TAL,
    kind: '탈대감', desc: '검은 갓을 쓴 엄한 얼굴의 탈. 숲과 마을을 해치는 자 앞에 나타나 호통을 친다.' },
  // 물가
  { id: 'banjjak', name: '반짝피라', types: ['물'], base: { hp: 38, atk: 40, def: 42, spe: 70 }, catchRate: 255, baseExp: 45, evolve: { level: 20, to: 'eungeo' }, learnset: PIRA,
    kind: '반짝물고기', desc: '비늘이 햇빛에 반짝반짝 빛난다. 떼를 지어 헤엄치며 물 위로 톡톡 튀어 오른다.' },
  { id: 'eungeo', name: '은빛잉어', types: ['물'], base: { hp: 88, atk: 96, def: 80, spe: 86 }, catchRate: 60, baseExp: 170, learnset: PIRA,
    kind: '은빛잉어', desc: '수십 년을 산 은빛잉어는 금빛 지느러미를 갖게 된다. 물안개마을의 수호 물고기다.' },
  // 땅
  { id: 'jinheuk', name: '진흙이', types: ['땅'], base: { hp: 56, atk: 56, def: 60, spe: 30 }, catchRate: 190, baseExp: 60, evolve: { level: 16, to: 'heukjang' }, learnset: JINHEUK,
    kind: '진흙', desc: '비 온 다음 날 진흙 웅덩이에서 태어난다. 몸이 마르면 기운이 없어진다.' },
  { id: 'heukjang', name: '흙장수', types: ['땅'], base: { hp: 80, atk: 84, def: 84, spe: 40 }, catchRate: 90, baseExp: 140, evolve: { level: 32, to: 'daeji' }, learnset: JINHEUK,
    kind: '흙장사', desc: '굵은 팔로 바위도 번쩍 든다. 동굴 공사를 돕는 일꾼으로 사랑받는다.' },
  { id: 'daeji', name: '대지거인', types: ['땅', '바위'], base: { hp: 110, atk: 116, def: 110, spe: 44 }, catchRate: 45, baseExp: 236, learnset: JINHEUK,
    kind: '대지', desc: '머리 위에 풀이 자랄 만큼 오래 산다. 한 걸음마다 땅이 쿵 울린다.' },
  // 전기
  { id: 'ddakkum', name: '따끔이', types: ['전기'], base: { hp: 42, atk: 50, def: 44, spe: 64 }, catchRate: 200, baseExp: 58, evolve: { level: 15, to: 'beonjjeok' }, learnset: DDAKKUM,
    kind: '전기고슴', desc: '등의 가시 끝에 정전기가 모인다. 쓰다듬으면 따끔하지만 무척 좋아한다.' },
  { id: 'beonjjeok', name: '번쩍고슴', types: ['전기'], base: { hp: 62, atk: 74, def: 64, spe: 86 }, catchRate: 90, baseExp: 135, evolve: { level: 30, to: 'noejeon' }, learnset: DDAKKUM,
    kind: '번개가시', desc: '가시가 번개 모양으로 자랐다. 위험을 느끼면 가시를 세우고 번쩍 빛을 낸다.' },
  { id: 'noejeon', name: '뇌전고슴', types: ['전기'], base: { hp: 84, atk: 104, def: 82, spe: 108 }, catchRate: 45, baseExp: 228, learnset: DDAKKUM,
    kind: '뇌전', desc: '푸른 번개를 두른 가시는 바위도 뚫는다. 천둥이 치는 밤이면 산꼭대기에서 울부짖는다.' },
  // 전설
  { id: 'eunha', name: '은하고래', types: ['물', '바람'], base: { hp: 120, atk: 110, def: 100, spe: 90 }, catchRate: 25, baseExp: 260, learnset: EUNHA, rank: '전설',
    kind: '은하', desc: '별빛동굴 지하 호수에 잠든 전설의 몬스터. 깨어나면 밤하늘을 헤엄치며 별을 뿌린다고 전해진다.' },
  { id: 'sangun', name: '산군', types: ['바위', '영혼'], base: { hp: 100, atk: 118, def: 92, spe: 110 }, catchRate: 20, baseExp: 250, learnset: SANGUN, rank: '준전설',
    kind: '산신령', desc: '운무봉을 지키는 흰 호랑이의 정령. 숲·물·바위의 세 방울 소리를 들으면 서낭당으로 내려온다고 전해진다.' },
];

export const SPECIES_LIST: SpeciesDef[] = list.map((s, i) => ({ ...s, no: i + 1 }));
export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(SPECIES_LIST.map((s) => [s.id, s]));
