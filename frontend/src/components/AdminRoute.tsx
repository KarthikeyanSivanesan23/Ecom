import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Demo mode: allow access without login for testing
  // Remove this check in production
  const isDemoMode = !user && localStorage.getItem('demoAdmin') === 'true';
  
  if (isDemoMode) {
    return <>{children}</>;
  }
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
