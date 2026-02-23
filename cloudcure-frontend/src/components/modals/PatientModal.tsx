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
import type { CreatePatientDto, Patient } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetUsersQuery } from '@/services/usersApi';

const patientSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone required'),
  emergencyContactRelation: z.string().min(2, 'Relationship required'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientDto) => Promise<void>;
  patient?: Patient;
  existingUserIds?: string[];
  isLoading?: boolean;
}

export function PatientModal({
  isOpen,
  onClose,
  onSubmit,
  patient,
  existingUserIds = [],
  isLoading,
}: PatientModalProps): React.ReactElement {
  const { data: usersResponse } = useGetUsersQuery({ limit: 100, role: 'patient' });
  const users = usersResponse?.data.items ?? [];

  const potentialPatients = users.filter((u) => !existingUserIds.includes(u._id));

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (patient) {
      setValue('userId', patient.user?._id ?? patient.userId);
      setValue(
        'dateOfBirth',
        patient.dateOfBirth ? (new Date(patient.dateOfBirth).toISOString().split('T')[0] ?? '') : ''
      );
      setValue('bloodGroup', patient.bloodGroup ?? '');
      setValue('emergencyContactName', patient.emergencyContact?.name ?? '');
      setValue('emergencyContactPhone', patient.emergencyContact?.phone ?? '');
      setValue('emergencyContactRelation', patient.emergencyContact?.relationship ?? '');
    } else {
      reset();
    }
  }, [patient, setValue, reset, isOpen]);

  const onFormSubmit = async (data: PatientFormData): Promise<void> => {
    const formattedData: CreatePatientDto = {
      userId: data.userId,
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup,
      emergencyContact: {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
        relationship: data.emergencyContactRelation,
      },
    };
    await onSubmit(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{patient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
          <DialogDescription>
            {patient ? 'Update patient profile.' : 'Create a new patient profile linked to a user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)}>
          <div className="grid gap-4 py-4">
            {patient ? (
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
                        {potentialPatients.map((user) => (
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  onValueChange={(value) => {
                    setValue('bloodGroup', value);
                  }}
                  defaultValue={patient?.bloodGroup ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 border rounded-md p-3">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">
                Emergency Contact
              </Label>
              <div className="grid gap-2">
                <Input
                  placeholder="Contact Name"
                  {...register('emergencyContactName')}
                  className={errors.emergencyContactName ? 'border-red-500' : ''}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Phone"
                    {...register('emergencyContactPhone')}
                    className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                  />
                  <Input
                    placeholder="Relationship"
                    {...register('emergencyContactRelation')}
                    className={errors.emergencyContactRelation ? 'border-red-500' : ''}
                  />
                </div>
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
