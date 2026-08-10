import type { HormoneKey } from '@/types';

// 7 项性激素参考区间（成人近似值，仅供个人参考，非诊断依据）
// 来源：综合临床检验常见区间；可在本文件内调整
export interface HormoneDef {
  key: HormoneKey;
  label: string;
  unit: string;
  female: [number, number]; // 女性参考区间
  male: [number, number]; // 原生男性参考区间
  color: string; // 折线颜色（樱花粉色系衍生）
}

export const HORMONES: HormoneDef[] = [
  { key: 'e2', label: '雌二醇 E2', unit: 'pg/mL', female: [30, 400], male: [10, 60], color: 'hsl(340,75%,60%)' },
  { key: 't', label: '睾酮 T', unit: 'ng/dL', female: [8, 60], male: [280, 1100], color: 'hsl(10,75%,62%)' },
  { key: 'prl', label: '泌乳素 PRL', unit: 'ng/mL', female: [6, 24], male: [4, 15], color: 'hsl(310,65%,65%)' },
  { key: 'lh', label: '促黄体 LH', unit: 'mIU/mL', female: [2, 15], male: [1.8, 8], color: 'hsl(280,60%,66%)' },
  { key: 'fsh', label: '促卵泡 FSH', unit: 'mIU/mL', female: [3, 12], male: [1.5, 12], color: 'hsl(20,70%,63%)' },
  { key: 'p', label: '孕酮 P', unit: 'ng/mL', female: [0.2, 25], male: [0.1, 1], color: 'hsl(355,70%,62%)' },
  { key: 'shbg', label: '结合球蛋白 SHBG', unit: 'nmol/L', female: [30, 135], male: [13, 71], color: 'hsl(45,65%,58%)' },
];

export const HORMONE_MAP: Record<HormoneKey, HormoneDef> = HORMONES.reduce(
  (acc, h) => {
    acc[h.key] = h;
    return acc;
  },
  {} as Record<HormoneKey, HormoneDef>,
);

/** 女性参考中值 */
export function femaleMid(h: HormoneDef): number {
  return (h.female[0] + h.female[1]) / 2;
}

/** 男性参考中值 */
export function maleMid(h: HormoneDef): number {
  return (h.male[0] + h.male[1]) / 2;
}

/** 归一化到女性参考中值：1.0 = 女性中值（目标锚点） */
export function normalize(value: number, key: HormoneKey): number {
  const mid = femaleMid(HORMONE_MAP[key]);
  if (!mid || !isFinite(value)) return 0;
  return value / mid;
}

/**
 * 原生男性参考线（归一化后的均值）。
 * 由于各项激素男性/女性比值方向不一（如 T 远高于女性、E2 低于女性），
 * 此处取所有激素 maleMid/femaleMid 的几何均值作为整体参考锚，
 * 仅作视觉参考；精确区间请看侧栏参考区间表。
 */
export function maleReferenceLine(): number {
  const ratios = HORMONES.map((h) => maleMid(h) / femaleMid(h));
  const product = ratios.reduce((acc, r) => acc * r, 1);
  return Math.pow(product, 1 / ratios.length);
}

/** 女性参考线（恒为 1.0） */
export const FEMALE_REFERENCE_LINE = 1;

/** 图表 Y 轴归一化显示上限（裁剪极端值，保持可读） */
export const NORM_Y_MAX = 2.2;

/** 归一化后裁剪用于绘图（不改变存储） */
export function normalizeClamped(value: number, key: HormoneKey): number {
  return Math.min(NORM_Y_MAX, Math.max(0, normalize(value, key)));
}
