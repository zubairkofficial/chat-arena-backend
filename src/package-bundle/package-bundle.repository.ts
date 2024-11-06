import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PackageBundle } from './entities/package-bundle.entity';

@Injectable()
export class PackageBundleRepository extends Repository<PackageBundle> {
  constructor(private readonly dataSource: DataSource) {
    super(PackageBundle, dataSource.createEntityManager());
  }
 
}
