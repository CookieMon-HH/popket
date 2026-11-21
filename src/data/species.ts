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
  /** Shown as "전설의 몬스터" in battle intros. */
  legend?: boolean;
  /** Special encounter: gets a dramatic intro but no label. */
  special?: boolean;
  /** Evolution by item: stone id → species id. */
  stones?: Record<string, string>;
  /** Runs away from wild battles after a few turns. */
  flees?: boolean;
}

type L = [number, string][];

const MODAK: L = [[1, 'tackle'], [1, 'growl'], [6, 'ember'], [10, 'dash'], [13, 'focus'], [17, 'flamedash'], [22, 'press'], [28, 'firestorm'], [32, 'quake'], [38, 'lava']];
const PONG: L = [[1, 'tackle'], [1, 'glare'], [6, 'splash'], [9, 'bubble'], [13, 'curl'], [17, 'wave'], [22, 'frostbreath'], [28, 'tide'], [32, 'icefang'], [36, 'breathe'], [40, 'bigwave']];
const SAESUN: L = [[1, 'tackle'], [1, 'growl'], [6, 'vine'], [9, 'absorb'], [12, 'sleeppowder'], [16, 'leafcut'], [22, 'twinkle'], [28, 'bloom'], [32, 'moondust'], [38, 'forestwrath']];
const TOSIL: L = [[1, 'tackle'], [3, 'glare'], [7, 'dash'], [12, 'focus'], [17, 'press'], [22, 'bite'], [28, 'fullcharge']];
const JJAEK: L = [[1, 'peck'], [3, 'growl'], [7, 'gust'], [12, 'dash'], [18, 'wingcut'], [24, 'focus'], [30, 'dive'], [36, 'storm']];
const KKOMUL: L = [[1, 'tackle'], [1, 'silk'], [5, 'sting'], [7, 'curl'], [10, 'gust'], [12, 'sleeppowder'], [15, 'bugbite'], [19, 'glitter'], [23, 'psybeam'], [28, 'breathe']];
const MONSIL: L = [[1, 'tackle'], [1, 'twinkle'], [6, 'growl'], [10, 'dreamsong'], [15, 'press'], [20, 'moondust'], [28, 'breathe']];
const JJIRIT: L = [[1, 'zap'], [1, 'glare'], [6, 'paralyze'], [11, 'dash'], [16, 'bolt'], [24, 'focus'], [30, 'thunder']];
const DDAKKUM: L = [[1, 'scratch'], [1, 'growl'], [5, 'zap'], [9, 'dash'], [13, 'paralyze'], [17, 'sparkspike'], [23, 'focus'], [29, 'bolt'], [35, 'thunder']];
const DOLDOL: L = [[1, 'tackle'], [1, 'curl'], [6, 'pebble'], [11, 'glare'], [15, 'rockdrop'], [20, 'mudthrow'], [25, 'ironwall'], [34, 'earthsplit'], [40, 'rockstorm']];
const KKAENG: L = [[1, 'jab'], [1, 'growl'], [6, 'dash'], [10, 'focus'], [15, 'straight'], [22, 'press'], [28, 'upper']];
const POJA: L = [[1, 'tackle'], [4, 'poisonspore'], [8, 'absorb'], [12, 'toxshot'], [16, 'sleeppowder'], [20, 'leafcut'], [26, 'toxblast'], [34, 'forestwrath']];
const JINHEUK: L = [[1, 'tackle'], [1, 'curl'], [5, 'mudthrow'], [10, 'pebble'], [15, 'quake'], [21, 'press'], [27, 'breathe'], [33, 'earthsplit'], [40, 'rockstorm']];
const SOEJIP: L = [[1, 'scratch'], [1, 'ironwall'], [6, 'ironclaw'], [11, 'bugbite'], [16, 'dash'], [22, 'steelpincer'], [28, 'glitter']];
const KKWAE: L = [[1, 'scratch'], [1, 'snatch'], [6, 'glare'], [10, 'bite'], [15, 'dash'], [22, 'nightveil'], [28, 'focus']];
const DOKBUL: L = [[1, 'spook'], [1, 'glare'], [6, 'willowisp'], [11, 'bewitch'], [16, 'soulwave'], [22, 'bite'], [28, 'club'], [34, 'nightdance']];
const DALTO: L = [[1, 'tackle'], [1, 'telekinesis'], [6, 'growl'], [10, 'meditate'], [15, 'psybeam'], [21, 'twinkle'], [27, 'moondust'], [32, 'moonsign']];
const PIRA: L = [[1, 'splash'], [1, 'tackle'], [5, 'bubble'], [10, 'dash'], [15, 'wave'], [20, 'bite'], [24, 'focus'], [30, 'tide']];
const PENG: L = [[1, 'peck'], [1, 'frostbreath'], [6, 'splash'], [11, 'curl'], [16, 'icefang'], [22, 'wave'], [28, 'avalanche']];
const RYONG: L = [[1, 'scratch'], [1, 'growl'], [6, 'dragonbreath'], [12, 'dash'], [18, 'wingcut'], [25, 'dragontail'], [32, 'focus'], [40, 'skyfury']];
const GUNGO: L = [[1, 'tackle'], [1, 'growl'], [5, 'ember'], [9, 'curl'], [13, 'hotsteam'], [18, 'press'], [24, 'ironwall'], [28, 'firestorm'], [34, 'steelbeam']];
const MUNU: L = [[1, 'splash'], [1, 'inkspray'], [6, 'bubble'], [11, 'tentacle'], [16, 'bite'], [22, 'wave'], [28, 'nightveil'], [34, 'tide'], [40, 'bigwave']];
const GOM: L = [[1, 'tackle'], [1, 'growl'], [6, 'jab'], [10, 'focus'], [15, 'bite'], [20, 'straight'], [27, 'press'], [33, 'deulbaeji'], [40, 'upper']];
const TONG: L = [[1, 'tackle'], [1, 'ironwall'], [6, 'zap'], [10, 'ironclaw'], [15, 'paralyze'], [21, 'bolt'], [27, 'steelbeam'], [34, 'thunder']];
const NYANG: L = [[1, 'scratch'], [1, 'frostbreath'], [6, 'dash'], [11, 'bite'], [17, 'icefang'], [23, 'focus'], [29, 'avalanche']];
const MONG: L = [[1, 'tackle'], [1, 'twinkle'], [5, 'growl'], [10, 'bite'], [15, 'dreamsong'], [20, 'moondust'], [27, 'fullcharge']];
const CHIM: L = [[1, 'scratch'], [1, 'sting'], [6, 'glare'], [11, 'toxshot'], [17, 'poisontail'], [23, 'quake'], [29, 'toxblast']];
const BUEONG: L = [[1, 'peck'], [1, 'hoot'], [6, 'telekinesis'], [11, 'gust'], [16, 'psybeam'], [22, 'wingcut'], [28, 'moonsign']];
const MAKA: L = [[1, 'tackle'], [1, 'twinkle'], [6, 'growl'], [10, 'curl'], [15, 'dreamsong'], [20, 'moondust'], [27, 'press'], [33, 'breathe']];
const JELLY: L = [[1, 'bubble'], [1, 'twinkle'], [6, 'paralyze'], [11, 'tentacle'], [16, 'moondust'], [22, 'wave'], [28, 'breathe'], [34, 'bigwave']];
const UNI: L = [[1, 'tackle'], [1, 'twinkle'], [6, 'dash'], [11, 'telekinesis'], [16, 'moondust'], [22, 'psybeam'], [28, 'dreamsong'], [34, 'moonsign'], [40, 'fullcharge']];
const DUCK: L = [[1, 'peck'], [1, 'splash'], [6, 'growl'], [11, 'bubble'], [16, 'gust'], [22, 'wave'], [28, 'wingcut'], [34, 'tide']];
const PETAL: L = [[1, 'peck'], [1, 'growl'], [6, 'vine'], [11, 'gust'], [16, 'leafcut'], [22, 'wingcut'], [28, 'bloom'], [34, 'storm']];
const SNAIL: L = [[1, 'tackle'], [1, 'curl'], [6, 'absorb'], [11, 'bubble'], [16, 'sleeppowder'], [22, 'wave'], [28, 'bloom'], [34, 'forestwrath']];
const BING: L = [[1, 'tackle'], [1, 'frostbreath'], [6, 'twinkle'], [11, 'curl'], [16, 'icefang'], [22, 'moondust'], [28, 'avalanche']];
const BUKGOM: L = [[1, 'tackle'], [1, 'frostbreath'], [6, 'jab'], [12, 'icefang'], [18, 'focus'], [24, 'straight'], [30, 'avalanche'], [36, 'upper']];
const HYEON: L = [[1, 'tackle'], [1, 'curl'], [6, 'splash'], [12, 'dragonbreath'], [18, 'ironwall'], [24, 'wave'], [30, 'dragontail'], [36, 'tide'], [42, 'skyfury']];
const SANGUN: L = [[1, 'pebble'], [1, 'spook'], [25, 'rockdrop'], [30, 'focus'], [34, 'soulwave'], [42, 'mountainroar'], [50, 'rockstorm']];
const CHEONJI: L = [[1, 'dragontail'], [1, 'psybeam'], [45, 'meditate'], [50, 'moonsign'], [60, 'skyfury'], [70, 'genesis']];
const CHORONG: L = [[1, 'tackle'], [1, 'ember'], [7, 'spook'], [13, 'willowisp'], [18, 'flamedash'], [24, 'soulwave'], [30, 'hotsteam'], [37, 'nightdance'], [43, 'firestorm']];
const MULGWI: L = [[1, 'splash'], [1, 'spook'], [8, 'bubble'], [14, 'bewitch'], [20, 'tentacle'], [26, 'soulwave'], [32, 'wave'], [38, 'nightdance'], [44, 'tide']];
const HAEGOL: L = [[1, 'peck'], [1, 'spook'], [6, 'growl'], [11, 'gust'], [17, 'wingcut'], [23, 'soulwave'], [30, 'dive'], [36, 'nightdance'], [42, 'storm']];
const BOMUL: L = [[1, 'bite'], [1, 'spook'], [15, 'ironwall'], [22, 'bewitch'], [28, 'club'], [34, 'soulwave'], [40, 'nightdance']];
const BUNG: L = [[1, 'tackle'], [1, 'sting'], [6, 'silk'], [10, 'bugbite'], [15, 'curl'], [21, 'glitter'], [27, 'moondust'], [34, 'dive'], [40, 'bloom']];
const MEONG: L = [[1, 'tackle'], [1, 'growl'], [5, 'bite'], [10, 'dash'], [16, 'focus'], [22, 'press'], [28, 'straight'], [34, 'fullcharge'], [40, 'upper']];
const DOTORI: L = [[1, 'scratch'], [1, 'growl'], [5, 'dash'], [9, 'bite'], [14, 'curl'], [19, 'snatch'], [25, 'press'], [31, 'fullcharge']];
const BANDI: L = [[1, 'tackle'], [1, 'zap'], [6, 'silk'], [10, 'bugbite'], [15, 'sparkspike'], [21, 'glitter'], [27, 'bolt'], [34, 'thunder']];
const SASUM: L = [[1, 'scratch'], [1, 'bugbite'], [8, 'jab'], [14, 'ironclaw'], [20, 'straight'], [27, 'deulbaeji'], [34, 'steelpincer'], [40, 'upper']];
const DUKEOP: L = [[1, 'tackle'], [1, 'mudthrow'], [6, 'toxshot'], [12, 'bite'], [17, 'poisonspore'], [23, 'poisontail'], [29, 'quake'], [36, 'toxblast'], [44, 'earthsplit']];
const GEOMI: L = [[1, 'sting'], [1, 'silk'], [7, 'bite'], [12, 'bugbite'], [18, 'snatch'], [24, 'glitter'], [30, 'nightveil'], [37, 'club']];
const DUJJI: L = [[1, 'scratch'], [1, 'mudthrow'], [8, 'curl'], [14, 'quake'], [20, 'ironclaw'], [26, 'rockdrop'], [32, 'earthsplit'], [38, 'steelbeam']];
const TUGU: L = [[1, 'scratch'], [1, 'curl'], [10, 'bugbite'], [16, 'pebble'], [22, 'rockdrop'], [30, 'steelpincer'], [36, 'glitter'], [42, 'rockstorm']];
const SIJO: L = [[1, 'peck'], [1, 'pebble'], [10, 'gust'], [16, 'wingcut'], [22, 'rockdrop'], [30, 'dive'], [38, 'rockstorm'], [44, 'storm']];
const KKAK: L = [[1, 'peck'], [1, 'snatch'], [7, 'growl'], [12, 'gust'], [18, 'bite'], [24, 'wingcut'], [30, 'nightveil'], [36, 'dive'], [42, 'club']];
const SUTDOL: L = [[1, 'tackle'], [1, 'pebble'], [8, 'ember'], [14, 'curl'], [20, 'rockdrop'], [26, 'flamedash'], [32, 'hotsteam'], [38, 'lava'], [44, 'rockstorm']];
const MAEKAE: L = [[1, 'tackle'], [1, 'toxshot'], [6, 'snatch'], [11, 'inkspray'], [16, 'bite'], [22, 'poisontail'], [28, 'nightveil'], [34, 'toxblast'], [41, 'club']];
const JANGSEUNG: L = [[1, 'vine'], [1, 'spook'], [10, 'leafcut'], [18, 'bewitch'], [26, 'soulwave'], [34, 'bloom'], [42, 'nightdance'], [48, 'forestwrath']];
const GIGU: L = [[1, 'tackle'], [1, 'gust'], [15, 'curl'], [25, 'wingcut'], [33, 'breathe'], [40, 'dive'], [46, 'storm']];
const YEOU: L = [[1, 'tackle'], [1, 'growl'], [6, 'dash'], [11, 'twinkle'], [17, 'bite'], [24, 'press'], [32, 'fullcharge']];
const BULYEOU: L = [[1, 'ember'], [1, 'telekinesis'], [1, 'dash'], [1, 'bite'], [26, 'flamedash'], [32, 'psybeam'], [38, 'firestorm'], [46, 'moonsign'], [52, 'lava']];
const GEUNEUL: L = [[1, 'spook'], [1, 'bewitch'], [1, 'dash'], [1, 'bite'], [26, 'soulwave'], [32, 'nightveil'], [40, 'willowisp'], [46, 'nightdance']];
const GASI: L = [[1, 'toxshot'], [1, 'poisonspore'], [1, 'dash'], [1, 'bite'], [26, 'poisontail'], [32, 'leafcut'], [40, 'toxblast'], [48, 'fullcharge']];
const DORONG: L = [[1, 'scratch'], [1, 'mudthrow'], [10, 'dragonbreath'], [18, 'bite'], [26, 'quake'], [34, 'dragontail'], [44, 'earthsplit'], [52, 'skyfury']];
const GEUMDU: L = [[1, 'splash'], [1, 'curl'], [1, 'dash'], [20, 'ironwall'], [30, 'ironclaw']];
const GEOBUK: L = [[1, 'bubble'], [1, 'ironclaw'], [1, 'curl'], [22, 'wave'], [28, 'ironwall'], [34, 'steelpincer'], [40, 'tide'], [48, 'steelbeam'], [56, 'bigwave']];
const HARUBANG: L = [[1, 'pebble'], [1, 'glare'], [1, 'curl'], [30, 'rockdrop'], [36, 'press'], [42, 'quake'], [48, 'rockstorm'], [55, 'earthsplit']];
const ORGOL: L = [[1, 'telekinesis'], [1, 'spook'], [15, 'hoot'], [22, 'psybeam'], [30, 'soulwave'], [38, 'moonsign'], [44, 'nightdance']];
const SEOLHWA: L = [[1, 'twinkle'], [1, 'frostbreath'], [40, 'icefang'], [45, 'moondust'], [55, 'avalanche'], [62, 'snowblossom']];
const CHEOLSAN: L = [[1, 'mudthrow'], [1, 'ironclaw'], [40, 'quake'], [45, 'steelbeam'], [55, 'earthsplit'], [62, 'ironquake']];
const JUJAK: L = [[1, 'ember'], [1, 'gust'], [40, 'flamedash'], [45, 'wingcut'], [55, 'storm'], [62, 'phoenixfire']];
const CHEONGRYONG: L = [[1, 'zap'], [1, 'dragonbreath'], [40, 'bolt'], [45, 'dragontail'], [55, 'thunder'], [62, 'azurebolt']];
const EUNHA: L = [[1, 'splash'], [1, 'gust'], [20, 'breathe'], [25, 'wave'], [38, 'tide'], [45, 'storm'], [55, 'galaxy']];

