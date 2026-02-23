import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty({ message: 'Patient ID is required' })
  @IsString()
  patient: string;

  @ApiProperty({
    description: 'Doctor ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty({ message: 'Doctor ID is required' })
  @IsString()
  doctor: string;

  @ApiProperty({
    description: 'Scheduled date (ISO 8601 format)',
    example: '2026-02-01',
  })
  @IsNotEmpty({ message: 'Scheduled date is required' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({
    description: 'Scheduled time (24-hour format HH:mm)',
    example: '14:30',
  })
  @IsNotEmpty({ message: 'Scheduled time is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format (24-hour)',
  })
  scheduledTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @ApiProperty({
    description: 'Consultation fee',
    example: 100,
  })
  @IsNotEmpty({ message: 'Consultation fee is required' })
  @IsNumber()
  @Min(0)
  consultationFee: number;

  @ApiProperty({
    description: 'Patient notes or reason for appointment',
    example: 'Follow-up checkup for headaches',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
