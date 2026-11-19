export const W = 256;
export const H = 192;
export type Ctx = CanvasRenderingContext2D;

export const FONT_FAMILY = `"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`;

const mctx = document.createElement('canvas').getContext('2d')!;

export function setFont(ctx: Ctx, size = 11, weight = 700) {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
}

export interface TextOpts {
  size?: number;
  color?: string;
  align?: CanvasTextAlign;
  weight?: number;
  shadow?: string | false;
}

export function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts = {}) {
  setFont(ctx, o.size ?? 11, o.weight ?? 700);
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = 'top';
  const sh = o.shadow === undefined ? '#d4d6e2' : o.shadow;
  if (sh) {
    ctx.fillStyle = sh;
    ctx.fillText(s, x + 0.7, y + 0.7);
  }
  ctx.fillStyle = o.color ?? '#30323f';
  ctx.fillText(s, x, y);
}

export function measure(s: string, size = 11, weight = 700) {
  setFont(mctx, size, weight);
  return mctx.measureText(s).width;
}

/** Greedy word wrap; breaks long words by character. Honors \n. */
export function wrap(s: string, maxW: number, size = 11): string[] {
  const out: string[] = [];
  for (const para of s.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const cand = line ? line + ' ' + word : word;
      if (measure(cand, size) <= maxW) {
        line = cand;
        continue;
      }
      if (line) out.push(line);
      line = '';
      for (const ch of word) {
        if (measure(line + ch, size) > maxW) {
          out.push(line);
          line = ch;
        } else line += ch;
      }
    }
    out.push(line);
  }
  return out;
}

export function box(ctx: Ctx, x: number, y: number, w: number, h: number, variant: 'light' | 'dark' = 'light') {
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 4);
  ctx.fillStyle = variant === 'light' ? '#fbfbff' : '#2c3246';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#363c5c';
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x + 3.5, y + 3.5, w - 7, h - 7, 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = variant === 'light' ? '#a9c1ea' : '#56669e';
  ctx.stroke();
}

export function cursor(ctx: Ctx, x: number, y: number, color = '#30323f') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 5, y + 4);
  ctx.lineTo(x, y + 8);
  ctx.closePath();
  ctx.fill();
}

export function hpBar(ctx: Ctx, x: number, y: number, w: number, ratio: number) {
  ctx.fillStyle = '#3a3e52';
  ctx.fillRect(x - 1, y - 1, w + 2, 5);
  ctx.fillStyle = '#e8e8ee';
  ctx.fillRect(x, y, w, 3);
  const r = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = r > 0.5 ? '#46c864' : r > 0.2 ? '#f0c030' : '#e84848';
  ctx.fillRect(x, y, w * r, 3);
}

export function drawSprite(
  ctx: Ctx,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  flip = false,
) {
  ctx.imageSmoothingEnabled = false;
  if (!flip) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
}

export function panel(ctx: Ctx, color = '#e9eef8') {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(80,100,160,0.07)';
  for (let y = 0; y < H; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) ctx.fillRect(x, y, 8, 8);
}

export function typeChip(ctx: Ctx, label: string, color: string, x: number, y: number) {
  const w = measure(label, 8) + 10;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 11, 3);
  ctx.fillStyle = color;
  ctx.fill();
  text(ctx, label, x + w / 2, y + 0.5, { size: 8, color: '#fff', align: 'center', shadow: 'rgba(0,0,0,0.35)' });
  return w;
}
