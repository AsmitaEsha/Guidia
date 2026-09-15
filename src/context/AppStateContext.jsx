import React, { createContext, useContext, useState, useCallback } from 'react';
import { USERS, NOTIFICATIONS, FAKE_TRANSACTIONS, GUARDIAN_ALERTS, MEMORY_ENTRIES } from '../data/hardcoded';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

// ── Google Translate TTS (via Vite proxy to avoid CORS) ───────────────
// The Vite dev server proxies /api/tts → translate.google.com/translate_tts
// This gives us real Bengali, Hindi and English voices without any API key.

let _audioEl = null;
function getAudioEl() {
  if (!_audioEl) { _audioEl = new Audio(); }
  return _audioEl;
}

function speak(text, language, mode) {
  if (!text) return;

  // Split long text into ~180-char chunks (Google TTS URL limit)
  const MAX = 180;
  const chunks = [];
  let rem = text;
  while (rem.length > 0) {
    if (rem.length <= MAX) { chunks.push(rem); break; }
    let idx = rem.lastIndexOf(' ', MAX);
    if (idx < 0) idx = MAX;
    chunks.push(rem.slice(0, idx));
    rem = rem.slice(idx).trimStart();
  }

  const langCode = language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : 'en';
  const el = getAudioEl();
  let i = 0;

  function playNext() {
    if (i >= chunks.length) return;
    const q = encodeURIComponent(chunks[i++]);
    // Use the Vite-proxied path — no CORS, proper Referer header set by proxy
    el.src = `/api/tts?ie=UTF-8&q=${q}&tl=${langCode}&client=tw-ob`;
    el.onended = playNext;
    el.onerror = (e) => { console.warn('TTS chunk error, skipping:', e); playNext(); };
    el.play().catch((e) => console.warn('TTS play error:', e));
  }

  el.pause();
  i = 0;
  playNext();
}

export function AppProvider({ children }) {
  const [screen, setScreen]       = useState('splash');
  const [user, setUser]           = useState(null);
  const [mode, setMode]           = useState('calm');
  const [language, setLanguage]   = useState('en');
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [transactions]            = useState(FAKE_TRANSACTIONS);
  const [guardianAlerts, setGuardianAlerts] = useState(GUARDIAN_ALERTS);
  const [memoryEntries, setMemoryEntries]   = useState(MEMORY_ENTRIES);
  const [progress, setProgress]   = useState({ messaging:60, banking:30, socialMedia:20, email:10, safety:70 });
  const [toast, setToast]         = useState(null);
  const [fontSize, setFontSize]   = useState(17);
  const [darkMode, setDarkMode]   = useState(false);
  const [voiceEnabled, setVoiceEnabled]   = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const speakFn = useCallback((text) => {
    if (!voiceEnabled) return;
    speak(text, language, mode);
  }, [voiceEnabled, language, mode]);

  const login = useCallback((role = 'elderly') => {
    setUser(USERS[role] || USERS.elderly);
    setScreen('onboard');
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(USERS.elderly);
    setScreen('app');
  }, []);

  const addMemory = useCallback((entry) => {
    setMemoryEntries(prev => [{ ...entry, id:`mem_${Date.now()}`, date:'Just now' }, ...prev]);
  }, []);

  const markNotifRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read:true } : n));
  }, []);

  const resolveGuardianAlert = useCallback((id, action) => {
    setGuardianAlerts(prev => prev.map(a => a.id === id ? { ...a, status:action } : a));
    showToast(action === 'approved' ? 'Request approved.' : 'Request rejected.', action);
  }, [showToast]);

  const updateProgress = useCallback((cat, delta) => {
    setProgress(prev => ({ ...prev, [cat]: Math.min(100, (prev[cat] || 0) + delta) }));
  }, []);

  const t = (en, bn, hi) => {
    if (language === 'bn') return bn || en;
    if (language === 'hi') return hi || en;
    return en;
  };

  return (
    <Ctx.Provider value={{
      screen, setScreen,
      user, login, completeOnboarding,
      mode, setMode,
      language, setLanguage,
      activeTab, setActiveTab,
      notifications, unreadCount, markNotifRead,
      transactions,
      guardianAlerts, resolveGuardianAlert,
      memoryEntries, addMemory,
      progress, updateProgress,
      toast, showToast,
      fontSize, setFontSize,
      darkMode, setDarkMode,
      voiceEnabled, setVoiceEnabled,
      reducedMotion, setReducedMotion,
      speak: speakFn, t,
    }}>
      {children}
    </Ctx.Provider>
  );
}
