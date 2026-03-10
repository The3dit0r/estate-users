import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserWithoutSecrets } from '../auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwt: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { role } = this.jwt.decode<{ role: string | null }>(context.switchToHttp().getRequest<Request>().headers.authorization?.split[1]);

    // Check if user role matches one of the required roles
    // user.role can be a string (from JWT payload)
    return requiredRoles.some((req_role) => role === req_role);
  }
}
