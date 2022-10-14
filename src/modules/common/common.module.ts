import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { GlobalHttpModule } from './http/http.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [PrismaModule, TokenModule, MailModule, GlobalHttpModule, SmsModule],
})
export class CommonModule {}
