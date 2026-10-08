import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Globe, LifeBuoy, LogOut, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useNotifications } from '../../context/NotificationContext';
import { useVoice } from '../../context/VoiceContext';
import { LANGUAGES } from '../../config/languages';
import { useOnline, useScrolled } from '../../hooks/useOnline';
import { announce } from '../../utils/announce';
import { ALL_NAV, navFor, navForPath } from './navigation';
import { GuidiaMark } from '../GuidiaLogo';
import { Avatar, Button, IconButton, Sheet } from '../ui';
import VoiceControl from '../voice/VoiceControl';
import AppErrorBoundary from '../AppErrorBoundary';

function Brand({ t, home = 'home' }) {
  return (
    <Link to={`/app/${home}`} className="brand" aria-label={t('Guidia — home', 'Guidia — হোম', 'Guidia — होम', 'Guidia — trang chủ')}>
      <GuidiaMark size={44} title="" />
      <span>
        <span className="brand-name">Guidia</span>
        <span className="brand-tag">{t('Your calm digital companion', 'আপনার শান্ত ডিজিটাল সঙ্গী', 'आपका शांत डिजिटल साथी', 'Người bạn số điềm tĩnh')}</span>
      </span>
    </Link>
  );
}

function NavItem({ item, t, count = 0, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink to={`/app/${item.to}`} className="nav-link" onClick={onNavigate}>
      <Icon aria-hidden="true" />
      <span>{t(...item.label)}</span>
      {count > 0 && <span className="count-badge" aria-label={t(`${count} unread`, `${count}টি না-পড়া`, `${count} अपठित`, `${count} chưa đọc`)}>{count > 99 ? '99+' : count}</span>}
    </NavLink>
  );
}

function LanguageSelect({ t, language, setLanguage, className }) {
  return (
    <label className={`lang-chip ${className || ''}`}>
      <Globe aria-hidden="true" />
      <span className="sr-only">{t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}</span>
      <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value).catch(() => {})}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.htmlLang}>{l.nativeName}</option>)}
      </select>
    </label>
  );
}

