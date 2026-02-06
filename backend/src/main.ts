import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import db from './utils/db';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('StudyDash API')
    .setDescription('API documentation for StudyDash')
    .setVersion('dev')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('/docs', app, document);

  await db.testConnection();
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_BASE_URL,
      'https://studydash.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