type Def = Omit<SpeciesDef, 'no'>;
const s = (id: string, name: string, types: MonType[], b: [number, number, number, number], catchRate: number, baseExp: number,
  learnset: L, kind: string, desc: string, evolve?: [number, string], extra: Partial<Def> = {}): Def => ({
  id, name, types, base: { hp: b[0], atk: b[1], def: b[2], spe: b[3] }, catchRate, baseExp, learnset, kind, desc,
  evolve: evolve && { level: evolve[0], to: evolve[1] }, ...extra,
});

const list: Def[] = [
  // 불 스타터 — 공룡(트리케라톱스) + 불
  s('modak', '모닥뿔', ['불'], [44, 58, 44, 56], 45, 62, MODAK, '불씨공룡', '목 뒤의 프릴이 불씨처럼 빛나는 아기 뿔공룡. 기분이 좋으면 프릴 끝에서 불꽃이 톡톡 튄다.', [14, 'hwaro']),
  s('hwaro', '불꽃뿔', ['불'], [68, 86, 66, 72], 45, 142, MODAK, '불꽃공룡', '세 개의 뿔이 달궈진 쇠처럼 붉게 빛난다. 프릴에서 타오르는 불꽃으로 무리를 이끈다.', [32, 'hwasan']),
  s('hwasan', '화산뿔', ['불', '땅'], [92, 114, 92, 82], 45, 236, MODAK, '화산공룡', '등의 바위 판 사이로 용암이 흐른다. 프릴은 분화구처럼 불길을 뿜어 올린다.'),
  // 물 스타터 — 물범 + 물
  s('pong', '퐁당이', ['물'], [48, 48, 56, 48], 45, 63, PONG, '아기물범', '배를 깔고 미끄러지며 노는 아기 물범. 머리 위의 물방울 볏으로 물의 온도를 느낀다.', [14, 'mulbora']),
  s('mulbora', '물보라', ['물'], [76, 70, 82, 66], 45, 143, PONG, '곡예물범', '코끝에 물방울 공을 올려 두고 균형을 잡는다. 공이 커질수록 강해진다고 한다.', [32, 'haeil']),
  s('haeil', '해일왕', ['물', '얼음'], [106, 94, 106, 78], 45, 238, PONG, '얼음바다코끼리', '얼음 왕관을 쓴 바다의 왕. 엄니를 한 번 휘두르면 해일과 함께 빙산이 솟아오른다.'),
  // 풀 스타터 — 아기사슴 + 풀
  s('saesun', '새순이', ['풀'], [50, 50, 50, 50], 45, 64, SAESUN, '새싹사슴', '머리에 돋은 두 장의 새싹이 뿔이 될 준비를 한다. 햇볕을 쬐면 등의 무늬가 반짝인다.', [14, 'kkot']),
  s('kkot', '꽃사슴', ['풀'], [74, 74, 72, 72], 45, 142, SAESUN, '꽃사슴', '가지처럼 자란 뿔에 계절마다 다른 꽃이 핀다. 꽃향기를 따라 숲의 동물들이 모여든다.', [32, 'supji']),
  s('supji', '숲지기', ['풀', '페어리'], [100, 96, 98, 86], 45, 236, SAESUN, '숲의왕사슴', '나무처럼 자란 뿔 사이에 작은 빛들이 깃들어 산다. 숲지기가 지나간 자리엔 꽃이 핀다.'),
  // 들판
  s('tosil', '토실이', ['노말'], [50, 44, 40, 52], 255, 50, TOSIL, '햄스터', '양 볼에 해바라기씨를 잔뜩 넣고 다닌다. 놀라면 씨앗을 우르르 쏟아 버린다.', [15, 'tongsil']),
  s('tongsil', '통실이', ['노말'], [82, 74, 62, 74], 127, 120, TOSIL, '다람쥐', '몸보다 큰 복슬복슬한 꼬리로 균형을 잡는다. 도토리를 산더미처럼 모아 둔다.'),
  s('jjaek', '짹짹이', ['노말', '비행'], [40, 45, 38, 62], 255, 50, JJAEK, '참새', '아침마다 통통 뛰며 지저귄다. 무리 지어 다니며 서로의 깃털을 다듬어 준다.', [12, 'baramsae']),
  s('baramsae', '바람새', ['노말', '비행'], [58, 62, 54, 80], 120, 110, JJAEK, '제비', '갈라진 꼬리로 바람을 가르며 난다. 비가 오기 전이면 낮게 날아 알려 준다.', [28, 'hoeori']),
  s('hoeori', '회오리매', ['노말', '비행'], [80, 92, 72, 104], 45, 200, JJAEK, '독수리', '날개를 펼치면 회오리바람이 인다. 구름 위에서도 땅의 먹잇감을 놓치지 않는다.'),
  s('kkomul', '꼬물이', ['벌레'], [42, 34, 40, 40], 255, 39, KKOMUL, '애벌레', '하루 종일 잎을 갉아 먹는다. 몸의 노란 점무늬로 천적을 놀라게 한다.', [7, 'dandan']),
  s('dandan', '단단고치', ['벌레'], [48, 22, 72, 20], 120, 72, KKOMUL, '고치', '나뭇가지에 매달려 꼼짝하지 않는다. 고치 안에서는 날개가 조금씩 자라고 있다.', [10, 'naphul']),
  s('naphul', '나풀이', ['벌레', '비행'], [66, 70, 58, 82], 45, 160, KKOMUL, '보랏빛나방', '달밤에 날개의 가루를 반짝이며 춤춘다. 그 모습을 보면 행운이 온다는 말이 있다.'),
  s('monsil', '몽실이', ['페어리'], [56, 40, 52, 44], 200, 55, MONSIL, '구름양', '구름처럼 폭신한 털을 가진 아기 양. 안고 있으면 금세 잠이 쏟아진다.', [18, 'monggeul']),
  s('monggeul', '몽글양', ['페어리'], [92, 70, 86, 62], 90, 150, MONSIL, '솜사탕양', '분홍빛과 하늘빛 털이 솜사탕처럼 부풀었다. 털 속에서 별가루가 반짝인다.'),
  s('jjirit', '찌릿이', ['전기'], [40, 62, 36, 80], 120, 80, JJIRIT, '꼬마번개구름', '작은 구름 조각에 전기가 모여 태어났다. 기분이 좋으면 지그재그 꼬리에서 불꽃이 튄다.', [20, 'beongae']),
  s('beongae', '번개구름', ['전기', '비행'], [64, 92, 60, 100], 60, 160, JJIRIT, '먹구름', '화가 나면 몸에서 번개가 떨어진다. 비구름 속에 숨어 하늘을 떠돈다.'),
  s('ddakkum', '따끔이', ['전기'], [42, 50, 44, 64], 200, 58, DDAKKUM, '전기고슴도치', '등의 가시 끝에 정전기가 모인다. 쓰다듬으면 따끔하지만 무척 좋아한다.', [15, 'beonjjeok']),
  s('beonjjeok', '번쩍고슴', ['전기'], [62, 74, 64, 86], 90, 135, DDAKKUM, '반짝고슴도치', '기분이 좋으면 동그란 가시 끝이 전구처럼 번쩍번쩍 빛난다. 겁이 많지만 의리가 있다.', [30, 'noejeon']),
  s('noejeon', '뇌전고슴', ['전기'], [84, 106, 80, 112], 45, 228, DDAKKUM, '뇌전', '푸른 번개가 갈기처럼 흐른다. 번개보다 빨리 달려 천둥이 뒤늦게 따라온다고 한다.'),
  // 바위·격투
  s('doldol', '돌돌이', ['바위'], [48, 58, 80, 24], 150, 70, DOLDOL, '아르마딜로', '띠 모양의 돌 껍질로 몸을 감싼다. 위험하면 공처럼 몸을 말고 데굴데굴 굴러 도망친다.', [16, 'bawi']),
  s('bawi', '바위갑옷', ['바위'], [72, 88, 106, 34], 60, 150, DOLDOL, '바위아르마딜로', '껍질의 띠마다 날카로운 바위 가시가 자랐다. 산사태에도 꿈쩍하지 않는다.', [34, 'geoam']),
  s('geoam', '거암대왕', ['바위', '땅'], [100, 112, 130, 40], 45, 240, DOLDOL, '산맥', '등의 세 봉우리에는 일 년 내내 눈이 쌓여 있다. 잠든 모습은 작은 산맥처럼 보인다.'),
  s('kkaeng', '꼬마캥', ['격투'], [52, 66, 46, 58], 180, 62, KKAENG, '아기캥거루', '빨간 권투 장갑을 끼고 하루 종일 섀도복싱을 한다. 꼬리로 서서 버티는 힘이 대단하다.', [20, 'kwontu']),
  s('kwontu', '권투캥', ['격투'], [84, 108, 72, 88], 60, 165, KKAENG, '챔피언캥거루', '챔피언 벨트를 두른 캥거루. 꼬리로 몸을 받치고 두 발로 차는 기술이 특기다.'),
  // 숲
  s('pojani', '포자니', ['풀', '독'], [46, 48, 50, 30], 220, 55, POJA, '꼬마버섯', '축축한 나무 그늘을 좋아한다. 머리를 흔들면 반짝이는 포자가 흩날린다.', [13, 'beoseot']),
  s('beoseot', '버섯돌이', ['풀', '독'], [66, 70, 70, 42], 120, 125, POJA, '버섯', '갓 아래에 독 포자를 모아 둔다. 친구에게는 좋은 냄새가 나는 포자를 뿌려 준다.', [28, 'beoseotking']),
  s('beoseotking', '버섯대왕', ['풀', '독'], [94, 98, 96, 56], 45, 220, POJA, '버섯대왕', '우산처럼 큰 갓의 가장자리에 금빛 무늬가 있다. 숲속 버섯들의 왕이라고 전해진다.'),
  s('soejip', '쇠집게', ['벌레', '강철'], [50, 62, 72, 36], 150, 66, SOEJIP, '사슴벌레', '집게가 쇠처럼 단단한 사슴벌레. 나무 수액을 두고 다른 벌레와 힘겨루기를 한다.', [22, 'gangjip']),
  s('gangjip', '강철집게', ['벌레', '강철'], [76, 106, 112, 52], 60, 170, SOEJIP, '강철사슴벌레', '거대한 강철 집게로 바위도 두 동강 낸다. 등껍질은 거울처럼 빛을 반사한다.'),
  s('kkwae', '꾀돌이', ['악'], [46, 56, 40, 70], 180, 60, KKWAE, '너구리', '눈가의 검은 무늬가 가면 같다. 반짝이는 물건만 보면 몰래 집어 간다.', [22, 'dodug']),
  s('dodug', '도둑너구리', ['악'], [74, 92, 62, 104], 60, 160, KKWAE, '괴도너구리', '줄무늬 꼬리에 훔친 물건을 감춘다. 하지만 어려운 몬스터를 보면 몰래 먹을 것을 놓고 간다.'),
  // 고스트 — 도깨비
  s('dokbul', '도깨비불', ['고스트'], [40, 52, 40, 64], 150, 64, DOKBUL, '도깨비불', '밤의 숲을 떠도는 푸른 불꽃. 작은 뿔이 돋아 있고, 사람을 홀려 길을 잃게 하는 장난을 좋아한다.', [16, 'dokkae']),
  s('dokkae', '꼬마도깨비', ['고스트'], [60, 78, 56, 84], 90, 140, DOKBUL, '꼬마도깨비', '나무 방망이를 휘두르며 씨름을 좋아한다. 이기면 신이 나서 밤새 춤을 춘다.', [34, 'dokdae']),
  s('dokdae', '도깨비대장', ['고스트', '악'], [84, 110, 78, 98], 45, 232, DOKBUL, '도깨비대장', '금빛 방망이를 한 번 휘두르면 무엇이든 나온다는 전설의 도깨비. 정직한 자에게만 너그럽다.'),
  // 에스퍼 — 달토끼
  s('dalto', '달토끼', ['에스퍼'], [44, 50, 44, 66], 150, 62, DALTO, '달토끼', '이마에 초승달 무늬가 있는 아기 토끼. 보름달이 뜨면 귀 끝이 은은하게 빛난다.', [16, 'jeolgu']),
  s('jeolgu', '절구토끼', ['에스퍼'], [64, 76, 62, 86], 90, 140, DALTO, '방아토끼', '작은 절구로 떡을 찧으며 염동력을 모은다. 절구 소리가 들리면 다음 날은 맑다고 한다.', [32, 'wolgung']),
  s('wolgung', '월궁토끼', ['에스퍼', '페어리'], [82, 100, 80, 110], 45, 228, DALTO, '월궁', '보름달을 등에 지고 떠다닌다. 달빛 리본으로 길 잃은 이를 집까지 바래다준다.'),
  // 물·얼음
  s('banjjak', '반짝피라', ['물'], [38, 40, 42, 70], 255, 45, PIRA, '반짝물고기', '비늘이 햇빛에 반짝반짝 빛난다. 떼를 지어 헤엄치며 물 위로 톡톡 튀어 오른다.', [20, 'eungeo']),
  s('eungeo', '은빛잉어', ['물'], [88, 96, 80, 86], 60, 170, PIRA, '은빛잉어', '수십 년을 산 은빛잉어는 금빛 지느러미를 갖게 된다. 물안개마을의 수호 물고기다.'),
  s('agipeng', '아기펭귄', ['얼음'], [50, 50, 50, 40], 160, 60, PENG, '아기펭귄', '머리의 얼음 깃털이 자랑거리. 뒤뚱뒤뚱 걷다가 배로 미끄러지는 게 더 빠르다.', [24, 'eolpeng']),
  s('eolpeng', '얼음펭귄', ['얼음', '물'], [86, 90, 92, 70], 60, 165, PENG, '빙하펭귄', '얼음 갑옷과 고드름 목도리를 둘렀다. 지느러미 날개로 얼음을 칼처럼 벤다.'),
  // 드래곤
  s('kkomaryong', '꼬마룡', ['드래곤'], [46, 58, 48, 52], 45, 70, RYONG, '아기용', '알껍데기를 바지처럼 입고 다니는 아기 용. 작은 날개로는 아직 날지 못한다.', [25, 'nalgae']),
  s('nalgae', '날개룡', ['드래곤'], [70, 86, 70, 76], 45, 150, RYONG, '날개용', '단단한 비늘과 넓은 날개가 자랐다. 하늘을 나는 연습을 하다 산을 들이받기도 한다.', [40, 'cheonryong']),
  s('cheonryong', '천룡', ['드래곤', '비행'], [100, 124, 92, 92], 45, 270, RYONG, '천룡', '구름 사이를 헤엄치는 용. 여의주를 쥐고 있으며, 천룡이 나는 날에는 단비가 내린다.'),
  // 추가 몬스터
  s('gungo', '군고미', ['불'], [52, 54, 58, 36], 120, 64, GUNGO, '군고구마', '겨울 길거리에서 태어난 군고구마 몬스터. 갈라진 껍질 틈으로 달콤한 김이 모락모락 난다.', [24, 'jangjak']),
  s('jangjak', '장작고미', ['불', '강철'], [88, 90, 104, 50], 60, 170, GUNGO, '드럼통화로', '드럼통 화로에 들어앉은 군고미. 추운 날이면 사람들이 모여들어 손을 녹인다.'),
  s('munu', '꼬마문어', ['물'], [46, 50, 46, 56], 190, 58, MUNU, '꼬마문어', '동글동글한 머리에 짧은 다리 네 개. 놀라면 먹물을 찍 뿌리고 도망친다.', [18, 'meokmul']),
  s('meokmul', '먹물문어', ['물', '악'], [70, 80, 64, 72], 90, 140, MUNU, '먹물문어', '먹물로 바다에 그림을 그리며 논다. 장난을 들키면 먹물 속으로 쏙 숨는다.', [34, 'daewang']),
  s('daewang', '대왕문어', ['물', '악'], [100, 108, 88, 74], 45, 230, MUNU, '대왕문어', '배 한 척을 다리 여덟 개로 들어 올린다. 선장 모자처럼 생긴 머리 지느러미가 자랑이다.'),
  s('agigom', '아기곰돌', ['격투'], [58, 64, 50, 40], 150, 64, GOM, '아기곰', '씨름 흉내를 내며 나무를 밀어 댄다. 아직은 나무가 이긴다.', [18, 'satba']),
  s('satba', '샅바곰', ['격투'], [84, 92, 72, 54], 80, 150, GOM, '씨름곰', '허리에 흰 샅바를 두른 곰. 마을 씨름판에 나타나 모래판을 휩쓴다.', [36, 'jangsa']),
  s('jangsa', '장사곰', ['격투', '땅'], [112, 124, 96, 58], 45, 240, GOM, '천하장사', '금빛 샅바를 두른 천하장사. 한 번 들배지기를 하면 산도 들썩인다고 한다.'),
  s('ggangtong', '깡통이', ['강철'], [44, 48, 64, 46], 160, 62, TONG, '깡통로봇', '버려진 깡통에 전기가 깃들어 움직이기 시작했다. 바퀴 하나로 데굴데굴 굴러다닌다.', [16, 'cheolgap']),
  s('cheolgap', '철갑봇', ['강철'], [66, 80, 96, 58], 80, 145, TONG, '철갑로봇', '두 팔이 생겨 무거운 짐을 척척 나른다. 눈의 바이저가 깜빡이면 기분이 좋다는 뜻이다.', [32, 'geosin']),
  s('geosin', '거신봇', ['강철', '전기'], [92, 112, 124, 66], 45, 236, TONG, '거신로봇', '가슴의 번개 엔진이 돌면 하늘로 날아오른다. 아이들의 영웅이다.'),
  s('nunnyang', '눈냥이', ['얼음'], [44, 54, 42, 72], 160, 60, NYANG, '아기눈고양이', '꼬리 끝에 눈송이가 달린 아기 고양이. 눈 위를 뛰어다녀도 발자국이 남지 않는다.', [26, 'seolpyo']),
  s('seolpyo', '설표', ['얼음'], [80, 104, 70, 112], 60, 172, NYANG, '설표', '눈 덮인 산을 소리 없이 달린다. 얼음 결정 같은 꼬리로 눈보라를 일으킨다.'),
  s('mongmong', '몽몽이', ['페어리'], [56, 50, 50, 56], 180, 60, MONG, '솜뭉치강아지', '털이 솜뭉치처럼 둥근 강아지. 리본을 매 주면 하루 종일 꼬리를 흔든다.', [22, 'wangmong']),
  s('wangmong', '왕몽이', ['페어리'], [96, 88, 82, 80], 60, 168, MONG, '왕관강아지', '머리털이 왕관처럼 솟았다. 하트 목걸이가 반짝이면 친구를 지키려는 신호다.'),
  s('ggorichim', '꼬리침', ['독'], [44, 56, 56, 48], 160, 60, CHIM, '꼬마전갈', '말린 꼬리 끝의 독침을 자랑스럽게 치켜든다. 겁이 많아서 금방 숨어 버린다.', [24, 'dokjeongal']),
  s('dokjeongal', '독전갈', ['독', '땅'], [76, 98, 100, 66], 60, 168, CHIM, '독전갈', '커다란 집게로 바위를 부수고, 꼬리의 독침으로 모래 폭풍 속 먹잇감을 노린다.'),
  s('bueong', '부엉꼬마', ['비행', '에스퍼'], [52, 44, 46, 56], 170, 58, BUEONG, '아기부엉이', '밤이 되면 동그란 눈이 빛난다. 고개를 한 바퀴 돌리며 주위를 살핀다.', [22, 'olppaemi']),
  s('olppaemi', '달빛올빼미', ['비행', '에스퍼'], [84, 80, 72, 96], 60, 168, BUEONG, '달빛올빼미', '가슴의 초승달 무늬로 달빛을 모은다. 달빛올빼미가 우는 밤엔 좋은 꿈을 꾼다고 한다.'),
  // 파스텔 몬스터 — 솜사탕언덕
  s('makarong', '마카롱이', ['페어리'], [50, 46, 56, 44], 190, 58, MAKA, '마카롱', '분홍 껍질 사이에 달콤한 크림이 들어 있다. 기분이 좋으면 몸에서 딸기 향이 난다.', [24, 'makatop']),
  s('makatop', '마카롱탑', ['페어리'], [88, 76, 96, 62], 70, 160, MAKA, '마카롱탑', '분홍, 민트, 보라 마카롱 세 개가 쌓였다. 꼭대기의 딸기를 지키려고 힘을 합친다.'),
  s('jelly', '몽글해파리', ['물', '페어리'], [50, 40, 46, 56], 180, 58, JELLY, '솜사탕해파리', '솜사탕 같은 갓을 동동 띄우고 떠다닌다. 리본 같은 다리에 닿으면 살짝 찌릿하다.', [26, 'aurora']),
  s('aurora', '오로라해파리', ['물', '페어리'], [90, 76, 80, 84], 60, 166, JELLY, '오로라해파리', '갓에 분홍, 민트, 보랏빛 오로라가 일렁인다. 밤바다에 떠오르면 바다가 무지갯빛으로 빛난다.'),
  s('agiyuni', '아기유니', ['페어리'], [46, 52, 44, 60], 120, 64, UNI, '아기유니콘', '아직 뿔이 말랑한 아기 유니콘. 파스텔빛 갈기를 살랑이며 꽃밭을 뛰어다닌다.', [18, 'mujigae']),
  s('mujigae', '무지개유니', ['페어리'], [70, 80, 66, 86], 60, 150, UNI, '무지개유니콘', '달릴 때마다 갈기에서 무지개가 흘러나온다. 비 온 뒤에 가장 기운이 넘친다.', [34, 'byeolkkum']),
  s('byeolkkum', '별꿈유니', ['페어리', '에스퍼'], [92, 104, 86, 106], 45, 238, UNI, '별꿈유니콘', '별 모양 뿔로 잠든 아이들에게 좋은 꿈을 보내 준다고 한다. 밤하늘빛 갈기에 별이 반짝인다.'),
  s('pongduck', '퐁퐁오리', ['물'], [48, 46, 46, 50], 200, 54, DUCK, '아기오리', '노란 솜털에 파란 장화를 신은 아기 오리. 물웅덩이만 보면 퐁퐁 뛰어든다.', [22, 'ubiduck']),
  s('ubiduck', '우비오리', ['물', '비행'], [80, 78, 72, 84], 80, 150, DUCK, '우비오리', '노란 우비를 입고 작은 우산을 든다. 우산을 펼치고 바람을 타 하늘을 날아다닌다.'),
  s('kkotip', '꽃잎새', ['풀', '비행'], [42, 46, 40, 64], 190, 54, PETAL, '꽃잎새', '머리에 벚꽃잎 볏이 달린 작은 새. 봄이 오면 가장 먼저 노래한다.', [24, 'beotkkot']),
  s('beotkkot', '벚꽃새', ['풀', '비행'], [72, 82, 66, 98], 70, 158, PETAL, '벚꽃새', '날개를 펼치면 벚꽃잎이 흩날린다. 벚꽃새가 지나간 길에는 꽃비가 내린다.'),
  s('suguk', '수국달팽', ['풀'], [52, 40, 66, 24], 190, 56, SNAIL, '수국달팽이', '껍데기에 수국 꽃이 피어 있는 달팽이. 비가 오면 꽃 색깔이 바뀐다.', [26, 'jangma']),
  s('jangma', '장마달팽', ['풀', '물'], [90, 72, 104, 40], 70, 160, SNAIL, '장마달팽이', '수국 꽃다발 같은 껍데기를 이고 다닌다. 장마철이면 더듬이 끝에 빗방울이 맺힌다.'),
  s('bingsu', '빙수방울', ['얼음'], [48, 46, 52, 46], 180, 58, BING, '빙수', '컵 속의 눈꽃빙수에 깃든 몬스터. 시럽 색이 기분에 따라 바뀐다.', [26, 'wangbingsu']),
  s('wangbingsu', '왕빙수', ['얼음', '페어리'], [86, 84, 90, 70], 60, 165, BING, '왕빙수', '딸기와 망고, 떡을 잔뜩 얹은 왕빙수. 더운 날 나타나 모두에게 시원함을 나눠 준다.'),
  // 서리마을 · 용의 마을
  s('agibuk', '아기북곰', ['얼음'], [60, 60, 54, 36], 120, 66, BUKGOM, '아기북극곰', '눈밭에서 데굴데굴 구르며 노는 아기 북극곰. 차가운 물고기를 제일 좋아한다.', [30, 'bingsan']),
  s('bingsan', '빙산곰', ['얼음', '격투'], [104, 118, 92, 58], 45, 236, BUKGOM, '빙산곰', '등에 빙산 같은 얼음 갑옷을 두른 거대한 곰. 주먹 한 번에 얼음벽이 무너진다.'),
  s('hyeonmuk', '꼬마현무', ['물'], [56, 50, 66, 34], 45, 70, HYEON, '아기거북', '등딱지에 작은 뱀 무늬가 있는 아기 거북. 용의 마을의 연못에서만 알을 깬다.', [36, 'hyeonmu']),
  s('hyeonmu', '현무', ['물', '드래곤'], [108, 96, 122, 54], 45, 240, HYEON, '현무', '등딱지를 감싼 검은 뱀과 함께 다니는 거북. 북쪽 바다를 지키는 수호자라고 전해진다.'),
  // 특별한 몬스터
  s('sangun', '산군', ['바위', '고스트'], [100, 118, 92, 110], 20, 250, SANGUN, '산신령', '운무봉을 지키는 흰 호랑이의 정령. 숲·물·바위의 세 방울 소리를 들으면 서낭당으로 내려온다고 전해진다.', undefined, { special: true }),
  // ── 초반 지역 ──
  s('bungbung', '붕붕이', ['벌레'], [40, 38, 40, 52], 255, 40, BUNG, '꼬마벌', '꽃밭 위를 붕붕 날며 꽃가루를 모은다. 동그란 몸이 너무 무거워서 가끔 꽃잎 위에 털썩 주저앉는다.', [9, 'kkuldanji']),
  s('kkuldanji', '꿀단지벌', ['벌레'], [58, 42, 78, 36], 120, 100, BUNG, '꿀단지', '꿀이 가득 찬 항아리 모양의 집 안에서 쉬며 여왕이 될 날을 기다린다. 단단한 항아리가 몸을 지켜 준다.', [20, 'yeowangbeol']),
  s('yeowangbeol', '여왕벌', ['벌레', '페어리'], [82, 86, 78, 98], 45, 210, BUNG, '여왕벌', '작은 왕관을 쓴 꿀벌의 여왕. 날갯짓으로 반짝이는 꽃가루를 흩뿌리면 들판의 꽃이 한꺼번에 핀다.'),
  s('meongmeong', '멍뭉이', ['노말'], [55, 55, 45, 52], 190, 60, MEONG, '강아지', '꼬리를 쉬지 않고 흔드는 동네 강아지. 처음 보는 사람에게도 배를 보이며 뒹군다.', [18, 'baekgu']),
  s('baekgu', '백구', ['노말'], [75, 80, 62, 72], 120, 140, MEONG, '진돗개', '하얀 털이 눈부신 충직한 개. 한 번 주인으로 정한 사람은 아무리 멀리 떨어져도 반드시 찾아온다.', [34, 'jindodaejang']),
  s('jindodaejang', '진도대장', ['노말', '격투'], [98, 112, 82, 92], 45, 230, MEONG, '대장개', '동네 개들을 이끄는 우두머리. 붉은 목도리를 휘날리며 약한 몬스터를 괴롭히는 녀석을 혼내 준다.'),
  s('dotori', '도토리람쥐', ['노말'], [44, 46, 38, 64], 230, 52, DOTORI, '다람쥐', '볼주머니에 도토리를 가득 넣고 다닌다. 묻어 둔 곳을 자주 잊어버려서 숲 곳곳에 참나무가 자란다.', [16, 'cheongseolmo']),
  s('cheongseolmo', '청설모', ['노말'], [70, 82, 60, 98], 90, 145, DOTORI, '청설모', '잿빛 털과 커다란 꼬리를 가진 날쌘 몬스터. 나무 사이를 날 듯이 건너뛰며 도토리를 지킨다.'),
  s('bandi', '반디', ['벌레'], [38, 36, 40, 62], 220, 50, BANDI, '반딧불', '꼬리 끝에서 연둣빛 불빛이 깜빡인다. 여름밤 숲속에서 무리 지어 날며 길을 밝혀 준다.', [14, 'banjjakbandi']),
  s('banjjakbandi', '반짝반디', ['벌레', '전기'], [56, 60, 54, 84], 120, 120, BANDI, '번개반디', '꼬리의 불빛에 전기가 흐르게 된 반디. 깜빡임으로 동료들과 이야기한다.', [30, 'byeolbitbandi']),
  s('byeolbitbandi', '별빛반디', ['벌레', '전기'], [78, 94, 72, 118], 45, 215, BANDI, '별빛반디', '밤하늘의 별처럼 빛나는 반디. 수백 마리가 함께 날면 동굴 천장이 은하수처럼 보인다.'),
  s('jipgesasum', '집게사슴', ['벌레', '격투'], [56, 72, 62, 44], 120, 70, SASUM, '사슴벌레', '커다란 집게로 나무에 매달려 수액을 핥는다. 집게 힘겨루기를 좋아해서 만나면 일단 붙잡고 본다.', [28, 'jangsu']),
  s('jangsu', '장수사슴벌레', ['벌레', '격투'], [84, 114, 98, 62], 45, 185, SASUM, '장수벌레', '숲에서 가장 힘센 벌레. 거대한 집게로 바위를 들어 올리며, 숲을 어지럽히는 자와는 정정당당히 겨룬다.'),
  // ── 중반 지역 ──
  s('dukeop', '꼬마두껍', ['독'], [54, 48, 50, 38], 200, 58, DUKEOP, '두꺼비', '연잎 위에 앉아 졸고 있는 작은 두꺼비. 등의 혹에서 살짝 매운 독물이 나와 몸을 지킨다.', [18, 'dokdukeop']),
  s('dokdukeop', '독두꺼비', ['독'], [74, 72, 70, 56], 120, 140, DUKEOP, '독두꺼비', '늪에서 보랏빛 거품을 뿜는다. 울음소리가 너무 커서 비 오는 밤 물안개마을 사람들은 잠을 설친다.', [34, 'dukeopwang']),
  s('dukeopwang', '두꺼비왕', ['독', '땅'], [104, 104, 96, 64], 45, 228, DUKEOP, '두꺼비왕', '늪의 왕. 앉은 자리에서 땅을 울리면 늪 전체가 출렁이고, 등의 혹에서 짙은 독안개가 피어오른다.'),
  s('geomi', '꼬마거미', ['벌레'], [40, 48, 40, 50], 220, 52, GEOMI, '꼬마거미', '밤새 작은 거미줄을 치고, 아침 이슬이 맺히면 자랑스럽게 구경한다.', [18, 'geumul']),
  s('geumul', '그물거미', ['벌레', '악'], [62, 76, 58, 72], 120, 135, GEOMI, '그물거미', '동굴 입구에 커다란 그물을 치고 숨어서 기다린다. 등의 무늬가 웃는 얼굴처럼 보여 겁을 준다.', [33, 'wanggeomi']),
  s('wanggeomi', '왕거미', ['벌레', '악'], [88, 106, 82, 94], 45, 225, GEOMI, '왕거미', '여덟 개의 붉은 눈으로 어둠 속을 꿰뚫어 본다. 강철처럼 질긴 실로 동굴 전체를 자기 영역으로 만든다.'),
  s('dujji', '땅콩두지', ['땅'], [50, 56, 56, 38], 200, 60, DUJJI, '두더지', '땅콩 껍데기 모양의 단단한 머리로 흙을 판다. 햇빛을 보면 눈이 부셔서 금방 다시 땅속으로 들어간다.', [26, 'gulchak']),
  s('gulchak', '굴착두지', ['땅', '강철'], [78, 100, 92, 62], 75, 165, DUJJI, '굴착두더지', '강철 드릴처럼 변한 코와 발톱으로 바위도 순식간에 뚫는다. 광부들이 가장 반기는 몬스터.'),
  s('jogae', '고대조개', ['바위', '벌레'], [56, 64, 92, 40], 45, 72, TUGU, '화석', '아주 먼 옛날 바닷속에 살던 몬스터. 별빛동굴의 껍질화석에서 되살아났다. 단단한 껍데기 아래로 작은 다리가 꼼지락거린다.', [40, 'godaetugu']),
  s('godaetugu', '고대투구', ['바위', '벌레'], [80, 112, 108, 68], 45, 200, TUGU, '고대투구', '투구 같은 껍데기와 낫 같은 앞발을 가졌다. 수억 년 전 바다의 사냥꾼이었다고 한다.'),
  s('kkomasijo', '꼬마시조', ['바위', '비행'], [54, 72, 50, 72], 45, 72, SIJO, '화석', '깃털과 이빨을 함께 가진 고대의 작은 새. 별빛동굴의 날개화석에서 되살아났다. 아직 잘 날지 못해서 폴짝폴짝 뛰어다닌다.', [40, 'sijosae']),
  s('sijosae', '시조새', ['바위', '비행'], [80, 108, 72, 102], 45, 200, SIJO, '시조새', '돌처럼 단단한 날개로 고대의 하늘을 누볐다. 날카로운 울음소리가 동굴 벽을 울린다.'),
  s('kkakkak', '깍깍이', ['악', '비행'], [46, 56, 40, 66], 200, 60, KKAK, '까마귀', '반짝이는 물건을 보면 참지 못하고 물어 간다. 둥지에는 단추와 동전, 팜팜볼 뚜껑이 가득하다.', [32, 'kkamagwi']),
  s('kkamagwi', '까마귀왕', ['악', '비행'], [82, 104, 70, 98], 75, 170, KKAK, '까마귀왕', '해 질 녘 수백 마리 까마귀를 거느리고 하늘을 덮는다. 깃털 끝이 별빛처럼 반짝인다.'),
  s('sutdol', '숯돌이', ['바위'], [52, 50, 64, 28], 200, 58, SUTDOL, '숯덩이', '해변 모닥불 자리에서 태어난 숯 덩어리 몬스터. 쓰다듬으면 손이 새카매지지만 무척 따뜻하다.', [28, 'hwarotdol']),
  s('hwarotdol', '화롯돌', ['불', '바위'], [72, 78, 90, 38], 120, 142, SUTDOL, '화로', '배 속에 숯불을 품은 화로 모양의 몬스터. 겨울이면 불꽃마을 사람들이 곁에 모여 손을 녹인다.', [38, 'gamasot']),
  s('gamasot', '가마솥대장', ['불', '바위'], [102, 108, 118, 48], 45, 230, SUTDOL, '가마솥', '무쇠 가마솥을 뒤집어쓴 듯한 거대한 몬스터. 뚜껑을 들썩이며 뜨거운 김을 뿜으면 화산도 잠잠해진다.'),
  // ── 악당·리그 직전 ──
  s('maekae', '매캐이', ['독'], [48, 52, 46, 52], 190, 60, MAEKAE, '매연', '굴뚝 연기에서 태어난 작은 연기 덩어리. 검은안개단이 즐겨 데리고 다니며, 몸에서 매캐한 냄새가 난다.', [20, 'yeongi']),
  s('yeongi', '먹구름연기', ['독', '악'], [68, 78, 66, 72], 120, 140, MAEKAE, '먹연기', '먹구름처럼 뭉게뭉게 피어오르는 독연기. 연기 속에 숨어 상대를 놀라게 하고 물건을 훔쳐 간다.', [36, 'amheuk']),
  s('amheuk', '암흑안개', ['독', '악'], [92, 106, 88, 94], 45, 228, MAEKAE, '암흑안개', '온 마을을 뒤덮을 만큼 짙은 검은 안개. 검은안개단이라는 이름은 이 몬스터에서 따왔다고 한다.'),
  s('jangseung', '꼬마장승', ['풀', '고스트'], [58, 64, 66, 42], 120, 150, JANGSEUNG, '장승', '마을 입구를 지키던 나무 장승에 혼이 깃들었다. 나쁜 기운이 다가오면 눈을 부릅뜨고 길을 막는다.', [46, 'cheonha']),
  s('cheonha', '천하대장군', ['풀', '고스트'], [96, 108, 104, 60], 45, 228, JANGSEUNG, '대장군', '해솔고원 길목을 지켜 온 거대한 장승. 리그에 오르는 트레이너의 각오를 시험한다고 전해진다.'),
  s('yeolgigu', '열기구곰', ['비행'], [86, 72, 80, 92], 45, 175, GIGU, '열기구', '알록달록한 열기구에 작은 곰이 매달려 있다. 바람 부는 날이면 고원 위를 둥실둥실 떠다니며 손을 흔든다.'),
  s('orgol', '오르골인형', ['에스퍼', '고스트'], [70, 80, 78, 100], 45, 180, ORGOL, '오르골', '오르골 위 발레리나 인형에 깃든 혼. 태엽을 감지 않아도 밤이면 저절로 춤추며 잠을 부르는 멜로디를 울린다.'),
  // ── 갈래 진화·특수 ──
  s('kkoribyeol', '꼬리별여우', ['노말'], [48, 50, 44, 62], 120, 64, YEOU, '별꼬리', '꼬리 끝에 작은 별이 반짝이는 아기 여우. 어떤 돌을 만나느냐에 따라 전혀 다른 모습으로 자란다고 한다.', undefined, { stones: { firestone: 'bulyeou', shadestone: 'geuneulyeou', thornstone: 'gasiyeou' } }),
  s('bulyeou', '불여우', ['불', '에스퍼'], [76, 92, 70, 96], 45, 198, BULYEOU, '여우불', '아홉 갈래 꼬리 끝마다 여우불이 타오른다. 불꽃으로 상대의 마음을 읽고 홀린다고 전해진다.'),
  s('geuneulyeou', '그늘여우', ['고스트'], [80, 90, 74, 90], 45, 198, GEUNEUL, '그림자여우', '해가 지면 그림자 속으로 스며드는 여우. 보랏빛 눈만이 어둠 속에서 은은하게 빛난다.'),
  s('gasiyeou', '가시여우', ['독'], [84, 92, 82, 76], 45, 198, GASI, '가시여우', '꼬리털이 독가시 덩굴로 변했다. 화가 나면 가시를 곤두세우고 보랏빛 독을 흩뿌린다.'),
  s('kkomadorong', '꼬마도롱', ['드래곤'], [52, 60, 52, 50], 75, 70, DORONG, '도롱뇽용', '용의 마을 개울가에 사는 도롱뇽을 닮은 아기 용. 진흙 속에 숨어 낮잠 자는 걸 좋아한다.', [40, 'mireudorong']),
  s('mireudorong', '미르도롱', ['드래곤', '땅'], [86, 100, 88, 70], 45, 220, DORONG, '미르', '땅속 깊은 물길을 따라 헤엄치는 용. 미르는 옛말로 용을 뜻하며, 지나간 자리에는 샘이 솟는다.'),
  s('geumdukeop', '금두꺼비', ['강철'], [55, 45, 90, 150], 30, 400, GEUMDU, '복두꺼비', '온몸이 황금빛으로 빛나는 두꺼비. 만나면 복이 온다고 하지만, 눈 깜짝할 새 도망쳐 버린다.', undefined, { flees: true }),
  s('geobukseon', '거북선', ['물', '강철'], [86, 90, 104, 58], 45, 210, GEOBUK, '철갑거북', '등껍질이 철갑선처럼 단단한 거북. 용머리 같은 입에서 뜨거운 물대포를 뿜어 바다를 지킨다.'),
  s('dolharubang', '돌하르방', ['바위'], [92, 96, 110, 40], 45, 205, HARUBANG, '돌할아버지', '구멍이 송송 난 현무암 몸을 가진 몬스터. 마을 어귀에 묵묵히 서서 나쁜 기운을 막아 준다.'),
  // ── 유령선과 고스트 ──
  s('chorong', '초롱이', ['불'], [44, 50, 42, 60], 190, 58, CHORONG, '초롱', '밤길을 밝히던 종이 초롱에 작은 불씨가 깃들었다. 길 잃은 사람을 졸졸 따라다니며 발밑을 비춰 준다.', [22, 'cheongsa']),
  s('cheongsa', '청사초롱', ['불', '고스트'], [62, 72, 60, 82], 120, 140, CHORONG, '혼불초롱', '푸른 비단과 붉은 비단을 두른 초롱. 안에서 타는 불은 뜨겁지 않고 푸르스름하게 일렁인다.', [36, 'dokkaechorong']),
  s('dokkaechorong', '도깨비초롱', ['불', '고스트'], [84, 104, 76, 110], 45, 228, CHORONG, '도깨비불', '뿔 달린 도깨비가 초롱을 뒤집어쓴 모습. 깊은 밤 바닷가에 수십 개의 초롱불을 띄워 배를 홀린다고 한다.'),
  s('mulgwi', '물귀신', ['물', '고스트'], [58, 60, 56, 48], 170, 66, MULGWI, '물귀신', '젖은 머리카락을 늘어뜨린 채 물가에 서 있는 혼. 발목을 붙잡는다는 소문과 달리 사실은 외로움을 많이 탄다.', [32, 'yuseon']),
  s('yuseon', '유령선장', ['물', '고스트'], [96, 100, 86, 78], 60, 205, MULGWI, '유령선장', '낡은 선장 모자를 쓰고 안개 속을 떠도는 혼. 바다에서 길 잃은 배를 항구까지 이끌어 준다고 한다.'),
  s('haegol', '해골앵무', ['고스트', '비행'], [45, 56, 40, 72], 180, 62, HAEGOL, '해골새', '해적선 돛대에 앉아 있던 앵무새의 혼. 들은 말을 똑같이 따라 해서 선원들을 놀래 준다.', [30, 'yuaeng']),
  s('yuaeng', '유령앵무', ['고스트', '비행'], [72, 94, 62, 106], 75, 168, HAEGOL, '유령새', '안개처럼 흩날리는 깃털을 가진 앵무새. 한밤중 바다 위를 날며 옛 뱃노래를 부른다.'),
  s('bomulgoe', '보물상자도깨비', ['고스트'], [72, 92, 108, 40], 45, 190, BOMUL, '보물상자', '보물상자 속에 숨어 사는 도깨비. 뚜껑을 여는 사람을 덥석 물고는, 마음에 들면 금화를 하나 건넨다.'),
  s('seolhwa', '설화', ['얼음', '페어리'], [100, 108, 95, 118], 5, 290, SEOLHWA, '눈꽃사슴', '서리마을 얼음굴 가장 깊은 곳에 산다는 수호신. 뿔에 맺힌 눈꽃이 녹지 않는 한 겨울이 끝나지 않는다고 전해진다.', undefined, { legend: true }),
  s('cheolsan', '철산', ['땅', '강철'], [120, 125, 120, 60], 5, 290, CHEOLSAN, '무쇠산', '별빛동굴 가장 깊은 갱도를 지키는 수호신. 무쇠 같은 몸이 움직일 때마다 산이 울린다고 한다.', undefined, { legend: true }),
  s('jujak', '주작', ['불', '비행'], [105, 118, 92, 120], 5, 290, JUJAK, '붉은새', '불꽃산 깊은 곳에서 남쪽 하늘을 지키는 사신. 날갯짓 한 번에 화산이 잠든다고 한다.', undefined, { legend: true }),
  s('cheongryong', '청룡', ['전기', '드래곤'], [108, 122, 95, 118], 5, 290, CHEONGRYONG, '푸른용', '동쪽 하늘을 지키는 사신. 세 수호신이 한자리에 모이면 번개와 함께 용의 둥지에 내려온다고 한다.', undefined, { legend: true }),
  s('cheonji', '천지', ['드래곤', '에스퍼'], [115, 125, 105, 112], 10, 320, CHEONJI, '태초', '해솔 지방의 하늘과 땅을 처음 갈라놓았다는 전설의 용. 해와 달을 품은 구슬을 쥐고 구름 위 신전에 머문다.', undefined, { legend: true }),
  s('eunha', '은하고래', ['물', '비행'], [120, 110, 100, 90], 25, 260, EUNHA, '은하', '별빛동굴 지하 호수에 잠든 전설의 몬스터. 깨어나면 밤하늘을 헤엄치며 별을 뿌린다고 전해진다.', undefined, { legend: true }),
  // 땅 (뒤쪽 배치)
  s('jinheuk', '진흙이', ['땅'], [56, 56, 60, 30], 190, 60, JINHEUK, '진흙덩이', '비 온 다음 날 진흙 웅덩이에서 태어난다. 몸이 마르면 기운이 없어진다.', [16, 'heukjang']),
  s('heukjang', '흙장수', ['땅'], [80, 84, 84, 40], 90, 140, JINHEUK, '흙장사', '굵은 팔로 바위도 번쩍 든다. 동굴 공사를 돕는 일꾼으로 사랑받는다.', [32, 'daeji']),
  s('daeji', '대지거인', ['땅', '바위'], [110, 116, 110, 44], 45, 236, JINHEUK, '대지', '머리 위에 풀이 자랄 만큼 오래 산다. 한 걸음마다 땅이 쿵 울린다.'),
];

