import { EntityRepository, Repository } from 'typeorm';
import { ErrorLog } from './error-logs.entity';

@EntityRepository(ErrorLog)
export class ErrorLogRepository extends Repository<ErrorLog> {}
