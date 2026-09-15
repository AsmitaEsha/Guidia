/**
 * Guideia Gemini 2.5 Flash TTS Service
 * Falls back to Web Speech API when no API key is configured.
 *
 * To activate Gemini voice:
 *   1. Create e:/Guideia/.env
 *   2. Add: VITE_GEMINI_API_KEY=your_key_here
 */

const MODEL = 'gemini-2.5-flash-preview-tts';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Voice selection per language
const VOICE_BY_LANG = {
  en: 'Kore',    // calm, clear English
  bn: 'Aoede',   // warm, gentle – best for Bangla (phonemic)
  hi: 'Leda',    // warm Indian-accent English works for Hindi prompts
};

// Emotional pacing tags injected per mode
const MOOD_TAG = {
  calm:   '',
  unsure: '[slowly] ',
  scared: '[very slowly and gently] ',
};

/**
 * Build a WAV ArrayBuffer from raw PCM bytes (24 kHz, mono, 16-bit).
 */
function pcmToWav(pcmBuffer) {
  const numChannels = 1;
  const sampleRate  = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4,  36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);         // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmBuffer));
  return buffer;
}

let _currentAudio = null;

/**
 * Stop any currently playing Gemini audio.
 */
export function stopGeminiAudio() {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
}

/**
 * Speak text via Gemini 2.5 Flash TTS.
 * @param {string} text       Text to speak
 * @param {string} language   'en' | 'bn' | 'hi'
 * @param {string} mode       'calm' | 'unsure' | 'scared'
 * @param {string} apiKey     Gemini API key
 * @returns {Promise<void>}
 */
export async function speakWithGemini(text, language = 'en', mode = 'calm', apiKey) {
  if (!apiKey) throw new Error('No API key');

  stopGeminiAudio();
  window.speechSynthesis?.cancel();

  const voiceName = VOICE_BY_LANG[language] || VOICE_BY_LANG.en;
  const moodPrefix = MOOD_TAG[mode] || '';
  const prompt = moodPrefix + text;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  };

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) throw new Error('No audio in response');

  // Decode base64 PCM → WAV → Blob → Audio
  const raw = atob(part.inlineData.data);
  const pcm = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) pcm[i] = raw.charCodeAt(i);
  const wav = pcmToWav(pcm.buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url  = URL.createObjectURL(blob);

  const audio = new Audio(url);
  _currentAudio = audio;
  audio.onended = () => { URL.revokeObjectURL(url); _currentAudio = null; };
  await audio.play();
}
