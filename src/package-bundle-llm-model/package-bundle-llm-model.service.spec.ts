import { Test, TestingModule } from '@nestjs/testing';
import { PackageBundleLlmModelService } from './package-bundle-llm-model.service';

describe('PackageBundleLlmModelService', () => {
  let service: PackageBundleLlmModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageBundleLlmModelService],
    }).compile();

    service = module.get<PackageBundleLlmModelService>(PackageBundleLlmModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
