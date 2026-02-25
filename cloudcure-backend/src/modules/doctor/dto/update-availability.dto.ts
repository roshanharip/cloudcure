import { IsBoolean, IsOptional, IsArray, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DoctorUpdateAvailabilityDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isAvailableForConsultation?: boolean;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    availableDays?: string[];

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    @IsObject()
    workingHours?: { start: string; end: string };
}
