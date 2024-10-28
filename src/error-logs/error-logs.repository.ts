import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ErrorLog } from './error-logs.entity';

@Injectable()
export class ErrorLogRepository extends Repository<ErrorLog> {
    
}
