import { input } from './input';
import { BW, OX, box, text, wrap, cursor, measure, type Ctx } from './draw';
import { clock } from './timing';

let formatter = (s: string) => s;
export function setTextFormatter(f: (s: string) => string) {
  formatter = f;
}

export abstract class Widget<T = void> {
  done = false;
  closed = false;
  promise!: Promise<T>;
  private res!: (v: T) => void;

  constructor() {
    this.rerun();
  }

  /** Re-arm a finished-but-open widget so it takes input again. */
  rerun(): Promise<T> {
    this.done = false;
    this.promise = new Promise<T>((r) => (this.res = r));
    return this.promise;
  }

  finish(v: T, close = true) {
    if (this.done) return;
    this.done = true;
    if (close) this.closed = true;
    this.res(v);
  }

  close() {
    this.done = true;
    this.closed = true;
  }

  abstract update(): void;
  abstract draw(ctx: Ctx): void;
}

class UIStack {
  stack: Widget<any>[] = [];

  run<T>(w: Widget<T>): Promise<T> {
    if (!this.stack.includes(w)) this.stack.push(w);
    return w.promise;
  }

  top(): Widget<any> | null {
    for (let i = this.stack.length - 1; i >= 0; i--) if (!this.stack[i].done) return this.stack[i];
    return null;
  }

  get active() {
    return this.top() !== null;
  }

  update() {
    this.top()?.update();
  }

  cleanup() {
    this.stack = this.stack.filter((w) => !w.closed);
  }

  draw(ctx: Ctx) {
    for (const w of this.stack) if (!w.closed) w.draw(ctx);
  }
}

export const ui = new UIStack();

// ---------------------------------------------------------------------------

export interface MessageOpts {
  /** Finish as soon as text is shown, but stay on screen until close(). */
  persist?: boolean;
  /** Show all text immediately. */
  instant?: boolean;
}

export class MessageBox extends Widget<void> {
  private pages: string[][] = [];
  private page = 0;
  private shown = 0;

  constructor(s: string, private opts: MessageOpts = {}) {
    super();
    const lines = wrap(formatter(s), BW - 26, 11);
    for (let i = 0; i < lines.length; i += 2) this.pages.push(lines.slice(i, i + 2));
    if (!this.pages.length) this.pages.push(['']);
    if (opts.instant) this.shown = 9999;
  }

  private get pageLen() {
    return this.pages[this.page].join('').length;
  }

  update() {
    if (this.shown < this.pageLen) {
      if (input.pressed('a')) this.shown = this.pageLen;
      else this.shown += input.isHeld('a') || input.isHeld('b') ? 3 : 1.25;
      return;
    }
    const last = this.page === this.pages.length - 1;
    if (last && this.opts.persist) {
      this.finish(undefined, false);
      return;
    }
    if (input.pressed('a') || input.pressed('b')) {
      if (last) this.finish();
      else {
        this.page++;
        this.shown = this.opts.instant ? 9999 : 0;
      }
    }
  }

