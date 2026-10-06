import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Button, EmptyState } from '../components/ui';
import { GuidiaMark } from '../components/GuidiaLogo';

export default function NotFoundPage({ inShell }) {
  const { t } = usePreferences();
  const { status } = useAuth();
  const navigate = useNavigate();
  const home = status === 'authenticated' ? '/app/home' : '/landing';

  const body = (
    <EmptyState
      icon={Compass}
      title={t("We couldn't find that page.", 'পেজটি খুঁজে পাওয়া যায়নি।', 'वह पेज नहीं मिला।', 'Không tìm thấy trang đó.')}
      action={(
        <>
          <Button icon={Home} to={home}>{t('Go home', 'হোমে যান', 'होम पर जाएं', 'Về trang chủ')}</Button>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>{t('Go back', 'পেছনে যান', 'पीछे जाएं', 'Quay lại')}</Button>
        </>
      )}
    >
      {t('The link may be old or mistyped. Nothing is wrong with your account.', 'লিংকটি পুরোনো বা ভুল হতে পারে। আপনার অ্যাকাউন্টে কোনো সমস্যা নেই।', 'लिंक पुराना या गलत हो सकता है। आपके अकाउंट में कोई समस्या नहीं है।', 'Đường link có thể đã cũ hoặc gõ sai. Tài khoản của bạn vẫn ổn.')}
    </EmptyState>
  );

  if (inShell) return <div className="page page-narrow">{body}</div>;
  return (
    <div className="public-shell center" style={{ padding: 'var(--s-6) var(--s-4)' }}>
      <div className="stack" style={{ alignItems: 'center', '--gap': 'var(--s-4)' }}>
        <GuidiaMark size={56} title="Guidia" />
        {body}
      </div>
    </div>
  );
}
