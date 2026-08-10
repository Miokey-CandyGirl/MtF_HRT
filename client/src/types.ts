// ===== 全局类型定义 =====

/** 视图（无全局导航，首页卡片跳转） */
export type View =
  | 'home'
  | 'medication'
  | 'hormone'
  | 'savings'
  | 'reminders'
  | 'diary'
  | 'achievements'
  | 'settings';

/** 7 项性激素键（经典六项 + SHBG） */
export type HormoneKey = 'e2' | 't' | 'prl' | 'lh' | 'fsh' | 'p' | 'shbg';

export interface HormoneRecord {
  id: string;
  date: string; // YYYY-MM-DD
  e2: number; // 雌二醇 pg/mL
  t: number; // 睾酮 ng/dL
  prl: number; // 泌乳素 ng/mL
  lh: number; // 促黄体生成素 mIU/mL
  fsh: number; // 促卵泡生成素 mIU/mL
  p: number; // 孕酮 ng/mL
  shbg: number; // 性激素结合球蛋白 nmol/L
  note?: string;
}

/** 身体体征记录 */
export interface BodySignRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  bodyFat?: number; // %
  chest?: number; // cm
  oilLevel: 1 | 2 | 3 | 4 | 5; // 皮肤出油程度
  hotFlash?: string; // 潮热主观感受
  note?: string;
}

/** 副作用日志 */
export interface SideEffectRecord {
  id: string;
  date: string; // YYYY-MM-DD
  effects: string[]; // 头晕/乏力/乳房胀痛/出油改变/其他
  description?: string;
}

/** 存钱目标 */
export interface SavingsGoal {
  id: string;
  name: string;
  target: number; // 目标总金额
  monthly: number; // 每月计划存入
  saved: number; // 已存入
}

/** 体检提醒 */
export interface Reminder {
  id: string;
  name: string;
  type: string; // 复查类型
  firstDate: string; // YYYY-MM-DD 首次提醒日期
  intervalDays: number; // 重复周期天数
  lastCompleted?: string; // 上次完成日期
  nextDate: string; // 下次到期日期
  done: boolean; // 当前周期是否已完成
  completionCount: number; // 累计完成次数（徽章判定用）
}

/** 心情日记 */
export interface MoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  note?: string;
}

/** 性别焦虑量表 */
export interface DysphoriaRecord {
  id: string;
  date: string; // YYYY-MM-DD
  score: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

/** 成就回忆 */
export interface Achievement {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

/** 已解锁徽章 */
export interface BadgeMap {
  [badgeId: string]: { unlockedAt: string };
}

/** 每日用药打卡 */
export interface MedicationState {
  logs: Record<string, { spironolactone: boolean; estradiol: boolean }>; // key: YYYYMMDD
  streak: number;
}

/** 年度打卡墙 */
export interface AnnualState {
  [mmdd: string]: boolean; // key: MMDD
}

/** 用户设置 */
export interface Settings {
  particles: boolean;
  density: 'low' | 'med' | 'high';
  darkMode: boolean;
}

/** 副作用多选项 */
export const SIDE_EFFECT_OPTIONS = ['头晕', '乏力', '乳房胀痛', '出油改变', '其他'] as const;
