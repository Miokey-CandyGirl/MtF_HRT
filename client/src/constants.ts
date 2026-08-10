import type { SavingsGoal, View } from '@/types';

/** 首页快捷入口卡片 */
export const NAV_CARDS: {
  view: View;
  title: string;
  emoji: string;
  desc: string;
}[] = [
  { view: 'medication', title: '用药打卡', emoji: '💊', desc: '螺内酯 + 雌二醇凝胶' },
  { view: 'hormone', title: '激素追踪', emoji: '🩺', desc: '化验 / 体征 / 副作用 / 档案' },
  { view: 'savings', title: '愿望存钱罐', emoji: '💰', desc: '脱毛 · FFS · 服饰' },
  { view: 'reminders', title: '体检提醒', emoji: '🔔', desc: '复查日历自动顺延' },
  { view: 'diary', title: '身心日记', emoji: '💖', desc: '心情 · 焦虑量表 · 随访' },
  { view: 'achievements', title: '成就与徽章', emoji: '🏆', desc: '回忆墙 + 徽章墙' },
  { view: 'settings', title: '设置与备份', emoji: '🛠️', desc: '导出导入 · 月度总结' },
];

/** 存钱罐默认 3 组目标模板 */
export const SAVINGS_TEMPLATES: Omit<SavingsGoal, 'id'>[] = [
  { name: '口周脱毛基金', target: 0, monthly: 0, saved: 0 },
  { name: 'FFS 面部手术储备', target: 0, monthly: 0, saved: 0 },
  { name: '服饰购置基金', target: 0, monthly: 0, saved: 0 },
];

/** 服饰基金 id（徽章判定用） */
export const CLOTHING_GOAL_NAME = '服饰购置基金';

/** 体检提醒类型预设（自定义天数） */
export const REMINDER_PRESETS: { type: string; intervalDays: number }[] = [
  { type: '激素抽血', intervalDays: 90 },
  { type: '脱毛复诊', intervalDays: 42 },
  { type: '精神随访', intervalDays: 30 },
  { type: '其他复查', intervalDays: 180 },
];

/** 脱毛类型关键字（徽章判定用） */
export const HAIR_REMOVAL_KEYWORD = '脱毛';

/** 心情等级标签 */
export const MOOD_LABELS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: '😢', label: '很难受' },
  { value: 2, emoji: '😕', label: '有点低落' },
  { value: 3, emoji: '😐', label: '平平' },
  { value: 4, emoji: '🙂', label: '还不错' },
  { value: 5, emoji: '🥰', label: '很开心' },
];

/** 焦虑量表等级标签 */
export const DYSPHORIA_LABELS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: '🌈', label: '几乎没有' },
  { value: 2, emoji: '🌤️', label: '轻微' },
  { value: 3, emoji: '☁️', label: '中等' },
  { value: 4, emoji: '🌧️', label: '明显' },
  { value: 5, emoji: '⛈️', label: '强烈' },
];

/** 出油等级标签 */
export const OIL_LABELS = ['干爽', '略油', '适中', '偏油', '很油'];

/** 粒子密度选项 */
export const DENSITY_OPTIONS: { value: 'low' | 'med' | 'high'; label: string; count: number }[] = [
  { value: 'low', label: '稀疏', count: 12 },
  { value: 'med', label: '适中', count: 24 },
  { value: 'high', label: '繁花', count: 42 },
];

/** 页脚免责声明 */
export const DISCLAIMER =
  '本网页仅个人自我记录，不能替代临床医生诊断，医疗决策遵从线下医师。';

/** 备份提醒文案 */
export const BACKUP_TIP = '请定期备份，清除浏览器缓存会丢失数据。';
