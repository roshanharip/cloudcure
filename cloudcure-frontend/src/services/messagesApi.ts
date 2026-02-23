import { api } from './api';
import type { Message, Conversation } from '@/types';

// The backend wraps every response in { success, message, data }.
// This helper unwraps it so RTK Query hooks receive the payload directly.
function unwrap<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: T }).data;
    }
    return response as T;
}

export const messagesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], void>({
            query: () => '/messages/conversations',
            transformResponse: (r) => unwrap<Conversation[]>(r),
            providesTags: ['Message'],
        }),

        getConversation: builder.query<
            Message[],
            { otherUserId: string; appointmentId?: string }
        >({
            query: ({ otherUserId, appointmentId }) => ({
                url: `/messages/${otherUserId}`,
                params: appointmentId ? { appointmentId } : undefined,
            }),
            transformResponse: (r) => unwrap<Message[]>(r),
            providesTags: ['Message'],
        }),

        getUnreadCount: builder.query<{ count: number }, void>({
            query: () => '/messages/unread-count',
            transformResponse: (r) => unwrap<{ count: number }>(r),
            providesTags: ['Message'],
        }),

        markConversationRead: builder.mutation<{ success: boolean }, string>({
            query: (otherUserId) => ({
                url: `/messages/read/${otherUserId}`,
                method: 'PATCH',
            }),
            transformResponse: (r) => unwrap<{ success: boolean }>(r),
            invalidatesTags: ['Message'],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useGetUnreadCountQuery,
    useMarkConversationReadMutation,
} = messagesApi;
