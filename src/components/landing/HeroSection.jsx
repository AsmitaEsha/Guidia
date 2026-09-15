import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, MessageSquare, ShieldCheck, BookOpen, Users } from 'lucide-react';

const CAPABILITIES = [
  { icon: <BookOpen size={16} />, label: 'Understand' },
  { icon: <Users size={16} />, label: 'Practice' },
  { icon: <ShieldCheck size={16} />, label: 'Stay Safe' },
  { icon: <MessageSquare size={16} />, label: 'Remember' },
];

// A product visualization, not decorative artwork: it shows the actual
// Understand → Explain → Safety-check flow the AI Assistant and Scam
// Protection features run, condensed into one illustrative panel.
export default function HeroSection() {
  return (
    <section className="lp-container" style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="grid-2" style={{ alignItems: 'center', gap: 56 }}>
        <div>
          <div className="lp-eyebrow">Learn. Practice. Stay Safe.</div>
          <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 22 }}>
            Confidence in every digital step.
          </h1>
          <p className="lp-sub" style={{ fontSize: 18, maxWidth: 480, marginBottom: 32 }}>
            Guidia makes everyday digital tasks easier to understand, safer to practice,
            and simpler to remember — with AI-guided support built around your pace.
          </p>
          <div className="flex gap-14" style={{ flexWrap: 'wrap' }}>
            <Link to="/register" className="lp-btn lp-btn-primary" style={{ fontSize: 17 }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-secondary" style={{ fontSize: 17 }}>
              <PlayCircle size={18} /> See How Guidia Works
            </a>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="lp-card" style={{ padding: 24 }}>
            <div className="flex items-center gap-10" style={{ marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={16} color="var(--text-secondary)" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>MyBank Alerts</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>2 minutes ago</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--surface-secondary)', padding: 14, borderRadius: 10, marginBottom: 18 }}>
              "Your account needs verification. Tap the link below to confirm your details before access is suspended."
            </p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <p className="lp-eyebrow" style={{ marginBottom: 8 }}>Guidia explains</p>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>This message is asking you to verify your account by tapping a link.</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Real banks rarely ask this way — check the sender before opening any link.</p>
            </div>
          </div>

          <div className="flex" style={{ gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {CAPABILITIES.map((c) => (
              <div key={c.label} className="flex items-center gap-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '8px 14px' }}>
                <span style={{ color: 'var(--primary)' }}>{c.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
