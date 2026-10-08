import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GuidiaMark } from './GuidiaLogo';

export function FullPageSpinner() {
  return (
    <div className="gx" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} role="status" aria-live="polite">
      <div className="stack" style={{ alignItems: 'center', '--gap': '16px' }}>
        <span className="pop" style={{ animation: 'gx-float 2.4s var(--ease-in-out) infinite' }}><GuidiaMark size={56} title="" /></span>
        <span className="sr-only">Loading Guidia</span>
      </div>
    </div>
  );
}

// Authentication is enforced here AND on every API route; this only
// decides what to render. Onboarding state comes from the account.
export default function ProtectedRoute({ children, role, requireOnboarding = true }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user?.role !== role) return <Navigate to="/app/home" replace />;
  if (requireOnboarding && !user?.preference?.onboardingDone && user?.role !== 'ADMIN') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
