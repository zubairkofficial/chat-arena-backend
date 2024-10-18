import { Test, TestingModule } from '@nestjs/testing';
import { UserArenaController } from './user-arena.controller';
import { UserArenaService } from './user-arena.service';

describe('UserArenaController', () => {
  let controller: UserArenaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserArenaController],
      providers: [UserArenaService],
    }).compile();

    controller = module.get<UserArenaController>(UserArenaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
