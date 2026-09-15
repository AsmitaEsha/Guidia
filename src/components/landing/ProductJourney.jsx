import useScrollReveal from '../../hooks/useScrollReveal';
import { JOURNEY_STEPS } from '../../data/landingContent';

export default function ProductJourney() {
  const ref = useScrollReveal();
  return (
    <section id="how-it-works" className="lp-section" style={{ background: 'var(--surface)' }}>
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">How It Works</div>
        <h2 className="lp-h2" style={{ marginBottom: 48, maxWidth: 560 }}>From uncertainty to confidence.</h2>

        <div className="lp-journey">
          {JOURNEY_STEPS.map((s, i) => (
            <div key={s.n} className="lp-journey-step">
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>{s.n}</p>
              <p style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>{s.title}</p>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.body}</p>
              {i < JOURNEY_STEPS.length - 1 && <div className="lp-journey-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
