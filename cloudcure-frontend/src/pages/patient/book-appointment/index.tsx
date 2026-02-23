import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGetDoctorQuery } from '@/services/doctorsApi';
import { useCreateAppointmentMutation, useGetSlotAvailabilityQuery } from '@/services/appointmentsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, DollarSign, Award, ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BookAppointmentPage(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    const { data: doctorResponse, isLoading: isDoctorLoading } = useGetDoctorQuery(id ?? '', {
        skip: !id,
    });

    const doctor = doctorResponse?.data;
    const doctorId = doctor?._id ?? doctor?.id ?? '';

    const { data: slots, isFetching: isLoadingSlots } = useGetSlotAvailabilityQuery(
        { doctorId, date },
        // Only fire when doctorId is known AND date is a complete YYYY-MM-DD string (10 chars)
        { skip: !doctorId || date.length !== 10, refetchOnMountOrArgChange: true },
    );

    const [createAppointment, { isLoading: isBooking }] = useCreateAppointmentMutation();

    const selectedSlot = slots?.find((s) => s.time === time);
    const isSelectedBooked = selectedSlot && selectedSlot.status !== 'available';

    const handleBook = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!date || !time) {
            toast.error('Please select both a date and a time slot');
            return;
        }
        if (isSelectedBooked) {
            toast.error('This slot is already booked — please choose another time');
            return;
        }
        if (!user || !doctor) return;

        try {
            await createAppointment({
                patient: user.id || user._id,
                doctor: doctorId,
                scheduledDate: date,
                scheduledTime: time,
                consultationFee: doctor.consultationFee || 500,
                notes: notes || undefined,
            }).unwrap();

            toast.success('Appointment booked successfully!');
            void navigate('/patient/appointments');
        } catch {
            toast.error('Failed to book appointment. The slot may have just been taken — please try again.');
        }
    };

    if (isDoctorLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Doctor not found</h1>
                <Button onClick={() => void navigate('/patient/doctors')}>Back to Doctors</Button>
            </div>
        );
    }

    const availableCount = slots?.filter((s) => s.status === 'available').length ?? 0;

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => void navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Book Appointment</h1>
                    <p className="text-muted-foreground mt-1">Schedule a consultation</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Doctor Info Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">{doctor.user?.name ?? 'Unknown Doctor'}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary" className="mt-2">
                                    {doctor.specialization || 'General Practitioner'}
                                </Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span>{doctor.yearsOfExperience} years experience</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">₹{doctor.consultationFee} / consult</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legend */}
                    {date && (
                        <Card>
                            <CardContent className="pt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span>Already Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <span>In Session</span>
                                </div>
                                {slots && (
                                    <p className="text-muted-foreground pt-1 border-t">
                                        <strong>{availableCount}</strong> / {slots.length} slots free
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Booking Form */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date &amp; Time</CardTitle>
                            <CardDescription>
                                Choose an available slot — booked slots are shown in red and cannot be selected
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => void handleBook(e)} className="space-y-6">
                                {/* Date picker */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Select Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={date}
                                            className="pl-10"
                                            onChange={(e) => {
                                                setDate(e.target.value);
                                                setTime(''); // reset time when date changes
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Slot grid */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Select Time <span className="text-red-500">*</span>
                                    </label>

                                    {!date && (
                                        <p className="text-sm text-muted-foreground">Pick a date first to see available slots</p>
                                    )}

                                    {date && isLoadingSlots && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Checking availability...
                                        </div>
                                    )}

                                    {date && !isLoadingSlots && slots && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {slots.map((slot) => {
                                                const isSelected = time === slot.time;
                                                const isBooked = slot.status === 'booked';
                                                const isInProgress = slot.status === 'in_progress';
                                                const isUnavailable = isBooked || isInProgress;

                                                let className =
                                                    'flex flex-col items-center justify-center p-2.5 rounded-md border text-xs transition-all select-none ';

                                                if (isUnavailable) {
                                                    className += isInProgress
                                                        ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed opacity-70'
                                                        : 'bg-red-50 border-red-300 text-red-600 cursor-not-allowed opacity-70 line-through';
                                                } else if (isSelected) {
                                                    className += 'bg-primary border-primary text-primary-foreground font-semibold shadow-sm';
                                                } else {
                                                    className += 'bg-background border-border hover:bg-green-50 hover:border-green-400 hover:text-green-700 cursor-pointer';
                                                }

                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={isUnavailable}
                                                        onClick={() => !isUnavailable && setTime(slot.time)}
                                                        className={className}
                                                        title={isBooked ? 'Already booked' : isInProgress ? 'Consultation in progress' : slot.time}
                                                    >
                                                        <Clock className="h-3 w-3 mb-0.5 opacity-70" />
                                                        {slot.time}
                                                        {isBooked && <span className="mt-0.5 text-[10px] font-medium">Booked</span>}
                                                        {isInProgress && <span className="mt-0.5 text-[10px] font-medium">In Session</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Reason for visit (Optional)
                                    </label>
                                    <Textarea
                                        placeholder="Briefly describe your symptoms or reason for consultation..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isBooking || !date || !time || !!isSelectedBooked}
                                        className="w-full md:w-auto"
                                    >
                                        {isBooking ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            'Confirm Booking'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
