import { ui, Menu, say, yesNo } from '../engine/ui';
import { OX, BW } from '../engine/draw';
import { MOVES } from '../data/moves';
import { SPECIES } from '../data/species';
import { monName, type Mon } from './monster';
import { j } from './common';

export function movesLearnedAt(species: string, level: number): string[] {
  return SPECIES[species].learnset.filter(([lv]) => lv === level).map(([, id]) => id);
}

export async function learnMove(m: Mon, id: string) {
  if (m.moves.some((s) => s.id === id)) return;
  const mv = MOVES[id];
  const n = monName(m);
  if (m.moves.length < 4) {
    m.moves.push({ id, pp: mv.pp });
    await say(`${j(n, '은/는')} 새로 ${j(mv.name, '을/를')} 배웠다!`);
    return;
  }
  await say(`${j(n, '은/는')} ${j(mv.name, '을/를')} 배우고 싶어 한다…\n하지만 기술을 이미 4개 알고 있다.`);
  for (;;) {
    if (await yesNo(`다른 기술을 잊고 ${j(mv.name, '을/를')} 배우게 할까?`)) {
      const items = [...m.moves.map((s) => MOVES[s.id].name), '그만두기'];
      const r = await ui.run(new Menu({ items, cancel: true, x: OX + BW - 110, y: 50 }));
      if (r >= 0 && r < 4) {
        const old = MOVES[m.moves[r].id].name;
        m.moves[r] = { id, pp: mv.pp };
        await say(`하나, 둘의… 짠!\n${j(n, '은/는')} ${j(old, '을/를')} 깨끗이 잊었다!`);
        await say(`그리고 ${j(n, '은/는')} 새로 ${j(mv.name, '을/를')} 배웠다!`);
        return;
      }
    }
    if (await yesNo(`${mv.name} 배우기를 포기할까?`)) {
      await say(`${j(n, '은/는')} 결국 ${j(mv.name, '을/를')} 배우지 않았다.`);
      return;
    }
  }
}
