import { api } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, BaseResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Authentication API Slice
 * Handles login, register, logout, and token refresh
 */

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<BaseResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logger.info('Login successful', { user: data.data.user.email });
        } catch (error) {
          logger.error('Login failed', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<BaseResponse<AuthResponse>, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logger.info('Registration successful', { user: data.data.user.email });
        } catch (error) {
          logger.error('Registration failed', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<BaseResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Logout successful');
        } catch (error) {
          logger.error('Logout failed', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<BaseResponse<AuthResponse>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Token refreshed');
        } catch (error) {
          logger.debug('Token refresh failed (user may need to login)', error);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useRefreshTokenMutation } =
  authApi;
