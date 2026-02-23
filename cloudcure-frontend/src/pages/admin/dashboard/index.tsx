import { useGetDashboardStatsQuery } from '@/services/statsApi';
import { StatsCard } from '@/components/StatsCard';
import { Users, Stethoscope, UserSquare2, Settings, Activity } from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CustomizeWidgetsModal } from '@/components/dashboard/CustomizeWidgetsModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateUserMutation } from '@/services/usersApi';
import { logger } from '@/utils/logger';

export default function AdminDashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const [updateUser] = useUpdateUserMutation();
  const { data: statsData, isLoading } = useGetDashboardStatsQuery();

  // Initialize from user prefs or default
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    user?.dashboardPreferences?.visibleWidgets ?? ['stats', 'revenue', 'activity']
  );
  const [isCustomizeOpen, setCustomizeOpen] = useState(false);

  // Sync local state if user prefs load late
  useEffect(() => {
    if (user?.dashboardPreferences?.visibleWidgets) {
      // Only update if different
    }
  }, [user]); // Removed visibleWidgets dependency and state setter to prevent loop

  const handleSaveWidgets = async (widgets: string[]): Promise<void> => {
    setVisibleWidgets(widgets);
    if (user) {
      try {
        await updateUser({
          id: user._id,
          data: {
            dashboardPreferences: {
              visibleWidgets: widgets,
            },
          },
        }).unwrap();
      } catch (error) {
        logger.error('Failed to save preferences', error);
      }
    }
  };

  const stats = statsData?.counts ?? {
    users: 0,
    doctors: 0,
    patients: 0,
    medicalRecords: 0,
    prescriptions: 0,
  };

  const revenue = statsData?.revenue ?? 0;
  const activities = statsData?.recentActivity ?? [];

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard 2.0</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCustomizeOpen(true);
            }}
          >
            <Settings className="h-4 w-4 mr-2" /> Customize
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {visibleWidgets.includes('stats') && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value={stats.users}
              icon={Users}
              description="Active system users"
            />
            <StatsCard
              title="Total Doctors"
              value={stats.doctors}
              icon={Stethoscope}
              description="Registered physicians"
            />
            <StatsCard
              title="Total Patients"
              value={stats.patients}
              icon={UserSquare2}
              description="Registered patients"
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenue}</div>
                <p className="text-xs text-muted-foreground">Based on consultation fees</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {visibleWidgets.includes('revenue') && <RevenueChart />}
          {visibleWidgets.includes('activity') && <RecentActivity activities={activities} />}
        </div>
      </div>

      <CustomizeWidgetsModal
        isOpen={isCustomizeOpen}
        onClose={() => {
          setCustomizeOpen(false);
        }}
        visibleWidgets={visibleWidgets}
        onSave={(widgets) => void handleSaveWidgets(widgets)}
      />
    </div>
  );
}
