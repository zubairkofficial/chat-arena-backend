// src/bundles/entities/bundle.entity.ts
import { UserPackageBundle } from '../../user-package-bundle/entities/user-package-bundle.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class PackageBundle extends EntityBase {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;
    
  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column('int')
  coins: number;

  @OneToMany(() => UserPackageBundle, (userPackageBundle) => userPackageBundle.packageBundle)
  userPackageBundles: UserPackageBundle[];
}
