import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { isPasswordStrong } from '../../components/auth/passwordRules';
import { Alert, Button, Field } from '../../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { language, t } = usePreferences();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [state, setState] = useState('idle');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((tt) => ({ ...tt, [field]: true }));
  const emailOk = EMAIL_RE.test(form.email.trim());
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const canSubmit = form.fullName.trim() && emailOk && isPasswordStrong(form.password) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, confirmPassword: true });
    if (!canSubmit) return;
    setError('');
    setState('loading');
    try {
      await register({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), preferredLanguage: language });
      setState('success');
      setTimeout(() => navigate('/onboarding', { replace: true }), 450);
    } catch (err) {
      setError(err.message || t("That didn't work. Please try again.", 'হয়নি। আবার চেষ্টা করুন।', 'नहीं हुआ। फिर कोशिश करें।', 'Chưa được. Vui lòng thử lại.'));
      setState('idle');
    }
  };

  return (
    <AuthLayout statement={t('A simpler, safer way to feel at home with technology.', 'প্রযুক্তিকে আপন করে নেওয়ার সহজ, নিরাপদ পথ।', 'तकनीक के साथ सहज होने का आसान, सुरक्षित तरीका।', 'Cách đơn giản, an toàn để quen thuộc với công nghệ.')}>
      <div className="auth-card">
        <header className="stack" style={{ '--gap': 'var(--s-2)' }}>
          <h1 className="auth-title">{t('Create your Guidia account', 'আপনার Guidia অ্যাকাউন্ট খুলুন', 'अपना Guidia खाता बनाएं', 'Tạo tài khoản Guidia')}</h1>
          <p className="lead">{t('You will choose your language and comfort level right after this.', 'এরপরই আপনার ভাষা ও স্বাচ্ছন্দ্যের ধরন বেছে নেবেন।', 'इसके ठीक बाद आप अपनी भाषा और सहजता चुनेंगे।', 'Ngay sau bước này bạn sẽ chọn ngôn ngữ và mức hỗ trợ.')}</p>
        </header>

        <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={handleSubmit} noValidate>
          <Field label={t('Full name', 'পুরো নাম', 'पूरा नाम', 'Họ và tên')} error={touched.fullName && !form.fullName.trim() ? t('Please enter your name.', 'আপনার নাম লিখুন।', 'अपना नाम लिखें।', 'Vui lòng nhập tên.') : null}>
            {(p) => <input {...p} className="input input-lg" autoComplete="name" required value={form.fullName} onChange={update('fullName')} onBlur={blur('fullName')} />}
          </Field>
          <Field label={t('Email address', 'ইমেইল ঠিকানা', 'ईमेल पता', 'Địa chỉ email')} error={touched.email && form.email && !emailOk ? t('Please check the email address — it looks incomplete.', 'ইমেইল ঠিকানাটি দেখে নিন — অসম্পূর্ণ মনে হচ্ছে।', 'ईमेल पता जांचें — अधूरा लग रहा है।', 'Hãy kiểm tra email — có vẻ chưa đầy đủ.') : null}>
            {(p) => <input {...p} className="input input-lg" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={update('email')} onBlur={blur('email')} placeholder="you@example.com" />}
          </Field>
          <div className="field">
            <label htmlFor="password" className="label">{t('Password', 'পাসওয়ার্ড', 'पासवर्ड', 'Mật khẩu')}</label>
            <PasswordInput id="password" autoComplete="new-password" required value={form.password} onChange={update('password')} describedBy="pw-req" />
            <PasswordRequirements password={form.password} id="pw-req" />
          </div>
          <Field label={t('Confirm password', 'পাসওয়ার্ড আবার লিখুন', 'पासवर्ड दोबारा लिखें', 'Nhập lại mật khẩu')}
            error={touched.confirmPassword && form.confirmPassword && !passwordsMatch ? t('The passwords are not the same yet.', 'পাসওয়ার্ড দুটি এখনো মেলেনি।', 'दोनों पासवर्ड अभी एक जैसे नहीं हैं।', 'Hai mật khẩu chưa giống nhau.') : null}
            success={passwordsMatch ? t('Passwords match', 'পাসওয়ার্ড মিলেছে', 'पासवर्ड मेल खाते हैं', 'Mật khẩu khớp') : null}>
            {(p) => <PasswordInput id={p.id} autoComplete="new-password" required value={form.confirmPassword} onChange={update('confirmPassword')} onBlur={blur('confirmPassword')} invalid={p['aria-invalid']} describedBy={p['aria-describedby']} />}
          </Field>

          {error && <Alert tone="warn">{error}</Alert>}

          <Button type="submit" size="lg" block icon={state === 'idle' ? UserPlus : undefined} disabled={!canSubmit} state={state}
            loadingLabel={t('Creating your account…', 'অ্যাকাউন্ট তৈরি হচ্ছে…', 'खाता बन रहा है…', 'Đang tạo tài khoản…')} successLabel={t('Account created', 'অ্যাকাউন্ট তৈরি হয়েছে', 'खाता बन गया', 'Đã tạo tài khoản')}>
            {t('Create account', 'অ্যাকাউন্ট খুলুন', 'खाता बनाएं', 'Tạo tài khoản')}
          </Button>
        </form>

        <p className="auth-switch">{t('Already have an account?', 'আগে থেকেই অ্যাকাউন্ট আছে?', 'पहले से खाता है?', 'Đã có tài khoản?')} <Link to="/login" className="text-strong">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Link></p>
      </div>
    </AuthLayout>
  );
}
