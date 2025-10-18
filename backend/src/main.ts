import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import db from './utils/db';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await db.testConnection();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
