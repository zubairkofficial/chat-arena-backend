import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger';
import { RequestMethod } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const excludedRoutes = [
    { path: 'google-auth/', method: RequestMethod.GET },
    { path: 'google-auth/redirect', method: RequestMethod.GET },
  ];
  app.enableCors();
  app.setGlobalPrefix('api/v1', {
    exclude: excludedRoutes,
  });

  await app.listen(process.env.PORT,'0.0.0.0');
  logger("server is running on port "+process.env.PORT)
}
bootstrap();
