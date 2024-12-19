import { Test, TestingModule } from '@nestjs/testing';
import { AifigureTypeService } from './aifigure-type.service';

describe('AifigureTypeService', () => {
  let service: AifigureTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AifigureTypeService],
    }).compile();

    service = module.get<AifigureTypeService>(AifigureTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
