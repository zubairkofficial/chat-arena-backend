import { Test, TestingModule } from '@nestjs/testing';
import { UserArenaService } from './user-arena.service';

describe('UserArenaService', () => {
  let service: UserArenaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserArenaService],
    }).compile();

    service = module.get<UserArenaService>(UserArenaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
