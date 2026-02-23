import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetDoctorProfileMeQuery } from '@/services/doctorsApi';
import { ROLES } from '@/constants';

export interface ProfileCompletion {
    percentage: number;
    missingFields: string[];
    isComplete: boolean;
    isLoading: boolean;
}

export function useProfileCompletion(): ProfileCompletion {
    const { user } = useAuth();

    // Only fetch for doctors
    const shouldFetch = user?.role === ROLES.DOCTOR;
    const { data: doctorResponse, isLoading } = useGetDoctorProfileMeQuery(undefined, { skip: !shouldFetch });

    return useMemo(() => {
        if (!user || user.role !== ROLES.DOCTOR) {
            return { percentage: 100, missingFields: [], isComplete: true, isLoading: false };
        }

        if (isLoading) {
            return { percentage: 0, missingFields: [], isComplete: false, isLoading: true };
        }

        const doctorProfile = doctorResponse?.data;

        if (!doctorProfile) {
            // Profile exists as user, but doctor record missing or not loaded
            return {
                percentage: 0,
                missingFields: ['specialization', 'licenseNumber', 'yearsOfExperience', 'consultationFee'],
                isComplete: false,
                isLoading: false
            };
        }

        const fields = [
            { key: 'specialization', label: 'Specialization', check: (val: any) => val && val.toString().trim().length > 0 && val !== 'General Practice' },
            { key: 'licenseNumber', label: 'License Number', check: (val: any) => val && val.toString().trim().length > 0 && val !== 'PENDING' },
            { key: 'yearsOfExperience', label: 'Years of Experience', check: (val: any) => val !== undefined && val !== null }, // Allow 0
            { key: 'consultationFee', label: 'Consultation Fee', check: (val: any) => val !== undefined && val !== null && Number(val) > 0 },
        ];

        const missingFields: string[] = [];
        let completedCount = 0;

        fields.forEach(field => {
            const val = (doctorProfile as any)[field.key];
            const isFilled = field.check(val);

            if (isFilled) {
                completedCount++;
            } else {
                missingFields.push(field.label);
            }
        });

        const percentage = Math.round((completedCount / fields.length) * 100);

        return {
            percentage,
            missingFields,
            isComplete: percentage === 100,
            isLoading: false
        };
    }, [user, doctorResponse, isLoading]);
}

