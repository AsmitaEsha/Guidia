import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

// A password field with a visibility toggle that has a real accessible
// label ("Show password" / "Hide password"), not just an icon.
export default function PasswordInput({ id, value, onChange, placeholder, autoComplete, required, invalid, describedBy, onBlur }) {
  const { t } = usePreferences();
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-action">
      <input
        id={id} className="input input-lg" type={visible ? 'text' : 'password'} autoComplete={autoComplete} required={required}
        value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
        aria-invalid={invalid || undefined} aria-describedby={describedBy}
      />
      <button
        type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
        aria-label={visible ? t('Hide password', 'পাসওয়ার্ড লুকান', 'पासवर्ड छिपाएं', 'Ẩn mật khẩu') : t('Show password', 'পাসওয়ার্ড দেখান', 'पासवर्ड दिखाएं', 'Hiện mật khẩu')}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
