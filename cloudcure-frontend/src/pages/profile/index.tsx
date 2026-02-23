import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants';
import { AdminProfileForm } from './components/AdminProfileForm';
import { DoctorProfileForm } from './components/DoctorProfileForm';
import { PatientProfileForm } from './components/PatientProfileForm';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile, account settings, and preferences.
                </p>
            </div>

            {user.role === ROLES.ADMIN && <AdminProfileForm />}
            {user.role === ROLES.DOCTOR && <DoctorProfileForm />}
            {user.role === ROLES.PATIENT && <PatientProfileForm />}
        </div>
    );
}
