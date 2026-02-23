import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, Activity } from 'lucide-react';
import { useGetDoctorDashboardStatsQuery } from '@/services/statsApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import AvailabilitySettings from './components/AvailabilitySettings';
import RecentAppointments from './components/RecentAppointments';
import QuickActions from './components/QuickActions';


export default function DoctorDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const { data: stats = {
        totalAppointments: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        totalPatients: 0,
    }, isLoading: loading } = useGetDoctorDashboardStatsQuery();

    const statCards = [
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            icon: Calendar,
            description: 'Lifetime appointments',
        },
        {
            title: "Today's Schedule",
            value: stats.todayAppointments,
            icon: Clock,
            description: 'Appointments for today',
        },
        {
            title: 'Pending Requests',
            value: stats.pendingAppointments,
            icon: Activity,
            description: 'Awaiting confirmation',
        },
        {
            title: 'Total Patients',
            value: stats.totalPatients,
            icon: Users,
            description: 'Unique patients treated',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="availability">Availability Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <RecentAppointments />
                        <QuickActions onSetActiveTab={setActiveTab} />
                    </div>
                </TabsContent>

                <TabsContent value="availability">
                    <AvailabilitySettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
