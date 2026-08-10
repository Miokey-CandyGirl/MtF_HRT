import { useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, isToday, startOfMonth, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, SectionTitle, Stat, Button } from '@/components/ui';
import { useMedicationStore } from '@/store';
import { dateKey, todayStr, fmtDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { triggerPetalBurst } from '@/components/PetalBurst';
import { toast } from 'sonner';

const MEDS = [
  { key: 'spironolactone' as const, name: '螺内酯', emoji: '💊', desc: '抗雄激素' },
  { key: 'estradiol' as const, name: '雌二醇凝胶', emoji: '✨', desc: '外用雌激素' },
];

export function Medication() {
  const logs = useMedicationStore((s) => s.logs);
  const toggle = useMedicationStore((s) => s.toggle);
  const streak = useMedicationStore((s) => s.streak);
  const todayK = dateKey(new Date());
  const todayLog = logs[todayK] ?? { spironolactone: false, estradiol: false };

  const [cursor, setCursor] = useState(new Date());
  const monthDays = eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) });
  const doneThisMonth = monthDays.filter(
    (d) => logs[dateKey(d)]?.spironolactone && logs[dateKey(d)]?.estradiol,
  ).length;

  const onToggle = (med: 'spironolactone' | 'estradiol', e: React.MouseEvent) => {
    const wasOn = todayLog[med];
    toggle(todayStr(), med);
    if (!wasOn) {
      triggerPetalBurst(e.clientX, e.clientY);
      toast.success(`已打卡 ${MEDS.find((m) => m.key === med)?.name} 🌸`);
    }
  };

  const toggleDay = (d: Date) => {
    const k = dateKey(d);
    const log = logs[k];
    const bothOn = log?.spironolactone && log?.estradiol;
    if (bothOn) {
      // 取消当日
      toggle(format(d, 'yyyy-MM-dd'), 'spironolactone');
      toggle(format(d, 'yyyy-MM-dd'), 'estradiol');
    } else {
      if (!log?.spironolactone) toggle(format(d, 'yyyy-MM-dd'), 'spironolactone');
      if (!log?.estradiol) toggle(format(d, 'yyyy-MM-dd'), 'estradiol');
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle emoji="💊" title="今日用药打卡" desc={fmtDate(new Date(), 'yyyy 年 M 月 d 日 EEEE')} />
        <div className="grid grid-cols-2 gap-3">
          {MEDS.map((m) => {
            const on = todayLog[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={(e) => onToggle(m.key, e)}
                className={cn(
                  'hover-lift flex flex-col items-center gap-1 rounded-2xl border-2 p-5 transition-colors',
                  on ? 'border-primary bg-primary/10' : 'border-border bg-card',
                )}
              >
                <span className="text-3xl" aria-hidden>{m.emoji}</span>
                <span className="font-bold text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.desc}</span>
                <span className={cn('mt-1 rounded-full px-3 py-0.5 text-xs font-semibold', on ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground')}>
                  {on ? '✓ 已打卡' : '点击打卡'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-2 gap-3">
          <Stat emoji="🔥" label="连续服药天数" value={`${streak} 天`} />
          <Stat emoji="📅" label="本月全勤" value={`${doneThisMonth} 天`} />
        </div>
      </section>

      <section>
        <SectionTitle emoji="🗓️" title="月历视图" desc="点击日期可补打卡 / 取消（同时切换两项）" />
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))} aria-label="上一月">←</Button>
            <span className="font-bold text-foreground">{format(cursor, 'yyyy 年 M 月', { locale: zhCN })}</span>
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="下一月">→</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((d) => {
              const log = logs[dateKey(d)];
              const spiro = !!log?.spironolactone;
              const estr = !!log?.estradiol;
              const both = spiro && estr;
              const partial = spiro !== estr;
              const today = isToday(d);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors',
                    both ? 'bg-primary text-primary-foreground' : 'bg-accent/50 text-foreground hover:bg-primary/20',
                    today && 'ring-2 ring-primary/50',
                  )}
                  aria-label={`${format(d, 'M月d日')}`}
                >
                  <span className="font-semibold">{d.getDate()}</span>
                  <span className="mt-0.5 flex gap-0.5">
                    <span className={cn('h-1 w-1 rounded-full', spiro ? 'bg-primary' : 'bg-border', both && 'bg-primary-foreground/70')} />
                    <span className={cn('h-1 w-1 rounded-full', estr ? 'bg-primary' : 'bg-border', both && 'bg-primary-foreground/70')} />
                  </span>
                  {partial && <span className="text-[8px] text-warning">半</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />两项全打卡</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-border" />未打卡</span>
            <span className="text-warning">半 = 仅一项</span>
          </div>
        </Card>
      </section>
    </div>
  );
}

void isSameMonth;
