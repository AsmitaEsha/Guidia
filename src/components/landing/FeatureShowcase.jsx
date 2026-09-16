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

const CARD_TONES = {
  screenshot: { bg: '#fff0eb', icon: '#ffe0d8', color: '#d94b30' },
  practice: { bg: '#eaf7ee', icon: '#cfeedd', color: '#00625d' },
  assistant: { bg: '#fff3d4', icon: '#f8d774', color: '#8d5b00' },
  scam: { bg: '#e8f4fb', icon: '#c6e4f6', color: '#0b5b8f' },
  memory: { bg: '#f3f7e6', icon: '#dfecc0', color: '#55721f' },
  guardian: { bg: '#f1efff', icon: '#ddd8ff', color: '#4f46a8' },
};

export default function FeatureShowcase() {
  const ref = useScrollReveal();
  return (
    <section id="features" className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">Features</div>
        <h2 className="lp-h2" style={{ marginBottom: 24, maxWidth: 560 }}>One platform. Every digital step.</h2>

        <div className="grid-3" style={{ gap: 24 }}>
          {FEATURE_CARDS.map((f) => {
            const tone = CARD_TONES[f.id] || CARD_TONES.practice;
            return (
              <div key={f.id} className="lp-card" style={{ padding: 28, background: tone.bg, minHeight: 190 }}>
                <div style={{ width: 66, height: 66, borderRadius: 999, background: tone.icon, color: tone.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  {ICONS[f.id]}
                </div>
                <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, color: 'var(--navy)' }}>{f.title}</p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
