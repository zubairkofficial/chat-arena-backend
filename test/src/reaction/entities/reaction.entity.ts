import { Message } from '../../message/entities/message.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  type: string; // e.g., 'like', 'dislike', 'emoji'

  @Column()
  userId: number;

  @ManyToOne(() => Message, (message) => message.reactions)
  message: Message; // Many reactions are related to a single message
}
