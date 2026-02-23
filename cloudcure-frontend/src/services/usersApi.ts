import { api } from './api';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginatedData,
  PaginationParams,
  BaseResponse,
} from '@/types';
import { logger } from '@/utils/logger';

/**
 * Users API Slice
 * Handles user management for admin
 */

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<BaseResponse<PaginatedData<User>>, PaginationParams>({
      query: ({ page = 1, limit = 10, role }) => ({
        url: '/users',
        params: { page, limit, role },
      }),
      providesTags: ['User'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched users list');
        } catch (error) {
          logger.error('Failed to fetch users', error);
        }
      },
    }),

    getUser: builder.query<BaseResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched user details');
        } catch (error) {
          logger.error('Failed to fetch user', error);
        }
      },
    }),

    createUser: builder.mutation<BaseResponse<User>, CreateUserDto>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logger.info('User created successfully', { userId: data.data._id });
        } catch (error) {
          logger.error('Failed to create user', error);
        }
      },
    }),

    updateUser: builder.mutation<BaseResponse<User>, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, 'User'],
      onQueryStarted: async ({ id }, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('User updated successfully', { userId: id });
        } catch (error) {
          logger.error('Failed to update user', error);
        }
      },
    }),

    deleteUser: builder.mutation<BaseResponse<null>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
      onQueryStarted: async (id, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('User deleted successfully', { userId: id });
        } catch (error) {
          logger.error('Failed to delete user', error);
        }
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
