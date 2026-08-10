import { useEffect, useLayoutEffect, useState, type ComponentType } from 'react';
import { Toaster, toast } from 'sonner';
import { useUIStore, useRemindersStore, useSettingsStore, syncBadges } from '@/store';
import { Layout, LoadingSplash } from '@/components/Layout';
import { ParticleLayer } from '@/components/ParticleLayer';
import { Modal, Button } from '@/components/ui';
import { Home } from '@/features/Home';
import { Medication } from '@/features/Medication';
import { Hormone } from '@/features/Hormone';
import { Savings } from '@/features/Savings';
import { Reminders } from '@/features/Reminders';
import { Diary } from '@/features/Diary';
import { Achievements } from '@/features/Achievements';
import { Settings } from '@/features/Settings';
import { todayStr, fmtDate, daysBetween } from '@/lib/utils';
import type { View } from '@/types';

const VIEW_MAP: Record<View, ComponentType> = {
  home: Home,
  medication: Medication,
  hormone: Hormone,
  savings: Savings,
  reminders: Reminders,
  diary: Diary,
  achievements: Achievements,
  settings: Settings,
};

const VALID_VIEWS: View[] = Object.keys(VIEW_MAP) as View[];

export default function App() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const [ready, setReady] = useState(false);

  // 反闪烁：root 立即标记 ready，触发 CSS 渐显，避免刷新时短暂空白
  useLayoutEffect(() => {
    document.getElementById('root')?.classList.add('ready');
  }, []);

  // 等待 localStorage（zustand persist 同步 hydrate）解析完成后再渲染主 UI
  useEffect(() => {
    setReady(true);
    const newly = syncBadges();
    if (newly.length) {
      toast.success(`🌸 解锁了 ${newly.length} 枚新徽章，去徽章墙看看吧～`);
    }
  }, []);

  // hash ↔ view 双向同步（带相等守卫，避免循环）
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace(/^#/, '');
      if (h && VALID_VIEWS.includes(h as View) && h !== useUIStore.getState().view) {
        setView(h as View);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [setView]);

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, '');
    if (h !== view) window.location.hash = view;
  }, [view]);

  // 暗色模式 class 同步（覆盖内联脚本之外的状态变更）
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (!ready) {
    return (
      <>
        <ParticleLayer />
        <LoadingSplash />
      </>
    );
  }

  const Current = VIEW_MAP[view] ?? Home;

  return (
    <>
      <ParticleLayer />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '1rem',
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)',
          },
        }}
      />
      <Layout>
        <Current />
      </Layout>
      <DueReminderDialog />
    </>
  );
}

/** 页面加载时比对当前日期，到期弹粉色圆角弹窗 */
function DueReminderDialog() {
  const items = useRemindersStore((s) => s.items);
  const complete = useRemindersStore((s) => s.complete);
  const [dismissed, setDismissed] = useState(false);

  const today = todayStr();
  const due = items
    .filter((r) => !r.done && r.nextDate <= today)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const current = due[0];

  if (dismissed || !current) return null;

  const overDays = daysBetween(current.nextDate, today);

  return (
    <Modal
      open
      onClose={() => setDismissed(true)}
      title="🌸 温柔提醒"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            稍后提醒
          </Button>
          <Button
            size="sm"
            onClick={() => {
              complete(current.id);
              toast.success('已标记完成，下次提醒已顺延 🌸');
            }}
          >
            ✓ 完成本次复查
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-foreground">亲爱的妙可儿，有一项复查到期啦：</p>
        <div className="rounded-xl bg-accent/60 p-3">
          <div className="font-bold text-foreground">{current.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            类型：{current.type} · 每 {current.intervalDays} 天
          </div>
          <div className="mt-1 text-sm">
            {overDays > 0 ? (
              <span className="text-primary">已过 {overDays} 天，记得去复查哦</span>
            ) : (
              <span className="text-muted-foreground">到期日：{fmtDate(current.nextDate)}</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
