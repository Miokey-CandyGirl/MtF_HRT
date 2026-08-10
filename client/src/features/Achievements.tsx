import { useState } from 'react';
import { Card, SectionTitle, Button, Input, Textarea, Label, Modal, EmptyState, ConfirmDialog } from '@/components/ui';
import { useAchievementsStore, useBadgesStore } from '@/store';
import { uid, todayStr, fmtDate, nonEmpty } from '@/lib/utils';
import { BADGES } from '@/lib/badges';
import { toast } from 'sonner';
import type { Achievement } from '@/types';

export function Achievements() {
  return (
    <div className="space-y-6">
      <MemoryWall />
      <BadgeWall />
    </div>
  );
}

function MemoryWall() {
  const items = useAchievementsStore((s) => s.items);
  const add = useAchievementsStore((s) => s.add);
  const update = useAchievementsStore((s) => s.update);
  const remove = useAchievementsStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr());
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setDate(todayStr());
    setDesc('');
    setErr('');
    setOpen(true);
  };
  const openEdit = (r: Achievement) => {
    setEditing(r);
    setTitle(r.title);
    setDate(r.date);
    setDesc(r.description ?? '');
    setErr('');
    setOpen(true);
  };
  const submit = () => {
    if (!nonEmpty(title)) {
      setErr('请填写事件标题');
      return;
    }
    if (editing) {
      update(editing.id, { title: title.trim(), date, description: desc.trim() || undefined });
      toast.success('已更新高光事件');
    } else {
      add({ id: uid(), title: title.trim(), date, description: desc.trim() || undefined });
      toast.success('又多了一个高光时刻 🌸');
    }
    setOpen(false);
  };

  return (
    <Card>
      <SectionTitle
        emoji="🏆"
        title="成就回忆墙"
        desc="记录每一个值得纪念的高光时刻"
        right={<Button size="sm" onClick={openNew}>＋ 新增</Button>}
      />
      {sorted.length === 0 ? (
        <EmptyState emoji="🏆" title="还没有高光事件" desc="第一次复查、第一次穿搭、第一次被肯定……都值得记下来" />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sorted.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-gradient-to-br from-accent/60 to-card p-3">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-foreground">✨ {r.title}</h4>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>编辑</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDelId(r.id)}>删除</Button>
                </div>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{fmtDate(r.date)}</div>
              {r.description && <p className="mt-1 text-sm text-foreground">{r.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑高光事件' : '新增高光事件'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={submit}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>事件标题</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：第一次鼓起勇气穿裙子出门" />
          </div>
          <div>
            <Label>发生日期</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>简短描述</Label>
            <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => { if (delId) remove(delId); toast.success('已删除'); }}
        title="删除该事件？"
        message="该高光事件将被删除，此操作不可撤销。"
        danger
        confirmText="删除"
      />
    </Card>
  );
}

function BadgeWall() {
  const badges = useBadgesStore((s) => s.badges);
  const unlockedCount = Object.keys(badges).length;

  return (
    <Card>
      <SectionTitle emoji="🎖️" title="徽章墙" desc={`已解锁 ${unlockedCount} / ${BADGES.length} 枚`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BADGES.map((b) => {
          const unlocked = !!badges[b.id];
          return (
            <div
              key={b.id}
              className={[
                'flex flex-col items-center gap-1 rounded-2xl border p-4 text-center transition-all',
                unlocked
                  ? 'border-primary bg-primary/10 card-shadow'
                  : 'border-border bg-accent/30 opacity-60 grayscale',
              ].join(' ')}
            >
              <span className="text-3xl" aria-hidden>{b.emoji}</span>
              <span className="text-sm font-bold text-foreground">{b.name}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{b.description}</span>
              {unlocked ? (
                <span className="mt-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  已解锁
                </span>
              ) : (
                <span className="mt-1 text-[10px] text-muted-foreground">未解锁</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        💕 完成各板块的打卡任务，徽章会自动解锁并永久保存
      </p>
    </Card>
  );
}
