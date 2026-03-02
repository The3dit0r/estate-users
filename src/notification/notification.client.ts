import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);

  constructor(private readonly httpService: HttpService) {}

  async sendEmailVerification(payload: {
    userId: string;
    email: string;
    code: string;
    expiresAt: Date;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/notifications/email/verification', {
          userId: payload.userId,
          email: payload.email,
          code: payload.code,
          expiresAt: payload.expiresAt.toISOString(),
        }),
      );
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Failed to send verification email for ${payload.email}: ${err.message}`,
      );
    }
  }
}
