import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const options = {
    origin: configService.get('CLIENT_URL'),
    credentials: true,
  };
  app.enableCors(options);
  const PORT = configService.get('PORT') || 5000;
  await app.listen(PORT, () => {
    console.log(`The Server is running on PORT : ${PORT}`);
  });
}
bootstrap();
