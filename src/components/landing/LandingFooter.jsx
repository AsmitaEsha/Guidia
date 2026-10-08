import { Link } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { LANDING_LINKS } from '../../data/landing';
import { GuidiaMark } from '../GuidiaLogo';
import { LanguagePicker } from './LandingNavbar';

export default function LandingFooter() {
  const { t } = usePreferences();
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-grid">
        <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
          <span className="brand"><GuidiaMark size={36} title="" /><span className="brand-name">Guidia</span></span>
          <p className="text-muted">{t('Understand technology. Practise safely. Stay independent.', 'প্রযুক্তি বুঝুন। নিরাপদে অনুশীলন করুন। স্বাধীন থাকুন।', 'तकनीक समझें। सुरक्षित अभ्यास करें। आत्मनिर्भर रहें।', 'Hiểu công nghệ. Luyện tập an toàn. Sống tự lập.')}</p>
          <LanguagePicker />
        </div>
        <nav aria-label={t('Product', 'পণ্য', 'उत्पाद', 'Sản phẩm')}>
          <p className="lp-footer-h">{t('Product', 'পণ্য', 'उत्पाद', 'Sản phẩm')}</p>
          <ul>{LANDING_LINKS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{t(...label)}</a></li>)}</ul>
        </nav>
        <nav aria-label={t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}>
          <p className="lp-footer-h">Guidia</p>
          <ul>
            <li><Link to="/register">{t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Link></li>
            <li><Link to="/login">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Link></li>
            <li><Link to="/showcase">{t('Product showcase', 'পণ্য প্রদর্শনী', 'उत्पाद प्रदर्शन', 'Trình diễn sản phẩm')}</Link></li>
            <li><a href="#families">{t('Help for families', 'পরিবারের জন্য', 'परिवारों के लिए', 'Dành cho gia đình')}</a></li>
          </ul>
        </nav>
      </div>
      <div className="lp-container lp-footer-base">
        <p>© {new Date().getFullYear()} Guidia</p>
        <p className="text-subtle">{t('Practice apps are simulations for learning and are not affiliated with the real apps.', 'অনুশীলন অ্যাপগুলো শেখার জন্য সিমুলেশন, আসল অ্যাপের সাথে যুক্ত নয়।', 'अभ्यास ऐप सीखने के लिए सिमुलेशन हैं, असली ऐप से जुड़े नहीं।', 'Ứng dụng luyện tập là mô phỏng để học, không liên kết với ứng dụng thật.')}</p>
      </div>
    </footer>
  );
}
