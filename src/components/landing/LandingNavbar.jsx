import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import GuidiaLogo from '../GuidiaLogo';
import { NAV_LINKS } from '../../data/landingContent';

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lp-navbar">
      <div className="lp-container flex items-center justify-between" style={{ height: 82 }}>
        <Link to="/landing" className="lp-brand" style={{ color: 'var(--text-primary)' }}>
          <GuidiaLogo size={44} />
          <span>
            <strong>Guidia</strong>
            <small>Learn. Practice. Stay Safe.</small>
          </span>
        </Link>

        <nav className="flex items-center gap-32" style={{ display: 'flex' }} aria-label="Primary">
          <div className="lp-desktop-nav flex items-center gap-24">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="lp-navlink" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15 }}>
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="lp-desktop-nav flex items-center gap-12">
          <button className="lp-search-btn" aria-label="Search">
            <Search size={24} />
          </button>
          <Link to="/onboarding" className="lp-btn lp-btn-primary" style={{ padding: '10px 20px', fontSize: 15 }}>Get Started</Link>
        </div>

        <button
          className="lp-mobile-menu-btn btn-icon"
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', padding: 8 }}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lp-mobile-drawer" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>
              {l.label}
            </a>
          ))}
          <div className="flex gap-12" style={{ marginTop: 8 }}>
            <Link to="/onboarding" className="lp-btn lp-btn-primary" style={{ flex: 1 }} onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
