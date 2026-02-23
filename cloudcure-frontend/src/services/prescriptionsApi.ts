import { api } from './api';
import type {
  Prescription,
  CreatePrescriptionDto,
  PaginatedData,
  PaginationParams,
} from '@/types';
import { logger } from '@/utils/logger';

// The backend wraps every response in { success, message, data }.
// This helper unwraps it so RTK Query hooks receive the payload directly.
function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const prescriptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrescriptions: builder.query<PaginatedData<Prescription>, PaginationParams & { patientId?: string }>({
      query: ({ page = 1, limit = 100 }) => ({
        url: '/prescriptions',
        params: { page, limit },
      }),
      transformResponse: (r: unknown, _meta, arg) => {
        const response = unwrap<PaginatedData<Prescription>>(r);
        if (response?.items && arg.patientId) {
          response.items = response.items.filter((record: any) => {
            const recPatientId = record.patient?._id || record.patient;
            const recPatientUserId = record.patient?.user?._id || record.patient?.user;
            return recPatientId === arg.patientId || recPatientUserId === arg.patientId;
          });
        }
        return response;
      },
      providesTags: ['Prescription'],
    }),

    getPrescription: builder.query<Prescription, string>({
      query: (id) => `/prescriptions/${id}`,
      transformResponse: (r) => unwrap<Prescription>(r),
      providesTags: (_result, _error, id) => [{ type: 'Prescription', id }],
    }),

    createPrescription: builder.mutation<Prescription, CreatePrescriptionDto>({
      query: (prescriptionData) => ({
        url: '/prescriptions',
        method: 'POST',
        body: prescriptionData,
      }),
      transformResponse: (r) => unwrap<Prescription>(r),
      invalidatesTags: ['Prescription'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled as any;
          logger.info('Prescription created successfully', { prescriptionId: data?.id || data?._id });
        } catch (error) {
          logger.error('Failed to create prescription', error);
        }
      },
    }),

    updatePrescription: builder.mutation<
      Prescription,
      { id: string; data: Partial<CreatePrescriptionDto> }
    >({
      query: ({ id, data }) => ({
        url: `/prescriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (r) => unwrap<Prescription>(r),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Prescription', id }, 'Prescription'],
    }),

    deletePrescription: builder.mutation<null, string>({
      query: (id) => ({
        url: `/prescriptions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (r) => unwrap<null>(r),
      invalidatesTags: ['Prescription'],
    }),
  }),
});

export const {
  useGetPrescriptionsQuery,
  useGetPrescriptionQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} = prescriptionsApi;
