import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface EmailSendRequest {
  to: string;
  subject: string;
  content: string;
}

@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);

  constructor(private readonly httpService: HttpService) {}

  async sendEmail(payload: EmailSendRequest): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/api/v1/notifications/send-mail', payload),
      );
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Failed to send email to ${payload.to}: ${err.message}`,
      );
      if (err.response) {
        this.logger.error(`Response data: ${JSON.stringify(err.response.data)}`);
      }
    }
  }

  async sendEmailVerification(payload: {
    userId: string;
    email: string;
    code: string;
    expiresAt: Date;
  }): Promise<void> {
    const subject = 'Xác thực tài khoản của bạn';
    const content = `Chào bạn,
    
Cảm ơn bạn đã đăng ký tài khoản. Mã xác thực của bạn là: ${payload.code}
Mã này sẽ hết hạn vào lúc: ${payload.expiresAt.toLocaleString('vi-VN')}

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
    
Trân trọng,
Đội ngũ hỗ trợ`;

    await this.sendEmail({
      to: payload.email,
      subject,
      content,
    });
  }
}

