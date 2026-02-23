import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  useGetAppointmentsQuery,
  useStartAppointmentMutation,
  useEndAppointmentMutation,
  useTerminateAppointmentMutation,
  useCancelAppointmentMutation,
} from '@/services/appointmentsApi';
import { useAuth } from '@/hooks/useAuth';
import { useSocket, useAppointmentNotifications } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Clock,
  User,
  Play,
  StopCircle,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Video,
} from 'lucide-react';
import type { Appointment } from '@/types';
import DoctorScheduleView from '@/components/schedule/DoctorScheduleView';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-500 text-white' },
  in_progress: { label: 'In Progress', className: 'bg-green-500 text-white animate-pulse' },
  completed: { label: 'Completed', className: 'bg-emerald-600 text-white' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-500 text-white' },
  terminated: { label: 'Terminated', className: 'bg-red-600 text-white' },
  'no-show': { label: 'No Show', className: 'bg-orange-500 text-white' },
};

interface EndDialogState {
  open: boolean;
  appointmentId: string;
  doctorNotes: string;
  actualDuration: string;
}

interface TerminateDialogState {
  open: boolean;
  appointmentId: string;
  reason: string;
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');

  const { data: appointmentsData, isLoading } = useGetAppointmentsQuery({
    doctor: user?.id,
    page: 1,
    limit: 100,
  });

  const [startAppointment] = useStartAppointmentMutation();
  const [endAppointment] = useEndAppointmentMutation();
  const [terminateAppointment] = useTerminateAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();

  const [endDialog, setEndDialog] = useState<EndDialogState>({
    open: false,
    appointmentId: '',
    doctorNotes: '',
    actualDuration: '',
  });

  const [terminateDialog, setTerminateDialog] = useState<TerminateDialogState>({
    open: false,
    appointmentId: '',
    reason: '',
  });

  // Real-time socket connection and appointment notifications
  useSocket();
  useAppointmentNotifications();

