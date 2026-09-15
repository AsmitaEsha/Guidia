import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
