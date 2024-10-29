import { Test, TestingModule } from '@nestjs/testing';
import { FigureRoleController } from './figure-role.controller';
import { FigureRoleService } from './figure-role.service';

describe('FigureRoleController', () => {
  let controller: FigureRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FigureRoleController],
      providers: [FigureRoleService],
    }).compile();

    controller = module.get<FigureRoleController>(FigureRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
