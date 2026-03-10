import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  access_token: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refresh_token: string;

  @ApiProperty({ description: 'Expiration time in seconds or string format', example: '15m' })
  expires_in: string | number;
}
