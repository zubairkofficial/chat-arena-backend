import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PackageBundleLlmModel } from './entities/package-bundle-llm-model.entity';

@Injectable()
export class PackageBundleLlmModelRepository extends Repository<PackageBundleLlmModel> {
  constructor(private readonly dataSource: DataSource) {
    super(PackageBundleLlmModel, dataSource.createEntityManager());
  }
 
}
