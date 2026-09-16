import { useEffect, useMemo } from 'react';
import { Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppStateContext';

export default function VoiceGuide({ text, title, autoPlay = false, priority = 'normal', onStart, onPause, onResume, onStop, onComplete }) {
  const { t, voiceEnabled, voiceStatus, speak, voiceControls } = useApp();
  const cleanText = useMemo(() => String(text || '').trim(), [text]);
  const isActive = voiceStatus.currentText === cleanText && ['loading', 'playing', 'paused', 'error'].includes(voiceStatus.status);

  useEffect(() => {
    if (autoPlay && voiceEnabled && cleanText) {
      speak(cleanText, { priority, onComplete });
      onStart?.();
    }
    return () => {
      if (autoPlay && isActive) voiceControls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, cleanText, voiceEnabled]);

  if (!cleanText || !voiceEnabled) return null;

  const start = () => {
    speak(cleanText, { priority, onComplete });
    onStart?.();
  };
  const pause = () => { voiceControls.pause(); onPause?.(); };
  const resume = () => { voiceControls.resume(); onResume?.(); };
  const stop = () => { voiceControls.stop(); onStop?.(); };
  const replay = () => { voiceControls.replay(); onStart?.(); };

  return (
    <div className="voice-guide" aria-label={title || t('Voice Guidance', 'ভয়েস গাইডেন্স')}>
      {title && <p className="voice-guide-title">{title}</p>}
      {(!isActive || voiceStatus.status === 'idle') && (
        <button type="button" className="btn btn-primary voice-btn" onClick={start}>
          <Volume2 size={22}/> {t('Listen to this step', 'এই ধাপটি শুনুন', 'यह चरण सुनें')}
        </button>
      )}
      {isActive && voiceStatus.status === 'loading' && (
        <div className="voice-inline-state">
          <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/>
          <span>{t('Preparing voice guidance...', 'ভয়েস গাইডেন্স প্রস্তুত হচ্ছে...', 'वॉइस गाइडेंस तैयार हो रही है...')}</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={stop}><Square size={16}/> {t('Stop', 'থামুন')}</button>
        </div>
      )}
      {isActive && voiceStatus.status === 'playing' && (
        <div className="voice-guide-row">
          <button type="button" className="btn btn-ghost voice-btn" onClick={pause}><Pause size={20}/> {t('Pause', 'বিরতি')}</button>
          <button type="button" className="btn btn-ghost voice-btn" onClick={stop}><Square size={20}/> {t('Stop', 'থামুন')}</button>
        </div>
      )}
      {isActive && voiceStatus.status === 'paused' && (
        <div className="voice-guide-row">
          <button type="button" className="btn btn-primary voice-btn" onClick={resume}><Play size={20}/> {t('Continue', 'চালিয়ে যান')}</button>
          <button type="button" className="btn btn-ghost voice-btn" onClick={replay}><RotateCcw size={20}/> {t('Start Again', 'আবার শুরু করুন')}</button>
          <button type="button" className="btn btn-ghost voice-btn" onClick={stop}><Square size={20}/> {t('Stop', 'থামুন')}</button>
        </div>
      )}
      {isActive && voiceStatus.status === 'error' && (
        <div className="voice-error" role="status">
          <p>{t("Voice guidance isn't available right now. You can still follow the written steps below.", 'ভয়েস গাইডেন্স এখন উপলভ্য নয়। আপনি নিচের লেখা ধাপগুলো অনুসরণ করতে পারেন।')}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={start}>{t('Try Again', 'আবার চেষ্টা করুন')}</button>
        </div>
      )}
    </div>
  );
}
