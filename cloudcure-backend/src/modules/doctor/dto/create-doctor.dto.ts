import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    specialization: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    licenseNumber: string;

    @ApiProperty()
    @IsNumber()
    yearsOfExperience: number;

    @ApiProperty()
    @IsNumber()
    @ApiProperty()
    @IsNumber()
    consultationFee: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    userId?: string;
}
