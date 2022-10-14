import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'common/common.module';
import { V1Module } from 'v1/v1.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    V1Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
