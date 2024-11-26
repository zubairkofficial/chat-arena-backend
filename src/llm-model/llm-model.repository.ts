import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LlmModel } from './entities/llm-model.entity';

@Injectable()
export class LlmModelRepository extends Repository<LlmModel> {
  constructor(private readonly dataSource: DataSource) {
    super(LlmModel, dataSource.createEntityManager());
  }
 
}
