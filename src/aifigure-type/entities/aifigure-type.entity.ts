
import { EntityBase } from '../../base/entityBase';
import { AIFigure } from '../../aifigure/entities/aifigure.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class AifigureType extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => AIFigure, (aiFigure) => aiFigure.aifigureType)
  aiFigures: AIFigure[];
}
