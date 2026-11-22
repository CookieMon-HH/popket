import { W as SW, BW as W, box, text, centered, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { Widget } from '../engine/ui';
import { clock } from '../engine/timing';
import { game } from './state';
import { MAPS } from './maps';

// ---------------------------------------------------------------------------
// 해솔 지방 지도: a hand-laid schematic of every town, route and landmark.
// Places the player has not visited yet are shown as「???」.

type Kind = 'town' | 'route' | 'place';
interface Node { id: string; name: string; x: number; y: number; kind: Kind; maps: string[]; desc: string; color?: string }

const N: Node[] = [
  { id: 'town1', name: '솔빛마을', x: 46, y: 150, kind: 'town', maps: ['town1', 'home', 'lab'], desc: '햇살이 가장 먼저 닿는 시작의 마을. 풍차와 밭이 있다.', color: '#f0a050' },
  { id: 'route1', name: '1번 도로', x: 46, y: 132, kind: 'route', maps: ['route1'], desc: '솔빛마을과 들꽃마을을 잇는 첫 번째 길.' },
  { id: 'town2', name: '들꽃마을', x: 46, y: 113, kind: 'town', maps: ['town2', 'dojo'], desc: '꽃향기 가득한 마을. 바위 타입 체육관이 있다.', color: '#e88aa8' },
  { id: 'route2', name: '2번 도로', x: 46, y: 96, kind: 'route', maps: ['route2'], desc: '속삭임숲으로 이어지는 들판 길.' },
  { id: 'forest', name: '속삭임숲', x: 46, y: 80, kind: 'place', maps: ['forest', 'forest_grove', 'forest_tree'], desc: '숲의 아이들이 속삭이는 깊은 숲.' },
  { id: 'town3', name: '물안개마을', x: 46, y: 58, kind: 'town', maps: ['town3', 'gym2'], desc: '새벽마다 호수에 안개가 피는 물가 마을.', color: '#3ab0b0' },
  { id: 'pastel', name: '솜사탕언덕', x: 14, y: 58, kind: 'place', maps: ['pastel'], desc: '파스텔빛 몬스터들이 사는 달콤한 언덕.' },
  { id: 'route3', name: '3번 도로', x: 84, y: 58, kind: 'route', maps: ['route3'], desc: '바위 언덕을 지나 별빛동굴로 가는 길.' },
  { id: 'peak', name: '운무봉', x: 84, y: 30, kind: 'place', maps: ['peak'], desc: '구름이 걸린 봉우리. 산군의 전설이 전해진다.' },
  { id: 'cave', name: '별빛동굴', x: 118, y: 58, kind: 'place', maps: ['cave'], desc: '별빛결정이 반짝이는 동굴. 은하고래가 잠들어 있다.' },
  { id: 'town4', name: '별빛시', x: 150, y: 40, kind: 'town', maps: ['town4', 'gym3', 'antique'], desc: '천문대와 벽돌길의 도시. 해솔 지방에서 가장 크다.', color: '#3a4a7a' },
  { id: 'route4', name: '4번 도로', x: 190, y: 40, kind: 'route', maps: ['route4'], desc: '해안 절벽을 따라 항구로 가는 길.' },
  { id: 'town5', name: '파도항구', x: 228, y: 40, kind: 'town', maps: ['town5', 'gym4'], desc: '등대와 부두가 있는 항구 도시.', color: '#4a7ad8' },
  { id: 'safari', name: '팜팜 사파리', x: 258, y: 22, kind: 'place', maps: ['safarigate', 'safari', 'safari_fire', 'safari_canyon', 'safari_fairy', 'safari_special', 'safari_ice', 'safari_water', 'safari_jungle'], desc: '여러 지대의 희귀한 몬스터를 만날 수 있는 사파리.' },
  { id: 'ship', name: '은파호', x: 258, y: 60, kind: 'place', maps: ['ship', 'ship_cabins', 'ship_ballroom', 'ship_engine', 'ship_bridge', 'ship_ghost'], desc: '30년 전 사라진 유람선. 지금은 부두에 묶여 있다.' },
  { id: 'route5', name: '5번 도로 해변길', x: 228, y: 80, kind: 'route', maps: ['route5'], desc: '모래사장을 따라 남쪽으로 내려가는 해변길.' },
  { id: 'town6', name: '불꽃마을', x: 228, y: 118, kind: 'town', maps: ['town6', 'gym5'], desc: '온천과 대장간이 있는 화산 기슭의 마을.', color: '#c84a2a' },
  { id: 'volcano', name: '불꽃산', x: 262, y: 118, kind: 'place', maps: ['volcano', 'volcano_forge', 'volcano_heart'], desc: '검은안개단의 아지트가 있던 화산.' },
  { id: 'route6', name: '6번 도로', x: 196, y: 118, kind: 'route', maps: ['route6'], desc: '화산 기슭에서 설원으로 올라가는 길.' },
  { id: 'town7', name: '서리마을', x: 164, y: 118, kind: 'town', maps: ['town7', 'gym6'], desc: '일 년 내내 눈이 내리는 마을. 스케이트장이 있다.', color: '#a8c8e8' },
  { id: 'icecave', name: '얼음굴', x: 164, y: 92, kind: 'place', maps: ['icecave', 'icecave_deep'], desc: '얼어붙은 호수와 옛 벽화가 있는 동굴.' },
  { id: 'route7', name: '7번 도로 설원 산길', x: 134, y: 118, kind: 'route', maps: ['route7'], desc: '눈보라가 몰아치는 산길.' },
  { id: 'town8', name: '용의 마을', x: 104, y: 118, kind: 'town', maps: ['town8', 'gym7'], desc: '기와지붕과 석등의 한옥 마을. 천룡을 모신다.', color: '#4a5260' },
  { id: 'den', name: '용의 둥지', x: 104, y: 92, kind: 'place', maps: ['den', 'den_altar'], desc: '여의주를 모신 하늘의 제단이 있는 동굴.' },
  { id: 'route8', name: '8번 도로', x: 92, y: 140, kind: 'route', maps: ['route8'], desc: '해솔고원으로 이어지는 마지막 길.' },
  { id: 'plateau', name: '해솔고원', x: 120, y: 152, kind: 'town', maps: ['plateau', 'center7'], desc: '해솔 리그가 열리는 고원.', color: '#ffd04a' },
  { id: 'league', name: '해솔 리그', x: 152, y: 160, kind: 'place', maps: ['league'], desc: '해솔 지방 최고의 트레이너를 가리는 경기장.' },
  { id: 'skyroad', name: '천공의 길', x: 150, y: 142, kind: 'route', maps: ['skyroad', 'summit'], desc: '구름 위 신전으로 이어지는 하늘길.' },
];
const EDGES: [string, string][] = [
  ['town1', 'route1'], ['route1', 'town2'], ['town2', 'route2'], ['route2', 'forest'], ['forest', 'town3'], ['town3', 'pastel'],
  ['town3', 'route3'], ['route3', 'peak'], ['route3', 'cave'], ['cave', 'town4'], ['town4', 'route4'], ['route4', 'town5'],
  ['town5', 'safari'], ['town5', 'ship'], ['town5', 'route5'], ['route5', 'town6'], ['town6', 'volcano'], ['town6', 'route6'],
  ['route6', 'town7'], ['town7', 'icecave'], ['town7', 'route7'], ['route7', 'town8'], ['town8', 'den'], ['town8', 'route8'],
  ['route8', 'plateau'], ['plateau', 'town1'], ['plateau', 'league'], ['plateau', 'skyroad'],
];
const byId = Object.fromEntries(N.map((n) => [n.id, n]));

const visited = (n: Node) => n.maps.some((m) => game.flags['visit_' + m]);

/** Outdoor map the player is in (indoor maps resolve to the place their exit leads to). */
function currentNode(): Node | undefined {
  let id = game.map;
  for (let i = 0; i < 4; i++) {
    const hit = N.find((n) => n.maps.includes(id));
    if (hit) return hit;
    const m = MAPS[id];
    const out = m?.warps[0]?.to;
    if (!out) return undefined;
    id = out;
  }
  return undefined;
}

export class WorldMapView extends Widget<void> {
  sel: Node;
  constructor() {
    super();
    this.sel = currentNode() ?? byId.town1;
  }

  update() {
    if (input.pressed('a') || input.pressed('b')) return this.finish();
    const dirs: [string, number, number][] = [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]];
    for (const [d, dx, dy] of dirs) {
      if (!input.repeat(d as 'left')) continue;
      // nearest visited place roughly in that direction
      let best: Node | null = null, bestScore = 1e9;
      for (const n of N) {
        if (n === this.sel || !visited(n)) continue;
        const vx = n.x - this.sel.x, vy = n.y - this.sel.y;
        const along = vx * dx + vy * dy;
        if (along <= 0) continue;
        const across = Math.abs(vx * dy - vy * dx);
        const score = along + across * 2;
        if (score < bestScore) { bestScore = score; best = n; }
      }
      if (best) this.sel = best;
    }
  }

  draw(ctx: Ctx) {
    centered(ctx, () => this.paint(ctx));
  }

  paint(ctx: Ctx) {
    // sea and land (the sea fills the whole screen width)
    ctx.fillStyle = '#3a6aa8';
    ctx.fillRect(-(SW - W) / 2 - 1, 0, SW + 2, 192);
    ctx.fillStyle = '#4a7ab8';
    for (let i = 0; i < 18; i++) ctx.fillRect((i * 53) % W, (i * 37) % 170, 10, 1);
    const land = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 12);
      ctx.fill();
    };
    land(4, 14, 272 - 4, 160, '#c8b888');
    land(6, 16, 268 - 6, 156, '#8ac46e');
    // regional tints: snow north-east of the dragons, volcano south-east, sky over the plateau
    land(120, 80, 70, 52, '#e8f0f8');
    land(212, 100, 62, 32, '#c88a6a');
    land(4, 36, 60, 40, '#a8d8a0');
    land(100, 136, 70, 34, '#e8d890');
    ctx.save();
    ctx.translate((W - 272) / 2, 0);
    // routes
    for (const [a, b] of EDGES) {
      const p = byId[a], q = byId[b];
      const seen = visited(p) && visited(q);
      ctx.strokeStyle = seen ? '#f4e8c0' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = seen ? 3 : 2;
      ctx.setLineDash(seen ? [] : [3, 3]);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // places
    for (const n of N) {
      const v = visited(n);
      if (n.kind === 'town') {
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(n.x - 6, n.y - 6, 12, 12);
        ctx.fillStyle = v ? n.color ?? '#e8e8e8' : '#9a9aa4';
        ctx.fillRect(n.x - 5, n.y - 5, 10, 10);
        ctx.fillStyle = v ? '#fff6e0' : '#c8c8cc';
        ctx.fillRect(n.x - 3, n.y - 1, 6, 4);
      } else if (n.kind === 'place') {
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = v ? '#ffd84a' : '#9a9aa4';
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.8, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = v ? '#f4e8c0' : '#9a9aa4';
        ctx.beginPath(); ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      if (n.kind !== 'route') text(ctx, v ? n.name : '???', n.x, n.y + 7, { size: 6.5, align: 'center', color: '#ffffff', shadow: '#1e2a3a' });
    }
    // the player and the cursor
    const cur = currentNode();
    if (cur && Math.floor(clock.frame / 15) % 2 === 0) {
      ctx.fillStyle = '#ff4a4a';
      ctx.beginPath(); ctx.arc(cur.x, cur.y - 10, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cur.x - 3, cur.y - 9); ctx.lineTo(cur.x + 3, cur.y - 9); ctx.lineTo(cur.x, cur.y - 4); ctx.fill();
    }
    const s = this.sel;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x - 9, s.y - 9, 18, 18);
    ctx.restore();
    // title and info
    text(ctx, '해솔 지방 지도', 8, 3, { size: 9, color: '#ffffff', shadow: '#1e2a3a' });
    text(ctx, '◆ 현재 위치', W - 8, 3, { size: 7.5, align: 'right', color: '#ffd0d0', shadow: '#1e2a3a' });
    box(ctx, 4, 172 - 4, W - 8, 24);
    const v = visited(s);
    text(ctx, v ? s.name : '???', 12, 172, { size: 8.5, weight: 800 });
    text(ctx, v ? s.desc : '아직 가 보지 않은 곳이다.', 12, 182, { size: 7, color: '#4a5070' });
  }
}
