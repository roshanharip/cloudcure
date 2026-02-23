import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Patient } from '@modules/patient/schemas/patient.schema';
import { Doctor } from '@modules/doctor/schemas/doctor.schema';

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Doctor;

  @Prop({ type: Types.ObjectId, ref: 'MedicalRecord', required: true })
  medicalRecord: Types.ObjectId;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    required: true,
  })
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
