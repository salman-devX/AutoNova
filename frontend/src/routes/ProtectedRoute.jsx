import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/States';

/**
 * Frontend-only guard for demonstrating role-based navigation.
 * NOTE: this is NOT real security — actual authorization must be enforced
 * server-side once the backend (Firebase verification + MongoDB roles) exists.
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Loading session..." className="min-h-screen" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return children;
}
