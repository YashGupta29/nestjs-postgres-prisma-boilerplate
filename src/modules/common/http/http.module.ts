import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [HttpModule.register({})],
  exports: [HttpModule],
})
export class GlobalHttpModule {}
