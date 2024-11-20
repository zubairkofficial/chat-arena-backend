import { Test, TestingModule } from '@nestjs/testing';
import { LlmModelService } from './llm-model.service';

describe('LlmModelService', () => {
  let service: LlmModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmModelService],
    }).compile();

    service = module.get<LlmModelService>(LlmModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
