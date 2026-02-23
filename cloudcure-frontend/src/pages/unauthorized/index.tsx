import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Unauthorized Page (403)
 */

export default function UnauthorizedPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">403</CardTitle>
          <CardDescription className="text-lg">Unauthorized Access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            You don't have permission to access this page.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => void navigate(-1)} variant="outline" className="flex-1">
              Go Back
            </Button>
            <Link to={ROUTES.HOME} className="flex-1">
              <Button className="w-full">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
