import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { SCREENSHOT_DEMO } from '../../data/landingContent';

export default function ScreenshotDemo() {
  const ref = useScrollReveal();
  const [selected, setSelected] = useState(null);

  return (
    <section className="lp-section" style={{ background: 'var(--surface)' }}>
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-eyebrow">AI Screenshot Understanding</div>
        <h2 className="lp-h2" style={{ marginBottom: 12, maxWidth: 600 }}>When a screen feels unfamiliar, ask Guidia.</h2>
        <p className="lp-sub" style={{ maxWidth: 560, marginBottom: 44 }}>
          Upload a screenshot of anything confusing — Guidia looks at it and explains
          what matters, in plain language.
        </p>

        <div className="grid-2" style={{ gap: 0, alignItems: 'stretch' }}>
          <div className="lp-split-left" style={{ background: 'var(--surface-secondary)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example screenshot</p>
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 18, border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-10" style={{ marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={15} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{SCREENSHOT_DEMO.messageSender}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{SCREENSHOT_DEMO.messageTime}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{SCREENSHOT_DEMO.messageBody}"</p>
            </div>
          </div>

          <div className="lp-split-right" style={{ background: 'var(--text-primary)', color: '#fff', padding: 32 }}>
            <p className="lp-eyebrow" style={{ color: '#9fb8b6', marginBottom: 8 }}>What you're seeing</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 22 }}>{SCREENSHOT_DEMO.whatYouSee}</p>

            <p className="lp-eyebrow" style={{ color: '#9fb8b6', marginBottom: 8 }}>What to check</p>
            <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 26, lineHeight: 1.6 }}>{SCREENSHOT_DEMO.whatToCheck}</p>

            <p className="lp-eyebrow" style={{ color: '#9fb8b6', marginBottom: 10 }}>What should I do?</p>
            <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
              {SCREENSHOT_DEMO.actions.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelected(a)}
                  style={{
                    padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: selected === a ? '#fff' : 'transparent',
                    color: selected === a ? 'var(--text-primary)' : '#fff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
