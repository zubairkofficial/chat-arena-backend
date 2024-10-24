// src/arena-ai-figure/entities/arena-ai-figure.entity.ts

import { EntityBase } from '../../base/entityBase';
import { Arena } from '../../arena/entities/arena.entity';
import { AIFigure } from '../../aifigure/entities/aifigure.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'arena_ai_figure' })
export class ArenaAIFigure extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Arena, (arena) => arena.arenaAIFigures)
  @JoinColumn({ name: 'arenaId' })
  arena: Arena;

  @ManyToOne(() => AIFigure, (aiFigure) => aiFigure.arenaAIFigures)
  @JoinColumn({ name: 'aiFigureId' })
  aiFigure: AIFigure;

}