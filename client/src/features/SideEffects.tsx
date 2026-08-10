import { useState } from 'react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, Chip, ConfirmDialog } from '@/components/ui';
import { useSideEffectsStore } from '@/store';
import { uid, todayStr, fmtDate, copyText, nonEmpty } from '@/lib/utils';
import { SIDE_EFFECT_OPTIONS } from '@/types';
import { toast } from 'sonner';
import type { SideEffectRecord } from '@/types';

export function SideEffects() {
  const items = useSideEffectsStore((s) => s.items);
  const add = useSideEffectsStore((s) => s.add);
  const update = useSideEffectsStore((s) => s.update);
  const remove = useSideEffectsStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SideEffectRecord | null>(null);
  const [date, setDate] = useState(todayStr());
  const [effects, setEffects] = useState<string[]>([]);
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const openNew = () => {
    setEditing(null);
    setDate(todayStr());
    setEffects([]);
    setDesc('');
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: SideEffectRecord) => {
    setEditing(r);
    setDate(r.date);
    setEffects(r.effects);
    setDesc(r.description ?? '');
    setErr('');
    setOpen(true);
  };
  const toggleEffect = (e: string) =>
    setEffects((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]));

  const submit = () => {
    if (!nonEmpty(date)) {
      setErr('请选择日期');
      return;
    }
    if (effects.length === 0 && !nonEmpty(desc)) {
      setErr('请至少选择一项副作用或填写描述');
      return;
    }
    if (editing) {
      update(editing.id, { date, effects, description: desc.trim() });
      toast.success('已更新副作用记录');
    } else {
      add({ id: uid(), date, effects, description: desc.trim() } as SideEffectRecord);
      toast.success('已新增副作用记录 🌸');
    }
    setOpen(false);
  };

  const copyAll = async () => {
    if (sorted.length === 0) {
      toast.message('暂无记录可复制');
      return;
    }
    const text =
      '【药物副作用日志】\n' +
      sorted
        .map(
          (r) =>
            `${r.date} ${r.effects.join('、')}${r.description ? `\n  描述：${r.description}` : ''}`,
        )
        .join('\n');
    const ok = await copyText(text);
    ok ? toast.success('已复制，可粘贴给医生面诊参考 📋') : toast.error('复制失败');
  };

  return (
    <Card>
      <SectionTitle
        emoji="💊"
        title="药物副作用日志"
        desc="记录身体反应 · 按时间倒序 · 可复制给医生参考"
        right={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={copyAll}>📋 复制全部</Button>
            <Button size="sm" onClick={openNew}>＋ 新增</Button>
          </div>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState emoji="💊" title="还没有副作用记录" desc="身体有任何不适都可以记下来，面诊时给医生看" />
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
              {r.effects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.effects.map((e) => (
                    <span key={e} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{e}</span>
                  ))}
                </div>
              )}
              {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑副作用记录' : '新增副作用记录'}
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
            <Label>副作用（可多选）</Label>
            <div className="flex flex-wrap gap-1.5">
              {SIDE_EFFECT_OPTIONS.map((e) => (
                <Chip key={e} active={effects.includes(e)} onClick={() => toggleEffect(e)}>{e}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>自定义描述</Label>
            <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="补充描述，例如出现时间、严重程度、缓解方式……" />
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
        title="删除该记录？"
        message="该副作用记录将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </Card>
  );
}
