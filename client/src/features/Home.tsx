import { useState } from 'react';
import { eachDayOfInterval, endOfMonth, endOfYear, format, isToday, isFuture, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, SectionTitle, Stat, EmptyState } from '@/components/ui';
import { HomeNavCards } from '@/components/HomeNavCards';
import { useAnnualStore, useHormoneStore, useBodySignsStore, useMoodStore, useBadgesStore, useRemindersStore, useMedicationStore, type AnnualStore } from '@/store';
import { todayStr, fmtDate } from '@/lib/utils';

export function Home() {
  const annual = useAnnualStore();
  const hormones = useHormoneStore((s) => s.items);
  const bodySigns = useBodySignsStore((s) => s.items);
  const mood = useMoodStore((s) => s.items);
  const badges = useBadgesStore((s) => s.badges);
  const reminders = useRemindersStore((s) => s.items);
  const streak = useMedicationStore((s) => s.streak);

  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  const checkedCount = yearDays.filter((d) => annual[format(d, 'MMdd')]).length;
  const dueCount = reminders.filter((r) => !r.done && todayStr() >= r.nextDate).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/15 to-accent">
        <p className="text-sm text-muted-foreground">{fmtDate(today, 'yyyy 年 M 月 d 日 EEEE')}</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          亲爱的妙可儿，今天也要温柔地长大呀 🌸
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          这里是只属于你的成长小天地，所有记录都安安静静地留在本机里。
        </p>
      </Card>

      <section>
        <SectionTitle emoji="📊" title="成长总览" desc="一点一滴，都是你认真生活的证明" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat emoji="💊" label="连续服药" value={`${streak} 天`} />
          <Stat emoji="🩸" label="化验记录" value={`${hormones.length} 条`} />
          <Stat emoji="📏" label="体征记录" value={`${bodySigns.length} 条`} />
          <Stat emoji="📖" label="心情日记" value={`${mood.length} 条`} />
          <Stat emoji="🏆" label="已解锁徽章" value={`${Object.keys(badges).length} 枚`} />
          <Stat emoji="🔔" label="待办复查" value={`${dueCount} 项`} />
        </div>
      </section>

      <section>
        <SectionTitle emoji="🗝️" title="快捷入口" desc="想去哪里，就点哪里" />
        <HomeNavCards />
      </section>

      <section>
        <SectionTitle
          emoji="📆"
          title={`${today.getFullYear()} 年打卡墙`}
          desc={`今年已打卡 ${checkedCount} 天 · 点击任意日期可补打卡`}
        />
        <YearWall />
      </section>
    </div>
  );
}

function YearWall() {
  const annual = useAnnualStore();
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, i) => startOfMonth(new Date(today.getFullYear(), i, 1)));

  return (
    <div className="space-y-3">
      {months.map((m) => (
        <MonthBlock key={m.toISOString()} month={m} annual={annual} today={today} />
      ))}
    </div>
  );
}

function MonthBlock({ month, annual, today }: { month: Date; annual: AnnualStore; today: Date }) {
  const [open, setOpen] = useState(month.getMonth() === today.getMonth());
  const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
  const checked = days.filter((d) => annual[format(d, 'MMdd')]).length;

  return (
    <Card className="p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-bold text-foreground">{format(month, 'M 月', { locale: zhCN })}</span>
        <span className="text-xs text-muted-foreground">
          {checked}/{days.length} 天 {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = format(d, 'MMdd');
            const on = !!annual[key];
            const future = isFuture(d) && !isToday(d);
            return (
              <button
                key={key}
                type="button"
                onClick={() => annual.toggle(key)}
                aria-label={`${format(d, 'M月d日')} ${on ? '已打卡' : '未打卡'}`}
                className={[
                  'aspect-square rounded-lg text-[10px] font-semibold transition-colors',
                  on
                    ? 'bg-primary text-primary-foreground'
                    : future
                      ? 'bg-accent/40 text-muted-foreground/40'
                      : 'bg-accent/60 text-muted-foreground hover:bg-primary/20',
                ].join(' ')}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// 防止 parseISO 未使用告警（保留以便未来扩展）
void parseISO;
