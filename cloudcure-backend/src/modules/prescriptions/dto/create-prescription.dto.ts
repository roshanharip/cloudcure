import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsString()
  @IsNotEmpty()
  duration: string;
}

export class CreatePrescriptionDto {
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @IsMongoId()
  @IsNotEmpty()
  medicalRecordId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsDateString()
  @IsNotEmpty()
  validUntil: string;
}
