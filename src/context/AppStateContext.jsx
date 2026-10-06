import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { useVoice } from './VoiceContext';
import { useNotifications } from './NotificationContext';
import { useToast } from './ToastContext';
import { post } from '../services/apiClient';

// Compatibility facade over the focused contexts, so the existing app
// simulators and guides keep working unchanged. New code should use the
// specific hooks (usePreferences, useVoice, useNotifications, …) instead.
// This file holds no state of its own.
export function useApp() {
  const { user: authUser } = useAuth();
  const { language, setLanguage, t, mode, setMode, prefs, setPreference } = usePreferences();
  const { speak, voiceStatus, voiceControls } = useVoice();
  const { items, unreadCount, markRead } = useNotifications();
  const { toast, showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => /^\/app\/([^/]+)/.exec(location.pathname)?.[1] || 'home', [location.pathname]);
  const setActiveTab = useCallback((tab) => navigate(`/app/${tab}`), [navigate]);

  const addMemory = useCallback(async ({ title, category, summary, starred }) => {
    if (!authUser) return;
    try {
      await post('/memory', { title, category: String(category).toUpperCase(), summary, starred: Boolean(starred) });
    } catch {
      /* the action itself still succeeded; memory save is best-effort here */
    }
  }, [authUser]);

  const user = useMemo(() => (authUser ? { name: authUser.fullName, email: authUser.email, age: authUser.age } : null), [authUser]);

  return {
    user,
    onboardingDone: Boolean(authUser?.preference?.onboardingDone),
    language, setLanguage, t,
    mode, setMode,
    fontSize: prefs.fontSize,
    darkMode: prefs.darkMode,
    reducedMotion: prefs.reducedMotion,
    voiceEnabled: prefs.voiceEnabled,
    voiceSpeed: prefs.voiceSpeed,
    voiceAutoPlay: prefs.voiceAutoPlay,
    setVoiceEnabled: (v) => setPreference('voiceEnabled', v),
    speak, voiceStatus, voiceControls,
    notifications: items, unreadCount, markNotifRead: markRead,
    toast, showToast,
    activeTab, setActiveTab,
    addMemory,
  };
}
