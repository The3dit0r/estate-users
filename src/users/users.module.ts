import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_ACCESS_SECRET'),
      signOptions: {
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    }),
    inject: [ConfigService],
  }),],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]

})
export class UsersModule { }
