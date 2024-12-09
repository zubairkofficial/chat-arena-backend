import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SystemPrompt } from './entities/system-prompt.entity';

@Injectable()
export class SystemPromptRepository extends Repository<SystemPrompt> {
  constructor(private readonly dataSource: DataSource) {
    super(SystemPrompt, dataSource.createEntityManager());
  }

}
