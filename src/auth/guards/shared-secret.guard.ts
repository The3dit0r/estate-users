import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided =
      request.headers['x-notification-secret'] || request.headers['x-shared-secret'];
    const expected = this.configService.get<string>('NOTIFICATION_SHARED_SECRET');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid notification secret');
    }

    return true;
  }
}
