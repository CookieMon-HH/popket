export type MonType = '노말' | '불' | '물' | '풀' | '전기' | '바위' | '벌레' | '바람';

export const TYPE_COLOR: Record<MonType, string> = {
  노말: '#9a9a86',
  불: '#ec6a3a',
  물: '#4a8ee8',
  풀: '#58b048',
  전기: '#e8b820',
  바위: '#a88a50',
  벌레: '#98b028',
  바람: '#7aa0e0',
};

const CHART: Partial<Record<MonType, Partial<Record<MonType, number>>>> = {
  노말: { 바위: 0.5 },
  불: { 풀: 2, 벌레: 2, 물: 0.5, 바위: 0.5, 불: 0.5 },
  물: { 불: 2, 바위: 2, 물: 0.5, 풀: 0.5 },
  풀: { 물: 2, 바위: 2, 불: 0.5, 풀: 0.5, 벌레: 0.5, 바람: 0.5 },
  전기: { 물: 2, 바람: 2, 풀: 0.5, 전기: 0.5, 바위: 0.5 },
  바위: { 불: 2, 벌레: 2, 바람: 2 },
  벌레: { 풀: 2, 불: 0.5, 바람: 0.5 },
  바람: { 풀: 2, 벌레: 2, 바위: 0.5, 전기: 0.5 },
};

export function effectiveness(atk: MonType, defs: MonType[]): number {
  return defs.reduce((m, d) => m * (CHART[atk]?.[d] ?? 1), 1);
}
