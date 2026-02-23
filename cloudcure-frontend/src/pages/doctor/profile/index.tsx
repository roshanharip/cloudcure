import { DoctorProfileForm } from '@/pages/profile/components/DoctorProfileForm';

export default function DoctorProfilePage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal and professional doctor details.
                </p>
            </div>

            <DoctorProfileForm />
        </div>
    );
}
