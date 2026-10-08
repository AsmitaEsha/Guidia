import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, upload } from '../services/apiClient';
import { usePreferences } from './PreferencesContext';
import { useCapabilities } from './ConfigContext';
import { useAuth } from './AuthContext';
import { getLanguage } from '../config/languages';
import { voiceChunks } from '../utils/voiceGuidance';

const Ctx = createContext(null);
export const useVoice = () => useContext(Ctx);

const PAUSE_BY_MODE = { calm: 250, unsure: 450, scared: 700 };

// Browsers load their voice list asynchronously (often empty on first
// call), so wait briefly for it before deciding there is no voice.
function loadBrowserVoices(waitMs = 1500) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  if (!synth) return Promise.resolve([]);
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => { synth.removeEventListener?.('voiceschanged', done); clearTimeout(timer); resolve(synth.getVoices()); };
    const timer = setTimeout(done, waitMs);
    synth.addEventListener?.('voiceschanged', done);
  });
}

function findBrowserVoice(language, voices) {
  const { voiceHints } = getLanguage(language).speech;
  const matches = voices.filter((v) => voiceHints.includes(v.lang.toLowerCase().replace('_', '-')))
    .concat(voices.filter((v) => voiceHints.some((h) => `${v.lang} ${v.name}`.toLowerCase().includes(h))));
  // Prefer the natural-sounding online voices (Edge, Chrome) when present.
  return matches.find((v) => /natural|online|google/i.test(v.name)) || matches[0] || null;
}

// Read each sentence with a voice for the language it is actually written
// in (some practice-app lines exist only in English or Bengali).
const VI_MARKS = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
function spokenLanguage(text, fallback) {
  const bn = (text.match(/[ঀ-৿]/g) || []).length;
  const hi = (text.match(/[ऀ-ॿ]/g) || []).length;
  if (bn || hi) return bn >= hi ? 'bn' : 'hi';
  if (VI_MARKS.test(text)) return 'vi';
  if (/[a-z]/i.test(text)) return fallback === 'vi' ? 'vi' : 'en';
  return fallback;
}

// Fewer, longer server requests (quicker overall), but never mixing
// languages in one request, so each part gets the right voice.
function serverChunks(chunks, language, max = 480) {
  const out = [];
  let lastLang = null;
  for (const c of chunks) {
    const lang = spokenLanguage(c, language);
    if (out.length && lang === lastLang && out[out.length - 1].length + c.length + 1 <= max) out[out.length - 1] += ` ${c}`;
    else out.push(c);
    lastLang = lang;
  }
  return out;
}

