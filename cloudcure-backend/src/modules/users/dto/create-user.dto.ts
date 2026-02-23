import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address (must be unique)',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number of the user',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to the user profile avatar',
  })
  @IsString({ message: 'Avatar must be a string' })
  @IsOptional()
  avatar?: string;

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

  @ApiPropertyOptional({
    example: 'PATIENT',
    enum: Role,
    description: 'User role (defaults to PATIENT)',
  })
  @IsEnum(Role, { message: 'Invalid role. Must be ADMIN, DOCTOR, or PATIENT' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Account active status (defaults to true)',
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
