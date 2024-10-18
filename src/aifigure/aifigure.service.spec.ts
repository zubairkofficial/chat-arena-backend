import { Test, TestingModule } from '@nestjs/testing';
import { AifigureService } from './aifigure.service';

describe('AifigureService', () => {
  let service: AifigureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AifigureService],
    }).compile();

    service = module.get<AifigureService>(AifigureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
