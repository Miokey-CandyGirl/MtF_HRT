import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, ConfirmDialog, Chip } from '@/components/ui';
import { useHormoneStore, useBodySignsStore, useSideEffectsStore, useSettingsStore } from '@/store';
import { uid, todayStr, fmtDate, isNonNeg } from '@/lib/utils';
import {
  HORMONES,
  normalizeClamped,
  maleReferenceLine,
  NORM_Y_MAX,
  FEMALE_REFERENCE_LINE,
} from '@/lib/hormoneRanges';
import { BodySignsChart } from './BodySigns';
import { OIL_LABELS } from '@/constants';
import { toast } from 'sonner';
import type { HormoneKey, HormoneRecord } from '@/types';

type FormState = { date: string; values: Record<HormoneKey, string>; note: string };
const blankForm = (): FormState => ({
  date: todayStr(),
  values: { e2: '', t: '', prl: '', lh: '', fsh: '', p: '', shbg: '' },
  note: '',
});

export function HormoneChart() {
  const items = useHormoneStore((s) => s.items);
  const add = useHormoneStore((s) => s.add);
  const update = useHormoneStore((s) => s.update);
  const remove = useHormoneStore((s) => s.remove);
  const bodySigns = useBodySignsStore((s) => s.items);
  const sideEffects = useSideEffectsStore((s) => s.items);
  const dark = useSettingsStore((s) => s.darkMode);

  const [view, setView] = useState<'hormone' | 'body'>('hormone');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HormoneRecord | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  // 日期联动面板
  const allDates = Array.from(
    new Set([
      ...items.map((r) => r.date),
      ...bodySigns.map((r) => r.date),
      ...sideEffects.map((r) => r.date),
    ]),
  ).sort((a, b) => b.localeCompare(a));
  const [selDate, setSelDate] = useState('');
  const hRec = items.find((r) => r.date === selDate);
  const bRec = bodySigns.find((r) => r.date === selDate);
  const sRecs = sideEffects.filter((r) => r.date === selDate);

  const openNew = () => {
    setEditing(null);
    setForm(blankForm());
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: HormoneRecord) => {
    setEditing(r);
    setForm({
      date: r.date,
      values: {
        e2: String(r.e2), t: String(r.t), prl: String(r.prl), lh: String(r.lh),
        fsh: String(r.fsh), p: String(r.p), shbg: String(r.shbg),
      },
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
    const parsed = {} as Record<HormoneKey, number>;
    for (const h of HORMONES) {
      const v = form.values[h.key];
      if (v.trim() === '') {
        setErr(`请填写 ${h.label}`);
        return;
      }
      const n = Number(v);
      if (!isNonNeg(n)) {
        setErr(`${h.label} 必须是非负数字`);
        return;
      }
      parsed[h.key] = n;
    }
    const record: HormoneRecord = {
      id: editing?.id ?? uid(),
      date: form.date,
      ...parsed,
      note: form.note.trim() || undefined,
    };
    if (editing) {
      update(editing.id, record);
      toast.success('已更新化验记录');
    } else {
      add(record);
      toast.success('已新增化验记录 🌸');
    }
    setOpen(false);
  };

  // ===== echarts 选项 =====
  const labelColor = dark ? '#d4a8be' : '#8a6b7a';
  const splitColor = dark ? 'hsl(340 20% 25%)' : 'hsl(340 30% 90%)';
  const maleLine = maleReferenceLine();

  const recordByDate = new Map(sorted.map((r) => [r.date, r]));
  const dates = sorted.map((r) => r.date);

  const hormoneOption: Record<string, unknown> = {
    color: HORMONES.map((h) => h.color),
    tooltip: {
      trigger: 'axis',
      formatter: (params: { axisValue: string }[]) => {
        const date = params[0]?.axisValue;
        const r = recordByDate.get(date);
        if (!r) return date;
        return `<b>${date}</b>` + HORMONES.map((h) => `<br/>${h.label}: <b>${r[h.key]}</b> ${h.unit}`).join('');
      },
    },
    legend: { top: 0, type: 'scroll', textStyle: { fontSize: 11, color: labelColor } },
    grid: { left: 44, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: dates, axisLabel: { color: labelColor, fontSize: 10 } },
    yAxis: {
      type: 'value',
      min: 0,
      max: NORM_Y_MAX,
      name: '归一化(女=1)',
      nameTextStyle: { color: labelColor, fontSize: 10 },
      axisLabel: { color: labelColor, fontSize: 10 },
      splitLine: { lineStyle: { color: splitColor } },
    },
    series: HORMONES.map((h, i) => ({
      name: h.label,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: sorted.map((r) => normalizeClamped(r[h.key], h.key)),
      ...(i === 0
        ? {
            markLine: {
              silent: true,
              symbol: ['none', 'none'],
              lineStyle: { color: 'rgba(120,120,120,0.45)', type: 'dashed', width: 1.5 },
              data: [
                {
                  yAxis: FEMALE_REFERENCE_LINE,
                  label: { formatter: '女性参考中值', color: 'rgba(120,120,120,0.8)', position: 'insideStartTop', fontSize: 10 },
                },
                {
                  yAxis: maleLine,
                  label: { formatter: '原生男性参考(均值)', color: 'rgba(120,120,120,0.8)', position: 'insideEndBottom', fontSize: 10 },
                },
              ],
            },
          }
        : {}),
    })),
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          emoji="📈"
          title="性激素趋势图"
          desc="7 项激素归一化到女性参考中值 · 两条灰色线为女性/男性参考"
          right={<Button size="sm" onClick={openNew}>＋ 新增化验</Button>}
        />

        <div className="mb-3 flex items-center gap-2">
          <Chip active={view === 'hormone'} onClick={() => setView('hormone')}>激素视图</Chip>
          <Chip active={view === 'body'} onClick={() => setView('body')}>体征视图</Chip>
        </div>

        {view === 'hormone' ? (
          items.length === 0 ? (
            <EmptyState emoji="🩸" title="暂无化验记录" desc="请添加你的第一次检查" />
          ) : (
            <ReactECharts option={hormoneOption} notMerge style={{ height: 340 }} />
          )
        ) : (
          <BodySignsChart height={340} />
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          ⚠️ 本图表归一化仅作个人可视化参考，精确区间见下表；不作为医学诊断依据。
        </p>
      </Card>

      {/* 参考区间表 */}
      <Card>
        <SectionTitle emoji="📖" title="参考区间表" desc="成人近似值 · 仅供个人参考" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2">激素</th>
                <th className="px-2">女性参考</th>
                <th className="px-2">男性参考</th>
                <th className="px-2">单位</th>
              </tr>
            </thead>
            <tbody>
              {HORMONES.map((h) => (
                <tr key={h.key} className="border-t border-border">
                  <td className="py-2 pr-2 font-medium text-foreground">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: h.color }} />
                    {h.label}
                  </td>
                  <td className="px-2 tnum text-foreground">{h.female[0]}–{h.female[1]}</td>
                  <td className="px-2 tnum text-muted-foreground">{h.male[0]}–{h.male[1]}</td>
                  <td className="px-2 text-muted-foreground">{h.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 日期联动面板 */}
      <Card>
        <SectionTitle emoji="🔍" title="日期联动查看" desc="选择同一日期，同时查看化验结果与当日身体主观感受" />
        {allDates.length === 0 ? (
          <EmptyState emoji="🔍" title="暂无任何记录" desc="添加化验、体征或副作用记录后，可在此按日期联动查看" />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {allDates.slice(0, 30).map((d) => (
                <Chip key={d} active={selDate === d} onClick={() => setSelDate(d)}>{fmtDate(d, 'MM-dd')}</Chip>
              ))}
            </div>
            {selDate && (
              <div className="space-y-2">
                <div className="text-sm font-bold text-foreground">{fmtDate(selDate, 'yyyy 年 M 月 d 日')}</div>
                <div className="rounded-xl bg-accent/40 p-3">
                  <div className="mb-1 text-xs font-semibold text-muted-foreground">🩸 化验结果</div>
                  {hRec ? (
                    <div className="grid grid-cols-2 gap-1 text-xs text-foreground sm:grid-cols-3">
                      {HORMONES.map((h) => (
                        <span key={h.key}>{h.label.split(' ')[0]}: <b>{hRec[h.key]}</b> {h.unit}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">当日无化验记录</span>
                  )}
                </div>
                <div className="rounded-xl bg-accent/40 p-3">
                  <div className="mb-1 text-xs font-semibold text-muted-foreground">📏 身体主观感受</div>
                  {bRec ? (
                    <div className="flex flex-wrap gap-2 text-xs text-foreground">
                      {bRec.weight != null && <span>体重 {bRec.weight}kg</span>}
                      {bRec.bodyFat != null && <span>体脂 {bRec.bodyFat}%</span>}
                      {bRec.chest != null && <span>胸围 {bRec.chest}cm</span>}
                      <span>出油 {OIL_LABELS[bRec.oilLevel - 1]}</span>
                      {bRec.hotFlash && <span>潮热：{bRec.hotFlash}</span>}
                      {bRec.note && <span>备注：{bRec.note}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">当日无体征记录</span>
                  )}
                </div>
                {sRecs.length > 0 && (
                  <div className="rounded-xl bg-accent/40 p-3">
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">💊 副作用</div>
                    {sRecs.map((r) => (
                      <div key={r.id} className="text-xs text-foreground">
                        {r.effects.join('、')}{r.description ? ` · ${r.description}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {/* 记录列表 */}
      <Card>
        <SectionTitle emoji="📋" title="化验记录列表" desc={`共 ${items.length} 条`} />
        {items.length === 0 ? (
          <EmptyState emoji="🩸" title="暂无化验记录" desc="点击右上角新增第一次检查" />
        ) : (
          <ul className="space-y-2">
            {[...items].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{fmtDate(r.date)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDelId(r.id)}>删除</Button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {HORMONES.map((h) => (
                    <span key={h.key}>{h.label.split(' ')[0]} {r[h.key]}</span>
                  ))}
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
        title={editing ? '编辑化验记录' : '新增化验记录'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={submit}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>检查日期</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {HORMONES.map((h) => (
              <div key={h.key}>
                <Label>{h.label} ({h.unit})</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.values[h.key]}
                  onChange={(e) => setForm({ ...form, values: { ...form.values, [h.key]: e.target.value } })}
                />
              </div>
            ))}
          </div>
          <div>
            <Label>备注</Label>
            <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          if (delId) remove(delId);
          toast.success('已删除');
        }}
        title="删除该化验记录？"
        message="该化验记录将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </div>
  );
}
