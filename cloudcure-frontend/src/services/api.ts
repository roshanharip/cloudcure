import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_CONFIG } from '@/constants';
import { logger } from '@/utils/logger';
import { setCredentials, logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import type { AuthResponse } from '@/types';

/**
 * Base RTK Query API
 * Configured with authentication token injection and error handling
 */

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,

  credentials: 'include', // Include cookies for refresh token
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const isRefreshRequest = typeof args === 'string'
    ? args === '/auth/refresh'
    : args.url === '/auth/refresh';

  if (result.error?.status === 401 && !isRefreshRequest) {
    logger.warn('Access token expired, attempting to refresh');

    // Try to refresh the token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      logger.info('Token refreshed successfully');
      // Update the store with the new token
      const { accessToken, user } = refreshResult.data as AuthResponse;
      if (user) {
        api.dispatch(setCredentials({ accessToken, user }));
      } else {
        logger.warn('Token refresh successful but no user data received');
      }

      // Retry the original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      logger.error('Token refresh failed, logging out');
      api.dispatch(logout());
    }
  }

  return result;
};

// Export baseQuery for use in other API files
export { baseQuery };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'Doctor', 'Patient', 'MedicalRecord', 'Prescription', 'Stats', 'Appointment', 'Message'],
  endpoints: () => ({}),
});
