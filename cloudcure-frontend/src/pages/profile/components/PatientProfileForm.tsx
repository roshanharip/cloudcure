import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Trash2,
    ShieldAlert,
    Save,
    Loader2,
    Calendar,
    Mail,
    Phone,
    HeartPulse,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation, useDeleteMeMutation } from '@/services/patientsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuth';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    allergies: z.string().optional(),
    emergencyContact: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        relationship: z.string().optional(),
    }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function PatientProfileForm() {
    const { user: authUser, logout } = useAuth();
    const { data: profileResponse, isLoading: isFetching } = useGetMeQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateMeMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteMeMutation();

    const profile = profileResponse?.data;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            bloodGroup: '',
            address: '',
            allergies: '',
            emergencyContact: {
                name: '',
                phone: '',
                relationship: '',
            }
        }
    });

    // Handle initial loading and data updates
    const hasReset = React.useRef(false);

    React.useEffect(() => {
        if (profile && !hasReset.current) {
            reset({
                name: profile.user?.name || authUser?.name || '',
                email: profile.user?.email || authUser?.email || '',
                phone: profile.user?.phone || authUser?.phone || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: profile.gender || '',
                bloodGroup: profile.bloodGroup || '',
                address: profile.address || '',
                allergies: profile.allergies?.join(', ') || '',
                emergencyContact: {
                    name: profile.emergencyContact?.name || '',
                    phone: profile.emergencyContact?.phone || '',
                    relationship: profile.emergencyContact?.relationship || '',
                },
            }, { keepDefaultValues: false });
            hasReset.current = true;
        } else if (authUser && !profile && !isFetching && !hasReset.current) {
            reset({
                name: authUser.name || '',
                email: authUser.email || '',
                phone: authUser.phone || '',
                gender: '',
                bloodGroup: '',
                address: '',
                allergies: '',
                dateOfBirth: '',
                emergencyContact: {
                    name: '',
                    phone: '',
                    relationship: '',
                }
            });
        }
    }, [profile, authUser, reset, isFetching]);

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            const formattedValues = {
                ...values,
                allergies: values.allergies ? values.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            await updateProfile(formattedValues).unwrap();
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount().unwrap();
            toast.success('Account deleted successfully');
            logout();
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Personal Information */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
                        <p className="text-sm text-muted-foreground mb-4">Your basic details and contact info.</p>
                    </div>
                    <Card className="md:col-span-2 shadow-md border-zinc-200/50 dark:border-zinc-800/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="name" {...register('name')} className="pl-9" placeholder="John Doe" />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" {...register('email')} className="pl-9" placeholder="john@example.com" />
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" {...register('phone')} className="pl-9" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} className="pl-9" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Residential Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="address" {...register('address')} className="pl-9" placeholder="123 Health St, Medical City" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="md:col-span-3" />

                    {/* Medical Information */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-semibold mb-2">Medical Profile</h2>
                        <p className="text-sm text-muted-foreground mb-4">Critical health info for your doctors.</p>
                    </div>
                    <Card className="md:col-span-2 shadow-md border-zinc-200/50 dark:border-zinc-800/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                    <Controller
                                        name="bloodGroup"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                key={field.value}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger id="bloodGroup">
                                                    <SelectValue placeholder="Select Blood Group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                key={field.value}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger id="gender">
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="allergies" {...register('allergies')} className="pl-9" placeholder="Peanuts, Penicillin, Dust" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">List any medications, food, or environmental allergies.</p>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <HeartPulse className="h-4 w-4 text-primary" />
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ec_name" className="text-xs">Contact Name</Label>
                                        <Input id="ec_name" {...register('emergencyContact.name')} className="h-8 text-sm" placeholder="Name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ec_phone" className="text-xs">Phone</Label>
                                        <Input id="ec_phone" {...register('emergencyContact.phone')} className="h-8 text-sm" placeholder="Phone" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ec_rel" className="text-xs">Relationship</Label>
                                        <Input id="ec_rel" {...register('emergencyContact.relationship')} className="h-8 text-sm" placeholder="e.g. Spouse" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="md:col-span-3" />

                    {/* Danger Zone */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
                        <p className="text-sm text-muted-foreground mb-4">Irreversible account actions.</p>
                    </div>
                    <Card className="md:col-span-2 border-destructive/20 bg-destructive/5 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-4 w-4" />
                                Account Management
                            </CardTitle>
                            <CardDescription>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-3 border-t border-destructive/10">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers including appointments, medical records and prescriptions.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Yes, Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm pb-8 z-10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => reset()}
                        disabled={!isDirty || isUpdating}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        type="submit"
                        className="gap-2"
                        disabled={!isDirty || isUpdating}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
