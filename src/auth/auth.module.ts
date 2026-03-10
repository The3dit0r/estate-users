import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { NotificationClient } from '../notification/notification.client';
import { SharedSecretGuard } from './guards/shared-secret.guard';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('NOTIFICATION_BASE_URL'),
        headers: {
          'X-Notification-Secret': configService.get<string>(
            'NOTIFICATION_SECRET',
          ),
        },
        timeout: 5000,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, NotificationClient, SharedSecretGuard],
  exports: [AuthService],
})
export class AuthModule {}
