import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { get, post } from '../services/apiClient';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useNotifications = () => useContext(Ctx);

// Notifications and their read state live on the server, so "read" stays
// read after a reload or on another device.
export function NotificationProvider({ children }) {
  const { status } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [state, setState] = useState('loading'); // loading | ready | error

  const load = useCallback(async () => {
    try {
      const data = await get('/notifications');
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const first = setTimeout(load, 0);
    const id = setInterval(load, 60_000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [status, load]);

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await post(`/notifications/${id}/read`); } catch { load(); }
  }, [load]);

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await post('/notifications/read-all'); } catch { load(); }
  }, [load]);

  const signedIn = status === 'authenticated';
  const value = useMemo(() => ({
    items: signedIn ? items : [],
    unreadCount: signedIn ? unreadCount : 0,
    state: signedIn ? state : 'idle',
    reload: load, markRead, markAllRead,
  }), [signedIn, items, unreadCount, state, load, markRead, markAllRead]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
