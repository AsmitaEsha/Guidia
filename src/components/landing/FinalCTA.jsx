import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function FinalCTA() {
  const ref = useScrollReveal();
  return (
    <section className="lp-final-band">
      <div className="lp-container lp-reveal" ref={ref}>
        <div className="lp-final-leaf" aria-hidden="true" />
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 34, fontWeight: 900, maxWidth: 680, margin: '0 0 8px', lineHeight: 1.12, color: 'var(--navy)' }}>
          A safer way to become more confident with technology.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 520 }}>
            Learn at your pace. Practice without pressure. Get help when you need it.
          </p>
        </div>
        <div className="flex gap-14" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="lp-btn lp-btn-primary" style={{ fontSize: 17 }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#features" className="lp-btn lp-btn-secondary" style={{ fontSize: 17 }}>
            Explore Guidia
          </a>
        </div>
      </div>
    </section>
  );
}
