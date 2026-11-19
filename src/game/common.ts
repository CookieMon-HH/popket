export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Dir[] = ['up', 'down', 'left', 'right'];
export const DIRV: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// digit → [has final consonant, final is ㄹ]
const DIGIT: Record<string, [boolean, boolean]> = {
  '0': [true, false], '1': [true, true], '2': [false, false], '3': [true, false], '4': [false, false],
  '5': [false, false], '6': [true, false], '7': [true, true], '8': [true, true], '9': [false, false],
};

function finalOf(word: string): [boolean, boolean] {
  const ch = word[word.length - 1] ?? '';
  if (DIGIT[ch]) return DIGIT[ch];
  const c = ch.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3) return [false, false];
  const jong = (c - 0xac00) % 28;
  return [jong !== 0, jong === 8];
}

/**
 * Attach a Korean particle. Pass the pair as "은/는", "이/가", "을/를", "과/와", "으로/로".
 */
export function j(word: string, pair: string): string {
  const [withB, without] = pair.split('/');
  const [has, rieul] = finalOf(word);
  if (withB === '으로') return word + (has && !rieul ? '으로' : '로');
  return word + (has ? withB : without);
}
