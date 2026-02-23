import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserMutation, useDeleteUserMutation } from '@/services/usersApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';
import { logger } from '@/utils/logger';
import { Loader2, Trash2, Power } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function AdminProfileForm() {
    const { user, logout } = useAuth();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        try {
            await updateUser({
                id: user.id,
                data: {
                    name: data.name,
                    email: data.email,
                }
            }).unwrap();
            alert('Profile updated successfully');
        } catch (error) {
            logger.error('Failed to update profile', error);
            alert('Failed to update profile');
        }
    };

    const handleDeactivate = async () => {
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                isLoading={isUpdating}
            />
        </div>
    );
}
