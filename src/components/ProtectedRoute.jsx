import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppStateContext';

export default function ProtectedRoute({ children, role }) {
  const { status, user } = useAuth();
  const { onboardingDone } = useApp();
  const location = useLocation();

  if (role && status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!role && !onboardingDone) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  if (role && status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
