import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './error-logs.entity';
import { ErrorLogService } from './error-logs.service';
import { ErrorLogRepository } from './error-logs.repository';
import { ErrorLogsController } from './error.logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
  controllers: [ErrorLogsController],
  providers: [ ErrorLogService, ErrorLogRepository],
  exports: [ErrorLogService, ErrorLogRepository], // Exporting them
})
export class ErrorLogModule {}
