import { Link } from 'react-router-dom';
import GuidiaLogo from '../GuidiaLogo';
import { FOOTER_LINKS } from '../../data/landingContent';

export default function LandingFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', paddingTop: 56, paddingBottom: 32 }}>
      <div className="lp-container">
        <div className="grid-3" style={{ gap: 32, marginBottom: 40 }}>
          <div>
            <div className="flex items-center gap-10" style={{ marginBottom: 10 }}>
              <GuidiaLogo size={30} />
              <span style={{ fontWeight: 800, fontSize: 16 }}>Guidia</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Learn. Practice. Stay Safe.</p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 14 }}>{section}</p>
              <div className="flex-col gap-10">
                {links.map((l) => (
                  <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'var(--text-primary)' }}>{l.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>© {new Date().getFullYear()} Guidia. All rights reserved.</p>
          <Link to="/onboarding" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Start Setup</Link>
        </div>
      </div>
    </footer>
  );
}
