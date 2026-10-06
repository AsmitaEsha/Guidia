import { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { Dialog, Tabs } from '../ui';
import AskDemo from '../demo/AskDemo';
import ScreenDemo from '../demo/ScreenDemo';
import PracticeDemo from '../demo/PracticeDemo';
import ScamDemo from '../demo/ScamDemo';
import JourneyDemo from '../demo/JourneyDemo';
import { WALKTHROUGH_MODES } from '../../data/landing';

export function WalkthroughBody({ mode, setMode }) {
  const { t } = usePreferences();
  const current = WALKTHROUGH_MODES.find((m) => m.id === mode) || WALKTHROUGH_MODES[0];
  return (
    <div className="walkthrough">
      <Tabs label={t('Walkthrough', 'পরিচিতি', 'परिचय', 'Hướng dẫn')} value={current.id} onChange={setMode}
        tabs={WALKTHROUGH_MODES.map((m) => ({ id: m.id, label: t(...m.label), icon: m.icon }))} />
      <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} key={current.id} className="stack step-in" style={{ '--gap': 'var(--s-4)' }}>
        <p className="lead">{t(...current.intro)}</p>
        {current.id === 'ask' && <AskDemo onPractise={() => setMode('practise')} />}
        {current.id === 'see' && <ScreenDemo />}
        {current.id === 'practise' && <PracticeDemo />}
        {current.id === 'protect' && <ScamDemo />}
        {current.id === 'remember' && <JourneyDemo />}
      </div>
    </div>
  );
}

export default function ProductWalkthrough({ open, onClose, initial = 'ask' }) {
  const { t } = usePreferences();
  const [mode, setMode] = useState(initial);
  return (
    <Dialog open={open} onClose={onClose} size="lg" title={t('See Guidia in action', 'Guidia কীভাবে কাজ করে দেখুন', 'Guidia को काम करते देखें', 'Xem Guidia hoạt động')}
      description={t('A guided demo with pretend content — try every button.', 'নকল বিষয়বস্তু দিয়ে নির্দেশিত ডেমো — প্রতিটি বোতাম চেপে দেখুন।', 'नकली सामग्री वाला निर्देशित डेमो — हर बटन आज़माएं।', 'Bản demo có hướng dẫn với nội dung giả — hãy thử mọi nút.')}>
      <WalkthroughBody mode={mode} setMode={setMode} />
    </Dialog>
  );
}
