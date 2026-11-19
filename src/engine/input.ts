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

/** Floating analog stick: touch anywhere in the zone, drag to move. */
export function bindJoystick(zone: HTMLElement, base: HTMLElement, knob: HTMLElement) {
  const R = 46;
  const DEAD = 14;
  let id: number | null = null;
  let ox = 0;
  let oy = 0;
  let cur: Btn | null = null;
  const set = (b: Btn | null) => {
    if (b === cur) return;
    if (cur) input.release(cur, 'stick');
    cur = b;
    if (b) input.press(b, 'stick');
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    set(null);
    base.classList.remove('on');
    base.style.left = '';
    base.style.top = '';
    knob.style.transform = '';
  };
  zone.addEventListener('pointerdown', (e) => {
    if (id !== null) return;
    e.preventDefault();
    id = e.pointerId;
    zone.setPointerCapture(id);
    ox = e.clientX;
    oy = e.clientY;
    base.style.left = `${ox}px`;
    base.style.top = `${oy}px`;
    base.classList.add('on');
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - ox;
    const dy = e.clientY - oy;
    const d = Math.hypot(dx, dy);
    const k = d > R ? R / d : 1;
    knob.style.transform = `translate(calc(-50% + ${dx * k}px), calc(-50% + ${dy * k}px))`;
    if (d < DEAD) set(null);
    else if (Math.abs(dx) > Math.abs(dy)) set(dx > 0 ? 'right' : 'left');
    else set(dy > 0 ? 'down' : 'up');
  });
  zone.addEventListener('pointerup', end);
  zone.addEventListener('pointercancel', end);
  zone.addEventListener('contextmenu', (e) => e.preventDefault());
}

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
