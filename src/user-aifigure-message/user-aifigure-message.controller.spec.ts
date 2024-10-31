import { Test, TestingModule } from '@nestjs/testing';
import { UserAifigureMessageController } from './user-aifigure-message.controller';
import { UserAifigureMessageService } from './user-aifigure-message.service';

describe('UserAifigureMessageController', () => {
  let controller: UserAifigureMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAifigureMessageController],
      providers: [UserAifigureMessageService],
    }).compile();

    controller = module.get<UserAifigureMessageController>(UserAifigureMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
