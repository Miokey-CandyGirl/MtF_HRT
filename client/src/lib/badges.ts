// 徽章解锁引擎

export interface BadgeContext {
  medicationStreak: number;
  hormoneCount: number;
  bodySignCount: number;
  reminderCompletedCount: number;
  hairRemovalCompletedCount: number;
  clothingFundProgress: number; // 0-1
  moodCount: number;
  dysphoriaCount: number;
  hasExported: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (ctx: BadgeContext) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'medication-30',
    name: '坚持服药小天使',
    emoji: '💊',
    description: '连续服药满 30 天',
    check: (c) => c.medicationStreak >= 30,
  },
  {
    id: 'recheck-angel',
    name: '坚持复查小天使',
    emoji: '🩸',
    description: '完成 3 次复查打卡',
    check: (c) => c.reminderCompletedCount >= 3,
  },
  {
    id: 'hair-removal-star',
    name: '脱毛进度之星',
    emoji: '✨',
    description: '完成 2 次脱毛复诊',
    check: (c) => c.hairRemovalCompletedCount >= 2,
  },
  {
    id: 'outfit-master',
    name: '穿搭小达人',
    emoji: '🎀',
    description: '服饰购置基金进度达 50%',
    check: (c) => c.clothingFundProgress >= 0.5,
  },
  {
    id: 'lab-recorder',
    name: '化验记录小能手',
    emoji: '🔬',
    description: '记录 3 条激素化验',
    check: (c) => c.hormoneCount >= 3,
  },
  {
    id: 'body-recorder',
    name: '体征记录小能手',
    emoji: '📏',
    description: '记录 3 条身体体征',
    check: (c) => c.bodySignCount >= 3,
  },
  {
    id: 'diary-writer',
    name: '日记小作家',
    emoji: '📖',
    description: '写下 10 篇身心日记',
    check: (c) => c.moodCount >= 10,
  },
  {
    id: 'backup-guard',
    name: '备份小卫士',
    emoji: '🛡️',
    description: '完成 1 次数据导出备份',
    check: (c) => c.hasExported,
  },
];

export const BADGE_MAP: Record<string, BadgeDef> = BADGES.reduce(
  (acc, b) => {
    acc[b.id] = b;
    return acc;
  },
  {} as Record<string, BadgeDef>,
);

/** 评估并返回本次新解锁的徽章 id 列表 */
export function evaluateBadges(
  ctx: BadgeContext,
  currentUnlocked: Record<string, { unlockedAt: string }>,
): string[] {
  const now = new Date().toISOString();
  const newly: string[] = [];
  BADGES.forEach((b) => {
    if (!currentUnlocked[b.id] && b.check(ctx)) {
      newly.push(b.id);
    }
  });
  return newly;
}
