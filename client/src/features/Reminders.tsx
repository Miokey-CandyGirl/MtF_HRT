import { useState } from 'react';
import { Card, SectionTitle, Button, Input, Label, Modal, EmptyState, Select, ConfirmDialog, Chip } from '@/components/ui';
import { useRemindersStore } from '@/store';
import { uid, todayStr, fmtDate, addDaysStr, isNonNeg, nonEmpty, daysBetween } from '@/lib/utils';
import { REMINDER_PRESETS } from '@/constants';
import { toast } from 'sonner';
import type { Reminder } from '@/types';

export function Reminders() {
  const items = useRemindersStore((s) => s.items);
  const add = useRemindersStore((s) => s.add);
  const update = useRemindersStore((s) => s.update);
  const remove = useRemindersStore((s) => s.remove);
  const complete = useRemindersStore((s) => s.complete);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState(REMINDER_PRESETS[0].type);
  const [firstDate, setFirstDate] = useState(todayStr());
  const [interval, setIntervalDays] = useState(String(REMINDER_PRESETS[0].intervalDays));
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const today = todayStr();
  const sorted = [...items].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const openNew = () => {
    setEditing(null);
    setName('');
    setType(REMINDER_PRESETS[0].type);
    setFirstDate(todayStr());
    setIntervalDays(String(REMINDER_PRESETS[0].intervalDays));
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: Reminder) => {
    setEditing(r);
    setName(r.name);
    setType(r.type);
    setFirstDate(r.firstDate);
    setIntervalDays(String(r.intervalDays));
    setErr('');
    setOpen(true);
  };

  const onTypeChange = (t: string) => {
    setType(t);
    const preset = REMINDER_PRESETS.find((p) => p.type === t);
    if (preset) setIntervalDays(String(preset.intervalDays));
  };

  const submit = () => {
    if (!nonEmpty(name)) {
      setErr('请填写提醒名称');
      return;
    }
    if (!nonEmpty(firstDate)) {
      setErr('请选择首次提醒日期');
      return;
    }
    const n = Number(interval);
    if (!isNonNeg(n) || n === 0) {
      setErr('重复周期必须为正整数天');
      return;
    }
    if (editing) {
      update(editing.id, { name: name.trim(), type, firstDate, intervalDays: n });
      toast.success('已更新提醒');
    } else {
      add({
        id: uid(),
        name: name.trim(),
        type,
        firstDate,
        intervalDays: n,
        nextDate: firstDate,
        done: false,
        completionCount: 0,
      });
      toast.success('已新建提醒 🔔');
    }
    setOpen(false);
  };

  const onComplete = (id: string) => {
    complete(id);
    toast.success('已标记完成，下次提醒已顺延 🌸');
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="🔔"
        title="体检提醒日历"
        desc="激素抽血每 90 天 · 脱毛复诊每 42 天 · 精神随访自定义"
        right={<Button size="sm" onClick={openNew}>＋ 新建</Button>}
      />

      {sorted.length === 0 ? (
        <EmptyState emoji="🔔" title="还没有提醒事项" desc="新建第一条复查提醒，到期会温柔地提醒你" />
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => {
            const due = !r.done && today >= r.nextDate;
            const overDays = due ? daysBetween(r.nextDate, today) : 0;
            const upcoming = !due && daysBetween(today, r.nextDate) <= 7;
            return (
              <li
                key={r.id}
                className={[
                  'rounded-2xl border bg-card p-4 card-shadow',
                  due ? 'border-primary' : 'border-border',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{r.name}</span>
                      {due ? (
                        <span className="heartbeat rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">已到期</span>
                      ) : r.done ? (
                        <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">本周期已完成</span>
                      ) : upcoming ? (
                        <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">即将到期</span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      类型：{r.type} · 每 {r.intervalDays} 天
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDelId(r.id)}>删除</Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    {due ? (
                      <span className="text-primary">已过 {overDays} 天，记得去复查哦</span>
                    ) : (
                      <span className="text-muted-foreground">
                        下次提醒：<b className="text-foreground">{fmtDate(r.nextDate)}</b>
                        {r.lastCompleted && <span className="ml-2 text-xs">上次完成 {fmtDate(r.lastCompleted)}</span>}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant={due ? 'primary' : 'secondary'} onClick={() => onComplete(r.id)}>
                    ✓ 完成本次复查
                  </Button>
                </div>
                {r.completionCount > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">累计完成 {r.completionCount} 次</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Card>
        <SectionTitle emoji="💡" title="复查周期预设" desc="点击可快速新建" />
        <div className="flex flex-wrap gap-2">
          {REMINDER_PRESETS.map((p) => (
            <Chip key={p.type} onClick={() => { onTypeChange(p.type); openNew(); }}>{p.type} · {p.intervalDays}天</Chip>
          ))}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑提醒' : '新建提醒'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={submit}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>提醒名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：第三次激素抽血" />
          </div>
          <div>
            <Label>复查类型</Label>
            <Select value={type} onChange={(e) => onTypeChange(e.target.value)}>
              {REMINDER_PRESETS.map((p) => (
                <option key={p.type} value={p.type}>{p.type}</option>
              ))}
              <option value="自定义">自定义</option>
            </Select>
          </div>
          <div>
            <Label>首次提醒日期</Label>
            <Input type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
          </div>
          <div>
            <Label>重复周期（天）</Label>
            <Input type="number" value={interval} onChange={(e) => setIntervalDays(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">下次提醒将自动顺延此天数</p>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          {nonEmpty(firstDate) && isNonNeg(Number(interval)) && Number(interval) > 0 && (
            <p className="text-xs text-muted-foreground">首次提醒：{fmtDate(firstDate)}，之后每 {interval} 天（约 {fmtDate(addDaysStr(firstDate, Number(interval)))}）</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          if (delId) remove(delId);
          toast.success('已删除');
        }}
        title="删除该提醒？"
        message="该提醒事项将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </div>
  );
}
