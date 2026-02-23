import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
    onSetActiveTab: (tab: string) => void;
}

export default function QuickActions({ onSetActiveTab }: QuickActionsProps) {
    const navigate = useNavigate();

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                        onClick={() => navigate('/doctor/appointments')}
                    >
                        <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
                        <div className="flex flex-col items-start">
                            <span>View Full Schedule</span>
                            <span className="text-xs text-muted-foreground font-normal">Manage all appointments</span>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                        onClick={() => navigate('/doctor/patients')}
                    >
                        <Users className="mr-2 h-5 w-5 text-green-500" />
                        <div className="flex flex-col items-start">
                            <span>Manage Patients</span>
                            <span className="text-xs text-muted-foreground font-normal">View patient records & histories</span>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                        onClick={() => onSetActiveTab('availability')}
                    >
                        <Settings className="mr-2 h-5 w-5 text-orange-500" />
                        <div className="flex flex-col items-start">
                            <span>Set Availability</span>
                            <span className="text-xs text-muted-foreground font-normal">Update working hours & slots</span>
                        </div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
