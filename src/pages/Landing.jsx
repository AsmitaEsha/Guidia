import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import { FinalCTA, HowItWorks, LiteracySection, MoatSection, TrustStatement } from '../components/landing/LandingStory';
import LandingFooter from '../components/landing/LandingFooter';
import { usePreferences } from '../context/PreferencesContext';

// The public site. Always the light Guidia palette, whatever the visitor's
// app theme; every interactive demo is labelled as a guided demo.
export default function Landing() {
  const { t } = usePreferences();
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
