import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../base/base.service';
import {  DataSource } from 'typeorm';
import { PackageBundleLlmModel } from './entities/package-bundle-llm-model.entity';
import { LlmModel } from '../llm-model/entities/llm-model.entity';
import { PackageBundle } from '../package-bundle/entities/package-bundle.entity';
import { PackageBundleLlmModelRepository } from './package-bundle-llm-model.repository';
import { PackageBundleRepository } from '../package-bundle/package-bundle.repository';
import { LlmModelRepository } from '../llm-model/llm-model.repository';

@Injectable()
export class PackageBundleLlmModelService extends BaseService {
  constructor(
  
    private bridgeRepository: PackageBundleLlmModelRepository,
   
    private llmModelRepository: LlmModelRepository,
   
    private packageBundleRepository: PackageBundleRepository,
    dataSource:DataSource
  ) {
    super(dataSource);
  }

  async createAssociation(packageBundleId: string, llmModelId: string): Promise<PackageBundleLlmModel> {
    const packageBundle = await this.packageBundleRepository.findOne({ where: { id: packageBundleId } });
    const llmModel = await this.llmModelRepository.findOne({ where: { id: llmModelId } });

    if (!packageBundle || !llmModel) {
      throw new Error('PackageBundle or LLM Model not found');
    }

    const newAssociation = this.bridgeRepository.create({
      packageBundle,
      llmModel,
    });

    return this.bridgeRepository.save(newAssociation);
  }
}
