import { Check } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { ACCESSIBILITY_CONTROLS, COMFORT_STATES } from '../../data/landingContent';

export default function AccessibilitySection() {
  const ref = useScrollReveal();
  return (
    <section id="accessibility" className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">Accessibility</div>
        <h2 className="lp-h2" style={{ marginBottom: 12, maxWidth: 560 }}>Technology that adapts to you.</h2>
        <p className="lp-sub" style={{ maxWidth: 560, marginBottom: 44 }}>
          Guidia adapts its presentation rather than expecting you to adapt to it.
        </p>

        <div className="grid-3" style={{ gap: 20, marginBottom: 56 }}>
          {ACCESSIBILITY_CONTROLS.map((c) => (
            <div key={c.label} className="flex items-start gap-12" style={{ padding: 18, border: '1px solid var(--border)', borderRadius: 12 }}>
              <Check size={17} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{c.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lp-card" style={{ padding: 32 }}>
          <p className="lp-eyebrow">Your pace matters</p>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Guidia adjusts to how you're feeling, not just what you're doing.</p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 560 }}>
            The interface becomes more spacious, slower, and more reassuring when you
            need additional support — no dramatic changes, just quieter, calmer pacing.
          </p>
          <div className="grid-3" style={{ gap: 16 }}>
            {COMFORT_STATES.map((s) => (
              <div key={s.id} style={{ padding: 16, borderRadius: 10, background: 'var(--surface-secondary)' }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
