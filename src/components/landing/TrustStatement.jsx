import useScrollReveal from '../../hooks/useScrollReveal';

export default function TrustStatement() {
  const ref = useScrollReveal();
  return (
    <section className="lp-container lp-reveal" ref={ref} style={{ paddingTop: 24, paddingBottom: 28 }}>
      <div className="lp-card" style={{ padding: '28px 34px', textAlign: 'center', background: 'linear-gradient(135deg,#fffdf8,#e9f6ef)' }}>
        <h2 className="lp-h2" style={{ maxWidth: 680, margin: '0 auto 12px' }}>
          Technology should build confidence, not confusion.
        </h2>
        <p className="lp-sub" style={{ maxWidth: 640, margin: '0 auto' }}>
          Guidia is designed around your pace, your understanding, and your safety - rather than expecting you to adapt to complicated technology.
        </p>
      </div>
    </section>
  );
}
