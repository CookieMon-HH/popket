import { say, yesNo, choose } from '../engine/ui';
import { settings, saveSettings } from './settings';
import { runtime } from './state';
import { cloudAvailable, signedIn, signInWithGoogle, signOut, deleteAccount } from './cloud';

// ---------------------------------------------------------------------------
// Server save is optional. The game always saves in the browser; players who
// want their save on the server (to continue on another device) sign in with
// Google from the save prompt or from 설정.

async function explainAndSignIn(): Promise<boolean> {
  await say('구글 계정과 연동하면 지금까지의 기록이 서버에 저장돼서\n다른 기기에서도 구글로 시작해 이어 할 수 있어요.');
  await say('서버에는 계정 번호와 게임 기록만 보관하고,\n이름이나 이메일 같은 개인정보는 게임에 따로 저장하지 않아요.');
  if (!(await yesNo('지금 구글 계정과 연동할까요?\n(구글 로그인 화면으로 이동했다가 돌아와요)'))) return false;
  await signInWithGoogle(); // leaves the page; the save is already in the browser
  return true;
}

/** Called right after a successful browser save. Offers server save once per session. */
export async function offerServerSave() {
  if (!cloudAvailable || signedIn() || settings.noCloudPrompt || runtime.cloudAsked) return;
  runtime.cloudAsked = true;
  const c = await choose('이 기기(브라우저)에만 저장했어요.\n구글 계정과 연동하면 다른 기기에서도 이어 할 수 있어요.', ['괜찮아요', '구글 계정 연동하기', '다시 묻지 않기']);
  if (c === 1) await explainAndSignIn();
  else if (c === 2) {
    settings.noCloudPrompt = true;
    saveSettings();
    await say('알겠어요! 나중에 메뉴의 「설정」에서 언제든 구글 계정과 연동할 수 있어요.');
  }
}

export const accountLabel = () => (signedIn() ? '구글 계정: 연동됨' : '구글 계정: 연동 안 함');

/** 설정 → 구글 계정. */
export async function accountMenu() {
  if (!cloudAvailable) {
    await say('구글 계정 연동은 pampammon.vercel.app 에서 할 수 있어요.\n여기서는 이 기기(브라우저)에만 저장돼요.');
    return;
  }
  if (!signedIn()) {
    await explainAndSignIn();
    return;
  }
  const c = await choose('구글 계정과 연동되어 있어요.\n저장할 때마다 서버에도 기록돼요.', ['로그아웃', '계정 삭제', '닫기']);
  if (c === 0) {
    await signOut();
    await say('로그아웃했어요. 이 기기에 저장된 기록은 그대로 남아 있어요.');
  } else if (c === 1) {
    if (!(await yesNo('계정을 삭제하면 서버에 저장된 게임 기록도 모두 지워져요.\n정말 삭제할까요?'))) return;
    if (!(await yesNo('되돌릴 수 없어요. 그래도 삭제할까요?'))) return;
    if (await deleteAccount()) await say('계정과 서버 기록을 삭제했어요.\n이 기기에 저장된 기록은 그대로 남아 있어요.');
    else await say('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
}
