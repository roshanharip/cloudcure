import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserMutation, useDeleteUserMutation } from '@/services/usersApi';
import { useGetDoctorProfileMeQuery, useUpdateDoctorMutation, useCreateDoctorMutation } from '@/services/doctorsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';
import { logger } from '@/utils/logger';
import { Loader2, Trash2, Power } from 'lucide-react';

const doctorProfileSchema = z.object({
    // User fields
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),

    // Doctor fields
    specialization: z.string().min(2, 'Specialization is required'),
    licenseNumber: z.string().min(2, 'License number is required'),
    yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be positive'),
    consultationFee: z.coerce.number().min(0, 'Consultation fee must be positive'),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

export function DoctorProfileForm() {
    const { user, logout } = useAuth();

    // API Hooks
    const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

    const { data: doctorProfileResponse, isLoading: isLoadingDoctors } = useGetDoctorProfileMeQuery();
    const [updateDoctor, { isLoading: isUpdatingDoctor }] = useUpdateDoctorMutation();
    const [createDoctor, { isLoading: isCreatingDoctor }] = useCreateDoctorMutation();

    // Local State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

    // Find current doctor profile
    const doctorProfile = doctorProfileResponse?.data;

    const { register, handleSubmit, formState: { errors }, reset } = useForm<DoctorProfileFormData>({
        resolver: zodResolver(doctorProfileSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            specialization: '',
            licenseNumber: '',
            yearsOfExperience: 0,
            consultationFee: 0,
        } as any,
    });

    // Load initial data
    useEffect(() => {
        // ... (keep existing useEffect)
        if (user && doctorProfile) {
            reset({
                name: user.name,
                email: user.email,
                specialization: doctorProfile.specialization,
                licenseNumber: doctorProfile.licenseNumber,
                yearsOfExperience: doctorProfile.yearsOfExperience,
                consultationFee: doctorProfile.consultationFee,
            });
        } else if (user) {
            reset({
                name: user.name,
                email: user.email,
            });
        }
    }, [user, doctorProfile, reset]);

    const onSubmit = async (data: DoctorProfileFormData) => {
        // Log validation success/data
        console.log('Submitting profile data:', data);

        if (!user) {
            console.error('No user found in context');
            return;
        }

        try {
            // Update User details
            const userPromise = updateUser({
                id: user.id,
                data: {
                    name: data.name,
                    email: data.email,
                }
            }).unwrap();

            // Update Doctor details
            if (doctorProfile?._id) {
                console.log('Updating doctor:', doctorProfile._id, data);
                const doctorPromise = updateDoctor({
                    id: doctorProfile._id,
                    data: {
                        specialization: data.specialization,
                        licenseNumber: data.licenseNumber,
                        yearsOfExperience: Number(data.yearsOfExperience), // Ensure number
                        consultationFee: Number(data.consultationFee), // Ensure number
                    }
                }).unwrap();
                await Promise.all([userPromise, doctorPromise]);
                alert('Profile updated successfully');
            } else {
                // Create new doctor profile if it doesn't exist
                console.log('Creating new doctor profile for user:', user.id);
                const createPromise = createDoctor({
                    userId: user.id,
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    yearsOfExperience: Number(data.yearsOfExperience),
                    consultationFee: Number(data.consultationFee),
                }).unwrap();

                await Promise.all([userPromise, createPromise]);
                alert('Profile created successfully');
            }
        } catch (error) {
            console.error('Update/Create failed', error);
            logger.error('Failed to update profile', error);
            // safe error message
            const msg = (error as any)?.data?.message || (error as any)?.message || 'Unknown error';
            alert('Failed to save profile: ' + msg);
        }
    };

    const handleDeactivate = async () => {
        // ... (keep existing)
        if (!user) return;
        try {
            await updateUser({
                id: user.id,
                data: { isActive: false }
            }).unwrap();
            alert('Account deactivated');
            logout();
        } catch (error) {
            logger.error('Failed to deactivate account', error);
            alert('Failed to deactivate account');
        }
    };

    const handleDelete = async () => {
        // ... (keep existing)
        if (!user) return;
        try {
            await deleteUser(user.id).unwrap();
            alert('Account deleted permanently');
            logout();
        } catch (error) {
            logger.error('Failed to delete account', error);
            alert('Failed to delete account');
        }
    };

    const isUpdating = isUpdatingUser || isUpdatingDoctor || isCreatingDoctor;
    const isDeleting = isDeletingUser;

    if (isLoadingDoctors) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Profile</CardTitle>
                    <CardDescription>Update your personal and professional details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit, (errors) => console.error('Validation Errors:', errors))} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input id="specialization" {...register('specialization')} />
                                {errors.specialization && <p className="text-sm text-red-500">{errors.specialization.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number</Label>
                                <Input id="licenseNumber" {...register('licenseNumber')} />
                                {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                                <Input id="yearsOfExperience" type="number" {...register('yearsOfExperience')} />
                                {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                                <Input id="consultationFee" type="number" {...register('consultationFee')} />
                                {errors.consultationFee && <p className="text-sm text-red-500">{errors.consultationFee.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Deactivate Account</h4>
                            <p className="text-sm text-muted-foreground">
                                Temporarily disable your account. You can reactivate it later by contacting support.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(true)}>
                            <Power className="mr-2 h-4 w-4" />
                            Deactivate
                        </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">
                                Permanently remove your account and all data. This cannot be undone.
                            </p>
                        </div>
                        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Your Account"
                isLoading={isDeleting}
            />

            <DeleteConfirmDialog
                isOpen={isDeactivateDialogOpen}
                onClose={() => setIsDeactivateDialogOpen(false)}
                onConfirm={handleDeactivate}
                title="Deactivate Your Account"
                isLoading={isUpdatingUser}
            />
        </div>
    );
}