  const appointments = appointmentsData?.items ?? [];

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return apt.status === 'scheduled' || apt.status === 'in_progress';
    return apt.status === selectedTab;
  });



  const handleEnd = async () => {
    try {
      await endAppointment({
        id: endDialog.appointmentId,
        doctorNotes: endDialog.doctorNotes || undefined,
        actualDuration: endDialog.actualDuration
          ? parseInt(endDialog.actualDuration, 10)
          : undefined,
      }).unwrap();
      toast.success('Appointment completed successfully');
      setEndDialog({ open: false, appointmentId: '', doctorNotes: '', actualDuration: '' });
    } catch {
      toast.error('Failed to end appointment');
    }
  };

  const handleTerminate = async () => {
    if (!terminateDialog.reason.trim()) {
      toast.error('Please provide a termination reason');
      return;
    }
    try {
      await terminateAppointment({
        id: terminateDialog.appointmentId,
        reason: terminateDialog.reason,
      }).unwrap();
      toast.success('Appointment terminated');
      setTerminateDialog({ open: false, appointmentId: '', reason: '' });
    } catch {
      toast.error('Failed to terminate appointment');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id).unwrap();
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  const getPatientDoctorUserId = (apt: Appointment) => {
    if (apt.patient && typeof apt.patient === 'object' && apt.patient.user) {
      return apt.patient.user._id ?? apt.patient.user.id ?? (typeof apt.patient.user === 'string' ? apt.patient.user : '');
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground mt-1">
            {appointments.length} total · {appointments.filter((a) => a.status === 'scheduled').length} upcoming · {appointments.filter((a) => a.status === 'in_progress').length} in progress
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="schedule">📅 Today's Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <DoctorScheduleView doctorId={user?.id ?? ''} viewerRole="doctor" />
        </TabsContent>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-3 opacity-40" />
              <p className="font-medium">No appointments found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {Object.values(
                filteredAppointments.reduce((acc, appointment) => {
                  const rawPatientId = getPatientDoctorUserId(appointment) || appointment.patient?._id || appointment.patient || 'Unknown';
                  const patientId = String(rawPatientId);
                  if (!acc[patientId]) {
                    acc[patientId] = {
                      patientId,
                      patientName:
                        appointment.patient?.user?.name ??
                        (appointment.patient as unknown as { name?: string })?.name ??
                        'Unknown Patient',
                      appointments: [],
                    };
                  }
                  acc[patientId].appointments.push(appointment);
                  return acc;
                }, {} as Record<string, { patientId: string; patientName: string; appointments: Appointment[] }>)
              ).map((group) => {
                // Sort appointments by date descending (latest first)
                const sortedGroupAppointments = [...group.appointments].sort(
                  (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
                );

                // Find the most relevant upcoming/active appointment
                const activeOrUpcoming = sortedGroupAppointments.find(
                  (a) => a.status === 'in_progress' || a.status === 'scheduled'
                );
                const latestAppointment = activeOrUpcoming || sortedGroupAppointments[0];
                if (!latestAppointment) return null; // Safe guard for TS

                const cfg = statusConfig[latestAppointment.status] ?? { label: latestAppointment.status, className: 'bg-gray-400 text-white' };

                return (
                  <Card key={group.patientId} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{group.patientName}</CardTitle>
                            <CardDescription className="text-sm">
                              {sortedGroupAppointments.length} Total Bookings
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/20 hover:bg-primary/5 text-primary"
                            onClick={() => {
                              // Extract the user details from the patient object
                              const patientUserId = latestAppointment.patient?.user?._id || latestAppointment.patient?.user?.id || (typeof latestAppointment.patient?.user === 'string' ? latestAppointment.patient.user : null);
                              const patientName = latestAppointment.patient?.user?.name || 'Unknown Patient';

                              if (patientUserId) {
                                navigate(`/doctor/chat?patientId=${patientUserId}&patientName=${encodeURIComponent(patientName)}`);
                              }
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-0 flex-1">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Latest/Active Booking</h4>
                        <div className="bg-white dark:bg-zinc-950 border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <Badge className={cfg.className} variant="secondary">
                              {cfg.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground mr-1">ID: {latestAppointment._id.slice(-6).toUpperCase()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(latestAppointment.scheduledDate), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{latestAppointment.scheduledTime} ({latestAppointment.duration} min)</span>
                            </div>
                          </div>
                        </div>

                        {/* Lifecycle controls for Latest Appointment */}
                        {latestAppointment.status === 'scheduled' && (
                          <div className="flex w-full gap-2 mt-3">
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 font-medium"
                              onClick={() => {
                                startAppointment(latestAppointment._id).unwrap().then(() => {
                                  toast.success('Appointment started successfully');
                                  const patientUserId = latestAppointment.patient?.user?._id || latestAppointment.patient?.user?.id || (typeof latestAppointment.patient?.user === 'string' ? latestAppointment.patient.user : null);
                                  const patientName = latestAppointment.patient?.user?.name || 'Unknown Patient';
                                  if (patientUserId) {
                                    navigate(`/doctor/chat?patientId=${patientUserId}&patientName=${encodeURIComponent(patientName)}&appointmentId=${latestAppointment._id}`);
                                  }
                                }).catch(() => toast.error('Failed to start appointment'));
                              }}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Appointment
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => void handleCancel(latestAppointment._id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {latestAppointment.status === 'in_progress' && (
                          <div className="flex w-full gap-2 mt-3">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm"
                              onClick={() => {
                                const patientUserId = latestAppointment.patient?.user?._id || latestAppointment.patient?.user?.id || (typeof latestAppointment.patient?.user === 'string' ? latestAppointment.patient.user : null);
                                if (patientUserId) {
                                  navigate(`/video-call/${latestAppointment._id}/${patientUserId}`);
                                } else {
                                  toast.error("Could not find patient user ID to initiate call");
                                }
                              }}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Video Call
                            </Button>
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() =>
                                setEndDialog({
                                  open: true,
                                  appointmentId: latestAppointment._id,
                                  doctorNotes: '',
                                  actualDuration: '',
                                })
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                setTerminateDialog({
                                  open: true,
                                  appointmentId: latestAppointment._id,
                                  reason: '',
                                })
                              }
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 pb-4 px-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-t mt-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-0">
                          <AccordionTrigger className="hover:no-underline py-2">
                            <span className="text-sm font-medium text-muted-foreground flex items-center">
                              View All Bookings ({sortedGroupAppointments.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {sortedGroupAppointments.map(appointment => {
                                const apCfg = statusConfig[appointment.status] ?? { label: appointment.status, className: 'bg-gray-400 text-white' };
                                return (
                                  <div key={appointment._id} className="text-sm border rounded-md p-3 bg-white dark:bg-zinc-950">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-medium text-xs">{format(new Date(appointment.scheduledDate), 'MMM d, yyyy')} - {appointment.scheduledTime}</span>
                                      <Badge variant="outline" className={`text-[10px] h-5 ${apCfg.className}`}>{apCfg.label}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-xs text-muted-foreground block">ID: {appointment._id.slice(-6).toUpperCase()}</span>
                                      <span className="text-xs font-semibold">₹{appointment.consultationFee} ({appointment.paymentStatus})</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* End Appointment Dialog */}
      <Dialog
        open={endDialog.open}
        onOpenChange={(o) => setEndDialog((s) => ({ ...s, open: o }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>
              Add your notes and mark this appointment as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doctorNotes">Doctor Notes / Diagnosis</Label>
              <Textarea
                id="doctorNotes"
                value={endDialog.doctorNotes}
                onChange={(e) => setEndDialog((s) => ({ ...s, doctorNotes: e.target.value }))}
                placeholder="Enter diagnosis, prescription, follow-up instructions..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="actualDuration">
                Actual Duration (minutes) — optional
              </Label>
              <Input
                id="actualDuration"
                type="number"
                min={1}
                value={endDialog.actualDuration}
                onChange={(e) => setEndDialog((s) => ({ ...s, actualDuration: e.target.value }))}
                placeholder="Leave blank to use scheduled duration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEndDialog((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleEnd()}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Appointment Dialog */}
      <Dialog
        open={terminateDialog.open}
        onOpenChange={(o) => setTerminateDialog((s) => ({ ...s, open: o }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Terminate Appointment
            </DialogTitle>
            <DialogDescription>
              This will abruptly end the appointment. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="terminateReason">Reason for Termination</Label>
              <Textarea
                id="terminateReason"
                value={terminateDialog.reason}
                onChange={(e) => setTerminateDialog((s) => ({ ...s, reason: e.target.value }))}
                placeholder="e.g., Patient unresponsive, Technical issues, Emergency..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTerminateDialog((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleTerminate()}
              disabled={!terminateDialog.reason.trim()}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
