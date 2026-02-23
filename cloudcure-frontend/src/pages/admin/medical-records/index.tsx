import { useState } from 'react';
import {
  useGetMedicalRecordsQuery,
  useCreateMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
} from '@/services/medicalRecordsApi';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MedicalRecordModal } from '@/components/modals/MedicalRecordModal';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { MedicalRecord, CreateMedicalRecordDto } from '@/types';
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

import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants';

export default function MedicalRecordsManagementPage(): React.ReactElement {
  const { user } = useAuth();
  const canCreate = user?.role === ROLES.ADMIN || user?.role === ROLES.DOCTOR;

  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: recordsResponse, isLoading } = useGetMedicalRecordsQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [createRecord, { isLoading: isCreating }] = useCreateMedicalRecordMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateMedicalRecordMutation();
  const [deleteRecordMutation, { isLoading: isDeleting }] = useDeleteMedicalRecordMutation();

  const [editingRecord, setEditingRecord] = useState<MedicalRecord | undefined>(undefined);
  const [deleteRecord, setDeleteRecord] = useState<MedicalRecord | undefined>(undefined);

  const records = recordsResponse?.items ?? [];
  const totalPages = recordsResponse?.totalPages ?? 0;

  const handleCreate = async (data: CreateMedicalRecordDto): Promise<void> => {
    try {
      await createRecord(data).unwrap();
      setIsCreateOpen(false);
    } catch (error) {
      logger.error('Failed to create medical record', error);
    }
  };

  const handleUpdate = async (data: CreateMedicalRecordDto): Promise<void> => {
    if (!editingRecord) return;
    try {
      await updateRecord({ id: editingRecord._id, data }).unwrap();
      setEditingRecord(undefined);
    } catch (error) {
      logger.error('Failed to update medical record', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteRecord) return;
    try {
      await deleteRecordMutation(deleteRecord._id).unwrap();
      setDeleteRecord(undefined);
    } catch (error) {
      logger.error('Failed to delete medical record', error);
    }
  };

  const columns: ColumnDef<MedicalRecord>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      accessorKey: 'patient.user.name',
      header: 'Patient',
      cell: ({ row }) => row.original.patient?.user?.name ?? 'Unknown',
    },
    {
      accessorKey: 'doctor.user.name',
      header: 'Doctor',
      cell: ({ row }) => row.original.doctor?.user?.name ?? 'Unknown',
    },
    {
      accessorKey: 'diagnosis',
      header: 'Diagnosis',
      cell: ({ row }) => <span className="font-medium">{row.getValue('diagnosis')}</span>,
    },
    {
      accessorKey: 'symptoms',
      header: 'Symptoms',
      cell: ({ row }) => {
        const symptoms = row.original.symptoms;
        return (
          <div className="flex flex-wrap gap-1">
            {symptoms.slice(0, 3).map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
            {symptoms.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{symptoms.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canCreate}
              onClick={() => {
                setEditingRecord(record);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600"
              disabled={!canCreate}
              onClick={() => {
                setDeleteRecord(record);
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
        <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
        {canCreate && (
          <Button
            onClick={() => {
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={records}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {canCreate && (
        <>
          <MedicalRecordModal
            isOpen={isCreateOpen}
            onClose={() => {
              setIsCreateOpen(false);
            }}
            onSubmit={handleCreate}
            isLoading={isCreating}
          />

          <MedicalRecordModal
            isOpen={!!editingRecord}
            onClose={() => {
              setEditingRecord(undefined);
            }}
            onSubmit={handleUpdate}
            record={editingRecord}
            isLoading={isUpdating}
          />
        </>
      )}

      <AlertDialog
        open={!!deleteRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteRecord(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medical record.
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
