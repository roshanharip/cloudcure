import { api } from './api';
import type {
  Patient,
  CreatePatientDto,
  PaginatedData,
  PaginationParams,
  BaseResponse,
} from '@/types';
import { logger } from '@/utils/logger';

/**
 * Patients API Slice
 * Handles patient management
 */

export const patientsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<BaseResponse<PaginatedData<Patient>>, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/patients',
        params: { page, limit },
      }),
      providesTags: ['Patient'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched patients list');
        } catch (error) {
          logger.error('Failed to fetch patients', error);
        }
      },
    }),

    getPatient: builder.query<BaseResponse<Patient>, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched patient details');
        } catch (error) {
          logger.error('Failed to fetch patient', error);
        }
      },
    }),

    createPatient: builder.mutation<BaseResponse<Patient>, CreatePatientDto>({
      query: (patientData) => ({
        url: '/patients',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: ['Patient'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logger.info('Patient created successfully', { patientId: data.data.id });
        } catch (error) {
          logger.error('Failed to create patient', error);
        }
      },
    }),

    updatePatient: builder.mutation<
      BaseResponse<Patient>,
      { id: string; data: Partial<CreatePatientDto> }
    >({
      query: ({ id, data }) => ({
        url: `/patients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Patient', id }, 'Patient'],
      onQueryStarted: async ({ id }, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Patient updated successfully', { patientId: id });
        } catch (error) {
          logger.error('Failed to update patient', error);
        }
      },
    }),

    deletePatient: builder.mutation<BaseResponse<null>, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
    }),

    getMe: builder.query<BaseResponse<Patient>, void>({
      query: () => '/patients/me',
      providesTags: ['Patient'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.debug('Fetched own patient profile');
        } catch (error) {
          logger.error('Failed to fetch own profile', error);
        }
      },
    }),

    updateMe: builder.mutation<BaseResponse<Patient>, Partial<CreatePatientDto> & { name?: string; email?: string; phone?: string; avatar?: string }>({
      query: (data) => ({
        url: '/patients/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Patient'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Updated own profile successfully');
        } catch (error) {
          logger.error('Failed to update own profile', error);
        }
      },
    }),

    deleteMe: builder.mutation<BaseResponse<null>, void>({
      query: () => ({
        url: '/patients/me',
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          logger.info('Account deleted successfully');
        } catch (error) {
          logger.error('Failed to delete account', error);
        }
      },
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
} = patientsApi;
