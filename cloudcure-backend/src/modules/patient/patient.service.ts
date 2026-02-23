import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Role } from '@common/enums/role.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';
import { UsersService } from '../users/users.service';

import {
  MedicalRecord,
  MedicalRecordDocument,
} from '../medical-records/schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionDocument,
} from '../prescriptions/schemas/prescription.schema';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    private readonly usersService: UsersService,
  ) { }

  async create(createPatientDto: Record<string, any>): Promise<Patient> {
    try {
      const { userId, ...patientData } = createPatientDto;
      const createdPatient = new this.patientModel({
        ...patientData,
        user: new Types.ObjectId(userId),
      });
      return await createdPatient.save();
    } catch (error: unknown) {
      const mongoError = error as { code?: number; name?: string; message?: string };
      if (mongoError.code === 11000) {
        throw new ConflictException(
          'Patient profile already exists for this user',
        );
      }
      if (mongoError.name === 'ValidationError') {
        throw new BadRequestException(mongoError.message);
      }
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto = { page: 1, limit: 10 },
  ): Promise<BasePaginationResponse<Patient>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      this.patientModel.find().populate('user').skip(skip).limit(limit).exec(),
      this.patientModel.countDocuments().exec(),
    ]);

    return {
      items: patients,
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string): Promise<PatientDocument | null> {
    return this.patientModel
      .findOne({
        $or: [
          { user: userId },
          { user: new Types.ObjectId(userId) }
        ]
      } as any)
      .populate('user')
      .exec();
  }

  async getProfile(userId: string): Promise<PatientDocument | null> {
    let patient = await this.findByUserId(userId);
    if (!patient) {
      const user = await this.usersService.findOne(userId);
      if (user && user.role === Role.PATIENT) {
        await this.create({ userId });
        // After creation, find again to get the populated document
        return this.findByUserId(userId);
      }
    }
    return patient;
  }

  async updateProfile(userId: string, updateData: any): Promise<PatientDocument | null> {
    const patient = await this.findByUserId(userId);
    if (!patient) return null;

    // Split updateData into User and Patient updates
    const { name, email, phone, avatar, ...patientUpdates } = updateData;

    // Update User if needed
    if (name || email || phone || avatar) {
      await this.usersService.update(userId, { name, email, phone, avatar });
    }

    // Update Patient document
    return this.patientModel
      .findByIdAndUpdate(patient._id, patientUpdates, { new: true })
      .populate('user')
      .exec();
  }

  async removeByUserId(userId: string): Promise<PatientDocument | null> {
    const patient = await this.findByUserId(userId);
    if (patient) {
      await this.usersService.remove(userId);
    }
    return patient;
  }

  async findOne(id: string): Promise<Patient | null> {
    return this.patientModel.findById(id).populate('user').exec();
  }

  async update(
    id: string,
    updatePatientDto: Partial<Patient>,
  ): Promise<Patient | null> {
    return this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true })
      .populate('user')
      .exec();
  }

  async remove(id: string): Promise<Patient | null> {
    const patient = await this.patientModel.findById(id).exec();
    if (patient) {
      // Delete all related medical records and prescriptions
      interface PatientFilter {
        patient: Types.ObjectId;
      }

      const filter: PatientFilter = { patient: patient._id };

      await Promise.all([
        this.medicalRecordModel
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .deleteMany(filter as any)
          .exec(),
        this.prescriptionModel
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .deleteMany(filter as any)
          .exec(),
      ]);
    }
    return this.patientModel.findByIdAndDelete(id).exec();
  }
}
