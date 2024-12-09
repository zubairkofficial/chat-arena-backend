import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SystemPrompt extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  prompt: string;

  @Column()
  description: string;


}
