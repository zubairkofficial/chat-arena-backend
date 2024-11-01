import { Test, TestingModule } from '@nestjs/testing';
import { UserAifigureMessageService } from './user-aifigure-message.service';

describe('UserAifigureMessageService', () => {
  let service: UserAifigureMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAifigureMessageService],
    }).compile();

    service = module.get<UserAifigureMessageService>(UserAifigureMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
