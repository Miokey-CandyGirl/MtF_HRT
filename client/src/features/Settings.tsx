import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, SectionTitle, Button, Switch, Select, Modal, Label, ConfirmDialog, Textarea } from '@/components/ui';
import {
  useSettingsStore,
  useMetaStore,
  useMedicationStore,
  useHormoneStore,
  useBodySignsStore,
  useSideEffectsStore,
  useMoodStore,
  useDysphoriaStore,
  useAchievementsStore,
  useBadgesStore,
  syncBadges,
} from '@/store';
import { exportAll, importBackup, validateBackup, type BackupPayload } from '@/lib/storage';
import { downloadFile, copyText, todayStr, isThisMonth } from '@/lib/utils';
import { DENSITY_OPTIONS, BACKUP_TIP } from '@/constants';
import { toast } from 'sonner';

export function Settings() {
  const { particles, density, darkMode, setParticles, setDensity, setDarkMode } = useSettingsStore();
  const incExport = useMetaStore((s) => s.incExport);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupPayload | null>(null);
  const [mode, setMode] = useState<'overwrite' | 'append'>('overwrite');
  const [summary, setSummary] = useState<string | null>(null);

  const onExport = () => {
    const payload = exportAll();
    downloadFile(`HRT备份_${todayStr()}.json`, JSON.stringify(payload, null, 2));
    incExport();
    setTimeout(() => {
      const newly = syncBadges();
      if (newly.length) toast.success('解锁了新徽章：备份小卫士 🛡️');
    }, 50);
    toast.success('已导出备份文件 📥');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!validateBackup(data)) {
          toast.error('备份文件格式不正确');
          return;
        }
        setPending(data);
      } catch {
        toast.error('文件解析失败');
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const doImport = () => {
    if (!pending) return;
    importBackup(pending, mode);
    setPending(null);
    toast.success('导入完成，即将刷新页面…');
    setTimeout(() => window.location.reload(), 800);
  };

  const genSummary = () => {
    const now = new Date();
    const logs = useMedicationStore.getState().logs;
    const monthPrefix = format(now, 'yyyyMM');
    const medDays = Object.entries(logs).filter(
      ([k, v]) => k.startsWith(monthPrefix) && v.spironolactone && v.estradiol,
    ).length;
    const hormones = useHormoneStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const body = useBodySignsStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const side = useSideEffectsStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const mood = useMoodStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const dys = useDysphoriaStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const ach = useAchievementsStore.getState().items.filter((r) => isThisMonth(r.date)).length;
    const badgeCount = Object.keys(useBadgesStore.getState().badges).length;

    const text =
      `【妙可儿的 ${format(now, 'yyyy 年 M 月', { locale: zhCN })} 月度总结】\n` +
      `生成时间：${format(now, 'yyyy-MM-dd HH:mm')}\n` +
      `——————————————\n` +
      `💊 本月用药全勤：${medDays} 天\n` +
      `🩸 化验记录：${hormones} 条\n` +
      `📏 体征记录：${body} 条\n` +
      `💊 副作用记录：${side} 条\n` +
      `📖 心情日记：${mood} 条\n` +
      `☁️ 焦虑量表：${dys} 条\n` +
      `🏆 高光事件：${ach} 条\n` +
      `🎖️ 累计徽章：${badgeCount} 枚\n` +
      `——————————————\n` +
      `亲爱的妙可儿，这个月你也辛苦啦，下个月继续温柔地长大 🌸`;
    setSummary(text);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle emoji="🎨" title="显示设置" desc="樱花粒子与夜间模式" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">樱花飘落粒子</div>
              <div className="text-xs text-muted-foreground">页面背景的樱花/爱心粒子动画</div>
            </div>
            <Switch checked={particles} onChange={setParticles} label="粒子开关" />
          </div>
          {particles && (
            <div className="flex items-center justify-between">
              <div className="font-medium text-foreground">粒子密度</div>
              <Select value={density} onChange={(e) => setDensity(e.target.value as typeof density)} className="w-32">
                {DENSITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">柔和粉色夜间模式</div>
              <div className="text-xs text-muted-foreground">护眼的暗色界面</div>
            </div>
            <Switch checked={darkMode} onChange={setDarkMode} label="夜间模式" />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle emoji="💾" title="数据备份" desc={BACKUP_TIP} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={onExport}>📥 导出备份</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>📤 导入备份</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          导出为 .json 文件包含全部业务数据；导入支持覆盖或追加两种模式。
        </p>
      </Card>

      <Card>
        <SectionTitle emoji="📅" title="月度总结" desc="一键生成本月记录统计，可复制" />
        <Button onClick={genSummary}>📝 生成本月总结</Button>
      </Card>

      {/* 导入确认 */}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="确认导入备份"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPending(null)}>取消</Button>
            <Button size="sm" onClick={doImport}>确认导入</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground">检测到备份文件，请选择导入模式：</p>
          <div className="space-y-2">
            <label className="flex items-start gap-2 rounded-xl border border-border p-3">
              <input type="radio" checked={mode === 'overwrite'} onChange={() => setMode('overwrite')} />
              <div>
                <div className="text-sm font-medium text-foreground">覆盖</div>
                <div className="text-xs text-muted-foreground">清空当前全部数据，替换为备份内容</div>
              </div>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-border p-3">
              <input type="radio" checked={mode === 'append'} onChange={() => setMode('append')} />
              <div>
                <div className="text-sm font-medium text-foreground">追加</div>
                <div className="text-xs text-muted-foreground">保留现有数据，仅并入备份中的新条目（按 id 去重）</div>
              </div>
            </label>
          </div>
          <p className="text-xs text-warning">⚠️ 导入后将自动刷新页面以应用数据。</p>
        </div>
      </Modal>

      {/* 月度总结 */}
      <Modal
        open={!!summary}
        onClose={() => setSummary(null)}
        title="本月总结"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                if (summary) {
                  const ok = await copyText(summary);
                  ok ? toast.success('已复制 📋') : toast.error('复制失败');
                }
              }}
            >
              📋 复制
            </Button>
            <Button size="sm" onClick={() => setSummary(null)}>关闭</Button>
          </>
        }
      >
        <Textarea rows={12} readOnly value={summary ?? ''} className="font-mono text-xs" />
      </Modal>
    </div>
  );
}

// 防止未使用告警
void ConfirmDialog;
void Label;
