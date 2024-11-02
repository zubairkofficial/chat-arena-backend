import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorLog } from './error-logs.entity';
import { ErrorLogRepository } from './error-logs.repository';
import { STATUS_CODES } from '../common/constants/status-codes';

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectRepository(ErrorLog)
    private readonly errorLogRepository: ErrorLogRepository,
  ) {}

  async logError(message: string, stack: string, status: number,path: string) {
    const errorStatus = status ?? STATUS_CODES.BAD_REQUEST;
    const errorLog = this.errorLogRepository.create({
      message,
      stack,
      status: errorStatus,
      path
    });

    await this.errorLogRepository.save(errorLog);
  }
  async getAllError() {
   return this.errorLogRepository.find();
  }
}