// Speech output priority:  1. Guidia server voice (free neural voices,
//                             or xAI / Gemini when configured)
//                          2. a browser voice that really speaks this language
//                          3. text only — with an honest message, never a
//                             silent switch to an English voice.
// Speech input:            1. record → server transcription
//                          2. browser speech recognition, if available
// Pressing the mic always stops speech first (barge-in).
export function VoiceProvider({ children }) {
  const { status: authStatus } = useAuth();
  const { language, mode, prefs, setPreference, t } = usePreferences();
  const caps = useCapabilities();
  const [voiceStatus, setVoiceStatus] = useState({ status: 'idle', currentText: '', error: '', engine: null });
  const [listening, setListening] = useState(false);

  const audioRef = useRef(null);
  const tokenRef = useRef(0);
  const lastRef = useRef({ text: '', opts: {} });
  const urlRef = useRef(null);
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const playNextRef = useRef(null);

  const authed = authStatus === 'authenticated';
  const serverVoice = caps.voice && authed; // speech in AND out
  // Speech out works signed in or not (landing demos, onboarding).
  const serverSpeech = Boolean(caps.speech || caps.voice);
  const rate = prefs.voiceSpeed || 1;

  const emit = useCallback((next) => setVoiceStatus((s) => ({ ...s, ...next })), []);

  const releaseUrl = () => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
  };

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
    window.speechSynthesis?.cancel();
    releaseUrl();
    emit({ status: 'idle', currentText: '', error: '', engine: null });
  }, [emit]);

  const speakBrowser = useCallback(async (text, token) => {
    if (!window.speechSynthesis) return false;
    const lang = spokenLanguage(text, language);
    const voice = findBrowserVoice(lang, await loadBrowserVoices());
    if (token !== tokenRef.current) return true;
    if (!voice && lang !== 'en') return false;
    // Said "guide-ee-uh": English and Vietnamese voices otherwise say "gwee-dia".
    const spoken = lang === 'en' ? text.replace(/\bGuidia\b/g, 'Guydia') : lang === 'vi' ? text.replace(/\bGuidia\b/g, 'Gai đi a') : text;
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = voice?.lang || getLanguage(lang).speech.bcp47;
    if (voice) u.voice = voice;
    u.rate = rate;
    u.onend = () => { if (token === tokenRef.current) { emit({ status: 'idle', currentText: '' }); lastRef.current.opts.onComplete?.(); } };
    u.onerror = () => { if (token === tokenRef.current) emit({ status: 'error', error: t("Voice isn't available right now. You can read the text.", 'এখন ভয়েস চালু নেই। লেখাটি পড়ে নিন।', 'अभी आवाज़ उपलब्ध नहीं है। लिखा हुआ पढ़ें।', 'Hiện không phát được giọng nói. Bạn có thể đọc chữ.') }); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    emit({ status: 'playing', engine: 'browser', error: '' });
    return true;
  }, [language, rate, emit, t]);

  const textOnly = useCallback(() => {
    emit({
      status: 'error',
      engine: 'text',
      error: t(
        "Spoken guidance isn't available in English on this device right now. Please read the text on screen.",
        'এই ডিভাইসে এখন বাংলায় কথা বলে শোনানো যাচ্ছে না। অনুগ্রহ করে স্ক্রিনের লেখাটি পড়ুন।',
        'इस डिवाइस पर अभी हिन्दी में बोलकर सुनाना संभव नहीं है। कृपया स्क्रीन पर लिखा पढ़ें।',
        'Thiết bị này hiện chưa đọc được tiếng Việt. Vui lòng đọc chữ trên màn hình.',
      ),
    });
  }, [emit, t]);

  const fetchChunk = useCallback(
    (text) => api('/voice/speak', { method: 'POST', body: { text, language, speed: rate } }),
    [language, rate],
  );

  const playServer = useCallback(async (chunks, index, token, pending) => {
    if (token !== tokenRef.current) return;
    if (index >= chunks.length) {
      emit({ status: 'idle', currentText: '' });
      lastRef.current.opts.onComplete?.();
      return;
    }
    const blob = await (pending || fetchChunk(chunks[index]));
    if (token !== tokenRef.current) return;
    // Fetch the next part while this one plays, so there is no long gap.
    const nextPending = index + 1 < chunks.length ? fetchChunk(chunks[index + 1]) : null;
    nextPending?.catch(() => {});
    releaseUrl();
    urlRef.current = URL.createObjectURL(blob);
    if (!audioRef.current) audioRef.current = new Audio();
    const el = audioRef.current;
    el.src = urlRef.current;
    el.onended = () => setTimeout(() => playNextRef.current?.(chunks, index + 1, token, nextPending).catch(() => {
      if (token === tokenRef.current) emit({ status: 'idle', currentText: '' });
    }), PAUSE_BY_MODE[mode] ?? 250);
    await el.play();
    emit({ status: 'playing', engine: 'server', error: '' });
  }, [fetchChunk, mode, emit]);
  useEffect(() => { playNextRef.current = playServer; }, [playServer]);

  const speak = useCallback((text, opts = {}) => {
    const clean = String(text || '').trim();
    if (!clean || !prefs.voiceEnabled) return;
    stop();
    const token = tokenRef.current;
    lastRef.current = { text: clean, opts };
    emit({ status: 'loading', currentText: clean, error: '' });
    const browserOrText = () => speakBrowser(clean, token).then((spoke) => { if (!spoke && token === tokenRef.current) textOnly(); });

    if (serverSpeech) {
      playServer(serverChunks(voiceChunks(clean, mode), language), 0, token).catch(() => {
        if (token === tokenRef.current) browserOrText();
      });
      return;
    }
    browserOrText();
  }, [prefs.voiceEnabled, stop, emit, mode, language, serverSpeech, playServer, speakBrowser, textOnly]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.pause();
    emit({ status: 'paused' });
  }, [emit]);

  const resume = useCallback(() => {
    if (voiceStatus.engine === 'browser') window.speechSynthesis?.resume();
    else audioRef.current?.play().catch(() => {});
    emit({ status: 'playing' });
  }, [emit, voiceStatus.engine]);

  const replay = useCallback(() => {
    if (lastRef.current.text) speak(lastRef.current.text, lastRef.current.opts);
  }, [speak]);

  const setRate = useCallback((r) => { setPreference('voiceSpeed', r).catch(() => {}); }, [setPreference]);

  // ── Listening ───────────────────────────────────────────────────────
  const listenSupported = Boolean(
    (serverVoice && typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia)
    || window.SpeechRecognition || window.webkitSpeechRecognition,
  );

  /** Resolves with the transcript (already redacted by the server). */
  const listen = useCallback(async () => {
    stop(); // barge-in
    if (serverVoice && typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return new Promise((resolve, reject) => {
        const recorder = new MediaRecorder(stream);
        const parts = [];
        recorderRef.current = recorder;
        recorder.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          setListening(false);
          try {
            const blob = new Blob(parts, { type: recorder.mimeType || 'audio/webm' });
            const form = new FormData();
            form.append('audio', blob, 'speech.webm');
            form.append('language', language);
            const data = await upload('/voice/transcribe', form);
            resolve(data.transcript);
          } catch (err) { reject(err); }
        };
        recorder.start();
        setListening(true);
        // Safety stop after 30 s.
        setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 30_000);
      });
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) throw new Error('unsupported');
    return new Promise((resolve, reject) => {
      const rec = new Recognition();
      recognitionRef.current = rec;
      rec.lang = getLanguage(language).speech.bcp47;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => resolve(e.results[0][0].transcript);
      rec.onerror = (e) => reject(new Error(e.error || 'recognition_failed'));
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
    });
  }, [serverVoice, language, stop]);

  const stopListening = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recognitionRef.current?.stop();
  }, []);

  // Stop talking when the user signs out or switches language.
  useEffect(() => stop, [language, authStatus, stop]);

  const value = useMemo(() => ({
    speak, voiceStatus, listening, listen, stopListening, listenSupported,
    voiceControls: { pause, resume, stop, replay, setRate },
  }), [speak, voiceStatus, listening, listen, stopListening, listenSupported, pause, resume, stop, replay, setRate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
