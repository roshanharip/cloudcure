import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Doctor, DoctorDocument } from '../doctor/schemas/doctor.schema';
import { Patient, PatientDocument } from '../patient/schemas/patient.schema';
import {
  MedicalRecord,
  MedicalRecordDocument,
} from '../medical-records/schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionDocument,
} from '../prescriptions/schemas/prescription.schema';

interface RevenueAggregation {
  _id: null;
  totalRevenue: number;
}

interface PopulatedMedicalRecord {
  _id: Types.ObjectId;
  patient: {
    user: {
      name: string;
    };
  };
  doctor: {
    user: {
      name: string;
    };
  };
  createdAt: Date;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalRecords,
      totalPrescriptions,
      recentActivity,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.doctorModel.countDocuments(),
      this.patientModel.countDocuments(),
      this.medicalRecordModel.countDocuments(),
      this.prescriptionModel.countDocuments(),
      this.getRecentActivity(),
    ]);

    const revenue = await this.calculateEstimatedRevenue();

    return {
      counts: {
        users: totalUsers,
        doctors: totalDoctors,
        patients: totalPatients,
        medicalRecords: totalRecords,
        prescriptions: totalPrescriptions,
      },
      revenue,
      recentActivity,
    };
  }

  private async calculateEstimatedRevenue(): Promise<number> {
    // Logic: Sum of (Doctor Consultation Fee * Number of Records for that Doctor)
    // For simplicity/performance: Just sum all doctor fees for now as a base "potential per visit" or
    // better: Aggregate MedicalRecords, lookup Doctor, sum fee.

    // Simple Aggregation Pipeline
    const revenueStats =
      await this.medicalRecordModel.aggregate<RevenueAggregation>([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo',
          },
        },
        {
          $unwind: '$doctorInfo',
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$doctorInfo.consultationFee' },
          },
        },
      ]);

    return revenueStats[0]?.totalRevenue ?? 0;
  }

  private async getRecentActivity() {
    // Get last 5 medical records with details
    const records = await this.medicalRecordModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .lean<PopulatedMedicalRecord[]>();

    return records.map((r) => ({
      type: 'medical_record' as const,
      id: r._id.toString(),
      description: `New record for ${r.patient.user.name}`,
      date: r.createdAt,
      doctorName: r.doctor.user.name,
    }));
  }
}
