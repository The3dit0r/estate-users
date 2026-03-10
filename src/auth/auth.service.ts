import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { TokenResponseDto } from './dto/token-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';


export type UserWithoutSecrets = Omit<User, 'password' | 'password_hash' | 'refresh_token_hash'>;

export interface JwtPayload {
  email: string;
  sub: string;
  role: string | Role;
}


import { ConfigService } from '@nestjs/config';
import { NotificationClient } from '../notification/notification.client';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';

import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationClient: NotificationClient,
    private rolesService: RolesService,
  ) { }


  async validateUser(email: string, pass: string): Promise<UserWithoutSecrets | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (!isMatch) return null;

      if (user.user_status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('User is not active');
      }

      if (!user.email_verified) {
        throw new UnauthorizedException('Email not verified');
      }

      const { password_hash, refresh_token_hash, ...result } = user;
      return result;
    }
    return null;
  }

  private parseDuration(duration: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    } as const;
    return value * multipliers[unit];
  }

  private computeExpiryDate(duration: string | undefined, fallbackMs: number) {
    const millis = duration ? this.parseDuration(duration) : 0;
    const delta = millis > 0 ? millis : fallbackMs;
    return new Date(Date.now() + delta);
  }

  private normalizeDate(input?: string | Date): Date | undefined {
    if (!input) return undefined;

    if (input instanceof Date) return input;

    const trimmed = input.trim();

    const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
    const iso = /^(\d{4}-\d{2}-\d{2})(T.*)?$/;

    let isoString = trimmed;
    const ddMatch = trimmed.match(ddmmyyyy);
    if (ddMatch) {
      const [, dd, mm, yyyy] = ddMatch;
      isoString = `${yyyy}-${mm}-${dd}`;
    } else if (iso.test(trimmed)) {
      isoString = trimmed.split('T')[0];
    }

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date_of_birth');
    }
    return date;
  }

  private async issueTokens(user: Partial<User>): Promise<TokenResponseDto> {
    const role = user.role instanceof Role ? user.role.name : (user.role as unknown as string);
    const payload = { email: user.email, sub: user.user_id, role };
    const accessExpires =
      this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m';
    const refreshExpires =
      this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d';

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 15 * 60, // 15 minutes in seconds
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    const refreshExpiresAt = this.computeExpiryDate(refreshExpires, 7 * 24 * 60 * 60 * 1000);
    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.usersService.updateRefreshToken(
      user.user_id as string,
      refreshTokenHash,
      refreshExpiresAt,
    );

    return {
      access_token,
      refresh_token,
      expires_in: accessExpires,
    };
  }

  async login(user: UserWithoutSecrets): Promise<LoginResponseDto> {
    const tokens = await this.issueTokens(user);
    await this.usersService.update(user.user_id, {
      last_login_at: new Date(),
    });
    return {
      ...tokens,
      user: user as unknown as LoginResponseDto['user'],
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser && existingUser.email_verified) {
      throw new ConflictException('Email already exists');
    }

    if (registerDto.password !== registerDto.password_confirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!registerDto.accept_terms) {
      throw new BadRequestException('You must accept the terms of service');
    }

    const { password_confirmation, accept_terms, date_of_birth, password, ...payload } =
      registerDto;

    const normalizedDob = this.normalizeDate(date_of_birth);

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(registerDto.password, salt);

    const defaultRole = await this.rolesService.findByName('user');

    let user: User;
    if (existingUser) {
      // Update existing unverified user with new registration info
      await this.usersService.update(existingUser.user_id, {
        ...payload,
        date_of_birth: normalizedDob,
        password_hash,
        user_status: UserStatus.ACTIVE,
        email_verified: false,
        role_id: existingUser.role_id || defaultRole?.role_id,
      });
      user = (await this.usersService.findOneByEmail(registerDto.email))!;
    } else {
      user = await this.usersService.create({
        ...payload,
        date_of_birth: normalizedDob,
        password_hash,
        user_status: UserStatus.ACTIVE,
        email_verified: false,
        role_id: defaultRole?.role_id,
      });
    }


    // verification code should be a 8 digit number
    const verificationCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const verificationExpires = this.computeExpiryDate(
      '24h',
      24 * 60 * 60 * 1000,
    );
    await this.usersService.saveVerificationCode(
      user.user_id,
      verificationCode,
      verificationExpires,
    );

    await this.notificationClient.sendEmailVerification({
      userId: user.user_id,
      email: user.email,
      code: verificationCode,
      expiresAt: verificationExpires,
    });

    const { password_hash: p, refresh_token_hash, ...result } = user;
    const registerResponse: RegisterResponseDto = {
      message: 'Registration successful. Please verify your email.',
      user: result as unknown as RegisterResponseDto['user'],
    };

    return registerResponse;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findOneByIdWithSecrets(payload.sub);
      if (!user || !user.refresh_token_hash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.user_status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('User is not active');
      }

      if (
        user.refresh_token_expires_at &&
        user.refresh_token_expires_at.getTime() < Date.now()
      ) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const matches = await bcrypt.compare(refreshToken, user.refresh_token_hash);
      if (!matches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(user_id: string, code: string) {
    const user = await this.usersService.findOneByIdWithSecrets(user_id);
    if (!user || !user.email_verification_code) {
      throw new UnauthorizedException('Invalid verification request');
    }

    if (user.email_verified) {
      return { message: 'Email already verified' };
    }

    if (
      user.email_verification_expires_at &&
      user.email_verification_expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Verification code expired');
    }

    if (user.email_verification_code !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.usersService.markEmailVerified(user_id);
    return { message: 'Email verified successfully' };
  }

  async getProfile(user_id: string): Promise<User | null> {
    return this.usersService.findOneById(user_id);
  }

  async logout(user_id: string): Promise<{ message: string }> {
    await this.usersService.clearRefreshToken(user_id);
    return { message: 'Logged out' };
  }
}

