import { UserPackageBundle } from '../../user-package-bundle/entities/user-package-bundle.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import slugify from 'slugify';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { PackageBundleLlmModel } from '../../package-bundle-llm-model/entities/package-bundle-llm-model.entity';

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

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { array: true, nullable: true })
  featureNames: string[];

  @Column({ unique: true })
  slug: string; // New slug field

  @Column('int', { default: 30 }) // Default duration is 30 days
  durationInDays: number;

  @Column('text',{nullable:true})
  description: string;

  @OneToMany(() => UserPackageBundle, (userPackageBundle) => userPackageBundle.packageBundle)
  userPackageBundles: UserPackageBundle[];

  @OneToMany(() => PackageBundleLlmModel, (bridge) => bridge.packageBundle)
  packageBundleLlmModel: PackageBundleLlmModel[];


  @OneToMany(() => Subscription, (subscription) => subscription.packageBundle, { cascade: true })
  subscriptions: Subscription[];
  // Automatically generate slug before inserting or updating
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }
}
