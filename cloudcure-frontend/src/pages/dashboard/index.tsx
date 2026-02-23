import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */

export default function DashboardPage(): React.ReactElement {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</p>
              <p className="text-base text-zinc-900 dark:text-zinc-100">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</p>
              <p className="text-base text-zinc-900 dark:text-zinc-100">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Role</p>
              <p className="text-base text-zinc-900 dark:text-zinc-100 capitalize">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 dark:text-zinc-400">Statistics will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 dark:text-zinc-400">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
