import { useState } from 'react';
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} from '@/services/patientsApi';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PatientModal } from '@/components/modals/PatientModal';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Patient, CreatePatientDto } from '@/types';
import { logger } from '@/utils/logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PatientsManagementPage(): React.ReactElement {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: patientsResponse, isLoading } = useGetPatientsQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const [deletePatientMutation, { isLoading: isDeleting }] = useDeletePatientMutation();

  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [deletePatient, setDeletePatient] = useState<Patient | undefined>(undefined);

  const patients = patientsResponse?.data.items ?? [];
  const totalPages = patientsResponse?.data.totalPages ?? 0;
  const existingUserIds = patients.map((p) => p.user?._id ?? p.userId).filter(Boolean);

  const handleCreate = async (data: CreatePatientDto): Promise<void> => {
    try {
      await createPatient(data).unwrap();
      setIsCreateOpen(false);
    } catch (error) {
      logger.error('Failed to create patient', error);
    }
  };

  const handleUpdate = async (data: CreatePatientDto): Promise<void> => {
    if (!editingPatient) return;
    try {
      await updatePatient({ id: editingPatient._id, data }).unwrap();
      setEditingPatient(undefined);
    } catch (error) {
      logger.error('Failed to update patient', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletePatient) return;
    try {
      await deletePatientMutation(deletePatient._id).unwrap();
      setDeletePatient(undefined);
    } catch (error) {
      logger.error('Failed to delete patient', error);
    }
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'user.name',
      header: 'Name',
      cell: ({ row }) => row.original.user?.name ?? 'N/A',
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'Date of Birth',
      cell: ({ row }) => new Date(row.getValue('dateOfBirth')).toLocaleDateString(),
    },
    {
      accessorKey: 'bloodGroup',
      header: 'Blood Group',
      cell: ({ row }) => {
        const bg = row.getValue('bloodGroup');
        return bg ? (
          <Badge>{bg as string}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'emergencyContact',
      header: 'Emergency Contact',
      cell: ({ row }) => {
        const contact = row.original.emergencyContact;
        return contact ? (
          <div className="text-sm">
            <span className="font-medium">{contact.name}</span>
            <span className="text-muted-foreground ml-1">({contact.relationship})</span>
          </div>
        ) : (
          <span className="text-muted-foreground">None</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingPatient(patient);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                setDeletePatient(patient);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      <PatientModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
        onSubmit={handleCreate}
        isLoading={isCreating}
        existingUserIds={existingUserIds}
      />

      <PatientModal
        isOpen={!!editingPatient}
        onClose={() => {
          setEditingPatient(undefined);
        }}
        onSubmit={handleUpdate}
        patient={editingPatient}
        isLoading={isUpdating}
        existingUserIds={existingUserIds}
      />

      <AlertDialog
        open={!!deletePatient}
        onOpenChange={(open) => {
          if (!open) setDeletePatient(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient profile for{' '}
              <span className="font-medium">{deletePatient?.user?.name ?? 'this user'}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                void handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
