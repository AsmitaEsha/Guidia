import { useState } from 'react';
import { RotateCcw, Square, Volume2, X } from 'lucide-react';
import { useApp } from '../context/AppStateContext';

export default function FloatingVoiceHelp() {
  const { t, language, voiceEnabled, voiceSpeed, voiceStatus, voiceControls } = useApp();
  const [open, setOpen] = useState(false);

  if (!voiceEnabled) return null;

  const speedLabel = voiceSpeed < 0.9
    ? t('Slow', 'ধীর')
    : voiceSpeed > 1.05
    ? t('Faster', 'দ্রুত')
    : t('Normal', 'স্বাভাবিক');

  return (
    <div className="floating-voice-help">
      {open && (
        <div className="floating-voice-panel" role="dialog" aria-label={t('Voice Guidance', 'ভয়েস গাইডেন্স')}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 17 }}>{t('Voice Guidance', 'ভয়েস গাইডেন্স')}</p>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label={t('Close', 'বন্ধ করুন')}>
              <X size={16}/>
            </button>
          </div>
          <div className="flex-col gap-8" style={{ marginBottom: 12 }}>
            <p className="t-sub" style={{ fontSize: 14 }}>{t('Voice', 'ভয়েস')}: {t('On', 'চালু')}</p>
            <p className="t-sub" style={{ fontSize: 14 }}>{t('Speed', 'গতি')}: {speedLabel}</p>
            <p className="t-sub" style={{ fontSize: 14 }}>{t('Language', 'ভাষা')}: {language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'}</p>
          </div>
          <div className="flex-col gap-8">
            <button className="btn btn-sm btn-outline" onClick={voiceControls.replay} disabled={!voiceStatus.currentText}>
              <RotateCcw size={16}/> {t('Replay current instruction', 'বর্তমান নির্দেশনা আবার শুনুন')}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={voiceControls.stop}>
              <Square size={16}/> {t('Stop speaking', 'পড়া বন্ধ করুন')}
            </button>
          </div>
        </div>
      )}
      <button className="floating-voice-button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={t('Voice Help', 'ভয়েস সাহায্য')}>
        <Volume2 size={22}/>
        <span>{t('Voice Help', 'ভয়েস সাহায্য')}</span>
      </button>
    </div>
  );
}
