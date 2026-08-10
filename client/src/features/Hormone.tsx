import { useState } from 'react';
import { Tabs } from '@/components/ui';
import { HormoneChart } from './HormoneChart';
import { BodySigns } from './BodySigns';
import { SideEffects } from './SideEffects';
import { MedicalArchive } from './MedicalArchive';

export function Hormone() {
  const [tab, setTab] = useState('chart');
  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'chart', label: '激素图表', emoji: '📈' },
          { value: 'body', label: '身体体征', emoji: '📏' },
          { value: 'side', label: '副作用', emoji: '💊' },
          { value: 'archive', label: '就医档案', emoji: '🗂️' },
        ]}
      />
      {tab === 'chart' && <HormoneChart />}
      {tab === 'body' && <BodySigns />}
      {tab === 'side' && <SideEffects />}
      {tab === 'archive' && <MedicalArchive />}
    </div>
  );
}
