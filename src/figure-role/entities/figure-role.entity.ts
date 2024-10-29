import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class FigureRole extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  roleName: string;
  

  @Column()
  roleObjective: string;

  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.figureRole)
  arenaAIFigures: ArenaAIFigure[];
}
