export interface ItemDef {
  id: string;
  name: string;
  price: number;
  kind: 'heal' | 'cure' | 'revive' | 'ball';
  amount?: number;
  ballMul?: number;
  desc: string;
}

const list: ItemDef[] = [
  { id: 'ball', name: '포획구', price: 200, kind: 'ball', ballMul: 1, desc: '야생 몬스터에게 던져서 잡는 캡슐.' },
  { id: 'superball', name: '슈퍼포획구', price: 600, kind: 'ball', ballMul: 1.5, desc: '포획구보다 잘 잡히는 고급 캡슐.' },
  { id: 'potion', name: '회복약', price: 300, kind: 'heal', amount: 20, desc: '몬스터의 체력을 20 회복한다.' },
  { id: 'superpotion', name: '고급회복약', price: 700, kind: 'heal', amount: 60, desc: '몬스터의 체력을 60 회복한다.' },
  { id: 'cure', name: '만병통치약', price: 400, kind: 'cure', desc: '화상·독·마비·수면을 모두 낫게 한다.' },
  { id: 'revive', name: '기운의조각', price: 1500, kind: 'revive', desc: '쓰러진 몬스터를 체력 절반으로 되살린다.' },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(list.map((i) => [i.id, i]));
export const ITEM_ORDER = list.map((i) => i.id);
