import { api } from './api';

export interface AvailabilityData {
  isAvailableForConsultation: boolean;
  availableDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
}

export interface Availability {
  _id: string;
  doctor: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface CreateAvailabilityDto {
  doctor: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const availabilityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateAvailability: builder.mutation<unknown, Partial<AvailabilityData>>({
      query: (data) => ({
        url: '/doctors/availability',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (r) => unwrap(r),
      invalidatesTags: ['Doctor'],
    }),
    getDoctorProfile: builder.query<AvailabilityData, void>({
      query: () => '/doctors/profile/me',
      transformResponse: (r) => unwrap<AvailabilityData>(r),
      providesTags: ['Doctor'],
    }),
    getDoctorAvailability: builder.query<Availability[], string>({
      query: (doctorId) => `/availability/${doctorId}`,
      transformResponse: (r) => unwrap<Availability[]>(r),
      providesTags: ['Doctor'],
    }),
    createAvailability: builder.mutation<Availability, CreateAvailabilityDto>({
      query: (data) => ({
        url: '/availability',
        method: 'POST',
        body: data,
      }),
      transformResponse: (r) => unwrap<Availability>(r),
      invalidatesTags: ['Doctor'],
    }),
    deleteAvailability: builder.mutation<void, string>({
      query: (id) => ({
        url: `/availability/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (r) => unwrap(r),
      invalidatesTags: ['Doctor'],
    }),
  }),
});

export const {
  useUpdateAvailabilityMutation,
  useGetDoctorProfileQuery,
  useGetDoctorAvailabilityQuery,
  useCreateAvailabilityMutation,
  useDeleteAvailabilityMutation,
} = availabilityApi;
