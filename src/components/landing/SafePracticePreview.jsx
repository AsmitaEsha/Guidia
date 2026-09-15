import { ShieldCheck } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { PRACTICE_DEMO } from '../../data/landingContent';

export default function SafePracticePreview() {
  const ref = useScrollReveal();
  return (
    <section className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="grid-2" style={{ gap: 56, alignItems: 'center' }}>
          <div>
            <div className="lp-eyebrow">Safe Practice</div>
            <h2 className="lp-h2" style={{ marginBottom: 18 }}>Learn without the consequences.</h2>
            <p className="lp-sub" style={{ marginBottom: 20 }}>
              Guidia provides simulated environments where you can practice messaging,
              social media, email, mobile banking, payments, and phone calls — with
              nothing real ever at risk.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['No real messages are sent', 'No real money ever moves', 'No real accounts are touched'].map((line) => (
                <li key={line} className="flex items-center gap-10">
                  <ShieldCheck size={17} color="var(--success)" />
                  <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ maxWidth: 340, margin: '0 auto', width: '100%' }}>
            <div className="lp-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', textAlign: 'center', padding: '8px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em' }}>
                PRACTICE MODE — NO REAL TRANSACTION
              </div>
              <div style={{ padding: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>Before you continue</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Recipient</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{PRACTICE_DEMO.recipient}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Amount</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{PRACTICE_DEMO.amount}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{PRACTICE_DEMO.question}</p>
                <div className="flex-col gap-10">
                  <button className="lp-btn lp-btn-primary" style={{ width: '100%' }}>Continue</button>
                  <button className="lp-btn lp-btn-secondary" style={{ width: '100%' }}>Ask Family</button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 8 }}>Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
