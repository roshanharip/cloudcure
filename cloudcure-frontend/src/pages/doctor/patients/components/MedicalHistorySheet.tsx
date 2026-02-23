import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useGetMedicalRecordsQuery } from '@/services/medicalRecordsApi';
import { useGetPrescriptionsQuery } from '@/services/prescriptionsApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Activity, Pill, Clock } from 'lucide-react';

interface MedicalHistorySheetProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

export function MedicalHistorySheet({ isOpen, onClose, patientId, patientName }: MedicalHistorySheetProps) {
    const { data: recordsData, isLoading: loadingRecords } = useGetMedicalRecordsQuery(
        { patientId, limit: 100 },
        { skip: !isOpen || !patientId }
    );

    const { data: prescriptionsData, isLoading: loadingPrescriptions } = useGetPrescriptionsQuery(
        { patientId, limit: 100 },
        { skip: !isOpen || !patientId }
    );

    const records = recordsData?.items || [];
    const prescriptions = prescriptionsData?.items || [];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Medical History
                    </SheetTitle>
                    <SheetDescription>
                        Complete medical records and prescriptions for <span className="font-semibold text-foreground">{patientName}</span>.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="records" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="records">Clinical Records</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="records" className="space-y-4">
                        {loadingRecords ? (
                            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading records...</div>
                        ) : records.length === 0 ? (
                            <div className="py-12 text-center border border-dashed rounded-lg bg-slate-50">
                                <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">No clinical records found for this patient.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {records.map((record) => (
                                    <Card key={record._id || record.id} className="shadow-sm">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg text-primary">{record.diagnosis}</CardTitle>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date((record as any).date || record.createdAt), 'MMM d, yyyy')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Treatment</h4>
                                                <p className="text-sm">{record.treatment}</p>
                                            </div>
                                            {record.notes && (
                                                <div>
                                                    <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Notes</h4>
                                                    <p className="text-sm bg-slate-50 p-2 rounded border border-slate-100">{record.notes}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="prescriptions" className="space-y-4">
                        {loadingPrescriptions ? (
                            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading prescriptions...</div>
                        ) : prescriptions.length === 0 ? (
                            <div className="py-12 text-center border border-dashed rounded-lg bg-slate-50">
                                <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">No prescriptions found for this patient.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prescriptions.map((script) => (
                                    <Card key={script._id || script.id} className="shadow-sm overflow-hidden">
                                        <CardHeader className="bg-slate-50 pb-3 border-b">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-md flex items-center gap-2">
                                                        <Pill className="h-4 w-4 text-violet-500" />
                                                        Prescription Record
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Valid until {format(new Date(script.validUntil), 'MMM d, yyyy')}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={new Date(script.validUntil) < new Date() ? "secondary" : "default"}>
                                                    {new Date(script.validUntil) < new Date() ? 'Expired' : 'Active'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Medications</h4>
                                                    <div className="divide-y border rounded-md">
                                                        {script.medications?.map((med: any, i: number) => (
                                                            <div key={i} className="p-2.5 text-sm flex grid grid-cols-2 md:grid-cols-4 gap-2 items-center bg-white">
                                                                <span className="font-medium text-primary col-span-2 md:col-span-1">{med.name}</span>
                                                                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs w-fit">{med.dosage}</span>
                                                                <span className="text-slate-600 truncate">{med.frequency}</span>
                                                                <span className="text-slate-500 text-right text-xs">{med.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {script.instructions && (
                                                    <div>
                                                        <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Instructions</h4>
                                                        <p className="text-sm text-slate-700">{script.instructions}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
