import { api } from './api';
import type {
  Doctor,
  CreateDoctorDto,
  PaginatedData,
  PaginationParams,
  BaseResponse,
} from '@/types';
import { logger } from '@/utils/logger';

/**
 * Doctors API Slice
 * Handles doctor management
 */

export const doctorsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<BaseResponse<PaginatedData<Doctor>>, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/doctors',
        params: { page, limit },
      }),
      providesTags: ['Doctor'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched doctors list');
        } catch (error) {
          logger.error('Failed to fetch doctors', error);
        }
      },
    }),

    getDoctor: builder.query<BaseResponse<Doctor>, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Doctor', id }],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched doctor details');
        } catch (error) {
          logger.error('Failed to fetch doctor', error);
        }
      },
    }),

    getDoctorProfileMe: builder.query<BaseResponse<Doctor>, void>({
      query: () => '/doctors/profile/me',
      providesTags: ['Doctor'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched doctor profile me');
        } catch (error) {
          logger.error('Failed to fetch doctor profile me', error);
        }
      },
    }),

    createDoctor: builder.mutation<BaseResponse<Doctor>, CreateDoctorDto>({
      query: (doctorData) => ({
        url: '/doctors',
        method: 'POST',
        body: doctorData,
      }),
      invalidatesTags: ['Doctor'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logger.info('Doctor created successfully', { doctorId: data.data.id });
        } catch (error) {
          logger.error('Failed to create doctor', error);
        }
      },
    }),

    updateDoctor: builder.mutation<
      BaseResponse<Doctor>,
      { id: string; data: Partial<CreateDoctorDto> }
    >({
      query: ({ id, data }) => ({
        url: `/doctors/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Doctor', id }, 'Doctor'],
      onQueryStarted: async ({ id }, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Doctor updated successfully', { doctorId: id });
        } catch (error) {
          logger.error('Failed to update doctor', error);
        }
      },
    }),

    deleteDoctor: builder.mutation<BaseResponse<null>, string>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Doctor'],
      onQueryStarted: async (id, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Doctor deleted successfully', { doctorId: id });
        } catch (error) {
          logger.error('Failed to delete doctor', error);
        }
      },
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorQuery,
  useGetDoctorProfileMeQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorsApi;
