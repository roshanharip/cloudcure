import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface MessageDocument extends Message, Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiver: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Prop({ default: false })
  isRead: boolean;

  // Optional appointment context for scoped chat
  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: false })
  appointmentId?: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient queries
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });
MessageSchema.index({ appointmentId: 1, createdAt: 1 });
