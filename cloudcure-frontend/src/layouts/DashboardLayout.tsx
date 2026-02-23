import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Stethoscope,
    FileText,
    LogOut,
    Menu,
    X,
    User,
    MessageSquare,
    // CreditCard,
    Users,
    Pill,
} from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { APP_CONFIG } from '@/constants';
import { ProfileCompletionBanner } from '@/components/dashboard/ProfileCompletionBanner';
import { NotificationCenter } from '@/components/NotificationCenter';

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef<HTMLElement>(null);

    useOnClickOutside(sidebarRef, () => {
        // Only close sidebar on mobile (when it's set to open)
        // On desktop, the sidebar is always visible via CSS (lg:static),
        // but we keep the state synced to avoid issues if resized
        if (isSidebarOpen && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    });

    const handleLogout = async (): Promise<void> => {
        await logout();
        void navigate('/login');
    };

    const patientNavItems = [
        { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/patient/appointments', label: 'My Appointments', icon: Calendar },
        { href: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
        { href: '/medical-records', label: 'Medical Records', icon: FileText },
        { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
    ];

    const doctorNavItems = [
        { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
        { href: '/doctor/patients', label: 'My Patients', icon: Users },
        { href: '/doctor/chat', label: 'Messages', icon: MessageSquare },
        // { href: '/doctor/payments', label: 'Payments', icon: CreditCard },
    ];

    const navItems = useMemo(() => {
        if (user?.role === 'doctor') return doctorNavItems;
        return patientNavItems;
    }, [user?.role]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <aside
                ref={sidebarRef}
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
                        to={user?.role === 'doctor' ? '/doctor/profile' : '/profile'}
                        className="flex items-center gap-3 mb-4 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg py-2 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            )}
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
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSidebarOpen(true);
                            }}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="hidden md:flex items-center relative group">
                            <span className="text-sm font-semibold text-zinc-500 mr-2">Search</span>
                            <div className="h-9 w-64 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-transparent focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all flex items-center px-3 gap-2">
                                <span className="text-zinc-400">⌘K</span>
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="bg-transparent border-none outline-none text-xs w-full"
                                />
                            </div>
                        </div>
                        <span className="font-semibold ml-2 lg:hidden">
                            {user?.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter />
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2 px-2">
                            <div className="text-right flex flex-col">
                                <span className="text-sm font-bold leading-none">{user?.name}</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <ProfileCompletionBanner />

                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
