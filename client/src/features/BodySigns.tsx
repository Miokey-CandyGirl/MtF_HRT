import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, Select, ConfirmDialog } from '@/components/ui';
import { useBodySignsStore, useSettingsStore } from '@/store';
import { uid, todayStr, fmtDate, isNonNeg } from '@/lib/utils';
import { OIL_LABELS } from '@/constants';
import { toast } from 'sonner';
import type { BodySignRecord } from '@/types';

/** 体征图表（与激素图共用时间 x 轴概念） */
export function BodySignsChart({ height = 300 }: { height?: number }) {
  const items = useBodySignsStore((s) => s.items);
  const dark = useSettingsStore((s) => s.darkMode);
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return (
      <EmptyState emoji="📏" title="暂无体征记录" desc="添加第一条身体体征，开始追踪体重、胸围等变化" />
    );
  }

  const dates = sorted.map((r) => r.date);
  const labelColor = dark ? '#d4a8be' : '#8a6b7a';
  const splitColor = dark ? 'hsl(340 20% 25%)' : 'hsl(340 30% 90%)';

  const option: Record<string, unknown> = {
    color: ['hsl(340,75%,60%)', 'hsl(10,75%,62%)', 'hsl(310,65%,65%)', 'hsl(45,65%,58%)'],
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { fontSize: 11, color: labelColor } },
    grid: { left: 46, right: 46, top: 36, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: labelColor, fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: '数值',
        nameTextStyle: { color: labelColor, fontSize: 10 },
        axisLabel: { color: labelColor, fontSize: 10 },
        splitLine: { lineStyle: { color: splitColor } },
      },
      {
        type: 'value',
        name: '出油1-5',
        min: 0,
        max: 5,
        nameTextStyle: { color: labelColor, fontSize: 10 },
        axisLabel: { color: labelColor, fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      { name: '体重(kg)', type: 'line', smooth: true, data: sorted.map((r) => r.weight ?? null) },
      { name: '体脂(%)', type: 'line', smooth: true, data: sorted.map((r) => r.bodyFat ?? null) },
      { name: '胸围(cm)', type: 'line', smooth: true, data: sorted.map((r) => r.chest ?? null) },
      { name: '出油', type: 'line', smooth: true, yAxisIndex: 1, data: sorted.map((r) => r.oilLevel ?? null) },
    ],
  };

  return <ReactECharts option={option} notMerge style={{ height }} />;
}

const blank = () => ({
  date: todayStr(),
  weight: '',
  bodyFat: '',
  chest: '',
  oilLevel: 3 as 1 | 2 | 3 | 4 | 5,
  hotFlash: '',
  note: '',
});

export function BodySigns() {
  const items = useBodySignsStore((s) => s.items);
  const add = useBodySignsStore((s) => s.add);
  const update = useBodySignsStore((s) => s.update);
  const remove = useBodySignsStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BodySignRecord | null>(null);
  const [form, setForm] = useState(blank());
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const parseNum = (s: string): number | undefined => {
    if (s.trim() === '') return undefined;
    const n = Number(s);
    return isNonNeg(n) ? n : NaN;
  };

  const openNew = () => {
    setEditing(null);
    setForm(blank());
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: BodySignRecord) => {
    setEditing(r);
    setForm({
      date: r.date,
      weight: r.weight != null ? String(r.weight) : '',
      bodyFat: r.bodyFat != null ? String(r.bodyFat) : '',
      chest: r.chest != null ? String(r.chest) : '',
      oilLevel: r.oilLevel,
      hotFlash: r.hotFlash ?? '',
      note: r.note ?? '',
    });
    setErr('');
    setOpen(true);
  };

  const submit = () => {
    if (!form.date) {
      setErr('请选择日期');
      return;
    }
    const weight = parseNum(form.weight);
    const bodyFat = parseNum(form.bodyFat);
    const chest = parseNum(form.chest);
    if ([weight, bodyFat, chest].some((v) => Number.isNaN(v))) {
      setErr('数值字段不能为负数或非数字');
      return;
    }
    const record: BodySignRecord = {
      id: editing?.id ?? uid(),
      date: form.date,
      weight,
      bodyFat,
      chest,
      oilLevel: form.oilLevel,
      hotFlash: form.hotFlash.trim() || undefined,
      note: form.note.trim() || undefined,
    };
    if (editing) {
      update(editing.id, record);
      toast.success('已更新体征记录');
    } else {
      add(record);
      toast.success('已新增体征记录 🌸');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          emoji="📏"
          title="身体体征记录"
          desc="体重 · 体脂率 · 胸围 · 出油 · 潮热 · 备注"
          right={<Button size="sm" onClick={openNew}>＋ 新增</Button>}
        />
        <BodySignsChart height={280} />
      </Card>

      <Card>
        <SectionTitle emoji="📋" title="记录列表" desc={`共 ${sorted.length} 条`} />
        {sorted.length === 0 ? (
          <EmptyState emoji="📏" title="暂无体征记录" desc="点击右上角新增第一条记录" />
        ) : (
          <ul className="space-y-2">
            {sorted.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{fmtDate(r.date)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDelId(r.id)}>删除</Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {r.weight != null && <span>体重 {r.weight}kg</span>}
                  {r.bodyFat != null && <span>体脂 {r.bodyFat}%</span>}
                  {r.chest != null && <span>胸围 {r.chest}cm</span>}
                  <span>出油 {OIL_LABELS[r.oilLevel - 1]}</span>
                  {r.hotFlash && <span>潮热：{r.hotFlash}</span>}
                </div>
                {r.note && <p className="mt-1 text-sm text-foreground">{r.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑体征记录' : '新增体征记录'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={submit}>保存</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>日期</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <Label>皮肤出油程度</Label>
            <Select value={form.oilLevel} onChange={(e) => setForm({ ...form, oilLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
              {OIL_LABELS.map((l, i) => (
                <option key={l} value={i + 1}>{i + 1} - {l}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>体重 (kg)</Label>
            <Input type="number" inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="可选" />
          </div>
          <div>
            <Label>体脂率 (%)</Label>
            <Input type="number" inputMode="decimal" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} placeholder="可选" />
          </div>
          <div>
            <Label>胸围 (cm)</Label>
            <Input type="number" inputMode="decimal" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} placeholder="可选" />
          </div>
          <div>
            <Label>潮热主观感受</Label>
            <Input value={form.hotFlash} onChange={(e) => setForm({ ...form, hotFlash: e.target.value })} placeholder="如：夜间轻微" />
          </div>
          <div className="col-span-2">
            <Label>备注</Label>
            <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          {err && <p className="col-span-2 text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          if (delId) remove(delId);
          toast.success('已删除');
        }}
        title="删除该记录？"
        message="该体征记录将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </div>
  );
}
