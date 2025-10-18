import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import db from './utils/db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await db.testConnection();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
