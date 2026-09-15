import { Shield, Check, AlertTriangle, UserCheck } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { GUARDIAN_PREVIEW_ITEMS } from '../../data/landingContent';

const TONE_ICON = { warning: <AlertTriangle size={16} />, success: <Check size={16} />, neutral: <UserCheck size={16} /> };
const TONE_COLOR = { warning: 'var(--warning)', success: 'var(--success)', neutral: 'var(--primary)' };
const TONE_BG = { warning: 'var(--warning-light)', success: 'var(--success-light)', neutral: 'var(--primary-light)' };

export default function GuardianPreview() {
  const ref = useScrollReveal();
  return (
    <section id="families" className="lp-section">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="grid-2" style={{ gap: 56, alignItems: 'center' }}>
          <div>
            <div className="lp-eyebrow">Family Guardian</div>
            <h2 className="lp-h2" style={{ marginBottom: 18 }}>Confidence doesn't have to mean going alone.</h2>
            <p className="lp-sub" style={{ marginBottom: 16 }}>
              A trusted family member can be brought in for extra reassurance on
              sensitive actions — always with your explicit consent.
            </p>
            <p className="lp-sub">
              This is support, not surveillance. Guidia is built to make you more
              independent, not to hand control to someone else.
            </p>
          </div>

          <div className="lp-card" style={{ padding: 24 }}>
            <div className="flex items-center gap-10" style={{ marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={17} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Guardian Dashboard</p>
            </div>
            <div className="flex-col gap-12">
              {GUARDIAN_PREVIEW_ITEMS.map((item) => (
                <div key={item.detail} className="flex items-center gap-12" style={{ padding: '12px 14px', borderRadius: 10, background: TONE_BG[item.tone] }}>
                  <span style={{ color: TONE_COLOR[item.tone], flexShrink: 0 }}>{TONE_ICON[item.tone]}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: TONE_COLOR[item.tone] }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
