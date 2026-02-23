import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '@/services/authApi';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, APP_CONFIG, ROLES } from '@/constants';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Page
 * Secure login with form validation and error handling
 */

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      setError('');
      logger.info('Login attempt', { email: data.email });

      const response = await loginMutation(data).unwrap();

      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        logger.info('Login successful, navigating to dashboard');

        // Role-based redirection
        if (response.data.user.role === ROLES.ADMIN) {
          void navigate('/admin/dashboard');
        } else if (response.data.user.role === ROLES.DOCTOR) {
          void navigate('/doctor/dashboard');
        } else if (response.data.user.role === ROLES.PATIENT) {
          void navigate('/patient/dashboard');
        }
      }
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } }).data?.message ?? 'Login failed';
      setError(errorMessage);
      logger.error('Login failed', err);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to {APP_CONFIG.NAME}
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="username"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
