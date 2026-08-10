import { useState } from 'react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, ConfirmDialog } from '@/components/ui';
import { useMoodStore } from '@/store';
import { uid, todayStr, fmtDate, nonEmpty } from '@/lib/utils';
import { MOOD_LABELS } from '@/constants';
import { toast } from 'sonner';
import type { MoodRecord } from '@/types';

export function MoodDiary() {
  const items = useMoodStore((s) => s.items);
  const add = useMoodStore((s) => s.add);
  const update = useMoodStore((s) => s.update);
  const remove = useMoodStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MoodRecord | null>(null);
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const openNew = () => {
    setEditing(null);
    setDate(todayStr());
    setMood(3);
    setNote('');
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: MoodRecord) => {
    setEditing(r);
    setDate(r.date);
    setMood(r.mood);
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
      update(editing.id, { date, mood: mood as MoodRecord['mood'], note: note.trim() || undefined });
      toast.success('已更新日记');
    } else {
      add({ id: uid(), date, mood: mood as MoodRecord['mood'], note: note.trim() || undefined });
      toast.success('已记录今天的心情 🌸');
    }
    setOpen(false);
  };

  return (
    <Card>
      <SectionTitle
        emoji="📖"
        title="心情日记"
        desc="写下今天的小心情，温柔地陪伴自己"
        right={<Button size="sm" onClick={openNew}>＋ 写日记</Button>}
      />
      {sorted.length === 0 ? (
        <EmptyState emoji="📖" title="还没有日记" desc="今天感觉怎么样？记下来吧" />
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => {
            const m = MOOD_LABELS.find((x) => x.value === r.mood);
            return (
              <li key={r.id} className="rounded-2xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <span aria-hidden>{m?.emoji}</span>
                    {fmtDate(r.date)}
                    <span className="text-xs text-muted-foreground">{m?.label}</span>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑日记' : '写日记'}
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
            <Label>今天的心情</Label>
            <div className="flex justify-between gap-1">
              {MOOD_LABELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={[
                    'flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2 transition-colors',
                    mood === m.value ? 'border-primary bg-primary/10' : 'border-border',
                  ].join(' ')}
                >
                  <span className="text-xl" aria-hidden>{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>日记内容</Label>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="今天发生了什么？感受如何？" />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => { if (delId) remove(delId); toast.success('已删除'); }}
        title="删除该日记？"
        message="该日记将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </Card>
  );
}
