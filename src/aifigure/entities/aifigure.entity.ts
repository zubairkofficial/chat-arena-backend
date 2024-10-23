import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
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

  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.aiFigure)
  arenaAIFigures: ArenaAIFigure[];

}
