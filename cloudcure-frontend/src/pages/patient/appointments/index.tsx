import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useGetAppointmentsQuery, useCancelAppointmentMutation } from '@/services/appointmentsApi';
import { useSocket, useAppointmentNotifications } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X, MessageSquare, Video, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { Appointment } from '@/types';
import { cn } from '@/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-500 hover:bg-blue-600' },
  in_progress: { label: 'In Progress', className: 'bg-green-500 hover:bg-green-600' },
  completed: { label: 'Completed', className: 'bg-zinc-500 hover:bg-zinc-600' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500 hover:bg-red-600' },
  terminated: { label: 'Terminated', className: 'bg-orange-500 hover:bg-orange-600' },
  'no-show': { label: 'No Show', className: 'bg-orange-500 text-white' },
};

function getDoctorUserId(appointment: Appointment): string {
  const doc = appointment.doctor;
  if (!doc) return '';
  if (doc.user) return doc.user._id ?? doc.user.id ?? '';
  return (doc as unknown as { userId?: string }).userId ?? '';
}

export default function PatientAppointments(): React.ReactElement {
  const navigate = useNavigate();

  useSocket();
  useAppointmentNotifications();

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGetAppointmentsQuery({
    page: 1,
    limit: 50,
  });

  const [cancelAppointment] = useCancelAppointmentMutation();

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const handleCancel = async (appointmentId: string): Promise<void> => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await cancelAppointment(appointmentId).unwrap();
      toast.success('Appointment cancelled successfully');
    } catch {
      toast.error('Failed to cancel appointment. Please try again.');
    }
  };

  const appointments = appointmentsData?.items ?? [];
  const upcomingStatuses: Appointment['status'][] = ['scheduled', 'in_progress'];

  // Grouping logic
  const groupedByDoctor = useMemo(() => {
    const groups: Record<string, {
      doctor: NonNullable<Appointment['doctor']>;
      doctorUserId: string;
      appointments: Appointment[];
      latestAppointment: Appointment;
    }> = {};

    appointments.forEach((apt) => {
      if (!apt.doctor) return;
      const doctorUserId = getDoctorUserId(apt);
      if (!doctorUserId) return;

      if (!groups[doctorUserId]) {
        groups[doctorUserId] = {
          doctor: apt.doctor,
          doctorUserId,
          appointments: [],
          latestAppointment: apt
        };
      }

      groups[doctorUserId].appointments.push(apt);

      // Keep track of the "latest" (soonest) upcoming appointment for the summary
      const currentLatestDate = new Date(groups[doctorUserId].latestAppointment.scheduledDate);
      const aptDate = new Date(apt.scheduledDate);

      if (upcomingStatuses.includes(apt.status as any)) {
        if (!upcomingStatuses.includes(groups[doctorUserId].latestAppointment.status as any) || aptDate < currentLatestDate) {
          groups[doctorUserId].latestAppointment = apt;
        }
      }
    });

    return Object.values(groups);
  }, [appointments]);

  const [expandedDoctors, setExpandedDoctors] = useState<Record<string, boolean>>({});

  const toggleDoctor = (doctorId: string) => {
    setExpandedDoctors((prev: Record<string, boolean>) => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Consultations</h1>
          <p className="text-muted-foreground mt-1">Manage your appointments grouped by healthcare provider</p>
        </div>
        <Button onClick={() => void navigate('/patient/doctors')} className="shadow-sm">
          Book New Appointment
        </Button>
      </div>

      {groupedByDoctor.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No appointments yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              Your scheduled consultations will appear here once you book with a doctor.
            </p>
            <Button onClick={() => void navigate('/patient/doctors')} variant="outline">
              Browse Doctors
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedByDoctor.map((group) => {
            const isExpanded = expandedDoctors[group.doctorUserId];
            const doctorName = group.doctor.user?.name ?? 'Unknown Doctor';
            const latest = group.latestAppointment;
            const isInProgress = latest.status === 'in_progress';

            return (
              <Card key={group.doctorUserId} className={cn(
                "overflow-hidden transition-all duration-300 border-zinc-200/60 shadow-sm hover:shadow-md",
                isExpanded && "ring-1 ring-primary/10 shadow-lg"
              )}>
                {/* Doctor Summary Row */}
                <div
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
                  onClick={() => toggleDoctor(group.doctorUserId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden relative">
                      {group.doctor.user?.avatar ? (
                        <img src={group.doctor.user.avatar} alt={doctorName} className="object-cover h-full w-full" />
                      ) : (
                        <User className="h-7 w-7 text-primary/40" />
                      )}
                      {group.appointments.some(a => a.status === 'in_progress') && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{doctorName}</h3>
                      <p className="text-sm text-primary font-medium">{group.doctor.specialization ?? 'General Practitioner'}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {format(new Date(latest.scheduledDate), 'MMM d')} at {latest.scheduledTime}
                        </span>
                        <Badge variant="secondary" className="px-1.5 h-5 text-[10px] uppercase tracking-wider">
                          {group.appointments.length} Total
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none border-primary/20 hover:bg-primary/5 text-primary gap-2 h-10 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        void navigate(`/patient/chat/${latest._id}/${group.doctorUserId}`);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>

                    {isInProgress && (
                      <Button
                        size="sm"
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 shadow-sm gap-2 h-10 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          void navigate(`/video-call/${latest._id}/${group.doctorUserId}`);
                        }}
                      >
                        <Video className="h-4 w-4" />
                        Video Call
                      </Button>
                    )}

                    <div className="ml-2 p-1.5 rounded-full hover:bg-zinc-100 transition-colors hidden md:block">
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Appointments List */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/30 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-1 px-5">
                      <div className="hidden md:grid grid-cols-5 text-[11px] font-bold text-zinc-400 py-3 uppercase tracking-widest border-b border-zinc-100 mb-2">
                        <div className="col-span-1">Schedule</div>
                        <div className="col-span-1">Duration</div>
                        <div className="col-span-1">Fee</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1 text-right">Actions</div>
                      </div>

                      {group.appointments
                        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                        .map((apt) => {
                          const cfg = statusConfig[apt.status] ?? { label: apt.status, className: 'bg-gray-400' };
                          const canCancel = apt.status === 'scheduled';

                          return (
                            <div key={apt._id} className="grid grid-cols-1 md:grid-cols-5 items-center py-4 border-b border-zinc-100 last:border-0 gap-4 md:gap-0">
                              {/* Mobile: Date Label */}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-800">{format(new Date(apt.scheduledDate), 'PPP')}</span>
                                <span className="text-xs text-zinc-500">{apt.scheduledTime}</span>
                              </div>

                              <div className="text-sm text-zinc-600 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 opacity-50" />
                                {apt.duration} mins
                              </div>

                              <div className="text-sm font-mono font-medium text-zinc-700">₹{apt.consultationFee}</div>

                              <div>
                                <Badge className={cn("text-[10px] h-5 px-2", cfg.className)}>
                                  {cfg.label}
                                </Badge>
                              </div>

                              <div className="flex justify-end">
                                {canCancel && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 text-xs gap-1.5"
                                    onClick={() => void handleCancel(apt._id)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </Button>
                                )}
                                {apt.status === 'in_progress' && (
                                  <span className="text-[10px] text-green-600 font-bold animate-pulse flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                                    ACTIVE SESSION
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
