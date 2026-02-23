import { api } from './api';

export interface DashboardStats {
  counts: {
    users: number;
    doctors: number;
    patients: number;
    medicalRecords: number;
    prescriptions: number;
  };
  revenue: number;
  recentActivity: {
    type: string;
    id: string;
    description: string;
    date: string;
    doctorName?: string;
  }[];
}

function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const statsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/stats/dashboard',
      transformResponse: (r) => unwrap<DashboardStats>(r),
      providesTags: ['Stats'],
    }),
    getDoctorDashboardStats: builder.query<any, void>({
      query: () => '/doctors/dashboard/stats',
      transformResponse: (r) => unwrap<any>(r),
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetDoctorDashboardStatsQuery } = statsApi;
