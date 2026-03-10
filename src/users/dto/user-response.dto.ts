import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';
import { RoleResponseDto } from '../../roles/dto/role-response.dto';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  user_id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: true })
  email_verified: boolean;

  @ApiProperty({ example: 'John', nullable: true })
  first_name?: string;

  @ApiProperty({ example: 'Doe', nullable: true })
  last_name?: string;

  @ApiProperty({ example: 'johndoe', nullable: true })
  display_name?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar_url?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  user_status: UserStatus;

  @ApiProperty({ type: RoleResponseDto, nullable: true })
  role?: RoleResponseDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  last_login_at?: Date;
}

