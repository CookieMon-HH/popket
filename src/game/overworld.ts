import { W, H, box, text, measure, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { ui } from '../engine/ui';
import { clock, wait } from '../engine/timing';
import type { Scene } from '../engine/scene';
import { DIRS, DIRV, OPP, pick, rand, clamp, type Dir } from './common';
import { MAPS, type MapDef, type NPCDef } from './maps';
import { SOLID, tileCanvas, TALL_CHARS } from './tiles';
import { silhouette } from '../engine/pix';
import { personSprite, itemSprite, monSprite, boulderSprite, barrierSprite, type Pal } from './sprites';
import { game, runtime, beatenAll } from './state';
import { playMusic, sfx } from '../engine/audio';
import { musicForMap } from './music';

export interface Actor {
  x: number;
  y: number;
  dir: Dir;
  offX: number;
  offY: number;
  moving: number;
  step: number;
}

export interface NPC extends Actor {
  def: NPCDef;
  timer: number;
  bubble: number;
}

const STEP = 8;
const PLAYER_PAL: Pal = { hair: '#3a2a20', shirt: '#f07a3a', pants: '#3a4a7a', hat: '#2a8ad0' };

export interface WorldHooks {
  interact(npc: NPC): Promise<void>;
  sign(text: string): Promise<void>;
  tile(ch: string): Promise<void>;
  warp(to: string, x: number, y: number, dir: Dir): Promise<void>;
  spotted(npc: NPC): Promise<void>;
  encounter(table: [string, number, number, number][]): Promise<void>;
  menu(): Promise<void>;
  safariEnd(): Promise<void>;
  run(fn: () => Promise<void>): void;
}

export class Overworld implements Scene {
  map!: MapDef;
  npcs: NPC[] = [];
  player: Actor = { x: 0, y: 0, dir: 'down', offX: 0, offY: 0, moving: 0, step: 0 };
  hooks!: WorldHooks;
  private turnHold = 0;
  private idle = 99;
  bannerT = 0;
  private cam: [number, number] = [0, 0];

  load(id: string, x: number, y: number, dir: Dir) {
    this.map = MAPS[id];
    Object.assign(this.player, { x, y, dir, offX: 0, offY: 0, moving: 0 });
    game.map = id;
    game.flags['visit_' + id] = true;
    playMusic(musicForMap(id));
    this.syncState();
    this.npcs = [];
    this.refreshNPCs();
    this.bannerT = this.map.indoor ? 0 : 150;
  }

  syncState() {
    game.x = this.player.x;
    game.y = this.player.y;
    game.dir = this.player.dir;
  }

  refreshNPCs() {
    const prev = new Map(this.npcs.map((n) => [n.def.id, n]));
    this.npcs = this.map.npcs
      .filter((d) => !d.hidden?.() && !(d.item && game.flags['item_' + d.id]))
      .map(
        (d) =>
          prev.get(d.id) ?? { def: d, x: d.x, y: d.y, dir: d.dir, offX: 0, offY: 0, moving: 0, step: 0, timer: rand(60, 200), bubble: 0 },
      );
  }

  tileAt(x: number, y: number): string {
    const row = this.map.tiles[y];
    if (!row || x < 0 || x >= row.length) return this.map.edge ?? (this.map.indoor ? ' ' : '#');
    return row[x];
  }

  npcAt(x: number, y: number) {
    return this.npcs.find((n) => n.x === x && n.y === y);
  }

  blocked(x: number, y: number, self: Actor) {
    if (SOLID.has(this.tileAt(x, y))) return true;
    if (this.npcs.some((n) => n !== self && n.x === x && n.y === y)) return true;
    if (self !== this.player && this.player.x === x && this.player.y === y) return true;
    return false;
  }

  tryMove(a: Actor, dir: Dir): boolean {
    a.dir = dir;
    const [dx, dy] = DIRV[dir];
    if (a === this.player) {
      // Push a boulder if one is in the way and the space behind it is free.
      const rock = this.npcs.find((n) => n.def.boulder && n.x === a.x + dx && n.y === a.y + dy);
      if (rock) {
        const bx = rock.x + dx;
        const by = rock.y + dy;
        const onWarp = this.map.warps.some((w) => w.x === bx && w.y === by);
        if (rock.moving || onWarp || this.blocked(bx, by, rock)) return false;
        this.tryMove(rock, dir);
      }
    }
    if (this.blocked(a.x + dx, a.y + dy, a)) return false;
    a.x += dx;
    a.y += dy;
    a.offX = -dx * 16;
    a.offY = -dy * 16;
    a.moving = STEP;
    a.step++;
    return true;
  }

  private stepActor(a: Actor): boolean {
    if (a.moving <= 0) return false;
    a.moving--;
    const k = a.moving / STEP;
    a.offX = Math.sign(a.offX) * 16 * k;
    a.offY = Math.sign(a.offY) * 16 * k;
    return a.moving === 0;
  }

  /** Scripted walk (used by cutscenes and trainers). */
  async walk(a: Actor, dir: Dir): Promise<boolean> {
    if (!this.tryMove(a, dir)) {
      a.dir = dir;
      return false;
    }
    await wait(STEP);
    return true;
  }

  update(canInput: boolean) {
    for (const n of this.npcs) {
      this.stepActor(n);
      if (n.bubble > 0) n.bubble--;
      if (runtime.busy || !canInput || n.moving) continue;
      if (n.def.move === 'wander' && --n.timer <= 0) {
        n.timer = rand(90, 220);
        const d = pick(DIRS);
        const [dx, dy] = DIRV[d];
        if (Math.abs(n.x + dx - n.def.x) <= 2 && Math.abs(n.y + dy - n.def.y) <= 2) this.tryMove(n, d);
        else n.dir = d;
      } else if (n.def.move === 'look' && --n.timer <= 0) {
        n.timer = rand(100, 240);
        n.dir = pick(DIRS);
      }
    }
    if (this.bannerT > 0) this.bannerT--;
    // Safari time is counted in main.ts (it also runs during battles); end the visit once free.
    if (this.map.safari && game.safari && canInput && !runtime.busy && !ui.active && game.safari.left <= 0) {
      this.hooks.run(() => this.hooks.safariEnd());
      return;
    }

    const arrived = this.stepActor(this.player);
    if (arrived) {
      this.syncState();
      if (!runtime.busy && this.onArrive()) return;
    }
    if (!canInput || runtime.busy || this.player.moving > 0) return;
    this.handleInput();
  }

  private handleInput() {
    const p = this.player;
    if (input.pressed('a')) {
      this.interact();
      return;
    }
    if (input.pressed('b')) {
      this.hooks.run(() => this.hooks.menu());
      return;
    }
    const dir = DIRS.find((d) => input.isHeld(d)) ?? DIRS.find((d) => input.pressed(d));
    if (!dir) {
      this.turnHold = 0;
      this.idle++;
      return;
    }
    if (dir !== p.dir && this.idle > 2 && this.turnHold === 0) {
      p.dir = dir;
      this.turnHold = 6;
      this.syncState();
      return;
    }
    if (this.turnHold > 0 && --this.turnHold > 0) return;
    if (this.tryMove(p, dir)) this.idle = 0;
    else {
      p.dir = dir;
      this.idle++;
    }
  }

  private interact() {
    const p = this.player;
    const [dx, dy] = DIRV[p.dir];
    const fx = p.x + dx;
    const fy = p.y + dy;
    const t = this.tileAt(fx, fy);
    let npc = this.npcAt(fx, fy);
    if (!npc && (t === 'T' || t === 'c' || t === 'n')) npc = this.npcAt(fx + dx, fy + dy);
    if (npc) {
      const target = npc;
      this.hooks.run(() => this.hooks.interact(target));
      return;
    }
    if (t === 'S') {
      const s = this.map.signs?.find((s) => s.x === fx && s.y === fy);
      if (s) this.hooks.run(() => this.hooks.sign(s.text));
      return;
    }
    if ('Pkcrb~mvsyQJ'.includes(t)) this.hooks.run(() => this.hooks.tile(t));
  }

  /** Called when the player finishes a step. Returns true when an event took over. */
  sliding = false;
  /** Frames of celebration confetti left to draw. */
  confetti = 0;
  /** Fishing animation state (rod, line and bobber). */
  fishing: { t0: number; phase: 'cast' | 'wait' | 'bite' | 'reel' } | null = null;

  private onArrive(): boolean {
    const p = this.player;
    // Ice floors keep you sliding until something stops you.
    if (this.tileAt(p.x, p.y) === 'i' && this.tryMove(p, p.dir)) {
      this.sliding = true;
      return true;
    }
    this.sliding = false;
    const warp = this.map.warps.find((w) => w.x === p.x && w.y === p.y);
    if (warp) {
      this.hooks.run(() => this.hooks.warp(warp.to, warp.tx, warp.ty, warp.dir));
      return true;
    }
    const trg = this.map.triggers?.find((t) => t.x === p.x && t.y === p.y && (t.when?.() ?? true));
    if (trg) {
      this.hooks.run(trg.run);
      return true;
    }
    const spotter = this.findSpotter();
    if (spotter) {
      this.hooks.run(() => this.hooks.spotted(spotter));
      return true;
    }
    const enc = this.map.encounters;
    if (enc && (enc.tiles ?? ',').includes(this.tileAt(p.x, p.y)) && game.party.some((m) => m.hp > 0) && Math.random() < enc.rate) {
      // Some monsters only appear after the ending.
      const table = game.flags.champion && enc.post ? [...enc.table, ...enc.post] : enc.table;
      this.hooks.run(() => this.hooks.encounter(table));
      return true;
    }
    return false;
  }

  findSpotter(): NPC | null {
    const p = this.player;
    for (const n of this.npcs) {
      const tr = n.def.trainer;
      if (!tr || !n.def.sight || game.flags['tr_' + tr.id] || !beatenAll(n.def.requires)) continue;
      const [dx, dy] = DIRV[n.dir];
      for (let i = 1; i <= n.def.sight; i++) {
        const x = n.x + dx * i;
        const y = n.y + dy * i;
        if (x === p.x && y === p.y) return n;
        if (SOLID.has(this.tileAt(x, y)) || this.npcAt(x, y)) break;
      }
    }
    return null;
  }

  /** Walk an NPC toward the player along open ground, then face each other. */
  async approachAny(n: NPC) {
    const p = this.player;
    for (let guard = 0; guard < 24; guard++) {
      const dx = p.x - n.x;
      const dy = p.y - n.y;
      if (Math.abs(dx) + Math.abs(dy) <= 1) break;
      const h: Dir = dx > 0 ? 'right' : 'left';
      const v: Dir = dy > 0 ? 'down' : 'up';
      const first = Math.abs(dx) >= Math.abs(dy) ? h : v;
      const second = first === h ? v : h;
      if (await this.walk(n, first)) continue;
      if ((first === h ? dy : dx) !== 0 && (await this.walk(n, second))) continue;
      break;
    }
    this.faceEachOther(n);
  }

  faceEachOther(n: NPC) {
    const p = this.player;
    const dx = p.x - n.x;
    const dy = p.y - n.y;
    n.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    p.dir = OPP[n.dir];
    this.syncState();
  }

  /** Walk an NPC up to the player and face each other. */
  /** Walk a trainer back to its own spot after a battle so it never blocks the path. */
  async returnHome(n: NPC) {
    const home = n.def;
    for (let guard = 0; guard < 16 && (n.x !== home.x || n.y !== home.y); guard++) {
      const dx = home.x - n.x;
      const dy = home.y - n.y;
      const dir: Dir = dx !== 0 ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      if (!(await this.walk(n, dir))) break;
    }
    n.dir = home.dir;
  }

  async approach(n: NPC) {
    const p = this.player;
    for (let guard = 0; guard < 12; guard++) {
      const dist = Math.abs(n.x - p.x) + Math.abs(n.y - p.y);
      if (dist <= 1) break;
      if (!(await this.walk(n, n.dir))) break;
    }
    p.dir = OPP[n.dir];
    this.syncState();
  }

  // -------------------------------------------------------------------------

  private camera() {
    const p = this.player;
    const mw = this.map.tiles[0].length * 16;
    const mh = this.map.tiles.length * 16;
    let cx = p.x * 16 + p.offX + 8 - W / 2;
    let cy = p.y * 16 + p.offY + 8 - H / 2;
    cx = mw <= W ? (mw - W) / 2 : clamp(cx, 0, mw - W);
    cy = mh <= H ? (mh - H) / 2 : clamp(cy, 0, mh - H);
    return [Math.round(cx), Math.round(cy)];
  }

  drawWorld(g: Ctx) {
    const [cx, cy] = this.camera();
    this.cam = [cx, cy];
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    const anim = Math.floor(clock.frame / 32) % 2;
    const x0 = Math.floor(cx / 16);
    const y0 = Math.floor(cy / 16);
    for (let ty = y0; ty <= y0 + 12; ty++) {
      for (let tx = x0; tx <= x0 + Math.ceil(W / 16); tx++) {
        const ch = this.tileAt(tx, ty);
        if (ch === ' ') continue;
        g.drawImage(tileCanvas(ch, anim), tx * 16 - cx, ty * 16 - cy);
      }
    }

    const actors: { a: Actor; npc?: NPC }[] = [{ a: this.player }, ...this.npcs.map((n) => ({ a: n as Actor, npc: n }))];
    actors.sort((u, v) => u.a.y * 16 + u.a.offY - (v.a.y * 16 + v.a.offY));
    const tall = tileCanvas(',', 0);
    for (const { a, npc } of actors) {
      const sx = Math.round(a.x * 16 + a.offX - cx);
      const sy = Math.round(a.y * 16 + a.offY - cy);
      if (npc?.def.item) {
        g.drawImage(itemSprite(), sx, sy);
        continue;
      }
      if (npc?.def.prop) {
        const ch = typeof npc.def.prop === 'function' ? npc.def.prop() : npc.def.prop;
        g.drawImage(tileCanvas(ch, Math.floor(clock.frame / 32) % 2), sx, sy);
        continue;
      }
      if (npc?.def.boulder) {
        g.drawImage(boulderSprite(), sx, sy);
        continue;
      }
      if (npc?.def.barrier) {
        g.drawImage(barrierSprite(npc.def.barrier, clock.frame), sx, sy);
        continue;
      }
      if (npc?.def.mon) {
        const spr = monSprite(npc.def.mon);
        if (npc.def.statue) {
          g.fillStyle = '#6a6470';
          g.fillRect(sx - 1, sy + 10, 18, 6);
          g.drawImage(silhouette(spr, '#9a96a2'), sx - 12, sy - 26);
          g.globalAlpha = 0.35;
          g.drawImage(silhouette(spr, '#5a5662'), sx - 11, sy - 25);
          g.globalAlpha = 1;
        } else {
          const bob = Math.round(Math.sin(clock.frame / 24) * 1.5);
          g.drawImage(spr, sx - 12, sy - 24 + bob);
        }
        continue;
      }
      // Step pose for most of the stride (no vertical bob).
      const prog = 1 - a.moving / STEP;
      const striding = a.moving > 0 && prog > 0.05 && prog < 0.9 && !(a === this.player && this.sliding);
      const frame = striding ? (a.step % 2 ? 1 : 3) : 0;
      const pal = npc ? npc.def.pal ?? PLAYER_PAL : PLAYER_PAL;
      if (npc?.def.ghost) g.globalAlpha = 0.45 + Math.sin(clock.frame / 9) * 0.15;
      g.drawImage(personSprite(pal, a.dir, frame), sx, sy - 5);
      g.globalAlpha = 1;
      const under = this.tileAt(a.x, a.y);
      if (TALL_CHARS.includes(under) && a.moving < STEP / 2) {
        g.drawImage(under === ',' ? tall : tileCanvas(under, 0), 0, 9, 16, 7, a.x * 16 - cx, a.y * 16 - cy + 9, 16, 7);
      }
      if (npc && npc.bubble > 0) {
        g.fillStyle = '#26263a';
        g.fillRect(sx + 3, sy - 19, 10, 12);
        g.fillStyle = '#ffffff';
        g.fillRect(sx + 4, sy - 18, 8, 10);
        g.fillStyle = '#e04a4a';
        g.fillRect(sx + 7, sy - 17, 2, 5);
        g.fillRect(sx + 7, sy - 11, 2, 2);
      }
    }
    if (this.fishing) this.drawFishing(g, cx, cy);
    const amb = this.map.ambience ?? (this.map.id === 'ship' ? 'shipdeck' : this.map.id.startsWith('ship') ? 'ship' : undefined);
    if (amb === 'ship' || amb === 'shipdeck') this.drawGloom(g, cx, cy);
    else if (amb) this.drawAmbience(g, cx, cy, amb);
    if (this.isDark()) this.drawDark(g, cx, cy);
  }

  private drawFishing(g: Ctx, cx: number, cy: number) {
    const f = this.fishing!;
    const p = this.player;
    const [dx, dy] = DIRV[p.dir];
    const t = clock.frame - f.t0;
    // Hand and rod tip (the rod leans forward and up).
    const hx = p.x * 16 - cx + 8 + dx * 4;
    const hy = p.y * 16 - cy + 6 + dy * 3;
    const tipx = hx + dx * 11 + (dx === 0 ? 5 : 0);
    const tipy = hy + dy * 9 - (dy === 0 ? 9 : 4);
    // Where the bobber lands: two tiles ahead on the water.
    const bx = p.x * 16 - cx + 8 + dx * 30;
    const by = p.y * 16 - cy + 10 + dy * 26;
    let ox = bx;
    let oy = by;
    if (f.phase === 'cast' || f.phase === 'reel') {
      const k = Math.min(1, t / (f.phase === 'cast' ? 22 : 12));
      const q = f.phase === 'cast' ? k : 1 - k;
      ox = tipx + (bx - tipx) * q;
      oy = tipy + (by - tipy) * q - Math.sin(q * Math.PI) * 16;
    } else if (f.phase === 'wait') {
      oy = by + Math.round(Math.sin(t / 14));
    } else {
      oy = by + 2 + (Math.floor(t / 4) % 2);
    }
    ox = Math.round(ox);
    oy = Math.round(oy);
    // Rod
    g.strokeStyle = '#7a4a24';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(hx, hy);
    g.lineTo(tipx, tipy);
    g.stroke();
    // Line, sagging a little while waiting
    g.strokeStyle = 'rgba(240,244,255,0.9)';
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(tipx, tipy);
    g.quadraticCurveTo((tipx + ox) / 2, Math.max(tipy, oy) + (f.phase === 'bite' ? 0 : 4), ox, oy);
    g.stroke();
    // Ripples around the bobber
    if (f.phase === 'wait' || f.phase === 'bite') {
      const r = f.phase === 'bite' ? 3 + (t % 12) / 2 : 2 + (t % 60) / 12;
      g.strokeStyle = `rgba(255,255,255,${f.phase === 'bite' ? 0.8 : 0.5 - (t % 60) / 140})`;
      g.lineWidth = 0.8;
      g.beginPath();
      g.ellipse(bx, by + 2, r * 1.6, r * 0.6, 0, 0, Math.PI * 2);
      g.stroke();
    }
    // Bobber: red top, white bottom
    g.fillStyle = '#ffffff';
    g.fillRect(ox - 1, oy, 3, 2);
    g.fillStyle = '#e84a4a';
    g.fillRect(ox - 1, oy - 2, 3, 2);
    // "!" when something bites
    if (f.phase === 'bite') {
      const sx = p.x * 16 - cx;
      const sy = p.y * 16 - cy;
      g.fillStyle = '#26263a';
      g.fillRect(sx + 3, sy - 19, 10, 12);
      g.fillStyle = '#ffffff';
      g.fillRect(sx + 4, sy - 18, 8, 10);
      g.fillStyle = '#e04a4a';
      g.fillRect(sx + 7, sy - 17, 2, 5);
      g.fillRect(sx + 7, sy - 11, 2, 2);
    }
  }

  isDark() {
    const d = this.map.dark;
    return typeof d === 'function' ? d() : !!d;
  }

  /** Ghost ship: cold murky tint, drifting fog, and rain with lightning on the open deck. */
  private lightning = 0;
  private nextBolt = 0;
  private drawGloom(g: Ctx, cx: number, cy: number) {
    const f = clock.frame;
    const deck = (this.map.ambience ?? (this.map.id === 'ship' ? 'shipdeck' : '')) === 'shipdeck';
    g.fillStyle = 'rgba(14,26,34,0.42)';
    g.fillRect(0, 0, W, H);
    // drifting fog banks (in world space so they slide past as you walk)
    for (let i = 0; i < 7; i++) {
      const wx = ((i * 97 + f * (0.12 + (i % 3) * 0.05)) % 520) - 80 - (cx % 520) * 0.3;
      const wy = (i * 53) % 220 - (cy % 220) * 0.3;
      const fog = g.createRadialGradient(wx, wy, 4, wx, wy, 56);
      fog.addColorStop(0, 'rgba(170,190,190,0.16)');
      fog.addColorStop(1, 'rgba(170,190,190,0)');
      g.fillStyle = fog;
      g.fillRect(wx - 60, wy - 60, 120, 120);
    }
    if (deck) {
      g.strokeStyle = 'rgba(160,180,200,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i < 46; i++) {
        const x = (i * 37 + f * 2) % (W + 40) - 20;
        const y = (i * 71 + f * 6) % (H + 20) - 10;
        g.moveTo(x, y);
        g.lineTo(x - 3, y + 8);
      }
      g.stroke();
      if (!this.nextBolt) this.nextBolt = f + 240 + Math.floor(Math.random() * 360);
      if (f >= this.nextBolt && !ui.active) {
        this.lightning = 14;
        this.nextBolt = f + 420 + Math.floor(Math.random() * 480);
        window.setTimeout(() => sfx('thunder'), 350);
      }
    }
    // vignette
    const vg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.7);
    vg.addColorStop(0, 'rgba(6,10,16,0)');
    vg.addColorStop(1, 'rgba(6,10,16,0.55)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    if (this.lightning > 0) {
      const a = this.lightning > 10 ? 0.55 : this.lightning > 7 ? 0.1 : this.lightning > 4 ? 0.35 : 0.05;
      g.fillStyle = `rgba(220,230,255,${a})`;
      g.fillRect(0, 0, W, H);
      this.lightning--;
    }
  }

  /** Shared particle field in world space (parallax 0.6), deterministic per index. */
  private particles(g: Ctx, cx: number, cy: number, n: number, draw: (x: number, y: number, i: number, t: number) => void) {
    const f = clock.frame;
    for (let i = 0; i < n; i++) {
      const sx = ((i * 7919) % 997) / 997, sy = ((i * 104729) % 991) / 991;
      draw(sx * (W + 40) - 20 - (cx * 0.6) % (W + 40), sy * (H + 40) - 20 - (cy * 0.6) % (H + 40), i, f);
    }
  }
  private shake = 0;
  private nextRumble = 0;
  private drawAmbience(g: Ctx, cx: number, cy: number, amb: NonNullable<MapDef['ambience']>) {
    const f = clock.frame;
    const wrap = (v: number, m: number) => ((v % m) + m) % m;
    if (amb === 'volcano' || amb === 'volcanoheart') {
      const heart = amb === 'volcanoheart';
      g.fillStyle = heart ? 'rgba(90,16,0,0.24)' : 'rgba(70,14,0,0.18)';
      g.fillRect(0, 0, W, H);
      // embers drifting up
      this.particles(g, cx, cy, heart ? 40 : 26, (x, y, i, t) => {
        const yy = wrap(y - t * (0.35 + (i % 5) * 0.08), H + 40) - 20;
        const xx = wrap(x + Math.sin(t / 30 + i) * 6, W + 40) - 20;
        const flick = (t + i * 13) % 40 < 30;
        g.fillStyle = i % 3 ? (flick ? '#ffb040' : '#ff7020') : '#ffe080';
        g.fillRect(Math.round(xx), Math.round(yy), i % 4 ? 1 : 2, i % 4 ? 1 : 2);
      });
      // rumbles: a shake and a distant boom now and then
      if (!this.nextRumble) this.nextRumble = f + 300;
      if (f >= this.nextRumble && !ui.active) {
        this.shake = heart ? 22 : 14;
        this.nextRumble = f + (heart ? 360 : 600) + Math.floor(Math.random() * 400);
        sfx('thunder');
      }
      if (this.shake > 0) {
        g.fillStyle = `rgba(255,120,40,${(this.shake / 22) * 0.18})`;
        g.fillRect(0, 0, W, H);
        this.shake--;
      }
      const vg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.7);
      vg.addColorStop(0, 'rgba(40,6,0,0)');
      vg.addColorStop(1, heart ? 'rgba(60,8,0,0.6)' : 'rgba(40,6,0,0.45)');
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
    } else if (amb === 'forest') {
      g.fillStyle = 'rgba(10,40,30,0.22)';
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) {
        const wx = wrap(i * 113 + f * 0.1 - cx * 0.3, W + 160) - 80;
        const wy = wrap(i * 61 - cy * 0.3, H + 120) - 60;
        const fog = g.createRadialGradient(wx, wy, 4, wx, wy, 60);
        fog.addColorStop(0, 'rgba(200,235,215,0.15)');
        fog.addColorStop(1, 'rgba(200,235,215,0)');
        g.fillStyle = fog;
        g.fillRect(wx - 64, wy - 64, 128, 128);
      }
      // fireflies
      this.particles(g, cx, cy, 18, (x, y, i, t) => {
        const xx = wrap(x + Math.sin(t / 50 + i * 2) * 10, W + 40) - 20;
        const yy = wrap(y + Math.cos(t / 40 + i) * 8, H + 40) - 20;
        const a = 0.35 + 0.35 * Math.sin(t / 18 + i * 1.7);
        if (a < 0.1) return;
        g.fillStyle = `rgba(210,255,120,${a * 0.35})`;
        g.fillRect(Math.round(xx) - 1, Math.round(yy) - 1, 3, 3);
        g.fillStyle = `rgba(240,255,170,${a})`;
        g.fillRect(Math.round(xx), Math.round(yy), 1, 1);
      });
      const vg = g.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, W * 0.7);
      vg.addColorStop(0, 'rgba(4,20,14,0)');
      vg.addColorStop(1, 'rgba(4,20,14,0.45)');
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
    } else if (amb === 'snow' || amb === 'blizzard' || amb === 'icecave') {
      const bl = amb === 'blizzard';
      g.fillStyle = amb === 'icecave' ? 'rgba(20,50,90,0.22)' : bl ? 'rgba(200,220,240,0.22)' : 'rgba(120,150,200,0.12)';
      g.fillRect(0, 0, W, H);
      const n = amb === 'icecave' ? 14 : bl ? 70 : 36;
      this.particles(g, cx, cy, n, (x, y, i, t) => {
        const sp = amb === 'icecave' ? 0.1 : bl ? 1.6 : 0.5;
        const yy = wrap(y + t * (sp + (i % 4) * 0.12), H + 40) - 20;
        const xx = wrap(x + (bl ? -t * 1.4 : Math.sin(t / 40 + i) * 8), W + 40) - 20;
        g.fillStyle = amb === 'icecave' ? `rgba(170,230,255,${0.4 + 0.4 * Math.sin(t / 20 + i)})` : '#ffffff';
        g.fillRect(Math.round(xx), Math.round(yy), i % 3 ? 1 : 2, i % 3 ? 1 : 2);
      });
      const vg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.7);
      vg.addColorStop(0, 'rgba(10,20,40,0)');
      vg.addColorStop(1, bl ? 'rgba(220,230,245,0.5)' : 'rgba(10,20,40,0.4)');
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
    } else if (amb === 'den') {
      g.fillStyle = 'rgba(30,14,50,0.24)';
      g.fillRect(0, 0, W, H);
      // slow golden motes and a faint aurora band
      const band = g.createLinearGradient(0, 0, W, 0);
      const ph = (Math.sin(f / 120) + 1) / 2;
      band.addColorStop(0, 'rgba(120,255,200,0)');
      band.addColorStop(ph * 0.8 + 0.1, 'rgba(120,255,200,0.10)');
      band.addColorStop(1, 'rgba(160,120,255,0)');
      g.fillStyle = band;
      g.fillRect(0, 10 + Math.sin(f / 90) * 6, W, 26);
      this.particles(g, cx, cy, 22, (x, y, i, t) => {
        const yy = wrap(y - t * 0.15, H + 40) - 20;
        const a = 0.4 + 0.4 * Math.sin(t / 25 + i);
        g.fillStyle = `rgba(255,220,120,${a})`;
        g.fillRect(Math.round(x), Math.round(yy), 1, 1);
      });
      const vg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.7);
      vg.addColorStop(0, 'rgba(14,6,24,0)');
      vg.addColorStop(1, 'rgba(14,6,24,0.5)');
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
    }
  }

  private drawDark(g: Ctx, cx: number, cy: number) {
    const p = this.player;
    const px = p.x * 16 + p.offX - cx + 8;
    const py = p.y * 16 + p.offY - cy + 8;
    const grad = g.createRadialGradient(px, py, 28, px, py, 110);
    grad.addColorStop(0, 'rgba(8,6,20,0)');
    grad.addColorStop(1, 'rgba(8,6,20,0.82)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
  }

  drawUI(ctx: Ctx) {
    const [cx, cy] = this.cam;
    for (const l of this.map.labels ?? []) {
      const x = l.x * 16 - cx;
      const y = l.y * 16 - cy;
      if (x < -40 || x > W + 40 || y < -20 || y > H + 20) continue;
      const w = measure(l.text, 8) + 10;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y, w, 12, 3);
      ctx.fillStyle = l.color ?? '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#2a2e48';
      ctx.stroke();
      text(ctx, l.text, x, y + 1, { size: 8, align: 'center', color: l.ink ?? '#2a2e48', shadow: false });
    }
    if (this.map.safari && game.safari) {
      const sec = Math.max(0, Math.ceil(game.safari.left / 60));
      const label = `사파리 남은 시간 ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      const w = measure(label, 9) + 16;
      box(ctx, W - w - 4, 4, w, 18);
      text(ctx, label, W - w / 2 - 4, 8, { size: 9, align: 'center', color: sec <= 60 ? '#d83a4a' : '#30323f' });
    }
    if (this.confetti > 0) {
      this.confetti--;
      const colors = ['#e84a4a', '#ffd24a', '#4a8ae8', '#40b070', '#f08ad0', '#ffffff'];
      const age = 150 - this.confetti;
      for (let i = 0; i < 70; i++) {
        const x = (i * 53 + Math.sin(age / 12 + i) * 10) % W;
        const y = ((i * 29) % 60) - 60 + age * (1.2 + (i % 5) * 0.25);
        if (y < -4 || y > H) continue;
        ctx.fillStyle = colors[i % colors.length];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(age / 8 + i);
        ctx.fillRect(-2, -1, 4, 2.4);
        ctx.restore();
      }
    }
    if (this.bannerT <= 0 || ui.active) return;
    const t = this.bannerT;
    const y = t > 130 ? -24 + (150 - t) * 1.4 : t < 20 ? 4 - (20 - t) * 1.4 : 4;
    const w = measure(this.map.name, 11) + 24;
    box(ctx, 4, y, w, 22);
    text(ctx, this.map.name, 16, y + 5);
  }
}

export const world = new Overworld();
