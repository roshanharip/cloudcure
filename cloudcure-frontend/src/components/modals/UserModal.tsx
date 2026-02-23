import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import type { User, CreateUserDto } from '@/types';

// Schema for creating users - password is required
const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'doctor', 'patient']),
});

// Schema for editing users - password is optional
const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'doctor', 'patient']),
});

type UserCreateData = z.infer<typeof userCreateSchema>;
type UserEditData = z.infer<typeof userEditSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => Promise<void>;
  user?: User;
  isLoading?: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}: UserModalProps): React.ReactElement {
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserCreateData | UserEditData>({
    resolver: zodResolver(isEditMode ? userEditSchema : userCreateSchema),
    defaultValues: {
      role: 'patient',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
    } else {
      reset();
    }
  }, [user, setValue, reset, isOpen]);

  const handleFormSubmit = async (data: UserCreateData | UserEditData): Promise<void> => {
    // Determine if we should include password
    let submitData: CreateUserDto;

    if (isEditMode && (!data.password || data.password === '')) {
      // Create a copy without password field logic,
      // but since generic CreateUserDto requires password, we cast to any or construct strictly
      // Actually we should just construct the object we want to send
      const { password: _password, ...rest } = data;
      submitData = rest as unknown as CreateUserDto;
    } else {
      submitData = { ...data } as CreateUserDto;
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user details.' : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={!!user}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                {user ? 'Password (leave empty to keep)' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => {
                  setValue('role', value as 'admin' | 'doctor' | 'patient');
                }}
                defaultValue={user?.role ?? 'patient'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
