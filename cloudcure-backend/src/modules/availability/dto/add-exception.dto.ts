import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddExceptionDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  doctor: string;

  @ApiProperty({
    description: 'Date to block (ISO 8601 format)',
    example: '2026-02-15',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Reason for blocking this date',
    example: 'Conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
