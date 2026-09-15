import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function FinalCTA() {
  const ref = useScrollReveal();
  return (
    <section className="lp-section" style={{ background: 'var(--text-primary)', color: '#fff' }}>
      <div className="lp-container lp-reveal" ref={ref} style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, maxWidth: 620, margin: '0 auto 16px', lineHeight: 1.3 }}>
          A safer way to become more confident with technology.
        </h2>
        <p style={{ fontSize: 17, opacity: 0.75, maxWidth: 480, margin: '0 auto 32px' }}>
          Learn at your pace. Practice without pressure. Get help when you need it.
        </p>
        <div className="flex gap-14" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="lp-btn" style={{ background: '#fff', color: 'var(--text-primary)', fontSize: 17 }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#features" className="lp-btn" style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 17 }}>
            Explore Guidia
          </a>
        </div>
      </div>
    </section>
  );
}
