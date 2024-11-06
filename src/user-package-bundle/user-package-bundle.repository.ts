import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPackageBundle } from './entities/user-package-bundle.entity';

@Injectable()
export class UserPackageBundleRepository extends Repository<UserPackageBundle> {
  constructor(private readonly dataSource: DataSource) {
    super(UserPackageBundle, dataSource.createEntityManager());
  }
 
}
