import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from '../medical-records/schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionSchema,
} from '../prescriptions/schemas/prescription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
