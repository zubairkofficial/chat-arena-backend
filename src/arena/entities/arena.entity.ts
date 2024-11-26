import { Message } from '../../message/entities/message.entity';
import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
import { ArenaType } from '../../arena-type/entities/arena-type.entity';
import { EntityBase } from '../../base/entityBase';
import { Conversation } from '../../conversation/entities/conversation.entity';
import { UserArena } from '../../user-arena/entities/user-arena.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Arena extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string; // Arena 
  
  @Column({ nullable: true }) // Make image optional
  image: string;

  @Column({  type: 'timestamp',nullable: true }) // Make image optional
  arenaStart: Date;

  @Column({ type: 'text', nullable: true })
  description: string; // Description of the arena

  @Column({ type: 'timestamp', nullable: true })
  expiryTime: Date; // Optional expiry time for the arena

  @Column({ type: 'int', default: 0 })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: ['open', 'inprogress', 'full'],
    default: 'open',
  })
  status: string;

  @Column({  type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'text', array: true, nullable: true, default: [] }) // Array of strings (text)
  arenaModel: string[];  // This is the array column for arenaModel


  @ManyToOne(() => User, (user) => user.arenas) // Create a relationship with the User entity
  createdBy: User;

  @OneToMany(() => UserArena, (userArena) => userArena.arena)
  userArenas: UserArena[];

  // List of AI figures in the arena


  @OneToMany(() => Conversation, (conversation) => conversation.arena)
  conversations: Conversation[]; // Arena conversation history

  @ManyToOne(() => ArenaType, (arenaType) => arenaType.arenas)
  arenaType: ArenaType; // The type of the arena

  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.arena)
  arenaAIFigures: ArenaAIFigure[];

  @OneToMany(() => Message, (message) => message.arenas)
  messages: Message[];
}
