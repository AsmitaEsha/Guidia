import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FAKE_TRANSACTIONS } from '../data/hardcoded';
import { useAuth } from './AuthContext';
import { apiFetchBlob } from '../services/apiClient';
import { recommendedVoiceRate, voiceChunks } from '../utils/voiceGuidance';

// NOTE: notifications/transactions below are still demo data seeded in
// memory — see GUIDIA_IMPLEMENTATION_PLAN.md Phase 15 for the plan to back
// notifications with real generated events. Memory Book entries (below) are
// real, persisted, per-user data as of Phase 13. Guardian data now lives
// entirely behind GuardianDashboard's own real API calls (Phase 12).

function formatRelativeDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function mapMemoryEntry(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.category.toLowerCase(),
    summary: e.summary,
    starred: e.starred,
    date: formatRelativeDate(e.createdAt),
  };
}

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

// ── Voice: real backend TTS proxy (works in production, not just `npm run
// dev`) with play/pause/resume/stop/replay/speed controls. A single shared
// <audio> element and chunk queue live at module scope since only one
// utterance should ever play at a time.

let _audioEl = null;
function getAudioEl() {
  if (!_audioEl) { _audioEl = new Audio(); }
  return _audioEl;
}

// Module-scope playback state — only one utterance should ever play at a
// time regardless of which component triggered it.
let _chunks = [];
let _chunkIndex = -1;
let _lastLang = 'en';
let _rate = 1;
let _blobUrl = null;
let _cancelToken = 0;
let _lastText = '';
let _onComplete = null;
let _setVoiceStatus = () => {};

function revokeBlobUrl() {
  if (_blobUrl) { URL.revokeObjectURL(_blobUrl); _blobUrl = null; }
}

