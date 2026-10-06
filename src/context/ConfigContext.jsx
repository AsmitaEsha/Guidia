import { createContext, useContext, useEffect, useState } from 'react';
import { get } from '../services/apiClient';

const DEFAULT = {
  loaded: false,
  capabilities: { assistant: false, vision: false, voice: false, speech: false, realtimeVoice: false, guardianApproval: true, sensitiveActions: true, browserExtension: false, demoMode: false },
};

const Ctx = createContext(DEFAULT);
export const useCapabilities = () => useContext(Ctx).capabilities;
export const useConfig = () => useContext(Ctx);

// What the server can do right now (AI configured? voice? kill switches?)
// so the UI shows honest "unavailable" states instead of dead buttons.
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    const load = () => get('/config')
      .then((data) => { if (!cancelled) setConfig({ loaded: true, ...data }); })
      .catch(() => { if (!cancelled) setConfig((c) => ({ ...c, loaded: true })); });
    load();
    const id = setInterval(load, 5 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return <Ctx.Provider value={config}>{children}</Ctx.Provider>;
}
