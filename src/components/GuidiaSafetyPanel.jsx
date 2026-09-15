import { useState } from 'react';
import { ShieldAlert, Pencil, LifeBuoy, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';

// The Psychological Safety Net (README: "Psychological Safety Net"). A
// single reusable interception shown before any sensitive action —
// financial transfer, account deletion, permission grant, sensitive-data
// submission. It always asks the same four questions and always logs what
// the user chose, so every sensitive workflow in the app behaves the same
// way instead of each screen inventing its own ad hoc confirmation dialog.
//
function Row({ label, value }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <p className="t-tiny" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 600 }}>{value}</p>
    </div>
  );
}

// Usage: render it conditionally (open={true}) with the four fields filled
// in from the caller's own context, then handle onProceed/onEdit/onHelp.
export default function GuidiaSafetyPanel({
  open,
  actionType,
  title,
  what,
  who,
  amountOrData,
  consequence,
  onProceed,
  onEdit,
  onRequestHelp,
}) {
  const { t } = useApp();
  const { authedFetch } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const resolve = async (resolution, callback) => {
    setBusy(true);
    try {
      await authedFetch('/safety/interceptions', {
        method: 'POST',
        body: { actionType, summary: { what, who, amountOrData, consequence }, resolution },
      });
    } catch {
      // Logging the interception should never block the user from acting —
      // if it fails, the flow still continues.
    } finally {
      setBusy(false);
      callback?.();
    }
  };

  return (
    <div
      role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}
    >
      <div className="card anim-scale" style={{ maxWidth: 460, width: '100%', padding: 24, border: '2px solid var(--warn)' }}>
        <div className="flex items-center gap-10" style={{ marginBottom: 16 }}>
          <div className="icon-wrap iw-sm" style={{ background: 'var(--warn-light)', color: 'var(--warn)', borderRadius: 10 }}>
            <ShieldAlert size={20} />
          </div>
          <p style={{ fontWeight: 800, fontSize: 18 }}>{title || t('Let\'s check this together first', 'আগে একসাথে এটি যাচাই করি')}</p>
        </div>

        <Row label={t('What are you doing?', 'আপনি কী করছেন?')} value={what} />
        <Row label={t('Who is involved?', 'কে জড়িত আছে?')} value={who} />
        <Row label={t('What amount or information?', 'কত পরিমাণ বা কী তথ্য?')} value={amountOrData} />
        <div style={{ padding: '12px 0' }}>
          <p className="t-tiny" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('What happens next?', 'এরপর কী হবে?')}</p>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>{consequence}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary btn-full" disabled={busy} onClick={() => resolve('PROCEED', onProceed)}>
            {t('Proceed', 'এগিয়ে যান')} <ArrowRight size={18} />
          </button>
          <button className="btn btn-ghost btn-full" disabled={busy} onClick={() => resolve('EDIT', onEdit)}>
            <Pencil size={18} /> {t('Edit Details', 'তথ্য পরিবর্তন করুন')}
          </button>
          <button className="btn btn-ghost btn-full" disabled={busy} onClick={() => resolve('HELP', onRequestHelp)}>
            <LifeBuoy size={18} /> {t('Ask for Help', 'সাহায্য চান')}
          </button>
        </div>
      </div>
    </div>
  );
}
