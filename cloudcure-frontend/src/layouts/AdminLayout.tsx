import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserSquare2,
  FileText,
  Pill,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { APP_CONFIG } from '@/constants';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps): React.ReactElement {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async (): Promise<void> => {
    await logout();
    void navigate('/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/patients', label: 'Patients', icon: UserSquare2 },
    { href: '/admin/medical-records', label: 'Medical Records', icon: FileText },
    { href: '/admin/prescriptions', label: 'Prescriptions', icon: Pill },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              C
            </div>
            {APP_CONFIG.NAME}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Link
            to="/profile"
            className="flex items-center gap-3 mb-4 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg py-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
                {(user?.name ?? '').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 flex items-center gap-4 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsSidebarOpen(true);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
