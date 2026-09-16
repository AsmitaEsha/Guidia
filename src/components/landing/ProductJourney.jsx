import { BarChart3, CheckSquare, UserRound } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { JOURNEY_STEPS } from '../../data/landingContent';

const STEP_ICONS = [<UserRound size={30} />, <CheckSquare size={30} />, <BarChart3 size={30} />];

export default function ProductJourney() {
  const ref = useScrollReveal();
  return (
    <section id="how-it-works" className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">How It Works</div>
        <h2 className="lp-h2" style={{ marginBottom: 22, maxWidth: 560 }}>From uncertainty to confidence.</h2>

        <div className="lp-journey">
          {JOURNEY_STEPS.map((s, i) => (
            <div key={s.n} className="lp-journey-step lp-card" style={{ padding: 20, background: 'linear-gradient(135deg,#fff7f1,#fffdf8)' }}>
              <div className="flex items-center gap-12" style={{ marginBottom: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 999, background: 'var(--coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{i + 1}</span>
                <span style={{ width: 58, height: 58, borderRadius: 14, background: '#ffe2da', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {STEP_ICONS[i % STEP_ICONS.length]}
                </span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{s.title}</p>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
