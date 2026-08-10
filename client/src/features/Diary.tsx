import { useState } from 'react';
import { Tabs } from '@/components/ui';
import { MoodDiary } from './MoodDiary';
import { DysphoriaScale } from './DysphoriaScale';
import { PsychNotes } from './PsychNotes';

export function Diary() {
  const [tab, setTab] = useState('mood');
  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'mood', label: '心情日记', emoji: '📖' },
          { value: 'dysphoria', label: '焦虑量表', emoji: '☁️' },
          { value: 'psych', label: '心理随访', emoji: '💭' },
        ]}
      />
      {tab === 'mood' && <MoodDiary />}
      {tab === 'dysphoria' && <DysphoriaScale />}
      {tab === 'psych' && <PsychNotes />}
    </div>
  );
}
