import { Test, TestingModule } from '@nestjs/testing';
import { ResponseStyleController } from './response-style.controller';
import { ResponseStyleService } from './response-style.service';

describe('ResponseStyleController', () => {
  let controller: ResponseStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponseStyleController],
      providers: [ResponseStyleService],
    }).compile();

    controller = module.get<ResponseStyleController>(ResponseStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
