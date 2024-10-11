import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT,'0.0.0.0');
  logger("server is running on port "+process.env.PORT)
}
bootstrap();
