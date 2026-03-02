import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

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
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=\S+$).{8,}$/, {
    message:
      'Password must contain upper, lower, number, and special character with no whitespace',
  })
  password: string;

  @ApiProperty({
    description: 'Repeat the password to avoid typos',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password_confirmation: string;

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
  @IsString()
  @IsOptional()
  @Matches(/^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2}T.*)$/,
    {
      message: 'date_of_birth must be ISO-like (YYYY-MM-DD) or DD-MM-YYYY',
    },
  )
  @IsOptional()
  date_of_birth?: string;

  @ApiProperty({
    description: 'User accepted the terms of service',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  accept_terms: boolean;
}
