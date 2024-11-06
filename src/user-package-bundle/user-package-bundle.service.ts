// src/user-package-bundles/user-package-bundles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPackageBundle } from './entities/user-package-bundle.entity';
import { PackageBundle } from '../package-bundle/entities/package-bundle.entity';
import { User } from '../user/entities/user.entity';
import { BaseService } from '../base/base.service';
import { DataSource } from 'typeorm';

@Injectable()
export class UserPackageBundlesService extends BaseService {
  constructor(
    @InjectRepository(UserPackageBundle)
     dataSource: DataSource,
  ) {super(dataSource)}

  async addPackageToUser(user: User, packageBundle: PackageBundle): Promise<UserPackageBundle> {
    const userPackageBundle=new UserPackageBundle()
    userPackageBundle.user=user
    userPackageBundle.packageBundle=packageBundle

    return userPackageBundle
  }

  
}
