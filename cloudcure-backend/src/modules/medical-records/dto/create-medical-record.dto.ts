import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  treatment: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
