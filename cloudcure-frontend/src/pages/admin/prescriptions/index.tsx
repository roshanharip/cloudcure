import { useState } from 'react';
import {
  useGetPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} from '@/services/prescriptionsApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PrescriptionModal } from '@/components/modals/PrescriptionModal';
import type { Prescription, CreatePrescriptionDto } from '@/types';
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
import { ColumnDef } from '@tanstack/react-table';
import { ROLES } from '@/constants';
import { Edit2, Trash2, Plus } from 'lucide-react';

export default function PrescriptionsManagementPage(): React.ReactElement {
  const { user } = useAuth();
  const canCreate = user?.role === ROLES.ADMIN || user?.role === ROLES.DOCTOR;

  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: prescriptionsResponse, isLoading } = useGetPrescriptionsQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [createPrescription, { isLoading: isCreating }] = useCreatePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] = useUpdatePrescriptionMutation();
  const [deletePrescriptionMutation, { isLoading: isDeleting }] = useDeletePrescriptionMutation();

  const [editingPrescription, setEditingPrescription] = useState<Prescription | undefined>(
    undefined
  );
  const [deletePrescription, setDeletePrescription] = useState<Prescription | undefined>(undefined);

  const prescriptions = prescriptionsResponse?.items ?? [];
  const totalPages = prescriptionsResponse?.totalPages ?? 0;

  const handleCreate = async (data: CreatePrescriptionDto): Promise<void> => {
    try {
      await createPrescription(data).unwrap();
      setIsCreateOpen(false);
    } catch (error) {
      logger.error('Failed to create prescription', error);
    }
  };

  const handleUpdate = async (data: CreatePrescriptionDto): Promise<void> => {
    if (!editingPrescription) return;
    try {
      await updatePrescription({ id: editingPrescription._id, data }).unwrap();
      setEditingPrescription(undefined);
    } catch (error) {
      logger.error('Failed to update prescription', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletePrescription) return;
    try {
      await deletePrescriptionMutation(deletePrescription._id).unwrap();
      setDeletePrescription(undefined);
    } catch (error) {
      logger.error('Failed to delete prescription', error);
    }
  };

  const columns: ColumnDef<Prescription>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Issue Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => new Date(row.getValue('validUntil')).toLocaleDateString(),
    },
    {
      accessorKey: 'patient',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.patient?.user?.name ?? 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.patient?.user?.email ?? 'N/A'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'medications',
      header: 'Medications',
      cell: ({ row }) => {
        const meds = row.original.medications;
        return (
          <div className="flex flex-col gap-1">
            {meds.slice(0, 2).map((m, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium">{m.name}</span>{' '}
                <span className="text-muted-foreground">- {m.dosage}</span>
              </div>
            ))}
            {meds.length > 2 && (
              <span className="text-xs text-muted-foreground">+{meds.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const prescription = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canCreate}
              onClick={() => {
                setEditingPrescription(prescription);
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
                setDeletePrescription(prescription);
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
        <h2 className="text-3xl font-bold tracking-tight">Prescriptions</h2>
        {canCreate && (
          <Button
            onClick={() => {
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue Prescription
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={prescriptions}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {canCreate && (
        <>
          <PrescriptionModal
            isOpen={!!editingPrescription}
            onClose={() => {
              setEditingPrescription(undefined);
            }}
            onSubmit={handleUpdate}
            prescription={editingPrescription}
            isLoading={isUpdating}
          />

          <PrescriptionModal
            isOpen={isCreateOpen}
            onClose={() => {
              setIsCreateOpen(false);
            }}
            onSubmit={handleCreate}
            isLoading={isCreating}
          />
        </>
      )}

      <AlertDialog
        open={!!deletePrescription}
        onOpenChange={(open) => {
          if (!open) {
            setDeletePrescription(undefined);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently revoke the prescription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deletePrescription) {
                  void handleDelete();
                }
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
