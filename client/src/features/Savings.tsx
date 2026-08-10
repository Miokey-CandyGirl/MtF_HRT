import { useEffect, useState } from 'react';
import { Card, SectionTitle, Button, Input, Label, Modal, Progress, ConfirmDialog, EmptyState } from '@/components/ui';
import { useSavingsStore } from '@/store';
import { uid, yuan, isNonNeg } from '@/lib/utils';
import { SAVINGS_TEMPLATES } from '@/constants';
import { toast } from 'sonner';
import type { SavingsGoal } from '@/types';

export function Savings() {
  const goals = useSavingsStore((s) => s.goals);
  const setGoals = useSavingsStore((s) => s.setGoals);
  const updateGoal = useSavingsStore((s) => s.updateGoal);
  const addSaved = useSavingsStore((s) => s.addSaved);
  const resetGoal = useSavingsStore((s) => s.resetGoal);

  // 首次加载初始化 3 组默认目标
  useEffect(() => {
    if (goals.length === 0) {
      setGoals(SAVINGS_TEMPLATES.map((t) => ({ id: uid(), ...t })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <SectionTitle emoji="💰" title="愿望存钱罐" desc="为想成为的自己，一点一点攒起来" />
      {goals.length === 0 ? (
        <EmptyState emoji="💰" title="还没有存钱目标" desc="即将自动为你创建 3 组默认目标" />
      ) : (
        <div className="space-y-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={(patch) => updateGoal(g.id, patch)}
              onAddSaved={(amount) => addSaved(g.id, amount)}
              onReset={() => resetGoal(g.id)}
            />
          ))}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        💕 每一笔存入都离那个自己更近一步，不急，慢慢来
      </p>
    </div>
  );
}

function GoalCard({
  goal,
  onEdit,
  onAddSaved,
  onReset,
}: {
  goal: SavingsGoal;
  onEdit: (patch: Partial<SavingsGoal>) => void;
  onAddSaved: (amount: number) => void;
  onReset: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState(goal.name);
  const [target, setTarget] = useState(String(goal.target));
  const [monthly, setMonthly] = useState(String(goal.monthly));
  const [err, setErr] = useState('');

  const progress = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;
  const remaining = Math.max(0, goal.target - goal.saved);
  const months =
    goal.monthly > 0
      ? goal.saved >= goal.target
        ? 0
        : Math.ceil(remaining / goal.monthly)
      : null;
  const done = goal.target > 0 && goal.saved >= goal.target;

  const openEdit = () => {
    setName(goal.name);
    setTarget(String(goal.target));
    setMonthly(String(goal.monthly));
    setErr('');
    setEditOpen(true);
  };
  const saveEdit = () => {
    const t = Number(target);
    const m = Number(monthly);
    if (!goal.name.trim()) {
      setErr('请填写目标名称');
      return;
    }
    if (!isNonNeg(t) || !isNonNeg(m)) {
      setErr('金额必须是非负数字');
      return;
    }
    onEdit({ name: name.trim(), target: t, monthly: m });
    setEditOpen(false);
    toast.success('已更新目标');
  };
  const depositCustom = () => {
    const n = Number(custom);
    if (!isNonNeg(n) || n === 0) {
      toast.error('请输入正数金额');
      return;
    }
    onAddSaved(n);
    setCustom('');
    toast.success(`已存入 ${yuan(n)} 🌸`);
  };

  return (
    <Card className={done ? 'ring-2 ring-primary/40' : ''}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span aria-hidden>{done ? '🎉' : '🐷'}</span>
          {goal.name}
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={openEdit}>编辑</Button>
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>重置</Button>
        </div>
      </div>

      <div className="mt-3">
        <Progress value={progress * 100} withFlower />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{yuan(goal.saved)} / {yuan(goal.target)}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-accent/50 p-2">
          <div className="text-xs text-muted-foreground">已存入</div>
          <div className="font-bold text-primary tnum">{yuan(goal.saved)}</div>
        </div>
        <div className="rounded-xl bg-accent/50 p-2">
          <div className="text-xs text-muted-foreground">还差</div>
          <div className="font-bold text-foreground tnum">{yuan(remaining)}</div>
        </div>
        <div className="rounded-xl bg-accent/50 p-2">
          <div className="text-xs text-muted-foreground">预估还需</div>
          <div className="font-bold text-foreground tnum">{done ? '已完成' : months != null ? `${months} 个月` : '—'}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => { onAddSaved(goal.monthly); toast.success(`已存入本月计划 ${yuan(goal.monthly)}`); }} disabled={goal.monthly <= 0}>
          + 本月 {yuan(goal.monthly)}
        </Button>
        <Input
          type="number"
          inputMode="decimal"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="自定义金额"
          className="h-9 w-32"
        />
        <Button variant="secondary" size="sm" onClick={depositCustom}>存入</Button>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="编辑存钱目标"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>取消</Button>
            <Button size="sm" onClick={saveEdit}>保存</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>目标名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>目标总金额 (元)</Label>
            <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <Label>每月计划存入 (元)</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => { onReset(); toast.success('已重置已存入金额'); }}
        title="重置该目标？"
        message="将清零已存入金额（目标金额与月计划保留）。此操作不可撤销。"
        danger
        confirmText="重置"
      />
    </Card>
  );
}
