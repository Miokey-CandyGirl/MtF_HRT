import { useEffect, useRef, useState } from 'react';
import { Card, SectionTitle, Button, Textarea } from '@/components/ui';
import { usePsychNotesStore } from '@/store';
import { copyText, debounce } from '@/lib/utils';
import { toast } from 'sonner';

export function PsychNotes() {
  const text = usePsychNotesStore((s) => s.text);
  const setText = usePsychNotesStore((s) => s.setText);
  const [local, setLocal] = useState(text);
  const [saved, setSaved] = useState(true);

  const debouncedSave = useRef(
    debounce((t: string) => {
      setText(t);
      setSaved(true);
    }, 500),
  ).current;

  useEffect(() => {
    setLocal(text);
  }, [text]);

  const onChange = (v: string) => {
    setLocal(v);
    setSaved(false);
    debouncedSave(v);
  };

  const copy = async () => {
    const ok = await copyText(local);
    ok ? toast.success('已复制 📋') : toast.error('复制失败');
  };

  return (
    <Card>
      <SectionTitle
        emoji="💭"
        title="心理随访笔记"
        desc="精神科面诊 · 安全感缺失 · 害怕物品被丢弃 · 自动保存"
        right={<Button variant="secondary" size="sm" onClick={copy}>📋 复制</Button>}
      />
      <Textarea
        value={local}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder="在这里记录精神科面诊内容、安全感缺失的瞬间、害怕物品被丢弃的内心观察……会自动保存。"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{saved ? '✓ 已自动保存' : '保存中…'}</span>
        <span>{local.length} 字</span>
      </div>
    </Card>
  );
}
