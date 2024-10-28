import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
import { AIFigureType } from '../../common/enums';

@Entity()
export class AIFigure {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true }) // Make image optional
  image?: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: AIFigureType,
  })
  type: AIFigureType; // Use enum type here

  @Column()
  prompt: string;

  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.aiFigure)
  arenaAIFigures: ArenaAIFigure[];
  // @OneToMany(() => UserAIFigure, (userAIFigure) => userAIFigure.aiFigure)
  // userAIFigure: UserAIFigure[];
}
