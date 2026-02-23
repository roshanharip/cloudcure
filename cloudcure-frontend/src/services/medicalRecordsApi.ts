import { api } from './api';
import type {
  MedicalRecord,
  CreateMedicalRecordDto,
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

export const medicalRecordsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedicalRecords: builder.query<PaginatedData<MedicalRecord>, PaginationParams & { patientId?: string }>({
      query: ({ page = 1, limit = 100 }) => ({
        url: '/medical-records',
        params: { page, limit },
      }),
      transformResponse: (r: unknown, _meta, arg) => {
        const response = unwrap<PaginatedData<MedicalRecord>>(r);
        // Frontend-side explicit filtering to ensure 100% correctness for this doctor's view of *this* patient
        if (response?.items && arg.patientId) {
          response.items = response.items.filter((record: any) => {
            const recPatientId = record.patient?._id || record.patient;
            const recPatientUserId = record.patient?.user?._id || record.patient?.user;
            return recPatientId === arg.patientId || recPatientUserId === arg.patientId;
          });
        }
        return response;
      },
      providesTags: ['MedicalRecord'],
    }),

    getMedicalRecord: builder.query<MedicalRecord, string>({
      query: (id) => `/medical-records/${id}`,
      transformResponse: (r) => unwrap<MedicalRecord>(r),
      providesTags: (_result, _error, id) => [{ type: 'MedicalRecord', id }],
    }),

    createMedicalRecord: builder.mutation<MedicalRecord, CreateMedicalRecordDto>({
      query: (recordData) => ({
        url: '/medical-records',
        method: 'POST',
        body: recordData,
      }),
      transformResponse: (r) => unwrap<MedicalRecord>(r),
      invalidatesTags: ['MedicalRecord'],
      onQueryStarted: async (_args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled as any;
          logger.info('Medical record created successfully', { recordId: data?.id || data?._id });
        } catch (error) {
          logger.error('Failed to create medical record', error);
        }
      },
    }),

    updateMedicalRecord: builder.mutation<
      MedicalRecord,
      { id: string; data: Partial<CreateMedicalRecordDto> }
    >({
      query: ({ id, data }) => ({
        url: `/medical-records/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (r) => unwrap<MedicalRecord>(r),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalRecord', id },
        'MedicalRecord',
      ],
    }),

    deleteMedicalRecord: builder.mutation<null, string>({
      query: (id) => ({
        url: `/medical-records/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (r) => unwrap<null>(r),
      invalidatesTags: ['MedicalRecord'],
    }),
  }),
});

export const {
  useGetMedicalRecordsQuery,
  useGetMedicalRecordQuery,
  useCreateMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
} = medicalRecordsApi;
