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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import type { CreateMedicalRecordDto, MedicalRecord } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDoctorsQuery } from '@/services/doctorsApi';
import { useGetPatientsQuery } from '@/services/patientsApi';

const recordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  treatment: z.string().min(2, 'Treatment plan is required'),
  symptoms: z.string().min(2, 'Symptoms required (comma separated)'),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMedicalRecordDto) => Promise<void>;
  record?: MedicalRecord;
  isLoading?: boolean;
}

export function MedicalRecordModal({
  isOpen,
  onClose,
  onSubmit,
  record,
  isLoading,
}: MedicalRecordModalProps): React.ReactElement {
  const { data: doctorsData } = useGetDoctorsQuery({ limit: 100 });
  const { data: patientsData } = useGetPatientsQuery({ limit: 100 });

  const doctors = doctorsData?.data.items ?? [];
  const patients = patientsData?.data.items ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
  });

  useEffect(() => {
    if (record) {
      setValue('patientId', record.patient?._id ?? record.patientId);
      setValue('doctorId', record.doctor?._id ?? record.doctorId);
      setValue('diagnosis', record.diagnosis);
      setValue('treatment', record.treatment);
      setValue('symptoms', record.symptoms.join(', '));
      setValue('notes', record.notes ?? '');
    } else {
      reset();
    }
  }, [record, setValue, reset, isOpen]);

  const onFormSubmit = async (data: RecordFormData): Promise<void> => {
    const formattedData: CreateMedicalRecordDto = {
      ...data,
      symptoms: data.symptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    await onSubmit(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Medical Record' : 'New Medical Record'}</DialogTitle>
          <DialogDescription>Record patient diagnosis and treatment details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patientId">Patient</Label>
                {record ? (
                  <>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                      {record.patient?.user?.name ?? 'Unknown'}
                    </div>
                    <input type="hidden" {...register('patientId')} />
                  </>
                ) : (
                  <>
                    <Select
                      onValueChange={(v) => {
                        setValue('patientId', v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            <span className="truncate block w-full">
                              {p.user?.name ?? 'Unknown'} (DOB:{' '}
                              {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}
                              )
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patientId && (
                      <p className="text-sm text-red-500">{errors.patientId.message}</p>
                    )}
                  </>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctorId">Doctor</Label>
                {record ? (
                  <>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                      Dr. {record.doctor?.user?.name ?? 'Unknown'}
                    </div>
                    <input type="hidden" {...register('doctorId')} />
                  </>
                ) : (
                  <>
                    <Select
                      onValueChange={(v) => {
                        setValue('doctorId', v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            <span className="truncate block w-full">
                              Dr. {d.user?.name ?? 'Unknown'} ({d.specialization})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.doctorId && (
                      <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                {...register('diagnosis')}
                className={errors.diagnosis ? 'border-red-500' : ''}
              />
              {errors.diagnosis && (
                <p className="text-sm text-red-500">{errors.diagnosis.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="symptoms">Symptoms (comma separated)</Label>
              <Input
                id="symptoms"
                placeholder="Fever, Cough, Headache"
                {...register('symptoms')}
                className={errors.symptoms ? 'border-red-500' : ''}
              />
              {errors.symptoms && <p className="text-sm text-red-500">{errors.symptoms.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment">Treatment Plan</Label>
              <Textarea
                id="treatment"
                {...register('treatment')}
                className={errors.treatment ? 'border-red-500' : ''}
              />
              {errors.treatment && (
                <p className="text-sm text-red-500">{errors.treatment.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
