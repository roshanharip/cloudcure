import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useGetAppointmentsQuery } from '@/services/appointmentsApi';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Search,
    Pill,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MedicalHistorySheet } from './components/MedicalHistorySheet';
import { AddMedicalRecordDialog } from './components/AddMedicalRecordDialog';
import { AddPrescriptionDialog } from './components/AddPrescriptionDialog';

// Utility to get consistent patient data from appointment object
const getPatientInfo = (apt: any) => {
    if (!apt.patient) return null;
    let userId, name, email;

    // Robust extraction handling unpopulated vs populated user fields
    if (apt.patient.user && typeof apt.patient.user === 'object') {
        userId = apt.patient.user._id || apt.patient.user.id;
        name = apt.patient.user.name || 'Unknown Patient';
        email = apt.patient.user.email || '';
    } else {
        userId = apt.patient.user || apt.patient._id;
        name = apt.patient.name || 'Unknown Patient';
        email = apt.patient.email || '';
    }

    if (!userId) return null;

    return {
        patientProfileId: apt.patient._id,
        userId: userId,
        name: name,
        email: email,
        bloodGroup: apt.patient.bloodGroup,
        gender: apt.patient.gender
    };
};

export default function DoctorPatientsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
    const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);

    const { data: appointmentsData, isLoading } = useGetAppointmentsQuery({
        doctor: user?.id,
        page: 1,
        limit: 500, // Fetch a larger chunk for client-side aggregation
    });

    const appointments = appointmentsData?.items ?? [];

    // Extract unique patients with memoization
    const patients = useMemo(() => {
        const uniquePatientsMap = new Map();

        appointments.forEach(apt => {
            const info = getPatientInfo(apt);
            if (!info) return;

            if (!uniquePatientsMap.has(info.userId)) {
                uniquePatientsMap.set(info.userId, {
                    ...info,
                    lastVisit: apt.scheduledDate,
                    totalVisits: 1
                });
            } else {
                const p = uniquePatientsMap.get(info.userId);
                p.totalVisits += 1;
                if (new Date(apt.scheduledDate) > new Date(p.lastVisit)) {
                    p.lastVisit = apt.scheduledDate;
                }
            }
        });

        const allPatients = Array.from(uniquePatientsMap.values());

        // Filter by search query
        if (!searchQuery.trim()) return allPatients;
        const lowerQ = searchQuery.toLowerCase();
        return allPatients.filter(p =>
            p.name.toLowerCase().includes(lowerQ) ||
            p.email.toLowerCase().includes(lowerQ)
        );
    }, [appointments, searchQuery]);

    const handleMessage = (patient: any) => {
        navigate(`/doctor/chat?patientId=${patient.userId}&patientName=${encodeURIComponent(patient.name)}`);
    };

    const openHistory = (patient: any) => {
        setSelectedPatient(patient);
        setIsHistoryOpen(true);
    };

    const openAddRecord = (patient: any) => {
        setSelectedPatient(patient);
        setIsAddRecordOpen(true);
    };

    const openAddPrescription = (patient: any) => {
        setSelectedPatient(patient);
        setIsAddPrescriptionOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center text-muted-foreground">Loading patients...</div>;
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
                    <p className="text-muted-foreground">Manage records, prescriptions, and communication.</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {patients.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-slate-50 border-dashed">
                        No patients found matching your search.
                    </div>
                ) : patients.map((patient: any) => (
                    <Card key={patient.userId} className="overflow-hidden hover:border-primary/50 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/10">
                                <AvatarFallback className="bg-primary/5 text-primary text-lg">
                                    {patient.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="truncate text-lg">{patient.name}</CardTitle>
                                <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    {patient.bloodGroup && (
                                        <Badge variant="secondary" className="text-xs">{patient.bloodGroup}</Badge>
                                    )}
                                    {patient.gender && (
                                        <Badge variant="outline" className="text-xs uppercase bg-white">{patient.gender}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-md border">
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Total Visits</span>
                                    <span className="font-semibold text-lg">{patient.totalVisits}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Latest Visit</span>
                                    <span className="font-medium text-slate-700">{format(new Date(patient.lastVisit), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-slate-50 border-t flex flex-wrap gap-2 pt-4 justify-center">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleMessage(patient)}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                            </Button>

                            <div className="w-full flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-primary/20 hover:bg-primary/5"
                                    onClick={() => openHistory(patient)}
                                >
                                    <Activity className="mr-2 h-4 w-4 text-emerald-600" /> Records
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-primary/20 hover:bg-primary/5"
                                    onClick={() => openAddRecord(patient)}
                                >
                                    <Activity className="mr-2 h-4 w-4 text-emerald-600" /> Add Rec
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-primary/20 hover:bg-primary/5"
                                    onClick={() => openAddPrescription(patient)}
                                >
                                    <Pill className="mr-2 h-4 w-4 text-violet-600" /> Add Rx
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {selectedPatient && (
                <>
                    <MedicalHistorySheet
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        patientId={selectedPatient.patientProfileId}
                        patientName={selectedPatient.name}
                    />

                    <AddMedicalRecordDialog
                        isOpen={isAddRecordOpen}
                        onClose={() => setIsAddRecordOpen(false)}
                        patientId={selectedPatient.patientProfileId}
                        patientName={selectedPatient.name}
                    />

                    <AddPrescriptionDialog
                        isOpen={isAddPrescriptionOpen}
                        onClose={() => setIsAddPrescriptionOpen(false)}
                        patientId={selectedPatient.patientProfileId}
                        patientName={selectedPatient.name}
                    />
                </>
            )}
        </div>
    );
}
