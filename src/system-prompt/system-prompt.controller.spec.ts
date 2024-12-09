import { Test, TestingModule } from '@nestjs/testing';
import { SystemPromptController } from './system-prompt.controller';
import { SystemPromptService } from './system-prompt.service';

describe('SystemPromptController', () => {
  let controller: SystemPromptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemPromptController],
      providers: [SystemPromptService],
    }).compile();

    controller = module.get<SystemPromptController>(SystemPromptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
