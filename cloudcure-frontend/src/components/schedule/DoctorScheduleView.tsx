import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useGetSlotAvailabilityQuery } from '@/services/appointmentsApi';
import { useGetAppointmentsQuery } from '@/services/appointmentsApi';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    doctorId: string;
    /** Which user owns this view — used to look up appointment details (patientName etc.) */
    viewerRole: 'doctor' | 'patient';
}

/**
 * Shared daily schedule component.
 * Shows all time slots for a doctor on a selected date with availability status.
 * Used on: DoctorAppointmentsPage (doctor view)
 */
export default function DoctorScheduleView({ doctorId, viewerRole }: Props): React.ReactElement {
    const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0] || '');

    const { data: slots, isFetching: isLoadingSlots } = useGetSlotAvailabilityQuery(
        { doctorId, date },
        { skip: !doctorId || !date, pollingInterval: 30_000 },
    );

    // Fetch appointments for the same day so we can show patient info on booked slots
    const { data: appointmentsData } = useGetAppointmentsQuery(
        { doctor: doctorId, startDate: date, endDate: date, limit: 50 },
        { skip: !doctorId || !date || viewerRole !== 'doctor' },
    );

    const appointments = appointmentsData?.items ?? [];

    const getAppointmentForSlot = (slotTime: string) =>
        appointments.find((apt) => apt.scheduledTime === slotTime);

    const available = slots?.filter((s) => s.status === 'available').length ?? 0;
    const booked = slots?.filter((s) => s.status !== 'available').length ?? 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg">
                        Daily Schedule —{' '}
                        {date ? format(parseISO(date), 'EEEE, d MMMM yyyy') : 'Select a date'}
                    </CardTitle>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-40 text-sm"
                    />
                </div>

                {slots && (
                    <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {available} free
                        </span>
                        <span className="flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5 text-red-500" /> {booked} booked
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {isLoadingSlots && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading schedule...
                    </div>
                )}

                {!isLoadingSlots && slots && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {slots.map((slot) => {
                            const apt = viewerRole === 'doctor' ? getAppointmentForSlot(slot.time) : undefined;
                            // Patient name: support both nested user and legacy string
                            const patientName =
                                apt?.patient?.user?.name ??
                                (apt?.patient as unknown as { name?: string })?.name;

                            const isBooked = slot.status === 'booked';
                            const isInProgress = slot.status === 'in_progress';
                            const isAvailable = slot.status === 'available';

                            let cardClass =
                                'flex flex-col p-2.5 rounded-md border text-xs gap-0.5 transition-colors ';
                            if (isAvailable) cardClass += 'border-green-200 bg-green-50 text-green-800';
                            else if (isInProgress) cardClass += 'border-amber-300 bg-amber-50 text-amber-800';
                            else cardClass += 'border-red-200 bg-red-50 text-red-800';

                            return (
                                <div key={slot.time} className={cardClass}>
                                    <div className="flex items-center gap-1 font-semibold">
                                        <Clock className="h-3 w-3" />
                                        {slot.time}
                                    </div>
                                    {isAvailable && (
                                        <span className="flex items-center gap-0.5 text-green-600">
                                            <CheckCircle2 className="h-3 w-3" /> Available
                                        </span>
                                    )}
                                    {isBooked && (
                                        <>
                                            <Badge className="text-[10px] px-1 py-0 h-4 bg-red-500 text-white w-fit">Booked</Badge>
                                            {patientName && <span className="text-muted-foreground truncate">{patientName}</span>}
                                        </>
                                    )}
                                    {isInProgress && (
                                        <>
                                            <span className="flex items-center gap-0.5 font-medium text-amber-700">
                                                <AlertCircle className="h-3 w-3" /> In Session
                                            </span>
                                            {patientName && <span className="text-muted-foreground truncate">{patientName}</span>}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoadingSlots && !slots && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        Select a date to view the schedule
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
