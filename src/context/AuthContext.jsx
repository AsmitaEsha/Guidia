import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, onSessionExpired, patch, post, put, refreshSession, setAccessToken, upload } from '../services/apiClient';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Server-backed identity. The server is the source of truth for the user,
// their profile and preferences; this context only caches the latest copy.
// The access token lives in memory; the httpOnly refresh cookie restores
// the session after a reload.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const signedIn = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus('authenticated');
    return data.user;
  }, []);

  const signedOut = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    onSessionExpired(signedOut);
    let cancelled = false;
    refreshSession()
      .then((data) => { if (!cancelled) signedIn(data); })
      .catch(() => { if (!cancelled) signedOut(); });
    return () => { cancelled = true; };
  }, [signedIn, signedOut]);

  const login = useCallback((creds) => post('/auth/login', creds).then(signedIn), [signedIn]);
  const register = useCallback((data) => post('/auth/register', data).then(signedIn), [signedIn]);

  const logout = useCallback(async () => {
    try { await post('/auth/logout'); } finally { signedOut(); }
  }, [signedOut]);

  const refreshUser = useCallback(async () => {
    const data = await api('/users/me');
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (changes) => {
    const data = await patch('/users/me', changes);
    setUser(data.user);
    return data.user;
  }, []);

  // Optimistic: the UI reflects the change immediately; if the server
  // rejects it the previous value is restored and the error is surfaced.
  const updatePreferences = useCallback(async (changes) => {
    let previous;
    setUser((u) => {
      previous = u;
      if (!u) return u;
      const { preferredLanguage, ...prefs } = changes;
      return { ...u, ...(preferredLanguage ? { preferredLanguage } : {}), preference: { ...u.preference, ...prefs } };
    });
    try {
      const data = await put('/users/me/preferences', changes);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setUser(previous);
      throw err;
    }
  }, []);

  const requestPasswordReset = useCallback((email) => post('/auth/forgot-password', { email }), []);
  const resetPassword = useCallback((data) => post('/auth/reset-password', data), []);

  // Compatibility helpers for components written against the V1 context.
  const authedFetch = useCallback((path, { method = 'GET', body } = {}) => api(path, { method, ...(body !== undefined ? { body } : {}) }), []);
  const authedFetchForm = useCallback((path, formData) => upload(path, formData), []);

  const value = useMemo(() => ({
    user, status, login, register, logout, refreshUser, updateProfile, updatePreferences,
    requestPasswordReset, resetPassword, authedFetch, authedFetchForm, ApiError,
  }), [user, status, login, register, logout, refreshUser, updateProfile, updatePreferences, requestPasswordReset, resetPassword, authedFetch, authedFetchForm]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