  draw(ctx: Ctx) {
    box(ctx, OX, 144, BW, 48);
    let left = Math.floor(this.shown);
    this.pages[this.page].forEach((line, i) => {
      const s = line.slice(0, Math.max(0, left));
      left -= line.length;
      text(ctx, s, OX + 12, 152 + i * 17);
    });
    const waiting = this.shown >= this.pageLen && !this.done && !this.opts.persist;
    if (waiting && Math.floor(clock.frame / 16) % 2 === 0) {
      ctx.fillStyle = '#e04a5a';
      ctx.beginPath();
      ctx.moveTo(OX + 238, 179);
      ctx.lineTo(OX + 246, 179);
      ctx.lineTo(OX + 242, 184);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------

export interface MenuOpts {
  items: string[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  cols?: number;
  cancel?: boolean;
  index?: number;
  size?: number;
  rowH?: number;
  maxRows?: number;
  values?: string[];
  disabled?: boolean[];
  /** Keep the menu visible after selection (caller closes it). */
  keep?: boolean;
  onMove?: (i: number) => void;
}

export class Menu extends Widget<number> {
  idx: number;
  private scroll = 0;

  constructor(public o: MenuOpts) {
    super();
    this.idx = Math.max(0, Math.min(o.index ?? 0, o.items.length - 1));
    this.fixScroll();
  }

  private get cols() {
    return this.o.cols ?? 1;
  }
  private get rowH() {
    return this.o.rowH ?? 16;
  }
  private get rows() {
    return Math.ceil(this.o.items.length / this.cols);
  }
  private get visRows() {
    return Math.min(this.rows, this.o.maxRows ?? this.rows);
  }

  layout() {
    const size = this.o.size ?? 11;
    const widest = Math.max(...this.o.items.map((s) => measure(s, size)), 10);
    const valW = this.o.values ? Math.max(...this.o.values.map((s) => measure(s, size))) + 12 : 0;
    const w = this.o.w ?? (widest + 24 + valW) * this.cols + 6;
    const h = this.o.h ?? this.visRows * this.rowH + 14;
    const x = this.o.x ?? OX + BW - w - 2;
    const y = this.o.y ?? 144 - h - 2;
    return { x, y, w, h, colW: (w - 6) / this.cols };
  }

  private fixScroll() {
    const row = Math.floor(this.idx / this.cols);
    if (row < this.scroll) this.scroll = row;
    if (row >= this.scroll + this.visRows) this.scroll = row - this.visRows + 1;
  }

  update() {
    const n = this.o.items.length;
    const c = this.cols;
    let i = this.idx;
    if (c === 1) {
      if (input.repeat('up')) i = (i - 1 + n) % n;
      if (input.repeat('down')) i = (i + 1) % n;
    } else {
      if (input.repeat('up') && i - c >= 0) i -= c;
      if (input.repeat('down') && i + c < n) i += c;
      if (input.repeat('left') && i % c > 0) i -= 1;
      if (input.repeat('right') && i % c < c - 1 && i + 1 < n) i += 1;
    }
    if (i !== this.idx) {
      this.idx = i;
      this.fixScroll();
      this.o.onMove?.(i);
    }
    if (input.pressed('a')) this.finish(this.idx, !this.o.keep);
    else if (input.pressed('b') && this.o.cancel) this.finish(-1, !this.o.keep);
  }

  draw(ctx: Ctx) {
    const L = this.layout();
    const size = this.o.size ?? 11;
    box(ctx, L.x, L.y, L.w, L.h);
    for (let r = 0; r < this.visRows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = (this.scroll + r) * this.cols + c;
        if (i >= this.o.items.length) break;
        const ix = L.x + 17 + c * L.colW;
        const iy = L.y + 7 + r * this.rowH;
        const dis = this.o.disabled?.[i];
        text(ctx, this.o.items[i], ix, iy, { size, color: dis ? '#a0a2b0' : undefined });
        const v = this.o.values?.[i];
        if (v) text(ctx, v, L.x + (c + 1) * L.colW - 6, iy, { size, align: 'right' });
        if (i === this.idx) cursor(ctx, ix - 10, iy + 2);
      }
    }
    if (this.scroll > 0) arrow(ctx, L.x + L.w / 2, L.y + 3, -1);
    if (this.scroll + this.visRows < this.rows) arrow(ctx, L.x + L.w / 2, L.y + L.h - 4, 1);
  }
}

function arrow(ctx: Ctx, x: number, y: number, dir: 1 | -1) {
  if (Math.floor(clock.frame / 16) % 2) return;
  ctx.fillStyle = '#e04a5a';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - dir * 2);
  ctx.lineTo(x + 4, y - dir * 2);
  ctx.lineTo(x, y + dir * 2);
  ctx.closePath();
  ctx.fill();
}

/** A full-screen or decorative layer that draws but never takes input. */
export class Backdrop extends Widget<void> {
  constructor(public fn: (ctx: Ctx) => void) {
    super();
  }
  update() {}
  draw(ctx: Ctx) {
    this.fn(ctx);
  }
}

// ---------------------------------------------------------------------------

export function say(s: string, opts: MessageOpts = {}): Promise<void> {
  return ui.run(new MessageBox(s, opts));
}

/** Persistent message + choice menu. Cancel maps to the last item. */
export async function choose(s: string, items: string[], cancelIndex = items.length - 1): Promise<number> {
  const m = new MessageBox(s, { persist: true });
  ui.run(m);
  await m.promise;
  const r = await ui.run(new Menu({ items, cancel: true }));
  m.close();
  return r < 0 ? cancelIndex : r;
}

export async function yesNo(s: string): Promise<boolean> {
  return (await choose(s, ['예', '아니오'])) === 0;
}
