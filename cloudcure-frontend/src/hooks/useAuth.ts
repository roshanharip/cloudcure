import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './useRedux';
import { setCredentials, logout as logoutAction } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/services/authApi';
import { ROUTES } from '@/constants';
import { logger } from '@/utils/logger';
import type { User } from '@/types';

/**
 * Custom hook for authentication logic
 * Provides auth state and actions
 */

export interface UseAuthReturn {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const login = useCallback(
    (user: User, token: string) => {
      dispatch(setCredentials({ user, accessToken: token }));
      logger.info('User logged in via hook', { userId: user._id });
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logoutAction());
      void navigate(ROUTES.LOGIN);
      logger.info('User logged out via hook');
    } catch (error) {
      logger.error('Logout error', error);
      // Force logout even if API call fails
      dispatch(logoutAction());
      void navigate(ROUTES.LOGIN);
    }
  }, [dispatch, navigate, logoutMutation]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
