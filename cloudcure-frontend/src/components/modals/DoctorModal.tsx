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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import type { CreateDoctorDto, Doctor } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetUsersQuery } from '@/services/usersApi';

const doctorSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  licenseNumber: z.string().min(2, 'License number is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Experience must be 0 or more'),
  consultationFee: z.coerce.number().min(0, 'Fee must be 0 or more'),
});

interface DoctorFormData {
  userId: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
}

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDoctorDto) => Promise<void>;
  doctor?: Doctor;
  existingUserIds?: string[];
  isLoading?: boolean;
}

export function DoctorModal({
  isOpen,
  onClose,
  onSubmit,
  doctor,
  existingUserIds = [],
  isLoading,
}: DoctorModalProps): React.ReactElement {
  const { data: usersResponse } = useGetUsersQuery({ limit: 100, role: 'doctor' });
  const users = usersResponse?.data.items ?? [];

  const potentialDoctors = users.filter((u) => !existingUserIds.includes(u._id));

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(
      doctorSchema
    ) as unknown as import('react-hook-form').Resolver<DoctorFormData>,
  });

  useEffect(() => {
    if (doctor) {
      setValue('userId', doctor.userId);
      setValue('specialization', doctor.specialization);
      setValue('licenseNumber', doctor.licenseNumber);
      setValue('yearsOfExperience', doctor.yearsOfExperience);
      setValue('consultationFee', doctor.consultationFee);
    } else {
      reset();
    }
  }, [doctor, setValue, reset, isOpen]);

  const onFormSubmit = async (data: DoctorFormData): Promise<void> => {
    // Direct cast as schema matches DTO structure (with coercion handled by zod)
    await onSubmit(data as unknown as CreateDoctorDto);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Update doctor profile.' : 'Create a new doctor profile linked to a user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)}>
          <div className="grid gap-4 py-4">
            {doctor ? (
              <input type="hidden" {...register('userId')} />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="userId">User Account</Label>
                <Controller
                  control={control}
                  name="userId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {potentialDoctors.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.userId && <p className="text-sm text-red-500">{errors.userId.message}</p>}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                {...register('specialization')}
                className={errors.specialization ? 'border-red-500' : ''}
              />
              {errors.specialization && (
                <p className="text-sm text-red-500">{errors.specialization.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                {...register('licenseNumber')}
                className={errors.licenseNumber ? 'border-red-500' : ''}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="yearsOfExperience">Experience (Yrs)</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  {...register('yearsOfExperience')}
                  className={errors.yearsOfExperience ? 'border-red-500' : ''}
                />
                {errors.yearsOfExperience && (
                  <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="consultationFee">Fee ($)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min="0"
                  {...register('consultationFee')}
                  className={errors.consultationFee ? 'border-red-500' : ''}
                />
                {errors.consultationFee && (
                  <p className="text-sm text-red-500">{errors.consultationFee.message}</p>
                )}
              </div>
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
