import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES, getLanguage } from '../config/languages';
import { makeT } from '../i18n';

const Ctx = createContext(null);
export const usePreferences = () => useContext(Ctx);

// Before sign-in we only remember the chosen UI language in this browser
// (a per-device convenience). After sign-in every preference comes from —
// and is saved to — the user's account.
const GUEST_LANGUAGE_KEY = 'guidia.uiLanguage';

function initialGuestLanguage() {
  try {
    const saved = localStorage.getItem(GUEST_LANGUAGE_KEY);
    if (LANGUAGE_CODES.includes(saved)) return saved;
  } catch { /* storage unavailable */ }
  const browser = (navigator.language || '').slice(0, 2);
  return LANGUAGE_CODES.includes(browser) ? browser : DEFAULT_LANGUAGE;
}

const DEFAULT_PREFS = {
  cognitiveState: 'CALM',
  fontSize: 20,
  darkMode: false,
  highContrast: false,
  reducedMotion: false,
  voiceEnabled: true,
  voiceSpeed: 1,
  voiceAutoPlay: false,
  preferVoice: false,
  notificationsEnabled: true,
  onboardingDone: false,
};

export function PreferencesProvider({ children }) {
  const { user, updatePreferences } = useAuth();
  const [guestLanguage, setGuestLanguage] = useState(initialGuestLanguage);
  const [error, setError] = useState(null);

  const prefs = useMemo(() => ({ ...DEFAULT_PREFS, ...(user?.preference || {}) }), [user]);
  const language = user?.preferredLanguage && LANGUAGE_CODES.includes(user.preferredLanguage) ? user.preferredLanguage : guestLanguage;
  const mode = prefs.cognitiveState.toLowerCase();

  const save = useCallback(async (changes) => {
    if (!user) return;
    setError(null);
    try {
      await updatePreferences(changes);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [user, updatePreferences]);

  const setLanguage = useCallback((code) => {
    if (!LANGUAGE_CODES.includes(code)) return Promise.resolve();
    setGuestLanguage(code);
    try { localStorage.setItem(GUEST_LANGUAGE_KEY, code); } catch { /* ignore */ }
    return user ? save({ preferredLanguage: code }) : Promise.resolve();
  }, [user, save]);

  const setPreference = useCallback((key, value) => save({ [key]: value }), [save]);
  const setMode = useCallback((m) => save({ cognitiveState: String(m).toUpperCase() }), [save]);

  // Document-level accessibility state. Theme lives on <html> so overlays
  // rendered in portals (dialogs, sheets, toasts) follow it too.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = getLanguage(language).htmlLang;
    root.dataset.mode = mode;
    root.dataset.reducedMotion = String(prefs.reducedMotion);
    root.dataset.contrast = prefs.highContrast ? 'high' : 'normal';
    root.dataset.gxTheme = prefs.darkMode ? 'dark' : 'light';
    root.style.setProperty('--user-font-size', `${prefs.fontSize}px`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', prefs.darkMode ? '#10181c' : '#0d625d');
  }, [language, mode, prefs.reducedMotion, prefs.highContrast, prefs.fontSize, prefs.darkMode]);

  const t = useMemo(() => makeT(language), [language]);

  const value = useMemo(() => ({
    language, setLanguage, t,
    mode, setMode,
    prefs, setPreference, savePreferences: save,
    saveError: error,
  }), [language, setLanguage, t, mode, setMode, prefs, setPreference, save, error]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
