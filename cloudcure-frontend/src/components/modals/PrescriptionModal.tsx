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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import type { CreatePrescriptionDto, Prescription } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDoctorsQuery } from '@/services/doctorsApi';
import { useGetPatientsQuery } from '@/services/patientsApi';
import { useGetMedicalRecordsQuery } from '@/services/medicalRecordsApi';
import { Plus, Trash2 } from 'lucide-react';

// Nested medication schema
const medicationSchema = z.object({
  name: z.string().min(1, 'Required'),
  dosage: z.string().min(1, 'Required'),
  frequency: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  doctorId: z.string().min(1, 'Doctor required'),
  medicalRecordId: z.string().min(1, 'Medical Record required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication required'),
  instructions: z.string().min(1, 'Instructions required'),
  validUntil: z.string().min(1, 'Expiry date required'),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePrescriptionDto) => Promise<void>;
  prescription?: Prescription;
  isLoading?: boolean;
}

export function PrescriptionModal({
  isOpen,
  onClose,
  onSubmit,
  prescription,
  isLoading,
}: PrescriptionModalProps): React.ReactElement {
  const { data: doctorsData } = useGetDoctorsQuery({ limit: 100 });
  const { data: patientsData } = useGetPatientsQuery({ limit: 100 });
  const { data: recordsData } = useGetMedicalRecordsQuery({ limit: 100 });

  const doctors = doctorsData?.data.items ?? [];
  const patients = patientsData?.data.items ?? [];
  const records = recordsData?.items ?? [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  useEffect(() => {
    if (prescription) {
      setValue('patientId', prescription.patient?._id ?? prescription.patientId);
      setValue('doctorId', prescription.doctor?._id ?? prescription.doctorId);
      setValue('medicalRecordId', prescription.medicalRecord?._id ?? prescription.medicalRecordId);
      setValue('instructions', prescription.instructions);
      const date = prescription.validUntil ? new Date(prescription.validUntil) : new Date();
      setValue('validUntil', date.toISOString().split('T')[0] ?? '');
      setValue('medications', prescription.medications);
    } else {
      reset();
    }
  }, [prescription, setValue, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prescription ? 'Edit Prescription' : 'New Prescription'}</DialogTitle>
          <DialogDescription>Issue medications for a patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patientId">Patient</Label>
                {prescription ? (
                  <>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center truncate">
                      {prescription.patient?.user?.name ?? 'Unknown'}
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
                        {patients.map((p: any) => (
                          <SelectItem key={p._id} value={p._id}>
                            <span className="truncate block w-full">
                              {p.user?.name} (DOB:{' '}
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
                {prescription ? (
                  <>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center truncate">
                      Dr. {prescription.doctor?.user?.name ?? 'Unknown'}
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
                        {doctors.map((d: any) => (
                          <SelectItem key={d._id} value={d._id}>
                            Dr. {d.user?.name}
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
              <Label htmlFor="medicalRecordId">Linked Medical Record</Label>
              {prescription ? (
                <>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center truncate">
                    {prescription.medicalRecord
                      ? `${new Date(prescription.medicalRecord.createdAt).toLocaleDateString()} - ${prescription.medicalRecord.diagnosis}`
                      : 'Unknown Record'}
                  </div>
                  <input type="hidden" {...register('medicalRecordId')} />
                </>
              ) : (
                <>
                  <Select
                    onValueChange={(v) => {
                      setValue('medicalRecordId', v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnosis record" />
                    </SelectTrigger>
                    <SelectContent>
                      {records.map((r) => (
                        <SelectItem key={r._id} value={r._id}>
                          <span className="truncate block max-w-[350px]">
                            {new Date(r.createdAt).toLocaleDateString()} - {r.diagnosis} (
                            {r.patient?.user?.name})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.medicalRecordId && (
                    <p className="text-sm text-red-500">{errors.medicalRecordId.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({ name: '', dosage: '', frequency: '', duration: '' });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-muted/20"
                >
                  <div className="col-span-4 grid gap-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      {...register(`medications.${index}.name` as const)}
                      placeholder="Drug Name"
                    />
                  </div>
                  <div className="col-span-2 grid gap-1">
                    <Label className="text-xs">Dosage</Label>
                    <Input
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      {...register(`medications.${index}.dosage` as const)}
                      placeholder="500mg"
                    />
                  </div>
                  <div className="col-span-3 grid gap-1">
                    <Label className="text-xs">Freq</Label>
                    <Input
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      {...register(`medications.${index}.frequency` as const)}
                      placeholder="2x daily"
                    />
                  </div>
                  <div className="col-span-2 grid gap-1">
                    <Label className="text-xs">Duration</Label>
                    <Input
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      {...register(`medications.${index}.duration` as const)}
                      placeholder="5 days"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove(index);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.medications && (
                <p className="text-sm text-red-500">{errors.medications.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Input
                id="instructions"
                {...register('instructions')}
                placeholder="Take with food..."
                className={errors.instructions ? 'border-red-500' : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                {...register('validUntil')}
                className={errors.validUntil ? 'border-red-500' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Issue Prescription' : 'Issue Prescription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
