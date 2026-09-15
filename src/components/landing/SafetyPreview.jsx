import { AlertTriangle } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { SAFETY_DEMO } from '../../data/landingContent';

export default function SafetyPreview() {
  const ref = useScrollReveal();
  return (
    <section id="safety" className="lp-section" style={{ background: 'var(--surface)' }}>
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="grid-2" style={{ gap: 56, alignItems: 'center' }}>
          <div className="lp-card" style={{ padding: 28, order: 0 }}>
            <div className="flex items-center gap-12" style={{ marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={19} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>Something deserves a closer look</p>
                <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700 }}>Risk: {SAFETY_DEMO.risk}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Why</p>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{SAFETY_DEMO.reason}</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>{SAFETY_DEMO.guidance}</p>
            <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
              {SAFETY_DEMO.actions.map((a, i) => (
                <button key={a} className={i === 0 ? 'lp-btn lp-btn-primary' : 'lp-btn lp-btn-secondary'} style={{ fontSize: 14, padding: '10px 18px' }}>{a}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="lp-eyebrow">Scam Protection</div>
            <h2 className="lp-h2" style={{ marginBottom: 18 }}>A second opinion when it matters.</h2>
            <p className="lp-sub" style={{ marginBottom: 20 }}>
              Guidia helps you pause before acting on suspicious messages, unknown links,
              unexpected payment requests, fake verification requests, and unusual account activity.
            </p>
            <p className="lp-sub">
              Explanations are calm and specific — never a giant red warning that just says "danger."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
