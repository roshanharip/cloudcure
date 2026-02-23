import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (expires in 15 minutes)',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
      isActive: true,
    },
    description: 'User information (sensitive fields excluded)',
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}
