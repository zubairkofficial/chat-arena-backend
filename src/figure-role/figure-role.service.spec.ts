import { Test, TestingModule } from '@nestjs/testing';
import { FigureRoleService } from './figure-role.service';

describe('FigureRoleService', () => {
  let service: FigureRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FigureRoleService],
    }).compile();

    service = module.get<FigureRoleService>(FigureRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
