export interface ItemDef {
  id: string;
  name: string;
  price: number;
  kind: 'heal' | 'cure' | 'revive' | 'ball' | 'key';
  amount?: number;
  ballMul?: number;
  desc: string;
}

const list: ItemDef[] = [
  { id: 'ball', name: '포획구', price: 200, kind: 'ball', ballMul: 1, desc: '야생 몬스터에게 던져서 잡는 캡슐.' },
  { id: 'superball', name: '슈퍼포획구', price: 600, kind: 'ball', ballMul: 1.5, desc: '포획구보다 잘 잡히는 고급 캡슐.' },
  { id: 'potion', name: '회복약', price: 300, kind: 'heal', amount: 20, desc: '몬스터의 체력을 20 회복한다.' },
  { id: 'superpotion', name: '고급회복약', price: 700, kind: 'heal', amount: 60, desc: '몬스터의 체력을 60 회복한다.' },
  { id: 'hyperpotion', name: '특급회복약', price: 1200, kind: 'heal', amount: 150, desc: '몬스터의 체력을 150 회복한다.' },
  { id: 'cure', name: '만병통치약', price: 400, kind: 'cure', desc: '화상·독·마비·수면을 모두 낫게 한다.' },
  { id: 'revive', name: '기운의조각', price: 1500, kind: 'revive', desc: '쓰러진 몬스터를 체력 절반으로 되살린다.' },
  { id: 'bell_forest', name: '숲의방울', price: 0, kind: 'key', desc: '숲지기 할머니에게 받은 초록빛 방울. 흔들면 나뭇잎 소리가 난다.' },
  { id: 'bell_water', name: '물의방울', price: 0, kind: 'key', desc: '물안개마을 낚시꾼에게 받은 푸른 방울. 흔들면 물방울 소리가 난다.' },
  { id: 'bell_rock', name: '바위의방울', price: 0, kind: 'key', desc: '별빛동굴 광부 대장에게 받은 잿빛 방울. 흔들면 돌 구르는 소리가 난다.' },
  { id: 'rod', name: '낚싯대', price: 0, kind: 'key', desc: '물가를 바라보고 A 버튼을 누르면 낚시를 할 수 있다.' },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(list.map((i) => [i.id, i]));
export const ITEM_ORDER = list.map((i) => i.id);
