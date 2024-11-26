import { Controller, Post, Body, Param } from '@nestjs/common';
import { PackageBundleLlmModelService } from './package-bundle-llm-model.service';

@Controller('package-bundle-llm-model')
export class PackageBundleLlmModelController {
  constructor(
    private readonly bridgeService: PackageBundleLlmModelService,
  ) {}

  @Post(':packageBundleId/:llmModelId')
  async createAssociation(
    @Param('packageBundleId') packageBundleId: string,
    @Param('llmModelId') llmModelId: string,
  ) {
    return await this.bridgeService.createAssociation(packageBundleId, llmModelId);
  }
}
