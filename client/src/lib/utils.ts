import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  parseISO,
  addDays,
  differenceInCalendarDays,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/** 合并 tailwind 类名 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 生成唯一 id */
export function uid(): string {
  // 简单非依赖实现，避免 nanoid 异步导入
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/** 今日 YYYY-MM-DD */
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** YYYYMMDD 键（用于每日打卡） */
export function dateKey(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'yyyyMMdd');
}

/** MMDD 键（年度打卡墙） */
export function mmddKey(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'MMdd');
}

/** 格式化展示日期 */
export function fmtDate(d: string | Date, pattern = 'yyyy-MM-dd'): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  return format(date, pattern, { locale: zhCN });
}

/** 加 N 天，返回 YYYY-MM-DD */
export function addDaysStr(d: string, n: number): string {
  return format(addDays(parseISO(d), n), 'yyyy-MM-dd');
}

/** 两个日期相差天数（b - a） */
export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

/** 是否本月 */
export function isThisMonth(d: string): boolean {
  return isSameMonth(parseISO(d), new Date());
}

/** 当月起止 */
export function monthRange(date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

/** 上月 */
export function prevMonth(date = new Date()) {
  return subMonths(date, 1);
}

/** 数值合法性：非空、数字、非 NaN */
export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

/** 非负有限数字 */
export function isNonNeg(v: unknown): v is number {
  return isNumber(v) && Number.isFinite(v) && v >= 0;
}

/** 字符串非空（trim 后） */
export function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** 限制范围 */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** 复制文本到剪贴板（带降级） */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 回退 */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** 下载文本文件 */
export function downloadFile(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 防抖 */
export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 400) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** 货币格式（人民币） */
export function yuan(v: number): string {
  return `¥${v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

/** 百分比 */
export function percent(v: number): string {
  return `${Math.round(v * 100)}%`;
}
