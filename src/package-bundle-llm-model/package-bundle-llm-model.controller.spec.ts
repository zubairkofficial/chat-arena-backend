import { Test, TestingModule } from '@nestjs/testing';
import { PackageBundleLlmModelController } from './package-bundle-llm-model.controller';
import { PackageBundleLlmModelService } from './package-bundle-llm-model.service';

describe('PackageBundleLlmModelController', () => {
  let controller: PackageBundleLlmModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackageBundleLlmModelController],
      providers: [PackageBundleLlmModelService],
    }).compile();

    controller = module.get<PackageBundleLlmModelController>(PackageBundleLlmModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
