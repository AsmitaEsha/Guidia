import { BookMarked, PlayCircle } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import { MEMORY_PREVIEW_ITEMS } from '../../data/landingContent';

export default function MemoryBookPreview() {
  const ref = useScrollReveal();
  return (
    <section className="lp-section" style={{ background: 'var(--surface)' }}>
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="grid-2" style={{ gap: 56, alignItems: 'center' }}>
          <div className="lp-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex items-center gap-10" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <BookMarked size={18} color="var(--primary)" />
              <p style={{ fontWeight: 700, fontSize: 15 }}>Memory Book</p>
            </div>
            {MEMORY_PREVIEW_ITEMS.map((item, i) => (
              <div key={item.title} className="flex items-center gap-14" style={{ padding: '16px 24px', borderBottom: i < MEMORY_PREVIEW_ITEMS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.meta}</p>
                </div>
                <PlayCircle size={18} color="var(--text-secondary)" />
              </div>
            ))}
          </div>

          <div>
            <div className="lp-eyebrow">Memory Book</div>
            <h2 className="lp-h2" style={{ marginBottom: 18 }}>What you learn stays with you.</h2>
            <p className="lp-sub" style={{ marginBottom: 24 }}>
              Completed lessons, saved safety checks, and practice sessions are all kept
              in one personal library — revisit any of them without starting over.
            </p>
            <div className="flex gap-24" style={{ flexWrap: 'wrap' }}>
              {['Replay Guide', 'Review Lesson', 'Practice Again'].map((label) => (
                <span key={label} style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
