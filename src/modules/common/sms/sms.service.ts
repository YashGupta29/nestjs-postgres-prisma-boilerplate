import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class SmsService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  async sendSms(recipientsPhoneNumber: string, smsBody: string) {
    if (this.configService.get('SEND_SMS') === '1') {
      return await this.twilioService.client.messages.create({
        body: smsBody,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: recipientsPhoneNumber,
      });
    }
  }
}
