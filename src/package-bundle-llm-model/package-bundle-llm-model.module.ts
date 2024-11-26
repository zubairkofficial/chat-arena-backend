import { Module } from '@nestjs/common';
import { PackageBundleLlmModelController } from './package-bundle-llm-model.controller';
import { PackageBundleLlmModelService } from './package-bundle-llm-model.service';
import { PackageBundleLlmModelRepository } from './package-bundle-llm-model.repository';
import { LlmModelRepository } from '../llm-model/llm-model.repository';
import { PackageBundleRepository } from '../package-bundle/package-bundle.repository';

@Module({
  controllers: [PackageBundleLlmModelController],
  providers: [PackageBundleLlmModelService,PackageBundleLlmModelRepository,LlmModelRepository,PackageBundleRepository],
})
export class PackageBundleLlmModelModule {}
