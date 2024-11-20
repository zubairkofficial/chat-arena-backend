import { Test, TestingModule } from '@nestjs/testing';
import { LlmModelController } from './llm-model.controller';
import { LlmModelService } from './llm-model.service';

describe('LlmModelController', () => {
  let controller: LlmModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmModelController],
      providers: [LlmModelService],
    }).compile();

    controller = module.get<LlmModelController>(LlmModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
