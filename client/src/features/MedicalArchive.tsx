import { useEffect, useRef, useState } from 'react';
import { Card, SectionTitle, Button, Textarea } from '@/components/ui';
import { useMedicalArchiveStore } from '@/store';
import { copyText, debounce } from '@/lib/utils';
import { toast } from 'sonner';

export function MedicalArchive() {
  const text = useMedicalArchiveStore((s) => s.text);
  const setText = useMedicalArchiveStore((s) => s.setText);
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
    ok ? toast.success('已复制全部文本 📋') : toast.error('复制失败');
  };

  return (
    <Card>
      <SectionTitle
        emoji="🗂️"
        title="就医档案库"
        desc="粘贴病历摘要 · 面诊笔记 · 性别认同自述 · 自动保存"
        right={
          <Button variant="secondary" size="sm" onClick={copy}>
            📋 复制全部
          </Button>
        }
      />
      <Textarea
        value={local}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder="在这里粘贴合肥四院病历片段、面诊笔记、性别认同自述……会自动保存到本机，无需手动点保存。"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{saved ? '✓ 已自动保存' : '保存中…'}</span>
        <span>{local.length} 字</span>
      </div>
    </Card>
  );
}
