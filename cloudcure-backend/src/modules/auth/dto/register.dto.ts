import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@common/validators/match.decorator';
import { Role } from '@common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Strong password: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number, and symbol',
    },
  )
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password confirmation (must match password)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @ApiProperty({
    example: 'patient',
    description: 'User role',
    enum: Role,
    default: Role.PATIENT,
  })
  @IsEnum(Role, { message: 'Role must be either patient or doctor' })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;
}
