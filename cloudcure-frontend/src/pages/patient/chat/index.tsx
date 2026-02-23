import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useGetAppointmentQuery } from '@/services/appointmentsApi';

export default function PatientChatPage() {
    const { appointmentId, doctorUserId } = useParams<{
        appointmentId: string;
        doctorUserId: string;
    }>();
    const navigate = useNavigate();

    const { data: appointment } = useGetAppointmentQuery(appointmentId ?? '', {
        skip: !appointmentId,
    });

    const doctorName =
        appointment?.doctor?.user?.name ?? 'Your Doctor';

    if (!appointmentId || !doctorUserId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">Invalid chat parameters</p>
                <Button onClick={() => void navigate('/patient/appointments')}>
                    Back to Appointments
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto py-6 px-4 h-[calc(100vh-6rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void navigate('/patient/appointments')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{doctorName}</h1>
                    <p className="text-sm text-muted-foreground">
                        Appointment Chat
                        {appointment?.status === 'in_progress' && (
                            <Badge className="ml-2 bg-green-500 text-xs">Live</Badge>
                        )}
                    </p>
                </div>
            </div>

            {/* Chat */}
            <Card className="flex-1 overflow-hidden">
                <ChatWindow
                    otherUserId={doctorUserId}
                    otherUserName={doctorName}
                    appointmentId={appointmentId}
                />
            </Card>
        </div>
    );
}
