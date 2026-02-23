import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { ROLES } from '@/constants';

/**
 * Get the appropriate dashboard route based on user role
 */
export function getRoleDashboard(role: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.DOCTOR:
      return '/doctor/dashboard';
    case ROLES.PATIENT:
      return '/patient/dashboard';
    default:
      return '/patient/dashboard';
  }
}

/**
 * PublicRoute Component
 * Prevents authenticated users from accessing public routes like login/register
 * Redirects them to their appropriate dashboard instead
 */
export function PublicRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    // User is already logged in, redirect to their dashboard
    const dashboardRoute = getRoleDashboard(user.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  // User is not authenticated, allow access to public route
  return <>{children}</>;
}
