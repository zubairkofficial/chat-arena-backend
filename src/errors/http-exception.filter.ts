import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorLogService } from '../error-logs/error-logs.service';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorLogService: ErrorLogService) {}

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'An unexpected error occurred';

    // Log the error
    this.errorLogService.logError(
      message as string,
      exception,
      status,
      request.path
    );

    // Send the response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      message: message,
    });
  }
}