function emitVoiceStatus(next) {
  _setVoiceStatus((prev) => ({ ...prev, ...next }));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playChunk(apiFetchBlob, accessToken, token = _cancelToken, pauseMs = 250) {
  if (_chunkIndex >= _chunks.length) return;
  try {
    if (token !== _cancelToken) return;
    emitVoiceStatus({ status: 'loading', error: '' });
    const blob = await apiFetchBlob(`/voice/speak?text=${encodeURIComponent(_chunks[_chunkIndex])}&lang=${_lastLang}&speed=${_rate}`, { accessToken });
    if (token !== _cancelToken) return;
    revokeBlobUrl();
    _blobUrl = URL.createObjectURL(blob);
    const el = getAudioEl();
    el.src = _blobUrl;
    el.playbackRate = _rate;
    el.onended = async () => {
      if (token !== _cancelToken) return;
      _chunkIndex += 1;
      if (_chunkIndex >= _chunks.length) {
        emitVoiceStatus({ status: 'idle' });
        _onComplete?.();
        return;
      }
      await delay(pauseMs);
      playChunk(apiFetchBlob, accessToken, token, pauseMs);
    };
    await el.play();
    emitVoiceStatus({ status: 'playing', error: '' });
  } catch (err) {
    console.warn('Voice playback error:', err);
    if (token === _cancelToken) {
      emitVoiceStatus({ status: 'error', error: "Voice guidance isn't available right now." });
    }
  }
}

// speak/pause/resume/stop/replay/setRate — the minimum voice control set
// the product spec calls for. `speak` starts a fresh utterance; the others
// operate on whatever is currently loaded.
function speak(text, language, apiFetchBlob, accessToken, { rate = 1, mode = 'calm', pauseMs = 250, onComplete } = {}) {
  if (!text || !apiFetchBlob) return;
  stopVoice();
  _cancelToken += 1;
  const token = _cancelToken;
  _lastText = text;
  _onComplete = onComplete || null;
  _chunks = voiceChunks(text, mode);
  _chunkIndex = 0;
  _lastLang = language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : 'en';
  _rate = rate;
  emitVoiceStatus({ status: 'loading', currentText: text, error: '' });
  playChunk(apiFetchBlob, accessToken, token, pauseMs);
}

function pauseVoice() { _audioEl?.pause(); emitVoiceStatus({ status: 'paused' }); }
function resumeVoice() { _audioEl?.play().then(() => emitVoiceStatus({ status: 'playing' })).catch(() => {}); }
function stopVoice() {
  _cancelToken += 1;
  if (_audioEl) { _audioEl.pause(); _audioEl.currentTime = 0; _audioEl.onended = null; }
  _chunkIndex = _chunks.length;
  revokeBlobUrl();
  emitVoiceStatus({ status: 'idle', currentText: '', error: '' });
}
function replayVoice(apiFetchBlob, accessToken, mode = 'calm', pauseMs = 250) {
  if (_chunks.length === 0) return;
  _cancelToken += 1;
  const token = _cancelToken;
  _chunks = voiceChunks(_lastText, mode);
  _chunkIndex = 0;
  emitVoiceStatus({ status: 'loading', currentText: _lastText, error: '' });
  playChunk(apiFetchBlob, accessToken, token, pauseMs);
}
function setVoiceRate(rate) { _rate = rate; if (_audioEl) _audioEl.playbackRate = rate; }

export function AppProvider({ children }) {
  const { user: authUser, accessToken, updatePreferences, authedFetch, ApiError } = useAuth();
  const user = useMemo(() => (authUser ? { name: authUser.fullName, email: authUser.email } : null), [authUser]);
  const [mode, setMode]           = useState('calm');
  const [language, setLanguage]   = useState('en');
  const seededUserId = useRef(null);

  // The active dashboard section is derived from the real URL (/app/:tab)
  // rather than local-only state, so the browser's back/forward buttons and
  // direct links work correctly instead of always landing on a dead end.
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = useMemo(() => {
    const match = /^\/app\/([^/]+)/.exec(location.pathname);
    return match ? match[1] : 'home';
  }, [location.pathname]);
  const setActiveTab = useCallback((tab) => navigate(`/app/${tab}`), [navigate]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds]   = useState(() => new Set());
  const [transactions]            = useState(FAKE_TRANSACTIONS);
  const [memoryEntries, setMemoryEntries]   = useState([]);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [toast, setToast]         = useState(null);
  const [fontSize, setFontSize]   = useState(20);
  const [darkMode, setDarkMode]   = useState(false);
  const [voiceEnabled, setVoiceEnabled]   = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState({ status: 'idle', currentText: '', error: '' });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Seed local Cognitive Load Governor / accessibility state from the
  // user's persisted preferences once per login, so a reload restores the
  // real saved state instead of resetting to defaults.
  useEffect(() => {
    if (!authUser?.preference || seededUserId.current === authUser.id) return;
    seededUserId.current = authUser.id;
    const p = authUser.preference;
    setMode(p.cognitiveState.toLowerCase());
    setLanguage(authUser.preferredLanguage);
    setFontSize(Math.max(p.fontSize || 20, 20));
    setDarkMode(p.darkMode);
    setVoiceEnabled(p.voiceEnabled);
    setVoiceSpeed(p.voiceSpeed || recommendedVoiceRate(p.cognitiveState?.toLowerCase() || 'calm'));
    setVoiceAutoPlay(Boolean(p.voiceAutoPlay));
    setReducedMotion(p.reducedMotion);
  }, [authUser]);

  useEffect(() => {
    _setVoiceStatus = setVoiceStatus;
    return () => { stopVoice(); _setVoiceStatus = () => {}; };
  }, []);

  // Reduced motion is applied globally (it's a document-wide accessibility
  // setting). Theme is intentionally *not* set globally here — the public
  // marketing/auth pages (Landing/Login/Register) always stay light per the
  // product's visual identity; only the authenticated dashboard shell reads
  // `darkMode` and sets its own `data-theme`, in App.jsx.
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [reducedMotion]);

  // Note: this scales body/base text (anything that inherits font-size
  // rather than setting its own px value). Most headings/labels in this
  // codebase currently hardcode their own px font-size and won't rescale —
  // a fuller fix means migrating those to rem, tracked as follow-up work.
  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-size', `${fontSize}px`);
  }, [fontSize]);

  const persistPreferences = useCallback((changes) => {
    if (!authUser) return Promise.resolve();
    return updatePreferences(changes).catch((err) => {
      console.warn('Failed to save preferences:', err);
    });
  }, [authUser, updatePreferences]);

  // Load the user's real Memory Book once per login (keyed on id, not the
  // whole user object, so a preference update elsewhere doesn't re-fetch).
  // AppProvider wraps public routes too (Landing/Login/Register), so this
  // must skip fetching entirely — not just skip rendering — when signed out.
  const authUserId = authUser?.id;
  useEffect(() => {
    stopVoice();
  }, [location.pathname, authUserId]);
  useEffect(() => {
    let cancelled = false;
    const request = authUserId ? authedFetch('/memory') : Promise.resolve({ entries: [] });
    request
      .then(({ entries }) => {
        if (cancelled) return;
        setMemoryEntries(entries.map(mapMemoryEntry));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMemoryLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUserId]);

  // Notifications are synthesized server-side from real events (safety
  // checks, memory entries, guardian resolutions) — see
  // backend/src/services/notificationService.js. Read/unread state is not
  // yet persisted server-side, so it's tracked client-side for this session.
  useEffect(() => {
    let cancelled = false;
    const request = authUserId ? authedFetch('/notifications') : Promise.resolve({ items: [] });
    request
      .then(({ items }) => {
        if (cancelled) return;
        setNotifications(items.map((n) => ({ ...n, time: formatRelativeDate(n.time) })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUserId]);

  const notificationsWithRead = useMemo(
    () => notifications.map((n) => ({ ...n, read: readNotifIds.has(n.id) })),
    [notifications, readNotifIds]
  );
  const unreadCount = notificationsWithRead.filter(n => !n.read).length;

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const speakFn = useCallback((text, opts = {}) => {
    if (!voiceEnabled || !authUser) return;
    const pauseMs = mode === 'scared' ? 700 : mode === 'unsure' ? 450 : 250;
    const rate = opts.rate || voiceSpeed || recommendedVoiceRate(mode);
    speak(text, language, apiFetchBlob, accessToken, { rate, mode, pauseMs, onComplete: opts.onComplete });
  }, [voiceEnabled, language, authUser, accessToken, voiceSpeed, mode]);

  const voiceControls = useMemo(() => ({
    pause: pauseVoice,
    resume: resumeVoice,
    stop: stopVoice,
    replay: () => replayVoice(apiFetchBlob, accessToken, mode, mode === 'scared' ? 700 : mode === 'unsure' ? 450 : 250),
    setRate: (rate) => {
      setVoiceRate(rate);
      setVoiceSpeed(rate);
      persistPreferences({ voiceSpeed: rate });
    },
  }), [accessToken, mode, persistPreferences]);

  const addMemory = useCallback(async ({ title, category, summary, starred }) => {
    if (!authUser) return;
    try {
      const { entry } = await authedFetch('/memory', {
        method: 'POST',
        body: { title, category: category.toUpperCase(), summary, starred: starred ?? false },
      });
      setMemoryEntries(prev => [mapMemoryEntry(entry), ...prev]);
    } catch (err) {
      console.warn('Failed to save memory entry:', err instanceof ApiError ? err.message : err);
    }
  }, [authUser, authedFetch, ApiError]);

  const markNotifRead = useCallback((id) => {
    setReadNotifIds(prev => new Set(prev).add(id));
  }, []);

  const t = (en, bn, hi) => {
    if (language === 'bn') return bn || en;
    if (language === 'hi') return hi || en;
    return en;
  };

  return (
    <Ctx.Provider value={{
      user,
      onboardingDone: authUser?.preference?.onboardingDone ?? false,
      persistPreferences,
      mode, setMode,
      language, setLanguage,
      activeTab, setActiveTab,
      notifications: notificationsWithRead, unreadCount, markNotifRead,
      transactions,
      memoryEntries, memoryLoading, addMemory,
      toast, showToast,
      fontSize, setFontSize,
      darkMode, setDarkMode,
      voiceEnabled, setVoiceEnabled,
      voiceSpeed, setVoiceSpeed,
      voiceAutoPlay, setVoiceAutoPlay,
      voiceStatus,
      reducedMotion, setReducedMotion,
      speak: speakFn, voiceControls, t,
    }}>
      {children}
    </Ctx.Provider>
  );
}
