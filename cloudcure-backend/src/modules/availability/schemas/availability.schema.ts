import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface DateException {
  date: Date;
  reason?: string;
}

@Schema({ timestamps: true })
export class Availability {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @Prop({ required: true })
  startTime: string; // Format: "HH:mm" (24-hour)

  @Prop({ required: true })
  endTime: string; // Format: "HH:mm" (24-hour)

  @Prop({ default: 30 })
  slotDuration: number; // Minutes per appointment slot

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ date: Date, reason: String }], default: [] })
  exceptions: DateException[]; // Blocked dates
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

// Indexes
AvailabilitySchema.index({ doctor: 1, dayOfWeek: 1 });
AvailabilitySchema.index({ doctor: 1, isActive: 1 });
