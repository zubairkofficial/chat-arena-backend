import { Test, TestingModule } from '@nestjs/testing';
import { ArenaTypeController } from './arena-type.controller';
import { ArenaTypeService } from './arena-type.service';

describe('ArenaTypeController', () => {
  let controller: ArenaTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArenaTypeController],
      providers: [ArenaTypeService],
    }).compile();

    controller = module.get<ArenaTypeController>(ArenaTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
