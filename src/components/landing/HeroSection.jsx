import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, ShieldCheck, Users } from 'lucide-react';
import oldMan from '../../../title_banner/old_man.png';

const CAPABILITIES = [
  { icon: <Users size={42} />, label: 'Understand', body: 'Clear explanations for unfamiliar screens.' },
  { icon: <ShieldCheck size={42} />, label: 'Practice', body: 'Try real tasks in a safe space.' },
  { icon: <Heart size={42} />, label: 'Stay Safe', body: 'Spot risky messages before acting.' },
  { icon: <BookOpen size={42} />, label: 'Remember', body: 'Save what you learn for later.' },
];

export default function HeroSection() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-stage">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-photo" aria-label="Older adult using a tablet">
            <img src={oldMan} alt="Older adult smiling while using a tablet" />
            <div className="lp-photo-note">It's never too late to learn something new.</div>
          </div>

          <div className="lp-hero-copy">
            <h1>Confident online living, at your pace.</h1>
            <p>
              Guidia helps older adults learn digital skills, stay safe online, and feel more connected — with friendly support every step of the way.
            </p>
            <div className="lp-hero-actions">
              <Link to="/onboarding" className="lp-btn lp-btn-primary">
                Start Learning Today <ArrowRight size={19} />
              </Link>
              <a href="#features" className="lp-btn lp-btn-secondary">
                Explore the Guides
              </a>
            </div>
            <p className="lp-hand-note">New skills. Brighter days.</p>
          </div>
        </div>
      </div>
      <div className="lp-container lp-benefit-section">
        <div className="lp-proof-strip" aria-label="Guidia strengths">
          {CAPABILITIES.map((c) => (
            <div key={c.label} className="lp-proof-item">
              <span>{c.icon}</span>
              <div>
                <strong>{c.label}</strong>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
