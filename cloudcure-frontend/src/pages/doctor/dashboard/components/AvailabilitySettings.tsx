import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetDoctorProfileQuery, useUpdateAvailabilityMutation } from '@/services/availabilityApi';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilitySettings() {
    const { data: profile, isLoading } = useGetDoctorProfileQuery();
    const [updateAvailability, { isLoading: isUpdating }] = useUpdateAvailabilityMutation();

    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            isAvailableForConsultation: true,
            availableDays: [] as string[],
            workingHours: {
                start: '09:00',
                end: '17:00'
            }
        }
    });

    useEffect(() => {
        if (profile) {
            reset({
                isAvailableForConsultation: profile.isAvailableForConsultation,
                availableDays: profile.availableDays || [],
                workingHours: profile.workingHours || { start: '09:00', end: '17:00' }
            });
        }
    }, [profile, reset]);

    const isAvailable = watch('isAvailableForConsultation');
    const selectedDays = watch('availableDays');

    const handleDayToggle = (day: string) => {
        const current = selectedDays || [];
        const updated = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        setValue('availableDays', updated);
    };

    const onSubmit = async (data: any) => {
        try {
            await updateAvailability(data).unwrap();
            toast.success('Availability updated successfully');
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Availability Status</CardTitle>
                    <CardDescription>Control your global availability for new appointments.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Available for Consultation</Label>
                        <div className="text-sm text-muted-foreground">
                            Turn off to stop receiving new appointment requests.
                        </div>
                    </div>
                    <Switch
                        checked={isAvailable}
                        onCheckedChange={(checked) => setValue('isAvailableForConsultation', checked)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Working Schedule</CardTitle>
                    <CardDescription>Set your standard weekly hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label>Working Days</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {DAYS.map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={day}
                                        checked={selectedDays?.includes(day)}
                                        onCheckedChange={() => handleDayToggle(day)}
                                    />
                                    <label
                                        htmlFor={day}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {day}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register('workingHours.start')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register('workingHours.end')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
