import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants';
import { Loader2 } from 'lucide-react';
import LandingPage from '@/pages/home';

export function HomeRedirect(): React.ReactElement {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <LandingPage />;
    }

    // Authenticated → redirect to role-specific dashboard
    switch (user.role) {
        case ROLES.ADMIN:
            return <Navigate to="/admin/dashboard" replace />;
        case ROLES.DOCTOR:
            return <Navigate to="/doctor/dashboard" replace />;
        case ROLES.PATIENT:
            return <Navigate to="/patient/dashboard" replace />;
        default:
            return <Navigate to="/unauthorized" replace />;
    }
}
