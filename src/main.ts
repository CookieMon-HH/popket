import { W, H, OX, BW, setLogicalWidth } from './engine/draw';
import { input, bindTouchPad, bindJoystick, bindDpad } from './engine/input';
import { loadSettings } from './game/settings';
import { ui, Menu, MessageBox, setTextFormatter, say, yesNo, choose } from './engine/ui';
import { tickTasks } from './engine/timing';
import { scenes, fx, fadeTo } from './engine/scene';
import { world } from './game/overworld';
import { installHooks, runScript, appHooks } from './game/api';
import { game, hasSave, loadGame, newGame, saveGame, runtime, localSaveTime, writeLocalSave } from './game/state';
import { j } from './game/common';
import { TitleScene } from './game/title';
import { cloudAvailable, initCloud, signedIn, signInWithGoogle, signOut, deleteAccount, downloadSave, uploadSave } from './game/cloud';

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
  if (!cloud) return;
  const cloudTime = (cloud.data.savedAtMs as number | undefined) ?? cloud.updatedAt;
  if (cloudTime > localSaveTime() && writeLocalSave(cloud.data)) {
    await say(hasSave() ? '구글 계정에 저장된 최신 기록을 불러왔어요!' : '구글 계정의 기록을 불러왔어요!');
  }
}

async function accountMenu() {
  const c = await choose('구글 계정으로 로그인되어 있어요.\n저장할 때마다 인터넷에도 기록돼요.', ['로그아웃', '계정 삭제', '닫기']);
  if (c === 0) {
    await signOut();
    await say('로그아웃했어요. 이 기기에 저장된 기록은 그대로 남아 있어요.');
  } else if (c === 1) {
    if (!(await yesNo('계정을 삭제하면 인터넷에 저장된 게임 기록도 모두 지워져요.\n정말 삭제할까요?'))) return;
    if (!(await yesNo('되돌릴 수 없어요. 그래도 삭제할까요?'))) return;
    if (await deleteAccount()) await say('계정과 인터넷 기록을 삭제했어요.\n이 기기에 저장된 기록은 그대로 남아 있어요.');
    else await say('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
}

async function titleFlow() {
  const title = new TitleScene();
  scenes.current = title;
  await fadeTo(0, 20);
  await title.waitStart();
  await syncCloudSave();
  let pick = '';
  for (;;) {
    const account = cloudAvailable ? [signedIn() ? '계정' : '구글로 로그인'] : [];
    const items = [...(hasSave() ? ['이어하기'] : []), '새로 시작', ...account];
    pick = items[await ui.run(new Menu({ items, x: W / 2 - 52, y: 192 - 14 - items.length * 16, w: 104 }))];
    if (pick === '구글로 로그인') {
      const ok = await yesNo('구글 계정으로 로그인할까요?\n로그인하면 게임 기록을 인터넷에도 저장해서 다른 기기에서 이어할 수 있어요.');
      if (!ok) continue;
      await say('게임에는 계정 번호와 게임 기록만 보관하고,\n이름이나 이메일 같은 개인정보는 따로 저장하지 않아요.');
      title.dispose();
      await signInWithGoogle(); // leaves the page for Google's sign-in
      return;
    }
    if (pick === '계정') {
      await accountMenu();
      continue;
    }
    break;
  }
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
