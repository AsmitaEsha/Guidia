import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { Alert, Button, Field } from '../../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const { t } = usePreferences();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return;
    setError('');
    setState('loading');
    try {
      // The server answers the same way whether or not the account exists.
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setState('idle');
    }
  };

  return (
    <AuthLayout statement={t('Locked out? It happens to everyone. Let’s get you back in.', 'ঢুকতে পারছেন না? সবারই হয়। চলুন আবার ঢুকিয়ে দিই।', 'अंदर नहीं जा पा रहे? सबके साथ होता है। चलिए वापस ले चलें।', 'Không vào được? Ai cũng từng gặp. Cùng vào lại nhé.')}>
      <div className="auth-card">
        {sent ? (
          <div className="stack fade" style={{ '--gap': 'var(--s-4)' }} role="status">
            <span className="state-icon pop" aria-hidden="true"><Mail /></span>
            <h1 className="auth-title">{t('Check your email', 'ইমেইল দেখুন', 'अपना ईमेल देखें', 'Kiểm tra email của bạn')}</h1>
            <p className="lead">{t(`If an account exists for ${email}, we have sent a link to choose a new password. It works once and expires soon.`, `${email} ঠিকানায় অ্যাকাউন্ট থাকলে নতুন পাসওয়ার্ড বেছে নেওয়ার লিংক পাঠানো হয়েছে। এটি একবারই চলে এবং শিগগির মেয়াদ শেষ হয়।`, `अगर ${email} पर खाता है, तो नया पासवर्ड चुनने का लिंक भेजा गया है। यह एक बार चलता है और जल्दी खत्म हो जाता है।`, `Nếu có tài khoản với ${email}, chúng tôi đã gửi link để đặt mật khẩu mới. Link dùng một lần và sẽ sớm hết hạn.`)}</p>
            <p className="text-muted">{t('Not there? Look in the spam folder, or ask someone you trust to help you check.', 'পাচ্ছেন না? স্প্যাম ফোল্ডারে দেখুন, বা বিশ্বস্ত কাউকে দেখতে বলুন।', 'नहीं मिला? स्पैम फ़ोल्डर देखें, या किसी भरोसेमंद से मदद लें।', 'Không thấy? Hãy xem thư mục spam, hoặc nhờ người tin cậy kiểm tra giúp.')}</p>
            <Button variant="secondary" icon={Send} onClick={() => setSent(false)}>{t('Send it again', 'আবার পাঠান', 'फिर से भेजें', 'Gửi lại')}</Button>
          </div>
        ) : (
          <>
            <header className="stack" style={{ '--gap': 'var(--s-2)' }}>
              <h1 className="auth-title">{t('Reset your password', 'পাসওয়ার্ড রিসেট করুন', 'पासवर्ड रीसेट करें', 'Đặt lại mật khẩu')}</h1>
              <p className="lead">{t("Enter the email address you signed up with and we'll help you get back in.", 'যে ইমেইল দিয়ে অ্যাকাউন্ট খুলেছিলেন তা লিখুন, আমরা আবার ঢুকতে সাহায্য করব।', 'जिस ईमेल से खाता बनाया था वह लिखें, हम वापस आने में मदद करेंगे।', 'Nhập email bạn đã dùng để đăng ký, chúng tôi sẽ giúp bạn vào lại.')}</p>
            </header>
            <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={handleSubmit} noValidate>
              <Field label={t('Email address', 'ইমেইল ঠিকানা', 'ईमेल पता', 'Địa chỉ email')}>
                {(p) => <input {...p} className="input input-lg" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />}
              </Field>
              {error && <Alert tone="warn">{error}</Alert>}
              <Button type="submit" size="lg" block icon={Send} disabled={!EMAIL_RE.test(email.trim())} state={state} loadingLabel={t('Sending…', 'পাঠানো হচ্ছে…', 'भेजा जा रहा है…', 'Đang gửi…')}>
                {t('Send reset link', 'রিসেট লিংক পাঠান', 'रीसेट लिंक भेजें', 'Gửi link đặt lại')}
              </Button>
            </form>
          </>
        )}
        <Link to="/login" className="auth-back"><ArrowLeft aria-hidden="true" /> {t('Back to sign in', 'সাইন ইনে ফিরুন', 'साइन इन पर लौटें', 'Quay lại đăng nhập')}</Link>
      </div>
    </AuthLayout>
  );
}
