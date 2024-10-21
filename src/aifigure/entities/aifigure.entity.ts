import { Arena } from '../../arena/entities/arena.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class AIFigure {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string;

  @Column()
  role: string; // e.g., The Instructor, The Moderator, etc.

  @Column()
  prompt: string;

  @OneToMany(() => Arena, (arena) => arena.aiFigures)
  arenas: Arena[];
}
