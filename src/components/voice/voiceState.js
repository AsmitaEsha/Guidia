import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';

// One plain-language state for everything the voice system can be doing.
export function useVoiceState() {
  const { voiceStatus, listening } = useVoice();
  const { prefs } = usePreferences();
  if (listening) return 'listening';
  if (!prefs.voiceEnabled) return 'off';
  if (voiceStatus.status === 'loading') return 'processing';
  if (voiceStatus.status === 'playing') return 'speaking';
  if (voiceStatus.status === 'paused') return 'paused';
  if (voiceStatus.status === 'error') return 'unavailable';
  return 'ready';
}

export function voiceStateLabel(state, t) {
  return {
    ready: t('Voice ready', 'ভয়েস প্রস্তুত', 'आवाज़ तैयार', 'Giọng nói sẵn sàng'),
    listening: t('Listening…', 'শুনছি…', 'सुन रहा हूँ…', 'Đang nghe…'),
    processing: t('Getting ready to speak…', 'বলার প্রস্তুতি নিচ্ছি…', 'बोलने की तैयारी…', 'Đang chuẩn bị đọc…'),
    speaking: t('Guidia is speaking', 'Guidia বলছে', 'Guidia बोल रहा है', 'Guidia đang đọc'),
    paused: t('Paused', 'থামানো আছে', 'रुका हुआ', 'Đã tạm dừng'),
    unavailable: t('Voice unavailable — read the text', 'ভয়েস নেই — লেখা পড়ুন', 'आवाज़ उपलब्ध नहीं — लिखा पढ़ें', 'Không có giọng nói — hãy đọc chữ'),
    off: t('Voice is off', 'ভয়েস বন্ধ', 'आवाज़ बंद है', 'Giọng nói đang tắt'),
  }[state];
}

