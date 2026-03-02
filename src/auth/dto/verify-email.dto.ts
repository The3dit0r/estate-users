import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification code sent to user' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'User identifier' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
