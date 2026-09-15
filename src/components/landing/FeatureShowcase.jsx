import { Camera, Users, MessageCircle, ShieldAlert, BookMarked, Shield } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { FEATURE_CARDS } from '../../data/landingContent';

const ICONS = {
  screenshot: <Camera size={22} />,
  practice: <Users size={22} />,
  assistant: <MessageCircle size={22} />,
  scam: <ShieldAlert size={22} />,
  memory: <BookMarked size={22} />,
  guardian: <Shield size={22} />,
};

export default function FeatureShowcase() {
  const ref = useScrollReveal();
  return (
    <section id="features" className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">Features</div>
        <h2 className="lp-h2" style={{ marginBottom: 48, maxWidth: 560 }}>One platform. Every digital step.</h2>

        <div className="grid-3" style={{ gap: 24 }}>
          {FEATURE_CARDS.map((f) => (
            <div key={f.id} className="lp-card" style={{ padding: 28 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {ICONS[f.id]}
              </div>
              <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
