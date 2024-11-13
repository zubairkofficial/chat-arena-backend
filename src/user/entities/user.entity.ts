import { UserAifigureMessage } from '../../user-aifigure-message/entities/user-aifigure-message.entity';
import { Arena } from '../../arena/entities/arena.entity';
import { EntityBase } from '../../base/entityBase';
import { Persona } from '../../persona/entities/persona.entity';
import { UserArena } from '../../user-arena/entities/user-arena.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserPackageBundle } from '../../user-package-bundle/entities/user-package-bundle.entity';
import { Card } from '../../card/entities/card.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { ArenaRequestStatus } from '../../common/enums';

@Entity({ name: 'user' })
export class User extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ nullable: true }) // Make image optional
  image?: string;

  @Column({ name: 'user_name', type: 'varchar', nullable: false, unique: true })
  username: string;

  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ default: 0 })
  availableCoins: number;  // Current available coins for the user
  
  @Column({ name: 'create_arena_request_status', type: 'enum', enum: ArenaRequestStatus, default: ArenaRequestStatus.STATUS })
  createArenaRequestStatus: ArenaRequestStatus;  // Default to PENDING
  
  @OneToMany(() => Persona, (persona) => persona.user)
  personas: Persona[];

  @OneToMany(() => UserArena, (userArena) => userArena.user)
  userArenas: UserArena[];

  // Add the One-to-Many relationship with Achievement entity

  @OneToMany(() => Arena, (arena) => arena.createdBy)
  arenas: Arena[];
  
  @OneToMany(() => UserAifigureMessage, (userAifigureMessage) => userAifigureMessage.user)
  userAifigureMessage: UserAifigureMessage[];

  @OneToMany(() => UserPackageBundle, (userPackageBundle) => userPackageBundle.user)
  userPackageBundles: UserPackageBundle[];

  @OneToMany(() => Card, (card) => card.user) // One-to-many relation with Card entity
  cards: Card[];

  @OneToMany(() => Transaction, transaction => transaction.user)  // Relation with Transaction entity
  transactions: Transaction[];
}
