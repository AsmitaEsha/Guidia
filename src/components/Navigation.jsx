import React from 'react';
import { useApp } from '../context/AppStateContext';
import { Home, BookOpen, MessageCircle, ShieldCheck, BookMarked, Bell, Settings, Users, Camera, TrendingUp, Shield, AlertTriangle, User2 } from 'lucide-react';

const MAIN_NAV = (t, unreadCount) => [
  { id: 'home',       icon: <Home size={22} />,        label: t('Home', 'হোম', 'होम') },
  { id: 'learn',      icon: <BookOpen size={22} />,    label: t('Learn', 'শিখুন', 'सीखें') },
  { id: 'practice',  icon: <Users size={22} />,        label: t('Practice', 'চর্চা', 'अभ्यास') },
  { id: 'assistant', icon: <MessageCircle size={22} />,label: t('Assistant', 'সহকারী', 'सहायक') },
  { id: 'safety',    icon: <ShieldCheck size={22} />,  label: t('Safety', 'নিরাপত্তা', 'सुरक्षा') },
  { id: 'screenshot',icon: <Camera size={22} />,       label: t('UI Guide', 'UI গাইড', 'UI गाइड') },
];

const ACCOUNT_NAV = (t, unreadCount) => [
  { id: 'progress',      icon: <TrendingUp size={22} />,   label: t('My Progress', 'অগ্রগতি', 'प्रगति') },
  { id: 'memory',        icon: <BookMarked size={22} />,   label: t('Memory', 'স্মৃতি', 'स्मृति') },
  { id: 'emergency',     icon: <AlertTriangle size={22} />,label: t('Emergency', 'জরুরি', 'आपातकाल') },
  { id: 'settings',     icon: <Settings size={22} />,     label: t('Settings', 'সেটিংস', 'सेटिंग') },
];

// ── Sidebar (desktop ≥1100px) ──────────────────────────────────────
export function Sidebar() {
  const { activeTab, setActiveTab, unreadCount, t, user } = useApp();
  const main = MAIN_NAV(t, unreadCount);
  const account = ACCOUNT_NAV(t, unreadCount);

  const Item = ({ item }) => (
    <button className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
      {item.icon}
      <span>{item.label}</span>
      {item.badge > 0 && <span className="si-badge">{item.badge}</span>}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.svg" alt="Guideia" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div>
          <p style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>Guideia</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{t('Safe Digital Guide', 'নিরাপদ ডিজিটাল গাইড')}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 4px 4px' }}>
          {t('Main Menu', 'মূল মেনু')}
        </p>
        {main.map(item => <Item key={item.id} item={item} />)}

        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 4px 4px' }}>
          {t('Account', 'অ্যাকাউন্ট')}
        </p>
        {account.map(item => <Item key={item.id} item={item} />)}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <User2 size={18} color="#fff"/>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{t('Active', 'সক্রিয়', 'सक्रिय')}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Top Bar (tablet 768–1099px) ────────────────────────────────────
export function TopBar() {
  const { activeTab, setActiveTab, unreadCount, t } = useApp();
  const items = [...MAIN_NAV(t, unreadCount), ...ACCOUNT_NAV(t, unreadCount)];

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo.svg" alt="Guideia" style={{ width: 38, height: 38, borderRadius: 10 }} />
        <span style={{ fontWeight: 800, fontSize: 20 }}>Guideia</span>
      </div>
      <nav style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 15, fontWeight: 700, transition: 'all var(--tr)', cursor: 'pointer', border: 'none', flexShrink: 0,
              background: activeTab === item.id ? 'var(--blue-light)' : 'none',
              color: activeTab === item.id ? 'var(--blue)' : 'var(--text-2)'
            }}>
            {item.icon}
            {item.badge > 0 && <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
    </header>
  );
}

// ── Bottom Nav (mobile <768px) — show 5 most used ─────────────────
export function BottomNav() {
  const { activeTab, setActiveTab, unreadCount, t } = useApp();
  const items = [
    { id: 'home',      icon: <Home size={22} />,         label: t('Home', 'হোম', 'होम') },
    { id: 'learn',     icon: <BookOpen size={22} />,     label: t('Learn', 'শিখুন', 'सीखें') },
    { id: 'assistant', icon: <MessageCircle size={22} />,label: t('AI', 'এআই', 'AI') },
    { id: 'practice', icon: <Users size={22} />,         label: t('Practice', 'চর্চা', 'अभ्यास') },
    { id: 'safety',   icon: <ShieldCheck size={22} />,   label: t('Safety', 'নিরাপত্তা', 'सुरक्षा'), badge: unreadCount },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
          <div style={{ position: 'relative' }}>
            {item.icon}
            {item.badge > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>
            )}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
