import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch, apiFetchForm, ApiError } from '../services/apiClient';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

// Real authentication state, backed by the Guidia API. The access token is
// kept in memory only (never localStorage) — the refresh token lives in an
// httpOnly cookie set by the server, so a page reload silently re-authenticates
// via /auth/refresh instead of losing the session.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'guest'

  // Re-authenticate from the httpOnly refresh cookie on first load, so a
  // page reload doesn't lose the session.
  useEffect(() => {
    let cancelled = false;
    apiFetch('/auth/refresh', { method: 'POST' })
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setAccessToken(data.accessToken);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setAccessToken(null);
        setStatus('guest');
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password, rememberMe } });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setStatus('authenticated');
    return data.user;
  }, []);

  const register = useCallback(async ({ fullName, email, password, confirmPassword, preferredLanguage }) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: { fullName, email, password, confirmPassword, preferredLanguage },
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setStatus('authenticated');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      // Clear every piece of in-memory session/user state — nothing about
      // the signed-out account should remain reachable after this point.
      setUser(null);
      setAccessToken(null);
      setStatus('guest');
    }
  }, []);

  const requestPasswordReset = useCallback(
    (email) => apiFetch('/auth/forgot-password', { method: 'POST', body: { email } }),
    []
  );

  const resetPassword = useCallback(
    (data) => apiFetch('/auth/reset-password', { method: 'POST', body: data }),
    []
  );

  // Authenticated fetch helper that pages/components can use for anything
  // requiring the current access token.
  const authedFetch = useCallback(
    (path, opts = {}) => apiFetch(path, { ...opts, accessToken }),
    [accessToken]
  );

  // For multipart uploads (e.g. screenshot analysis).
  const authedFetchForm = useCallback(
    (path, formData) => apiFetchForm(path, { formData, accessToken }),
    [accessToken]
  );

  // Persists onboarding / Cognitive Load Governor / accessibility settings
  // to the server and updates the in-memory user with the server's response.
  const updatePreferences = useCallback(async (changes) => {
    const data = await apiFetch('/users/me/preferences', { method: 'PUT', body: changes, accessToken });
    setUser(data.user);
    return data.user;
  }, [accessToken]);

  return (
    <Ctx.Provider value={{ user, accessToken, status, login, register, logout, authedFetch, authedFetchForm, updatePreferences, requestPasswordReset, resetPassword, ApiError }}>
      {children}
    </Ctx.Provider>
  );
}
