import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@modules/users/schemas/user.schema';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  gender: string;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop()
  bloodGroup: string;

  @Prop()
  address: string;

  @Prop({ type: Object })
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop()
  insuranceProvider: string;

  @Prop()
  insurancePolicyNumber: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
