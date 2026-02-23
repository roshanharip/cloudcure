import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Not Found Page (404)
 */

export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">404</CardTitle>
          <CardDescription className="text-lg">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to={ROUTES.HOME}>
            <Button className="w-full">Go Back Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
