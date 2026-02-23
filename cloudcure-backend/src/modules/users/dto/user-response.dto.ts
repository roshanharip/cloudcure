import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserDocument } from '../schemas/user.schema';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'User unique identifier',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  email: string;

  @Expose()
  @ApiProperty({
    example: 'PATIENT',
    enum: ['ADMIN', 'DOCTOR', 'PATIENT'],
    description: 'User role in the system',
  })
  role: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Account active status',
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    example: '2026-01-25T10:30:00Z',
    description: 'Account creation timestamp',
  })
  createdAt?: string;

  @Expose()
  @ApiProperty({
    example: '2026-01-25T15:45:00Z',
    description: 'Last update timestamp',
  })
  updatedAt?: string;

  static fromUser(user: UserDocument): UserResponseDto {
    const response = new UserResponseDto();
    response.id = user._id.toString();
    response.name = user.name;
    response.email = user.email;
    response.role = user.role;
    response.isActive = user.isActive;
    // Mongoose Document timestamps
    response.createdAt = (
      user as unknown as { createdAt?: Date }
    ).createdAt?.toISOString();
    response.updatedAt = (
      user as unknown as { updatedAt?: Date }
    ).updatedAt?.toISOString();
    return response;
  }
}
