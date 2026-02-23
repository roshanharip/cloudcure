import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, enum: Role, default: Role.PATIENT })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  @Prop({ type: Object, default: {} })
  dashboardPreferences?: {
    layout?: any[];
    visibleWidgets?: string[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
