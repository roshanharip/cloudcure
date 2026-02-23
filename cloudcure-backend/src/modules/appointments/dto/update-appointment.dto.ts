import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  AppointmentStatus,
  PaymentStatus,
} from '../schemas/appointment.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: "Doctor's notes after consultation",
    required: false,
  })
  @IsOptional()
  @IsString()
  doctorNotes?: string;

  @ApiProperty({
    description: 'Prescription ID if created',
    required: false,
  })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({
    description: 'Reason for termination',
    required: false,
  })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiProperty({
    description: 'Actual duration of the appointment in minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  actualDuration?: number;
}
