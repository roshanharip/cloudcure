import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TERMINATED = 'terminated',
  NO_SHOW = 'no-show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Patient' })
  patient: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  scheduledTime: string; // Format: "HH:mm"

  @Prop({ default: 30 })
  duration: number; // in minutes

  @Prop({
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Prop({ required: true })
  consultationFee: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop()
  notes?: string; // Patient's notes

  @Prop()
  doctorNotes?: string; // Doctor's notes after consultation

  @Prop({ type: Types.ObjectId, ref: 'Prescription' })
  prescription?: Types.ObjectId;

  @Prop()
  actualDuration?: number; // Actual duration in minutes

  @Prop()
  finalFee?: number; // Final calculated fee based on actual duration

  // Lifecycle timestamps
  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop()
  terminatedAt?: Date;

  @Prop()
  terminationReason?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Indexes for efficient querying
AppointmentSchema.index({ patient: 1, scheduledDate: -1 });
AppointmentSchema.index({ doctor: 1, scheduledDate: -1 });
AppointmentSchema.index({ status: 1 });
