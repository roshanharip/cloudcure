import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';

export const paymentsApi = createApi({
    reducerPath: 'paymentsApi',
    baseQuery,
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        processPayment: builder.mutation<{ success: boolean; message: string }, { appointmentId: string; amount: number }>({
            query: (data) => ({
                url: '/payments/process',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Payment'],
        }),
    }),
});

export const { useProcessPaymentMutation } = paymentsApi;
