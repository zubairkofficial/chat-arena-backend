import { Test, TestingModule } from '@nestjs/testing';
import { UserPackageBundleService } from './user-package-bundle.service';

describe('UserPackageBundleService', () => {
  let service: UserPackageBundleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPackageBundleService],
    }).compile();

    service = module.get<UserPackageBundleService>(UserPackageBundleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
