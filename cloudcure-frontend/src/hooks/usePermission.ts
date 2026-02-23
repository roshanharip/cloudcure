import { useAuth } from './useAuth';
import type { UserRole } from '@/types';

/**
 * Custom hook for permission checking
 * Verifies if user has required permissions
 */

export interface UsePermissionReturn {
  hasPermission: (requiredRole?: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  userRole: UserRole | undefined;
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();

  const hasPermission = (requiredRole?: UserRole): boolean => {
    if (!requiredRole) return true;
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    return user.role === requiredRole;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    hasPermission,
    hasAnyRole,
    userRole: user?.role,
  };
}
