import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustStatement from '../components/landing/TrustStatement';
import ProductJourney from '../components/landing/ProductJourney';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import ScreenshotDemo from '../components/landing/ScreenshotDemo';
import SafePracticePreview from '../components/landing/SafePracticePreview';
import SafetyPreview from '../components/landing/SafetyPreview';
import GuardianPreview from '../components/landing/GuardianPreview';
import MemoryBookPreview from '../components/landing/MemoryBookPreview';
import AccessibilitySection from '../components/landing/AccessibilitySection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

// The public marketing site. Deliberately a distinct, restrained light
// identity (.landing-page tokens in index.css) from the authenticated
// dashboard's dark indigo theme — see that file's comment for why.
export default function Landing() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <HeroSection />
      <TrustStatement />
      <ProductJourney />
      <FeatureShowcase />
      <ScreenshotDemo />
      <SafePracticePreview />
      <SafetyPreview />
      <GuardianPreview />
      <MemoryBookPreview />
      <AccessibilitySection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
