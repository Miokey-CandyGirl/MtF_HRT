import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, ConfirmDialog } from '@/components/ui';
import { useDysphoriaStore, useSettingsStore } from '@/store';
import { uid, todayStr, fmtDate, nonEmpty } from '@/lib/utils';
import { DYSPHORIA_LABELS } from '@/constants';
import { toast } from 'sonner';
import type { DysphoriaRecord } from '@/types';

export function DysphoriaScale() {
  const items = useDysphoriaStore((s) => s.items);
  const add = useDysphoriaStore((s) => s.add);
  const update = useDysphoriaStore((s) => s.update);
  const remove = useDysphoriaStore((s) => s.remove);
  const dark = useSettingsStore((s) => s.darkMode);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DysphoriaRecord | null>(null);
  const [date, setDate] = useState(todayStr());
  const [score, setScore] = useState(2);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const descSorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const openNew = () => {
    setEditing(null);
    setDate(todayStr());
    setScore(2);
    setNote('');
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: DysphoriaRecord) => {
    setEditing(r);
    setDate(r.date);
    setScore(r.score);
    setNote(r.note ?? '');
    setErr('');
    setOpen(true);
  };
  const submit = () => {
    if (!nonEmpty(date)) {
      setErr('请选择日期');
      return;
    }
    if (editing) {
      update(editing.id, { date, score: score as DysphoriaRecord['score'], note: note.trim() || undefined });
      toast.success('已更新记录');
    } else {
      add({ id: uid(), date, score: score as DysphoriaRecord['score'], note: note.trim() || undefined });
      toast.success('已记录今日量表 🌸');
    }
    setOpen(false);
  };

  const labelColor = dark ? '#d4a8be' : '#8a6b7a';
  const splitColor = dark ? 'hsl(340 20% 25%)' : 'hsl(340 30% 90%)';
  const option: Record<string, unknown> = {
    color: ['hsl(340,75%,65%)'],
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: sorted.map((r) => r.date), axisLabel: { color: labelColor, fontSize: 10 } },
    yAxis: { type: 'value', min: 1, max: 5, nameTextStyle: { color: labelColor }, axisLabel: { color: labelColor }, splitLine: { lineStyle: { color: splitColor } } },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: sorted.map((r) => r.score),
        areaStyle: { color: 'hsl(340,75%,65%,0.15)' },
        lineStyle: { width: 2.5 },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <Card className="border-warning/40 bg-warning/5">
        <p className="text-sm font-semibold text-warning">⚠️ 本量表仅作个人自我观察，不作为医学诊断依据。</p>
        <p className="mt-1 text-xs text-muted-foreground">用于记录你对自己性别焦虑程度的主观感受变化。</p>
      </Card>

      <Card>
        <SectionTitle
          emoji="☁️"
          title="性别焦虑每日量表"
          desc="1-5 级主观评分 · 趋势图"
          right={<Button size="sm" onClick={openNew}>＋ 记录</Button>}
        />
        {sorted.length === 0 ? (
          <EmptyState emoji="☁️" title="暂无记录" desc="记录今天的焦虑程度，观察自己的变化" />
        ) : (
          <ReactECharts option={option} notMerge style={{ height: 240 }} />
        )}
      </Card>

      <Card>
        <SectionTitle emoji="📋" title="记录列表" desc={`共 ${items.length} 条`} />
        {descSorted.length === 0 ? (
          <EmptyState emoji="📋" title="暂无记录" />
        ) : (
          <ul className="space-y-2">
            {descSorted.map((r) => {
              const m = DYSPHORIA_LABELS.find((x) => x.value === r.score);
              return (
                <li key={r.id} className="rounded-2xl border border-border bg-background/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <span aria-hidden>{m?.emoji}</span>
                      {fmtDate(r.date)}
                      <span className="text-xs text-muted-foreground">{r.score}/5 · {m?.label}</span>
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>编辑</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDelId(r.id)}>删除</Button>
                    </div>
                  </div>
                  {r.note && <p className="mt-1 text-sm text-foreground">{r.note}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑记录' : '记录焦虑量表'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={submit}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>日期</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>今日焦虑程度</Label>
            <div className="flex justify-between gap-1">
              {DYSPHORIA_LABELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setScore(m.value)}
                  className={[
                    'flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2 transition-colors',
                    score === m.value ? 'border-primary bg-primary/10' : 'border-border',
                  ].join(' ')}
                >
                  <span className="text-xl" aria-hidden>{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.value}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>备注</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="触发情境、感受、应对方式……" />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => { if (delId) remove(delId); toast.success('已删除'); }}
        title="删除该记录？"
        message="该记录将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </div>
  );
}
