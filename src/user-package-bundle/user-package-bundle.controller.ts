// src/user-package-bundles/user-package-bundles.controller.ts
import { Controller, Post, Param } from '@nestjs/common';
import { UserPackageBundlesService } from './user-package-bundle.service';
import { PackageBundle } from '../package-bundle/entities/package-bundle.entity';
import { User } from '../user/entities/user.entity';

@Controller('user-package-bundles')
export class UserPackageBundlesController {
  constructor(private readonly userPackageBundlesService: UserPackageBundlesService) {}

  @Post(':userId/add/:packageBundleId')
  async addPackageToUser(
    @Param('userId') userId: string,
    @Param('packageBundleId') packageBundleId: string,
  ) {
    const user = new User();
    user.id = userId;

    const packageBundle = new PackageBundle();
    packageBundle.id = packageBundleId;

    // return this.userPackageBundlesService.addPackageToUser(user, packageBundle);
  }

  
}
