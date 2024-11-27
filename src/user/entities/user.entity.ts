import { UserAifigureMessage } from '../../user-aifigure-message/entities/user-aifigure-message.entity';
import { Arena } from '../../arena/entities/arena.entity';
import { EntityBase } from '../../base/entityBase';
import { Persona } from '../../persona/entities/persona.entity';
import { UserArena } from '../../user-arena/entities/user-arena.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserPackageBundle } from '../../user-package-bundle/entities/user-package-bundle.entity';
import { Card } from '../../card/entities/card.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { AIFigureStatus, ArenaRequestStatus, UserTier } from '../../common/enums';
import { LlmModel } from '../../llm-model/entities/llm-model.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
// import { Exclude } from 'class-transformer';

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

  // @Exclude()
  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'enum', enum: UserTier, default: UserTier.FREE })
  tier: UserTier;

  @Column({ default: 100 })
  availableCoins: number;  // Current available coins for the user
  
  @Column({ name: 'create_arena_request_status', type: 'enum', enum: ArenaRequestStatus, default: ArenaRequestStatus.PENDING })
  createArenaRequestStatus: ArenaRequestStatus; 
  
  @Column({ name: 'ai_figure_request_status', type: 'enum', enum: AIFigureStatus, default: AIFigureStatus.IN_PROGRESS })
  aiFigureRequestStatus: AIFigureStatus;  
  

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

  @OneToMany(() => LlmModel, llmModel => llmModel.user)
  llmModels: LlmModel[];

  @OneToMany(() => Subscription, (subscription) => subscription.user, { cascade: true })
  subscriptions: Subscription[];
}
