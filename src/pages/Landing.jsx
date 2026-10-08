import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import { FinalCTA, HowItWorks, LiteracySection, MoatSection, TrustStatement } from '../components/landing/LandingStory';
import LandingFooter from '../components/landing/LandingFooter';
import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

// The public site. Always the light Guidia palette, whatever the visitor's
// app theme; every interactive demo is labelled as a guided demo. A first
// visit goes through the welcome setup first, so the page already speaks the
// visitor's language at their text size and pace.
export default function Landing() {
  const { t, setupDone, prefs } = usePreferences();
  const [params] = useSearchParams();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scale = 'landing';
    // Large text needs the compact (menu) navbar sooner.
    root.dataset.textSize = prefs.fontSize >= 23 ? 'large' : 'normal';
    return () => { delete root.dataset.scale; delete root.dataset.textSize; };
  }, [prefs.fontSize]);

  if (!setupDone && params.get('setup') !== 'skip') return <Navigate to="/welcome" replace />;
  return (
    <div className="landing" data-gx-theme="light">
      <a href="#main" className="skip-link">{t('Skip to content', 'মূল অংশে যান', 'मुख्य भाग पर जाएं', 'Chuyển đến nội dung')}</a>
      <LandingNavbar />
      <main id="main">
        <LandingHero />
        <TrustStatement />
        <HowItWorks />
        <LandingFeatures />
        <LiteracySection />
        <MoatSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
