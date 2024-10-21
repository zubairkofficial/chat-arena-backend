import { EntityBase } from 'src/base/entityBase';
import { Conversation } from '../../conversation/entities/conversation.entity';
import { Reaction } from '../../reaction/entities/reaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Message extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  senderType: string; // 'user' or 'ai'

  @Column()
  senderId: string; // Reference to either user or AI figure

  @Column()
  content: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  // Add One-to-Many relationship with Reaction entity
  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[]; // This allows Message to have multiple reactions
}
