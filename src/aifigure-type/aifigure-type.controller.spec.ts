import { Test, TestingModule } from '@nestjs/testing';
import { AifigureTypeController } from './aifigure-type.controller';
import { AifigureTypeService } from './aifigure-type.service';

describe('AifigureTypeController', () => {
  let controller: AifigureTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AifigureTypeController],
      providers: [AifigureTypeService],
    }).compile();

    controller = module.get<AifigureTypeController>(AifigureTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
