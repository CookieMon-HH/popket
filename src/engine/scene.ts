import type { Ctx } from './draw';
import { tween } from './timing';

export interface Scene {
  update(canInput: boolean): void;
  /** Pixel layer (256x192, blitted with nearest-neighbor scaling). */
  drawWorld(g: Ctx): void;
  /** High-resolution layer for text and boxes. */
  drawUI(ctx: Ctx): void;
}

export const scenes: { current: Scene | null } = { current: null };

export const fx = { fade: 0, flash: 0 };

export async function fadeTo(to: number, frames = 12) {
  const from = fx.fade;
  await tween(frames, (p) => (fx.fade = from + (to - from) * p));
}

export async function flashes(n = 3) {
  for (let i = 0; i < n; i++) {
    await tween(5, (p) => (fx.flash = p));
    await tween(5, (p) => (fx.flash = 1 - p));
  }
}
