import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import { logger } from '@/utils/logger';
import { api } from '@/services/api';


/**
 * Redux Store Configuration
 * Configured with RTK Query and auth slice
 */

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,

    auth: authReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
    ),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

logger.info('Redux store initialized');

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
