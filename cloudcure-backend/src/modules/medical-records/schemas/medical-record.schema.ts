import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Patient } from '@modules/patient/schemas/patient.schema';
import { Doctor } from '@modules/doctor/schemas/doctor.schema';

export type MedicalRecordDocument = MedicalRecord & Document;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Doctor;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ required: true })
  treatment: string;

  @Prop()
  notes: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
