import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { ROUTES } from '@/constants';
import { logger } from '@/utils/logger';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole;
}

/**
 * Protected Route Component
 * Handles authentication and permission checks
 */

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission } = usePermission();

  if (!isAuthenticated) {
    logger.warn('Unauthorized access attempt - not authenticated');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    logger.warn('Unauthorized access attempt - insufficient permissions', {
      userRole: user?.role,
      requiredRole,
    });
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
}
