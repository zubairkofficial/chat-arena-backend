import { EntityBase } from '../../base/entityBase';
import { Arena } from '../../arena/entities/arena.entity';
import { Message } from '../../message/entities/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Conversation extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  topic: string;

  @ManyToOne(() => Arena, (arena) => arena.conversations)
  arena: Arena;

  @OneToMany(() => Message, (message) => message.arenas)
  messages: Message[];
}
