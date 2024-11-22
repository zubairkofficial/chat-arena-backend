import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PackageBundle } from '../../package-bundle/entities/package-bundle.entity';
import { EntityBase } from '../../base/entityBase';

@Entity({ name: 'subscriptions' })
export class Subscription extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'start_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: false })
  endDate: Date;

  @Column({ name: 'coins', type: 'int', nullable: false })
  coins: number;

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean; // Active or inactive subscription

  @ManyToOne(() => User, (user) => user.userPackageBundles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PackageBundle, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  packageBundle: PackageBundle;
}
