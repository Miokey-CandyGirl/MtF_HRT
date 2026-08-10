import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, subDays, parseISO } from 'date-fns';
import type {
  View,
  Settings,
  HormoneRecord,
  BodySignRecord,
  SideEffectRecord,
  SavingsGoal,
  Reminder,
  MoodRecord,
  DysphoriaRecord,
  Achievement,
  BadgeMap,
  MedicationState,
} from '@/types';
import { uid, todayStr, addDaysStr, dateKey } from '@/lib/utils';
import { evaluateBadges, type BadgeContext } from '@/lib/badges';
import { CLOTHING_GOAL_NAME, HAIR_REMOVAL_KEYWORD } from '@/constants';

// ===== 通用列表 store 工厂 =====
interface ListState<T extends { id: string }> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  setItems: (items: T[]) => void;
}

function createListStore<T extends { id: string }>(name: string) {
  return create<ListState<T>>()(
    persist(
      (set) => ({
        items: [],
        add: (item) => set((s) => ({ items: [...s.items, item] })),
        update: (id, patch) =>
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          })),
        remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
        setItems: (items) => set({ items }),
      }),
      { name },
    ),
  );
}

// ===== 各数据域 store =====
export const useHormoneStore = createListStore<HormoneRecord>('hrt:hormones');
export const useBodySignsStore = createListStore<BodySignRecord>('hrt:bodySigns');
export const useSideEffectsStore = createListStore<SideEffectRecord>('hrt:sideEffects');
export const useMoodStore = createListStore<MoodRecord>('hrt:mood');
export const useDysphoriaStore = createListStore<DysphoriaRecord>('hrt:dysphoria');
export const useAchievementsStore = createListStore<Achievement>('hrt:achievements');

// ===== 用药打卡 =====
interface MedicationStore extends MedicationState {
  toggle: (date: string, med: 'spironolactone' | 'estradiol') => void;
  setStreak: (n: number) => void;
}

function computeStreak(logs: MedicationState['logs']): number {
  let streak = 0;
  let d = new Date();
  const todayK = format(d, 'yyyyMMdd');
  const todayDone = logs[todayK]?.spironolactone && logs[todayK]?.estradiol;
  if (!todayDone) d = subDays(d, 1);
  // 防御性上限，避免异常数据死循环
  while (streak < 10000) {
    const k = format(d, 'yyyyMMdd');
    if (logs[k]?.spironolactone && logs[k]?.estradiol) {
      streak += 1;
      d = subDays(d, 1);
    } else break;
  }
  return streak;
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      logs: {},
      streak: 0,
      toggle: (date, med) => {
        const k = dateKey(date);
        const logs = get().logs;
        const cur = logs[k] ?? { spironolactone: false, estradiol: false };
        const next = { ...cur, [med]: !cur[med] };
        const nextLogs = { ...logs, [k]: next };
        set({ logs: nextLogs, streak: computeStreak(nextLogs) });
      },
      setStreak: (n) => set({ streak: n }),
    }),
    { name: 'hrt:medication' },
  ),
);

// ===== 年度打卡墙 =====
export interface AnnualStore {
  toggle: (mmdd: string) => void;
  // 索引签名需兼容 toggle 方法，故联合函数类型
  [mmdd: string]: boolean | ((mmdd: string) => void);
}
export const useAnnualStore = create<AnnualStore>()(
  persist(
    (set, get) => ({
      toggle: (mmdd) => {
        const cur = get()[mmdd];
        set({ [mmdd]: !cur } as AnnualStore);
      },
    }),
    { name: 'hrt:annual' },
  ),
);

// ===== 存钱罐 =====
interface SavingsStore {
  goals: SavingsGoal[];
  addGoal: (g: SavingsGoal) => void;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  removeGoal: (id: string) => void;
  addSaved: (id: string, amount: number) => void;
  resetGoal: (id: string) => void;
  setGoals: (g: SavingsGoal[]) => void;
}
export const useSavingsStore = create<SavingsStore>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (g) => set((s) => ({ goals: [...s.goals, g] })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addSaved: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g,
          ),
        })),
      resetGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, saved: 0 } : g)),
        })),
      setGoals: (goals) => set({ goals }),
    }),
    { name: 'hrt:savings' },
  ),
);

