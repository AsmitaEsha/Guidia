import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, HeartHandshake, MessageCircle, ScanSearch, ShieldCheck } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { LANGUAGES } from '../../config/languages';
import { apiReachable } from '../../services/apiClient';
import { Alert, Button } from '../ui';
import { GuidiaMark } from '../GuidiaLogo';

function MiniProduct({ t }) {
  return (
    <div className="auth-preview" aria-hidden="true">
      <p className="auth-preview-q">{t('What would you like to do?', 'আপনি কী করতে চান?', 'आप क्या करना चाहेंगे?', 'Bạn muốn làm gì?')}</p>
      <div className="auth-preview-actions">
        <span><BookOpen />{t('Learn something', 'কিছু শিখুন', 'कुछ सीखें', 'Học điều mới')}</span>
        <span><MessageCircle />{t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')}</span>
        <span><ScanSearch />{t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình')}</span>
      </div>
    </div>
  );
}

// Split editorial layout for sign-in, registration and password reset.
// Public pages always use the light Guidia palette.
function ServerCheck({ t }) {
  const [state, setState] = useState('checking');
  const check = () => { setState('checking'); apiReachable().then((ok) => setState(ok ? 'ok' : 'down')); };
  useEffect(() => { let alive = true; apiReachable().then((ok) => { if (alive) setState(ok ? 'ok' : 'down'); }); return () => { alive = false; }; }, []);
  if (state !== 'down') return null;
  return (
    <Alert tone="warn" title={t("Guidia's server isn't answering", 'Guidia-র সার্ভার সাড়া দিচ্ছে না', 'Guidia का सर्वर जवाब नहीं दे रहा', 'Máy chủ Guidia chưa phản hồi')}
      actions={<Button size="sm" variant="secondary" onClick={check}>{t('Check again', 'আবার দেখুন', 'फिर जांचें', 'Kiểm tra lại')}</Button>}>
      {import.meta.env.DEV
        ? 'Start everything with “npm run dev” in the project folder (the API runs on port 8000), then press Check again.'
        : t('Please try again in a moment.', 'একটু পরে আবার চেষ্টা করুন।', 'थोड़ी देर बाद फिर कोशिश करें।', 'Vui lòng thử lại sau giây lát.')}
    </Alert>
  );
}

export default function AuthLayout({ children, statement }) {
  const { t, language, setLanguage } = usePreferences();
  return (
    <div className="auth-shell" data-gx-theme="light">
      <aside className="auth-panel">
        <Link to="/landing" className="auth-brand" aria-label={t('Guidia home', 'Guidia হোম', 'Guidia होम', 'Trang chủ Guidia')}>
          <GuidiaMark size={44} title="" tile />
          <span className="guidia-wordmark" style={{ fontSize: '1.7rem', color: '#fff' }}>Guidia</span>
        </Link>
        <div className="auth-panel-body">
          <p className="auth-statement">{statement || t('Technology should feel understandable.', 'প্রযুক্তি বোঝা সহজ হওয়া উচিত।', 'तकनीक समझ में आने वाली होनी चाहिए।', 'Công nghệ nên dễ hiểu.')}</p>
          <MiniProduct t={t} />
          <ul className="auth-points">
            <li><ShieldCheck aria-hidden="true" />{t('Practise safely — pretend money, real confidence', 'নিরাপদে অনুশীলন — নকল টাকা, আসল আত্মবিশ্বাস', 'सुरक्षित अभ्यास — नकली पैसे, असली भरोसा', 'Luyện an toàn — tiền giả, tự tin thật')}</li>
            <li><HeartHandshake aria-hidden="true" />{t('Your trusted people, one tap away', 'বিশ্বস্ত মানুষ, এক চাপেই', 'भरोसेमंद लोग, एक टैप दूर', 'Người tin cậy, chỉ một chạm')}</li>
            <li><Globe aria-hidden="true" />English · বাংলা · हिन्दी · Tiếng Việt</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main" id="main">
        <div className="auth-topbar">
          <Link to="/landing" className="auth-brand-sm" aria-label="Guidia">
            <GuidiaMark size={36} title="" />
            <span className="guidia-wordmark" style={{ fontSize: '1.35rem' }}>Guidia</span>
          </Link>
          <label className="lang-chip">
            <Globe aria-hidden="true" />
            <span className="sr-only">{t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}</span>
            <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.htmlLang}>{l.nativeName}</option>)}
            </select>
          </label>
        </div>
        <div className="auth-form-wrap route-enter"><div className="auth-card-col"><ServerCheck t={t} />{children}</div></div>
      </main>
    </div>
  );
}
