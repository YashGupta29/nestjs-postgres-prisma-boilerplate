import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
