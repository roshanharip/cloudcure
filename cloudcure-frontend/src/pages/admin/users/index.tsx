import { useState } from 'react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/services/usersApi';
import { DataTable } from '@/components/DataTable';
import { UserModal } from '@/components/modals/UserModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import type { User, CreateUserDto } from '@/types';
import { logger } from '@/utils/logger';

export default function UsersManagementPage(): React.ReactElement {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState<User | undefined>(undefined);

  // API Hooks
  const { data: usersResponse, isLoading } = useGetUsersQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersResponse?.data.items ?? [];
  const totalPages = usersResponse?.data.totalPages ?? 0;

  // Handlers
  const handleCreate = async (data: CreateUserDto): Promise<void> => {
    try {
      await createUser(data).unwrap();
      setIsCreateOpen(false);
    } catch (error) {
      logger.error('Failed to create user', error);
    }
  };

  const handleUpdate = async (data: CreateUserDto): Promise<void> => {
    if (!editingUser) return;
    try {
      await updateUser({ id: editingUser._id, data }).unwrap();
      setEditingUser(undefined);
    } catch (error) {
      logger.error('Failed to update user', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteUser) return;
    try {
      await deleteUserMutation(deleteUser._id).unwrap();
      setDeleteUser(undefined);
    } catch (error) {
      logger.error('Failed to delete user', error);
    }
  };

  // Columns Configuration
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role');
        return (
          <Badge
            variant={role === 'admin' ? 'default' : role === 'doctor' ? 'secondary' : 'outline'}
          >
            {role as string}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return (
          <Badge
            variant={isActive ? 'outline' : 'destructive'}
            className={isActive ? 'text-green-600 border-green-600' : ''}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingUser(user);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteUser(user);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      <UserModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      {/* Edit Modal */}
      <UserModal
        isOpen={!!editingUser}
        onClose={() => {
          setEditingUser(undefined);
        }}
        onSubmit={handleUpdate}
        user={editingUser}
        isLoading={isUpdating}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => {
          setDeleteUser(undefined);
        }}
        onConfirm={handleDelete}
        title={`Delete User: ${deleteUser?.name ?? 'Unknown'}`}
        isLoading={isDeleting}
      />
    </div>
  );
}
