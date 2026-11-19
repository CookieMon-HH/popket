import { W, H, text, drawSprite, type Ctx } from './engine/draw';
import { input, bindTouchPad } from './engine/input';
import { ui, Menu, MessageBox, setTextFormatter, say } from './engine/ui';
import { clock, tickTasks } from './engine/timing';
import { scenes, fx, fadeTo, type Scene } from './engine/scene';
import { world } from './game/overworld';
import { installHooks, runScript } from './game/api';
import { game, hasSave, loadGame, newGame } from './game/state';
import { monSprite } from './game/sprites';
import { j } from './game/common';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const low = document.createElement('canvas');
low.width = W;
low.height = H;
const lctx = low.getContext('2d')!;
lctx.imageSmoothingEnabled = false;

function resize() {
  const wrap = document.getElementById('screen-wrap')!;
  const aw = wrap.clientWidth - 16;
  const ah = wrap.clientHeight - 16;
  let s = Math.min(aw / W, ah / H);
  if (s >= 2) s = Math.floor(s);
  s = Math.max(1, s);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${Math.floor(W * s)}px`;
  canvas.style.height = `${Math.floor(H * s)}px`;
  canvas.width = Math.round(W * s * dpr);
  canvas.height = Math.round(H * s * dpr);
}
window.addEventListener('resize', resize);
resize();
bindTouchPad(document.getElementById('pad')!);

setTextFormatter((s) => s.replace(/\{name\}은\(는\)/g, j(game.name, '은/는')).replace(/\{name\}/g, game.name));
installHooks();

// ---------------------------------------------------------------------------

class TitleScene implements Scene {
  update() {}
  drawWorld(g: Ctx) {
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#5ab8f0');
    grad.addColorStop(0.6, '#bfe6ff');
    grad.addColorStop(0.6, '#8ad46e');
    grad.addColorStop(1, '#5cb44a');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    const t = clock.frame;
    ['modak', 'pong', 'saesun'].forEach((id, i) => {
      const bob = Math.round(Math.sin(t / 18 + i * 2) * 3);
      drawSprite(g, monSprite(id), 40 + i * 64, 88 + bob, 48, 48);
    });
    g.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 4; i++) {
      const x = ((t / 3 + i * 80) % (W + 60)) - 40;
      g.fillRect(x, 16 + i * 9, 30, 6);
      g.fillRect(x + 6, 12 + i * 9, 16, 4);
    }
  }
  drawUI(c: Ctx) {
    text(c, 'POPKET', W / 2, 26, { size: 36, weight: 900, align: 'center', color: '#ffd84a', shadow: '#2a4a8a' });
    text(c, '몬스터 수집 RPG', W / 2, 68, { size: 11, align: 'center', color: '#ffffff', shadow: '#2a4a8a' });
    if (!ui.active && Math.floor(clock.frame / 30) % 2 === 0) {
      text(c, 'Z / Enter 를 눌러 시작', W / 2, 160, { size: 10, align: 'center', color: '#ffffff', shadow: '#2a5a2a' });
    }
  }
}

async function titleFlow() {
  scenes.current = new TitleScene();
  await fadeTo(0, 20);
  const items = hasSave() ? ['이어하기', '새로 시작'] : ['새로 시작'];
  const r = await ui.run(new Menu({ items, x: W / 2 - 48, y: 146, w: 96 }));
  await fadeTo(1, 16);
  if (items[r] === '이어하기' && loadGame()) {
    world.load(game.map, game.x, game.y, game.dir);
    scenes.current = world;
    await fadeTo(0, 16);
    return;
  }
  let name = '';
  try {
    name = (window.prompt('주인공의 이름을 정해 주세요 (최대 6글자)', '하루') ?? '').trim().slice(0, 6);
  } catch {
    /* prompt unavailable */
  }
  if (!name) {
    const names = ['하루', '지수', '민준', '서윤', '도윤'];
    await fadeTo(0, 10);
    const m = new MessageBox('주인공의 이름을 골라 주세요.', { persist: true, instant: true });
    ui.run(m);
    await m.promise;
    const k = await ui.run(new Menu({ items: names, x: W - 76, y: 20, w: 72 }));
    m.close();
    name = names[k];
    await fadeTo(1, 12);
  }
  newGame(name);
  world.load('home', 2, 5, 'down');
  scenes.current = world;
  await fadeTo(0, 20);
  await say('…아침 햇살이 창문으로 들어온다.');
  await say('엄마: {name}, 일어났니? 한별 박사님이 연구소로 와 달라고 하셨어!\n연구소는 집을 나가서 오른쪽이란다.');
}

// ---------------------------------------------------------------------------

function frame() {
  // Draw first so that state changes from the previous update (including
  // promise continuations that ran afterwards) are reflected together.
  const sc = scenes.current;
  lctx.clearRect(0, 0, W, H);
  sc?.drawWorld(lctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(low, 0, 0, canvas.width, canvas.height);
  const k = canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.imageSmoothingEnabled = false;
  sc?.drawUI(ctx);
  ui.draw(ctx);
  if (fx.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${fx.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (fx.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fx.fade})`;
    ctx.fillRect(0, 0, W, H);
  }

  input.tick();
  tickTasks();
  const uiWasActive = ui.active;
  ui.update();
  sc?.update(!uiWasActive);
  ui.cleanup();
  input.endFrame();
  if (sc === world) game.frames++;
  requestAnimationFrame(frame);
}

fx.fade = 1;
requestAnimationFrame(frame);

const fontReady = (document as Document & { fonts?: FontFaceSet }).fonts?.load('700 11px "Noto Sans KR"') ?? Promise.resolve();
Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]).finally(() => runScript(titleFlow));

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__popket = { game, world, ui, scenes };
}
