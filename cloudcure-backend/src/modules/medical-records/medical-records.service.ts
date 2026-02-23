import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MedicalRecord,
  MedicalRecordDocument,
} from './schemas/medical-record.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
  ) {}

  async create(
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordDocument> {
    const createdMedicalRecord = new this.medicalRecordModel(
      createMedicalRecordDto,
    );
    return createdMedicalRecord.save();
  }

  async findAll(
    paginationDto: PaginationDto = { page: 1, limit: 10 },
    filter?: { patient?: string; doctor?: string },
  ): Promise<BasePaginationResponse<MedicalRecord>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    interface MedicalRecordFilter {
      patient?: Types.ObjectId;
      doctor?: Types.ObjectId;
    }

    const mongoFilter: MedicalRecordFilter = {};
    if (filter?.patient) {
      mongoFilter.patient = new Types.ObjectId(filter.patient);
    }
    if (filter?.doctor) {
      mongoFilter.doctor = new Types.ObjectId(filter.doctor);
    }

    const [items, totalItems] = await Promise.all([
      this.medicalRecordModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .find(mongoFilter as any)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'patient',
          populate: { path: 'user' },
        })
        .populate({
          path: 'doctor',
          populate: { path: 'user' },
        })
        .exec(),
      this.medicalRecordModel
        .countDocuments(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mongoFilter as any,
        )
        .exec(),
    ]);

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<MedicalRecordDocument | null> {
    return this.medicalRecordModel
      .findById(id)
      .populate({
        path: 'patient',
        populate: { path: 'user' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user' },
      })
      .exec();
  }

  async update(
    id: string,
    updateMedicalRecordDto: Partial<CreateMedicalRecordDto>,
  ): Promise<MedicalRecordDocument | null> {
    return this.medicalRecordModel
      .findByIdAndUpdate(id, updateMedicalRecordDto, { new: true })
      .populate('patient doctor')
      .exec();
  }

  async remove(id: string): Promise<MedicalRecordDocument | null> {
    return this.medicalRecordModel.findByIdAndDelete(id).exec();
  }
}
