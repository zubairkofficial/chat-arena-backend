import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Arena } from 'src/arena/entities/arena.entity';

@Entity()
export class UserArena {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;
  

  @ManyToOne(() => User, (user) => user.userArenas)
  @JoinColumn({ name: 'userId' })
  user: User;  

  @ManyToOne(() => Arena, (arena) => arena.userArenas)
  @JoinColumn({ name: 'arenaId' })
  arena: Arena;  

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;  

  @Column({ type: 'enum', enum: ['participant', 'moderator'], default: 'participant' })
  role: string;  
}

