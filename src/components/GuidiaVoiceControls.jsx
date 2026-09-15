import { useState } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppStateContext';

const RATES = [0.75, 1, 1.25, 1.5];

// Minimal, reusable playback control set for voice guidance (README: Voice
// Explanation — play/pause/resume/stop/replay/speed). Operates on whatever
// utterance is currently loaded via AppStateContext's speak()/voiceControls.
export default function GuidiaVoiceControls() {
  const { t, voiceControls } = useApp();
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);

  const togglePause = () => {
    if (paused) { voiceControls.resume(); setPaused(false); }
    else { voiceControls.pause(); setPaused(true); }
  };

  const handleRate = (r) => {
    setRate(r);
    voiceControls.setRate(r);
  };

  return (
    <div className="flex items-center gap-10" style={{ flexWrap: 'wrap' }}>
      <button className="btn btn-sm btn-ghost" onClick={togglePause} title={paused ? t('Resume', 'আবার চালান') : t('Pause', 'বিরতি')}>
        {paused ? <Play size={16}/> : <Pause size={16}/>}
      </button>
      <button className="btn btn-sm btn-ghost" onClick={() => { voiceControls.stop(); setPaused(false); }} title={t('Stop', 'থামুন')}>
        <Square size={16}/>
      </button>
      <button className="btn btn-sm btn-ghost" onClick={() => { voiceControls.replay(); setPaused(false); }} title={t('Replay', 'পুনরায় শুনুন')}>
        <RotateCcw size={16}/>
      </button>
      <div className="segment" style={{ padding: 3 }}>
        {RATES.map(r => (
          <button key={r} className={`seg-btn ${rate === r ? 'active' : ''}`} onClick={() => handleRate(r)}>{r}x</button>
        ))}
      </div>
    </div>
  );
}
