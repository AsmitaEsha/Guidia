import { useCallback, useEffect, useRef, useState } from 'react';
import { get } from '../services/apiClient';

// Minimal server-state hook: loading / error / data / reload.
// `path` null means "don't fetch yet".
export function useResource(path, { select } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: Boolean(path) });
  const selectRef = useRef(select);
  selectRef.current = select;
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const raw = await get(path);
      if (id !== seq.current) return;
      setState({ data: selectRef.current ? selectRef.current(raw) : raw, error: null, loading: false });
    } catch (error) {
      if (id !== seq.current) return;
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, [path]);

  useEffect(() => {
    load();
    return () => { seq.current += 1; };
  }, [load]);

  const mutate = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);

  return { ...state, reload: load, mutate };
}
