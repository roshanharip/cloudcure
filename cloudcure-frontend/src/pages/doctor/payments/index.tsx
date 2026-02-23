import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetAppointmentsQuery } from '@/services/appointmentsApi';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { DollarSign, Loader2, Save } from 'lucide-react';


export default function DoctorPaymentsPage() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Mock state for bank details
    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
    });

    const { data: appointmentsData, isLoading } = useGetAppointmentsQuery({
        doctor: user?.id,
        page: 1,
        limit: 100,
    });

    useEffect(() => {
        // Load mock data
        const saved = localStorage.getItem('doctor_bank_details');
        if (saved) {
            setBankDetails(JSON.parse(saved));
        } else if (user) {
            setBankDetails(prev => ({ ...prev, accountHolder: user.name }));
        }
    }, [user]);

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('doctor_bank_details', JSON.stringify(bankDetails));
            localStorage.setItem('doctor_consultation_fee', '500'); // Mock
            setIsSaving(false);
            alert('Payment settings saved successfully');
        }, 1000);
    };

    const appointments = appointmentsData?.items ?? [];
    const paidAppointments = appointments.filter(apt => apt.paymentStatus === 'paid');
    const totalEarnings = paidAppointments.reduce((sum, apt) => sum + apt.consultationFee, 0);

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments & Earnings</h1>
                <p className="text-muted-foreground">Track income and manage payment details.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalEarnings}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings from platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid Appointments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{paidAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">Successful transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                    <TabsTrigger value="settings">Payment Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Recent payments received from patients.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paidAppointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">No payment history found.</TableCell>
                                        </TableRow>
                                    ) : paidAppointments.map((apt) => (
                                        <TableRow key={apt._id}>
                                            <TableCell>{format(new Date(apt.scheduledDate), 'PP')}</TableCell>
                                            <TableCell>{(apt.patient?.user?.name ?? (apt.patient as unknown as { name?: string })?.name) || 'Unknown'}</TableCell>
                                            <TableCell>Consultation</TableCell>
                                            <TableCell className="font-medium">₹{apt.consultationFee}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-500">Paid</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout Settings</CardTitle>
                            <CardDescription>Manage your bank account details for payouts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                                        <Input
                                            id="accountHolder"
                                            value={bankDetails.accountHolder}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                            placeholder="As per bank records"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            value={bankDetails.bankName}
                                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                            placeholder="e.g. HDFC Bank"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input
                                            id="accountNumber"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                            type="password" // Mask for privacy
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ifscCode">IFSC Code</Label>
                                        <Input
                                            id="ifscCode"
                                            value={bankDetails.ifscCode}
                                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                            placeholder="ABCD0123456"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Details
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Note: Consultations fees are updated in your Profile.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
