import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES, getLanguage } from '../config/languages';
import { makeT } from '../i18n';

const Ctx = createContext(null);
export const usePreferences = () => useContext(Ctx);

// Before sign-in, the choices made in the welcome setup (language, guidance
// style, text size, voice) are remembered in this browser, so the landing
// page already speaks the visitor's language at their size and pace. On
// sign-up they are copied to the account; after sign-in every preference
// comes from — and is saved to — the user's account.
const GUEST_LANGUAGE_KEY = 'guidia.uiLanguage';
const GUEST_PREFS_KEY = 'guidia.guestPrefs';
const SETUP_DONE_KEY = 'guidia.setupDone';
const GUEST_KEYS = ['cognitiveState', 'fontSize', 'voiceEnabled', 'voiceSpeed', 'voiceAutoPlay', 'reducedMotion', 'highContrast'];

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
/** Has this browser finished the welcome setup? */
export function guestSetupDone() {
  try { return localStorage.getItem(SETUP_DONE_KEY) === 'true'; } catch { return false; }
}

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
  const [guestPrefs, setGuestPrefs] = useState(() => readJson(GUEST_PREFS_KEY) || {});
  const [setupDone, setSetupDoneState] = useState(guestSetupDone);
  const [error, setError] = useState(null);

  const prefs = useMemo(
    () => (user ? { ...DEFAULT_PREFS, ...(user.preference || {}) } : { ...DEFAULT_PREFS, ...guestPrefs }),
    [user, guestPrefs],
  );
  const language = user?.preferredLanguage && LANGUAGE_CODES.includes(user.preferredLanguage) ? user.preferredLanguage : guestLanguage;
  const mode = prefs.cognitiveState.toLowerCase();

  const save = useCallback(async (changes) => {
    if (!user) {
      // Guest: keep the welcome-setup choices in this browser.
      const picked = Object.fromEntries(Object.entries(changes).filter(([k]) => GUEST_KEYS.includes(k)));
      setGuestPrefs((prev) => { const next = { ...prev, ...picked }; writeJson(GUEST_PREFS_KEY, next); return next; });
      return;
    }
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

  const markSetupDone = useCallback(() => {
    try { localStorage.setItem(SETUP_DONE_KEY, 'true'); } catch { /* ignore */ }
    setSetupDoneState(true);
  }, []);

  // A visitor who finished the welcome setup and then signs up keeps every
  // choice: it is copied to the new account once, and the account's own
  // onboarding then skips straight to the last, optional question.
  useEffect(() => {
    if (!user || !setupDone) return;
    // Only for a brand-new account (learners before onboarding; family
    // accounts skip onboarding, so check that it was just created), and
    // only once per account on this browser.
    let carriedFor = null;
    try { carriedFor = localStorage.getItem('guidia.carriedFor'); } catch { /* ignore */ }
    const fresh = !user.preference?.onboardingDone || (user.createdAt && Date.now() - new Date(user.createdAt).getTime() < 10 * 60_000);
    if (!fresh || carriedFor === user.id) return;
    try { localStorage.setItem('guidia.carriedFor', user.id); } catch { /* ignore */ }
    const carried = Object.fromEntries(Object.entries(guestPrefs).filter(([k]) => GUEST_KEYS.includes(k)));
    updatePreferences({ ...carried, preferredLanguage: guestLanguage }).catch(() => {});
  }, [user, setupDone, guestPrefs, guestLanguage, updatePreferences]);
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
    setupDone, markSetupDone,
    saveError: error,
  }), [language, setLanguage, t, mode, setMode, prefs, setPreference, save, setupDone, markSetupDone, error]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
