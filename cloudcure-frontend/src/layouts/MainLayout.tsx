import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants';
import { logger } from '@/utils/logger';

/**
 * Main Application Layout
 * Includes header, sidebar, and main content area
 */

export function MainLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    logger.info('Logout initiated from main layout');
    void logout();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {APP_CONFIG.NAME}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{user?.name}</span>
              <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            {APP_CONFIG.NAME} v{APP_CONFIG.VERSION} - {APP_CONFIG.DESCRIPTION}
          </p>
        </div>
      </footer>
    </div>
  );
}
