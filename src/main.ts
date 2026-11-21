import { W, H, OX, BW, setLogicalWidth } from './engine/draw';
import { input, bindTouchPad, bindJoystick, bindDpad } from './engine/input';
import { loadSettings } from './game/settings';
import { ui, Menu, MessageBox, setTextFormatter, say, yesNo } from './engine/ui';
import { tickTasks } from './engine/timing';
import { scenes, fx, fadeTo } from './engine/scene';
import { world } from './game/overworld';
import { installHooks, runScript, appHooks } from './game/api';
import { game, hasSave, loadGame, newGame, saveGame, runtime, localSaveTime, writeLocalSave } from './game/state';
import { j } from './game/common';
import { TitleScene } from './game/title';
import { initCloud, signedIn, downloadSave, uploadSave, cloudAvailable, signInWithGoogle } from './game/cloud';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const low = document.createElement('canvas');
low.width = W;
low.height = H;
const lctx = low.getContext('2d')!;
lctx.imageSmoothingEnabled = false;

function resize() {
  const wrap = document.getElementById('screen-wrap')!;
  const cs = getComputedStyle(wrap);
  const aw = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  // Fill the screen: height stays 192, width follows the aspect ratio.
  const lw = Math.max(256, Math.min(456, Math.round(((aw / ah) * H) / 2) * 2));
  setLogicalWidth(lw);
  low.width = W;
  low.height = H;
  lctx.imageSmoothingEnabled = false;
  const s = Math.max(0.5, Math.min(aw / W, ah / H));
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${Math.floor(W * s)}px`;
  canvas.style.height = `${Math.floor(H * s)}px`;
  canvas.width = Math.round(W * s * dpr);
  canvas.height = Math.round(H * s * dpr);
}
window.addEventListener('resize', resize);
resize();
loadSettings();
bindTouchPad(document.getElementById('touch')!);
bindDpad(document.getElementById('dpad')!);
bindJoystick(document.getElementById('stick-zone')!, document.getElementById('stick')!, document.getElementById('knob')!);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));

setTextFormatter((s) => s.replace(/\{name\}은\(는\)/g, j(game.name, '은/는')).replace(/\{name\}/g, game.name));
installHooks();

// ---------------------------------------------------------------------------

/** When signed in, keep the newer of this device's save and the cloud save. */
async function syncCloudSave() {
  if (!signedIn()) return;
  const cloud = await downloadSave();
  if (cloud === 'error') {
    await say('인터넷 기록을 불러오지 못했어요.\n이 기기에 저장된 기록으로 진행해요.');
    return;
  }
  const cloudTime = cloud ? ((cloud.data.savedAtMs as number | undefined) ?? cloud.updatedAt) : 0;
  const localTime = localSaveTime();
  if (cloud && cloudTime > localTime) {
    const had = hasSave();
    if (writeLocalSave(cloud.data)) await say(had ? '서버에 저장된 더 최신 기록을 불러왔어요!' : '서버에 저장된 기록을 불러왔어요!');
  } else if (localTime > cloudTime && loadGame()) {
    // This device has the newer save (e.g. just signed in): copy it to the server.
    if (await uploadSave(game)) await say('이 기기의 기록을 서버에도 저장했어요!');
  }
}

async function titleFlow() {
  const title = new TitleScene();
  scenes.current = title;
  await fadeTo(0, 20);
  await title.waitStart();
  // Login screen: play with a Google account (saved on the server) or as a guest (saved in this browser).
  if (cloudAvailable && !signedIn()) {
    const c = await ui.run(new Menu({ items: ['구글로 시작하기', '계정 없이 시작하기'], x: W / 2 - 66, y: 192 - 14 - 2 * 16, w: 132 }));
    if (c === 0) {
      await say('구글 계정으로 시작하면 게임 기록이 서버에 저장돼서\n어느 기기에서든 이어 할 수 있어요.');
      await say('서버에는 계정 번호와 게임 기록만 보관하고,\n이름이나 이메일 같은 개인정보는 게임에 따로 저장하지 않아요.');
      title.dispose();
      await signInWithGoogle(); // leaves the page for Google's sign-in, then comes back here
      return;
    }
  }
  await syncCloudSave();
  const menuItems = [...(hasSave() ? ['이어하기'] : []), '새로 시작'];
  const pick = menuItems[await ui.run(new Menu({ items: menuItems, x: W / 2 - 52, y: 192 - 14 - menuItems.length * 16, w: 104 }))];
  title.dispose();
  const r = pick === '이어하기' ? 0 : 1;
  const items = ['이어하기', '새로 시작'];
  if (items[r] === '새로 시작' && hasSave()) {
    const ok = await yesNo('새로 시작하면, 저장할 때 이전 기록을 덮어써요.\n그래도 새로 시작할까요?');
    if (!ok) return titleFlow();
  }
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
    const k = await ui.run(new Menu({ items: names, x: OX + BW - 76, y: 20, w: 72 }));
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
  // Safari time keeps running in battles too (but not on the title screen).
  if (game.safari && game.safari.left > 0 && world.map?.safari && !(sc instanceof TitleScene)) game.safari.left--;
  requestAnimationFrame(frame);
}

fx.fade = 1;
requestAnimationFrame(frame);

appHooks.toTitle = () =>
  runScript(async () => {
    await fadeTo(1, 16);
    await titleFlow();
  });

const inWorld = () => scenes.current === world && game.flags.gotStarter;

// Closing the tab with unsaved progress: ask the browser to confirm.
window.addEventListener('beforeunload', (e) => {
  if (inWorld() && game.frames - runtime.savedAt > 600) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Phones rarely show that prompt, so when the app goes to the background
// we quietly update a save that already belongs to this game.
function backgroundSave() {
  if (document.visibilityState !== 'hidden' || !runtime.ownsSave || !inWorld() || runtime.busy || ui.active) return;
  world.syncState();
  if (saveGame() && signedIn()) void uploadSave(game);
}
document.addEventListener('visibilitychange', backgroundSave);
window.addEventListener('pagehide', backgroundSave);

const fontReady = (document as Document & { fonts?: FontFaceSet }).fonts?.load('700 11px "Noto Sans KR"') ?? Promise.resolve();
Promise.all([Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]), initCloud()]).finally(() => runScript(titleFlow));

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__popket = { game, world, ui, scenes };
}
