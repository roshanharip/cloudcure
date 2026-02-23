import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterMutation } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES } from '@/constants';
import { UserRole } from '@/types';
import { logger } from '@/utils/logger';

export default function RegisterPage(): React.ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(ROLES.PATIENT);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (!pass) return '';
    if (pass.length < 8) return 'At least 8 characters required';
    if (!/[A-Z]/.test(pass)) return 'Needs an uppercase letter';
    if (!/[a-z]/.test(pass)) return 'Needs a lowercase letter';
    if (!/[0-9]/.test(pass)) return 'Needs a number';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Needs a symbol';
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setPassword(newPass);
    const passError = validatePassword(newPass);
    setPasswordError(passError);
    if (confirmPassword && confirmPassword !== newPass) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword && confirmPassword === newPass) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirm = e.target.value;
    setConfirmPassword(newConfirm);
    if (!newConfirm) {
      setConfirmPasswordError('');
    } else if (newConfirm !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (passwordError) {
      setError('Please fix password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password, confirmPassword, role }).unwrap();
      logger.info('Registration successful');
      void navigate('/login');
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } }).data?.message ?? 'Registration failed';
      setError(errorMessage);
      logger.error('Registration error', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to register for CloudCure</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Strong password with symbols"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
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
              {passwordError ? (
                <p className="text-xs text-red-500">{passwordError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, number, and symbol
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={confirmPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPasswordError && (
                <p className="text-xs text-red-500">{confirmPasswordError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as UserRole);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.PATIENT}>Patient</SelectItem>
                  <SelectItem value={ROLES.DOCTOR}>Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="underline hover:text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