// Dex order: put the 땅 line next to the 바위 line, and the two special monsters last.
const ORDER = [
  'modak', 'hwaro', 'hwasan', 'pong', 'mulbora', 'haeil', 'saesun', 'kkot', 'supji',
  'tosil', 'tongsil', 'jjaek', 'baramsae', 'hoeori', 'kkomul', 'dandan', 'naphul', 'monsil', 'monggeul',
  'jjirit', 'beongae', 'ddakkum', 'beonjjeok', 'noejeon',
  'doldol', 'bawi', 'geoam', 'jinheuk', 'heukjang', 'daeji', 'kkaeng', 'kwontu',
  'pojani', 'beoseot', 'beoseotking', 'soejip', 'gangjip', 'kkwae', 'dodug',
  'dokbul', 'dokkae', 'dokdae', 'dalto', 'jeolgu', 'wolgung',
  'banjjak', 'eungeo', 'munu', 'meokmul', 'daewang', 'agipeng', 'eolpeng', 'nunnyang', 'seolpyo',
  'gungo', 'jangjak', 'agigom', 'satba', 'jangsa', 'ggangtong', 'cheolgap', 'geosin',
  'mongmong', 'wangmong', 'ggorichim', 'dokjeongal', 'bueong', 'olppaemi',
  'makarong', 'makatop', 'jelly', 'aurora', 'agiyuni', 'mujigae', 'byeolkkum',
  'pongduck', 'ubiduck', 'kkotip', 'beotkkot', 'suguk', 'jangma', 'bingsu', 'wangbingsu',
  'agibuk', 'bingsan', 'hyeonmuk', 'hyeonmu',
  'kkomaryong', 'nalgae', 'cheonryong',
  'bungbung', 'kkuldanji', 'yeowangbeol', 'meongmeong', 'baekgu', 'jindodaejang', 'dotori', 'cheongseolmo', 'bandi', 'banjjakbandi', 'byeolbitbandi', 'jipgesasum', 'jangsu',
  'dukeop', 'dokdukeop', 'dukeopwang', 'geomi', 'geumul', 'wanggeomi', 'dujji', 'gulchak', 'jogae', 'godaetugu', 'kkomasijo', 'sijosae', 'kkakkak', 'kkamagwi', 'sutdol', 'hwarotdol', 'gamasot',
  'maekae', 'yeongi', 'amheuk', 'jangseung', 'cheonha', 'yeolgigu', 'orgol',
  'chorong', 'cheongsa', 'dokkaechorong', 'mulgwi', 'yuseon', 'haegol', 'yuaeng', 'bomulgoe',
  'kkoribyeol', 'bulyeou', 'geuneulyeou', 'gasiyeou', 'kkomadorong', 'mireudorong', 'geumdukeop', 'geobukseon', 'dolharubang',
  'sangun', 'eunha', 'seolhwa', 'cheolsan', 'jujak', 'cheongryong', 'cheonji',
];
const byId = Object.fromEntries(list.map((d) => [d.id, d]));
export const SPECIES_LIST: SpeciesDef[] = ORDER.map((id, i) => ({ ...byId[id], no: i + 1 }));
export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(SPECIES_LIST.map((d) => [d.id, d]));

/** Species removed from the game, mapped to their replacements (for old saves). */
export const RENAMED: Record<string, string> = { taldol: 'dokbul', talgwang: 'dokkae', taldae: 'dokdae' };
