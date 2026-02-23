import { useState } from 'react';
import {
  useGetDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} from '@/services/doctorsApi';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DoctorModal } from '@/components/modals/DoctorModal';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import type { Doctor, CreateDoctorDto } from '@/types';
import { formatCurrency } from '@/utils';
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

export default function DoctorsManagementPage(): React.ReactElement {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: doctorsResponse, isLoading } = useGetDoctorsQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [createDoctor, { isLoading: isCreating }] = useCreateDoctorMutation();
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const [deleteDoctorMutation, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>(undefined);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | undefined>(undefined);

  const doctors = doctorsResponse?.data.items ?? [];
  const totalPages = doctorsResponse?.data.totalPages ?? 0;
  const existingUserIds = doctors.map((d) => d.user?._id ?? d.userId).filter(Boolean);

  const handleCreate = async (data: CreateDoctorDto): Promise<void> => {
    try {
      await createDoctor(data).unwrap();
      setIsCreateOpen(false);
    } catch (error) {
      logger.error('Failed to create doctor', error);
    }
  };

  const handleUpdate = async (data: CreateDoctorDto): Promise<void> => {
    if (!editingDoctor) return;
    try {
      await updateDoctor({ id: editingDoctor._id, data }).unwrap();
      setEditingDoctor(undefined);
    } catch (error) {
      logger.error('Failed to update doctor', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteDoctor) return;
    try {
      await deleteDoctorMutation(deleteDoctor._id).unwrap();
      setDeleteDoctor(undefined);
    } catch (error) {
      logger.error('Failed to delete doctor', error);
    }
  };

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: 'user.name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.user?.name ?? 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{row.original.user?.email ?? 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
    },
    {
      accessorKey: 'yearsOfExperience',
      header: 'Experience',
      cell: ({ row }) => `${String(row.getValue('yearsOfExperience'))} years`,
    },
    {
      accessorKey: 'consultationFee',
      header: 'Fee',
      cell: ({ row }) => formatCurrency(row.getValue('consultationFee')),
    },
    {
      accessorKey: 'licenseNumber',
      header: 'License',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('licenseNumber')}</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingDoctor(row.original);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setDeleteDoctor(row.original);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Doctors</h2>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      <DoctorModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
        onSubmit={handleCreate}
        isLoading={isCreating}
        existingUserIds={existingUserIds}
      />

      <DoctorModal
        isOpen={!!editingDoctor}
        onClose={() => {
          setEditingDoctor(undefined);
        }}
        onSubmit={handleUpdate}
        doctor={editingDoctor}
        isLoading={isUpdating}
        existingUserIds={existingUserIds}
      />

      <AlertDialog
        open={!!deleteDoctor}
        onOpenChange={(open) => {
          if (!open) setDeleteDoctor(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the doctor profile for{' '}
              <span className="font-medium">{deleteDoctor?.user?.name ?? 'this user'}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
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
