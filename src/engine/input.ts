export type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b';

const KEYMAP: Record<string, Btn> = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Space: 'a', Enter: 'a', KeyJ: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b', KeyK: 'b',
};

class Input {
  private sources = new Map<Btn, Set<string>>();
  private held = new Map<Btn, number>();
  private edges = new Set<Btn>();
  private repeats = new Set<Btn>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      const b = KEYMAP[e.code];
      if (!b) return;
      e.preventDefault();
      if (e.repeat) return;
      this.press(b, 'k' + e.code);
    });
    window.addEventListener('keyup', (e) => {
      const b = KEYMAP[e.code];
      if (b) this.release(b, 'k' + e.code);
    });
    window.addEventListener('blur', () => {
      this.sources.clear();
      this.held.clear();
    });
  }

  press(b: Btn, src: string) {
    let s = this.sources.get(b);
    if (!s) this.sources.set(b, (s = new Set()));
    const was = s.size > 0;
    s.add(src);
    if (!was) {
      this.edges.add(b);
      this.held.set(b, 0);
    }
  }

  release(b: Btn, src: string) {
    const s = this.sources.get(b);
    if (!s) return;
    s.delete(src);
    if (s.size === 0) this.held.delete(b);
  }

  /** Call once at the start of each update step. */
  tick() {
    this.repeats.clear();
    for (const [b, n] of this.held) {
      if (n >= 16 && (n - 16) % 4 === 0) this.repeats.add(b);
      this.held.set(b, n + 1);
    }
  }

  /** Call once at the end of each update step. */
  endFrame() {
    this.edges.clear();
  }

  pressed(b: Btn) {
    return this.edges.has(b);
  }

  /** Edge or auto-repeat (for menu navigation). */
  repeat(b: Btn) {
    return this.edges.has(b) || this.repeats.has(b);
  }

  isHeld(b: Btn) {
    return this.held.has(b);
  }
}

export const input = new Input();

export function bindTouchPad(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>('button[data-btn]').forEach((el) => {
    const b = el.dataset.btn as Btn;
    const id = 't' + b;
    const down = (e: Event) => {
      e.preventDefault();
      el.classList.add('on');
      input.press(b, id);
    };
    const up = (e: Event) => {
      e.preventDefault();
      el.classList.remove('on');
      input.release(b, id);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}
