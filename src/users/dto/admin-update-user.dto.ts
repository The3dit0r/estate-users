import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { UpdateUserDto } from './update-user.dto';

export class AdminUpdateUserDto extends PartialType(UpdateUserDto) {
  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsOptional()
  user_status?: UserStatus;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  role_id?: string;
}
