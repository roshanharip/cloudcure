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
import { useCreatePrescriptionMutation } from '@/services/prescriptionsApi';
import { useGetMedicalRecordsQuery } from '@/services/medicalRecordsApi';
import { useAuth } from '@/hooks/useAuth';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddPrescriptionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

export function AddPrescriptionDialog({ isOpen, onClose, patientId, patientName }: AddPrescriptionDialogProps) {
    const { user } = useAuth();
    const [createPrescription, { isLoading }] = useCreatePrescriptionMutation();
    const { data: recordsData } = useGetMedicalRecordsQuery(
        { patientId, limit: 100 },
        { skip: !isOpen || !patientId }
    );
    const records = recordsData?.items || [];

    const [formData, setFormData] = useState({
        medicalRecordId: '',
        instructions: '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 days
    });

    const [medications, setMedications] = useState<any[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMedChange = (index: number, field: string, value: string) => {
        const updated = [...medications];
        updated[index] = { ...updated[index], [field]: value };
        setMedications(updated);
    };

    const addMedicationRow = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedicationRow = (index: number) => {
        if (medications.length === 1) return;
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id && !user?._id) return;

        // Validation
        if (!formData.medicalRecordId) {
            toast.error('Please select a reference medical record');
            return;
        }

        const validMeds = medications.filter(m => m.name && m.dosage && m.frequency && m.duration).map(m => ({
            name: m.name || '',
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || ''
        }));
        if (validMeds.length === 0) {
            toast.error('Please add at least one complete medication');
            return;
        }

        try {
            await createPrescription({
                patientId,
                doctorId: user.id || user._id,
                medicalRecordId: formData.medicalRecordId,
                instructions: formData.instructions,
                validUntil: new Date(formData.validUntil as string).toISOString(),
                medications: validMeds as any // bypass strict type inference to allow any array contents
            }).unwrap();

            toast.success('Prescription created successfully');

            // Reset
            setFormData({
                medicalRecordId: '',
                instructions: '',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
            onClose();
        } catch (error) {
            console.error('Failed to create prescription:', error);
            toast.error('Failed to add prescription');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-violet-500" />
                            Create Prescription
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        <div className="bg-slate-50 p-3 rounded-md border text-sm grid grid-cols-2">
                            <div>
                                <span className="text-muted-foreground block text-xs">Patient</span>
                                <span className="font-medium text-slate-800">{patientName}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="medicalRecordId">Linked Medical Record</Label>
                                <select
                                    id="medicalRecordId"
                                    name="medicalRecordId"
                                    required
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.medicalRecordId}
                                    onChange={handleFormChange as any}
                                >
                                    <option value="" disabled>Select a recent diagnosis...</option>
                                    {records.map(rec => {
                                        const recDate = (rec as any).date || rec.createdAt;
                                        return (
                                            <option key={rec._id || rec.id} value={rec._id || rec.id}>
                                                {rec.diagnosis} ({new Date(recDate).toLocaleDateString()})
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validUntil">Valid Until</Label>
                                <Input
                                    id="validUntil"
                                    name="validUntil"
                                    type="date"
                                    required
                                    value={formData.validUntil}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <Label>Medications</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addMedicationRow} className="h-8 text-xs">
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="rounded-md border divide-y overflow-hidden">
                                {medications.map((med, index) => (
                                    <div key={index} className="p-3 bg-slate-50 grid grid-cols-12 gap-2 items-start relative pb-8 md:pb-3">
                                        <div className="col-span-12 md:col-span-3">
                                            <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Drug</Label>
                                            <Input
                                                placeholder="Amoxicillin"
                                                className="h-8"
                                                value={med.name}
                                                required
                                                onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Dosage</Label>
                                            <Input
                                                placeholder="500mg"
                                                className="h-8"
                                                value={med.dosage}
                                                required
                                                onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Frequency</Label>
                                            <Input
                                                placeholder="Twice daily"
                                                className="h-8"
                                                value={med.frequency}
                                                required
                                                onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-11 md:col-span-2">
                                            <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Duration</Label>
                                            <Input
                                                placeholder="7 Days"
                                                className="h-8"
                                                value={med.duration}
                                                required
                                                onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-1 flex justify-end items-end absolute right-2 bottom-2 md:static md:bottom-auto">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                tabIndex={-1}
                                                onClick={() => removeMedicationRow(index)}
                                                disabled={medications.length === 1}
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructions">General Instructions</Label>
                            <Textarea
                                id="instructions"
                                name="instructions"
                                placeholder="Take with food, avoid alcohol..."
                                rows={2}
                                value={formData.instructions}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700">
                            {isLoading ? 'Issuing...' : 'Issue Prescription'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
