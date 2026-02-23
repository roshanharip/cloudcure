import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGetAppointmentsQuery } from '@/services/appointmentsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Stethoscope, Video, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useGetMedicalRecordsQuery } from '@/services/medicalRecordsApi';
import { useGetPrescriptionsQuery } from '@/services/prescriptionsApi';
import { RescheduleDialog } from './components/RescheduleDialog';
import { Appointment } from '@/types';
export default function DashboardPage(): React.ReactElement {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

    // Fetch upcoming appointments
    const { data: appointmentsData } = useGetAppointmentsQuery({
        status: 'scheduled',
        limit: 1,
    });

    const { data: recordsData } = useGetMedicalRecordsQuery({ limit: 1 });
    const { data: prescriptionsData } = useGetPrescriptionsQuery({ limit: 1 });

    // Fetch past appointments to count unique doctors
    const { data: pastAppointmentsData } = useGetAppointmentsQuery({
        status: 'completed',
        limit: 100, // Fetch a reasonable amount to count unique doctors
    });

    // Calculate unique doctors visited
    const uniqueDoctors = new Set(
        pastAppointmentsData?.items
            ?.filter(apt => apt.doctor?._id || apt.doctor?.id)
            .map(apt => apt.doctor?._id || apt.doctor?.id)
    ).size;

    const nextAppointment = appointmentsData?.items?.[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground mt-2">
                    Here is an overview of your health dashboard as of today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentsData?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Scheduled for this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recordsData?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Total records available</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prescriptionsData?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Active prescriptions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doctors Visited</CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueDoctors}</div>
                        <p className="text-xs text-muted-foreground">Completed consultations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Next Appointment Card */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Next Appointment</CardTitle>
                        <CardDescription>Your upcoming scheduled appointment details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="flex items-start space-x-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium text-lg leading-none">
                                        {nextAppointment.doctor?.user?.name ?? 'Unknown Doctor'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {nextAppointment.doctor?.specialization ?? 'Specialist'}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm pt-2">
                                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                                            <Clock className="h-4 w-4" />
                                            {format(new Date(nextAppointment.scheduledDate), 'PPP')} at{' '}
                                            {nextAppointment.scheduledTime}
                                        </div>
                                        {nextAppointment.status === 'scheduled' && (
                                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-medium">
                                                <Video className="h-4 w-4" />
                                                Video Consultation
                                            </span>
                                        )}
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            size="sm"
                                            className="w-full md:w-auto"
                                            onClick={() => void navigate('/patient/appointments')}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full md:w-auto"
                                            onClick={() => {
                                                setRescheduleAppointment(nextAppointment as unknown as Appointment);
                                                setIsRescheduleOpen(true);
                                            }}
                                        >
                                            Reschedule
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-lg font-medium">No upcoming appointments</p>
                                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                    Schedule a consultation with one of our specialized doctors today.
                                </p>
                                <Button onClick={() => void navigate('/patient/doctors')}>
                                    Find a Doctor
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks you might want to perform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => void navigate('/patient/doctors')}
                        >
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-4 text-blue-600 dark:text-blue-400">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Book Appointment</div>
                                <div className="text-xs text-muted-foreground">Find a doctor and schedule</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => void navigate('/medical-records')}
                        >
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-4 text-purple-600 dark:text-purple-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Medical Records</div>
                                <div className="text-xs text-muted-foreground">View your history and reports</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <RescheduleDialog
                isOpen={isRescheduleOpen}
                onOpenChange={setIsRescheduleOpen}
                appointment={rescheduleAppointment}
            />
        </div>
    );
}
