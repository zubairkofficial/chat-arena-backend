import { Arena } from '../../arena/entities/arena.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class ArenaType extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string; // Name of the arena type

  @Column({ type: 'text' })
  description: string; // Description of the arena type

  @Column({ type: 'text', nullable: true })
  prompt: string; // Optional prompt or guidelines for the arena type

  @OneToMany(() => Arena, (arena) => arena.arenaType)
  arenas: Arena[]; // List of arenas associated with this type
}
