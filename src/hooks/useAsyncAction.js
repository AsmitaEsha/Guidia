import { useCallback, useEffect, useRef, useState } from 'react';

// One shared pattern for every network action:
//   idle → loading → success (briefly) → idle,   or   → error
// Pair with <Button state={state}> so the button itself says
// "Saving…" → "Saved", and with an inline error message.
export function useAsyncAction({ successMs = 1800 } = {}) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const alive = useRef(true);

  useEffect(() => () => { alive.current = false; clearTimeout(timer.current); }, []);

  const run = useCallback(async (fn) => {
    clearTimeout(timer.current);
    setError(null);
    setState('loading');
    try {
      const result = await fn();
      if (!alive.current) return result;
      setState('success');
      timer.current = setTimeout(() => { if (alive.current) setState('idle'); }, successMs);
      return result;
    } catch (err) {
      if (alive.current) { setState('error'); setError(err); }
      throw err;
    }
  }, [successMs]);

  const reset = useCallback(() => { clearTimeout(timer.current); setState('idle'); setError(null); }, []);

  return { state, error, run, reset, busy: state === 'loading' };
}