function OfflineBanner({ t }) {
  const online = useOnline();
  const [showBack, setShowBack] = useState(false);
  const wasOffline = useRef(false);
  useEffect(() => {
    if (!online) { wasOffline.current = true; return undefined; }
    if (!wasOffline.current) return undefined;
    wasOffline.current = false;
    setShowBack(true);
    const id = setTimeout(() => setShowBack(false), 4000);
    return () => clearTimeout(id);
  }, [online]);

  if (online && !showBack) return null;
  return (
    <div className={`offline-banner ${online ? 'is-back' : ''}`} role="status">
      {online ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
      <p>
        {online
          ? t("You're back online.", 'আবার অনলাইনে ফিরেছেন।', 'आप फिर से ऑनलाइन हैं।', 'Bạn đã có mạng trở lại.')
          : t("You're offline. You can keep reading; anything that needs the internet will wait until you're connected.", 'আপনি অফলাইনে আছেন। পড়তে থাকুন; ইন্টারনেট লাগে এমন কাজ সংযোগ ফিরলে হবে।', 'आप ऑफ़लाइन हैं। पढ़ते रहें; इंटरनेट वाले काम कनेक्शन लौटने पर होंगे।', 'Bạn đang ngoại tuyến. Bạn vẫn có thể đọc; việc cần Internet sẽ chờ đến khi có mạng.')}
      </p>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = usePreferences();
  const { unreadCount } = useNotifications();
  const { voiceControls } = useVoice();
  const [moreOpen, setMoreOpen] = useState(false);
  const scrolled = useScrolled();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const current = navForPath(location.pathname);
  const nav = navFor(user?.role);
  const { groups: NAV_GROUPS, utility: UTILITY_NAV, help: HELP_ITEM, bottom: BOTTOM_NAV, more: MORE_NAV } = nav;

  // The signed-in product scales with the user's chosen text size.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scale = 'user';
    return () => { delete root.dataset.scale; };
  }, []);

  // New page: stop speaking, start at the top, move focus
  // to the content and tell screen-reader users where they are.
  const stopVoice = voiceControls.stop;
  useEffect(() => {
    stopVoice();
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
    if (current) announce(t(...current.label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const signOut = async () => {
    await logout().catch(() => {});
    navigate('/login', { replace: true });
  };

  const name = user?.fullName?.replace(/\s*\(.*?\)\s*/g, ' ').trim() || '';
  const moreActive = MORE_NAV.includes(current?.to);

  return (
    <div className="shell">
      <a href="#main" className="skip-link">{t('Skip to content', 'মূল অংশে যান', 'मुख्य भाग पर जाएं', 'Chuyển đến nội dung')}</a>

      <aside className="sidebar" aria-label={t('Main menu', 'মূল মেনু', 'मुख्य मेनू', 'Menu chính')}>
        <Brand t={t} home={nav.home} />
        {HELP_ITEM && <Button variant="help" block icon={LifeBuoy} to="/app/help" className="sidebar-help">{t(...HELP_ITEM.label)}</Button>}
        <nav className="nav" aria-label={t('Sections', 'বিভাগ', 'हिस्से', 'Mục')}>
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.id} role="group" aria-labelledby={`nav-${group.id}`}>
              <p className="nav-group-label" id={`nav-${group.id}`}>{t(...group.label)}</p>
              {group.items.map((item) => <NavItem key={item.to} item={item} t={t} />)}
            </div>
          ))}
          <div className="nav-group" role="group" aria-label={t('More', 'আরও', 'और', 'Thêm')}>
            {UTILITY_NAV.map((item) => <NavItem key={item.to} item={item} t={t} count={item.to === 'notifications' ? unreadCount : 0} />)}
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <Avatar name={name} />
            <span className="user-chip-text">
              <span className="user-chip-name truncate">{name}</span>
              <span className="user-chip-email truncate">{user?.email}</span>
            </span>
            <IconButton icon={LogOut} size="sm" label={t('Sign out', 'সাইন আউট', 'साइन आउट', 'Đăng xuất')} onClick={signOut} />
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar" data-scrolled={scrolled}>
          <Brand t={t} home={nav.home} />
          <div className="topbar-context" aria-hidden="true">
            {current && <span className="topbar-crumb">{t(...(current.group?.label || ['Guidia']))}</span>}
            {current && <span className="topbar-title">{t(...current.label)}</span>}
          </div>
          <div className="topbar-actions">
            <LanguageSelect t={t} language={language} setLanguage={setLanguage} className="topbar-lang" />
            <VoiceControl />
            <Link to="/app/notifications" className="btn btn-ghost btn-icon bell" aria-label={`${t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}${unreadCount ? ` (${unreadCount})` : ''}`}>
              <Bell aria-hidden="true" />
              {unreadCount > 0 && <span className="count-badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
            {HELP_ITEM && (
              <Button variant="help" size="sm" icon={LifeBuoy} to="/app/help" className="topbar-help">
                <span className="help-label">{t(...HELP_ITEM.short)}</span>
              </Button>
            )}
          </div>
        </header>

        <OfflineBanner t={t} />

        <main id="main" className="main-content" tabIndex={-1} ref={mainRef}>
          <AppErrorBoundary key={location.pathname} homeTo={`/app/${nav.home}`}>
            <div key={location.pathname} className="route-enter">
              <Outlet />
            </div>
          </AppErrorBoundary>
        </main>
      </div>

      <nav className="bottom-nav" aria-label={t('Main menu', 'মূল মেনু', 'मुख्य मेनू', 'Menu chính')}>
        {BOTTOM_NAV.map((key) => {
          const item = ALL_NAV.find((i) => i.to === key);
          const Icon = item.icon;
          if (key === 'ask') {
            return (
              <NavLink key={key} to={`/app/${key}`} className="nav-ask">
                <span className="nav-ask-bubble"><Icon aria-hidden="true" /></span>
                <span>{t(...(item.short || item.label))}</span>
              </NavLink>
            );
          }
          return (
            <NavLink key={key} to={`/app/${key}`}>
              <Icon aria-hidden="true" />
              <span>{t(...(item.short || item.label))}</span>
            </NavLink>
          );
        })}
        <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen} aria-current={moreActive ? 'page' : undefined}>
          <Menu aria-hidden="true" />
          <span>{t('More', 'আরও', 'और', 'Thêm')}</span>
          {unreadCount > 0 && <span className="count-badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t('More', 'আরও', 'और', 'Thêm')}>
        <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
          <div className="more-grid">
            {MORE_NAV.map((key) => {
              const item = ALL_NAV.find((i) => i.to === key);
              const Icon = item.icon;
              const count = key === 'notifications' ? unreadCount : 0;
              return (
                <NavLink key={key} to={`/app/${key}`} className="more-tile" onClick={() => setMoreOpen(false)}>
                  <Icon aria-hidden="true" style={key === 'help' ? { color: 'var(--coral-700)' } : undefined} />
                  <span>{t(...item.label)}</span>
                  {count > 0 && <span className="count-badge">{count}</span>}
                </NavLink>
              );
            })}
          </div>
          <div className="row-between card card-tint" style={{ padding: 'var(--s-3) var(--s-4)' }}>
            <span className="text-strong">{t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}</span>
            <LanguageSelect t={t} language={language} setLanguage={setLanguage} />
          </div>
          <div className="row" style={{ '--gap': 'var(--s-3)' }}>
            <Avatar name={name} />
            <span className="grow stack" style={{ '--gap': 0 }}>
              <span className="text-strong truncate">{name}</span>
              <span className="text-subtle truncate">{user?.email}</span>
            </span>
          </div>
          <Button variant="quiet" block icon={LogOut} onClick={signOut}>{t('Sign out', 'সাইন আউট', 'साइन आउट', 'Đăng xuất')}</Button>
        </div>
      </Sheet>
    </div>
  );
}

