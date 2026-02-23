import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useGetSlotAvailabilityQuery, useUpdateAppointmentMutation } from '@/services/appointmentsApi';
import { toast } from 'sonner';
import { Appointment } from '@/types';

interface RescheduleDialogProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RescheduleDialog({ appointment, isOpen, onOpenChange }: RescheduleDialogProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    const doctorId = appointment?.doctor?._id || appointment?.doctor?.id || '';

    const { data: slots, isFetching: isLoadingSlots } = useGetSlotAvailabilityQuery(
        { doctorId, date },
        { skip: !doctorId || date.length !== 10, refetchOnMountOrArgChange: true }
    );

    const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation();

    useEffect(() => {
        if (isOpen && appointment) {
            // Pre-fill with existing data if needed, but usually we want them to pick a NEW date
            // setDate(appointment.scheduledDate.split('T')[0]);
            // setTime(appointment.scheduledTime);
            setNotes(appointment.notes || '');
        }
    }, [isOpen, appointment]);

    const handleReschedule = async () => {
        if (!appointment) return;
        if (!date || !time) {
            toast.error('Please select both a date and a time slot');
            return;
        }

        try {
            await updateAppointment({
                id: appointment._id || appointment.id,
                data: {
                    scheduledDate: date,
                    scheduledTime: time,
                    notes: notes || undefined,
                },
            }).unwrap();

            toast.success('Appointment rescheduled successfully!');
            onOpenChange(false);
            // Reset fields
            setDate('');
            setTime('');
        } catch (error) {
            toast.error('Failed to reschedule appointment. The slot may have been taken.');
        }
    };

    const availableCount = slots?.filter((s) => s.status === 'available').length ?? 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Set a new date and time for your consultation with {appointment?.doctor?.user?.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Date picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select New Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={date}
                                className="pl-10"
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setTime('');
                                }}
                            />
                        </div>
                    </div>

                    {/* Slot grid */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select New Time</label>
                        {!date && (
                            <p className="text-sm text-muted-foreground bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md border border-dashed">
                                Pick a date first to see available slots
                            </p>
                        )}

                        {date && isLoadingSlots && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking availability...
                            </div>
                        )}

                        {date && !isLoadingSlots && slots && (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.map((slot) => {
                                    const isSelected = time === slot.time;
                                    const isBooked = slot.status === 'booked';
                                    const isInProgress = slot.status === 'in_progress';
                                    const isUnavailable = isBooked || isInProgress;

                                    let className =
                                        'flex flex-col items-center justify-center p-2 rounded-md border text-xs transition-all ';

                                    if (isUnavailable) {
                                        className += 'bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50';
                                    } else if (isSelected) {
                                        className += 'bg-primary border-primary text-primary-foreground font-semibold';
                                    } else {
                                        className += 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer';
                                    }

                                    return (
                                        <button
                                            key={slot.time}
                                            disabled={isUnavailable}
                                            onClick={() => setTime(slot.time)}
                                            className={className}
                                        >
                                            <Clock className="h-3 w-3 mb-1" />
                                            {slot.time}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {date && !isLoadingSlots && slots && slots.length === 0 && (
                            <p className="text-sm text-red-500">No availability found for this date.</p>
                        )}
                    </div>

                    {/* Legend */}
                    {date && slots && slots.length > 0 && (
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span>Selected</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                                <span>Unavailable</span>
                            </div>
                            <div className="ml-auto font-medium">
                                {availableCount} slots free
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={() => void handleReschedule()}
                        disabled={isUpdating || !date || !time}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rescheduling...
                            </>
                        ) : (
                            'Confirm Reschedule'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
