import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { Doctor, DoctorSchema } from '../modules/doctor/schemas/doctor.schema';
import {
  Patient,
  PatientSchema,
} from '../modules/patient/schemas/patient.schema';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from '../modules/medical-records/schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionSchema,
} from '../modules/prescriptions/schemas/prescription.schema';

@Global()
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
  exports: [MongooseModule],
})
export class ModelsModule {}
