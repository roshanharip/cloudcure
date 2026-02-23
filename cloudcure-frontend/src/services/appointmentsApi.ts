import { api } from './api';
import type { PaginatedData, Appointment } from '@/types';

export interface SlotAvailability {
  time: string;
  status: 'available' | 'booked' | 'in_progress';
  appointmentId?: string;
}

export interface CreateAppointmentDto {
  patient: string;
  doctor: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  consultationFee: number;
  notes?: string;
}

export interface UpdateAppointmentDto {
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'terminated' | 'no-show';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  doctorNotes?: string;
  prescription?: string;
  notes?: string;
}

// The backend wraps every response in { success, message, data }.
// This helper unwraps it so RTK Query hooks receive the payload directly.
function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const appointmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<
      PaginatedData<Appointment>,
      {
        page?: number;
        limit?: number;
        patient?: string;
        doctor?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({ url: '/appointments', params }),
      transformResponse: (r) => unwrap<PaginatedData<Appointment>>(r),
      providesTags: ['Appointment'],
    }),

    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
      transformResponse: (r) => unwrap<Appointment>(r),
      providesTags: ['Appointment'],
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentDto>({
      query: (data) => ({ url: '/appointments', method: 'POST', body: data }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    updateAppointment: builder.mutation<Appointment, { id: string; data: UpdateAppointmentDto }>({
      query: ({ id, data }) => ({ url: `/appointments/${id}`, method: 'PATCH', body: data }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    cancelAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: 'PATCH' }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    startAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}/start`, method: 'PATCH' }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    endAppointment: builder.mutation<Appointment, { id: string; doctorNotes?: string; actualDuration?: number }>({
      query: ({ id, doctorNotes, actualDuration }) => ({
        url: `/appointments/${id}/end`,
        method: 'PATCH',
        body: { doctorNotes, actualDuration },
      }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    terminateAppointment: builder.mutation<Appointment, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/appointments/${id}/terminate`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    completeAppointment: builder.mutation<Appointment, { id: string; doctorNotes?: string; actualDuration?: number }>({
      query: ({ id, doctorNotes, actualDuration }) => ({
        url: `/appointments/${id}/end`,
        method: 'PATCH',
        body: { doctorNotes, actualDuration },
      }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    deleteAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}`, method: 'DELETE' }),
      transformResponse: (r) => unwrap<Appointment>(r),
      invalidatesTags: ['Appointment'],
    }),

    getSlotAvailability: builder.query<
      SlotAvailability[],
      { doctorId: string; date: string; duration?: number }
    >({
      query: ({ doctorId, date, duration }) => ({
        url: '/appointments/slots',
        params: { doctorId, date, duration },
      }),
      // Backend wraps in { success, message, data: [...] } — unwrap it
      transformResponse: (r: unknown) => {
        if (r && typeof r === 'object' && 'data' in r && Array.isArray((r as { data: unknown }).data)) {
          return (r as { data: SlotAvailability[] }).data;
        }
        return Array.isArray(r) ? (r as SlotAvailability[]) : [];
      },
      providesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
  useStartAppointmentMutation,
  useEndAppointmentMutation,
  useTerminateAppointmentMutation,
  useCompleteAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetSlotAvailabilityQuery,
} = appointmentsApi;
