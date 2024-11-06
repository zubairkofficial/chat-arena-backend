import { Test, TestingModule } from '@nestjs/testing';
import { UserPackageBundleController } from './user-package-bundle.controller';
import { UserPackageBundleService } from './user-package-bundle.service';

describe('UserPackageBundleController', () => {
  let controller: UserPackageBundleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPackageBundleController],
      providers: [UserPackageBundleService],
    }).compile();

    controller = module.get<UserPackageBundleController>(UserPackageBundleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
