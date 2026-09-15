import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// A password field with a visibility toggle that has a real accessible
// label ("Show password" / "Hide password"), not just an icon.
export default function PasswordInput({ id, value, onChange, placeholder, autoComplete, required }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        className="input-field"
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: 48 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
          padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
