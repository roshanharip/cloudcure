import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from '../medical-records/schemas/medical-record.schema';
import { Prescription, PrescriptionSchema } from '../prescriptions/schemas/prescription.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
    UsersModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule { }
