import { W, H, box, text, measure, type Ctx } from '../engine/draw';
import { input } from '../engine/input';
import { ui } from '../engine/ui';
import { clock, wait } from '../engine/timing';
import type { Scene } from '../engine/scene';
import { DIRS, DIRV, OPP, pick, rand, clamp, type Dir } from './common';
import { MAPS, type MapDef, type NPCDef } from './maps';
import { SOLID, tileCanvas } from './tiles';
import { personSprite, itemSprite, monSprite, type Pal } from './sprites';
import { game, runtime } from './state';

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
    if (!row || x < 0 || x >= row.length) return this.map.indoor ? ' ' : '#';
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
    const dir = DIRS.find((d) => input.isHeld(d));
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
    if ('Pkcrb~mvsQJ'.includes(t)) this.hooks.run(() => this.hooks.tile(t));
  }

  /** Called when the player finishes a step. Returns true when an event took over. */
  private onArrive(): boolean {
    const p = this.player;
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
      this.hooks.run(() => this.hooks.encounter(enc.table));
      return true;
    }
    return false;
  }

  findSpotter(): NPC | null {
    const p = this.player;
    for (const n of this.npcs) {
      const tr = n.def.trainer;
      if (!tr || !n.def.sight || game.flags['tr_' + tr.id]) continue;
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
      for (let tx = x0; tx <= x0 + 16; tx++) {
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
      if (npc?.def.mon) {
        const bob = Math.round(Math.sin(clock.frame / 24) * 1.5);
        g.drawImage(monSprite(npc.def.mon), sx - 8, sy - 16 + bob);
        continue;
      }
      const frame = a.moving > STEP / 2 ? (a.step % 2 ? 1 : 3) : 0;
      const pal = npc ? npc.def.pal ?? PLAYER_PAL : PLAYER_PAL;
      g.drawImage(personSprite(pal, a.dir, frame), sx, sy - 5);
      if (this.tileAt(a.x, a.y) === ',' && a.moving < STEP / 2) {
        g.drawImage(tall, 0, 9, 16, 7, a.x * 16 - cx, a.y * 16 - cy + 9, 16, 7);
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
    if (this.map.dark) this.drawDark(g, cx, cy);
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
    if (this.bannerT <= 0 || ui.active) return;
    const t = this.bannerT;
    const y = t > 130 ? -24 + (150 - t) * 1.4 : t < 20 ? 4 - (20 - t) * 1.4 : 4;
    const w = measure(this.map.name, 11) + 24;
    box(ctx, 4, y, w, 22);
    text(ctx, this.map.name, 16, y + 5);
  }
}

export const world = new Overworld();
