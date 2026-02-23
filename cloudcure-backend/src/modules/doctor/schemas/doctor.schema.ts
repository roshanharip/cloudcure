import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@modules/users/schemas/user.schema';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  licenseNumber: string;

  @Prop()
  bio: string;

  @Prop()
  yearsOfExperience: number;

  @Prop()
  consultationFee: number;

  @Prop({ type: [String], default: [] })
  qualifications: string[];

  @Prop({ default: true })
  isAvailableForConsultation: boolean;

  @Prop({ type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] })
  availableDays: string[];

  @Prop({ type: Object, default: { start: '09:00', end: '17:00' } })
  workingHours: { start: string; end: string };
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