// ===== 体检提醒 =====
interface RemindersStore {
  items: Reminder[];
  add: (r: Reminder) => void;
  update: (id: string, patch: Partial<Reminder>) => void;
  remove: (id: string) => void;
  complete: (id: string) => void; // 标记完成并顺延
}
export const useRemindersStore = create<RemindersStore>()(
  persist(
    (set) => ({
      items: [],
      add: (r) => set((s) => ({ items: [...s.items, r] })),
      update: (id, patch) =>
        set((s) => ({ items: s.items.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
      complete: (id) =>
        set((s) => ({
          items: s.items.map((r) =>
            r.id === id
              ? {
                  ...r,
                  done: true,
                  lastCompleted: todayStr(),
                  nextDate: addDaysStr(todayStr(), r.intervalDays),
                  completionCount: r.completionCount + 1,
                }
              : r,
          ),
        })),
    }),
    { name: 'hrt:reminders' },
  ),
);

// ===== 文本类 store =====
interface TextStore {
  text: string;
  setText: (t: string) => void;
}
export const useMedicalArchiveStore = create<TextStore>()(
  persist((set) => ({ text: '', setText: (text) => set({ text }) }), { name: 'hrt:medicalArchive' }),
);
export const usePsychNotesStore = create<TextStore>()(
  persist((set) => ({ text: '', setText: (text) => set({ text }) }), { name: 'hrt:psychNotes' }),
);

// ===== 徽章 =====
interface BadgesStore {
  badges: BadgeMap;
  unlock: (ids: string[]) => void;
}
export const useBadgesStore = create<BadgesStore>()(
  persist(
    (set) => ({
      badges: {},
      unlock: (ids) =>
        set((s) => {
          const nowIso = new Date().toISOString();
          const next = { ...s.badges };
          ids.forEach((id) => {
            if (!next[id]) next[id] = { unlockedAt: nowIso };
          });
          return { badges: next };
        }),
    }),
    { name: 'hrt:badges' },
  ),
);

// ===== 元信息（导出计数等） =====
interface MetaStore {
  exportCount: number;
  incExport: () => void;
}
export const useMetaStore = create<MetaStore>()(
  persist(
    (set) => ({
      exportCount: 0,
      incExport: () => set((s) => ({ exportCount: s.exportCount + 1 })),
    }),
    { name: 'hrt:meta' },
  ),
);

// ===== 设置（持久化，供 index.html 内联脚本读取 darkMode） =====
interface SettingsStore extends Settings {
  setParticles: (v: boolean) => void;
  setDensity: (v: Settings['density']) => void;
  setDarkMode: (v: boolean) => void;
}
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      particles: true,
      density: 'med',
      darkMode: false,
      setParticles: (particles) => set({ particles }),
      setDensity: (density) => set({ density }),
      setDarkMode: (darkMode) => set({ darkMode }),
    }),
    { name: 'hrt:settings' },
  ),
);

// ===== UI 视图（不持久化，由 location.hash 同步） =====
interface UIStore {
  view: View;
  setView: (v: View) => void;
}
export const useUIStore = create<UIStore>((set) => ({
  view: 'home',
  setView: (view) => set({ view }),
}));

// ===== 徽章评估 =====
export function buildBadgeContext(): BadgeContext {
  const med = useMedicationStore.getState();
  const hormones = useHormoneStore.getState();
  const body = useBodySignsStore.getState();
  const reminders = useRemindersStore.getState();
  const savings = useSavingsStore.getState();
  const mood = useMoodStore.getState();
  const dysphoria = useDysphoriaStore.getState();
  const meta = useMetaStore.getState();

  const reminderCompletedCount = reminders.items.reduce(
    (n, r) => n + (r.completionCount || 0),
    0,
  );
  const hairRemovalCompletedCount = reminders.items
    .filter((r) => r.type.includes(HAIR_REMOVAL_KEYWORD))
    .reduce((n, r) => n + (r.completionCount || 0), 0);

  const clothing = savings.goals.find((g) => g.name.includes(CLOTHING_GOAL_NAME));
  const clothingFundProgress =
    clothing && clothing.target > 0 ? Math.min(1, clothing.saved / clothing.target) : 0;

  return {
    medicationStreak: med.streak,
    hormoneCount: hormones.items.length,
    bodySignCount: body.items.length,
    reminderCompletedCount,
    hairRemovalCompletedCount,
    clothingFundProgress,
    moodCount: mood.items.length,
    dysphoriaCount: dysphoria.items.length,
    hasExported: meta.exportCount > 0,
  };
}

/** 评估并解锁新徽章，返回新解锁 id */
export function syncBadges(): string[] {
  const ctx = buildBadgeContext();
  const badgesStore = useBadgesStore.getState();
  const newly = evaluateBadges(ctx, badgesStore.badges);
  if (newly.length) badgesStore.unlock(newly);
  return newly;
}

/** 解析日期字符串防御 */
export function safeParseDate(s: string): Date {
  const d = parseISO(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export { uid };
