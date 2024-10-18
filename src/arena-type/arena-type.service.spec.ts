import { Test, TestingModule } from '@nestjs/testing';
import { ArenaTypeService } from './arena-type.service';

describe('ArenaTypeService', () => {
  let service: ArenaTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArenaTypeService],
    }).compile();

    service = module.get<ArenaTypeService>(ArenaTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
