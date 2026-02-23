import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMedicalRecordMutation } from '@/services/medicalRecordsApi';
import { useAuth } from '@/hooks/useAuth';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AddMedicalRecordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

export function AddMedicalRecordDialog({ isOpen, onClose, patientId, patientName }: AddMedicalRecordDialogProps) {
    const { user } = useAuth();
    const [createRecord, { isLoading }] = useCreateMedicalRecordMutation();

    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        notes: '',
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id && !user?._id) return;

        try {
            await createRecord({
                patientId,
                doctorId: user.id || user._id,
                diagnosis: formData.diagnosis,
                symptoms: [],
                treatment: formData.treatment,
                notes: formData.notes
            }).unwrap();

            toast.success('Medical record added successfully');

            // Reset form
            setFormData({
                diagnosis: '',
                treatment: '',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
            onClose();
        } catch (error) {
            console.error('Failed to create record:', error);
            toast.error('Failed to add medical record');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Add Medical Record
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="bg-slate-50 p-3 rounded-md border text-sm grid grid-cols-2">
                            <div>
                                <span className="text-muted-foreground block text-xs">Patient</span>
                                <span className="font-medium text-slate-800">{patientName}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date of Record</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="diagnosis">Diagnosis</Label>
                            <Input
                                id="diagnosis"
                                name="diagnosis"
                                placeholder="E.g., Acute Bronchitis"
                                required
                                value={formData.diagnosis}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="treatment">Treatment Plan</Label>
                            <Textarea
                                id="treatment"
                                name="treatment"
                                placeholder="Describe the recommended treatment..."
                                rows={3}
                                required
                                value={formData.treatment}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Clinical Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Any additional observations..."
                                rows={2}
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
