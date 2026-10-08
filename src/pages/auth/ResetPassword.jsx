import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { isPasswordStrong } from '../../components/auth/passwordRules';
import { Alert, Button, Field, SuccessState } from '../../components/ui';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const { t } = usePreferences();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState('idle');
  const [done, setDone] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = token && isPasswordStrong(password) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setState('loading');
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setState('idle');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {done ? (
          <SuccessState title={t('Password updated', 'পাসওয়ার্ড হালনাগাদ হয়েছে', 'पासवर्ड अपडेट हो गया', 'Đã cập nhật mật khẩu')} action={<Button size="lg" icon={LogIn} to="/login">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Button>}>
            <p className="text-muted">{t('For your safety, you have been signed out on other devices. Sign in with your new password.', 'নিরাপত্তার জন্য অন্য ডিভাইস থেকে সাইন আউট করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।', 'आपकी सुरक्षा के लिए दूसरे डिवाइस से साइन आउट कर दिया गया है। नए पासवर्ड से साइन इन करें।', 'Để an toàn, bạn đã được đăng xuất trên các thiết bị khác. Hãy đăng nhập bằng mật khẩu mới.')}</p>
          </SuccessState>
        ) : (
          <>
            <header className="stack" style={{ '--gap': 'var(--s-2)' }}>
              <h1 className="auth-title">{t('Choose a new password', 'নতুন পাসওয়ার্ড বেছে নিন', 'नया पासवर्ड चुनें', 'Chọn mật khẩu mới')}</h1>
              <p className="lead">{t("Make it something you haven't used before.", 'আগে ব্যবহার করেননি এমন কিছু দিন।', 'ऐसा कुछ रखें जो पहले इस्तेमाल न किया हो।', 'Hãy chọn mật khẩu bạn chưa từng dùng.')}</p>
            </header>
            {!token && <Alert tone="warn" actions={<Button size="sm" variant="secondary" to="/forgot-password">{t('Request a new link', 'নতুন লিংক চান', 'नया लिंक मांगें', 'Yêu cầu link mới')}</Button>}>{t('This reset link is invalid or incomplete.', 'এই রিসেট লিংকটি অবৈধ বা অসম্পূর্ণ।', 'यह रीसेट लिंक अमान्य या अधूरा है।', 'Link đặt lại này không hợp lệ hoặc chưa đầy đủ.')}</Alert>}
            <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="password" className="label">{t('New password', 'নতুন পাসওয়ার্ড', 'नया पासवर्ड', 'Mật khẩu mới')}</label>
                <PasswordInput id="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} describedBy="pw-req" />
                <PasswordRequirements password={password} id="pw-req" />
              </div>
              <Field label={t('Confirm new password', 'নতুন পাসওয়ার্ড আবার লিখুন', 'नया पासवर्ड दोबारा लिखें', 'Nhập lại mật khẩu mới')} success={passwordsMatch ? t('Passwords match', 'পাসওয়ার্ড মিলেছে', 'पासवर्ड मेल खाते हैं', 'Mật khẩu khớp') : null}
                error={confirmPassword && !passwordsMatch && confirmPassword.length >= password.length ? t('The passwords are not the same yet.', 'পাসওয়ার্ড দুটি এখনো মেলেনি।', 'दोनों पासवर्ड अभी एक जैसे नहीं हैं।', 'Hai mật khẩu chưa giống nhau.') : null}>
                {(p) => <PasswordInput id={p.id} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={p['aria-invalid']} describedBy={p['aria-describedby']} />}
              </Field>
              {error && <Alert tone="warn">{error}</Alert>}
              <Button type="submit" size="lg" block icon={KeyRound} disabled={!canSubmit} state={state} loadingLabel={t('Updating…', 'হালনাগাদ হচ্ছে…', 'अपडेट हो रहा है…', 'Đang cập nhật…')}>
                {t('Update password', 'পাসওয়ার্ড হালনাগাদ করুন', 'पासवर्ड अपडेट करें', 'Cập nhật mật khẩu')}
              </Button>
            </form>
          </>
        )}
        {!done && <Link to="/login" className="auth-back"><ArrowLeft aria-hidden="true" /> {t('Back to sign in', 'সাইন ইনে ফিরুন', 'साइन इन पर लौटें', 'Quay lại đăng nhập')}</Link>}
      </div>
    </AuthLayout>
  );
}
