import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mic, Pause, Play, RotateCcw, Square, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { getLanguage } from '../../config/languages';
import { Segmented, Switch, Waveform } from '../ui';
import { useVoiceState, voiceStateLabel } from './voiceState';

const STATE_ICON = { ready: Headphones, listening: Mic, processing: Loader2, speaking: Volume2, paused: Pause, unavailable: AlertCircle, off: VolumeX };
const BTN_STATE = { listening: 'listening', speaking: 'playing', processing: 'loading', paused: 'paused', off: 'off' };

// Global voice control: a status pill in the top bar that opens a small
// panel with pause / resume / stop / replay, speed and the on/off switch.
export default function VoiceControl() {
  const { t, language, prefs, setPreference } = usePreferences();
  const { voiceStatus, voiceControls } = useVoice();
  const state = useVoiceState();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    wrapRef.current?.querySelector('.voice-panel button, .voice-panel input')?.focus();
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const Icon = STATE_ICON[state];
  const label = voiceStateLabel(state, t);
  const lang = getLanguage(language);
  const speaking = state === 'speaking' || state === 'processing';

  return (
    <div className="voice-ctl" ref={wrapRef}>
      <button
        ref={btnRef} type="button" className="voice-btn" data-state={BTN_STATE[state]}
        aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}
        aria-label={`${t('Voice', 'ভয়েস', 'आवाज़', 'Giọng nói')}: ${label}`}
      >
        {state === 'speaking' ? <Waveform /> : <Icon className={state === 'processing' ? 'spin' : undefined} aria-hidden="true" />}
        <span className="voice-btn-label">{state === 'speaking' ? t('Speaking', 'বলছে', 'बोल रहा', 'Đang đọc') : state === 'listening' ? t('Listening', 'শুনছি', 'सुन रहा', 'Đang nghe') : t('Voice', 'ভয়েস', 'आवाज़', 'Giọng nói')}</span>
      </button>

      {open && (
        <div className="voice-panel" id={panelId} role="dialog" aria-label={t('Voice controls', 'ভয়েস নিয়ন্ত্রণ', 'आवाज़ नियंत्रण', 'Điều khiển giọng nói')}>
          <div className="voice-state" data-state={state === 'speaking' ? 'playing' : state}>
            <span className="voice-state-icon" aria-hidden="true">
              {state === 'speaking' ? <Waveform /> : <Icon size={22} className={state === 'processing' ? 'spin' : undefined} />}
            </span>
            <div className="stack" style={{ '--gap': '2px', minWidth: 0 }}>
              <p className="text-strong" aria-live="polite">{label}</p>
              <p className="voice-now clamp-2">
                {voiceStatus.error && state === 'unavailable' ? voiceStatus.error : voiceStatus.currentText || `${t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}: ${lang.nativeName}`}
              </p>
            </div>
          </div>

          <div className="voice-controls">
            {state === 'paused' ? (
              <button type="button" className="btn btn-tonal" onClick={voiceControls.resume}><Play aria-hidden="true" />{t('Resume', 'আবার চালু', 'जारी रखें', 'Tiếp tục')}</button>
            ) : (
              <button type="button" className="btn btn-quiet" onClick={voiceControls.pause} disabled={!speaking}><Pause aria-hidden="true" />{t('Pause', 'থামান', 'रोकें', 'Tạm dừng')}</button>
            )}
            <button type="button" className="btn btn-quiet" onClick={voiceControls.stop} disabled={!speaking && state !== 'paused'}><Square aria-hidden="true" />{t('Stop', 'বন্ধ', 'बंद', 'Dừng')}</button>
            <button type="button" className="btn btn-quiet" onClick={voiceControls.replay} disabled={!prefs.voiceEnabled}><RotateCcw aria-hidden="true" />{t('Replay', 'আবার শুনুন', 'फिर सुनें', 'Nghe lại')}</button>
            <Link to="/app/ask?listen=1" className="btn btn-quiet" onClick={() => setOpen(false)}><Mic aria-hidden="true" />{t('Speak', 'বলুন', 'बोलें', 'Nói')}</Link>
          </div>

          <div className="row-between">
            <span className="text-strong" id={`${panelId}-on`}>{t('Read things aloud', 'পড়ে শোনান', 'पढ़कर सुनाएं', 'Đọc to')}</span>
            <Switch checked={prefs.voiceEnabled} onChange={(v) => { if (!v) voiceControls.stop(); setPreference('voiceEnabled', v).catch(() => {}); }} labelledBy={`${panelId}-on`} />
          </div>
          <div className="stack" style={{ '--gap': '6px' }}>
            <span className="text-strong">{t('Speed', 'গতি', 'गति', 'Tốc độ')}</span>
            <Segmented
              block label={t('Speed', 'গতি', 'गति', 'Tốc độ')} value={prefs.voiceSpeed <= 0.85 ? 0.8 : prefs.voiceSpeed >= 1.15 ? 1.2 : 1}
              onChange={(v) => setPreference('voiceSpeed', v).catch(() => {})}
              options={[
                { value: 0.8, label: t('Slow', 'ধীরে', 'धीमा', 'Chậm') },
                { value: 1, label: t('Normal', 'স্বাভাবিক', 'सामान्य', 'Vừa') },
                { value: 1.2, label: t('Fast', 'দ্রুত', 'तेज़', 'Nhanh') },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
