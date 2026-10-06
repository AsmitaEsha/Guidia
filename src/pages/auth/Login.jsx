import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { Alert, Button, Checkbox, Field } from '../../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState('idle');

  const emailError = touched && email && !EMAIL_RE.test(email.trim())
    ? t('Please check the email address — it looks incomplete.', 'ইমেইল ঠিকানাটি দেখে নিন — অসম্পূর্ণ মনে হচ্ছে।', 'ईमेल पता जांचें — अधूरा लग रहा है।', 'Hãy kiểm tra email — có vẻ chưa đầy đủ.')
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!EMAIL_RE.test(email.trim()) || !password) return;
    setError('');
    setState('loading');
    try {
      const user = await login({ email: email.trim(), password, rememberMe });
      setState('success');
      const needsOnboarding = !user?.preference?.onboardingDone;
      const to = user?.role === 'ADMIN' ? '/admin' : needsOnboarding ? '/onboarding' : (location.state?.from?.pathname || '/app/home');
      setTimeout(() => navigate(to, { replace: true }), 350);
    } catch (err) {
      // Server messages are already human-friendly (never raw status text).
      setError(err.message || t("We couldn't sign you in. Please check your email and password and try again.", 'সাইন ইন করা যায়নি। ইমেইল ও পাসওয়ার্ড দেখে আবার চেষ্টা করুন।', 'साइन इन नहीं हो सका। ईमेल और पासवर्ड जांचकर फिर कोशिश करें।', 'Không đăng nhập được. Hãy kiểm tra email và mật khẩu rồi thử lại.'));
      setState('idle');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <header className="stack" style={{ '--gap': 'var(--s-2)' }}>
          <h1 className="auth-title">{t('Welcome back', 'আবার স্বাগতম', 'फिर से स्वागत है', 'Chào mừng trở lại')}</h1>
          <p className="lead">{t('Sign in to continue where you left off.', 'যেখানে থেমেছিলেন সেখান থেকে চালিয়ে যেতে সাইন ইন করুন।', 'जहाँ छोड़ा था वहीं से जारी रखने के लिए साइन इन करें।', 'Đăng nhập để tiếp tục từ chỗ bạn dừng.')}</p>
        </header>

        <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={handleSubmit} noValidate>
          <Field label={t('Email address', 'ইমেইল ঠিকানা', 'ईमेल पता', 'Địa chỉ email')} error={emailError}>
            {(p) => <input {...p} className="input input-lg" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} placeholder="you@example.com" />}
          </Field>
          <div className="field">
            <div className="field-row">
              <label htmlFor="password" className="label">{t('Password', 'পাসওয়ার্ড', 'पासवर्ड', 'Mật khẩu')}</label>
              <Link to="/forgot-password" className="text-sm text-strong">{t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?', 'पासवर्ड भूल गए?', 'Quên mật khẩu?')}</Link>
            </div>
            <PasswordInput id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} invalid={Boolean(error)} describedBy={error ? 'login-error' : undefined} />
          </div>
          <Checkbox id="remember" checked={rememberMe} onChange={setRememberMe}>{t('Keep me signed in on this device', 'এই ডিভাইসে সাইন ইন রাখুন', 'इस डिवाइस पर साइन इन रखें', 'Giữ đăng nhập trên thiết bị này')}</Checkbox>

          {error && <div id="login-error"><Alert tone="warn">{error}</Alert></div>}

          <Button type="submit" size="lg" block icon={state === 'idle' ? LogIn : undefined} disabled={!email || !password} state={state}
            loadingLabel={t('Signing in…', 'সাইন ইন হচ্ছে…', 'साइन इन हो रहा है…', 'Đang đăng nhập…')} successLabel={t('Signed in', 'সাইন ইন হয়েছে', 'साइन इन हो गया', 'Đã đăng nhập')}>
            {t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}
          </Button>
        </form>

        <p className="auth-switch">{t("Don't have an account?", 'অ্যাকাউন্ট নেই?', 'खाता नहीं है?', 'Chưa có tài khoản?')} <Link to="/register" className="text-strong">{t('Create an account', 'অ্যাকাউন্ট খুলুন', 'खाता बनाएं', 'Tạo tài khoản')}</Link></p>
      </div>
    </AuthLayout>
  );
}
