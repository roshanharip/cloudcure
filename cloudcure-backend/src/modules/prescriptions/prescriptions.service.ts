import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Prescription,
  PrescriptionDocument,
} from './schemas/prescription.schema';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BasePaginationResponse } from '@common/interfaces/base-pagination-response.interface';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
  ) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionDocument> {
    interface CreatePrescriptionInternal {
      patientId?: string;
      doctorId?: string;
      medicalRecordId?: string;
      [key: string]: unknown;
    }

    const { patientId, doctorId, medicalRecordId, ...rest } =
      createPrescriptionDto as unknown as CreatePrescriptionInternal;

    const createdPrescription = new this.prescriptionModel({
      ...rest,
      patient: patientId,
      doctor: doctorId,
      medicalRecord: medicalRecordId,
    });
    return createdPrescription.save();
  }

  async findAll(
    paginationDto: PaginationDto = { page: 1, limit: 10 },
    filter?: { patient?: string; doctor?: string },
  ): Promise<BasePaginationResponse<Prescription>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    interface PrescriptionFilter {
      patient?: Types.ObjectId;
      doctor?: Types.ObjectId;
    }

    const mongoFilter: PrescriptionFilter = {};
    if (filter?.patient) {
      mongoFilter.patient = new Types.ObjectId(filter.patient);
    }
    if (filter?.doctor) {
      mongoFilter.doctor = new Types.ObjectId(filter.doctor);
    }

    const [items, totalItems] = await Promise.all([
      this.prescriptionModel
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
        .populate('medicalRecord')
        .exec(),
      this.prescriptionModel
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

  async findOne(id: string): Promise<PrescriptionDocument | null> {
    return this.prescriptionModel
      .findById(id)
      .populate({
        path: 'patient',
        populate: { path: 'user' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user' },
      })
      .populate('medicalRecord')
      .exec();
  }

  async update(
    id: string,
    updatePrescriptionDto: Partial<CreatePrescriptionDto>,
  ): Promise<PrescriptionDocument | null> {
    interface UpdatePrescriptionInternal {
      patientId?: string;
      doctorId?: string;
      medicalRecordId?: string;
      [key: string]: unknown;
    }

    const { patientId, doctorId, medicalRecordId, ...rest } =
      updatePrescriptionDto as unknown as UpdatePrescriptionInternal;

    interface UpdatePayload {
      patient?: Types.ObjectId;
      doctor?: Types.ObjectId;
      medicalRecord?: Types.ObjectId;
      [key: string]: unknown;
    }

    const updatePayload: UpdatePayload = { ...rest };

    if (patientId) updatePayload.patient = new Types.ObjectId(patientId);
    if (doctorId) updatePayload.doctor = new Types.ObjectId(doctorId);
    if (medicalRecordId)
      updatePayload.medicalRecord = new Types.ObjectId(medicalRecordId);

    return this.prescriptionModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .populate({
        path: 'patient',
        populate: { path: 'user' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user' },
      })
      .populate('medicalRecord')
      .exec();
  }

  async remove(id: string): Promise<PrescriptionDocument | null> {
    return this.prescriptionModel.findByIdAndDelete(id).exec();
  }
}
