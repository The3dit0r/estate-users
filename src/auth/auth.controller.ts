import { Controller, Request, Post, UseGuards, Body, Get, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SharedSecretGuard } from './guards/shared-secret.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'User successfully logged in.', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Request() req): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.authService.getProfile(req.user.user_id);
    if (!user) throw new NotFoundException('User not found');
    return user as any;
  }



  @Post('refresh')
  @ApiOperation({ summary: 'Obtain new access and refresh tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Tokens refreshed.', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  refresh(@Body() refreshDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(refreshDto.refresh_token);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address using code sent via email' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified.', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired code.' })
  verifyEmail(@Body() payload: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(payload.user_id, payload.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 201, description: 'Logged out successfully.', type: MessageResponseDto })
  async logout(@Request() req): Promise<MessageResponseDto> {
    return this.authService.logout(req.user.user_id);
  }

  @UseGuards(SharedSecretGuard)
  @Post('notification-webhook')
  @ApiOperation({
    summary: 'Simulated endpoint secured by shared secret for notification service callbacks',
  })
  @ApiResponse({ status: 200, description: 'Webhook accepted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  handleNotificationWebhook() {
    return { status: 'ok' };
  }
}

