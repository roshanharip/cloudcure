import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetAppointmentsQuery, useStartAppointmentMutation, useEndAppointmentMutation, useTerminateAppointmentMutation } from '@/services/appointmentsApi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Play, Square, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RecentAppointments() {
    const navigate = useNavigate();
    const { data: appointmentData, isLoading } = useGetAppointmentsQuery({ limit: 5 });

    const [startAppointment] = useStartAppointmentMutation();
    const [endAppointment] = useEndAppointmentMutation();
    const [terminateAppointment] = useTerminateAppointmentMutation();

    const appointments = appointmentData?.items || [];

    const handleStart = async (id: string, apt: any) => {
        try {
            await startAppointment(id).unwrap();
            toast.success('Appointment started');

            // Extract the user details from the patient object
            const patientUserId = apt.patient?.user?._id || apt.patient?.user?.id || (typeof apt.patient?.user === 'string' ? apt.patient.user : null);
            const patientName = apt.patient?.user?.name || 'Unknown Patient';

            if (patientUserId) {
                navigate(`/doctor/chat?patientId=${patientUserId}&patientName=${encodeURIComponent(patientName)}&appointmentId=${id}`);
            }
        } catch (error) {
            toast.error('Failed to start appointment');
        }
    };

    const handleEnd = async (id: string) => {
        try {
            await endAppointment({ id }).unwrap();
            toast.success('Appointment ended successfully');
        } catch (error) {
            toast.error('Failed to end appointment');
        }
    };

    const handleTerminate = async (id: string) => {
        try {
            await terminateAppointment({ id, reason: 'Terminated by doctor from dashboard' }).unwrap();
            toast.error('Appointment terminated');
        } catch (error) {
            toast.error('Failed to terminate appointment');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
            case 'in_progress':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Progress</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
            case 'no-show':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">No Show</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Appointments</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View All</Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-10 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 bg-muted animate-pulse rounded-md" />
                    </div>
                ) : appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((apt, index) => (
                                    <TableRow key={apt._id || apt.id || index}>
                                        <TableCell className="font-medium">
                                            {/* Safely get patient name since backend might populate or just return id depending on queries */}
                                            {typeof apt.patient === 'object' && apt.patient !== null ? (
                                                (apt.patient as any)?.user?.name
                                                    ? (apt.patient as any).user.name
                                                    : 'Unknown Patient'
                                            ) : 'Unknown Patient'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{format(new Date(apt.scheduledDate), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs text-muted-foreground">{apt.scheduledTime}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(apt.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {apt.status === 'scheduled' && (
                                                <Button size="sm" onClick={() => handleStart(apt.id, apt)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Play className="h-4 w-4 mr-1" /> Start
                                                </Button>
                                            )}
                                            {apt.status === 'in_progress' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="destructive" onClick={() => handleTerminate(apt.id)}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleEnd(apt.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                                        <Square className="h-4 w-4 mr-1" /> Finish
                                                    </Button>
                                                </div>
                                            )}
                                            {['completed', 'cancelled', 'no-show', 'terminated'].includes(apt.status) && (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <p>No recent appointments found.</p>
                        <Button variant="link" onClick={() => navigate('/doctor/appointments')}>Go to Appointments Page</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
