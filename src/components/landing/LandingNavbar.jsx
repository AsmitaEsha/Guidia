import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useScrolled } from '../../hooks/useOnline';
import { LANGUAGES } from '../../config/languages';
import { GuidiaMark } from '../GuidiaLogo';
import { LANDING_LINKS } from '../../data/landing';
import { Button, IconButton, Sheet } from '../ui';

export function LanguagePicker({ className }) {
  const { t, language, setLanguage } = usePreferences();
  return (
    <label className={`lang-chip ${className || ''}`}>
      <Globe aria-hidden="true" />
      <span className="sr-only">{t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}</span>
      <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.htmlLang}>{l.nativeName}</option>)}
      </select>
    </label>
  );
}

export default function LandingNavbar() {
  const { t } = usePreferences();
  const { status } = useAuth();
  const scrolled = useScrolled(8);
  const [open, setOpen] = useState(false);
  const signedIn = status === 'authenticated';

  return (
    <header className="lp-nav" data-scrolled={scrolled}>
      <div className="lp-container lp-nav-inner">
        <Link to="/landing" className="brand" aria-label="Guidia">
          <GuidiaMark size={40} title="" />
          <span className="brand-name">Guidia</span>
        </Link>
        <nav className="lp-nav-links" aria-label={t('Sections', 'বিভাগ', 'हिस्से', 'Mục')}>
          {LANDING_LINKS.map(([id, label]) => <a key={id} href={`#${id}`}>{t(...label)}</a>)}
        </nav>
        <div className="lp-nav-actions">
          <LanguagePicker className="hide-md" />
          {signedIn ? (
            <Button size="sm" arrow to="/">{t('Open Guidia', 'Guidia খুলুন', 'Guidia खोलें', 'Mở Guidia')}</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login" className="hide-sm">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Button>
              <Button size="sm" to="/register">{t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Button>
            </>
          )}
          <IconButton icon={Menu} className="show-md" label={t('Menu', 'মেনু', 'मेनू', 'Menu')} onClick={() => setOpen(true)} aria-expanded={open} />
        </div>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Guidia">
        <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
          {LANDING_LINKS.map(([id, label]) => <a key={id} href={`#${id}`} className="lp-sheet-link" onClick={() => setOpen(false)}>{t(...label)}</a>)}
          <div className="row-between card card-tint" style={{ padding: 'var(--s-3) var(--s-4)', marginTop: 'var(--s-2)' }}>
            <span className="text-strong">{t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}</span>
            <LanguagePicker />
          </div>
          {!signedIn && <Button variant="secondary" block to="/login">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Button>}
          <Button block to={signedIn ? '/' : '/register'}>{signedIn ? t('Open Guidia', 'Guidia খুলুন', 'Guidia खोलें', 'Mở Guidia') : t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Button>
        </div>
      </Sheet>
    </header>
  );
}
