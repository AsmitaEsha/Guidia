import useScrollReveal from '../../hooks/useScrollReveal';

export default function TrustStatement() {
  const ref = useScrollReveal();
  return (
    <section className="lp-container lp-reveal" ref={ref} style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
      <h2 className="lp-h2" style={{ maxWidth: 640, margin: '0 auto 16px' }}>
        Technology should build confidence, not confusion.
      </h2>
      <p className="lp-sub" style={{ maxWidth: 560, margin: '0 auto' }}>
        Guidia is designed around your pace, your understanding, and your safety —
        rather than expecting you to adapt to complicated technology.
      </p>
    </section>
  );
}
