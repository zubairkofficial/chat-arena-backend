import { EntityBase } from '../../base/entityBase';
import { Arena } from '../../arena/entities/arena.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity()
export class UserArena extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => User, (user) => user.userArenas)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Arena, (arena) => arena.userArenas)
  @JoinColumn({ name: 'arenaId' })
  arena: Arena;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({
    type: 'enum',
    enum: ['participant', 'moderator'],
    default: 'participant',
  })
  role: string;
}
