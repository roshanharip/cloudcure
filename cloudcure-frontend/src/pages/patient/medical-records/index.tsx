import { useState } from 'react';
import { useGetMedicalRecordsQuery } from '@/services/medicalRecordsApi';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { ClipboardList, Calendar, User, Activity } from 'lucide-react';
import type { MedicalRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientMedicalRecordsPage(): React.ReactElement {
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

    const { data: recordsResponse, isLoading } = useGetMedicalRecordsQuery({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
    });

    const records = recordsResponse?.items ?? [];
    const totalPages = recordsResponse?.totalPages ?? 0;

    const columns: ColumnDef<MedicalRecord>[] = [
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
            header: 'Consulting Doctor',
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
            accessorKey: 'diagnosis',
            header: 'Diagnosis',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="font-medium text-sm">{row.getValue('diagnosis')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'symptoms',
            header: 'Symptoms',
            cell: ({ row }) => {
                const symptoms = row.original.symptoms;
                return (
                    <div className="flex flex-wrap gap-1">
                        {symptoms.map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-normal border-zinc-100">
                                {s}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Medical Records</h1>
                <p className="text-muted-foreground mt-1">Access your health history and clinical summaries from your consultations.</p>
            </div>

            <Card className="border-zinc-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Clinical Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={records}
                        pageCount={totalPages}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {records.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl">
                    <ClipboardList className="h-12 w-12 text-zinc-300 mb-3" />
                    <h3 className="text-lg font-medium text-zinc-900">No medical records yet</h3>
                    <p className="text-zinc-500 text-sm">Your medical history will appear here as you complete consultations.</p>
                </div>
            )}
        </div>
    );
}
