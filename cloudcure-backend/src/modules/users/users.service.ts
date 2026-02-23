import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';

import { Role } from '@common/enums/role.enum';
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
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
  ) {
    this.logger.log('UsersService initialized - CASCADE logic active');
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    this.logger.log(
      `[CREATE USER] Starting creation. Email: ${createUserDto.email}`,
    );
    let password = createUserDto.password;
    this.logger.log(
      `[CREATE USER] Password received. Length: ${password?.length}, Trimmed: ${password?.trim().length}`,
    );

    if (password && password.trim().length > 0) {
      this.logger.log('[CREATE USER] Hashing password...');
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      this.logger.log(
        `[CREATE USER] Hashed successfully. Starts with: ${password.substring(0, 10)}`,
      );
    } else {
      this.logger.error('[CREATE USER] ERROR: Password empty or whitespace!');
    }

    const createdUser = new this.userModel({
      ...createUserDto,
      password,
    });
    const result = await createdUser.save();

    // Initialize profile based on role
    if (result.role === Role.PATIENT) {
      await this.patientModel.create({ user: new Types.ObjectId(result._id.toString()) as any });
      this.logger.log(`[CREATE USER] Patient profile initialized for ${result.email}`);
    } else if (result.role === Role.DOCTOR) {
      await this.doctorModel.create({
        user: new Types.ObjectId(result._id.toString()) as any,
        specialization: 'General Practice',
        licenseNumber: 'PENDING',
        yearsOfExperience: 0,
        consultationFee: 0,
      });
      this.logger.log(`[CREATE USER] Doctor profile initialized for ${result.email}`);
    }

    this.logger.log(
      `[CREATE USER] User saved with ID: ${result._id.toString()}`,
    );
    return result;
  }

  async findAll(
    paginationDto: PaginationDto = { page: 1, limit: 10 },
    role?: string,
  ): Promise<BasePaginationResponse<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const filter = role ? { role } : {};

    const [items, totalItems] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      return this.userModel
        .findByIdAndUpdate(
          id,
          { ...updateUserDto, password: hashedPassword },
          { new: true },
        )
        .exec();
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;

    if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorModel
        .findOne({
          $or: [
            { user: user._id },
            { user: user._id.toString() as any }
          ]
        })
        .exec();
      if (doctor) {
        interface DocRecordFilter {
          doctor: Types.ObjectId;
        }
        const filter: DocRecordFilter = { doctor: doctor._id };

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
        await this.doctorModel.findByIdAndDelete(doctor._id).exec();
      }
    } else if (user.role === Role.PATIENT) {
      const patient = await this.patientModel
        .findOne({
          $or: [
            { user: user._id },
            { user: user._id.toString() as any }
          ]
        })
        .exec();
      if (patient) {
        interface PatRecordFilter {
          patient: Types.ObjectId;
        }
        const filter: PatRecordFilter = { patient: patient._id };

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
        await this.patientModel.findByIdAndDelete(patient._id).exec();
      }
    }

    return this.userModel.findByIdAndDelete(id).exec();
  }
}
