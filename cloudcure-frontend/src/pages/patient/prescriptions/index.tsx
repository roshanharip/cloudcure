import { useState } from 'react';
import { useGetPrescriptionsQuery } from '@/services/prescriptionsApi';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Calendar, User } from 'lucide-react';
import type { Prescription } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientPrescriptionsPage(): React.ReactElement {
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

    const { data: prescriptionsResponse, isLoading } = useGetPrescriptionsQuery({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
    });

    const prescriptions = prescriptionsResponse?.items ?? [];
    const totalPages = prescriptionsResponse?.totalPages ?? 0;

    const columns: ColumnDef<Prescription>[] = [
        {
            accessorKey: 'createdAt',
            header: 'Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(row.getValue('createdAt')).toLocaleDateString()}
                </div>
            ),
        },
        {
            accessorKey: 'doctor',
            header: 'Doctor',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium text-sm">Dr. {row.original.doctor?.user?.name ?? 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{row.original.doctor?.specialization}</div>
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
                        {meds.map((m, i) => (
                            <div key={i} className="text-xs">
                                <span className="font-semibold text-zinc-900">{m.name}</span>
                                <span className="text-muted-foreground ml-1">({m.dosage}) - {m.frequency}</span>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'instructions',
            header: 'Instructions',
            cell: ({ row }) => (
                <div className="max-w-[300px] text-xs text-muted-foreground italic truncate" title={row.original.instructions}>
                    "{row.original.instructions}"
                </div>
            ),
        },
        {
            accessorKey: 'validUntil',
            header: 'Valid Until',
            cell: ({ row }) => {
                const date = new Date(row.original.validUntil);
                const isExpired = date < new Date();
                return (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {date.toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                    </span>
                );
            }
        }
    ];

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Prescriptions</h1>
                <p className="text-muted-foreground mt-1">View and track all medications issued to you by your doctors.</p>
            </div>

            <Card className="border-zinc-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Active & Past Prescriptions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={prescriptions}
                        pageCount={totalPages}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {prescriptions.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl">
                    <FileText className="h-12 w-12 text-zinc-300 mb-3" />
                    <h3 className="text-lg font-medium text-zinc-900">No prescriptions found</h3>
                    <p className="text-zinc-500 text-sm">Once a doctor issues you a prescription, it will appear here.</p>
                </div>
            )}
        </div>
    );
}
