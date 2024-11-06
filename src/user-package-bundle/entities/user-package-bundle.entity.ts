// src/user-package-bundles/entities/user-package-bundle.entity.ts
import { Entity,  ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { EntityBase } from '../../base/entityBase';
import { PackageBundle } from '../../package-bundle/entities/package-bundle.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class UserPackageBundle extends EntityBase {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

  @ManyToOne(() => User, (user) => user.userPackageBundles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => PackageBundle, (packageBundle) => packageBundle.userPackageBundles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageBundleId' })
  packageBundle: PackageBundle;

 

}
