import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty({ message: 'Doctor ID is required' })
  @IsString()
  doctor: string;

  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsNotEmpty({ message: 'Day of week is required' })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time (24-hour format HH:mm)',
    example: '09:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:mm format (24-hour)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time (24-hour format HH:mm)',
    example: '17:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:mm format (24-hour)',
  })
  endTime: string;

  @ApiProperty({
    description: 'Duration of each appointment slot in minutes',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  slotDuration?: number;

  @ApiProperty({
    description: 'Whether this availability is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
