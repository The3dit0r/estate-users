import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  language_preference?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  national_id?: string;

  @ApiPropertyOptional({ example: '1990-01-01', format: 'date' })
  @IsString()
  @IsOptional()
  @Matches(/^(\d{4}-\d{2}-\d{2})$/, {
    message: 'date_of_birth must be in YYYY-MM-DD format'
  })
  date_of_birth?: string;
}
