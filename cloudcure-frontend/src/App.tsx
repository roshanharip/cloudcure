import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes, wrapRoute } from '@/routes/config';
import { logger } from '@/utils/logger';
import NotFoundPage from '@/pages/not-found';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useRefreshTokenMutation } from '@/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

/**
 * Session Restorer Component
 * Attempts to restore authentication state from httpOnly cookie on app load
 */
function SessionRestorer({ children }: { children: React.ReactNode }): React.ReactElement {
  const dispatch = useAppDispatch();
  const [refresh, { isLoading }] = useRefreshTokenMutation();
  const { accessToken } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initSession = async (): Promise<void> => {
      // Only try to refresh if we don't have a token but might have a cookie
      if (!accessToken) {
        try {
          logger.debug('Attempting to restore session...');
          const response = await refresh().unwrap();
          if (response.data.user && response.data.accessToken) {
            dispatch(
              setCredentials({
                user: response.data.user,
                accessToken: response.data.accessToken,
              })
            );
            logger.info('Session restored successfully');
          } else {
            logger.warn('Session restore failed: incomplete data');
          }
        } catch {
          logger.debug('No active session found or refresh failed');
        }
      }
      setIsReady(true);
    };

    if (!isReady) {
      void initSession();
    }
  }, [accessToken, dispatch, refresh, isReady]);

  if (!isReady || (isLoading && !accessToken)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Initializing application...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Main App Component
 * Renders routes with React Router wrapped in SessionRestorer
 */
function App(): React.ReactElement {
  logger.info('App initialized');

  return (
    <BrowserRouter>
      <SessionRestorer>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={wrapRoute(route)} />
          ))}
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SessionRestorer>
    </BrowserRouter>
  );
}

export default App;
