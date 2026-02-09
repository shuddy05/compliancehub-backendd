import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
  
  // CORS configuration - ONLY ONE enableCors call
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://compliancehub.ng',
      'https://www.compliancehub.ng'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Ensure webhook route can access raw body for signature verification
  app.use('/api/v1/subscriptions/webhook', express.raw({ type: '*/*' }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`ComplianceHub API is running on http://localhost:${port}/api/v1`);
}
bootstrap();
