import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Registration successful. Please verify your email.' })
  message: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
