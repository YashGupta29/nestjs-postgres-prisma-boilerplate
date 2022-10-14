import { Module } from '@nestjs/common';
import { AccessTokenStrategy } from 'strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AccessTokenStrategy],
  exports: [UserService],
})
export class UserModule {}
