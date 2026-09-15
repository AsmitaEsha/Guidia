import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from './passwordRules';

// Neutral while empty/typing, success once met — never a jarring red
// error state while the user is still typing (per the design spec).
export default function PasswordRequirements({ password }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      <p className="t-tiny" style={{ fontWeight: 700 }}>Your password should include:</p>
      {PASSWORD_RULES.map((rule) => {
        const met = password.length > 0 && rule.test(password);
        return (
          <div key={rule.label} className="flex items-center gap-8">
            {met ? <Check size={15} color="var(--success)" /> : <Circle size={15} color="var(--text-3)" />}
            <span style={{ fontSize: 13, color: met ? 'var(--success)' : 'var(--text-3)', fontWeight: met ? 700 : 500 }}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
