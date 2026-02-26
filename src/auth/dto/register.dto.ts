import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The plain text password of the user',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'URL of the user avatar image',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({
    description: 'Display name shown in UI',
    example: 'johndoe99',
  })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: 'male',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Preferred language of the user',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language_preference?: string;

  @ApiPropertyOptional({
    description: 'National ID of the user',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  national_id?: string;

  @ApiPropertyOptional({
    description: 'Date of birth of the user',
    example: '1990-01-01',
    type: String,
    format: 'date'
  })
  @IsDateString()
  @IsOptional()
  date_of_birth?: Date;
}
