import { Test, TestingModule } from '@nestjs/testing';
import { ResponseStyleService } from './response-style.service';

describe('ResponseStyleService', () => {
  let service: ResponseStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseStyleService],
    }).compile();

    service = module.get<ResponseStyleService>(ResponseStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
