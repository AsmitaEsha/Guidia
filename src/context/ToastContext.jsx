import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { usePreferences } from './PreferencesContext';

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

const ICONS = { success: CheckCircle2, danger: AlertTriangle, info: Info };

export function ToastProvider({ children }) {
  const { t } = usePreferences();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const dismiss = useCallback(() => { clearTimeout(timer.current); setToast(null); }, []);

  const showToast = useCallback((msg, type = 'info') => {
    clearTimeout(timer.current);
    setToast({ msg, type, id: Date.now() });
    // Long enough to read slowly.
    timer.current = setTimeout(() => setToast(null), type === 'danger' ? 9000 : 6000);
  }, []);

  const value = useMemo(() => ({ toast, showToast, dismissToast: dismiss }), [toast, showToast, dismiss]);
  const Icon = toast ? ICONS[toast.type] || Info : null;

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.type}`} onMouseEnter={() => clearTimeout(timer.current)}>
            <span className="toast-icon" aria-hidden="true"><Icon size={20} /></span>
            <p>{toast.msg}</p>
            <button type="button" className="toast-close" onClick={dismiss} aria-label={t('Close', 'বন্ধ করুন', 'बंद करें', 'Đóng')}>
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
