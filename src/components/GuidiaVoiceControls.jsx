import { Pause, Play, RotateCcw, Square } from 'lucide-react';
import { useApp } from '../context/AppStateContext';

const RATES = [
  { label: 'Slow', bn: 'ধীর', value: 0.8 },
  { label: 'Normal', bn: 'স্বাভাবিক', value: 1 },
  { label: 'Faster', bn: 'দ্রুত', value: 1.15 },
];

export default function GuidiaVoiceControls() {
  const { t, voiceControls, voiceSpeed, voiceStatus } = useApp();
  const paused = voiceStatus.status === 'paused';

  const togglePause = () => {
    if (paused) {
      voiceControls.resume();
    } else {
      voiceControls.pause();
    }
  };

  return (
    <div className="flex-col gap-12">
      <div className="flex items-center gap-10" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-outline voice-btn" onClick={togglePause}>
          {paused ? <Play size={20}/> : <Pause size={20}/>}
          {paused ? t('Continue', 'চালিয়ে যান') : t('Pause', 'বিরতি')}
        </button>
        <button className="btn btn-outline voice-btn" onClick={voiceControls.stop}>
          <Square size={20}/> {t('Stop', 'থামুন')}
        </button>
        <button className="btn btn-outline voice-btn" onClick={voiceControls.replay}>
          <RotateCcw size={20}/> {t('Replay', 'পুনরায় শুনুন')}
        </button>
      </div>
      <div className="segment" style={{ padding: 3, width: 'fit-content' }} aria-label={t('Voice speed', 'ভয়েস গতি')}>
        {RATES.map((rate) => (
          <button
            key={rate.value}
            className={`seg-btn ${Math.abs(voiceSpeed - rate.value) < 0.01 ? 'active' : ''}`}
            onClick={() => voiceControls.setRate(rate.value)}
          >
            {t(rate.label, rate.bn)}
          </button>
        ))}
      </div>
    </div>
  );
}
