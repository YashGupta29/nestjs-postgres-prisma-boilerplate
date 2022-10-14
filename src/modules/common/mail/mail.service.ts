import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(
    recipientsEmailId: string,
    templateId: string,
    dynamicTemplateData: Object,
  ) {
    if (this.configService.get('SEND_EMAIL') === "1")
      return await SendGrid.send({
        from: this.configService.get("SENDGRID_EMAIL_ADDRESS"),
        to: recipientsEmailId,
        templateId: templateId,
        dynamicTemplateData: dynamicTemplateData,
      });
  }
}
