import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './error-logs.entity';
import { ErrorLogService } from './error-logs.service';
import { ErrorLogRepository } from './error-logs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
  providers: [ErrorLogService, ErrorLogRepository],
  exports: [ErrorLogService, ErrorLogRepository], // Exporting them
})
export class ErrorLogModule {}
