import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './errors/http-exception.filter';
import { ErrorLogService } from './error-logs/error-logs.service';

dotenv.config();

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const excludedRoutes = [
    { path: 'google-auth/', method: RequestMethod.GET },
    { path: 'google-auth/redirect', method: RequestMethod.GET },
  ];
  app.enableCors();
  
  const errorLogService = app.get(ErrorLogService);

  app.useGlobalFilters(new AllExceptionsFilter(errorLogService)); // Apply the filter
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true, // Automatically transform payloads to DTO instances
  //     whitelist: true, // Strip properties not included in the DTO
  //     forbidNonWhitelisted: true, // Throw an error for unknown properties
  //     disableErrorMessages: false, // Enable detailed error messages
  //   }),
  // );
  app.setGlobalPrefix('api/v1', {
    exclude: excludedRoutes,
  });

  await app.listen(process.env.PORT, '0.0.0.0');
  logger('server is running on port ' + process.env.PORT);
}
bootstrap();
