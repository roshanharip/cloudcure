import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '@common/enums/role.enum';
import { UsersService } from '../users/users.service';

import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';

import {
  MedicalRecord,
  MedicalRecordDocument,
} from '../medical-records/schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionDocument,
} from '../prescriptions/schemas/prescription.schema';
import {
  Appointment,
  AppointmentDocument,
  AppointmentStatus,
} from '../appointments/schemas/appointment.schema';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    private readonly usersService: UsersService,
  ) { }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    try {
      const { userId, ...rest } = createDoctorDto;
      const createdDoctor = new this.doctorModel({
        ...rest,
        user: userId,
      });
      return await createdDoctor.save();
    } catch (error: unknown) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        throw new ConflictException(
          'Doctor profile already exists for this user',
        );
      }
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<BasePaginationResponse<Doctor>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      this.doctorModel.find().populate('user').skip(skip).limit(limit).exec(),
      this.doctorModel.countDocuments().exec(),
    ]);

    return {
      items: doctors,
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Doctor | null> {
    return this.doctorModel.findById(id).populate('user').exec();
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    return this.doctorModel.findOne({
      $or: [
        { user: userId },
        { user: new Types.ObjectId(userId) as any }
      ]
    }).exec();
  }

  async update(
    id: string,
    updateDoctorDto: Partial<Doctor>,
  ): Promise<Doctor | null> {
    return this.doctorModel
      .findByIdAndUpdate(id, updateDoctorDto, { new: true })
      .populate('user')
      .exec();
  }

  async remove(id: string): Promise<Doctor | null> {
    const doctor = await this.doctorModel.findById(id).exec();
    if (doctor) {
      // Delete all related medical records and prescriptions
      interface DoctorFilter {
        doctor: Types.ObjectId;
      }

      const filter: DoctorFilter = { doctor: doctor._id };

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
    return this.doctorModel.findByIdAndDelete(id).exec();
  }

  async getDashboardStats(userId: string) {
    // First find doctor profile for this user
    const doctor = await this.getDoctorProfile(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctorIds: any[] = [
      doctor._id,
      (doctor.user as any)?._id || doctor.user,
      String(doctor._id),
      String((doctor.user as any)?._id || doctor.user)
    ];

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalPatients,
    ] = await Promise.all([
      this.appointmentModel.countDocuments({ doctor: { $in: doctorIds } as any }),
      this.appointmentModel.countDocuments({
        doctor: { $in: doctorIds } as any,
        scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      }),
      this.appointmentModel.countDocuments({
        doctor: { $in: doctorIds } as any,
        status: AppointmentStatus.SCHEDULED,
      }),
      // distinct patients count
      this.appointmentModel.distinct('patient', { doctor: { $in: doctorIds } as any }),
    ]);

    return {
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalPatients: totalPatients.length,
    };
  }
  async getDoctorProfile(userId: string) {
    let doctor = await this.doctorModel.findOne({
      $or: [
        { user: userId },
        { user: new Types.ObjectId(userId) as any }
      ]
    });

    if (!doctor) {
      const user = await this.usersService.findOne(userId);
      if (user && user.role === Role.DOCTOR) {
        doctor = await this.doctorModel.create({
          user: new Types.ObjectId(userId) as any,
          specialization: 'General Practice', // Default specialization
          licenseNumber: 'PENDING',
          yearsOfExperience: 0,
          consultationFee: 0,
        });
      } else {
        throw new NotFoundException('Doctor profile not found');
      }
    }
    return doctor;
  }

  async updateAvailability(userId: string, updateData: any) {
    const doctorProfile = await this.getDoctorProfile(userId);
    const doctor = await this.doctorModel.findByIdAndUpdate(
      doctorProfile._id,
      { $set: updateData },
      { new: true },
    );
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    return doctor;
  }
}
