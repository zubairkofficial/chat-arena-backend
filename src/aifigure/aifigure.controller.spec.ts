import { Test, TestingModule } from '@nestjs/testing';
import { AifigureController } from './aifigure.controller';
import { AifigureService } from './aifigure.service';

describe('AifigureController', () => {
  let controller: AifigureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AifigureController],
      providers: [AifigureService],
    }).compile();

    controller = module.get<AifigureController>(AifigureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
