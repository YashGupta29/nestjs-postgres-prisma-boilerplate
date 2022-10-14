import { Module } from '@nestjs/common';
import { RefreshTokenStrategy } from 'strategy';
import { UserModule } from 'v1/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStrategy],
})
export class AuthModule {}
